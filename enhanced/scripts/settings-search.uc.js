// Zen Fluent Enhanced: Zen's settings search, as Ctrl+F.
//
// Firefox's "Find in Settings" shows the matching settings and highlights
// the words, but gives no way to go from one match to the next, nor says in
// which category each one lives. This adds, beside the search box, a count
// ("3 of 12") with Previous / Next (Enter / Shift+Enter in the box, F3 /
// Shift+F3 in the page): the current match takes the accent and scrolls into
// view. The navigation keeps only the categories with matches, each with
// its count; a click on one goes to its first match instead of leaving the
// search.
// Matches are Firefox's own: the find selection's ranges (the highlighted
// words, shadow trees included) and its search tooltips (a word matched in
// a menu or a button's hidden text); and Zen Fluent's, from its pane shown
// among the results by settings-page.uc.js (zfSearchRanges / zfSearchMark,
// ranges in the pane's frame, refreshed on zf-ss-refresh). Styles: core
// src/content/preferences/search.css (a user sheet, which reaches the
// highlight inside shadow trees).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { t } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs",
  );

  const HTML = "http://www.w3.org/1999/xhtml";
  const ICON =
    "chrome://sine/content/Zen-Fluent-Enhanced/settings/icons/chevron-down.svg";
  const HIGHLIGHT = "zf-ss-current";
  const ZF_PANE = "paneZenFluent";

  const feature = ZFFeature.attach(window, {
    name: "settings-search",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const removers = new Set();
      const isPrefs = (doc) =>
        /^about:(preferences|settings)\b/.test(doc?.documentURI ?? "") &&
        doc.defaultView?.top === doc.defaultView &&
        doc.defaultView.browsingContext?.topChromeWindow === win;

      function attach(doc) {
        const prefsWin = doc.defaultView;
        const search = prefsWin.gSearchResultsPane;
        const input = doc.getElementById("searchInput");
        const container = doc.getElementById("search-container");
        const categories = doc.getElementById("categories");
        const main = doc.getElementById("mainPrefPane");
        if (
          !search ||
          !input ||
          !container ||
          !categories ||
          !main ||
          container.querySelector(".zf-ss-bar")
        ) {
          return;
        }
        const reduced = () =>
          prefsWin.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const make = (tag, attributes = {}) => {
          const node = doc.createElementNS(HTML, tag);
          for (const [name, value] of Object.entries(attributes)) {
            node.setAttribute(name, value);
          }
          return node;
        };

        // -------- The count and its buttons --------
        const bar = make("div", {
          class: "zf-ss-bar",
          role: "group",
          "aria-label": t("Search results"),
        });
        bar.hidden = true;
        const count = make("span", {
          class: "zf-ss-count",
          "aria-live": "polite",
        });
        const arrow = (label, up) => {
          const node = make("button", {
            type: "button",
            class: `zf-ss-button${up ? " zf-ss-up" : ""}`,
            "aria-label": t(label),
            title: t(label),
          });
          node.append(make("img", { src: ICON, alt: "" }));
          return node;
        };
        const previous = arrow("Previous result", true);
        const next = arrow("Next result", false);
        bar.append(count, previous, next);
        container.append(bar);

        let matches = [];
        let index = -1;
        let tooltip = null;

        /** The element a node belongs to, across shadow roots. */
        const elementOf = (node) =>
          node?.nodeType === 1
            ? node
            : (node?.parentElement ?? node?.parentNode?.host ?? null);
        const parentOf = (node) =>
          node.parentElement ?? node.parentNode?.host ?? null;
        /** The category of a match: the pane child of #mainPrefPane it sits in. */
        const categoryOf = (node) => {
          for (let el = elementOf(node); el; el = parentOf(el)) {
            if (el.parentElement === main) {
              return el.dataset?.category ?? el.getAttribute("data-category");
            }
          }
          return null;
        };

        /** Firefox's matches, in reading order. */
        function collect() {
          const found = [];
          try {
            const selection = search.getFindSelection(prefsWin);
            for (let i = 0; i < selection.rangeCount; i++) {
              const range = selection.getRangeAt(i);
              const rect = range.getBoundingClientRect();
              if (rect.width || rect.height) {
                found.push({
                  range,
                  rect,
                  category: categoryOf(range.startContainer),
                });
              }
            }
          } catch (error) {
            console.error("[Zen Fluent Enhanced] settings search", error);
          }
          for (const anchor of search.listSearchTooltips ?? []) {
            const node = anchor.tooltipNode;
            const rect = anchor.getBoundingClientRect();
            if (node && (rect.width || rect.height)) {
              found.push({ anchor, node, rect, category: categoryOf(anchor) });
            }
          }
          // Zen Fluent's matches, in its pane's frame: placed in this page
          const pane = doc.getElementById("zf-prefs-pane");
          const frame = pane?.querySelector("iframe");
          const ranges = pane?.zfSearchRanges?.() ?? [];
          if (frame && ranges.length) {
            const origin = frame.getBoundingClientRect();
            ranges.forEach((range, frameIndex) => {
              const r = range.getBoundingClientRect();
              if (r.width || r.height) {
                found.push({
                  frameIndex,
                  pane,
                  rect: { top: origin.top + r.top, left: origin.left + r.left },
                  category: ZF_PANE,
                });
              }
            });
          }
          found.sort(
            (a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left,
          );
          return found;
        }

        // Firefox's find selection paints over a custom highlight: the
        // current match leaves it while it is current, and comes back after
        let lifted = null;
        const findSelection = () => {
          try {
            return search.getFindSelection(prefsWin);
          } catch {
            return null;
          }
        };

        /** `restore`: false once the search is over (Firefox cleared it). */
        function clearCurrent(restore = true) {
          prefsWin.CSS?.highlights?.delete(HIGHLIGHT);
          if (lifted && restore) {
            try {
              findSelection()?.addRange(lifted);
            } catch {}
          }
          lifted = null;
          tooltip?.removeAttribute("zf-ss-current");
          tooltip = null;
          doc.getElementById("zf-prefs-pane")?.zfSearchMark?.(-1);
        }

        function show(to, scroll = true) {
          if (!matches.length) {
            return;
          }
          index = (to + matches.length) % matches.length;
          clearCurrent();
          const match = matches[index];
          let target = null;
          if (match.pane) {
            target = match.pane.zfSearchMark?.(match.frameIndex);
          } else if (
            match.range &&
            prefsWin.Highlight &&
            prefsWin.CSS?.highlights
          ) {
            try {
              findSelection()?.removeRange(match.range);
              lifted = match.range;
            } catch {}
            prefsWin.CSS.highlights.set(
              HIGHLIGHT,
              new prefsWin.Highlight(match.range),
            );
          } else if (match.node) {
            tooltip = match.node;
            tooltip.setAttribute("zf-ss-current", "");
          }
          count.textContent = t(`${index + 1} of ${matches.length}`);
          if (scroll) {
            target ??= match.range
              ? elementOf(match.range.startContainer)
              : match.anchor;
            target?.scrollIntoView({
              block: "center",
              behavior: reduced() ? "auto" : "smooth",
            });
          }
        }

        // -------- The categories with matches --------
        const badges = [];
        // Every entry of the navigation, its links too (Keyboard Shortcuts,
        // Extensions and themes), which never hold a match
        const navItems = () =>
          [...categories.children].filter(
            (node) => node.localName === "moz-page-nav-button",
          );
        function clearCategories() {
          for (const badge of badges.splice(0)) {
            const button = badge.parentElement;
            badge.remove();
            button?.removeAttribute("zf-ss-hit");
            button?.style.removeProperty("--zf-ss-hit");
          }
          for (const item of navItems()) {
            item.removeAttribute("zf-ss-miss");
          }
          categories.removeAttribute("zf-ss-filtering");
        }
        function markCategories() {
          clearCategories();
          const counts = new Map();
          for (const { category } of matches) {
            if (category) {
              counts.set(category, (counts.get(category) ?? 0) + 1);
            }
          }
          for (const [category, total] of counts) {
            const button = categories.querySelector(`[view="${category}"]`);
            if (!button) {
              continue;
            }
            const badge = make("span", { class: "zf-ss-badge" });
            badge.textContent = String(total);
            button.append(badge);
            button.setAttribute("zf-ss-hit", "");
            // Read inside its shadow tree with @container style()
            button.style.setProperty("--zf-ss-hit", "1");
            badges.push(badge);
          }
          // Only the categories with matches stay in the navigation
          if (counts.size) {
            categories.setAttribute("zf-ss-filtering", "");
            for (const item of navItems()) {
              item.toggleAttribute(
                "zf-ss-miss",
                !counts.has(item.getAttribute("view")),
              );
            }
          }
        }

        function reset() {
          matches = [];
          index = -1;
          // Firefox already cleared its selection when the search ended
          clearCurrent(!!search.query);
          clearCategories();
          bar.hidden = true;
          input.style.removeProperty("--zf-ss-active");
        }

        // Firefox tells when a search is done (its tests wait for it);
        // settings-page.uc.js, when Zen Fluent's pane has its matches
        const onSearch = (event) => {
          const query = event.detail ?? search.query ?? "";
          if (!query) {
            reset();
            return;
          }
          // Its tooltips are placed after a layout flush: read them next tick
          prefsWin.setTimeout(() => {
            if (!query || (search.query ?? "") !== query) {
              return;
            }
            // Firefox drew a new find selection: the lifted range is gone
            clearCurrent(false);
            matches = collect();
            bar.hidden = !matches.length;
            input.style.setProperty(
              "--zf-ss-active",
              matches.length ? "1" : "0",
            );
            markCategories();
            if (matches.length) {
              show(0, false);
            }
          }, 0);
        };
        prefsWin.addEventListener("PreferencesSearchCompleted", onSearch);
        const onRefresh = () => onSearch({ detail: search.query ?? "" });
        prefsWin.addEventListener("zf-ss-refresh", onRefresh);

        const step = (delta) => {
          if (!matches.length) {
            return false;
          }
          show(index + delta);
          return true;
        };
        previous.addEventListener("click", () => step(-1));
        next.addEventListener("click", () => step(1));
        const onInputKey = (event) => {
          if (
            event.key === "Enter" &&
            !event.altKey &&
            !event.ctrlKey &&
            step(event.shiftKey ? -1 : 1)
          ) {
            event.preventDefault();
          }
        };
        input.addEventListener("keydown", onInputKey, true);
        const onPageKey = (event) => {
          if (event.key === "F3" && step(event.shiftKey ? -1 : 1)) {
            event.preventDefault();
            event.stopPropagation();
          }
        };
        prefsWin.addEventListener("keydown", onPageKey, true);
        // A category with matches: to its first match, the search kept
        const onCategory = (event) => {
          const button = event.target?.closest?.("[zf-ss-hit]");
          if (!button || !matches.length || search.query === "") {
            return;
          }
          const first = matches.findIndex(
            (match) => match.category === button.getAttribute("view"),
          );
          if (first < 0) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          show(first);
        };
        categories.addEventListener("click", onCategory, true);

        const remove = () => {
          removers.delete(remove);
          reset();
          bar.remove();
          prefsWin.removeEventListener("PreferencesSearchCompleted", onSearch);
          prefsWin.removeEventListener("zf-ss-refresh", onRefresh);
          prefsWin.removeEventListener("keydown", onPageKey, true);
          input.removeEventListener("keydown", onInputKey, true);
          categories.removeEventListener("click", onCategory, true);
        };
        removers.add(remove);
        prefsWin.addEventListener("unload", remove, { once: true });
        // A search already shown when the feature starts
        if (search.query) {
          onSearch({ detail: search.query });
        }
      }

      ctx.observe("document-element-inserted", (doc) => {
        if (isPrefs(doc)) {
          doc.addEventListener(
            "DOMContentLoaded",
            () => doc.defaultView.setTimeout(() => attach(doc), 0),
            { once: true },
          );
        }
      });
      for (const browser of gBrowser.browsers) {
        const doc = browser.isRemoteBrowser ? null : browser.contentDocument;
        if (isPrefs(doc) && doc.readyState !== "loading") {
          attach(doc);
        }
      }
      ctx.onCleanup(() => {
        for (const remove of [...removers]) {
          remove();
        }
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
