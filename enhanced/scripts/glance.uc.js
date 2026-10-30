// Zen Fluent Enhanced: a preview of the link Glance would open.
//
// Holding the key Zen opens Glance with (zen.glance.activation-method, Alt
// by default) over a link shows, at the bottom of the page, a card with
// the link: its icon, its title if the history knows the page, its address,
// and the click that opens it in Glance. Web pages cannot be read from
// here (CLAUDE.md, "Sine 2.3"): the link comes from the OverLink event
// Firefox sends the window for its status bar, the title from Places.
// The card goes away when the key is released or the pointer leaves the
// link. Nothing shows while Glance is off (zen.glance.enabled).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { AppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/AppConstants.sys.mjs",
  );

  const METHOD = "zen.glance.activation-method";
  const ENABLED = "zen.glance.enabled";
  // Holding a key briefly (Alt+Tab, a shortcut) shows nothing
  const DELAY = 250;
  const HTML = "http://www.w3.org/1999/xhtml";
  const KEYS = {
    alt: { key: "Alt", label: "Alt" },
    ctrl: { key: "Control", label: "Ctrl" },
    shift: { key: "Shift", label: "Shift" },
    meta: {
      key: "Meta",
      label: AppConstants.platform === "macosx" ? "Cmd" : "Windows key",
    },
  };
  const method = () =>
    KEYS[Services.prefs.getStringPref(METHOD, "alt")] ?? KEYS.alt;

  const feature = ZFFeature.attach(window, {
    name: "glance",
    default: true,
    start(ctx) {
      const { document } = ctx;
      const win = ctx.window;
      let link = "";
      let held = false;
      let timer = 0;
      let request = 0;

      const card = document.createElementNS(HTML, "div");
      card.id = "zf-link-preview";
      card.setAttribute("role", "status");
      card.setAttribute("aria-live", "polite");
      ctx.onCleanup(() => card.remove());

      function hide() {
        win.clearTimeout(timer);
        timer = 0;
        request++;
        card.removeAttribute("zf-shown");
        card.remove();
      }
      ctx.onCleanup(hide);

      async function show() {
        const url = link;
        const current = ++request;
        let title = null;
        try {
          title = (await PlacesUtils.history.fetch(url))?.title || null;
        } catch {
          // Not a URL the history takes
        }
        if (current !== request || !held || link !== url) {
          return;
        }
        let host = url;
        let rest = "";
        try {
          const parsed = new URL(url);
          host = parsed.host || parsed.protocol;
          rest = `${parsed.pathname}${parsed.search}`.replace(/^\/$/, "");
        } catch {}
        const icon = document.createElementNS(HTML, "img");
        icon.className = "zf-lp-icon";
        icon.alt = "";
        icon.src = `page-icon:${url}`;
        icon.addEventListener(
          "error",
          () => (icon.src = "chrome://global/skin/icons/defaultFavicon.svg"),
          { once: true },
        );
        const text = document.createElementNS(HTML, "span");
        text.className = "zf-lp-text";
        const name = document.createElementNS(HTML, "span");
        name.className = "zf-lp-title";
        name.textContent = title ?? host;
        const address = document.createElementNS(HTML, "span");
        address.className = "zf-lp-url";
        address.textContent = title ? `${host}${rest}` : rest || host;
        const hint = document.createElementNS(HTML, "span");
        hint.className = "zf-lp-hint";
        hint.textContent = `${method().label}+click: open in Glance`;
        text.append(name, address, hint);
        card.replaceChildren(icon, text);
        // In the selected page's box, which Zen positions and clips
        const box =
          gBrowser.selectedBrowser.closest(".browserSidebarContainer") ??
          document.getElementById("tabbrowser-tabpanels");
        if (card.parentNode !== box) {
          box.append(card);
        }
        win.requestAnimationFrame(() => card.setAttribute("zf-shown", ""));
      }

      function update() {
        win.clearTimeout(timer);
        timer = 0;
        if (
          !held ||
          !link ||
          !/^https?:/.test(link) ||
          !Services.prefs.getBoolPref(ENABLED, true)
        ) {
          hide();
          return;
        }
        if (card.isConnected) {
          show();
        } else {
          timer = win.setTimeout(show, DELAY);
        }
      }

      ctx.listen(win, "OverLink", (event) => {
        link = event.detail?.url || "";
        update();
      });
      ctx.listen(
        win,
        "keydown",
        (event) => {
          const wanted = event.key === method().key;
          if (wanted !== held) {
            held = wanted;
            update();
          }
        },
        true,
      );
      ctx.listen(
        win,
        "keyup",
        (event) => {
          if (event.key === method().key) {
            held = false;
            update();
          }
        },
        true,
      );
      ctx.listen(win, "blur", () => {
        held = false;
        hide();
      });
      ctx.listen(win, "TabSelect", hide);
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
