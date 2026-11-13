// Zen Fluent Enhanced: a VPN card in the sidebar, above the bottom row.
//
// It says whether the computer goes through a VPN (lib/zf-vpn.sys.mjs:
// Firefox's network link service, and on Windows the adapter's name from
// the registry) and what is known about it: the adapter, and since when
// when this browser saw it come up. Nothing is asked of a web service, so
// no public address, country or server.
//
// When it shows, per kind of window (the card sits where Zen's media card
// lives, below it, so both stack):
//   zen-fluent.enhanced.vpn-card.normal   connected (default), always, never
//   zen-fluent.enhanced.vpn-card.private  always (default), connected, never
// In a private window "always" also shows "VPN not connected": you see at
// a glance whether the VPN is on.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { vpnState, subscribe } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-vpn.sys.mjs",
  );
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs",
  );
  const { t } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs",
  );

  const PREF = "zen-fluent.enhanced.vpn-card";
  const ICONS = "chrome://sine/content/Zen-Fluent-Enhanced/icons/";

  const feature = ZFFeature.attach(window, {
    name: "vpn-card",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const foot = doc.getElementById("zen-sidebar-foot-buttons");
      if (!foot) {
        return;
      }
      const isPrivate = PrivateBrowsingUtils.isWindowPrivate(win);
      const modePref = `${PREF}.${isPrivate ? "private" : "normal"}`;
      const mode = () =>
        Services.prefs.getStringPref(
          modePref,
          isPrivate ? "always" : "connected",
        );

      // Below the media card (which grows upwards over the tabs), above the
      // bottom row; outside the customizable tab strip
      const card = ctx.element("hbox", {
        id: "zf-vpn-card",
        class: "zf-vpn-card",
        align: "center",
        role: "status",
        "aria-live": "polite",
        hidden: "true",
      });
      foot.before(card);
      const icon = ctx.element(
        "image",
        { class: "zf-vpn-icon", "aria-hidden": "true" },
        card,
      );
      const text = ctx.element(
        "vbox",
        { class: "zf-vpn-text", flex: "1" },
        card,
      );
      const title = ctx.element(
        "label",
        { class: "zf-vpn-title", crop: "end" },
        text,
      );
      const detail = ctx.element("vbox", { class: "zf-vpn-detail" }, text);
      const name = ctx.element(
        "label",
        { class: "zf-vpn-name", crop: "end" },
        detail,
      );
      const since = ctx.element("label", { class: "zf-vpn-since" }, detail);

      const time = (ms) =>
        new Intl.DateTimeFormat(Services.locale.appLocalesAsBCP47, {
          hour: "numeric",
          minute: "2-digit",
        }).format(ms);

      const render = (s) => {
        const m = mode();
        const kind =
          s.connected === true
            ? "connected"
            : s.connected === false
              ? "disconnected"
              : "unknown";
        // A system that does not say (Linux, macOS) has nothing to show
        const shown =
          (m === "always" && kind !== "unknown") ||
          (m === "connected" && kind === "connected");
        card.hidden = !shown;
        card.setAttribute("zf-state", kind);
        card.toggleAttribute("zf-private", isPrivate);
        icon.setAttribute(
          "src",
          `${ICONS}${kind === "connected" ? "vpn-on" : "vpn-off"}.svg`,
        );
        title.textContent = {
          connected: "VPN connected",
          disconnected: "VPN not connected",
          unknown: "VPN status unknown",
        }[kind];
        // A name is the adapter's own: never translated
        const adapter = kind === "connected" ? s.adapter : null;
        if (adapter) {
          name.setAttribute("translate", "no");
        } else {
          name.removeAttribute("translate");
        }
        name.textContent =
          adapter ??
          {
            connected: "Adapter not identified",
            disconnected: "No VPN adapter is up",
            unknown: "This system does not say",
          }[kind];
        since.hidden = !(kind === "connected" && s.since);
        since.textContent = since.hidden ? "" : `Since ${time(s.since)}`;
        // The whole text in the tooltip: the only text of the collapsed
        // sidebar's icon. t() for the parts zf-l10n translates in the card
        const parts = [t(title.textContent), adapter ?? t(name.textContent)];
        if (kind === "connected" && s.driver) {
          parts[1] += ` (${s.driver})`;
        }
        if (!since.hidden) {
          parts.push(t(since.textContent));
        }
        if (s.simulated) {
          parts.push("test-state");
        }
        card.setAttribute("tooltiptext", parts.join(" · "));
      };

      ctx.onCleanup(subscribe(render));
      ctx.observePref(modePref, () => render(vpnState()));
      render(vpnState());
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
