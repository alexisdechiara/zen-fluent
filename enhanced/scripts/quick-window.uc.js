// Zen Fluent Enhanced: a quick window, as Arc's Little Arc.
//
// Ctrl+Alt+Shift+O, a link's context menu (Open link in a quick window)
// or the Command Palette opens a small window beside the current one: a
// Zen window outside window sync (Zen's unsynced window, so none of your
// spaces and not restored with the session), in compact mode so the page
// takes it all. Without a link, the URL bar opens to type an address or a
// search. Its "Open in main window" button moves the tab to the window it
// came from (or the last one used) and closes the quick window; closing it
// simply drops the tab.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { setCompact } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-compact.sys.mjs",
  );

  const WIDTH = 520;
  const HEIGHT = 720;
  const HTML = "http://www.w3.org/1999/xhtml";

  /** Opens a quick window beside win, with url or an empty URL bar. */
  function openQuickWindow(win, url) {
    const quick = win.OpenBrowserWindow({ zenSyncedWindow: false });
    if (!quick) {
      return;
    }
    // read by this script when it runs in the new window
    quick.zfQuickWindow = { url, opener: Cu.getWeakReference(win) };
    const left = Math.max(
      win.screen.availLeft,
      win.screenX + win.outerWidth - WIDTH - 24,
    );
    const top = Math.max(win.screen.availTop, win.screenY + 64);
    quick.addEventListener(
      "load",
      () => {
        quick.resizeTo(WIDTH, HEIGHT);
        quick.moveTo(left, top);
      },
      { once: true },
    );
  }

  const feature = ZFFeature.attach(window, {
    name: "quick-window",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;

      // -------- In a quick window --------
      if (win.zfQuickWindow) {
        const { url, opener } = win.zfQuickWindow;
        ctx.attribute(doc.documentElement, "zf-quick-window");
        const setUp = () => {
          // this window only: the next startup keeps its own setting.
          // Zen sets up compact mode after startup and may undo it: again
          // once it has settled
          setCompact(win, true);
          ctx.timeout(() => setCompact(win, true), 1000);
          if (url) {
            win.openTrustedLinkIn(url, "current");
          } else {
            win.gURLBar?.select();
          }
        };
        if (win.gBrowserInit?.delayedStartupFinished) {
          setUp();
        } else {
          ctx.observe("browser-delayed-startup-finished", (subject) => {
            if (subject === win) {
              setUp();
            }
          });
        }

        const button = ctx.element(
          "html:button",
          {
            id: "zf-quick-window-move",
            title: "Open in main window",
          },
          doc.getElementById("zen-main-app-wrapper") ?? doc.body,
        );
        button.textContent = "Open in main window";
        ctx.listen(button, "click", () => {
          let target = opener?.get();
          if (!target || target.closed) {
            target = [...Services.wm.getEnumerator("navigator:browser")]
              .reverse()
              .find((w) => w !== win && !w.closed && !w.zfQuickWindow);
          }
          if (!target) {
            target = win.OpenBrowserWindow();
          }
          const tab = win.gBrowser.selectedTab;
          target.gBrowser.adoptTab(tab, { selectTab: true });
          target.focus();
          win.close();
        });
        return;
      }

      // -------- Entry points in other windows --------
      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyO" &&
            event.ctrlKey &&
            event.altKey &&
            event.shiftKey &&
            !event.metaKey &&
            !event.repeat
          ) {
            event.preventDefault();
            event.stopPropagation();
            openQuickWindow(win, null);
          }
        },
        true,
      );

      const menu = doc.getElementById("contentAreaContextMenu");
      const after =
        doc.getElementById("context-openlinkinusercontext-menu") ??
        doc.getElementById("context-openlinkprivate");
      const item = ctx.element("menuitem", {
        id: "zf-context-quick-window",
        label: "Open link in a quick window",
      });
      if (after) {
        after.after(item);
      } else {
        menu?.append(item);
      }
      ctx.listen(menu, "popupshowing", (event) => {
        if (event.target === menu) {
          item.hidden =
            !win.gContextMenu?.onLink || win.gContextMenu.onMailtoLink;
        }
      });
      ctx.listen(item, "command", () => {
        const link = win.gContextMenu?.linkURL;
        if (link) {
          openQuickWindow(win, link);
        }
      });

      // run by the Command Palette
      const command = ctx.element(
        "menuitem",
        {
          id: "zf-quick-window-open",
          hidden: "true",
        },
        doc.getElementById("menu_FilePopup") ??
          doc.getElementById("mainPopupSet"),
      );
      ctx.listen(command, "command", () => openQuickWindow(win, null));
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
