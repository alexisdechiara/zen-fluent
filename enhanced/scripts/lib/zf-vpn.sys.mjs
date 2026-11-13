// Zen Fluent Enhanced: whether the computer goes through a VPN, as far as
// the browser can tell without running a program or asking a web service.
//
// The one live signal is Firefox's network link service: when it lists the
// network adapters (at startup and on every IPv4 interface change), it
// raises nsINetworkLinkService.VPN_DETECTED in platformDNSIndications if an
// adapter that is up, has an address and is not a loopback or VMware's
// VMnet looks like a VPN: IfType PPP (23) or PROP_VIRTUAL (53: Wintun,
// WireGuardNT and TAP-Windows6 all report it), or "VPN" (case-sensitive) in
// its name or description (nsNotifyAddrListener.cpp,
// CheckAdaptersAddresses). It then notifies
// network:dns-suffix-list-updated, after storing the flag. That flag alone
// decides "connected".
//
// On Windows the adapters' names are also in the registry, readable without
// rights (HKLM\SYSTEM\CurrentControlSet\Control\Network\{4D36E972-…}):
// while the flag is up, the name of an adapter known to belong to a VPN
// (Proton VPN, WireGuard, OpenVPN, Mullvad…) says which one. The registry
// keeps adapters that are not connected (OpenVPN's TAP adapter stays
// installed), so it only names the VPN, it never decides that one is on.
//
// Nothing here asks a web service: the public address, the country and the
// server stay unknown. On Linux and macOS Firefox's link service does not
// implement platformDNSIndications (it throws NS_ERROR_NOT_IMPLEMENTED):
// the state is always "unknown" there.
//
// For tests without a VPN, the hidden string pref
// zen-fluent.enhanced.vpn-card.test-state replaces the detection:
// "connected", "connected:<adapter name>", "disconnected" or "unknown"
// (empty: the real detection).
//
// API: vpnState() (a copy of the current state), subscribe(fn) (fn(state)
// on every change; returns the unsubscribe function), refresh().

import { AppConstants } from "resource://gre/modules/AppConstants.sys.mjs";
import {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
} from "resource://gre/modules/Timer.sys.mjs";

const TEST_PREF = "zen-fluent.enhanced.vpn-card.test-state";
// Firefox's network change notifications
const TOPICS = [
  "network:link-status-changed",
  "network:link-type-changed",
  "network:dns-suffix-list-updated",
  "network:networkid-changed",
  "network:offline-status-changed",
];
// The flag is computed on Firefox's own thread after a change: read it
// again a little later too
const SETTLE = [0, 1500, 5000];
// A safety net for a change no topic announced
const POLL_MS = 10000;
const NETWORK_CLASS = String.raw`SYSTEM\CurrentControlSet\Control\Network\{4D36E972-E325-11CE-BFC1-08002BE10318}`;
const ADAPTER_CLASS = String.raw`SYSTEM\CurrentControlSet\Control\Class\{4d36e972-e325-11ce-bfc1-08002be10318}`;
// Adapter names (connection name or driver) that belong to a VPN, the
// providers' own first, the generic tunnels last
const VPN_ADAPTERS = [
  /proton/i,
  /mullvad/i,
  /nord/i,
  /expressvpn/i,
  /surfshark/i,
  /windscribe/i,
  /cyberghost/i,
  /private internet access/i,
  /ivpn/i,
  /tailscale/i,
  /zerotier/i,
  /cloudflare|\bwarp\b/i,
  /anyconnect|cisco/i,
  /globalprotect|pangp/i,
  /forti/i,
  /wireguard/i,
  /openvpn|ovpn|tap-windows/i,
  /wintun/i,
  /\bvpn\b/i,
];
// Windows' own miniports, installed everywhere and never a VPN by themselves
const BUILT_IN = /^WAN Miniport|ms_(sstp|agilevpn|l2tp|pptp|pppoe|ndiswan)/i;

/** @type {{connected: boolean|null, adapter: string|null, driver: string|null, since: number|null, simulated: boolean}} */
let state = null;
const listeners = new Set();
let watching = null;

function linkService() {
  return Cc["@mozilla.org/network/network-link-service;1"]?.getService(
    Ci.nsINetworkLinkService,
  );
}

/** true, false, or null when the platform does not say. */
function platformFlag() {
  try {
    const indications = linkService()?.platformDNSIndications;
    if (typeof indications !== "number") {
      return null;
    }
    return Boolean(indications & Ci.nsINetworkLinkService.VPN_DETECTED);
  } catch {
    return null;
  }
}

function readValues(key, names) {
  const values = {};
  for (const name of names) {
    try {
      if (
        key.hasValue(name) &&
        key.getValueType(name) === Ci.nsIWindowsRegKey.TYPE_STRING
      ) {
        values[name] = key.readStringValue(name);
      }
    } catch {}
  }
  return values;
}

function openKey(path) {
  const key = Cc["@mozilla.org/windows-registry-key;1"].createInstance(
    Ci.nsIWindowsRegKey,
  );
  key.open(
    Ci.nsIWindowsRegKey.ROOT_KEY_LOCAL_MACHINE,
    path,
    Ci.nsIWindowsRegKey.ACCESS_READ,
  );
  return key;
}

/** Windows' network adapters: [{ name, driver }], [] elsewhere. */
function adapters() {
  if (AppConstants.platform !== "win") {
    return [];
  }
  const drivers = new Map();
  try {
    const classes = openKey(ADAPTER_CLASS);
    try {
      for (let i = 0; i < classes.childCount; i++) {
        try {
          const child = classes.openChild(
            classes.getChildName(i),
            Ci.nsIWindowsRegKey.ACCESS_READ,
          );
          const v = readValues(child, ["NetCfgInstanceId", "DriverDesc"]);
          child.close();
          if (v.NetCfgInstanceId) {
            drivers.set(v.NetCfgInstanceId.toUpperCase(), v.DriverDesc ?? "");
          }
        } catch {} // "Properties" is not readable
      }
    } finally {
      classes.close();
    }
  } catch {}
  const list = [];
  try {
    const network = openKey(NETWORK_CLASS);
    try {
      for (let i = 0; i < network.childCount; i++) {
        const guid = network.getChildName(i);
        try {
          const connection = network.openChild(
            `${guid}\\Connection`,
            Ci.nsIWindowsRegKey.ACCESS_READ,
          );
          const v = readValues(connection, ["Name", "PnPInstanceId"]);
          connection.close();
          list.push({
            name: v.Name ?? "",
            driver: drivers.get(guid.toUpperCase()) ?? "",
            device: v.PnPInstanceId ?? "",
          });
        } catch {} // "Descriptions" has no Connection
      }
    } finally {
      network.close();
    }
  } catch {}
  return list;
}

/**
 * The VPN's adapter, or null. The registry lists installed adapters, up or
 * not (an unused client often leaves its own behind): with several that
 * look like a VPN, none can be named for sure, so none is.
 */
function vpnAdapter() {
  const candidates = adapters().filter(
    (a) =>
      !BUILT_IN.test(a.driver) &&
      !BUILT_IN.test(a.device) &&
      VPN_ADAPTERS.some(
        (pattern) => pattern.test(a.name) || pattern.test(a.driver),
      ),
  );
  return candidates.length === 1 ? candidates[0] : null;
}

function simulated() {
  const value = Services.prefs.getStringPref(TEST_PREF, "").trim();
  if (!value) {
    return null;
  }
  const [kind, ...rest] = value.split(":");
  const adapter = rest.join(":").trim() || null;
  return {
    connected:
      kind === "connected" ? true : kind === "disconnected" ? false : null,
    adapter: kind === "connected" ? adapter : null,
    driver: null,
  };
}

function detect() {
  const fake = simulated();
  if (fake) {
    return { ...fake, simulated: true };
  }
  const connected = platformFlag();
  let adapter = null;
  let driver = null;
  if (connected) {
    const found = vpnAdapter();
    adapter = found?.name || found?.driver || null;
    driver = found?.driver && found.driver !== adapter ? found.driver : null;
  }
  return { connected, adapter, driver, simulated: false };
}

function update() {
  const next = detect();
  const previous = state;
  // "since" only when this browser saw the VPN come up
  let since = null;
  if (next.connected) {
    since =
      previous?.connected === true
        ? previous.since
        : previous && previous.connected !== true
          ? Date.now()
          : null;
  }
  const changed =
    !previous ||
    previous.connected !== next.connected ||
    previous.adapter !== next.adapter ||
    previous.driver !== next.driver ||
    previous.simulated !== next.simulated;
  state = { ...next, since };
  if (changed && previous) {
    for (const fn of [...listeners]) {
      try {
        fn(vpnState());
      } catch (error) {
        console.error("[Zen Fluent Enhanced] vpn: listener failed", error);
      }
    }
  }
}

/** The current state: { connected (true, false or null), adapter, driver, since, simulated }. */
export function vpnState() {
  if (!state) {
    update();
  }
  return { ...state };
}

/** Reads the state again now and a little later (after a network change). */
export function refresh() {
  if (!watching) {
    update();
    return;
  }
  for (const id of watching.settle) {
    clearTimeout(id);
  }
  watching.settle = SETTLE.map((ms) => setTimeout(update, ms));
}

function startWatching() {
  const observer = { observe: () => refresh() };
  for (const topic of TOPICS) {
    Services.obs.addObserver(observer, topic);
  }
  Services.prefs.addObserver(TEST_PREF, observer);
  watching = { observer, settle: [], poll: setInterval(update, POLL_MS) };
}

function stopWatching() {
  for (const topic of TOPICS) {
    Services.obs.removeObserver(watching.observer, topic);
  }
  Services.prefs.removeObserver(TEST_PREF, watching.observer);
  clearInterval(watching.poll);
  for (const id of watching.settle) {
    clearTimeout(id);
  }
  watching = null;
  // Unwatched, a VPN could come up unseen: "since" would be wrong
  state = null;
}

/** fn(state) on every change, while subscribed. Returns the unsubscribe. */
export function subscribe(fn) {
  listeners.add(fn);
  if (!watching) {
    startWatching();
    update();
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size && watching) {
      stopWatching();
    }
  };
}
