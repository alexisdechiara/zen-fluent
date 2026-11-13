// Zen Fluent Enhanced: a settings page, about:zen-fluent.
//
// Every Zen Fluent and Zen Fluent Enhanced setting on one page, in the
// Windows Settings style, with a live preview and the presets
// (enhanced/settings/). This script registers the page
// (lib/zf-settings.sys.mjs) and adds its entry points: a Zen Fluent item in
// the app menu, under Settings, and in the Tools menu, and
// Ctrl+Alt+Shift+F. Quick Settings' "All settings" opens it too. Zen's
// settings get a Zen Fluent entry below Sine Mods, whose pane shows the page
// (about:preferences#zenFluent). A settings tab restored before the page was
// registered shows an error: it is reloaded once the page exists.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const {
    SETTINGS_URL,
    openSettings,
    useAboutPage,
    rememberSection,
    takeSection,
  } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-settings.sys.mjs",
  );

  const { t } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs",
  );
  const FEATURE = "zen-fluent.enhanced.settings-page";
  const HTML = "http://www.w3.org/1999/xhtml";
  const PANE = "paneZenFluent";
  const ICONS = "chrome://sine/content/Zen-Fluent-Enhanced/settings/icons/";
  const PANE_ICON = `${ICONS}sparkle.svg`;
  const PREFS_SHEET =
    "chrome://sine/content/Zen-Fluent-Enhanced/settings/preferences-nav.css";

  const feature = ZFFeature.attach(window, {
    name: "settings-page",
    default: true,
    start(ctx) {
      const { document } = ctx;
      const win = ctx.window;
      ctx.onCleanup(useAboutPage());

      for (const tab of gBrowser.tabs) {
        const browser = tab.linkedBrowser;
        if (
          browser?.currentURI?.spec.startsWith(SETTINGS_URL) &&
          browser.documentURI?.spec.startsWith("about:neterror")
        ) {
          browser.reload();
        }
      }

      const open = () => openSettings(win);

      // Zen's settings button (and every "open the settings" without a
      // pane) opens Zen Fluent's Overview rather than the pane Firefox
      // shows last, zen-fluent.enhanced.settings-page.home
      const firefoxOpen = win.openPreferences;
      if (typeof firefoxOpen === "function") {
        const openPreferences = function (paneID, ...rest) {
          if (!paneID && Services.prefs.getBoolPref(`${FEATURE}.home`, true)) {
            openSettings(win);
            return Promise.resolve();
          }
          return firefoxOpen.call(this, paneID, ...rest);
        };
        win.openPreferences = openPreferences;
        ctx.onCleanup(() => {
          if (win.openPreferences === openPreferences) {
            win.openPreferences = firefoxOpen;
          }
        });
      }

      const tools = document.getElementById("menu_ToolsPopup");
      if (tools) {
        const item = ctx.element("menuitem", {
          id: "zf-tools-settings",
          label: "Zen Fluent settings",
        });
        tools.prepend(item);
        ctx.listen(item, "command", open);
      }
      // The app menu's buttons only exist once it was first shown
      ctx.listen(
        win,
        "ViewShowing",
        (event) => {
          if (
            // appMenu-mainView in Zen 1.24, appMenu-protonMainView in Firefox
            !/^appMenu-(proton)?[mM]ainView$/.test(event.target.id) ||
            document.getElementById("zf-appmenu-settings")
          ) {
            return;
          }
          const settings = document.getElementById("appMenu-settings-button");
          if (!settings) {
            return;
          }
          const button = ctx.element("toolbarbutton", {
            id: "zf-appmenu-settings",
            class: "subviewbutton",
            label: "Zen Fluent",
            // without an icon its label sat 16px left of the others
            image:
              "chrome://sine/content/Zen-Fluent-Enhanced/settings/icons/paint-brush.svg",
          });
          settings.after(button);
          ctx.listen(button, "command", () => {
            PanelUI.hide();
            open();
          });
        },
        true,
      );
      // -------- Zen's settings: a Zen Fluent pane below Sine Mods --------
      // about:preferences runs in the parent process, so this window reaches
      // its document: a nav button after Sine's, the page's sections as its
      // sub-items (shown while its pane is), and a pane (Firefox's own
      // register_module, as gotoPref needs both its maps) holding the page in
      // its embedded layout, as tall as the window leaves room for. A section
      // is gotoPref's subcategory: about:preferences#zenFluent-tabs.
      const removers = new Set();
      const isPrefs = (doc) =>
        /^about:(preferences|settings)\b/.test(doc?.documentURI ?? "") &&
        doc.defaultView?.top === doc.defaultView &&
        doc.defaultView.browsingContext?.topChromeWindow === win;

      function addPane(doc, hash = doc.location.hash) {
        const prefsWin = doc.defaultView;
        const categories = doc.getElementById("categories");
        const main = doc.getElementById("mainPrefPane");
        if (
          !categories ||
          !main ||
          typeof prefsWin.register_module !== "function" ||
          doc.getElementById("category-zen-fluent")
        ) {
          return;
        }
        const button = doc.createElementNS(HTML, "moz-page-nav-button");
        button.id = "category-zen-fluent";
        button.setAttribute("view", PANE);
        button.setAttribute("iconsrc", PANE_ICON);
        button.textContent = "Zen Fluent";
        const after =
          doc.getElementById("category-sine-mods") ??
          doc.getElementById("category-general");
        if (after) {
          after.after(button);
        } else {
          categories.prepend(button);
        }
        const sheet = doc.createElementNS(HTML, "link");
        sheet.rel = "stylesheet";
        sheet.href = PREFS_SHEET;
        doc.head?.append(sheet);
        // The page's sections, under the button while its pane is shown
        const subnav = doc.createElementNS(HTML, "div");
        subnav.id = "zf-prefs-subnav";
        subnav.setAttribute("role", "group");
        subnav.setAttribute("aria-label", "Zen Fluent");
        const list = doc.createElementNS(HTML, "div");
        list.className = "zf-subnav-list";
        subnav.append(list);
        button.after(subnav);

        const pane = doc.createElementNS(HTML, "div");
        pane.id = "zf-prefs-pane";
        pane.dataset.category = PANE;
        pane.hidden = true;
        const frame = doc.createElementNS(HTML, "iframe");
        frame.src = `${SETTINGS_URL}?embed`;
        frame.title = t("Zen Fluent settings");
        pane.append(frame);
        main.append(pane);

        let pending = "";
        const page = () =>
          frame.contentDocument?.documentElement?.hasAttribute("ready")
            ? frame.contentWindow
            : null;
        const showSection = (id) => {
          const content = page();
          if (!content) {
            pending = id;
          } else if (id && content.location.hash.slice(1) !== id) {
            content.location.hash = id;
          }
        };
        const markSelected = () => {
          // The page shown, which an unknown #hash falls back from
          const id = page()?.document.documentElement.dataset.page;
          for (const item of list.children) {
            item.toggleAttribute("selected", item.dataset.page === id);
          }
          button.toggleAttribute(
            "zf-child-selected",
            subnav.hasAttribute("expanded"),
          );
        };
        const buildSubnav = () => {
          const content = page();
          if (!content) {
            return;
          }
          list.replaceChildren(
            ...(content.zfPages ?? []).map(({ id, title, icon }) => {
              const item = doc.createElementNS(HTML, "button");
              item.type = "button";
              item.className = "zf-subnav-item";
              item.dataset.page = id;
              item.title = t(title);
              const image = doc.createElementNS(HTML, "img");
              image.src = `${ICONS}${icon}.svg`;
              image.alt = "";
              const label = doc.createElementNS(HTML, "span");
              label.textContent = t(title);
              item.append(image, label);
              item.addEventListener("click", () =>
                prefsWin.gotoPref(`${PANE}-${id}`),
              );
              return item;
            }),
          );
          content.addEventListener("zf-route", markSelected);
          content.addEventListener("zf-search-resize", () => fit());
          // A search typed before the page was ready
          if (prefsWin.gSearchResultsPane?.query) {
            onSearch({ detail: prefsWin.gSearchResultsPane.query });
          }
          if (pending) {
            showSection(pending);
            pending = "";
          }
          markSelected();
        };
        // Zen's search: when it is done, the page shows its matching
        // settings (real rows, the words highlighted) and the pane joins the
        // results under its name, as tall as its matches. Firefox hid it (no
        // text of its own matches): shown again here. settings-search.uc.js
        // walks its matches through zfSearchRanges / zfSearchMark, after
        // zf-ss-refresh.
        const heading = doc.createElementNS(HTML, "h2");
        heading.className = "zf-search-heading";
        heading.textContent = "Zen Fluent";
        pane.prepend(heading);
        const onSearch = (event) => {
          const content = page();
          if (!content?.zfSearch) {
            return;
          }
          const query =
            event.detail ?? prefsWin.gSearchResultsPane?.query ?? "";
          const count = content.zfSearch(query);
          pane.toggleAttribute("zf-searching", Boolean(query && count));
          if (query && count) {
            pane.hidden = false;
            pane.classList.remove("visually-hidden");
            const none = doc.getElementById("no-results-message");
            if (none) {
              none.hidden = true;
            }
          }
          fit();
          prefsWin.dispatchEvent(new prefsWin.CustomEvent("zf-ss-refresh"));
        };
        prefsWin.addEventListener("PreferencesSearchCompleted", onSearch);
        pane.zfSearchRanges = () =>
          pane.hasAttribute("zf-searching")
            ? (page()?.zfSearchRanges?.() ?? [])
            : [];
        pane.zfSearchMark = (index) => page()?.zfSearchMark?.(index) ?? null;
        frame.addEventListener("load", () => {
          if (page()) {
            buildSubnav();
          } else {
            frame.contentWindow?.addEventListener(
              "zf-settings-ready",
              buildSubnav,
              { once: true },
            );
          }
        });

        if (!prefsWin.gCategoryInits.has(PANE)) {
          prefsWin.register_module(PANE, {
            init() {},
            // about:preferences#zenFluent-tabs: gotoPref's subcategory
            handleSubcategory: (id) => {
              doc.getElementById("zf-prefs-pane")?.zfShowSection?.(id);
              return true;
            },
          });
        }
        pane.zfShowSection = showSection;
        const fit = () => {
          if (pane.hidden) {
            return;
          }
          // In Zen's search results: as tall as the matches
          if (pane.hasAttribute("zf-searching")) {
            frame.style.height = `${page()?.zfSearchHeight?.() ?? 480}px`;
            return;
          }
          const top = frame.getBoundingClientRect().top + prefsWin.scrollY;
          frame.style.height = `${Math.max(480, prefsWin.innerHeight - top - 12)}px`;
        };
        // Firefox's search() shows a pane by its hidden attribute; paneshown
        // never comes after Sine's pane (gotoPref throws on it)
        const shown = () => {
          // During a search Firefox unhides every pane, visually-hidden;
          // ours shows among the results without its sections
          subnav.toggleAttribute(
            "expanded",
            !pane.hidden &&
              !pane.classList.contains("visually-hidden") &&
              !pane.hasAttribute("zf-searching"),
          );
          markSelected();
          fit();
        };
        const watcher = new prefsWin.MutationObserver(shown);
        watcher.observe(pane, {
          attributes: true,
          attributeFilter: ["hidden", "class", "zf-searching"],
        });
        prefsWin.addEventListener("resize", fit);
        // Firefox's own start replaced an unknown #zenFluent with its default
        const link = hash.match(/^#zenFluent(?:-(\w+))?$/);
        // Sine runs the scripts again after an install or a mod turned on
        // or off: the page was shown, it comes back on the same section
        const back = takeSection(doc);
        if (back !== null) {
          // Firefox still takes our removed pane for the one shown and
          // would skip showing it: another first, in the same tick
          prefsWin.gotoPref("paneGeneral");
          prefsWin.gotoPref(back ? `${PANE}-${back}` : PANE);
        } else if (link) {
          prefsWin.gotoPref(link[1] ? `${PANE}-${link[1]}` : PANE);
        }
        const remove = () => {
          removers.delete(remove);
          prefsWin.removeEventListener("resize", fit);
          prefsWin.removeEventListener("PreferencesSearchCompleted", onSearch);
          watcher.disconnect();
          const visible = !pane.hidden;
          // Read before the frame goes
          const section =
            frame.contentDocument?.documentElement?.dataset.page ?? "";
          button.remove();
          subnav.remove();
          pane.remove();
          sheet.remove();
          if (visible && Services.prefs.getBoolPref(FEATURE, true)) {
            // A rebuild, not the feature turned off: the next run of this
            // script shows it again
            rememberSection(doc, section);
          } else if (visible) {
            prefsWin.gotoPref("paneGeneral");
          }
        };
        removers.add(remove);
        prefsWin.addEventListener("unload", remove, { once: true });
      }

      ctx.observe("document-element-inserted", (doc) => {
        if (isPrefs(doc)) {
          const hash = doc.location.hash;
          doc.addEventListener(
            "DOMContentLoaded",
            () => doc.defaultView.setTimeout(() => addPane(doc, hash), 0),
            { once: true },
          );
        }
      });
      for (const browser of gBrowser.browsers) {
        const doc = browser.isRemoteBrowser ? null : browser.contentDocument;
        if (isPrefs(doc) && doc.readyState !== "loading") {
          addPane(doc);
        }
      }
      ctx.onCleanup(() => {
        for (const remove of [...removers]) {
          remove();
        }
      });

      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyF" &&
            event.ctrlKey &&
            event.altKey &&
            event.shiftKey &&
            !event.metaKey &&
            !event.repeat
          ) {
            event.preventDefault();
            event.stopPropagation();
            open();
          }
        },
        true,
      );
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
