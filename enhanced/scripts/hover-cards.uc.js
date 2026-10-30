// Zen Fluent Enhanced: a card beside the tab under the pointer.
//
// Like the taskbar's previews: after a short hover (300 to 1200 ms,
// zen-fluent.enhanced.hover-cards.delay) a card opens beside the tab with
// its title, address, state (sleeping, playing, muted), a thumbnail of the
// page (Firefox's own capture, as its tab previews; not for the selected
// or a sleeping tab) and actions: copy the link, duplicate, mute, unload,
// close. Moving to another tab switches the card at once; it closes when
// the pointer leaves both, on a click, a drag, a menu or when the window
// loses focus. Firefox's tab tooltip and its own tab preview stay hidden
// meanwhile (enhanced/src/hover-cards.css). Off by default.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );

  const PREF = "zen-fluent.enhanced.hover-cards";
  const HIDE_DELAY = 250;
  const THUMB_WIDTH = 280;
  const THUMB_HEIGHT = 140;
  const HTML = "http://www.w3.org/1999/xhtml";
  const ICONS = "chrome://browser/skin/zen-icons/";

  const showDelay = () =>
    Number(Services.prefs.getStringPref(`${PREF}.delay`, "500")) || 500;
  const thumbnails = () =>
    Services.prefs.getBoolPref(`${PREF}.thumbnails`, true);

  const feature = ZFFeature.attach(window, {
    name: "hover-cards",
    start(ctx) {
      const { document } = ctx;
      const win = ctx.window;
      const toolbox = document.getElementById("navigator-toolbox");
      const html = (tag, attributes = {}, text = "") => {
        const el = document.createElementNS(HTML, tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      const card = ctx.element(
        "panel",
        {
          id: "zf-hover-card",
          role: "group",
          "aria-label": "Tab",
          noautofocus: "true",
          noautohide: "true",
          consumeoutsideclicks: "false",
          orient: "vertical",
        },
        document.getElementById("mainPopupSet"),
      );
      ctx.onCleanup(() => card.hidePopup());

      let current = null;
      let showTimer = 0;
      let hideTimer = 0;
      let dragging = false;
      const shots = new WeakMap();

      function cancelTimers() {
        win.clearTimeout(showTimer);
        win.clearTimeout(hideTimer);
        showTimer = hideTimer = 0;
      }
      ctx.onCleanup(cancelTimers);

      function hide() {
        cancelTimers();
        current = null;
        card.hidePopup();
      }

      function hostOf(url) {
        try {
          const { host, protocol } = new URL(url);
          return (
            host || `${protocol}${url.slice(protocol.length).split("/")[0]}`
          );
        } catch {
          return url;
        }
      }

      function action(icon, label, run) {
        const button = html("button", {
          class: "zf-hc-action",
          title: label,
          "aria-label": label,
        });
        button.style.setProperty("--zf-hc-icon", `url(${ICONS}${icon})`);
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          run();
        });
        return button;
      }

      async function thumbnail(tab, box) {
        if (!thumbnails() || tab.selected || tab.hasAttribute("pending")) {
          return;
        }
        const ratio = win.devicePixelRatio;
        const cached = shots.get(tab);
        if (cached && Date.now() - cached.time < 30000) {
          box.append(cached.canvas);
          return;
        }
        const canvas = html("canvas", { class: "zf-hc-thumb" });
        canvas.width = THUMB_WIDTH * ratio;
        canvas.height = THUMB_HEIGHT * ratio;
        try {
          if (
            await win.PageThumbs.captureTabPreviewThumbnail(
              tab.linkedBrowser,
              canvas,
            )
          ) {
            shots.set(tab, { canvas, time: Date.now() });
            if (current === tab) {
              box.append(canvas);
            }
          }
        } catch {
          // The tab went away, or its page cannot be captured
        }
      }

      function render(tab) {
        const url = tab.linkedBrowser?.currentURI?.spec || "";
        const parts = [];
        const box = html("div", { class: "zf-hc-preview" });
        parts.push(box);
        const text = html("div", { class: "zf-hc-text" });
        text.append(
          html("span", { class: "zf-hc-title" }, tab.label),
          html("span", { class: "zf-hc-host" }, hostOf(url)),
        );
        const states = [
          tab.hasAttribute("pending") && "Sleeping",
          tab.hasAttribute("soundplaying") && !tab.muted && "Playing",
          tab.muted && "Muted",
        ].filter(Boolean);
        if (states.length) {
          text.append(
            html("span", { class: "zf-hc-state" }, states.join(" · ")),
          );
        }
        parts.push(text);

        const actions = html("div", { class: "zf-hc-actions" });
        actions.append(
          action("edit-copy.svg", "Copy link", () => {
            Cc["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Ci.nsIClipboardHelper)
              .copyString(url);
            showToast(win, "Link copied");
          }),
          action("duplicate-tab.svg", "Duplicate tab", () => {
            gBrowser.duplicateTab(tab);
            hide();
          }),
        );
        if (tab.hasAttribute("soundplaying") || tab.muted) {
          actions.append(
            action(
              tab.muted ? "media-unmute.svg" : "media-mute.svg",
              tab.muted ? "Unmute tab" : "Mute tab",
              () => {
                tab.toggleMuteAudio();
                render(tab);
              },
            ),
          );
        }
        if (!tab.selected && !tab.hasAttribute("pending")) {
          actions.append(
            action("moon-stars.svg", "Unload tab", () => {
              gBrowser.discardBrowser(tab);
              render(tab);
            }),
          );
        }
        actions.append(
          action("close.svg", "Close tab", () => {
            hide();
            gBrowser.removeTab(tab, { animate: true });
          }),
        );
        parts.push(actions);
        card.replaceChildren(...parts);
        thumbnail(tab, box);
      }

      function show(tab) {
        cancelTimers();
        if (!tab.isConnected || tab.closing || dragging) {
          return;
        }
        const rect = tab.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          return;
        }
        current = tab;
        render(tab);
        // Beside the tab, on the page's side of the sidebar
        const onRight = rect.left + rect.width / 2 < win.innerWidth / 2;
        if (card.state === "open" || card.state === "showing") {
          card.moveToAnchor(tab, onRight ? "end_before" : "start_before", 8, 0);
        } else {
          card.openPopup(tab, onRight ? "end_before" : "start_before", 8, 0);
        }
      }

      const tabOf = (node) =>
        node?.closest?.(".tabbrowser-tab:not([zen-empty-tab])") ?? null;

      ctx.listen(toolbox, "mouseover", (event) => {
        const tab = tabOf(event.target);
        if (!tab) {
          return;
        }
        win.clearTimeout(hideTimer);
        if (tab === current) {
          return;
        }
        win.clearTimeout(showTimer);
        if (card.state === "open") {
          show(tab);
        } else {
          showTimer = win.setTimeout(() => show(tab), showDelay());
        }
      });
      const leave = (event) => {
        const to = event.relatedTarget;
        if (tabOf(to) || card.contains(to)) {
          return;
        }
        win.clearTimeout(showTimer);
        win.clearTimeout(hideTimer);
        hideTimer = win.setTimeout(hide, HIDE_DELAY);
      };
      ctx.listen(toolbox, "mouseout", leave);
      ctx.listen(card, "mouseout", leave);
      ctx.listen(card, "mouseover", () => win.clearTimeout(hideTimer));
      ctx.listen(toolbox, "mousedown", (event) => {
        if (tabOf(event.target)) {
          hide();
        }
      });
      ctx.listen(win, "dragstart", () => {
        dragging = true;
        hide();
      });
      ctx.listen(win, "dragend", () => (dragging = false));
      ctx.listen(win, "blur", hide);
      ctx.listen(win, "TabClose", (event) => {
        if (event.target === current) {
          hide();
        }
      });
      // Another menu or panel opening (a context menu) closes the card
      ctx.listen(win, "popupshowing", (event) => {
        if (event.target.id === "tabbrowser-tab-tooltip") {
          event.preventDefault();
        } else if (
          event.target !== card &&
          event.target.localName !== "tooltip" &&
          !card.contains(event.target)
        ) {
          hide();
        }
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
