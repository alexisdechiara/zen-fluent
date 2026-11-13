// Zen Fluent Enhanced: what the efficiency card watches, shared by every
// window (efficiency-card.uc.js).
//
// Two conditions, read with the prefs of zen-fluent.enhanced.efficiency-card:
//   battery  the computer runs on battery (not charging) at or below
//            .battery percent (10, 20 by default, 30, 50, never). The level
//            comes from navigator.getBattery() in the browser windows,
//            which report it here (a module has no navigator).
//   memory   every process of Zen together uses at least .memory GB for
//            two samples in a row (about 30 s: a page load's peak passes).
//            "auto" (the default) is a quarter of the computer's memory,
//            kept between 2 and 8 GB: 2 GB on 8 GB, 4 GB on 16 GB, 8 GB
//            from 32 GB up. "custom" reads .memory-custom (GB).
//
// Memory is sampled once for all windows, every 30 s while a window that
// watches is not hidden (minimized, or covered whole on Windows), and at
// once when one comes back after that. Nothing is written to disk: the
// dismissals below last until Zen closes.
//
// Dismissing (the card's close button, or its sleep button) mutes the
// conditions then true, in every window, until each one ends:
//   battery  the charger is plugged in, or the level climbs above the
//            threshold;
//   memory   the memory falls under 90 % of the threshold, or grows to
//            1.5 times what it was when dismissed (it comes back then).
// A condition that was not true when the card was dismissed shows it again.
//
// For tests, the hidden string pref .test-state replaces the readings:
// "battery:18" (on battery, 18 %), "charging:18", "memory:3.4" (GB), or
// both separated by a comma; empty: the real readings.
//
// API: subscribe(win, fn) (fn() on every change; returns the unsubscribe
// function), state(), reportBattery({ level, charging }), dismiss(),
// wake() (a window came back to the front).

import { setTimeout, clearTimeout } from "resource://gre/modules/Timer.sys.mjs";
import { zenMemory } from "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-sleep.sys.mjs";
import { choice } from "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs";

const PREF = "zen-fluent.enhanced.efficiency-card";
const BATTERY_PREF = `${PREF}.battery`;
const MEMORY_PREF = `${PREF}.memory`;
const TEST_PREF = `${PREF}.test-state`;
const POLL_MS = 30000;
const GB = 1024 ** 3;

const watchers = new Set();
// The last two memory samples (bytes), newest last
let samples = [];
let sampledAt = 0;
let battery = null;
let timer = null;
let polling = false;
// kind -> what it was when dismissed
const muted = new Map();

function test() {
  const value = Services.prefs.getStringPref(TEST_PREF, "").trim();
  if (!value) {
    return null;
  }
  const out = {};
  for (const part of value.split(",")) {
    const [kind, number] = part.split(":").map((s) => s.trim());
    const n = Number(number);
    if (!Number.isFinite(n)) {
      continue;
    }
    if (kind === "battery" || kind === "charging") {
      out.battery = { level: n / 100, charging: kind === "charging" };
    } else if (kind === "memory") {
      out.total = n * GB;
    }
  }
  return out;
}

/** The battery threshold in percent, or null for never. */
function batteryThreshold() {
  const n = Number(Services.prefs.getStringPref(BATTERY_PREF, "20"));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** The memory threshold in bytes, or null for never. */
function memoryThreshold() {
  const value = choice(MEMORY_PREF, "auto");
  if (value === "never") {
    return null;
  }
  if (value === "auto") {
    let ram = 0;
    try {
      ram = Services.sysinfo.getProperty("memsize");
    } catch {}
    return Math.min(8 * GB, Math.max(2 * GB, ram / 4));
  }
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n * GB : null;
}

/** Everything the card needs, as of now. */
export function state() {
  const simulated = test();
  const b = simulated?.battery ?? (simulated ? null : battery);
  const total =
    simulated?.total ??
    (simulated ? null : (samples[samples.length - 1] ?? null));
  const sustained = simulated
    ? total
    : samples.length === 2
      ? Math.min(...samples)
      : null;
  const batteryLimit = batteryThreshold();
  const memoryLimit = memoryThreshold();
  const percent = b ? Math.round(b.level * 100) : null;
  const batteryLow = Boolean(
    b && batteryLimit && !b.charging && percent <= batteryLimit,
  );
  const memoryHigh = Boolean(
    memoryLimit && sustained !== null && sustained >= memoryLimit,
  );
  return {
    percent,
    charging: b?.charging ?? null,
    total,
    batteryLow,
    memoryHigh,
    batteryLimit,
    memoryLimit,
    muted: { battery: muted.has("battery"), memory: muted.has("memory") },
    simulated: Boolean(simulated),
  };
}

/** Lifts the dismissals whose condition has ended. */
function rearm() {
  const s = state();
  if (muted.has("battery") && !s.batteryLow) {
    muted.delete("battery");
  }
  if (muted.has("memory")) {
    const at = muted.get("memory");
    if (
      !s.memoryLimit ||
      s.total === null ||
      s.total < 0.9 * s.memoryLimit ||
      (at && s.total >= 1.5 * at)
    ) {
      muted.delete("memory");
    }
  }
}

function notify() {
  rearm();
  for (const { fn } of watchers) {
    try {
      fn();
    } catch (error) {
      console.error("[Zen Fluent Enhanced] efficiency-card:", error);
    }
  }
}

function anyVisible() {
  for (const { win } of watchers) {
    if (!win.closed && !win.document.hidden) {
      return true;
    }
  }
  return false;
}

function schedule() {
  clearTimeout(timer);
  timer = watchers.size ? setTimeout(poll, POLL_MS) : null;
}

async function poll() {
  schedule();
  if (polling || !memoryThreshold() || test() || !anyVisible()) {
    return;
  }
  polling = true;
  try {
    const { total } = await zenMemory();
    samples = [...samples, total].slice(-2);
    sampledAt = Date.now();
    notify();
  } catch (error) {
    console.error("[Zen Fluent Enhanced] efficiency-card: memory", error);
  } finally {
    polling = false;
  }
}

/** A window came back to the front: sample now if the last one is old. */
export function wake() {
  if (Date.now() - sampledAt >= POLL_MS) {
    poll();
  }
}

/** A window's navigator.getBattery() reading. */
export function reportBattery({ level, charging }) {
  if (battery?.level === level && battery?.charging === charging) {
    return;
  }
  battery = { level, charging };
  notify();
}

/** Mutes the conditions true now, in every window. */
export function dismiss() {
  const s = state();
  if (s.batteryLow) {
    muted.set("battery", s.percent);
  }
  if (s.memoryHigh) {
    muted.set("memory", s.total);
  }
  for (const { fn } of watchers) {
    fn();
  }
}

const prefObserver = () => {
  // A new threshold judges the memory afresh
  poll();
  notify();
};

/**
 * Calls fn() whenever what the card shows may have changed.
 *
 * @returns {Function} Unsubscribes.
 */
export function subscribe(win, fn) {
  const watcher = { win, fn };
  if (!watchers.size) {
    Services.prefs.addObserver(PREF, prefObserver);
  }
  watchers.add(watcher);
  if (!timer) {
    poll();
  }
  return () => {
    watchers.delete(watcher);
    if (!watchers.size) {
      Services.prefs.removeObserver(PREF, prefObserver);
      clearTimeout(timer);
      timer = null;
      samples = [];
      sampledAt = 0;
    }
  };
}
