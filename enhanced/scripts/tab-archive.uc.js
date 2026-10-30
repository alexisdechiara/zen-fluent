// Zen Fluent Enhanced: automatic tab archiving.
//
// Every 5 minutes, tabs left unused longer than the chosen delay
// (zen-fluent.enhanced.tab-archive.after, 12 hours by default) are saved to
// the archive (lib/zf-archive.sys.mjs, a file in the profile) and only then
// closed; a toast offers to undo. Never archived: the selected tab,
// Essentials, tabs playing sound or sharing the camera or screen, Glance
// and split view tabs, empty tabs, a page that would ask before leaving,
// and private windows; pinned tabs and tabs in a folder unless their
// option says so. Sleeping tabs are archived like the others (their URL
// comes from the session store).
//
// The archive is a panel (tab context menu › Archived tabs…, or
// Ctrl+Alt+Shift+A): search by title or address, open a tab back in its
// space, remove entries. Entries older than the kept period
// (zen-fluent.enhanced.tab-archive.keep, 90 days) are dropped.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const archive = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-archive.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs",
  );

  const PREF = "zen-fluent.enhanced.tab-archive";
  const SWEEP_EVERY = 5 * 60 * 1000;
  // Leaves the session time to restore before the first sweep
  const FIRST_SWEEP = 60 * 1000;
  const HOUR = 60 * 60 * 1000;
  const SKIPPED_URLS = /^about:(blank|newtab|home|privatebrowsing)\b/;
  const SHOWN = 200;
  const HTML = "http://www.w3.org/1999/xhtml";

  const option = (name) => Services.prefs.getBoolPref(`${PREF}.${name}`, false);
  const delay = () =>
    (Number(Services.prefs.getStringPref(`${PREF}.after`, "12")) || 12) * HOUR;
  const keptDays = () => {
    const value = Services.prefs.getStringPref(`${PREF}.keep`, "90");
    return value === "forever" ? null : Number(value) || 90;
  };

  function urlOf(tab) {
    let url = tab.linkedBrowser?.currentURI?.spec;
    // A sleeping tab's browser shows about:blank: the session knows better
    if (!url || url === "about:blank") {
      try {
        url = SessionStore.getLazyTabValue(tab, "url") || url;
      } catch {}
    }
    return url || "";
  }

  function archivable(tab, now) {
    if (
      tab.selected ||
      tab.closing ||
      tab.hasAttribute("zen-essential") ||
      tab.hasAttribute("zen-empty-tab") ||
      tab.hasAttribute("zen-glance-tab") ||
      tab.hasAttribute("glance-id") ||
      tab.hasAttribute("split-view") ||
      tab.hasAttribute("soundplaying") ||
      tab.hasAttribute("pictureinpicture") ||
      tab.hasAttribute("sharing") ||
      (tab.pinned && !option("pinned")) ||
      (tab.group && !option("folders"))
    ) {
      return false;
    }
    if (
      !Number.isFinite(tab.lastAccessed) ||
      now - tab.lastAccessed < delay()
    ) {
      return false;
    }
    try {
      if (tab.linkedBrowser?.hasBeforeUnload) {
        return false;
      }
    } catch {}
    const url = urlOf(tab);
    return !!url && !SKIPPED_URLS.test(url);
  }

  const entryOf = (tab) => ({
    url: urlOf(tab),
    title: tab.label,
    // moz-remote-image: and other cache URLs die with the session: the
    // panel then asks Places for the page's icon (page-icon:)
    icon: /^(https?|data):/.test(tab.getAttribute("image") ?? "")
      ? tab.getAttribute("image")
      : null,
    workspaceId: tab.getAttribute("zen-workspace-id"),
    lastAccessed: tab.lastAccessed,
  });

  const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

  const feature = ZFFeature.attach(window, {
    name: "tab-archive",
    start(ctx) {
      const { document } = ctx;
      const win = ctx.window;
      if (PrivateBrowsingUtils.isWindowPrivate(win)) {
        return;
      }
      let running = true;
      ctx.onCleanup(() => (running = false));

      /** Opens archived tabs again, in their space if it still exists. */
      async function restore(entries, { select = false } = {}) {
        let last = null;
        for (const entry of entries) {
          const tab = gBrowser.addTrustedTab(entry.url, {
            inBackground: !select,
            skipAnimation: true,
          });
          const space =
            entry.workspaceId &&
            gZenWorkspaces.getWorkspaceFromId(entry.workspaceId) &&
            entry.workspaceId;
          if (space && tab.getAttribute("zen-workspace-id") !== space) {
            gZenWorkspaces.moveTabToWorkspace(tab, space);
          }
          last = { tab, space };
        }
        await archive.remove(entries.map((entry) => entry.id));
        if (select && last) {
          if (last.space && last.space !== gZenWorkspaces.activeWorkspace) {
            await gZenWorkspaces.changeWorkspaceWithID(last.space);
          }
          gBrowser.selectedTab = last.tab;
        }
      }

      /**
       * Saves tabs to the archive, then closes them. By hand (the context
       * menu), the selected tab goes too.
       */
      async function archiveTabs(tabs, { manual = false } = {}) {
        const entries = await archive.add(tabs.map(entryOf));
        // The user may have picked one meanwhile: it stays, out of the archive
        const kept = [];
        const closed = [];
        tabs.forEach((tab, index) => {
          if ((tab.selected && !manual) || tab.closing || !tab.isConnected) {
            kept.push(entries[index].id);
          } else {
            closed.push([tab, entries[index]]);
          }
        });
        if (kept.length) {
          await archive.remove(kept);
        }
        if (!closed.length) {
          return;
        }
        gBrowser.removeTabs(
          closed.map(([tab]) => tab),
          // The address is kept: a page that would ask is closed without
          // asking (never automatically, see archivable())
          { animate: false, skipPermitUnload: true },
        );
        const restored = closed.map(([, entry]) => entry);
        showToast(win, `${plural(restored.length, "tab")} archived`, {
          action: { label: "Undo", run: () => restore(restored) },
        });
      }

      async function sweep() {
        const days = keptDays();
        if (days) {
          await archive.prune(days);
        }
        const now = Date.now();
        const tabs = gBrowser.tabs.filter((tab) => archivable(tab, now));
        if (running && tabs.length) {
          await archiveTabs(tabs);
        }
      }

      ctx.timeout(() => {
        sweep();
        ctx.interval(sweep, SWEEP_EVERY);
      }, FIRST_SWEEP);

      // -------- The archive panel --------
      const html = (tag, attributes = {}, text = "") => {
        const el = document.createElementNS(HTML, tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };
      const panel = ctx.element(
        "panel",
        {
          id: "zf-archive",
          type: "arrow",
          role: "dialog",
          "aria-label": "Archived tabs",
          orient: "vertical",
        },
        document.getElementById("mainPopupSet"),
      );
      ctx.onCleanup(() => panel.hidePopup());
      const header = html("div", { class: "zf-ar-header" });
      const count = html("span", { class: "zf-ar-count" });
      header.append(
        html("h2", { class: "zf-ar-title" }, "Archived tabs"),
        count,
      );
      const search = html("input", {
        class: "zf-ar-search",
        type: "search",
        placeholder: "Search titles and addresses",
        "aria-label": "Search archived tabs",
      });
      const list = html("ul", { class: "zf-ar-list", role: "list" });
      const clear = html("button", { class: "zf-ar-clear" }, "Clear archive");
      panel.append(header, search, list, clear);

      const ago = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      function when(time) {
        const minutes = Math.round((time - Date.now()) / 60000);
        if (Math.abs(minutes) < 60) {
          return ago.format(minutes, "minute");
        }
        const hours = Math.round(minutes / 60);
        return Math.abs(hours) < 24
          ? ago.format(hours, "hour")
          : ago.format(Math.round(hours / 24), "day");
      }

      function row(entry) {
        const item = html("li", { class: "zf-ar-item" });
        const open = html("button", { class: "zf-ar-open", title: entry.url });
        const icon = html("img", {
          class: "zf-ar-icon",
          alt: "",
          src: entry.icon || `page-icon:${entry.url}`,
        });
        icon.addEventListener(
          "error",
          () => (icon.src = "chrome://global/skin/icons/defaultFavicon.svg"),
          { once: true },
        );
        let host = entry.url;
        try {
          host = new URL(entry.url).host || entry.url;
        } catch {}
        const space = entry.workspaceId
          ? gZenWorkspaces.getWorkspaceFromId(entry.workspaceId)?.name
          : null;
        const text = html("span", { class: "zf-ar-text" });
        text.append(
          html("span", { class: "zf-ar-name" }, entry.title),
          html(
            "span",
            { class: "zf-ar-meta" },
            [host, when(entry.archivedAt), space].filter(Boolean).join(" · "),
          ),
        );
        open.append(icon, text);
        open.addEventListener("click", () => {
          panel.hidePopup();
          restore([entry], { select: true });
        });
        const remove = html("button", {
          class: "zf-ar-remove",
          title: "Remove from the archive",
          "aria-label": `Remove ${entry.title} from the archive`,
        });
        remove.addEventListener("click", () => archive.remove([entry.id]));
        item.append(open, remove);
        return item;
      }

      let matches = [];
      let rendering = 0;
      async function render() {
        // Only the latest render writes (typing fires one per key)
        const current = ++rendering;
        const all = await archive.list();
        if (current !== rendering) {
          return;
        }
        const query = search.value.trim().toLowerCase();
        matches = query
          ? all.filter(
              (entry) =>
                entry.title.toLowerCase().includes(query) ||
                entry.url.toLowerCase().includes(query),
            )
          : all;
        count.textContent = plural(all.length, "tab");
        list.replaceChildren(...matches.slice(0, SHOWN).map(row));
        if (!matches.length) {
          list.append(
            html(
              "li",
              { class: "zf-ar-empty" },
              all.length ? "No archived tab matches." : "No archived tab yet.",
            ),
          );
        }
        clear.disabled = !all.length;
      }

      let confirming = 0;
      ctx.listen(clear, "click", async () => {
        if (!confirming) {
          clear.textContent = "Click again to clear the archive";
          confirming = win.setTimeout(() => {
            confirming = 0;
            clear.textContent = "Clear archive";
          }, 4000);
          return;
        }
        win.clearTimeout(confirming);
        confirming = 0;
        clear.textContent = "Clear archive";
        await archive.remove((await archive.list()).map((entry) => entry.id));
      });
      ctx.listen(search, "input", render);
      ctx.listen(search, "keydown", (event) => {
        if (event.key === "Enter" && matches.length) {
          panel.hidePopup();
          restore([matches[0]], { select: true });
        }
      });
      ctx.listen(panel, "popupshowing", render);
      ctx.listen(panel, "popupshown", () => search.focus());
      ctx.onCleanup(
        archive.subscribe(() => {
          if (panel.state === "open") {
            render();
          }
        }),
      );

      function openPanel() {
        search.value = "";
        const anchor =
          document.getElementById("zen-sidebar-foot-buttons") ??
          document.getElementById("tabbrowser-tabs");
        panel.openPopup(anchor, "before_start");
      }

      // -------- Entry points --------
      const menu = document.getElementById("tabContextMenu");
      const closeItem = document.getElementById("context_closeTab");
      const archiveItem = ctx.element("menuitem", {
        id: "zf-context-archive-tab",
        label: "Archive tab",
        accesskey: "v",
      });
      const showItem = ctx.element("menuitem", {
        id: "zf-context-archived-tabs",
        label: "Archived tabs…",
      });
      if (closeItem) {
        closeItem.after(archiveItem, showItem);
      } else {
        menu?.append(archiveItem, showItem);
      }
      const contextTabs = () => {
        const tab = TabContextMenu.contextTab;
        return tab?.multiselected ? gBrowser.selectedTabs : [tab];
      };
      ctx.listen(menu, "popupshowing", (event) => {
        if (event.target === menu) {
          archiveItem.hidden = contextTabs().every(
            (tab) => !tab || tab.hasAttribute("zen-essential"),
          );
        }
      });
      ctx.listen(archiveItem, "command", () => {
        const tabs = contextTabs().filter(
          (tab) => tab && !tab.hasAttribute("zen-essential"),
        );
        if (tabs.length) {
          archiveTabs(tabs, { manual: true });
        }
      });
      ctx.listen(showItem, "command", openPanel);
      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyA" &&
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
