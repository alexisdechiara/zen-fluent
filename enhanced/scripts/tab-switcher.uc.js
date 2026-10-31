// Zen Fluent Enhanced: Ctrl+Tab as Windows 11's Alt+Tab.
//
// Hold Ctrl and press Tab: a band over the window shows the space's tabs
// in the order they were last used, each a card with its icon, its title
// and a thumbnail of the page; Tab moves on, Shift+Tab back, releasing Ctrl
// goes to the highlighted tab. A quick Ctrl+Tab goes back to the previous
// tab without showing the band. The pointer can pick a card, × on a card
// closes its tab, Escape cancels.
//
// It takes over Firefox's Ctrl+Tab (both the tab order and Firefox's own
// "recently used order" previews, which wait for a key the switcher has
// already handled: they skip an event whose default was prevented).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const SHOW_DELAY = 150;
  const MAX_TABS = 24;
  const THUMB_WIDTH = 220;
  const THUMB_HEIGHT = 138;
  const DEFAULT_ICON = "chrome://global/skin/icons/defaultFavicon.svg";

  const feature = ZFFeature.attach(window, {
    name: "tab-switcher",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const html = (tag, attributes = {}, text = "") => {
        const el = doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      const overlay = ctx.element(
        "html:div",
        { id: "zf-switcher", hidden: "true" },
        doc.getElementById("zen-main-app-wrapper") ?? doc.body,
      );
      const band = html("div", {
        class: "zf-sw-band",
        role: "listbox",
        "aria-label": "Tabs",
      });
      overlay.append(band);

      const shots = new WeakMap(); // tab -> { canvas, time }
      let tabs = null; // the tabs while the switcher is held
      let index = 0;
      let showTimer = 0;
      ctx.onCleanup(() => win.clearTimeout(showTimer));

      const recent = () =>
        win.gBrowser.visibleTabs
          .filter((tab) => !tab.closing && !tab.hasAttribute("zen-empty-tab"))
          .sort((a, b) => {
            if (a.selected !== b.selected) {
              return a.selected ? -1 : 1;
            }
            return b.lastAccessed - a.lastAccessed;
          })
          .slice(0, MAX_TABS);

      async function thumbnail(tab, box) {
        const cached = shots.get(tab);
        if (cached && Date.now() - cached.time < 30000) {
          box.prepend(cached.canvas);
          return;
        }
        if (tab.hasAttribute("pending")) {
          return;
        }
        const ratio = win.devicePixelRatio;
        const canvas = html("canvas", { class: "zf-sw-thumb" });
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
            if (box.isConnected) {
              box.prepend(canvas);
            }
          }
        } catch {
          // a page that cannot be captured keeps its icon
        }
      }

      const highlight = () => {
        band.querySelectorAll(".zf-sw-card").forEach((card, i) => {
          card.toggleAttribute("zf-current", i === index);
          card.setAttribute("aria-selected", String(i === index));
          if (i === index) {
            card.scrollIntoView({ block: "nearest" });
          }
        });
      };

      const render = () => {
        band.replaceChildren();
        tabs.forEach((tab, i) => {
          const card = html("div", { class: "zf-sw-card", role: "option" });
          const head = html("div", { class: "zf-sw-head" });
          const icon = html("img", {
            class: "zf-sw-icon",
            src: tab.getAttribute("image") || DEFAULT_ICON,
            alt: "",
          });
          const close = html("button", {
            class: "zf-sw-close",
            title: "Close tab",
            "aria-label": "Close tab",
          });
          head.append(
            icon,
            html("span", { class: "zf-sw-title" }, tab.label),
            close,
          );
          const preview = html("div", { class: "zf-sw-preview" });
          preview.append(
            html("img", {
              class: "zf-sw-placeholder",
              src: tab.getAttribute("image") || DEFAULT_ICON,
              alt: "",
            }),
          );
          card.append(head, preview);
          card.addEventListener("mouseenter", () => {
            index = tabs.indexOf(tab);
            highlight();
          });
          card.addEventListener("click", (event) => {
            if (event.button === 0) {
              index = tabs.indexOf(tab);
              finish(true);
            }
          });
          close.addEventListener("click", (event) => {
            event.stopPropagation();
            const at = tabs.indexOf(tab);
            tabs.splice(at, 1);
            win.gBrowser.removeTab(tab, { animate: false });
            if (tabs.length < 2) {
              finish(false);
              return;
            }
            index = Math.min(index, tabs.length - 1);
            card.remove();
            highlight();
          });
          band.append(card);
          thumbnail(tab, preview);
        });
        highlight();
      };

      const show = () => {
        if (!tabs || !overlay.hidden) {
          return;
        }
        render();
        overlay.hidden = false;
      };

      const begin = (step) => {
        tabs = recent();
        if (tabs.length < 2) {
          tabs = null;
          return;
        }
        index = (step + tabs.length) % tabs.length;
        win.clearTimeout(showTimer);
        showTimer = win.setTimeout(show, SHOW_DELAY);
      };

      const move = (step) => {
        index = (index + step + tabs.length) % tabs.length;
        if (overlay.hidden) {
          win.clearTimeout(showTimer);
          show();
        } else {
          highlight();
        }
      };

      /** Ends the switcher; go: select the highlighted tab. */
      function finish(go) {
        win.clearTimeout(showTimer);
        const tab = tabs?.[index];
        tabs = null;
        overlay.hidden = true;
        band.replaceChildren();
        if (go && tab && !tab.closing) {
          win.gBrowser.selectedTab = tab;
        }
      }
      ctx.onCleanup(() => finish(false));

      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.key === "Tab" &&
            event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
          ) {
            event.preventDefault();
            event.stopPropagation();
            const step = event.shiftKey ? -1 : 1;
            if (tabs) {
              move(step);
            } else {
              begin(step);
            }
          } else if (tabs && event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            finish(false);
          } else if (tabs && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            event.stopPropagation();
            finish(true);
          } else if (
            tabs &&
            (event.key === "ArrowRight" || event.key === "ArrowLeft")
          ) {
            event.preventDefault();
            event.stopPropagation();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        },
        true,
      );
      ctx.listen(
        win,
        "keyup",
        (event) => {
          if (tabs && event.key === "Control") {
            finish(true);
          }
        },
        true,
      );
      ctx.listen(win, "deactivate", () => tabs && finish(false));
      ctx.listen(overlay, "mousedown", (event) => {
        if (event.target === overlay) {
          finish(false);
        }
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
