// Zen Fluent Enhanced: Firefox's tab notes, turned on, with a list of them.
//
// Firefox 158 can keep a note per page (tab context menu › Add note; the
// note icon on the tab opens it), stored by the page's canonical address in
// tabnotes.sqlite. Zen ships it turned off (browser.tabs.notes.enabled):
// this feature turns it on while it is checked, and puts it back to Zen's
// default when it is unchecked. It adds what Firefox lacks: a panel with
// every note, newest first, a search field, and a click that opens the
// page (or goes to its tab); Tools › Tab notes, the tab context menu's
// All notes…, Ctrl+Alt+Shift+N or the Command Palette open it. The list is
// read from Firefox's database, read only. The hover cards show a tab's
// note too (hover-cards.uc.js).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { Sqlite } = ChromeUtils.importESModule(
    "resource://gre/modules/Sqlite.sys.mjs",
  );

  const FIREFOX_PREF = "browser.tabs.notes.enabled";
  const HTML = "http://www.w3.org/1999/xhtml";

  /** Every note, newest first: [{ url, created (ms), text }]. */
  async function allNotes() {
    const path = PathUtils.join(PathUtils.profileDir, "tabnotes.sqlite");
    if (!(await IOUtils.exists(path))) {
      return [];
    }
    const db = await Sqlite.openConnection({ path, readOnly: true });
    try {
      const rows = await db.execute(
        "SELECT canonical_url, created, note_text FROM tabnotes ORDER BY created DESC",
      );
      return rows.map((row) => ({
        url: row.getResultByIndex(0),
        created: row.getResultByIndex(1) * 1000,
        text: row.getResultByIndex(2),
      }));
    } finally {
      await db.close();
    }
  }

  const host = (url) => {
    try {
      return new URL(url).host.replace(/^www\./, "") || url;
    } catch {
      return url;
    }
  };

  const feature = ZFFeature.attach(window, {
    name: "tab-notes",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      Services.prefs.setBoolPref(FIREFOX_PREF, true);

      const html = (tag, attributes = {}, text = "") => {
        const el = doc.createElementNS(HTML, tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      const panel = ctx.element(
        "panel",
        {
          id: "zf-notes",
          type: "arrow",
          role: "dialog",
          "aria-label": "Tab notes",
          orient: "vertical",
        },
        doc.getElementById("mainPopupSet"),
      );
      ctx.onCleanup(() => panel.hidePopup());
      const header = html("div", { class: "zf-nt-header" });
      const title = html("h2", { class: "zf-nt-title" }, "Tab notes");
      const count = html("span", { class: "zf-nt-count" });
      header.append(title, count);
      const search = html("input", {
        class: "zf-nt-search",
        type: "search",
        placeholder: "Search notes",
        "aria-label": "Search notes",
      });
      const list = html("ul", { class: "zf-nt-list" });
      const empty = html("p", { class: "zf-nt-empty" });
      panel.append(header, search, list, empty);

      const dates = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
      let notes = [];

      const fill = () => {
        const query = search.value.trim().toLowerCase();
        const shown = notes.filter(
          (note) =>
            !query ||
            note.text.toLowerCase().includes(query) ||
            note.url.toLowerCase().includes(query),
        );
        list.replaceChildren(
          ...shown.map((note) => {
            const item = html("li", { tabindex: "0", title: note.url });
            item.append(
              html("span", { class: "zf-nt-text" }, note.text),
              html(
                "span",
                { class: "zf-nt-meta" },
                `${host(note.url)} · ${dates.format(note.created)}`,
              ),
            );
            const open = () => {
              panel.hidePopup();
              win.switchToTabHavingURI(note.url, true, {
                ignoreFragment: "whenComparing",
              });
            };
            item.addEventListener("click", open);
            item.addEventListener("keydown", (event) => {
              if (event.key === "Enter") {
                open();
              }
            });
            return item;
          }),
        );
        count.textContent = String(notes.length);
        empty.hidden = shown.length > 0;
        empty.textContent = notes.length
          ? "No note matches."
          : "No notes yet. Right-click a tab › Add note.";
      };
      ctx.listen(search, "input", fill);

      ctx.listen(panel, "popupshowing", async (event) => {
        if (event.target !== panel) {
          return;
        }
        search.value = "";
        try {
          notes = await allNotes();
        } catch (error) {
          console.error("[Zen Fluent Enhanced] tab-notes:", error);
          notes = [];
        }
        fill();
      });
      ctx.listen(panel, "popupshown", () => search.focus());

      const openPanel = () => {
        const anchor =
          doc.getElementById("zen-sidebar-foot-buttons") ??
          doc.getElementById("tabbrowser-tabs");
        panel.openPopup(anchor, "before_start");
      };

      // -------- Entry points --------
      const tools = doc.getElementById("menu_ToolsPopup");
      if (tools) {
        const item = ctx.element(
          "menuitem",
          { id: "zf-tools-notes", label: "Tab notes" },
          tools,
        );
        ctx.listen(item, "command", openPanel);
      }
      const editNote = doc.getElementById("context_editNote");
      if (editNote) {
        const item = ctx.element("menuitem", {
          id: "zf-context-all-notes",
          label: "All notes…",
        });
        editNote.after(item);
        ctx.listen(item, "command", () => win.setTimeout(openPanel, 0));
      }
      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyN" &&
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
    stop() {
      // Unchecked (not a closed window): back to Zen's default
      if (!Services.prefs.getBoolPref("zen-fluent.enhanced.tab-notes", false)) {
        Services.prefs.clearUserPref(FIREFOX_PREF);
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
