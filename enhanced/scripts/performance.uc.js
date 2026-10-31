// Zen Fluent Enhanced: sleeping tabs and a Performance panel, as in Edge.
//
// Sleeping tabs: every minute, tabs left unused longer than
// zen-fluent.enhanced.performance.sleep-after (minutes, or never) are
// unloaded with Firefox's own discardBrowser, which keeps the tab and its
// history and reloads it when it is selected. Firefox skips a page that
// would ask before leaving or shows a dialog; this script also keeps the
// selected tab, tabs playing sound, sharing the camera, microphone or
// screen, in Picture-in-Picture, Glance and the split view on screen.
// (Zen 1.24 has no inactivity timer of its own; Firefox only unloads tabs
// when memory runs low.)
//
// The Performance panel (app menu, Tools, Ctrl+Alt+Shift+P): the memory
// Zen uses, loaded and sleeping tabs, the sleep delay, a button that puts
// the other tabs to sleep now, and the tabs that use the most memory, each
// with a Sleep button. A tab's memory is its process's, shared out between
// the tabs in that process (an estimate: Firefox does not count per tab).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );

  const PREF = "zen-fluent.enhanced.performance";
  const SLEEP_AFTER = `${PREF}.sleep-after`;
  const DELAYS = [
    ["never", "Never"],
    ["5", "5 minutes"],
    ["15", "15 minutes"],
    ["30", "30 minutes"],
    ["60", "1 hour"],
    ["120", "2 hours"],
    ["240", "4 hours"],
  ];
  const DEFAULT_ICON = "chrome://global/skin/icons/defaultFavicon.svg";
  const HTML = "http://www.w3.org/1999/xhtml";

  const size = (bytes) =>
    bytes >= 1024 ** 3
      ? `${(bytes / 1024 ** 3).toFixed(1)} GB`
      : `${Math.round(bytes / 1024 ** 2)} MB`;

  const feature = ZFFeature.attach(window, {
    name: "performance",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const gBrowser = win.gBrowser;
      const html = (tag, attributes = {}, text = "") => {
        const el = doc.createElementNS(HTML, tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      const loaded = (tab) =>
        !tab.closing &&
        !tab.hasAttribute("pending") &&
        !tab.hasAttribute("zen-empty-tab") &&
        tab.linkedPanel &&
        tab.linkedBrowser?.isRemoteBrowser;

      const onScreenSplit = (tab) => {
        const splitter = win.gZenViewSplitter;
        return (
          tab.splitView &&
          splitter?.currentView >= 0 &&
          splitter._data[splitter.currentView]?.tabs.includes(tab)
        );
      };

      /** Tabs that may sleep, the selected one aside. */
      const canSleep = (tab) =>
        loaded(tab) &&
        !tab.selected &&
        !tab.hasAttribute("soundplaying") &&
        !tab.hasAttribute("sharing") &&
        !tab.pictureinpicture &&
        !tab.hasAttribute("zen-glance-tab") &&
        !onScreenSplit(tab);

      const sleep = (tabs) =>
        tabs.filter((tab) => gBrowser.discardBrowser(tab, false)).length;

      // -------- Sleeping tabs --------
      const sweep = () => {
        const after = Services.prefs.getStringPref(SLEEP_AFTER, "30");
        if (after === "never" || !Number(after)) {
          return;
        }
        const limit = Date.now() - Number(after) * 60000;
        sleep(
          gBrowser.tabs.filter((t) => canSleep(t) && t.lastAccessed < limit),
        );
      };
      ctx.interval(sweep, 60000);

      // -------- The panel --------
      const panel = ctx.element(
        "panel",
        {
          id: "zf-performance",
          type: "arrow",
          role: "dialog",
          "aria-label": "Performance",
          orient: "vertical",
        },
        doc.getElementById("mainPopupSet"),
      );
      ctx.onCleanup(() => panel.hidePopup());

      /** { tab: bytes } for loaded tabs, and Zen's total. */
      async function memory() {
        const info = await ChromeUtils.requestProcInfo();
        let total = info.memory;
        const byPid = new Map();
        for (const child of info.children) {
          total += child.memory;
          byPid.set(child.pid, child.memory);
        }
        const tabsByPid = new Map();
        for (const tab of gBrowser.tabs.filter(loaded)) {
          const pid =
            tab.linkedBrowser.browsingContext?.currentWindowGlobal?.osPid;
          if (pid) {
            tabsByPid.set(pid, [...(tabsByPid.get(pid) ?? []), tab]);
          }
        }
        const perTab = new Map();
        for (const [pid, tabs] of tabsByPid) {
          for (const tab of tabs) {
            perTab.set(tab, (byPid.get(pid) ?? 0) / tabs.length);
          }
        }
        return { total, perTab };
      }

      let rendering = 0;
      async function render() {
        const current = ++rendering;
        const { total, perTab } = await memory();
        if (current !== rendering) {
          return;
        }
        const all = gBrowser.tabs.filter(
          (tab) => !tab.closing && !tab.hasAttribute("zen-empty-tab"),
        );
        const sleeping = all.filter((tab) => tab.hasAttribute("pending"));
        const parts = [html("h2", { class: "zf-pf-title" }, "Performance")];

        const tiles = html("div", { class: "zf-pf-tiles" });
        for (const [value, label] of [
          [size(total), "Memory in use"],
          [String(all.length - sleeping.length), "Active tabs"],
          [String(sleeping.length), "Sleeping tabs"],
        ]) {
          const tile = html("div", { class: "zf-pf-tile" });
          tile.append(
            html("span", { class: "zf-pf-value" }, value),
            html("span", { class: "zf-pf-label" }, label),
          );
          tiles.append(tile);
        }
        parts.push(tiles);

        const setting = html("label", { class: "zf-pf-setting" });
        const select = html("select", { class: "zf-pf-select" });
        const after = Services.prefs.getStringPref(SLEEP_AFTER, "30");
        for (const [value, label] of DELAYS) {
          const option = html("option", { value }, label);
          option.selected = value === after;
          select.append(option);
        }
        select.addEventListener("change", () =>
          Services.prefs.setStringPref(SLEEP_AFTER, select.value),
        );
        setting.append(
          html("span", {}, "Put inactive tabs to sleep after"),
          select,
        );
        parts.push(setting);

        const others = all.filter(canSleep);
        const sleepAll = html(
          "button",
          { class: "zf-pf-primary" },
          others.length
            ? `Put ${others.length} other ${others.length === 1 ? "tab" : "tabs"} to sleep`
            : "No other tab to put to sleep",
        );
        sleepAll.disabled = !others.length;
        sleepAll.addEventListener("click", () => {
          const count = sleep(all.filter(canSleep));
          showToast(
            win,
            `${count} ${count === 1 ? "tab is" : "tabs are"} sleeping now`,
          );
          render();
        });
        parts.push(sleepAll);

        const top = [...perTab].sort((a, b) => b[1] - a[1]).slice(0, 8);
        if (top.length) {
          parts.push(
            html(
              "h3",
              { class: "zf-pf-subtitle" },
              "Tabs using the most memory",
            ),
          );
          const list = html("ul", { class: "zf-pf-list" });
          for (const [tab, bytes] of top) {
            const item = html("li", {});
            const button = html("button", { class: "zf-pf-sleep" }, "Sleep");
            button.disabled = !canSleep(tab);
            button.title = tab.selected ? "The tab you are on stays awake" : "";
            button.addEventListener("click", async () => {
              await gBrowser.explicitUnloadTabs([tab]);
              render();
            });
            item.append(
              html("img", {
                class: "zf-pf-icon",
                src: tab.getAttribute("image") || DEFAULT_ICON,
                alt: "",
              }),
              html("span", { class: "zf-pf-name" }, tab.label),
              html("span", { class: "zf-pf-memory" }, `≈ ${size(bytes)}`),
              button,
            );
            list.append(item);
          }
          parts.push(list);
        }

        const more = html(
          "button",
          { class: "zf-pf-link" },
          "Open the task manager (Shift+Esc)",
        );
        more.addEventListener("click", () => {
          panel.hidePopup();
          win.switchToTabHavingURI("about:processes", true);
        });
        parts.push(more);
        panel.replaceChildren(...parts);
      }

      ctx.listen(panel, "popupshowing", (event) => {
        if (event.target === panel) {
          render();
        }
      });
      ctx.observePref(SLEEP_AFTER, () => {
        if (panel.state === "open") {
          render();
        }
      });

      function openPanel() {
        const anchor =
          doc.getElementById("PanelUI-menu-button") ??
          doc.getElementById("tabbrowser-tabs");
        panel.openPopup(anchor, "bottomleft topleft");
      }

      // -------- Entry points --------
      const tools = doc.getElementById("menu_ToolsPopup");
      if (tools) {
        const item = ctx.element(
          "menuitem",
          { id: "zf-tools-performance", label: "Performance" },
          tools,
        );
        ctx.listen(item, "command", openPanel);
      }
      // The app menu's buttons only exist once it was first shown
      ctx.listen(
        win,
        "ViewShowing",
        (event) => {
          if (
            !/^appMenu-(proton)?[mM]ainView$/.test(event.target.id) ||
            doc.getElementById("zf-appmenu-performance")
          ) {
            return;
          }
          const anchor =
            doc.getElementById("zf-appmenu-stats") ??
            doc.getElementById("appMenu-history-button");
          if (!anchor) {
            return;
          }
          const button = ctx.element("toolbarbutton", {
            id: "zf-appmenu-performance",
            class: "subviewbutton",
            label: "Performance",
          });
          anchor.after(button);
          ctx.listen(button, "command", () => {
            win.PanelUI.hide();
            openPanel();
          });
        },
        true,
      );
      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyP" &&
            event.ctrlKey &&
            event.altKey &&
            event.shiftKey &&
            !event.metaKey &&
            !event.repeat
          ) {
            event.preventDefault();
            event.stopPropagation();
            openPanel();
          }
        },
        true,
      );
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
