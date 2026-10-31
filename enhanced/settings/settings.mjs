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
};
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
};
// The Home page's shortcuts to the main choices
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

function read(pref) {
  const { property, type, defaultValue } = pref;
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

/** Back to the default. A text setting keeps a value, for Sine's variable. */
function reset(pref) {
  if (pref.type === "string") {
    write(pref, pref.defaultValue);
  } else {
    Services.prefs.clearUserPref(pref.property);
  }
}

const isDefault = (pref) => read(pref) === pref.defaultValue;

/** What to put back for Undo: each pref's user value, or none. */
function snapshot(prefs) {
  return prefs.map((pref) => ({
    pref,
    had: Services.prefs.prefHasUserValue(pref.property),
    value: read(pref),
  }));
}
function restore(saved) {
  for (const { pref, had, value } of saved) {
    if (had || pref.type === "string") {
      write(pref, value);
    } else {
      Services.prefs.clearUserPref(pref.property);
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
    const other = model.prefs.get(test?.property);
    const value = other
      ? read(other)
      : Services.prefs.getStringPref(test?.property, "");
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
    group.items.push(pref);
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
  observePrefs(model.prefs.keys());
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
    action &&
      el(
        "button.toast-action",
        {
          onclick: () => {
            action.run();
            box.removeAttribute("shown");
          },
        },
        action.label,
      ),
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
    onclick: () => write(pref, !read(pref)),
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
    onchange: () => write(pref, select.value),
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
      write(pref, value);
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
function settingRow(pref, { iconName, iconBase, extraClass = "" } = {}) {
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
      el("span.setting-title", { id }, pref.title),
      pref.description ? el("span.setting-desc", {}, pref.description) : null,
    ),
    el("div.setting-actions", {}, resetButton([pref], row), control(pref, id)),
  );
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
    { onclick: () => applyPreset(preset), "aria-pressed": "false" },
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
        onclick: () => write(pref, option.value),
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
      { role: "radio", onclick: () => write(pref, value) },
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
      onclick: () => write(pref, option.value),
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

function heroSummary() {
  const chips = el("div.chips");
  const update = () =>
    chips.replaceChildren(
      ...[HOME.style, HOME.material, HOME.accent].map((p) =>
        el("span.chip", {}, optionLabel(p)),
      ),
    );
  update();
  for (const property of [HOME.style, HOME.material, HOME.accent]) {
    watch(property, update);
  }
  return chips;
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

function renderHome(page) {
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
      heroSummary(),
      el(
        "div.hero-actions",
        {},
        el(
          "button.button.accent",
          { onclick: () => go("appearance") },
          "Customize",
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

  const styleArt = (value) =>
    el("span.tile-art", { "data-style": value }, el("i"), el("i"), el("i"));
  const materialArt = (value) =>
    el("span.tile-art.material", { "data-material": value }, el("i"));

  const customRow = model.prefs.get(HOME.accentCustom)
    ? settingRow(model.prefs.get(HOME.accentCustom))
    : null;

  return [
    hero,
    iconsWarning(),
    section(
      "Presets",
      el("div.preset-grid", { id: "presets" }, model.presets.map(presetCard)),
    ),
    section(
      "Style",
      el(
        "div.card.panel",
        {},
        choiceTiles(
          HOME.style,
          {
            winui: "Windows 11 controls, Mica and WinUI corners",
            edge: "Microsoft Edge: a framed page, rounder tabs",
          },
          styleArt,
        ),
      ),
    ),
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
    ...aboutSections(),
  ];
}

// -------- Variants: a window with a pin on each component --------

// Each component's look when it says Auto and Everywhere does too: the
// fill and shape Zen Fluent gives it on its own
const PARTS = {
  buttons: { fill: "subtle", shape: "rounded" },
  urlbar: { fill: "solid", shape: "rounded" },
  "urlbar-buttons": { fill: "subtle", shape: "rounded" },
  extensions: { fill: "subtle", shape: "rounded" },
  badges: { fill: "solid", shape: "pill" },
  essentials: { fill: "solid", shape: "rounded" },
  "pinned-tabs": { fill: "subtle", shape: "rounded" },
  folders: { fill: "subtle", shape: "rounded" },
  tabs: { fill: "subtle", shape: "rounded" },
  spaces: { fill: "subtle", shape: "rounded" },
  "panel-buttons": { fill: "solid", shape: "rounded" },
};
const FILL_HELP = {
  auto: "Follows Everywhere",
  solid: "A raised control, like a WinUI button",
  subtle: "A fill only on hover and when selected",
  ghost: "No fill; the accent on hover",
  outline: "A thin stroke, no fill",
  pill: "A pill with its own fill",
};
const shortLabel = (label) => label.replace(/\s*\(.*\)$/, "");

const variantPref = (part, kind) =>
  model.prefs.get(
    `zen-fluent.variant.${part}${kind === "shape" ? "-shape" : ""}`,
  );

/** The fill or shape a component shows: its own, else Everywhere's. */
function effective(part, kind) {
  const own = read(variantPref(part, kind));
  if (own !== "auto") {
    return own;
  }
  const global = read(variantPref("global", kind));
  return global !== "auto" ? global : PARTS[part]?.[kind];
}

const partName = (part) =>
  variantPref(part, "fill")?.title.replace(/:\s*fill$/i, "") ?? part;

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
        title: kind === "fill" ? (FILL_HELP[option.value] ?? "") : "",
        onclick: () => write(pref, option.value),
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
      {},
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

  // A TeachingTip with the fill and shape of one component
  const tip = el("div.vz-tip", { role: "dialog", hidden: true });
  stage.append(tip);
  let open = null;
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
  };
  const openTip = (name) => {
    if (open === name) {
      closeTip();
      return;
    }
    closeTip(false);
    open = name;
    const region = regionOf(name);
    region.setAttribute("active", "");
    const fill = variantPref(name, "fill");
    const shape = variantPref(name, "shape");
    const titleId = `zf-tip-${++uid}`;
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
        "Auto takes Everywhere's choice, or this component's own look.",
      ),
      el("span.vz-label", {}, "Fill"),
      variantChips(fill, "fill"),
      el("span.vz-label", {}, "Shape"),
      variantChips(shape, "shape"),
      el(
        "div.vz-tip-footer",
        {},
        el(
          "button.button",
          {
            onclick: () => {
              const saved = snapshot([fill, shape]);
              reset(fill);
              reset(shape);
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
    const region = event.target.closest(".vz-part");
    if (region) {
      openTip(region.dataset.part);
    } else {
      closeTip(false);
    }
  });
  stage.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      closeTip();
    }
  });

  // Every component's current look, its pin, and the list of changes
  const changes = el("div.vz-changes");
  const look = (name) =>
    [variantPref(name, "fill"), variantPref(name, "shape")]
      .map((pref) => shortLabel(optionLabel(pref.property)))
      .join(" · ");
  const isChanged = (name) =>
    !isDefault(variantPref(name, "fill")) ||
    !isDefault(variantPref(name, "shape"));
  const update = () => {
    for (const name of parts) {
      const region = regionOf(name);
      const fill = effective(name, "fill");
      region.dataset.fill = fill;
      region.dataset.shape =
        fill === "pill" ? "pill" : effective(name, "shape");
      const pin = region.querySelector(".vz-pin");
      pin.toggleAttribute("changed", isChanged(name));
      pin.setAttribute("aria-label", `${partName(name)}: ${look(name)}`);
      pin.title = `${partName(name)}: ${look(name)}`;
    }
    const changed = parts.filter(isChanged);
    changes.replaceChildren(
      ...(changed.length
        ? changed.map((name) =>
            el(
              "span.vz-tag",
              {},
              el(
                "button.vz-tag-main",
                { onclick: () => openTip(name) },
                el("span.vz-tag-number", {}, String(n(name))),
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
              "Every component follows Everywhere. Click a pin to give one its own look.",
            ),
          ]),
    );
  };
  update();
  for (const name of ["global", ...parts]) {
    watch(variantPref(name, "fill").property, update);
    watch(variantPref(name, "shape").property, update);
  }
  page.reveal = (property) => {
    const name = property
      .replace("zen-fluent.variant.", "")
      .replace(/-shape$/, "");
    if (parts.includes(name)) {
      regionOf(name).scrollIntoView({ block: "center" });
      openTip(name);
    }
  };

  return [
    section(
      "Everywhere",
      el(
        "div.card.panel.vz-everywhere",
        { "data-pref": "zen-fluent.variant.global" },
        el(
          "p.setting-desc",
          {},
          "The fill and shape of every component left on Auto.",
        ),
        el("span.vz-label", {}, "Fill"),
        variantChips(variantPref("global", "fill"), "fill"),
        el("span.vz-label", {}, "Shape"),
        variantChips(variantPref("global", "shape"), "shape"),
      ),
    ),
    section(
      "Components",
      el(
        "p.section-desc",
        {},
        "Click a pin, or the part of the window it marks, to choose that component's fill and shape. The drawing shows a selected item, one under the pointer and one at rest.",
      ),
      stage,
    ),
    section("Your changes", changes),
  ];
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
  return [section("", ...stagger(rows))];
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
    section("", ...stagger(cards)),
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
      onclick: () =>
        chromeWindow().openWebLinkIn(url, "tab", {
          triggeringPrincipal:
            Services.scriptSecurityManager.getSystemPrincipal(),
        }),
    },
    icon(iconName),
    el("span", {}, label),
    icon("open"),
  );
}

function aboutSections() {
  const file = el("input", {
    type: "file",
    accept: ".json,application/json",
    hidden: true,
    onchange: () => file.files[0] && importSettings(file.files[0]),
  });
  const every = [...model.prefs.values()].filter((p) =>
    p.property.startsWith("zen-fluent."),
  );
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
      "Your settings",
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
            "Every setting you changed, in a JSON file",
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
    ),
    section(
      "Links",
      link("Source code and issues", REPO, "link"),
      link("Documentation", `${REPO}/tree/main/docs`, "info"),
      link("What's new", `${REPO}/blob/main/CHANGELOG.md`, "flash"),
    ),
  ];
}

// -------- Pages --------

function buildPages() {
  pages.push({
    id: "home",
    title: "Home",
    icon: "home",
    description: "",
    render: renderHome,
  });
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
  const id = location.hash.slice(1) || "home";
  const page = pages.find((p) => p.id === id) ?? pages[0];
  current = page;
  dropViewWatchers();
  document.title =
    page.id === "home" ? "Zen Fluent settings" : `${page.title} – Zen Fluent`;
  const actions = page.prefs?.length ? [resetPageButton(page.prefs)] : [];
  const header = page.id === "home" ? null : pageHeader(page, ...actions);
  const main = $("#main");
  main.replaceChildren(el("div.view", {}, [header, ...page.render(page)]));
  main.scrollTop = 0;
  window.dispatchEvent(new CustomEvent("zf-route", { detail: page.id }));
}

/** Every setting, for Zen's settings search (settings-page.uc.js). */
function settingsIndex() {
  const entries = [];
  for (const group of model.groups) {
    if (group.layout === "variants") {
      for (const name of Object.keys(PARTS)) {
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
  const id = pref?.group?.id ?? (pref ? "enhanced" : "home");
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
