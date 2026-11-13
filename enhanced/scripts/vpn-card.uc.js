// Zen Fluent Enhanced: a VPN card in the sidebar, above the bottom row.
//
// It says whether the computer goes through a VPN (lib/zf-vpn.sys.mjs:
// Firefox's network link service, and on Windows the adapter's name from
// the registry) and what is known about it: the adapter, and since when
// when this browser saw it come up. Nothing is asked of a web service, so
// no public address, country or server.
//
// When it shows, per kind of window (the card sits in the column of
// sidebar cards, lib/zf-cards.sys.mjs, below Zen's media card):
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
  const { addCard } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-cards.sys.mjs",
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
      const isPrivate = PrivateBrowsingUtils.isWindowPrivate(win);
      const modePref = `${PREF}.${isPrivate ? "private" : "normal"}`;
      const mode = () =>
        Services.prefs.getStringPref(
          modePref,
          isPrivate ? "always" : "connected",
        );

      const card = addCard(ctx, {
        id: "zf-vpn-card",
        order: 40,
        role: "status",
        live: "polite",
      });
      if (!card) {
        return;
      }
      const el = (tag, attributes, parent) => {
        const node = doc.createXULElement(tag);
        for (const [key, value] of Object.entries(attributes)) {
          node.setAttribute(key, value);
        }
        parent.append(node);
        return node;
      };
      const icon = el(
        "image",
        { class: "zf-card-icon", "aria-hidden": "true" },
        card,
      );
      const text = el("vbox", { class: "zf-card-text" }, card);
      const title = el("label", { class: "zf-card-title", crop: "end" }, text);
      // The adapter, and since when at the end of the line
      const detail = el("hbox", { class: "zf-card-detail" }, text);
      const name = el("label", { class: "zf-vpn-name", crop: "end" }, detail);
      const since = el("label", { class: "zf-vpn-since" }, detail);

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
        // The time alone at the end of the line; the tooltip says "Since"
        since.textContent = since.hidden ? "" : time(s.since);
        since.setAttribute("translate", "no");
        // The whole text in the tooltip: the only text of the collapsed
        // sidebar's icon. t() for the parts zf-l10n translates in the card
        const parts = [t(title.textContent), adapter ?? t(name.textContent)];
        if (kind === "connected" && s.driver) {
          parts[1] += ` (${s.driver})`;
        }
        if (!since.hidden) {
          parts.push(t(`Since ${time(s.since)}`));
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
