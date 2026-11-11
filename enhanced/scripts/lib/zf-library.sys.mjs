// Zen Fluent Enhanced: a feature's board, as a tab of Zen's Library.
//
// Widgets, Focus and Quick settings used to add a button each to the
// sidebar's bottom row. They now live in the Library (zen-library), one tab
// each: librarySurface() gives the feature a content element, shown in its
// own Library section, or in a panel opened from a button in the bottom row
// while the Library is off (zen.library.enabled). The feature's button stays
// in the document in both cases, hidden in the Library (unless the feature
// asks to keep it, Focus while a session runs), so that the Command Palette
// and the shortcuts keep running it: its command opens the board wherever
// it lives.
//
// Zen 1.24's Library (read in its code): one element in the window from the
// start, with zenLibrarySections, a map from a section id to a class with a
// static id, a static label (a Fluent id) and a static render(library) that
// gives what the content shows. The rail lists Object.values() of the map
// and renders [...mounted ids] (each one looked up in the map) until the
// Library is cleaned up a while after closing: a section taken out of the
// map while mounted must still be found, hence the stand-ins below. Zen's
// own "Choose tabs" hides any tab by id (zen.library.hidden-tabs).
//
// ZenLibraryTweaks (JustAdumbPrsn/ZenLibraryTweaks) replaces the map with a
// Proxy over the tabs it shows, which still resolves (get) the ones removed
// in its edit mode: a section the Proxy resolves without listing it was
// removed there, and is not added back. A map assigned without ours (its
// reordering, when it was set up before us) gets them back at the end. None
// of its code is run here.
//
// Labels come from enhanced/l10n/<locale>/zen-fluent-enhanced.ftl,
// registered once per process as a Fluent source.

const HTML = "http://www.w3.org/1999/xhtml";
const L10N_SOURCE = "zen-fluent-enhanced";
const L10N_FILE = "zen-fluent-enhanced.ftl";
const L10N_PATH = "chrome://sine/content/Zen-Fluent-Enhanced/l10n/{locale}/";
const L10N_LOCALES = ["en-US", "fr", "es"];
const STATE = Symbol.for("zf-library-sections");
const LIBRARY_PREF = "zen.library.enabled";
// The order of our tabs, after Zen's own
const ORDER = ["zf-shelf", "zf-focus", "zf-quick-settings"];
const byOrder = ([a], [b]) => ORDER.indexOf(a) - ORDER.indexOf(b);

function useLabels(doc) {
  const registry = L10nRegistry.getInstance();
  if (!registry.hasSource(L10N_SOURCE)) {
    registry.registerSources([
      new L10nFileSource(L10N_SOURCE, "app", L10N_LOCALES, L10N_PATH),
    ]);
  }
  if (!doc[STATE]) {
    doc[STATE] = true;
    doc.l10n?.addResourceIds([L10N_FILE]);
  }
}

/** The sections Zen Fluent Enhanced adds to this window's Library. */
function stateOf(library) {
  if (library[STATE]) {
    return library[STATE];
  }
  const state = {
    sections: new Map(), // id -> Section
    standIns: new Map(), // id -> Section of a feature that stopped
    map: library.zenLibrarySections,
  };
  const addOurs = (map) => {
    for (const [id, Section] of [...state.sections].sort(byOrder)) {
      // ZenLibraryTweaks' Proxy resolves a section removed in its edit mode
      if (!(id in map) && map[id] === undefined) {
        map[id] = Section;
      }
    }
  };
  // Zen renders mounted sections by looking them up: a section taken out
  // keeps a stand-in until the Library forgets it
  const lookUp = (map) =>
    new Proxy(map, {
      get: (target, id) => target[id] ?? state.standIns.get(id),
    });
  // Features start one by one: ours are put back in their order, unless
  // ZenLibraryTweaks keeps an order of its own (window.gLibraryTweaks)
  state.addOurs = (win) => {
    if (!win.gLibraryTweaks) {
      for (const id of state.sections.keys()) {
        if (state.map[id] === state.sections.get(id)) {
          delete state.map[id];
        }
      }
    }
    addOurs(state.map);
  };
  Object.defineProperty(library, "zenLibrarySections", {
    configurable: true,
    enumerable: true,
    get: () => lookUp(state.map),
    set: (map) => {
      state.map = map;
      addOurs(map);
    },
  });
  library[STATE] = state;
  return state;
}

/** A Library section class whose content is one element per Library. */
function sectionClass(id, label, element) {
  return class {
    static id = id;
    static label = label;
    static render() {
      return element;
    }
  };
}

/**
 * A board for a feature: in a tab of Zen's Library, or in a panel opened
 * from a button in the sidebar's bottom row while the Library is off.
 *
 * @param {object} ctx - The feature's context (lib/zf-feature.sys.mjs).
 * @param {object} spec
 * @param {string} spec.id - The content's id (also the section's).
 * @param {string} spec.label - The board's name (button, panel).
 * @param {string} spec.l10nId - The Library tab's Fluent id.
 * @param {string} spec.icon - The button's image.
 * @param {object} spec.button - The button's other attributes (its id).
 * @param {Function} [spec.onShow] - Called when the board shows.
 * @param {Function} [spec.onHide] - Called when it hides.
 * @param {Function} [spec.keepButton] - True to show the button in the
 *   Library too (call refresh() when it changes).
 * @returns {{content: Element, button: Element, panel: Element,
 *   show: Function, hide: Function, shown: boolean, inLibrary: boolean,
 *   refresh: Function}}
 */
export function librarySurface(ctx, spec) {
  const win = ctx.window;
  const doc = ctx.document;
  const foot = doc.getElementById("zen-sidebar-foot-buttons");
  const library = doc.querySelector("zen-library");
  const Library = win.customElements.get("zen-library");

  const content = doc.createElementNS(HTML, "div");
  content.id = spec.id;
  content.className = "zf-board";
  ctx.onCleanup(() => content.remove());

  const button = ctx.element("toolbarbutton", {
    class: "toolbarbutton-1 chromeclass-toolbar-additional",
    label: spec.label,
    tooltiptext: spec.label,
    image: spec.icon,
    removable: "false",
    skipintoolbarset: "true",
    ...spec.button,
  });
  foot?.insertBefore(button, doc.getElementById("zen-create-new-button"));

  const panel = ctx.element(
    "panel",
    {
      id: `${spec.id}-panel`,
      class: "zf-board-panel",
      type: "arrow",
      role: "dialog",
      "aria-label": spec.label,
      orient: "vertical",
    },
    doc.getElementById("mainPopupSet"),
  );
  ctx.onCleanup(() => panel.hidePopup());
  ctx.listen(panel, "popupshowing", (event) => {
    if (event.target === panel) {
      spec.onShow?.();
    }
  });
  ctx.listen(panel, "popuphidden", (event) => {
    if (event.target === panel) {
      spec.onHide?.();
    }
  });

  // -------- The Library section --------
  const section = doc.createElementNS(HTML, "div");
  section.className = "zen-library-section zf-library-section";
  section.dataset.section = spec.id;
  let showing = false;
  const showSection = () => {
    if (!showing) {
      showing = true;
      spec.onShow?.();
    }
  };
  const hideSection = () => {
    if (showing) {
      showing = false;
      spec.onHide?.();
    }
  };
  // Zen calls these on the section element: onShown / onHidden when its
  // tab is picked or left, onLibraryOpening / -Closing on the one in view
  section.onShown = () => library?.hasAttribute("open") && showSection();
  section.onHidden = hideSection;
  section.onLibraryOpening = showSection;
  section.onLibraryClosing = hideSection;
  const Section = sectionClass(spec.id, spec.l10nId, section);

  const libraryOn = () =>
    !!library && !!Library && Services.prefs.getBoolPref(LIBRARY_PREF, false);

  let inLibrary = false;
  function place() {
    const wanted = libraryOn();
    if (wanted !== inLibrary || !content.parentNode) {
      inLibrary = wanted;
      if (inLibrary) {
        panel.hidePopup();
        section.append(content);
        addSection();
      } else {
        hideSection();
        removeSection();
        panel.append(content);
      }
    }
    button.hidden = inLibrary && !spec.keepButton?.();
  }

  function addSection() {
    useLabels(doc);
    const state = stateOf(library);
    state.standIns.delete(spec.id);
    state.sections.set(spec.id, Section);
    state.addOurs(win);
    library.requestUpdate();
  }

  function removeSection() {
    const state = library?.[STATE];
    if (!state?.sections.has(spec.id)) {
      return;
    }
    state.sections.delete(spec.id);
    const Empty = sectionClass(spec.id, spec.l10nId, section);
    state.standIns.set(spec.id, Empty);
    if (state.map[spec.id] === Section) {
      delete state.map[spec.id];
    }
    if (library.activeTab === spec.id) {
      library.activeTab = Object.keys(state.map)[0];
    }
    library.requestUpdate();
  }

  ctx.onCleanup(() => {
    hideSection();
    removeSection();
  });
  ctx.observePref(LIBRARY_PREF, place);
  place();

  const surface = {
    content,
    button,
    panel,
    get inLibrary() {
      return inLibrary;
    },
    get shown() {
      return inLibrary
        ? !!library.hasAttribute("open") && library.activeTab === spec.id
        : panel.state === "open" || panel.state === "showing";
    },
    show() {
      if (surface.shown) {
        return;
      }
      if (inLibrary) {
        Library.toggle(spec.id);
      } else if (panel.state === "closed") {
        const anchor = button.hidden ? null : button;
        panel.openPopup(anchor, "before_start");
      }
    },
    hide() {
      if (!surface.shown) {
        return;
      }
      if (inLibrary) {
        Library.animateProgress(0);
      } else {
        panel.hidePopup();
      }
    },
    /** Shows or hides the button again (spec.keepButton changed). */
    refresh: place,
  };
  ctx.listen(button, "command", () => surface.show());
  return surface;
}
