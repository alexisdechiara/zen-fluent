// Zen Fluent Enhanced: about:zen-fluent, the settings page.
//
// Builds every page from the mods' own preferences.json files, so a new
// setting shows here as soon as Sine's dialog has it: Zen Fluent's groups
// (each starts at its zen-fluent.ui.open-<group> header), Zen Fluent
// Enhanced's features with their options, and the presets of
// quick-settings.json. Controls write the prefs directly (the page runs
// with the system principal); every value is watched, so a change made
// elsewhere (Sine, Quick Settings, a shortcut) shows at once. A text
// setting also asks Sine to rebuild its CSS variables, which it only does
// on its own for changes made in its dialog. Presets and resets can be
// undone from the toast they show.

const { AppConstants } = ChromeUtils.importESModule(
  "resource://gre/modules/AppConstants.sys.mjs",
);

const BASE = "chrome://sine/content/";
const SOURCES = {
  core: `${BASE}Zen-Fluent/core/preferences.json`,
  enhanced: `${BASE}Zen-Fluent-Enhanced/preferences.json`,
  quick: `${BASE}Zen-Fluent-Enhanced/quick-settings.json`,
  coreTheme: `${BASE}Zen-Fluent/theme.json`,
  enhancedTheme: `${BASE}Zen-Fluent-Enhanced/theme.json`,
  mods: `${BASE}Zen-Fluent-Enhanced/settings/compatible-mods.json`,
};
const SINE_UTILS = "chrome://userscripts/content/core/utils.sys.mjs";
const DOCS = "https://github.com/alexisdechiara/zen-fluent/blob/main/docs";
// What you changed here, for Overview's Recently changed and Most used
const ACTIVITY = "zen-fluent.enhanced.settings-page.activity";
// Overview's suggestions before you change anything
const SUGGESTED = [
  "zen-fluent.density",
  "zen-fluent.essentials.selected-style",
  "zen-fluent.tab-pill",
  "zen-fluent.url-underline",
  "zen-fluent.corner-radius",
  "zen-fluent.tab-switch-animation",
];
const SINE_STYLES = "chrome://userscripts/content/services/stylesheets.sys.mjs";
const REPO = "https://github.com/alexisdechiara/zen-fluent";
const FEATURE_ICONS = `${BASE}Zen-Fluent-Enhanced/icons/fluent/`;
const SCHEME = "zen.view.window.scheme";
// The page lives in Zen's settings (about:preferences#zenFluent), in an
// iframe: Zen's navigation lists its sections (window.zfPages) and Zen's
// search finds its settings (window.zfIndex, window.zfReveal). Opened on its
// own, it sends the tab there.
const EMBED = new URLSearchParams(location.search).has("embed");
const PLATFORM =
  { win: "windows", macosx: "macos", linux: "linux" }[AppConstants.platform] ??
  AppConstants.platform;

const GROUPS = {
  appearance: { icon: "paint-brush" },
  sidebar: { icon: "panel-left" },
  essentials: { icon: "apps" },
  extensions: { icon: "puzzle-piece" },
  variants: { icon: "shapes", layout: "variants" },
  tabs: { icon: "tab-desktop" },
  urlbar: { icon: "globe-search" },
  window: { icon: "window" },
  animations: { icon: "flash" },
  zones: { icon: "layer", layout: "grid" },
  zen: { icon: "settings" },
};
// Icons of the Enhanced features, from the icon picker's Fluent set
const FEATURES = {
  "settings-page": "apps",
  "quick-settings": "wrench",
  "favicon-color": "color",
  "adaptive-accent": "paint-brush",
  "site-color": "drop",
  "space-settings": "design-ideas",
  welcome: "hand-wave",
  "mod-defaults": "checkbox-checked",
  "extensions-below-essentials": "puzzle-piece",
  "tab-numbers": "tag",
  shortcuts: "flash",
  "tab-archive": "archive",
  "pdf-viewer": "document",
  "web-controls": "globe",
  "browsing-stats": "data-bar-vertical",
  "folder-colors": "folder",
  "icon-picker": "emoji",
  "hover-cards": "image",
  glance: "lightbulb",
  breadcrumbs: "map",
  "command-palette": "window-console",
  "shortcut-overlay": "clipboard",
  "snap-layouts": "grid",
  "tab-switcher": "shapes",
  "boost-extras": "rocket",
  performance: "timer",
  "tab-notes": "note",
  "ai-controls": "shield",
  "ai-chat": "bot",
  "focus-session": "target",
  shelf: "box",
  "start-page": "home",
  "quick-window": "desktop",
};
// The Home page's shortcuts to the main choices
const EXPERT = "zen-fluent.expert";
const HOME = {
  style: "zen-fluent.style",
  material: "zen-fluent.material",
  accent: "zen-fluent.accent",
  accentCustom: "zen-fluent.accent-custom",
};
const ACCENTS = {
  zen: "var(--zen-primary-color, #8b80d8)",
  blue: "#0078d4",
  violet: "#8764b8",
  mint: "#00b294",
  orange: "#ca5010",
  pink: "#e3008c",
  graphite: "#69797e",
};
const MATERIALS = {
  mica: "Opaque, tinted by the desktop wallpaper",
  "mica-alt": "A stronger wallpaper tint, for tabbed windows",
  acrylic: "Translucent: you see what is behind the window",
};

// The French interface (lib/zf-l10n.sys.mjs)
const l10n = ChromeUtils.importESModule(
  `${BASE}Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs`,
);
const $ = (selector, root = document) => root.querySelector(selector);
const chromeWindow = () =>
  window.browsingContext.topChromeWindow ??
  Services.wm.getMostRecentWindow("navigator:browser");

/** An element: el("div.card.big", { title: "…" }, child, "text"…). */
function el(spec, attributes = {}, ...children) {
  const [tag, ...classes] = spec.split(".");
  const node = document.createElement(tag || "div");
  if (classes.length) {
    node.className = classes.join(" ");
  }
  for (const [name, value] of Object.entries(attributes ?? {})) {
    if (value === false || value === null || value === undefined) {
      continue;
    }
    if (name.startsWith("on")) {
      node.addEventListener(name.slice(2), value);
    } else {
      node.setAttribute(name, value === true ? "" : value);
    }
  }
  node.append(...children.flat().filter((c) => c !== null && c !== false));
  return node;
}
const icon = (name, base = "icons/") =>
  el("img.icon", { src: `${base}${name}.svg`, alt: "" });

/** "Title ~description~" → { title, description } (Sine's label syntax). */
function splitLabel(label = "") {
  const description = label.match(/~([^~]*)~/)?.[1].trim() ?? "";
  return {
    title: label.replace(/\s*~[^~]*~\s*/g, " ").trim(),
    description,
  };
}

// -------- Prefs --------

/** True while settings per space are on: a space's overrides aside, the
    page edits your own values (lib/zf-spaces.sys.mjs, the base). */
function perSpace(property) {
  try {
    return (
      Services.prefs.getBoolPref(SPACE_FEATURE, true) &&
      spaces().overridable(property)
    );
  } catch {
    return false;
  }
}

function read(pref) {
  const { property, type, defaultValue } = pref;
  if (perSpace(property)) {
    return spaces().baseValue(property) ?? defaultValue;
  }
  try {
    if (type === "checkbox") {
      return Services.prefs.getBoolPref(property, defaultValue);
    }
    if (type === "int") {
      return Services.prefs.getIntPref(property, defaultValue);
    }
    return Services.prefs.getStringPref(property, defaultValue);
  } catch {
    return defaultValue;
  }
}

let sineTimer = 0;
/** Sine only rebuilds a text setting's :root variable from its dialog. */
function rebuildSine() {
  clearTimeout(sineTimer);
  sineTimer = setTimeout(async () => {
    try {
      await ChromeUtils.importESModule(SINE_STYLES).default.rebuildMods(false);
      // The custom accent reaches the window only now
      setTimeout(syncAccent, 100);
    } catch (error) {
      console.warn("[Zen Fluent] Sine could not rebuild its variables", error);
    }
  }, 250);
}

function write(pref, value) {
  if (perSpace(pref.property)) {
    spaces().setBase(pref.property, value);
    return;
  }
  try {
    if (pref.type === "checkbox") {
      Services.prefs.setBoolPref(pref.property, value);
    } else if (pref.type === "int") {
      Services.prefs.setIntPref(pref.property, value);
    } else {
      Services.prefs.setStringPref(pref.property, value);
      if (pref.type === "string") {
        rebuildSine();
      }
    }
  } catch (error) {
    console.error(`[Zen Fluent] cannot set ${pref.property}`, error);
  }
}

function activity() {
  try {
    return JSON.parse(Services.prefs.getStringPref(ACTIVITY, "{}"));
  } catch {
    return {};
  }
}

/** A setting changed from its control: recent first, and one more use. */
function change(pref, value) {
  write(pref, value);
  // Recently changed and Most used are Zen Fluent's, not other mods'
  if (pref.property === SCHEME || !model.prefs.has(pref.property)) {
    return;
  }
  const data = activity();
  data.recent = [
    pref.property,
    ...(data.recent ?? []).filter((p) => p !== pref.property),
  ].slice(0, 12);
  data.counts = data.counts ?? {};
  data.counts[pref.property] = (data.counts[pref.property] ?? 0) + 1;
  Services.prefs.setStringPref(ACTIVITY, JSON.stringify(data));
}

/** Back to the default. A text setting keeps a value, for Sine's variable. */
function reset(pref) {
  if (pref.type === "string") {
    write(pref, pref.defaultValue);
  } else {
    clear(pref);
  }
}

/** No user value: the default shows. */
function clear(pref) {
  if (perSpace(pref.property)) {
    spaces().setBase(pref.property, null);
  } else {
    Services.prefs.clearUserPref(pref.property);
  }
}

const isDefault = (pref) => read(pref) === pref.defaultValue;

/** What to put back for Undo: each pref's user value, or none. */
function snapshot(prefs) {
  return prefs.map((pref) => ({
    pref,
    had: perSpace(pref.property)
      ? spaces().baseValue(pref.property) !== null
      : Services.prefs.prefHasUserValue(pref.property),
    value: read(pref),
  }));
}
function restore(saved) {
  for (const { pref, had, value } of saved) {
    if (had || pref.type === "string") {
      write(pref, value);
    } else {
      clear(pref);
    }
  }
}

// Watchers: functions to call when a pref changes, dropped with their view
const watchers = new Map();
let viewWatchers = new Set();
function watch(property, fn, { always = false } = {}) {
  const entry = { property, fn };
  if (!watchers.has(property)) {
    watchers.set(property, new Set());
  }
  watchers.get(property).add(entry);
  if (!always) {
    viewWatchers.add(entry);
  }
}
function dropViewWatchers() {
  for (const entry of viewWatchers) {
    watchers.get(entry.property)?.delete(entry);
  }
  viewWatchers = new Set();
}
const observer = {
  observe(_subject, _topic, property) {
    for (const entry of watchers.get(property) ?? []) {
      entry.fn();
    }
    // Your own values of the settings spaces override live there too
    if (property === SPACE_DATA) {
      for (const { property: setting } of spaces().SETTINGS) {
        if (setting !== property) {
          for (const entry of watchers.get(setting) ?? []) {
            entry.fn();
          }
        }
      }
    }
    for (const fn of anyChange) {
      fn(property);
    }
  },
};
const anyChange = new Set();
const observed = new Set();
function observePrefs(properties) {
  for (const property of properties) {
    if (!observed.has(property)) {
      observed.add(property);
      Services.prefs.addObserver(property, observer);
    }
  }
}
window.addEventListener("unload", () => {
  for (const property of observed) {
    Services.prefs.removeObserver(property, observer);
  }
});

// -------- Data --------

const model = {
  groups: [],
  features: [],
  presets: [],
  prefs: new Map(),
  versions: {},
};

function conditionsMet(pref) {
  return (pref.conditions ?? []).every((condition) => {
    const test = condition.if ?? condition.not;
    const other =
      model.prefs.get(test?.property) ?? modPrefs.get(test?.property);
    let value;
    try {
      value = other
        ? read(other)
        : typeof test?.value === "boolean"
          ? Services.prefs.getBoolPref(test.property, false)
          : typeof test?.value === "number"
            ? Services.prefs.getIntPref(test.property, 0)
            : Services.prefs.getStringPref(test?.property, "");
    } catch {
      value = undefined;
    }
    const met = value === test?.value;
    return condition.not ? !met : met;
  });
}

async function load() {
  const entries = await Promise.all(
    Object.entries(SOURCES).map(async ([key, url]) => {
      try {
        return [key, await (await fetch(url)).json()];
      } catch {
        return [key, null];
      }
    }),
  );
  const data = Object.fromEntries(entries);
  let group = null;
  for (const raw of data.core ?? []) {
    if (!raw.property || raw.property === "zen-fluent.ui.expand-all") {
      continue;
    }
    const open = raw.property.match(/^zen-fluent\.ui\.open-(.+)$/);
    if (open) {
      group = {
        id: open[1],
        ...splitLabel(raw.label),
        ...(GROUPS[open[1]] ?? { icon: "settings" }),
        items: [],
      };
      model.groups.push(group);
      continue;
    }
    if (!group || raw.disabledOn?.includes(PLATFORM)) {
      continue;
    }
    const pref = { ...raw, ...splitLabel(raw.label), group };
    // The expert mode's switch lives on Overview, not in its group
    if (pref.property !== EXPERT) {
      group.items.push(pref);
    }
    model.prefs.set(pref.property, pref);
  }
  const features = new Map();
  for (const raw of data.enhanced ?? []) {
    const name = raw.property.match(/^zen-fluent\.enhanced\.([a-z0-9-]+)/)[1];
    const pref = { ...raw, ...splitLabel(raw.label) };
    model.prefs.set(pref.property, pref);
    if (raw.property === `zen-fluent.enhanced.${name}`) {
      features.set(name, { name, pref, options: [] });
    } else {
      features.get(name)?.options.push({ ...pref, parent: name });
    }
  }
  model.features = [...features.values()];
  model.presets = data.quick?.presets ?? [];
  model.mods = data.mods?.mods ?? [];
  model.featured = data.mods?.featured ?? [];
  model.versions = {
    core: data.coreTheme?.version,
    enhanced: data.enhancedTheme?.version,
  };
  model.prefs.set(SCHEME, {
    property: SCHEME,
    type: "int",
    defaultValue: 2,
    title: "Mode",
  });
  observePrefs([...model.prefs.keys(), SPACE_DATA]);
}

// -------- The accent, as the browser window shows it --------

function syncAccent() {
  const win = chromeWindow();
  if (!win) {
    return;
  }
  const style = win.getComputedStyle(win.document.documentElement);
  const root = document.documentElement.style;
  for (const name of [
    "accent",
    "accent-hover",
    "accent-pressed",
    "on-accent",
  ]) {
    const value = style.getPropertyValue(`--zf-${name}`).trim();
    if (value) {
      root.setProperty(`--page-${name}`, value);
    }
  }
  const primary = style.getPropertyValue("--zen-primary-color").trim();
  if (primary) {
    root.setProperty("--zen-primary-color", primary);
  }
}
// The window's CSS follows a pref change on its next style flush
anyChange.add(() => requestAnimationFrame(() => setTimeout(syncAccent, 50)));
window.addEventListener("focus", syncAccent);

// -------- Toast --------

let toastTimer = 0;
function toast(text, action) {
  const box = $("#toast");
  box.replaceChildren(
    el("span.toast-text", {}, text),
    action
      ? el(
          "button.toast-action",
          {
            onclick: () => {
              action.run();
              box.removeAttribute("shown");
            },
          },
          action.label,
        )
      : null,
  );
  box.setAttribute("shown", "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => box.removeAttribute("shown"),
    action ? 10000 : 2500,
  );
}

// -------- Controls --------

let uid = 0;

function toggle(pref, labelledBy) {
  const button = el("button.switch", {
    role: "switch",
    "aria-labelledby": labelledBy,
    onclick: () => change(pref, !read(pref)),
  });
  button.append(el("span.knob"));
  const state = el("span.switch-state", { "aria-hidden": "true" });
  const update = () => {
    const on = read(pref);
    button.setAttribute("aria-checked", on);
    state.textContent = on ? "On" : "Off";
  };
  update();
  watch(pref.property, update);
  return el("span.toggle", {}, state, button);
}

function combo(pref, labelledBy) {
  const select = el("select.combo", {
    "aria-labelledby": labelledBy,
    onchange: () => change(pref, select.value),
  });
  for (const option of pref.options ?? []) {
    select.append(el("option", { value: option.value }, option.label));
  }
  const update = () => (select.value = read(pref));
  update();
  watch(pref.property, update);
  return select;
}

// What a text setting accepts, checked before it is written
const VALIDATE = {
  "zen-fluent.accent-custom": (v) => CSS.supports("color", v),
  "zen-fluent.corner-radius-custom": (v) =>
    /px$/.test(v) && CSS.supports("width", v),
  "zen-fluent.acrylic-blur-custom": (v) =>
    /px$/.test(v) && CSS.supports("width", v),
  "zen-fluent.tint-opacity-custom": (v) => /^\d{1,3}(\.\d+)?%$/.test(v),
};

function text(pref, labelledBy) {
  const valid = VALIDATE[pref.property] ?? (() => true);
  const input = el("input.textbox", {
    type: "text",
    spellcheck: "false",
    "aria-labelledby": labelledBy,
    placeholder: pref.defaultValue || "Name",
  });
  const commit = () => {
    const value = input.value.trim();
    if (value && !valid(value)) {
      input.setAttribute("aria-invalid", "true");
      return;
    }
    input.removeAttribute("aria-invalid");
    if (value !== read(pref)) {
      change(pref, value);
    }
  };
  input.addEventListener("change", commit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      commit();
    } else if (event.key === "Escape") {
      input.value = read(pref);
      input.removeAttribute("aria-invalid");
    }
  });
  const parts = [input];
  if (pref.property === HOME.accentCustom) {
    const picker = el("input.color-picker", {
      type: "color",
      "aria-label": "Pick a color",
      oninput: () => {
        input.value = picker.value;
        commit();
      },
    });
    parts.unshift(picker);
    watch(pref.property, () => {
      if (/^#[0-9a-f]{6}$/i.test(read(pref))) {
        picker.value = read(pref);
      }
    });
    if (/^#[0-9a-f]{6}$/i.test(read(pref))) {
      picker.value = read(pref);
    }
  }
  const update = () => {
    if (document.activeElement !== input) {
      input.value = read(pref);
    }
  };
  update();
  watch(pref.property, update);
  return el("span.text-field", {}, parts);
}

function control(pref, labelledBy) {
  if (pref.type === "checkbox") {
    return toggle(pref, labelledBy);
  }
  if (pref.type === "dropdown") {
    return combo(pref, labelledBy);
  }
  return text(pref, labelledBy);
}

/** The "back to default" button and dot of a row. */
function resetButton(prefs, row) {
  const button = el(
    "button.icon-button.reset",
    {
      title: "Back to default",
      "aria-label": "Back to default",
      onclick: () => {
        const saved = snapshot(prefs);
        prefs.forEach(reset);
        toast("Back to default", { label: "Undo", run: () => restore(saved) });
      },
    },
    icon("arrow-reset"),
  );
  const update = () => row.toggleAttribute("modified", !prefs.every(isDefault));
  update();
  for (const pref of prefs) {
    watch(pref.property, update);
  }
  return button;
}

function watchConditions(pref, node) {
  const update = () => (node.hidden = !conditionsMet(pref));
  update();
  for (const condition of pref.conditions ?? []) {
    const property = (condition.if ?? condition.not)?.property;
    if (property) {
      watch(property, update);
    }
  }
}

/** A SettingsCard: title, description, control. */
function settingRow(
  pref,
  { iconName, iconBase, extraClass = "", path = "" } = {},
) {
  const id = `zf-s-${++uid}`;
  const row = el(`div.card.setting${extraClass}`, {
    "data-pref": pref.property,
  });
  if (iconName) {
    row.append(el("span.card-icon", {}, icon(iconName, iconBase)));
  }
  row.append(
    el(
      "div.setting-text",
      {},
      path ? el("span.setting-path", {}, path) : null,
      el("span.setting-title", { id }, pref.title),
      pref.description ? el("span.setting-desc", {}, pref.description) : null,
    ),
  );
  const space = scopeShown ? scopedSpace() : null;
  if (!space) {
    row.append(
      el(
        "div.setting-actions",
        {},
        spaceChips(pref),
        resetButton([pref], row),
        control(pref, id),
      ),
    );
  } else if (perSpace(pref.property)) {
    row.setAttribute("scoped", "");
    row.append(el("div.setting-actions", {}, scopedControl(pref, space, id)));
  } else {
    // A setting every space shares, shown but not editable for one space
    row.setAttribute("unscoped", "");
    row.title = "The same in every space";
    row.append(el("div.setting-actions", { inert: true }, control(pref, id)));
  }
  watchConditions(pref, row);
  return row;
}

// -------- The preview window --------

/** A small browser window drawn with the given Zen Fluent values. */
function preview(values = {}) {
  const tabs = ["Fluent Design", "Release notes", "Inbox (3)", "Weather"];
  const node = el(
    "div.mock",
    { "aria-hidden": "true" },
    el(
      "div.mock-window",
      {},
      el(
        "div.mock-sidebar",
        {},
        el("div.mock-caption", {}, el("i"), el("i"), el("i")),
        el("div.mock-url", {}, el("span.mock-url-text")),
        el("div.mock-ext", {}, el("i"), el("i"), el("i"), el("i")),
        el(
          "div.mock-essentials",
          {},
          ["#e81123", "#0078d4", "#107c10", "#ffb900"].map((color, i) =>
            el("i", { style: `--tile: ${color}`, selected: i === 1 }),
          ),
        ),
        el(
          "div.mock-tabs",
          {},
          tabs.map((title, i) =>
            el(
              "div.mock-tab",
              { selected: i === 0 },
              el("i"),
              el("span", {}, title),
            ),
          ),
        ),
        el(
          "div.mock-ext.mock-ext-bottom",
          {},
          el("i"),
          el("i"),
          el("i"),
          el("i"),
        ),
      ),
      el(
        "div.mock-page",
        {},
        el("div.mock-hero"),
        el("div.mock-line"),
        el("div.mock-line.short"),
        el("div.mock-cards", {}, el("i"), el("i"), el("i")),
      ),
    ),
  );
  setPreview(node, values);
  return node;
}

const PREVIEWED = {
  style: "zen-fluent.style",
  material: "zen-fluent.material",
  corners: "zen-fluent.corners",
  density: "zen-fluent.density",
  essentials: "zen-fluent.essentials.selected-style",
  "essentials-color": "zen-fluent.essentials.selected-color",
  align: "zen-fluent.essentials.align",
  running: "zen-fluent.essentials.running",
  extensions: "zen-fluent.extensions.position",
  fill: "zen-fluent.variant.global",
  shape: "zen-fluent.variant.global-shape",
  pill: "zen-fluent.tab-pill",
};

function setPreview(node, values = {}) {
  for (const [key, property] of Object.entries(PREVIEWED)) {
    const pref = model.prefs.get(property);
    const value = property in values ? values[property] : pref && read(pref);
    node.dataset[key.replace(/-(.)/g, (_, c) => c.toUpperCase())] = value ?? "";
  }
}

function livePreview() {
  const node = preview();
  watch("*", () => setPreview(node));
  return node;
}
// "*": every pref the preview reads
anyChange.add((property) => {
  if (Object.values(PREVIEWED).includes(property)) {
    for (const entry of watchers.get("*") ?? []) {
      entry.fn();
    }
  }
});

// -------- Pages --------

const pages = [];
let current = null;

function pageHeader(page, ...actions) {
  return el(
    "header.page-header",
    {},
    el(
      "div.page-titles",
      {},
      el("h1.page-title", {}, page.title),
      page.description ? el("p.page-desc", {}, page.description) : null,
    ),
    actions.length ? el("div.page-actions", {}, actions) : null,
  );
}

/** "Reset this page": a second click within 3 s confirms. */
function resetPageButton(prefs, label = "Reset this page") {
  const button = el(
    "button.button",
    {},
    icon("arrow-reset"),
    el("span", {}, label),
  );
  let armed = 0;
  button.addEventListener("click", () => {
    if (!armed) {
      button.lastChild.textContent = "Click again to reset";
      button.classList.add("danger");
      armed = setTimeout(() => {
        armed = 0;
        button.lastChild.textContent = label;
        button.classList.remove("danger");
      }, 3000);
      return;
    }
    clearTimeout(armed);
    armed = 0;
    const saved = snapshot(prefs);
    prefs.forEach(reset);
    button.lastChild.textContent = label;
    button.classList.remove("danger");
    toast("Settings reset", { label: "Undo", run: () => restore(saved) });
  });
  return button;
}

function section(title, ...children) {
  return el(
    "section.section",
    {},
    title ? el("h2.section-title", {}, title) : null,
    ...children,
  );
}

/** A section whose settings flow in columns on a wide window. */
function columns(node) {
  node.classList.add("columns");
  return node;
}

function stagger(nodes) {
  nodes.forEach((node, i) => node.style.setProperty("--i", Math.min(i, 14)));
  return nodes;
}

// Home
function presetMatches(preset) {
  return Object.entries(preset.prefs).every(
    ([property, value]) =>
      !model.prefs.has(property) || read(model.prefs.get(property)) === value,
  );
}

function applyPreset(preset) {
  const prefs = Object.keys(preset.prefs)
    .map((property) => model.prefs.get(property))
    .filter(Boolean);
  const saved = snapshot(prefs);
  for (const pref of prefs) {
    write(pref, preset.prefs[pref.property]);
  }
  toast(`${preset.name} applied`, { label: "Undo", run: () => restore(saved) });
}

function presetCard(preset) {
  const card = el(
    "button.preset",
    {
      onclick: () => applyPreset(preset),
      "aria-pressed": "false",
      "data-pref": `preset:${preset.id}`,
    },
    el("div.preset-art", {}, preview(preset.prefs)),
    el(
      "span.preset-text",
      {},
      el("span.preset-name", {}, preset.name, icon("checkmark")),
      el("span.preset-desc", {}, preset.description),
    ),
  );
  const update = () => card.setAttribute("aria-pressed", presetMatches(preset));
  update();
  for (const property of Object.keys(preset.prefs)) {
    watch(property, update);
  }
  return card;
}

function optionLabel(property) {
  const pref = model.prefs.get(property);
  if (!pref) {
    return "";
  }
  const value = read(pref);
  return pref.options?.find((o) => o.value === value)?.label ?? String(value);
}

function choiceTiles(property, describe, art) {
  const pref = model.prefs.get(property);
  if (!pref) {
    return null;
  }
  const tiles = el("div.tiles", {
    role: "radiogroup",
    "aria-label": pref.title,
  });
  for (const option of pref.options) {
    const tile = el(
      "button.tile",
      {
        role: "radio",
        onclick: () => change(pref, option.value),
      },
      art?.(option.value),
      el(
        "span.tile-text",
        {},
        el("span.tile-name", {}, option.label),
        describe?.[option.value]
          ? el("span.tile-desc", {}, describe[option.value])
          : null,
      ),
    );
    tile.dataset.value = option.value;
    tiles.append(tile);
  }
  const update = () => {
    for (const tile of tiles.children) {
      tile.setAttribute("aria-checked", tile.dataset.value === read(pref));
    }
  };
  update();
  watch(property, update);
  return tiles;
}

function modeTiles() {
  const pref = model.prefs.get(SCHEME);
  const modes = [
    [1, "Light", "weather-sunny"],
    [0, "Dark", "weather-moon"],
    [2, "Automatic", "dark-theme"],
  ];
  const tiles = el("div.segmented", {
    role: "radiogroup",
    "aria-label": "Mode",
  });
  for (const [value, label, name] of modes) {
    const button = el(
      "button.segment",
      { role: "radio", onclick: () => change(pref, value) },
      icon(name),
      el("span", {}, label),
    );
    button.dataset.value = value;
    tiles.append(button);
  }
  const update = () => {
    for (const button of tiles.children) {
      button.setAttribute(
        "aria-checked",
        Number(button.dataset.value) === read(pref),
      );
    }
  };
  update();
  watch(SCHEME, update);
  return tiles;
}

function accentSwatches() {
  const pref = model.prefs.get(HOME.accent);
  if (!pref) {
    return null;
  }
  const row = el("div.swatches", {
    role: "radiogroup",
    "aria-label": "Accent color",
  });
  for (const option of pref.options) {
    const color =
      option.value === "system"
        ? "AccentColor"
        : option.value === "custom"
          ? "conic-gradient(from 90deg, #e81123, #ffb900, #107c10, #0078d4, #8764b8, #e81123)"
          : ACCENTS[option.value];
    const swatch = el("button.swatch", {
      role: "radio",
      title: option.label,
      "aria-label": option.label,
      style: `--swatch: ${color}`,
      onclick: () => change(pref, option.value),
    });
    swatch.dataset.value = option.value;
    row.append(swatch);
  }
  const update = () => {
    for (const swatch of row.children) {
      swatch.setAttribute("aria-checked", swatch.dataset.value === read(pref));
    }
  };
  update();
  watch(HOME.accent, update);
  return row;
}

function iconsWarning() {
  const pref = model.prefs.get("svg.context-properties.content.enabled");
  if (!pref) {
    return null;
  }
  const bar = el(
    "div.infobar.caution",
    { role: "alert" },
    icon("warning"),
    el(
      "div.infobar-text",
      {},
      el("strong", {}, "The mod's icons are hidden"),
      el(
        "span",
        {},
        "Firefox only draws them with Allow the mod's icons on. Zen keeps its own icons until then.",
      ),
    ),
    el("button.button.accent", { onclick: () => write(pref, true) }, "Turn on"),
  );
  const update = () => (bar.hidden = read(pref));
  update();
  watch(pref.property, update);
  return bar;
}

function renderOverview(page) {
  const art = livePreview();
  const hero = el(
    "div.hero",
    {},
    el("div.hero-wallpaper", { "aria-hidden": "true" }),
    el("div.hero-art", {}, art),
    el(
      "div.hero-text",
      {},
      el("p.hero-kicker", {}, "Your Zen, in Fluent"),
      el("h1.hero-title", {}, "Zen Fluent"),
      el(
        "p.hero-desc",
        {},
        "Mica, Mica Alt, Acrylic and WinUI 3 controls, or the Microsoft Edge look. Every change applies at once.",
      ),
      el(
        "div.hero-actions",
        {},
        el(
          "button.button.accent",
          { onclick: () => go("themes") },
          "Browse themes",
        ),
        el("button.button", { onclick: () => go("appearance") }, "Customize"),
        el(
          "button.hero-link",
          { onclick: () => openLink(REPO) },
          el("span", {}, "Project page"),
          icon("arrow-right"),
        ),
      ),
    ),
  );
  // A slight tilt that follows the pointer
  hero.addEventListener("pointermove", (event) => {
    const box = hero.getBoundingClientRect();
    hero.style.setProperty(
      "--tilt-x",
      ((event.clientX - box.left) / box.width - 0.5).toFixed(3),
    );
    hero.style.setProperty(
      "--tilt-y",
      ((event.clientY - box.top) / box.height - 0.5).toFixed(3),
    );
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.removeProperty("--tilt-x");
    hero.style.removeProperty("--tilt-y");
  });

  const materialArt = (value) =>
    el("span.tile-art.material", { "data-material": value }, el("i"));

  const customRow = model.prefs.get(HOME.accentCustom)
    ? settingRow(model.prefs.get(HOME.accentCustom))
    : null;

  // Expert mode: every setting, and a custom value for each length
  const expert = model.prefs.get(EXPERT)
    ? settingRow(model.prefs.get(EXPERT), {
        iconName: "wrench",
        iconBase: FEATURE_ICONS,
      })
    : null;

  return [
    hero,
    iconsWarning(),
    ...recommendations(),
    section(
      "Material",
      el(
        "div.card.panel",
        {},
        choiceTiles(HOME.material, MATERIALS, materialArt),
      ),
    ),
    section(
      "Colors",
      el(
        "div.card.panel.colors",
        {},
        el(
          "div.colors-row",
          {},
          el(
            "div.setting-text",
            {},
            el("span.setting-title", {}, "Mode"),
            el("span.setting-desc", {}, "Zen's light or dark window"),
          ),
          modeTiles(),
        ),
        el(
          "div.colors-row",
          {},
          el(
            "div.setting-text",
            {},
            el("span.setting-title", {}, "Accent color"),
            el(
              "span.setting-desc",
              {},
              "Windows' accent, the space's, or your own",
            ),
          ),
          accentSwatches(),
        ),
      ),
      customRow,
    ),
    section(
      "Expert mode",
      el(
        "p.section-desc",
        {},
        "Shows every setting, the interface style among them (a theme sets it otherwise), and lets you type your own value wherever a setting is a number: gaps, sizes, counts, corners.",
      ),
      expert,
    ),
    ...aboutSections(),
  ];
}

/** Recently changed and Most used, else a few suggestions. */
function recommendations() {
  const data = activity();
  // Variants and the mode have their own pages and controls
  const shown = (property) =>
    model.prefs.get(property)?.group &&
    !property.startsWith("zen-fluent.variant.");
  const recent = (data.recent ?? []).filter(shown).slice(0, 4);
  const used = Object.entries(data.counts ?? {})
    .filter(([property, count]) => count > 1 && shown(property))
    .filter(([property]) => !recent.includes(property))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([property]) => property);
  const row = (property) => {
    const pref = model.prefs.get(property);
    return settingRow(pref, { path: pref.group.title });
  };
  if (!recent.length && !used.length) {
    return [
      section(
        "Suggested for you",
        el(
          "p.section-desc",
          {},
          "Settings people change first. What you change shows up here.",
        ),
        ...SUGGESTED.filter(shown).slice(0, 4).map(row),
      ),
    ];
  }
  return [
    recent.length ? section("Recently changed", ...recent.map(row)) : null,
    used.length ? section("Most used", ...used.map(row)) : null,
  ].filter(Boolean);
}

// -------- Themes --------

function renderThemes() {
  return [
    section(
      "Themes",
      el(
        "p.section-desc",
        {},
        "A theme sets several settings at once: a look, an Essentials style, an extensions layout and a variant. The toast offers Undo.",
      ),
      el("div.preset-grid", { id: "presets" }, model.presets.map(presetCard)),
    ),
    themeFileSection(),
  ];
}

// -------- Mods: Sine's marketplace and the installed mods --------

// What a mod's badge says: the registry's verdict while its check still
// holds (same Zen Fluent major.minor, same mod version), "untested" once it
// no longer does, "unchecked" for a mod the registry does not list
const VERDICTS = {
  works: { label: "Works", icon: "checkmark-circle" },
  partial: { label: "Works with a limit", icon: "warning" },
  untested: { label: "Not tested with this version", icon: "info" },
  unchecked: { label: "Not checked", icon: "info" },
  conflict: { label: "Incompatible", icon: "dismiss-circle" },
  breaks: { label: "Breaks Zen Fluent", icon: "dismiss-circle" },
};
// Sine's marketplace, as its own page reads it (services/marketplace.sys.mjs)
const MARKETPLACE = "https://sineorg.github.io/store/marketplace.json";
const MOD_SORTS = {
  popular: "Most stars",
  updated: "Recently updated",
  name: "Name",
  compatibility: "Compatibility",
};
const VERDICT_ORDER = [
  "works",
  "partial",
  "untested",
  "unchecked",
  "conflict",
  "breaks",
];
// Mods per page of a list: a grid of cards, or rows
const PAGE_SIZE = { cards: 12, list: 20 };
const SINE_MANAGER = "chrome://userscripts/content/core/manager.sys.mjs";
// Zen Fluent and Zen Fluent Enhanced are this page's own mods
const OWN_MODS = new Set(["Zen-Fluent", "Zen-Fluent-Enhanced"]);
// The types this page draws; any other sends the mod's settings to Sine
const MOD_PREF_TYPES = new Set([
  "checkbox",
  "dropdown",
  "string",
  "text",
  "separator",
]);
// Each section's filter and layout, kept for the session's next visits
const MODS_VIEW = "zen-fluent.enhanced.settings-page.mods-view";

const docsAnchor = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/ /g, "-");

// A web page in a new tab: openWebLinkIn() throws on the system principal
function openLink(url) {
  chromeWindow().openWebLinkIn(url, "tab", {
    triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({}),
  });
}

const modPage = (mod) =>
  `https://github.com/${mod.repo}${mod.path ? `/tree/main/${mod.path}` : ""}`;
const minor = (version = "") => version.split(".").slice(0, 2).join(".");

/** The registry's entry for an installed Sine mod, if it has one. */
function registryEntry(installed) {
  const homepage = installed.homepage?.toLowerCase() ?? "";
  return model.mods.find(
    (mod) =>
      mod.id === installed.id ||
      (homepage.includes(mod.repo.toLowerCase()) &&
        (!mod.path || homepage.includes(`/${mod.path.toLowerCase()}`))) ||
      mod.name.toLowerCase() === installed.name?.toLowerCase(),
  );
}

/** The verdict and the sentence under it, for a version of a mod. */
function verdict(mod, version) {
  if (!mod) {
    return {
      key: "unchecked",
      reason: "Not in Zen Fluent's list of checked mods yet.",
    };
  }
  if (mod.status === "conflict" || mod.status === "breaks") {
    return { key: mod.status, reason: mod.summary };
  }
  const tested = mod.tested ?? {};
  if (minor(tested.zenFluent) !== minor(model.versions.core)) {
    return {
      key: "untested",
      reason: `Last checked with Zen Fluent ${tested.zenFluent ?? "?"}; this is ${model.versions.core}.`,
    };
  }
  if (version && tested.version && version !== tested.version) {
    return {
      key: "untested",
      reason: `Checked with version ${tested.version}; this one is ${version}.`,
    };
  }
  return {
    key: mod.status === "partial" ? "partial" : "works",
    reason: mod.summary,
  };
}

function verdictBadge(key) {
  const info = VERDICTS[key];
  return el(
    `span.mod-verdict.${key}`,
    {},
    icon(info.icon),
    el("span", {}, info.label),
  );
}

function modsView() {
  try {
    return JSON.parse(Services.prefs.getStringPref(MODS_VIEW, "{}"));
  } catch {
    return {};
  }
}

/** Search, filter and layout over a list of mods, redrawn on each change. */
function modBrowser(
  name,
  { layout, entries, draw, empty, verdicts = Object.keys(VERDICTS) },
) {
  const saved = modsView()[name] ?? {};
  const state = {
    query: "",
    filter: verdicts.includes(saved.filter) ? saved.filter : "all",
    layout: saved.layout ?? layout,
    sort: saved.sort ?? "popular",
    tag: "all",
    page: 0,
  };
  const save = () => {
    const all = modsView();
    all[name] = {
      filter: state.filter,
      layout: state.layout,
      sort: state.sort,
    };
    Services.prefs.setStringPref(MODS_VIEW, JSON.stringify(all));
  };
  const sort = el("select.combo", {
    "aria-label": "Sort by",
    onchange: () => {
      state.sort = sort.value;
      save();
      restart();
    },
  });
  sort.append(
    ...Object.entries(MOD_SORTS).map(([key, label]) =>
      el("option", { value: key }, label),
    ),
  );
  sort.value = state.sort;
  // The marketplace's tags, filled in once its list is in
  const tag = el("select.combo", {
    "aria-label": "Tag",
    onchange: () => {
      state.tag = tag.value;
      restart();
    },
  });
  let tagsShown = "";
  const body = el("div.mod-items");
  const search = el("input.textbox.mod-search", {
    type: "search",
    placeholder: "Search",
    "aria-label": `Search the ${name === "market" ? "marketplace" : "installed mods"}`,
    oninput: () => {
      state.query = search.value.trim().toLowerCase();
      restart();
    },
  });
  const filter = el("select.combo", {
    "aria-label": "Show",
    onchange: () => {
      state.filter = filter.value;
      save();
      restart();
    },
  });
  filter.append(
    el("option", { value: "all" }, "All"),
    ...verdicts.map((key) => el("option", { value: key }, VERDICTS[key].label)),
  );
  filter.value = state.filter;
  const layoutButton = (value, label, iconName) =>
    el(
      "button.icon-button.mod-layout",
      {
        "data-layout": value,
        title: label,
        "aria-label": label,
        onclick: () => {
          state.layout = value;
          save();
          restart();
        },
      },
      icon(iconName),
    );
  const layouts = el(
    "div.mod-layouts",
    { role: "group", "aria-label": "Display" },
    layoutButton("cards", "Cards", "apps"),
    layoutButton("list", "List", "list"),
  );
  const count = el("span.mod-count", { "aria-live": "polite" });
  // A PipsPager-like row under the list: Previous, the pages, Next
  const pager = el("nav.mod-pager", { "aria-label": "Pages" });
  const node = el(
    "div.mod-browser",
    {},
    el("div.mod-toolbar", {}, search, filter, tag, sort, count, layouts),
    body,
    pager,
  );
  const goTo = (page) => {
    state.page = page;
    redraw();
    node.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const pageButton = (page, current) =>
    el(
      "button.button.mod-page",
      {
        "aria-label": `Page ${page + 1}`,
        "aria-current": current ? "page" : null,
        onclick: () => goTo(page),
      },
      String(page + 1),
    );
  function drawPager(pages) {
    pager.hidden = pages < 2;
    if (pager.hidden) {
      pager.replaceChildren();
      return;
    }
    // The first, the last and the two around the current one; … between
    const numbers = [
      ...new Set([0, state.page - 1, state.page, state.page + 1, pages - 1]),
    ]
      .filter((page) => page >= 0 && page < pages)
      .sort((a, b) => a - b);
    const items = [];
    numbers.forEach((page, i) => {
      if (i && page - numbers[i - 1] > 1) {
        items.push(el("span.mod-page-gap", { "aria-hidden": "true" }, "…"));
      }
      items.push(pageButton(page, page === state.page));
    });
    pager.replaceChildren(
      el(
        "button.icon-button.mod-page-step.previous",
        {
          "aria-label": "Previous page",
          title: "Previous page",
          disabled: state.page === 0,
          onclick: () => goTo(state.page - 1),
        },
        icon("chevron-right"),
      ),
      ...items,
      el(
        "button.icon-button.mod-page-step",
        {
          "aria-label": "Next page",
          title: "Next page",
          disabled: state.page === pages - 1,
          onclick: () => goTo(state.page + 1),
        },
        icon("chevron-right"),
      ),
    );
  }
  // A new search, filter, sort or layout starts from the first page
  function restart() {
    state.page = 0;
    redraw();
  }
  function redraw() {
    const all = entries();
    // the tags several mods share (the marketplace has many one-offs)
    const counts = new Map();
    for (const t of all.flatMap((entry) => [...new Set(entry.tags ?? [])])) {
      counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) ?? 0) + 1);
    }
    const tags = [...counts]
      .filter(([, n]) => n >= 3)
      .map(([t]) => t)
      .sort();
    if (tags.join() !== tagsShown) {
      tagsShown = tags.join();
      tag.replaceChildren(
        el("option", { value: "all" }, "All tags"),
        ...tags.map((t) => el("option", { value: t }, t)),
      );
      tag.value = tags.includes(state.tag) ? state.tag : "all";
      tag.hidden = !tags.length;
    }
    const by = {
      popular: (a, b) => (b.stars ?? -1) - (a.stars ?? -1),
      updated: (a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""),
      name: (a, b) => a.name.localeCompare(b.name),
      compatibility: (a, b) =>
        VERDICT_ORDER.indexOf(a.verdict.key) -
        VERDICT_ORDER.indexOf(b.verdict.key),
    }[state.sort];
    const shown = all
      .filter(
        (entry) =>
          (state.filter === "all" || entry.verdict.key === state.filter) &&
          (state.tag === "all" ||
            entry.tags?.some((t) => t.toLowerCase() === state.tag)) &&
          (!state.query ||
            `${entry.name} ${entry.author} ${entry.summary} ${(entry.tags ?? []).join(" ")}`
              .toLowerCase()
              .includes(state.query)),
      )
      .sort((a, b) => by(a, b) || a.name.localeCompare(b.name));
    for (const button of layouts.children) {
      button.setAttribute(
        "aria-pressed",
        button.dataset.layout === state.layout,
      );
    }
    body.dataset.layout = state.layout;
    count.textContent =
      shown.length === all.length
        ? `${all.length} ${all.length === 1 ? "mod" : "mods"}`
        : `${shown.length} of ${all.length}`;
    const size = PAGE_SIZE[state.layout] ?? PAGE_SIZE.list;
    const pages = Math.ceil(shown.length / size);
    state.page = Math.max(0, Math.min(state.page, pages - 1));
    drawPager(pages);
    body.replaceChildren(
      ...(shown.length
        ? shown
            .slice(state.page * size, (state.page + 1) * size)
            .map((entry) => draw(entry, state.layout))
        : [
            el(
              "p.mod-empty",
              {},
              all.length
                ? "No mod matches."
                : typeof empty === "function"
                  ? empty()
                  : empty,
            ),
          ]),
    );
  }
  redraw();
  return { node, redraw };
}

/** A mod as a card (cards) or a SettingsCard row (list). */
function modItem(entry, layout, actions) {
  const title = el(
    "span.mod-title",
    {},
    el("span.mod-name", { translate: "no" }, entry.name),
    entry.version ? el("span.mod-version", {}, `v${entry.version}`) : null,
  );
  const meta = el(
    "span.mod-meta",
    {},
    [
      // One line: each part translated on its own (lib/zf-l10n.sys.mjs)
      entry.author ? l10n.t(`by ${entry.author}`) : "",
      entry.stars != null ? `★ ${entry.stars.toLocaleString()}` : "",
      entry.updated ? l10n.t(`updated ${entry.updated.slice(0, 10)}`) : "",
      entry.scripts ? l10n.t("runs scripts") : "",
    ]
      .filter(Boolean)
      .join(" · "),
  );
  const reason = el("span.setting-desc", {}, entry.verdict.reason);
  if (layout === "cards") {
    return el(
      `article.card.mod-card.${entry.verdict.key}`,
      { "data-pref": entry.pref ?? "" },
      entry.image
        ? el("img.mod-image", {
            src: entry.image,
            alt: "",
            loading: "lazy",
            referrerpolicy: "no-referrer",
            onerror: (event) => event.currentTarget.remove(),
          })
        : null,
      el("div.mod-card-head", {}, title, verdictBadge(entry.verdict.key)),
      meta,
      el("p.mod-summary", {}, entry.summary || entry.verdict.reason),
      entry.summary && entry.verdict.reason !== entry.summary
        ? el("p.mod-reason", {}, entry.verdict.reason)
        : null,
      el("div.mod-card-actions", {}, ...actions),
    );
  }
  return el(
    `div.card.setting.mod-row.${entry.verdict.key}`,
    { "data-pref": entry.pref ?? "" },
    el("span.card-icon.mod-status", {}, icon(VERDICTS[entry.verdict.key].icon)),
    el(
      "div.setting-text",
      {},
      el("span.setting-title", {}, title, verdictBadge(entry.verdict.key)),
      meta,
      reason,
    ),
    el("div.setting-actions", {}, ...actions),
  );
}

const openButton = (entry) =>
  el(
    "button.icon-button",
    {
      title: "Open its page",
      "aria-label": `${entry.name}: open its page`,
      onclick: () => openLink(entry.page),
    },
    icon("open"),
  );

// -------- A mod's own settings, drawn as Zen Fluent's --------

// The mods' prefs, apart from Zen Fluent's (model.prefs), for conditions
const modPrefs = new Map();

function openInSine() {
  chromeWindow().openPreferences("paneSineMods");
}

/** Its preferences.json, or null when this page cannot draw all of it. */
async function drawableModPrefs(installed) {
  if (!installed.preferences) {
    return null;
  }
  let raw;
  try {
    raw =
      await ChromeUtils.importESModule(SINE_UTILS).default.getModPreferences(
        installed,
      );
  } catch {
    return null;
  }
  const drawable =
    Array.isArray(raw) &&
    raw.length &&
    raw.every(
      (pref) =>
        MOD_PREF_TYPES.has(pref.type) &&
        (pref.type !== "dropdown" ||
          pref.options?.every((option) => typeof option.value === "string")) &&
        (pref.conditions ?? []).every(
          (condition) => condition.if || condition.not,
        ),
    );
  return drawable ? raw : null;
}

async function openModSettings(installed) {
  const raw = await drawableModPrefs(installed);
  if (!raw) {
    openInSine();
    return;
  }
  const rows = [];
  for (const item of raw) {
    if (item.disabledOn?.includes(PLATFORM)) {
      continue;
    }
    const label = splitLabel(item.label ?? "");
    if (item.type === "separator") {
      rows.push(el("h3.mod-dialog-section", {}, label.title));
      continue;
    }
    if (item.type === "text") {
      rows.push(el("p.section-desc", {}, label.title));
      continue;
    }
    const pref = { ...item, ...label };
    modPrefs.set(pref.property, pref);
    observePrefs([pref.property]);
    rows.push(settingRow(pref));
  }
  const dialog = el(
    "dialog.mod-dialog",
    { "aria-label": `${installed.name}: settings` },
    el(
      "div.mod-dialog-header",
      {},
      el("h2.mod-dialog-title", {}, installed.name),
      el(
        "button.icon-button",
        { "aria-label": "Close", onclick: () => dialog.close() },
        icon("dismiss"),
      ),
    ),
    el("div.mod-dialog-content", {}, ...rows),
    el(
      "div.mod-dialog-footer",
      {},
      el(
        "button.button",
        {
          onclick: () => {
            dialog.close();
            openInSine();
          },
        },
        "Open in Sine",
      ),
      el("button.button.accent", { onclick: () => dialog.close() }, "Done"),
    ),
  );
  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

/**
 * Asks before installing a mod that does not work with Zen Fluent (a
 * ContentDialog; Cancel is the default button). Resolves to true to install.
 */
/** A mod's card, opened: what it does, its compatibility, its links. */
function modDetails(entry, primaryAction) {
  const mod = entry.mod;
  const facts = [
    ["Author", entry.author],
    ["Version", entry.version ? `v${entry.version}` : ""],
    ["Updated", entry.updated?.slice(0, 10) ?? ""],
    ["Stars", entry.stars != null ? entry.stars.toLocaleString() : ""],
    ["Scripts", entry.scripts ? "Runs scripts" : ""],
  ].filter(([, value]) => value);
  // The verdict's own words, or the versions it was checked with
  const compatibility =
    entry.verdict.reason && entry.verdict.reason !== entry.summary
      ? entry.verdict.reason
      : mod?.tested
        ? `Checked with Zen Fluent ${mod.tested.zenFluent} and v${mod.tested.version}.`
        : (VERDICTS[entry.verdict.key]?.label ?? "");
  const close = el(
    "button.icon-button",
    { title: "Close", "aria-label": "Close", onclick: () => dialog.close() },
    icon("dismiss"),
  );
  const description =
    entry.description && entry.description !== entry.summary
      ? entry.description
      : "";
  const tone =
    entry.verdict.key === "works"
      ? ""
      : entry.verdict.key === "conflict"
        ? ".critical"
        : ".caution";
  const dialog = el(
    "dialog.mod-dialog.mod-details",
    { "aria-label": entry.name },
    entry.image
      ? el("img.mod-details-image", {
          src: entry.image,
          alt: "",
          referrerpolicy: "no-referrer",
          onerror: (event) => event.currentTarget.remove(),
        })
      : null,
    el(
      "div.mod-dialog-header",
      {},
      el(
        "h2.mod-dialog-title",
        {},
        el("span", { translate: "no" }, entry.name),
        verdictBadge(entry.verdict.key),
      ),
      close,
    ),
    el(
      "div.mod-dialog-content",
      {},
      entry.summary ? el("p.mod-details-summary", {}, entry.summary) : null,
      description
        ? el("p.section-desc", { translate: "no" }, description)
        : null,
      el(
        `div.infobar${tone}`,
        {},
        icon(VERDICTS[entry.verdict.key]?.icon ?? "info"),
        el(
          "div.infobar-text",
          {},
          el("strong", {}, VERDICTS[entry.verdict.key]?.label ?? ""),
          el("span", {}, compatibility),
        ),
      ),
      facts.length
        ? el(
            "dl.mod-details-facts",
            {},
            ...facts.flatMap(([label, value]) => [
              el("dt", {}, label),
              el("dd", {}, value),
            ]),
          )
        : null,
      (entry.tags ?? []).length
        ? el(
            "div.mod-details-tags",
            { translate: "no" },
            ...entry.tags.map((tag) => el("span.mod-tag", {}, tag)),
          )
        : null,
    ),
    el(
      "div.mod-dialog-footer",
      {},
      mod
        ? el(
            "button.button",
            {
              onclick: () =>
                openLink(`${DOCS}/compatibility.md#${docsAnchor(mod.name)}`),
            },
            "Compatibility notes",
          )
        : null,
      entry.page
        ? el(
            "button.button",
            { onclick: () => openLink(entry.page) },
            icon("open"),
            el("span", {}, "GitHub page"),
          )
        : null,
      primaryAction(entry),
    ),
  );
  dialog.addEventListener("close", () => dialog.remove());
  // A click on the backdrop closes it
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  document.body.append(dialog);
  dialog.showModal();
  close.focus();
}

function confirmInstall(name, mod) {
  const breaks = mod.status === "breaks";
  return new Promise((resolve) => {
    let answer = false;
    const cancel = el(
      "button.button.accent",
      { onclick: () => dialog.close() },
      "Cancel",
    );
    const dialog = el(
      "dialog.mod-dialog.mod-confirm",
      { "aria-label": `Install ${name}?` },
      el(
        "div.mod-dialog-header",
        {},
        el("h2.mod-dialog-title", {}, `Install ${name}?`),
      ),
      el(
        "div.mod-dialog-content",
        {},
        el(
          `div.infobar.${breaks ? "critical" : "caution"}`,
          {},
          icon(breaks ? "dismiss-circle" : "warning"),
          el(
            "div.infobar-text",
            {},
            el(
              "strong",
              {},
              breaks
                ? `${name} replaces Zen's whole look`
                : `${name} is incompatible with Zen Fluent`,
            ),
            el("span", {}, mod.summary),
          ),
        ),
        el(
          "p.section-desc",
          {},
          breaks
            ? "With both on, the window is unusable: turn one of them off in Installed right after."
            : "Both style the same parts, so some of them will look wrong while both are on. You can turn one off in Installed.",
        ),
      ),
      el(
        "div.mod-dialog-footer",
        {},
        el(
          "button.button",
          {
            onclick: () => {
              answer = true;
              dialog.close();
            },
          },
          "Install anyway",
        ),
        cancel,
      ),
    );
    dialog.addEventListener("close", () => {
      dialog.remove();
      resolve(answer);
    });
    document.body.append(dialog);
    dialog.showModal();
    cancel.focus();
  });
}

function renderMods() {
  let installedMods = [];
  let manager = null;
  // Sine's marketplace (its own filters: this fork, this system), and each
  // registered mod's latest version from its repository once fetched (the
  // verdict then compares it with the check)
  let store = null;
  const latest = new Map();
  const fits = (data) =>
    (!data.os || data.os.some((os) => os.toLowerCase().includes(PLATFORM))) &&
    (!data.fork ||
      data.fork.some((fork) => fork.toLowerCase().includes("zen"))) &&
    !data.notFork?.some((fork) => fork.toLowerCase().includes("zen"));
  const storeURL = () =>
    (Services.prefs.getBoolPref("sine.allow-external-marketplace", false) &&
      Services.prefs.getStringPref("sine.marketplace-url", "")) ||
    MARKETPLACE;
  /** The registry's entry for a marketplace mod, matched by its homepage. */
  const checkedEntry = (data) =>
    registryEntry({ id: data.id, name: data.name, homepage: data.homepage });
  const installedFor = (data, mod) =>
    installedMods.find(
      (m) =>
        m.id === data?.id ||
        (mod && registryEntry(m) === mod) ||
        (data?.homepage &&
          m.homepage?.toLowerCase() === data.homepage.toLowerCase()),
    );
  const marketEntries = () => {
    const entries = [];
    const listed = new Set();
    for (const data of Object.values(store ?? {})) {
      if (!fits(data) || OWN_MODS.has(data.id)) {
        continue;
      }
      const mod = checkedEntry(data);
      // A whole theme (Nebula, Arc 2.0…) cannot run with Zen Fluent
      if (mod?.status === "breaks") {
        continue;
      }
      if (mod) {
        listed.add(mod);
      }
      const installed = installedFor(data, mod);
      entries.push({
        name: data.name ?? data.id,
        author:
          data.author ??
          data.homepage?.match(/github\.com\/([^/]+)/)?.[1] ??
          "",
        summary: mod?.summary ?? data.description ?? "",
        description: data.description ?? "",
        version: installed?.version ?? data.version,
        latest: data.version,
        verdict: verdict(mod, installed?.version ?? data.version),
        page: data.homepage ?? (mod ? modPage(mod) : ""),
        pref: mod ? `mod:${mod.name}` : `store:${data.id}`,
        image: data.image,
        stars: data.stars,
        updated: data.updatedAt ?? data.createdAt,
        tags: data.tags ?? [],
        scripts: !!data.scripts && Object.keys(data.scripts).length > 0,
        install: () => manager.installMod(data.id, "store"),
        mod,
        installed,
      });
    }
    // Checked mods that are not in the marketplace (installed from GitHub)
    for (const mod of model.mods) {
      if (listed.has(mod) || mod.status === "breaks") {
        continue;
      }
      const installed = installedFor(null, mod);
      const version = installed?.version ?? latest.get(mod);
      entries.push({
        name: mod.name,
        author: mod.repo.split("/")[0],
        summary: mod.summary,
        version,
        verdict: verdict(mod, version),
        page: modPage(mod),
        pref: `mod:${mod.name}`,
        tags: [],
        install: () => manager.installMod(modPage(mod)),
        mod,
        installed,
      });
    }
    return entries;
  };
  const busy = async (button, text, run) => {
    const label = button.textContent;
    button.disabled = true;
    button.textContent = text;
    try {
      await run();
    } finally {
      button.textContent = label;
      button.disabled = false;
    }
  };
  /** Install, Update or a greyed Installed: on a card and in Details. */
  const primaryAction = (entry) =>
    entry.installed
      ? entry.latest &&
        entry.installed.version &&
        entry.latest !== entry.installed.version
        ? el(
            "button.button.accent",
            {
              disabled: !manager,
              onclick: (event) =>
                busy(event.currentTarget, "Updating…", async () => {
                  const changed = await manager.updateMods("manual");
                  toast(
                    changed ? `${entry.name} updated` : "Nothing to update",
                  );
                  await refresh();
                }),
            },
            icon("arrow-download"),
            el("span", {}, `Update to v${entry.latest}`),
          )
        : // Same size as Install, greyed: it is done
          el(
            "button.button.mod-installed-button",
            { disabled: true },
            icon("checkmark"),
            el(
              "span",
              {},
              entry.installed.enabled ? "Installed" : "Installed, off",
            ),
          )
      : el(
          `button.button${entry.verdict.key === "conflict" ? "" : ".accent"}`,
          {
            disabled: !manager,
            title:
              entry.verdict.key === "conflict"
                ? "It styles the same parts as Zen Fluent: one of the two should stay off"
                : "",
            onclick: async (event) => {
              const button = event.currentTarget;
              if (
                entry.verdict.key === "conflict" &&
                !(await confirmInstall(entry.name, entry.mod))
              ) {
                return;
              }
              await busy(button, "Installing…", async () => {
                try {
                  await entry.install();
                  toast(`${entry.name} installed`);
                } catch (error) {
                  console.error("[Zen Fluent] install failed", error);
                  toast(`${entry.name} could not be installed`);
                }
                await refresh();
              });
            },
          },
          entry.verdict.key === "conflict" ? "Install anyway" : "Install",
        );
  const market = modBrowser("market", {
    layout: "cards",
    entries: marketEntries,
    verdicts: Object.keys(VERDICTS).filter((key) => key !== "breaks"),
    empty: () =>
      store === null
        ? "Loading Sine's marketplace…"
        : store === false
          ? "Sine's marketplace could not be read (offline?): the checked mods only."
          : "No mod in the marketplace.",
    draw: (entry, layout) =>
      modItem(entry, layout, [
        primaryAction(entry),
        el(
          "button.button",
          { onclick: () => modDetails(entry, primaryAction) },
          "Details",
        ),
        entry.page ? openButton(entry) : null,
      ]),
  });

  const installedEntries = () =>
    installedMods.map((installed) => {
      const mod = registryEntry(installed);
      return {
        name: installed.name ?? installed.id,
        author:
          installed.author ??
          installed.homepage?.match(/github\.com\/([^/]+)/)?.[1] ??
          "",
        summary: mod?.summary ?? installed.description ?? "",
        version: installed.version,
        verdict: verdict(mod, installed.version),
        page:
          installed.homepage && installed.homepage !== "{store}"
            ? installed.homepage
            : mod
              ? modPage(mod)
              : "",
        installed,
      };
    });
  const installed = modBrowser("installed", {
    layout: "list",
    entries: installedEntries,
    empty: "Sine has no other mod installed.",
    draw: (entry, layout) => {
      const id = `zf-mod-${++uid}`;
      const on = el("button.switch", {
        role: "switch",
        "aria-label": `${entry.name}: on`,
        "aria-checked": String(!!entry.installed.enabled),
        onclick: async () => {
          const mods =
            await ChromeUtils.importESModule(SINE_UTILS).default.getMods();
          await manager?.toggleTheme(mods, entry.installed.id);
          await refresh();
        },
      });
      on.append(el("span.knob"));
      on.id = id;
      const remove = el(
        "button.icon-button",
        {
          title: "Uninstall",
          "aria-label": `${entry.name}: uninstall`,
          onclick: async (event) => {
            const button = event.currentTarget;
            // A second click within 4 s confirms
            if (!button.hasAttribute("confirm")) {
              button.setAttribute("confirm", "");
              button.title = "Click again to uninstall";
              toast(`Click again to uninstall ${entry.name}`);
              setTimeout(() => {
                button.removeAttribute("confirm");
                button.title = "Uninstall";
              }, 4000);
              return;
            }
            button.disabled = true;
            try {
              await manager?.removeMod(entry.installed.id);
              toast(`${entry.name} uninstalled`);
            } catch (error) {
              console.error("[Zen Fluent] uninstall failed", error);
              toast(`${entry.name} could not be uninstalled`);
            }
            await refresh();
          },
        },
        icon("dismiss-circle"),
      );
      return modItem(entry, layout, [
        entry.installed.preferences
          ? el(
              "button.button",
              { onclick: () => openModSettings(entry.installed) },
              icon("settings"),
              el("span", {}, "Settings"),
            )
          : null,
        entry.page ? openButton(entry) : null,
        remove,
        el(
          "span.toggle",
          {},
          el(
            "span.switch-state",
            { "aria-hidden": "true" },
            entry.installed.enabled ? "On" : "Off",
          ),
          on,
        ),
      ]);
    },
  });

  const conflictBar = el(
    "div.infobar.caution",
    { role: "alert", hidden: true },
    icon("warning"),
    el(
      "div.infobar-text",
      {},
      el("strong", {}, "An incompatible mod is on"),
      el("span"),
    ),
  );

  // Sine's list (read again after an install or a switch), then each
  // registered mod's latest version
  async function refresh() {
    try {
      manager ??= ChromeUtils.importESModule(SINE_MANAGER).default;
      installedMods = Object.values(
        await ChromeUtils.importESModule(SINE_UTILS).default.getMods(),
      ).filter((mod) => !OWN_MODS.has(mod.id));
    } catch {
      installedMods = [];
    }
    const clash = (status) =>
      installedMods
        .filter((m) => m.enabled && registryEntry(m)?.status === status)
        .map((m) => m.name);
    const breaking = clash("breaks");
    const on = [...breaking, ...clash("conflict")];
    conflictBar.hidden = !on.length;
    conflictBar.classList.toggle("critical", breaking.length > 0);
    conflictBar.classList.toggle("caution", !breaking.length);
    conflictBar.querySelector(".infobar-text > span").textContent =
      breaking.length
        ? `${breaking.join(" and ")} ${breaking.length > 1 ? "replace" : "replaces"} Zen's whole look and cannot run with Zen Fluent: turn ${breaking.length > 1 ? "them" : "it"} off below.`
        : `${on.join(" and ")} ${on.length > 1 ? "style" : "styles"} the same parts as Zen Fluent: turn one off below.`;
    market.redraw();
    installed.redraw();
  }
  refresh();
  (async () => {
    try {
      const response = await fetch(storeURL(), {
        signal: AbortSignal.timeout(10000),
        cache: "no-cache",
      });
      store = await response.json();
    } catch {
      store = false;
    }
    market.redraw();
  })();
  (async () => {
    await Promise.all(
      model.mods.map(async (mod) => {
        try {
          const url = `https://raw.githubusercontent.com/${mod.repo}/HEAD/${mod.path ? `${mod.path}/` : ""}theme.json`;
          const response = await fetch(url, {
            signal: AbortSignal.timeout(8000),
          });
          const version = (await response.json()).version;
          if (version) {
            latest.set(mod, String(version));
          }
        } catch {
          // Offline or moved: the verdict keeps the registry's check
        }
      }),
    );
    market.redraw();
  })();

  // Sine's own tools: its update check and an install from GitHub
  const repo = el("input.textbox.mod-repo", {
    type: "url",
    placeholder: "https://github.com/user/repo",
    "aria-label": "A mod's GitHub address",
    onkeydown: (event) => event.key === "Enter" && installFromURL.click(),
  });
  const installFromURL = el(
    "button.button",
    {
      onclick: (event) =>
        busy(event.currentTarget, "Installing…", async () => {
          const url = repo.value.trim();
          if (!/^(https:\/\/github\.com\/)?[\w.-]+\/[\w.-]+/.test(url)) {
            toast("A GitHub address, for example https://github.com/user/repo");
            return;
          }
          const mod = registryEntry({ homepage: url });
          if (
            (mod?.status === "conflict" || mod?.status === "breaks") &&
            !(await confirmInstall(mod.name, mod))
          ) {
            return;
          }
          try {
            manager ??= ChromeUtils.importESModule(SINE_MANAGER).default;
            await manager.installMod(url);
            toast("Mod installed");
            repo.value = "";
          } catch (error) {
            console.error("[Zen Fluent] install failed", error);
            toast("This mod could not be installed");
          }
          await refresh();
        }),
    },
    icon("arrow-download"),
    el("span", {}, "Install"),
  );
  const tools = el(
    "div.card.setting.mod-tools",
    {},
    el("span.card-icon", {}, icon("link")),
    el(
      "div.setting-text",
      {},
      el("span.setting-title", {}, "Install from GitHub"),
      el(
        "span.setting-desc",
        {},
        "A mod outside the marketplace; its scripts only run with Sine's JS from unofficial sources",
      ),
    ),
    el("div.setting-actions", {}, repo, installFromURL),
  );
  const updates = el(
    "button.button",
    {
      onclick: (event) =>
        busy(event.currentTarget, "Checking…", async () => {
          try {
            manager ??= ChromeUtils.importESModule(SINE_MANAGER).default;
            const changed = await manager.updateMods("manual");
            toast(changed ? "Mods updated" : "Every mod is up to date");
          } catch (error) {
            console.error("[Zen Fluent] update check failed", error);
            toast("The update check failed");
          }
          await refresh();
        }),
    },
    icon("arrow-reset"),
    el("span", {}, "Check for updates"),
  );

  // Featured: the mods Zen Fluent recommends (compatible-mods.json)
  const featuredBox = el("div.mod-items.mod-featured", {
    "data-layout": "cards",
  });
  const drawFeatured = () => {
    const order = model.featured ?? [];
    const entries = marketEntries()
      .filter((entry) => entry.mod && order.includes(entry.mod.id))
      .sort((a, b) => order.indexOf(a.mod.id) - order.indexOf(b.mod.id));
    featuredBox.replaceChildren(
      ...entries.map((entry) =>
        modItem(entry, "cards", [
          primaryAction(entry),
          el(
            "button.button",
            { onclick: () => modDetails(entry, primaryAction) },
            "Details",
          ),
          entry.page ? openButton(entry) : null,
        ]),
      ),
    );
  };
  const redrawMarket = market.redraw;
  market.redraw = (...args) => {
    drawFeatured();
    return redrawMarket(...args);
  };
  drawFeatured();

  return [
    conflictBar,
    (model.featured ?? []).length
      ? section(
          "Featured",
          el(
            "p.section-desc",
            {},
            "Mods that make Zen better and that Zen Fluent styles to match, checked with this version.",
          ),
          featuredBox,
        )
      : null,
    section(
      "Marketplace",
      el(
        "p.section-desc",
        {},
        "Sine's marketplace, with each mod's compatibility with Zen Fluent: Works means checked with this version of Zen Fluent and the mod's version; Not checked, not in Zen Fluent's list yet. Whole themes that replace Zen's look (Nebula, Arc 2.0, Zia…) are left out: they cannot run with Zen Fluent.",
      ),
      market.node,
    ),
    section("Add a mod", tools),
    section(
      "Installed mods",
      el(
        "div.mod-section-head",
        {},
        el(
          "p.section-desc",
          {},
          "Every mod Sine has installed, and whether its version was checked with this Zen Fluent. Uninstall asks for a second click.",
        ),
        updates,
      ),
      installed.node,
    ),
  ];
}

// -------- Variants: a window with a pin on each component --------

// Each component's look when it and All components both say Auto: the
// fill and shape Zen Fluent gives it on its own ("native": the WinUI
// subtle button, a fill on hover and selection only, which no fill choice
// names)
const PARTS = {
  buttons: { fill: "native", shape: "rounded" },
  urlbar: { fill: "solid", shape: "rounded" },
  "urlbar-buttons": { fill: "native", shape: "rounded" },
  extensions: { fill: "native", shape: "rounded" },
  badges: { fill: "solid", shape: "pill" },
  essentials: { fill: "solid", shape: "rounded" },
  "pinned-tabs": { fill: "native", shape: "rounded" },
  folders: { fill: "native", shape: "rounded" },
  tabs: { fill: "native", shape: "rounded" },
  spaces: { fill: "native", shape: "rounded" },
  "panel-buttons": { fill: "solid", shape: "rounded" },
};
const FILL_HELP = {
  auto: "Follows All components",
  solid: "Opaque, nothing shows through (WinUI control solid fill)",
  standard: "WinUI's default button: see-through control fill and border",
  tint: "A light fill inside a thin border (Fluent 2 tint)",
  outline: "A thin border, no fill (Fluent 2 outline)",
  subtle: "No fill until hovered (Fluent 2 subtle)",
  transparent: "No fill; the accent on hover (Fluent 2 transparent)",
  translucent: "Zen's see-through fill",
};
// The extensions row has a look of its own, beside its buttons'
const ROW = "extensions-row";
const SCOPE = "zen-fluent.variant.extensions-scope";
const shortLabel = (label) => label.replace(/\s*\(.*\)$/, "");

const variantPref = (part, kind) =>
  model.prefs.get(
    `zen-fluent.variant.${part}${kind === "shape" ? "-shape" : ""}`,
  );

/** The row's fill or shape: its own, the buttons' (the 0.4.2 "whole row"
    choice, until a row look is picked), else none. */
function effectiveRow(kind) {
  const own = read(variantPref(ROW, kind));
  if (own !== "auto") {
    return own;
  }
  const legacy =
    read(model.prefs.get(SCOPE)) === "row" &&
    read(variantPref(ROW, "fill")) === "auto" &&
    read(variantPref(ROW, "shape")) === "auto";
  return legacy
    ? effective("extensions", kind)
    : kind === "fill"
      ? "none"
      : "rounded";
}

/** The fill or shape a component shows: its own, else All components'. */
function effective(part, kind) {
  const own = read(variantPref(part, kind));
  if (own !== "auto") {
    return own;
  }
  const global = read(variantPref("global", kind));
  return global !== "auto" ? global : PARTS[part]?.[kind];
}

const partName = (part) =>
  part === "global"
    ? "All components"
    : (variantPref(part, "fill")?.title.replace(/:\s*fill$/i, "") ?? part);

/** The choices of a fill or shape pref, each drawn on a small sample. */
function variantChips(pref, kind) {
  const row = el("div.vz-chips", {
    role: "radiogroup",
    "aria-label": kind === "fill" ? "Fill" : "Shape",
  });
  for (const option of pref.options) {
    const chip = el(
      "button.vz-chip",
      {
        role: "radio",
        title:
          option.value === "auto" && pref.property.includes(".global")
            ? "Each component's own look"
            : kind === "fill"
              ? (FILL_HELP[option.value] ?? "")
              : "",
        onclick: () => change(pref, option.value),
      },
      el(
        "span.vz-sample",
        { [`data-${kind}`]: option.value },
        el("span.vz-item", {}, el("i.vz-glyph"), el("span.vz-text", {}, "Aa")),
        el(
          "span.vz-item",
          { hover: true },
          el("i.vz-glyph"),
          el("span.vz-text", {}, "Aa"),
        ),
      ),
      el(
        "span.vz-chip-label",
        {},
        option.value === "auto" ? "Auto" : shortLabel(option.label),
      ),
    );
    chip.dataset.value = option.value;
    row.append(chip);
  }
  const update = () => {
    for (const chip of row.children) {
      chip.setAttribute("aria-checked", chip.dataset.value === read(pref));
    }
  };
  update();
  watch(pref.property, update);
  return row;
}

/** A component of the drawing: its items and the pin that edits it. */
function part(name, number, items, extra = "") {
  const region = el(`div.vz-part${extra}`, { "data-part": name });
  region.append(
    ...items,
    el("button.vz-pin", { "aria-haspopup": "dialog" }, String(number)),
  );
  return region;
}
const item = (attributes = {}, ...children) =>
  el("span.vz-item", attributes, ...children);
const glyph = () => el("i.vz-glyph");
const words = (text) => el("span.vz-text", {}, text);

function renderVariants(page) {
  const parts = Object.keys(PARTS).filter((p) => variantPref(p, "fill"));
  const numbers = new Map(parts.map((p, i) => [p, i + 1]));
  const n = (p) => numbers.get(p);

  // The drawing: Zen's sidebar, and a page with a dialog
  const stage = el(
    "div.vz-stage",
    {},
    el(
      "div.vz-window",
      { "data-part": "global" },
      el(
        "div.vz-sidebar",
        {},
        part(
          "buttons",
          n("buttons"),
          [
            item({}, glyph()),
            item({ hover: true }, glyph()),
            item({}, glyph()),
          ],
          ".row",
        ),
        el(
          "div.vz-urlrow",
          {},
          part(
            "urlbar",
            n("urlbar"),
            [item({}, words("zen-browser.app"))],
            ".grow",
          ),
          part(
            "urlbar-buttons",
            n("urlbar-buttons"),
            [item({}, glyph()), item({ hover: true }, glyph())],
            ".row",
          ),
        ),
        el(
          "div.vz-extrow",
          {},
          part(
            "extensions",
            n("extensions"),
            [
              item({}, glyph()),
              item({ hover: true }, glyph()),
              item({}, glyph()),
              item({}, glyph()),
            ],
            ".row",
          ),
          part("badges", n("badges"), [item({}, words("3"))]),
        ),
        part(
          "essentials",
          n("essentials"),
          [
            item({ style: "--tile: #e81123" }, glyph()),
            item({ style: "--tile: #0078d4", selected: true }, glyph()),
            item({ style: "--tile: #107c10", hover: true }, glyph()),
            item({ style: "--tile: #ffb900" }, glyph()),
          ],
          ".grid",
        ),
        part(
          "pinned-tabs",
          n("pinned-tabs"),
          [
            item({}, glyph(), words("Mail")),
            item({ hover: true }, glyph(), words("Calendar")),
          ],
          ".list",
        ),
        part(
          "folders",
          n("folders"),
          [item({ hover: true }, glyph(), words("Work"))],
          ".list",
        ),
        part(
          "tabs",
          n("tabs"),
          [
            item({ selected: true }, glyph(), words("Fluent Design")),
            item({ hover: true }, glyph(), words("Release notes")),
            item({}, glyph(), words("Weather")),
          ],
          ".list",
        ),
        part(
          "spaces",
          n("spaces"),
          [
            item({ selected: true }, glyph()),
            item({ hover: true }, glyph()),
            item({}, glyph()),
          ],
          ".row.spaces",
        ),
      ),
      el(
        "div.vz-page",
        {},
        el("div.vz-hero"),
        el("div.vz-line"),
        el("div.vz-line.short"),
        el(
          "div.vz-dialog",
          {},
          el("span.vz-dialog-title", {}, "Leave this page?"),
          el("span.vz-line.short"),
          part(
            "panel-buttons",
            n("panel-buttons"),
            [item({ hover: true }, words("Stay")), item({}, words("Leave"))],
            ".row.end",
          ),
        ),
      ),
    ),
  );

  // The window itself is "All components": its pin, or a click on it
  stage
    .querySelector(".vz-window")
    .append(
      el("button.vz-pin.vz-pin-all", { "aria-haspopup": "dialog" }, "All"),
    );

  // A TeachingTip with the fill and shape of one component; on a wide
  // window, a panel docked on the stage's right that always shows one
  // (All components when none is picked)
  const tip = el("div.vz-tip", { role: "dialog", hidden: true });
  const side = el("aside.vz-side", { "aria-label": "Fill and shape" });
  stage.append(tip);
  const wide = window.matchMedia("(width >= 1300px)");
  let open = null;
  let tipTab = null;
  const regionOf = (name) => stage.querySelector(`[data-part="${name}"]`);
  const closeTip = (focusPin = true) => {
    if (!open) {
      return;
    }
    const region = regionOf(open);
    tip.hidden = true;
    region?.removeAttribute("active");
    open = null;
    if (focusPin) {
      region?.querySelector(".vz-pin").focus();
    }
    if (wide.matches) {
      openTip("global", false);
    }
  };
  const openTip = (name, focus = true) => {
    if (open === name) {
      if (!wide.matches) {
        closeTip();
      }
      return;
    }
    const wasOpen = open;
    open = null;
    if (wasOpen) {
      regionOf(wasOpen)?.removeAttribute("active");
    }
    open = name;
    const docked = wide.matches;
    const home = docked ? side : stage;
    if (tip.parentNode !== home) {
      home.append(tip);
    }
    tip.toggleAttribute("docked", docked);
    const region = regionOf(name);
    region.setAttribute("active", "");
    const fill = variantPref(name, "fill");
    const shape = variantPref(name, "shape");
    // The extensions have two looks, both applied: each button's and the
    // row's, one tab each (a WinUI SelectorBar)
    const hasRow = name === "extensions" && !!variantPref(ROW, "fill");
    // 0.4.2's "whole row" gave the buttons' look to the row: as long as it
    // holds, Each button would style the row. Its look moves to The row.
    if (hasRow && read(model.prefs.get(SCOPE)) === "row") {
      const rowFill = variantPref(ROW, "fill");
      const rowShape = variantPref(ROW, "shape");
      if (isDefault(rowFill) && isDefault(rowShape)) {
        write(rowFill, read(fill));
        write(rowShape, read(shape));
        reset(fill);
        reset(shape);
      }
      reset(model.prefs.get(SCOPE));
    }
    const titleId = `zf-tip-${++uid}`;
    const choices = (target) =>
      el(
        "div.vz-tip-choices",
        {},
        el("span.vz-label", {}, "Fill"),
        variantChips(variantPref(target, "fill"), "fill"),
        el("span.vz-label", {}, "Shape"),
        variantChips(variantPref(target, "shape"), "shape"),
      );
    let tabs = null;
    let body = choices(name);
    if (hasRow) {
      const panel = el("div.vz-tab-panel", { role: "tabpanel" }, body);
      const show = (target) => {
        tipTab = target;
        for (const tab of tabs.children) {
          const on = tab.dataset.target === target;
          tab.setAttribute("aria-selected", on);
          tab.tabIndex = on ? 0 : -1;
        }
        panel.replaceChildren(choices(target));
      };
      tabs = el(
        "div.vz-selector",
        { role: "tablist", "aria-label": "Extensions" },
        ...[
          [name, "Each button"],
          [ROW, "The row"],
        ].map(([target, label]) =>
          el(
            "button.vz-selector-item",
            {
              role: "tab",
              "data-target": target,
              onclick: () => show(target),
              onkeydown: (event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  show(target === ROW ? name : ROW);
                  tabs.querySelector('[aria-selected="true"]').focus();
                }
              },
            },
            label,
          ),
        ),
      );
      body = panel;
      queueMicrotask(() => show(tipTab === ROW ? ROW : name));
    }
    const rowPrefs = hasRow
      ? [
          variantPref(ROW, "fill"),
          variantPref(ROW, "shape"),
          model.prefs.get(SCOPE),
        ]
      : [];
    tip.setAttribute("aria-labelledby", titleId);
    tip.replaceChildren(
      el(
        "div.vz-tip-header",
        {},
        el("h3.vz-tip-title", { id: titleId }, partName(name)),
        el(
          "button.icon-button",
          { "aria-label": "Close", onclick: () => closeTip() },
          icon("dismiss"),
        ),
      ),
      el(
        "p.vz-tip-desc",
        {},
        name === "global"
          ? "Every component left on Auto takes this fill and shape."
          : "Auto takes the choice of All components, or this component's own look.",
      ),
      ...(tabs ? [tabs] : []),
      body,
      el(
        "div.vz-tip-footer",
        {},
        el(
          "button.button",
          {
            onclick: () => {
              const saved = snapshot(
                [fill, shape, ...rowPrefs].filter(Boolean),
              );
              for (const pref of [fill, shape, ...rowPrefs].filter(Boolean)) {
                reset(pref);
              }
              toast(`${partName(name)}: back to Auto`, {
                label: "Undo",
                run: () => restore(saved),
              });
            },
          },
          icon("arrow-reset"),
          el("span", {}, "Back to Auto"),
        ),
      ),
    );
    tip.hidden = false;
    if (docked) {
      tip.style.removeProperty("left");
      tip.style.removeProperty("top");
      if (focus) {
        tip.querySelector('.vz-chip[aria-checked="true"]')?.focus();
      }
      return;
    }
    // Below the pin, or above it near the bottom; the tail points at it
    const box = stage.getBoundingClientRect();
    const pinBox = region.querySelector(".vz-pin").getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const centre = pinBox.left + pinBox.width / 2 - box.left;
    const left = Math.min(
      Math.max(8, centre - width / 2),
      Math.max(8, box.width - width - 8),
    );
    const below = pinBox.bottom - box.top + 12;
    const above = pinBox.top - box.top - height - 12;
    const placeBelow = below + height <= box.height || above < 0;
    tip.style.left = `${left}px`;
    tip.style.top = `${placeBelow ? below : above}px`;
    tip.style.setProperty("--tail", `${centre - left}px`);
    tip.toggleAttribute("above", !placeBelow);
    tip.querySelector('.vz-chip[aria-checked="true"]')?.focus();
  };
  stage.addEventListener("click", (event) => {
    if (event.target.closest(".vz-tip")) {
      return;
    }
    const region = event.target.closest(".vz-part, .vz-window");
    if (region) {
      openTip(region.dataset.part);
    } else {
      closeTip(false);
    }
  });
  for (const host of [stage, side]) {
    host.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open && open !== "global") {
        event.stopPropagation();
        closeTip();
      }
    });
  }
  // Docked on a wide window, a popup otherwise: follow the window's width
  const place = () => {
    const name = open ?? "global";
    open = null;
    tip.hidden = true;
    if (wide.matches || name !== "global") {
      openTip(name, false);
    }
  };
  wide.addEventListener("change", place);
  queueMicrotask(() => wide.matches && openTip("global", false));

  // Every component's current look, its pin, and the list of changes
  const changes = el("div.vz-changes");
  const rowOf = (name) =>
    name === "extensions"
      ? [variantPref(ROW, "fill"), variantPref(ROW, "shape")].filter(Boolean)
      : [];
  const scopeOf = (name) =>
    name === "extensions" && read(model.prefs.get(SCOPE)) === "row"
      ? model.prefs.get(SCOPE)
      : null;
  const look = (name) => {
    const own = [variantPref(name, "fill"), variantPref(name, "shape")]
      .map((pref) => shortLabel(optionLabel(pref.property)))
      .join(" · ");
    const row = rowOf(name);
    return row.length && !row.every(isDefault)
      ? `${own}; row: ${row.map((pref) => shortLabel(optionLabel(pref.property))).join(" · ")}`
      : own;
  };
  const isChanged = (name) =>
    !isDefault(variantPref(name, "fill")) ||
    !isDefault(variantPref(name, "shape")) ||
    !rowOf(name).every(isDefault) ||
    !!scopeOf(name);
  const update = () => {
    for (const name of parts) {
      const region = regionOf(name);
      const fill = effective(name, "fill");
      region.dataset.fill = fill;
      region.dataset.shape =
        fill === "pill" ? "pill" : effective(name, "shape");
      if (name === "extensions") {
        region.dataset.rowFill = effectiveRow("fill");
        region.dataset.rowShape = effectiveRow("shape");
        // the 0.4.2 "whole row": the buttons stay bare
        if (scopeOf(name) && rowOf(name).every(isDefault)) {
          region.dataset.fill = "native";
        }
      }
      const pin = region.querySelector(".vz-pin");
      pin.toggleAttribute("changed", isChanged(name));
      pin.setAttribute("aria-label", `${partName(name)}: ${look(name)}`);
      pin.title = `${partName(name)}: ${look(name)}`;
    }
    const all = stage.querySelector(".vz-pin-all");
    all.toggleAttribute("changed", isChanged("global"));
    all.setAttribute("aria-label", `All components: ${look("global")}`);
    all.title = `All components: ${look("global")}`;
    const changed = ["global", ...parts].filter(isChanged);
    changes.replaceChildren(
      ...(changed.length
        ? changed.map((name) =>
            el(
              "span.vz-tag",
              {},
              el(
                "button.vz-tag-main",
                { onclick: () => openTip(name) },
                el("span.vz-tag-number", {}, String(n(name) ?? "All")),
                el("span", {}, `${partName(name)} · ${look(name)}`),
              ),
              el(
                "button.vz-tag-remove",
                {
                  "aria-label": `${partName(name)}: back to Auto`,
                  title: "Back to Auto",
                  onclick: () => {
                    reset(variantPref(name, "fill"));
                    reset(variantPref(name, "shape"));
                    for (const pref of rowOf(name)) {
                      reset(pref);
                    }
                    if (scopeOf(name)) {
                      reset(scopeOf(name));
                    }
                  },
                },
                icon("dismiss"),
              ),
            ),
          )
        : [
            el(
              "span.vz-empty",
              {},
              "Every component has its default look. Click a pin to change one, or All to change them all.",
            ),
          ]),
    );
  };
  update();
  for (const name of ["global", ...parts]) {
    watch(variantPref(name, "fill").property, update);
    watch(variantPref(name, "shape").property, update);
  }
  if (variantPref(ROW, "fill")) {
    for (const pref of [...rowOf("extensions"), model.prefs.get(SCOPE)]) {
      watch(pref.property, update);
    }
    // A row look picked here ends the 0.4.2 "whole row" choice
    for (const pref of rowOf("extensions")) {
      watch(pref.property, () => {
        if (!isDefault(pref) && read(model.prefs.get(SCOPE)) === "row") {
          reset(model.prefs.get(SCOPE));
        }
      });
    }
  }
  page.reveal = (property) => {
    const name = property
      .replace("zen-fluent.variant.", "")
      .replace(/-shape$/, "")
      .replace(/-row$|-scope$/, "");
    if (name === "global" || parts.includes(name)) {
      regionOf(name).scrollIntoView({ block: "center" });
      openTip(name);
    }
  };

  return [
    section(
      "Components",
      el(
        "p.section-desc",
        {},
        "Click a pin, or the part of the window it marks, to choose that component's fill and shape; All, or the window itself, sets every component left on Auto. The drawing shows a selected item, one under the pointer and one at rest.",
      ),
      el("div.vz-layout", {}, stage, side),
    ),
    section("Your changes", changes),
  ];
}

// -------- Zones: the Fluent style of an area, on its pages --------

// The zone each page styles (Zones, zen-fluent.fluent-<zone>): its switch
// sits in the page header beside Reset, as Zia does
const PAGE_ZONES = {
  sidebar: ["sidebar"],
  essentials: ["sidebar"],
  extensions: ["sidebar"],
  tabs: ["sidebar"],
  urlbar: ["urlbar"],
  window: ["window", "menus"],
};

const zonePrefs = (page) =>
  (PAGE_ZONES[page.id] ?? [])
    .map((zone) => model.prefs.get(`zen-fluent.fluent-${zone}`))
    .filter(Boolean);

/** "Fluent style" (or the zone's name, when a page has two) and a switch. */
function zoneSwitch(pref, named) {
  const id = `zf-z-${++uid}`;
  return el(
    "span.zone-switch",
    { title: pref.description },
    el(
      "span.zone-label",
      { id },
      named ? `${pref.title} in Fluent` : "Fluent style",
    ),
    toggle(pref, id),
  );
}

/** An InfoBar while a page's zone keeps Zen's look; its cards fade. */
function zoneBanner(zones, view) {
  const text = el("span");
  const bar = el(
    "div.infobar.zone-off",
    { role: "status" },
    icon("info"),
    el("div.infobar-text", {}, el("strong", {}, "Zen's own look here"), text),
    el(
      "button.button",
      { onclick: () => zones.forEach((pref) => write(pref, true)) },
      "Turn on",
    ),
  );
  const update = () => {
    const off = zones.filter((pref) => !read(pref));
    bar.hidden = !off.length;
    view.toggleAttribute("zone-off", off.length > 0);
    text.textContent = `${off
      .map((pref) => pref.title)
      .join(
        " and ",
      )} ${off.length > 1 ? "keep" : "keeps"} Zen's look: the settings below apply once the Fluent style is on again.`;
  };
  update();
  for (const pref of zones) {
    watch(pref.property, update);
  }
  return bar;
}

function renderGroup(page) {
  const group = page.group;
  if (group.layout === "variants") {
    return renderVariants(page);
  }
  const rows = group.items.map((pref) => settingRow(pref));
  if (group.layout === "grid") {
    return [section("", el("div.card-grid", {}, stagger(rows)))];
  }
  return [columns(section("", ...stagger(rows)))];
}

function renderEnhanced() {
  const cards = model.features.map((feature) => {
    const row = settingRow(feature.pref, {
      iconName: FEATURES[feature.name] ?? "sparkle",
      iconBase: FEATURE_ICONS,
    });
    if (!feature.options.length) {
      return row;
    }
    const options = el(
      "div.suboptions",
      {},
      feature.options.map((pref) => settingRow(pref, { extraClass: ".sub" })),
    );
    const update = () => (options.hidden = !read(feature.pref));
    update();
    watch(feature.pref.property, update);
    return el("div.expander", {}, row, options);
  });
  return [
    el(
      "div.infobar",
      {},
      icon("info"),
      el(
        "div.infobar-text",
        {},
        el("strong", {}, "Each feature is one script"),
        el(
          "span",
          {},
          "Turning one off stops it at once in every window, nothing to restart.",
        ),
      ),
    ),
    columns(section("", ...stagger(cards))),
  ];
}

function exportSettings() {
  const prefs = {};
  for (const [property, pref] of model.prefs) {
    if (Services.prefs.prefHasUserValue(property)) {
      prefs[property] = read(pref);
    }
  }
  const data = {
    format: "zen-fluent-settings",
    version: 1,
    mod: model.versions.core,
    exported: new Date().toISOString(),
    prefs,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = el("a", { href: url, download: "zen-fluent-settings.json" });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast(`${Object.keys(prefs).length} settings exported`);
}

async function importSettings(file) {
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    toast("This file is not JSON");
    return;
  }
  if (
    data?.format !== "zen-fluent-settings" ||
    typeof data.prefs !== "object"
  ) {
    toast("This file is not a Zen Fluent settings export");
    return;
  }
  const valid = Object.entries(data.prefs).filter(([property, value]) => {
    const pref = model.prefs.get(property);
    if (!pref) {
      return false;
    }
    if (pref.type === "checkbox") {
      return typeof value === "boolean";
    }
    if (pref.type === "int") {
      return Number.isInteger(value);
    }
    if (pref.type === "dropdown") {
      return pref.options?.some((o) => o.value === value);
    }
    return typeof value === "string" && (VALIDATE[property]?.(value) ?? true);
  });
  const prefs = valid.map(([property]) => model.prefs.get(property));
  const saved = snapshot(prefs);
  for (const [property, value] of valid) {
    write(model.prefs.get(property), value);
  }
  toast(`${valid.length} settings imported`, {
    label: "Undo",
    run: () => restore(saved),
  });
}

function link(label, url, iconName = "open") {
  return el(
    "button.link-row.card",
    {
      onclick: () => openLink(url),
    },
    icon(iconName),
    el("span", {}, label),
    icon("open"),
  );
}

/** Your theme as a file: export, import, reset. */
function themeFileSection() {
  const file = el("input", {
    type: "file",
    accept: ".json,application/json",
    hidden: true,
    onchange: () => file.files[0] && importSettings(file.files[0]),
  });
  const every = [...model.prefs.values()].filter((p) =>
    p.property.startsWith("zen-fluent."),
  );
  return section(
    "Your theme",
    el(
      "div.card.setting",
      {},
      el("span.card-icon", {}, icon("arrow-download")),
      el(
        "div.setting-text",
        {},
        el("span.setting-title", {}, "Export"),
        el(
          "span.setting-desc",
          {},
          "Every setting you changed, in a JSON file to keep or share",
        ),
      ),
      el("button.button", { onclick: exportSettings }, "Export"),
    ),
    el(
      "div.card.setting",
      {},
      el("span.card-icon", {}, icon("arrow-upload")),
      el(
        "div.setting-text",
        {},
        el("span.setting-title", {}, "Import"),
        el(
          "span.setting-desc",
          {},
          "Apply an exported file; unknown or invalid values are skipped",
        ),
      ),
      el("button.button", { onclick: () => file.click() }, "Import…"),
      file,
    ),
    el(
      "div.card.setting",
      {},
      el("span.card-icon", {}, icon("arrow-reset")),
      el(
        "div.setting-text",
        {},
        el("span.setting-title", {}, "Reset everything"),
        el(
          "span.setting-desc",
          {},
          "Every Zen Fluent and Enhanced setting back to its default",
        ),
      ),
      resetPageButton(every, "Reset everything"),
    ),
  );
}

function aboutSections() {
  return [
    section(
      "About",
      el(
        "div.card.about",
        {},
        el("span.brand-logo.big", { "aria-hidden": "true" }),
        el(
          "div",
          {},
          el("h2.about-name", {}, "Zen Fluent"),
          el(
            "p.about-versions",
            {},
            `Zen Fluent ${model.versions.core ?? "?"} · Zen Fluent Enhanced ${model.versions.enhanced ?? "?"}`,
          ),
          el(
            "p.about-desc",
            {},
            "Fluent Design for Zen Browser, by alexisdechiara. MIT licence; Fluent UI System Icons © Microsoft, MIT.",
          ),
        ),
      ),
    ),
    section(
      "Zen Fluent",
      el(
        "div.card.setting",
        {},
        el("span.card-icon", {}, icon("settings")),
        el(
          "div.setting-text",
          {},
          el("span.setting-title", {}, "Sine's settings"),
          el("span.setting-desc", {}, "The same settings, in the mod's dialog"),
        ),
        el(
          "button.button",
          { onclick: () => chromeWindow().openPreferences("paneSineMods") },
          "Open",
        ),
      ),
      // The welcome tour (scripts/welcome.uc.js) shows again when its
      // pref is cleared
      Services.prefs.getBoolPref("zen-fluent.enhanced.welcome", true)
        ? el(
            "div.card.setting",
            {},
            el("span.card-icon", {}, icon("sparkle")),
            el(
              "div.setting-text",
              {},
              el("span.setting-title", {}, "Welcome tour"),
              el(
                "span.setting-desc",
                {},
                "The themes, the accent and the main features, over the window",
              ),
            ),
            el(
              "button.button",
              {
                onclick: () =>
                  Services.prefs.setBoolPref(
                    "zen-fluent.enhanced.welcome.seen",
                    false,
                  ),
              },
              "Show",
            ),
          )
        : null,
    ),
    section(
      "Links",
      link("Source code and issues", REPO, "link"),
      link("Documentation", `${REPO}/tree/main/docs`, "info"),
      link("What's new", `${REPO}/blob/main/CHANGELOG.md`, "flash"),
    ),
  ];
}

// -------- Spaces: settings per space --------

const SPACE_DATA = "zen-fluent.enhanced.space-settings.data";

// The space the pages edit (the picker in their header), or null for your
// own settings. It stays while you move between pages.
let scope = null;
// True on a page that shows the picker: the others keep your own settings
let scopeShown = false;

const spaceList = () => chromeWindow()?.gZenWorkspaces?.getWorkspaces() ?? [];
const spaceLabel = (space) =>
  space.icon && !space.icon.endsWith(".svg")
    ? `${space.icon}  ${space.name}`
    : space.name;

/** The space being edited, while it still exists and the feature is on. */
function scopedSpace() {
  if (!scope || !Services.prefs.getBoolPref(SPACE_FEATURE, true)) {
    return null;
  }
  return spaceList().find((s) => s.uuid === scope) ?? null;
}

/** "Settings for": your own settings, or one space's. */
function scopePicker(page) {
  const list = spaceList();
  const prefs = page.prefs ?? [];
  if (
    !Services.prefs.getBoolPref(SPACE_FEATURE, true) ||
    !list.length ||
    !prefs.some((pref) => perSpace(pref.property))
  ) {
    return null;
  }
  const id = `zf-s-${++uid}`;
  const select = el("select.combo.scope-picker", {
    "aria-labelledby": id,
    onchange: () => {
      scope = select.value || null;
      route();
    },
  });
  select.append(el("option", { value: "" }, "All spaces"));
  for (const space of list) {
    select.append(
      el("option", { value: space.uuid, translate: "no" }, spaceLabel(space)),
    );
  }
  select.value = scopedSpace()?.uuid ?? "";
  return el(
    "span.scope",
    {},
    el("span.scope-label", { id }, "Settings for"),
    select,
  );
}

/** While a space is edited: what it changes, and the way back. */
function scopeBanner(page) {
  const space = scopedSpace();
  if (!space || !(page.prefs ?? []).length) {
    return null;
  }
  return el(
    "div.infobar.scope-banner",
    { role: "status" },
    icon("layer"),
    el(
      "div.infobar-text",
      {},
      el("strong", {}, `Settings of ${space.name}`),
      el(
        "span",
        {},
        "What you pick here only applies in this space; “Your setting” follows your own. The other settings are the same in every space.",
      ),
    ),
    el(
      "button.button",
      {
        onclick: () => {
          scope = null;
          route();
        },
      },
      "All spaces",
    ),
  );
}

/** A setting's value in one space: "Your setting (…)" or its own. */
function scopedControl(pref, space, labelledBy) {
  const def = spaceSetting(
    spaces().SETTINGS.find((s) => s.property === pref.property),
  );
  // "Automatic (the material's)" → "Automatic": the select stays short
  const labelOf = (value) =>
    (
      def.options.find((o) => o.value === value)?.label ?? String(value)
    ).replace(/\s*\(.*\)$/, "");
  const select = el("select.combo", {
    "aria-labelledby": labelledBy,
    onchange: () =>
      spaces().setOverride(
        space.uuid,
        pref.property,
        select.value === "inherit" ? undefined : JSON.parse(select.value),
      ),
  });
  const inherit = el("option", { value: "inherit" });
  select.append(inherit);
  for (const option of def.options) {
    select.append(
      el("option", { value: JSON.stringify(option.value) }, option.label),
    );
  }
  const row = () => select.closest(".setting");
  const update = () => {
    inherit.textContent = `Your setting (${labelOf(read(pref))})`;
    const overrides = spaces().readData().spaces[space.uuid] ?? {};
    const own = pref.property in overrides;
    select.value = own
      ? JSON.stringify(overrides[pref.property] ?? def.fallback)
      : "inherit";
    row()?.toggleAttribute("modified", own);
  };
  update();
  setTimeout(update, 0);
  watch(SPACE_DATA, update);
  watch(pref.property, update);
  return select;
}

/** Your own settings: the spaces that give this one a value of their own. */
function spaceChips(pref) {
  if (!perSpace(pref.property)) {
    return null;
  }
  const box = el("span.space-chips");
  const update = () => {
    const data = spaces().readData();
    box.replaceChildren(
      ...spaceList()
        .filter((space) => pref.property in (data.spaces[space.uuid] ?? {}))
        .map((space) =>
          el(
            "button.space-chip",
            {
              title: `${space.name} has its own value: edit it`,
              onclick: () => {
                scope = space.uuid;
                route();
              },
            },
            el("span", { translate: "no" }, spaceLabel(space)),
          ),
        ),
    );
  };
  update();
  watch(SPACE_DATA, update);
  return box;
}

const SPACES_LIB = `${BASE}Zen-Fluent-Enhanced/scripts/lib/zf-spaces.sys.mjs`;
const SPACE_FEATURE = "zen-fluent.enhanced.space-settings";
let spacesLib = null;
const spaces = () => (spacesLib ??= ChromeUtils.importESModule(SPACES_LIB));
const SCHEME_OPTIONS = [
  { label: "System", value: 2 },
  { label: "Light", value: 1 },
  { label: "Dark", value: 0 },
];

/** A setting a space can override: its title and its typed choices. */
function spaceSetting({ property, type }) {
  if (property === SCHEME) {
    return { property, title: "Mode", options: SCHEME_OPTIONS, fallback: 2 };
  }
  const pref = model.prefs.get(property);
  if (!pref) {
    return null;
  }
  if (type === "bool") {
    return {
      property,
      title: pref.title,
      options: [
        { label: "On", value: true },
        { label: "Off", value: false },
      ],
      fallback: pref.defaultValue,
    };
  }
  return {
    property,
    title: pref.title,
    options: (pref.options ?? []).map(({ label, value }) => ({ label, value })),
    fallback: pref.defaultValue,
  };
}

function spaceIcon(space) {
  if (space.icon?.endsWith(".svg")) {
    return el("img.icon.space-icon", { src: space.icon, alt: "" });
  }
  return el("span.space-icon", { "aria-hidden": "true" }, space.icon || "•");
}

/** One space: its overrides, each with its value, and "Add a setting". */
function spaceCard(space, defs, data, activeId) {
  const lib = spaces();
  const overrides = data.spaces[space.uuid] ?? {};
  const count = Object.keys(overrides).length;
  const card = el("div.card.space-card", { "data-space": space.uuid });
  card.append(
    el(
      "div.setting.space-header",
      {},
      el("span.card-icon", {}, spaceIcon(space)),
      el(
        "div.setting-text",
        {},
        el("span.setting-title", { translate: "no" }, space.name),
        el(
          "span.setting-desc",
          {},
          count
            ? `${count} setting${count > 1 ? "s" : ""} of its own`
            : "Follows your settings",
        ),
      ),
      el(
        "div.setting-actions",
        {},
        space.uuid === activeId ? el("span.space-current", {}, "Shown") : null,
        el(
          "button.button",
          { onclick: () => lib.clearSpace(space.uuid), disabled: !count },
          icon("arrow-reset"),
          el("span", {}, "Like the others"),
        ),
      ),
    ),
  );
  for (const def of defs) {
    if (!(def.property in overrides)) {
      continue;
    }
    const value = overrides[def.property] ?? def.fallback;
    const id = `zf-s-${++uid}`;
    const select = el("select.combo", {
      "aria-labelledby": id,
      onchange: () =>
        lib.setOverride(space.uuid, def.property, JSON.parse(select.value)),
    });
    for (const option of def.options) {
      select.append(
        el("option", { value: JSON.stringify(option.value) }, option.label),
      );
    }
    select.value = JSON.stringify(value);
    card.append(
      el(
        "div.setting.sub.space-row",
        {},
        el("div.setting-text", {}, el("span.setting-title", { id }, def.title)),
        el(
          "div.setting-actions",
          {},
          select,
          el(
            "button.icon-button",
            {
              title: "Use your setting",
              "aria-label": `${def.title}: use your setting`,
              onclick: () =>
                lib.setOverride(space.uuid, def.property, undefined),
            },
            icon("dismiss"),
          ),
        ),
      ),
    );
  }
  const free = defs.filter((def) => !(def.property in overrides));
  if (free.length) {
    const add = el("select.combo.space-add", {
      "aria-label": `Add a setting to ${space.name}`,
      onchange: () => {
        const def = free.find((d) => d.property === add.value);
        // It starts from the value shown now
        const base = lib.baseValue(def.property);
        lib.setOverride(space.uuid, def.property, base ?? def.fallback);
      },
    });
    add.append(el("option", { value: "", selected: true }, "Add a setting…"));
    for (const def of free) {
      add.append(el("option", { value: def.property }, def.title));
    }
    card.append(el("div.setting.sub.space-row", {}, add));
  }
  return card;
}

function renderSpaces() {
  const lib = spaces();
  const manager = chromeWindow()?.gZenWorkspaces;
  const defs = lib.SETTINGS.map(spaceSetting).filter(Boolean);
  const focus = lib.takeFocus();
  const list = el("div.space-list");
  const featureBar = el(
    "div.infobar.caution",
    { role: "status" },
    icon("warning"),
    el(
      "div.infobar-text",
      {},
      el("strong", {}, "Settings per space are off"),
      el("span", {}, "Every space shows your settings."),
    ),
    el(
      "button.button",
      { onclick: () => Services.prefs.setBoolPref(SPACE_FEATURE, true) },
      "Turn on",
    ),
  );
  const draw = () => {
    featureBar.hidden = Services.prefs.getBoolPref(SPACE_FEATURE, true);
    const data = lib.readData();
    const all = manager?.getWorkspaces() ?? [];
    list.replaceChildren(
      ...(all.length
        ? all.map((space) =>
            spaceCard(space, defs, data, manager.activeWorkspace),
          )
        : [el("div.empty", {}, icon("layer"), "No spaces in this window")]),
    );
  };
  draw();
  watch(lib.DATA_PREF, draw);
  watch(SPACE_FEATURE, draw);
  if (focus) {
    setTimeout(() => {
      const card = list.querySelector(`[data-space="${CSS.escape(focus)}"]`);
      card?.scrollIntoView({ block: "center" });
      card?.setAttribute("focused", "");
    }, 50);
  }
  return [
    featureBar,
    el(
      "div.infobar",
      {},
      icon("info"),
      el(
        "div.infobar-text",
        {},
        el("strong", {}, "A space can look its own way"),
        el(
          "span",
          {},
          "Give a space its own mode, material, accent or site color: it takes them when you switch to it, and your settings come back in the other spaces. With several windows, the space of the window you use last decides.",
        ),
      ),
    ),
    section("", list),
  ];
}

// -------- Pages --------

function buildPages() {
  pages.push(
    {
      id: "overview",
      title: "Overview",
      icon: "home",
      description: "",
      render: renderOverview,
    },
    {
      id: "themes",
      title: "Themes",
      icon: "style-guide",
      description: "Ready-made looks, and your own as a file",
      render: renderThemes,
    },
  );
  for (const group of model.groups) {
    pages.push({
      id: group.id,
      title: group.title,
      description: group.description,
      icon: group.icon,
      group,
      render: renderGroup,
      prefs: group.items,
    });
  }
  if (model.features.length) {
    pages.push({
      id: "enhanced",
      title: "Enhanced",
      description: "The JavaScript features of Zen Fluent Enhanced",
      icon: "rocket",
      render: renderEnhanced,
      prefs: model.features.flatMap((f) => [f.pref, ...f.options]),
    });
  }
  if (model.prefs.has(SPACE_FEATURE)) {
    pages.push({
      id: "spaces",
      title: "Spaces",
      description: "Settings of their own for some of your spaces",
      icon: "layer",
      render: renderSpaces,
    });
  }
  if (model.mods.length) {
    pages.push({
      id: "mods",
      title: "Mods",
      description: "Sine's marketplace and your mods, with their compatibility",
      icon: "plug-connected",
      render: renderMods,
    });
  }
}

// The hash, not history.replaceState(): the page's address (about:) and its
// channel (chrome://) differ, and replaceState() throws SecurityError
function go(id) {
  if (location.hash.slice(1) === id) {
    route();
  } else {
    location.hash = id;
  }
}

function route() {
  const id = location.hash.slice(1) || "overview";
  const page = pages.find((p) => p.id === id) ?? pages[0];
  current = page;
  dropViewWatchers();
  document.title =
    page.id === "overview"
      ? "Zen Fluent settings"
      : `${page.title} – Zen Fluent`;
  const zones = zonePrefs(page);
  const scoped = scopedSpace() && page.prefs?.some((p) => perSpace(p.property));
  scopeShown = Boolean(scoped);
  const actions = [
    scopePicker(page),
    ...zones.map((pref) => zoneSwitch(pref, zones.length > 1)),
    ...(page.prefs?.length && !scoped ? [resetPageButton(page.prefs)] : []),
  ].filter(Boolean);
  const header = page.id === "overview" ? null : pageHeader(page, ...actions);
  const main = $("#main");
  const view = el("div.view");
  view.append(
    ...[
      header,
      zones.length ? zoneBanner(zones, view) : null,
      scoped ? scopeBanner(page) : null,
      ...page.render(page),
    ].filter(Boolean),
  );
  main.replaceChildren(view);
  main.scrollTop = 0;
  document.documentElement.dataset.page = page.id;
  window.dispatchEvent(new CustomEvent("zf-route", { detail: page.id }));
}

/** Every setting, for Zen's settings search (settings-page.uc.js). */
function settingsIndex() {
  const entries = [];
  for (const group of model.groups) {
    if (group.layout === "variants") {
      for (const name of ["global", ...Object.keys(PARTS)]) {
        const fill = variantPref(name, "fill");
        if (fill) {
          entries.push({
            property: fill.property,
            page: group.id,
            pageTitle: group.title,
            title: partName(name),
            description: "Fill and shape",
          });
        }
      }
      continue;
    }
    for (const pref of group.items) {
      entries.push({
        property: pref.property,
        page: group.id,
        pageTitle: group.title,
        title: pref.title,
        description: pref.description,
      });
    }
  }
  for (const preset of model.presets) {
    entries.push({
      property: `preset:${preset.id}`,
      page: "themes",
      pageTitle: "Themes",
      title: preset.name,
      description: preset.description,
    });
  }
  for (const mod of model.mods) {
    entries.push({
      property: `mod:${mod.name}`,
      page: "mods",
      pageTitle: "Mods",
      title: mod.name,
      description: mod.summary,
    });
  }
  for (const pref of model.features.flatMap((f) => [f.pref, ...f.options])) {
    entries.push({
      property: pref.property,
      page: "enhanced",
      pageTitle: "Enhanced",
      title: pref.title,
      description: pref.description,
    });
  }
  return entries;
}

/** Opens a setting's page and shows it: scrolled to, briefly outlined. */
function reveal(property) {
  const pref = model.prefs.get(property);
  const id = property.startsWith("preset:")
    ? "themes"
    : property.startsWith("mod:")
      ? "mods"
      : (pref?.group?.id ?? (pref ? "enhanced" : "overview"));
  if (current?.id !== id) {
    window.addEventListener("zf-route", () => reveal(property), { once: true });
    go(id);
    return;
  }
  if (current.reveal) {
    current.reveal(property);
    return;
  }
  const row = document.querySelector(`[data-pref="${CSS.escape(property)}"]`);
  if (!row) {
    return;
  }
  row.hidden = false;
  row.scrollIntoView({ block: "center" });
  row.removeAttribute("flash");
  requestAnimationFrame(() => row.setAttribute("flash", ""));
  row.querySelector("button, select, input")?.focus({ preventScroll: true });
}

// -------- Start --------

async function start() {
  if (!EMBED) {
    // One home: Zen's settings, which hold this page
    location.replace(
      `about:preferences#zenFluent${location.hash ? `-${location.hash.slice(1)}` : ""}`,
    );
    return;
  }
  syncAccent();
  // In French when Zen is: every text of the page, as it is drawn
  if (l10n.language()) {
    document.documentElement.lang = l10n.language();
    l10n.watch(document);
  }
  await load();
  if (!model.groups.length) {
    $("#main").replaceChildren(
      el(
        "div.empty",
        {},
        icon("warning"),
        el(
          "p",
          {},
          "Zen Fluent's settings could not be read: is Zen Fluent installed and enabled in Sine?",
        ),
      ),
    );
    return;
  }
  buildPages();
  window.addEventListener("hashchange", route);
  route();
  window.zfPages = pages.map(({ id, title, icon }) => ({ id, title, icon }));
  window.zfIndex = settingsIndex;
  window.zfReveal = reveal;
  document.documentElement.setAttribute("ready", "");
  window.dispatchEvent(new CustomEvent("zf-settings-ready"));
}

start();
