// Zen Fluent Enhanced: a sheet of the keyboard shortcuts over the window.
//
// Ctrl+Alt+Shift+K (by position, as the mod's other shortcuts), Help ›
// Keyboard shortcuts sheet, or the Command Palette opens a card over the
// window: the main shortcuts of Firefox and Zen in groups, then Zen
// Fluent's own (only those of the features turned on), with a search
// field. Each shortcut is read from its <key> element, so a shortcut
// changed in about:keyboard shows as it is now, and one that was removed
// is left out. Escape, the same keys or a click outside closes it.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { ShortcutUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/ShortcutUtils.sys.mjs",
  );

  // [key id, label], or [first id, last id, label] for a range
  const GROUPS = [
    {
      name: "Tabs",
      keys: [
        ["key_newNavigatorTab", "New tab"],
        ["key_close", "Close tab"],
        ["key_restoreLastClosedTabOrWindowOrSession", "Reopen closed tab"],
        ["key_searchTabs", "Search tabs"],
        ["key_selectTab1", "key_selectTab8", "Go to tab 1 to 8"],
        ["key_selectLastTab", "Go to the last tab"],
        ["zen-toggle-pin-tab", "Pin or unpin tab"],
        ["key_toggleMute", "Mute or unmute tab"],
        ["zen-close-all-unpinned-tabs", "Close unpinned tabs"],
      ],
    },
    {
      name: "Page",
      keys: [
        ["focusURLBar", "Address bar"],
        ["goBackKb", "Back"],
        ["goForwardKb", "Forward"],
        ["key_reload", "Reload"],
        ["key_find", "Find in page"],
        ["zen-copy-url", "Copy address"],
        ["zen-copy-url-markdown", "Copy as a Markdown link"],
        ["key_fullZoomEnlarge", "Zoom in"],
        ["key_fullZoomReduce", "Zoom out"],
        ["key_fullZoomReset", "Reset zoom"],
        ["addBookmarkAsKb", "Bookmark page"],
        ["key_screenshot", "Screenshot"],
      ],
    },
    {
      name: "Zen",
      keys: [
        ["zen-compact-mode-toggle", "Compact mode"],
        ["zen-compact-mode-show-sidebar", "Show the sidebar"],
        ["zen-workspace-forward", "Next space"],
        ["zen-workspace-backward", "Previous space"],
        [
          "zen-workspace-switch-1",
          "zen-workspace-switch-10",
          "Go to space 1 to 10",
        ],
        ["zen-split-view-grid", "Split view: grid"],
        ["zen-split-view-vertical", "Split view: side by side"],
        ["zen-split-view-horizontal", "Split view: stacked"],
        ["zen-split-view-unsplit", "Close split view"],
        ["zen-glance-expand", "Open Glance as a tab"],
        ["zen-library-toggle", "Library"],
      ],
    },
    {
      name: "Window",
      keys: [
        ["key_newNavigator", "New window"],
        ["key_privatebrowsing", "New private window"],
        ["key_enterFullScreen", "Full screen"],
        ["key_openDownloads", "Downloads"],
        ["showAllHistoryKb", "History"],
        ["key_openAddons", "Add-ons and themes"],
      ],
    },
  ];

  // Zen Fluent's own, shown while their feature is on: [feature, keys, label]
  const ZEN_FLUENT = [
    ["tab-numbers", "Ctrl (hold)", "Tab numbers"],
    ["shortcuts", "Ctrl+Alt+Shift+D", "Density"],
    ["shortcuts", "Ctrl+Alt+Shift+T", "Light or dark"],
    ["shortcuts", "Ctrl+Alt+Shift+M", "Material"],
    ["tab-archive", "Ctrl+Alt+Shift+A", "Archived tabs"],
    ["browsing-stats", "Ctrl+Alt+Shift+S", "Browsing stats"],
    ["shortcut-overlay", "Ctrl+Alt+Shift+K", "This sheet"],
  ];
  const DEFAULTS = {
    "tab-numbers": true,
    shortcuts: true,
    "shortcut-overlay": true,
  };

  const ARROWS = {
    "Left Arrow": "←",
    "Right Arrow": "→",
    "Up Arrow": "↑",
    "Down Arrow": "↓",
  };

  /** "Ctrl+Shift+T" → ["Ctrl", "Shift", "T"]; "Ctrl++" keeps its "+". */
  const caps = (text) =>
    text.split(/\+(?=.)/).map((part) => ARROWS[part] ?? part);

  const feature = ZFFeature.attach(window, {
    name: "shortcut-overlay",
    default: true,
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

      const shortcut = (id) => {
        const key = doc.getElementById(id);
        if (
          !key ||
          key.getAttribute("disabled") === "true" ||
          (!key.getAttribute("key") && !key.getAttribute("keycode"))
        ) {
          return null;
        }
        return caps(ShortcutUtils.prettifyShortcut(key));
      };

      const overlay = ctx.element(
        "html:div",
        { id: "zf-shortcuts", hidden: "true" },
        doc.getElementById("zen-main-app-wrapper") ?? doc.body,
      );
      const card = html("div", {
        class: "zf-sc-card",
        role: "dialog",
        "aria-label": "Keyboard shortcuts",
        tabindex: "-1",
      });
      const header = html("div", { class: "zf-sc-header" });
      const title = html("h1", { class: "zf-sc-title" }, "Keyboard shortcuts");
      const search = html("input", {
        class: "zf-sc-search",
        type: "search",
        placeholder: "Search shortcuts",
        "aria-label": "Search shortcuts",
      });
      const body = html("div", { class: "zf-sc-groups" });
      const empty = html(
        "p",
        { class: "zf-sc-empty", hidden: "true" },
        "No shortcut matches.",
      );
      const footer = html(
        "p",
        { class: "zf-sc-footer" },
        "Change them in about:keyboard",
      );
      header.append(title, search);
      card.append(header, body, empty, footer);
      overlay.append(card);

      const row = (label, keys) => {
        const li = html("li", { class: "zf-sc-row" });
        li.dataset.search = `${label} ${keys.join(" ")}`.toLowerCase();
        const keysEl = html("span", { class: "zf-sc-keys" });
        for (const key of keys) {
          keysEl.append(html("kbd", {}, key));
        }
        li.append(html("span", { class: "zf-sc-label" }, label), keysEl);
        return li;
      };

      const render = () => {
        body.replaceChildren();
        const groups = GROUPS.map(({ name, keys }) => ({
          name,
          rows: keys
            .map((entry) => {
              const label = entry.at(-1);
              const first = shortcut(entry[0]);
              if (!first) {
                return null;
              }
              if (entry.length === 3) {
                const last = shortcut(entry[1]);
                if (last) {
                  first[first.length - 1] += `–${last.at(-1)}`;
                }
              }
              return row(label, first);
            })
            .filter(Boolean),
        }));
        groups.push({
          name: "Zen Fluent",
          rows: ZEN_FLUENT.filter(([name]) =>
            Services.prefs.getBoolPref(
              `zen-fluent.enhanced.${name}`,
              DEFAULTS[name] ?? false,
            ),
          ).map(([, keys, label]) => row(label, caps(keys))),
        });
        for (const group of groups.filter((g) => g.rows.length)) {
          const section = html("section", { class: "zf-sc-group" });
          const list = html("ul", {});
          list.append(...group.rows);
          section.append(html("h2", {}, group.name), list);
          body.append(section);
        }
      };

      const filter = () => {
        const query = search.value.trim().toLowerCase();
        let shown = 0;
        for (const section of body.children) {
          let any = false;
          for (const li of section.querySelectorAll(".zf-sc-row")) {
            li.hidden = !!query && !li.dataset.search.includes(query);
            any ||= !li.hidden;
            shown += li.hidden ? 0 : 1;
          }
          section.hidden = !any;
        }
        empty.hidden = shown > 0;
      };

      let returnFocus = null;
      const isOpen = () => !overlay.hidden;
      const open = () => {
        if (isOpen()) {
          return;
        }
        render();
        search.value = "";
        filter();
        returnFocus = doc.activeElement;
        overlay.hidden = false;
        search.focus();
      };
      const close = () => {
        if (!isOpen()) {
          return;
        }
        overlay.hidden = true;
        if (returnFocus?.isConnected) {
          returnFocus.focus();
        } else {
          win.gBrowser.selectedBrowser.focus();
        }
        returnFocus = null;
      };
      ctx.onCleanup(close);

      ctx.listen(search, "input", filter);
      ctx.listen(overlay, "mousedown", (event) => {
        if (event.target === overlay) {
          close();
        }
      });
      ctx.listen(
        win,
        "keydown",
        (event) => {
          const toggle =
            event.code === "KeyK" &&
            event.ctrlKey &&
            event.altKey &&
            event.shiftKey &&
            !event.metaKey;
          if (toggle && !event.repeat) {
            event.preventDefault();
            event.stopPropagation();
            if (isOpen()) {
              close();
            } else {
              open();
            }
          } else if (isOpen() && event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        },
        true,
      );
      // another window, a tab switch or a menu takes over
      ctx.listen(win, "TabSelect", close);
      ctx.listen(win, "deactivate", close);

      // Help › Keyboard shortcuts sheet (also run by the Command Palette)
      const item = ctx.element("menuitem", {
        id: "zf-help-shortcuts",
        label: "Keyboard shortcuts sheet",
      });
      const help = doc.getElementById("menu_HelpPopup");
      const anchor = doc.getElementById("menu_keyboardShortcuts");
      if (anchor) {
        anchor.after(item);
      } else {
        help?.prepend(item);
      }
      ctx.listen(item, "command", () => win.setTimeout(open, 0));
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
