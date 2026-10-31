// Zen Fluent Enhanced: Windows 11 Snap Layouts for Zen's split view.
//
// Hovering the window's maximize button, the tab context menu's Snap
// layouts… or Ctrl+Alt+Shift+Z opens a flyout of six layouts: two halves,
// two thirds and a third, three columns, a main zone with two stacked,
// four quarters, two stacked halves. A click on a zone puts the selected
// tab there; Snap Assist then lists the space's recent tabs for each zone
// left, and the split opens once every zone has a tab. Zen keeps the
// layout tree, its sizes included, in the session.
//
// The split goes through gZenViewSplitter.splitTabs (side by side), then
// its layout tree is replaced by the layout's own, built with the
// splitter's own node classes, and the split view applied again.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const THIRD = 100 / 3;
  const DEFAULT_ICON = "chrome://global/skin/icons/defaultFavicon.svg";

  // zones: [x, y, w, h] on a 6 x 6 grid, in the order tabs fill them;
  // tree(node, leaf, tabs): the split's layout tree for those tabs
  const LAYOUTS = [
    {
      id: "halves",
      name: "Two halves",
      zones: [
        [0, 0, 3, 6],
        [3, 0, 3, 6],
      ],
      tree: (node, leaf, t) => node("row", [leaf(t[0], 50), leaf(t[1], 50)]),
    },
    {
      id: "two-thirds",
      name: "Two thirds and a third",
      zones: [
        [0, 0, 4, 6],
        [4, 0, 2, 6],
      ],
      tree: (node, leaf, t) =>
        node("row", [leaf(t[0], 2 * THIRD), leaf(t[1], THIRD)]),
    },
    {
      id: "thirds",
      name: "Three columns",
      zones: [
        [0, 0, 2, 6],
        [2, 0, 2, 6],
        [4, 0, 2, 6],
      ],
      tree: (node, leaf, t) =>
        node(
          "row",
          t.map((tab) => leaf(tab, THIRD)),
        ),
    },
    {
      id: "main-stack",
      name: "One and two stacked",
      zones: [
        [0, 0, 3, 6],
        [3, 0, 3, 3],
        [3, 3, 3, 3],
      ],
      tree: (node, leaf, t) =>
        node("row", [
          leaf(t[0], 50),
          node("column", [leaf(t[1], 50), leaf(t[2], 50)], 50),
        ]),
    },
    {
      id: "quarters",
      name: "Four quarters",
      zones: [
        [0, 0, 3, 3],
        [3, 0, 3, 3],
        [0, 3, 3, 3],
        [3, 3, 3, 3],
      ],
      tree: (node, leaf, t) =>
        node("row", [
          node("column", [leaf(t[0], 50), leaf(t[2], 50)], 50),
          node("column", [leaf(t[1], 50), leaf(t[3], 50)], 50),
        ]),
    },
    {
      id: "stacked",
      name: "Two stacked halves",
      zones: [
        [0, 0, 6, 3],
        [0, 3, 6, 3],
      ],
      tree: (node, leaf, t) => node("column", [leaf(t[0], 50), leaf(t[1], 50)]),
    },
  ];

  const feature = ZFFeature.attach(window, {
    name: "snap-layouts",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const splitter = win.gZenViewSplitter;
      if (!splitter?.splitTabs) {
        return;
      }
      const html = (tag, attributes = {}, text = "") => {
        const el = doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      const panel = ctx.element(
        "panel",
        {
          id: "zf-snap",
          type: "arrow",
          role: "dialog",
          "aria-label": "Snap layouts",
          noautofocus: "true",
        },
        doc.getElementById("mainPopupSet"),
      );
      const content = html("div", { class: "zf-snap-content" });
      panel.append(content);

      /** Tabs Snap Assist offers: the space's tabs, most recent first. */
      const candidates = (exclude) =>
        win.gBrowser.visibleTabs
          .filter(
            (tab) =>
              !exclude.includes(tab) &&
              !tab.hasAttribute("zen-essential") &&
              !tab.hasAttribute("zen-empty-tab") &&
              !tab.hasAttribute("zen-glance-tab"),
          )
          .sort((a, b) => b.lastAccessed - a.lastAccessed)
          .slice(0, 8);

      /** A layout drawn on its grid; onZone(i) on a click, if given. */
      const drawLayout = (layout, chosen, onZone) => {
        const box = html("div", {
          class: "zf-snap-layout",
          role: "group",
          "aria-label": layout.name,
          title: layout.name,
        });
        layout.zones.forEach(([x, y, w, h], i) => {
          const zone = html(onZone ? "button" : "div", {
            class: "zf-snap-zone",
            style: `grid-area: ${y + 1} / ${x + 1} / span ${h} / span ${w}`,
          });
          if (chosen[i]) {
            zone.setAttribute("zf-filled", "");
            zone.append(
              html("img", {
                src: chosen[i].getAttribute("image") || DEFAULT_ICON,
                alt: "",
              }),
            );
          }
          if (onZone) {
            zone.setAttribute("aria-label", `${layout.name}, zone ${i + 1}`);
            zone.addEventListener("click", () => onZone(i));
          }
          box.append(zone);
        });
        return box;
      };

      let state = null; // { layout, chosen: [tab per zone] }

      const showLayouts = () => {
        state = null;
        const available = candidates([win.gBrowser.selectedTab]).length + 1;
        const grid = html("div", { class: "zf-snap-layouts" });
        for (const layout of LAYOUTS) {
          const box = drawLayout(layout, [], (i) => pick(layout, i));
          if (layout.zones.length > Math.min(available, splitter.MAX_TABS)) {
            box.setAttribute("zf-disabled", "");
            for (const zone of box.children) {
              zone.disabled = true;
            }
          }
          grid.append(box);
        }
        content.replaceChildren(
          html("p", { class: "zf-snap-title" }, "Snap layouts"),
          grid,
        );
      };

      const pick = (layout, zone) => {
        state = { layout, chosen: [] };
        state.chosen[zone] = win.gBrowser.selectedTab;
        assist();
      };

      // Snap Assist: one step per empty zone
      const assist = () => {
        const { layout, chosen } = state;
        const next = layout.zones.findIndex((_, i) => !chosen[i]);
        if (next < 0) {
          panel.hidePopup();
          apply(layout, chosen);
          return;
        }
        const list = html("ul", { class: "zf-snap-tabs", role: "listbox" });
        for (const tab of candidates(chosen.filter(Boolean))) {
          const item = html("li", { role: "option", tabindex: "0" });
          item.append(
            html("img", {
              src: tab.getAttribute("image") || DEFAULT_ICON,
              alt: "",
            }),
            html("span", { class: "zf-snap-label" }, tab.label),
          );
          const choose = () => {
            chosen[next] = tab;
            assist();
          };
          item.addEventListener("click", choose);
          item.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              choose();
            }
          });
          list.append(item);
        }
        const preview = drawLayout(layout, chosen);
        preview
          .querySelectorAll(".zf-snap-zone")
          [next].setAttribute("zf-next", "");
        content.replaceChildren(
          html(
            "p",
            { class: "zf-snap-title" },
            `Choose a tab for zone ${next + 1}`,
          ),
          preview,
          list,
        );
        list.firstElementChild?.focus();
      };

      const apply = (layout, tabs) => {
        // tabs already in a split leave it first
        for (const group of [...splitter._data]) {
          if (group.tabs.some((tab) => tabs.includes(tab))) {
            splitter.removeGroup(splitter._data.indexOf(group));
          }
        }
        const selected = Math.max(0, tabs.indexOf(win.gBrowser.selectedTab));
        const data = splitter.splitTabs(tabs, "vsep", selected);
        // splitTabs may skip or duplicate tabs (pinned with unpinned)
        if (!data || data.tabs.length !== tabs.length) {
          return;
        }
        const Node = data.layoutTree.constructor;
        const Leaf = data.layoutTree.children[0].constructor;
        const node = (direction, children, size) => {
          const n = new Node(direction, size);
          n.children = children;
          return n;
        };
        data.layoutTree = layout.tree(
          node,
          (tab, size) => new Leaf(tab, size),
          data.tabs,
        );
        splitter.activateSplitView(data, true);
      };

      const open = (anchor, position) => {
        if (panel.state !== "closed") {
          return;
        }
        showLayouts();
        panel.openPopup(anchor, position);
      };
      const openCentered = () =>
        open(doc.getElementById("tabbrowser-tabbox"), "overlap");
      ctx.listen(panel, "popuphidden", (event) => {
        if (event.target === panel) {
          state = null;
          content.replaceChildren();
        }
      });

      // Ctrl+Alt+Shift+Z
      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyZ" &&
            event.ctrlKey &&
            event.altKey &&
            event.shiftKey &&
            !event.metaKey &&
            !event.repeat
          ) {
            event.preventDefault();
            event.stopPropagation();
            openCentered();
          }
        },
        true,
      );

      // The tab context menu, after Zen's split items
      const menu = doc.getElementById("tabContextMenu");
      const item = ctx.element("menuitem", {
        id: "zf-context-snap-layouts",
        label: "Snap layouts…",
      });
      const zenSplit = doc.getElementById("context_zenSplitTabs");
      if (zenSplit) {
        zenSplit.after(item);
      } else {
        menu?.append(item);
      }
      ctx.listen(item, "command", () => win.setTimeout(openCentered, 0));

      // Hovering a maximize button, as on Windows 11: the flyout stays while
      // the pointer is on the button or on it
      let hoverTimer = 0;
      let leaveTimer = 0;
      const clear = () => {
        win.clearTimeout(hoverTimer);
        win.clearTimeout(leaveTimer);
      };
      ctx.onCleanup(clear);
      const leave = () => {
        win.clearTimeout(hoverTimer);
        win.clearTimeout(leaveTimer);
        if (panel.getAttribute("zf-by-hover") !== null && !state) {
          leaveTimer = win.setTimeout(() => panel.hidePopup(), 400);
        }
      };
      ctx.listen(doc, "mouseover", (event) => {
        const button = event.target.closest?.(
          ".titlebar-max, .titlebar-restore",
        );
        if (!button) {
          return;
        }
        clear();
        hoverTimer = win.setTimeout(() => {
          panel.setAttribute("zf-by-hover", "");
          open(button, "after_end");
        }, 500);
      });
      ctx.listen(doc, "mouseout", (event) => {
        if (event.target.closest?.(".titlebar-max, .titlebar-restore")) {
          leave();
        }
      });
      ctx.listen(panel, "mouseenter", () => win.clearTimeout(leaveTimer));
      ctx.listen(panel, "mouseleave", leave);
      ctx.listen(panel, "popuphidden", () =>
        panel.removeAttribute("zf-by-hover"),
      );
      ctx.listen(doc, "mousedown", (event) => {
        if (event.target.closest?.(".titlebar-max, .titlebar-restore")) {
          clear();
        }
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
