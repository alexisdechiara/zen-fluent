// Zen Fluent Enhanced: settings per space, shared by every window and the settings page.
//
// A space can give its own value to a few settings that change the whole
// window (SETTINGS): its mode, material, accent, the site color… Prefs are
// global, so the space shown in the window you use last wins: when it
// changes (a space switch, another window brought to the front), the
// settings it overrides are written, and those it leaves alone go back to
// the value they had before any space changed them (the base). One pref,
// zen-fluent.enhanced.space-settings.data, holds it all as JSON:
//   { spaces: { <uuid>: { <pref>: value } },  the overrides (null: the
//                                              setting's default)
//     base: { <pref>: value | null },         values to put back (null:
//                                              the pref had no user value)
//     current: <uuid> }                       the space applied last
// A setting changed while a space overrides it (from Sine, the settings
// page, a shortcut) becomes that space's value: it is what you see.

const DATA = "zen-fluent.enhanced.space-settings.data";
const FEATURE = "zen-fluent.enhanced.space-settings";

/** What a space can override: the settings that change the whole window. */
export const SETTINGS = [
  { property: "zen.view.window.scheme", type: "int" },
  { property: "zen-fluent.style", type: "string" },
  { property: "zen-fluent.material", type: "string" },
  { property: "zen-fluent.tint-opacity", type: "string" },
  { property: "zen-fluent.space-color", type: "string" },
  { property: "zen-fluent.accent", type: "string" },
  { property: "zen-fluent.density", type: "string" },
  { property: "zen-fluent.url-floating-color", type: "string" },
  { property: "zen-fluent.enhanced.site-color", type: "bool" },
  { property: "zen-fluent.enhanced.site-color.strength", type: "string" },
  { property: "zen-fluent.enhanced.adaptive-accent", type: "bool" },
  { property: "zen-fluent.enhanced.window-glow", type: "bool" },
];
const TYPES = new Map(SETTINGS.map((s) => [s.property, s.type]));

export const DATA_PREF = DATA;

export function readData() {
  try {
    const data = JSON.parse(Services.prefs.getStringPref(DATA, "{}"));
    return {
      spaces: data.spaces ?? {},
      base: data.base ?? {},
      current: data.current ?? null,
    };
  } catch {
    return { spaces: {}, base: {}, current: null };
  }
}

function save(data) {
  for (const [id, overrides] of Object.entries(data.spaces)) {
    if (!Object.keys(overrides).length) {
      delete data.spaces[id];
    }
  }
  Services.prefs.setStringPref(DATA, JSON.stringify(data));
}

const enabled = () => Services.prefs.getBoolPref(FEATURE, true);

/** The pref's user value, or null when it has none (its default shows). */
function live(property) {
  if (!Services.prefs.prefHasUserValue(property)) {
    return null;
  }
  try {
    switch (TYPES.get(property)) {
      case "bool":
        return Services.prefs.getBoolPref(property);
      case "int":
        return Services.prefs.getIntPref(property);
      default:
        return Services.prefs.getStringPref(property);
    }
  } catch {
    return null;
  }
}

// Our own writes, which the observer must not take for the user's
const writing = new Set();
function write(property, value) {
  writing.add(property);
  try {
    if (value === null || value === undefined) {
      Services.prefs.clearUserPref(property);
    } else if (typeof value === "boolean") {
      Services.prefs.setBoolPref(property, value);
    } else if (typeof value === "number") {
      Services.prefs.setIntPref(property, value);
    } else {
      Services.prefs.setStringPref(property, String(value));
    }
  } catch (error) {
    console.error(`[Zen Fluent] cannot set ${property}`, error);
  } finally {
    writing.delete(property);
  }
}

/** Puts the space's overrides in place, and the base under the others. */
export function activate(spaceId) {
  if (!spaceId || !enabled()) {
    return;
  }
  const data = readData();
  const overrides = data.spaces[spaceId] ?? {};
  for (const { property } of SETTINGS) {
    if (property in overrides) {
      if (!(property in data.base)) {
        data.base[property] = live(property);
      }
      if (live(property) !== overrides[property]) {
        write(property, overrides[property]);
      }
    } else if (property in data.base) {
      write(property, data.base[property]);
      delete data.base[property];
    }
  }
  data.current = spaceId;
  save(data);
}

/**
 * Your own value of a setting (null: its default), the one spaces without
 * an override show: while the current space overrides it, it is kept for
 * later instead of written.
 */
export function setBase(property, value) {
  const data = readData();
  const overrides = data.current && data.spaces[data.current];
  if (enabled() && overrides && property in overrides) {
    data.base[property] = value;
    save(data);
  } else {
    write(property, value);
  }
}

/** True for a setting a space can override. */
export const overridable = (property) => TYPES.has(property);

/** Every setting back to its base (the feature turned off). */
export function restoreAll() {
  const data = readData();
  for (const [property, value] of Object.entries(data.base)) {
    write(property, value);
  }
  data.base = {};
  data.current = null;
  save(data);
}

/** A space's value for one setting (null: its default); undefined
    removes the override. */
export function setOverride(spaceId, property, value) {
  if (!TYPES.has(property)) {
    return;
  }
  const data = readData();
  const overrides = (data.spaces[spaceId] ??= {});
  if (value === undefined) {
    delete overrides[property];
  } else {
    overrides[property] = value;
  }
  save(data);
  if (data.current === spaceId) {
    activate(spaceId);
  }
}

/** Removes every override of a space. */
export function clearSpace(spaceId) {
  const data = readData();
  delete data.spaces[spaceId];
  save(data);
  if (data.current === spaceId) {
    activate(spaceId);
  }
}

/** Forgets the spaces that no longer exist. */
export function prune(existingIds) {
  if (!existingIds.length) {
    return;
  }
  const data = readData();
  const gone = Object.keys(data.spaces).filter(
    (id) => !existingIds.includes(id),
  );
  if (gone.length) {
    gone.forEach((id) => delete data.spaces[id]);
    save(data);
  }
}

// The space the settings page opens on (a space's context menu)
let focus = null;
export function requestFocus(spaceId) {
  focus = spaceId || null;
}
export function takeFocus() {
  const id = focus;
  focus = null;
  return id;
}

/** The base value of a setting: what spaces without an override show. */
export function baseValue(property) {
  const data = readData();
  return property in data.base ? data.base[property] : live(property);
}

// A setting changed by hand while the current space overrides it: the
// space keeps the new value
const observer = {
  observe(_subject, _topic, property) {
    if (writing.has(property) || !enabled()) {
      return;
    }
    const data = readData();
    const overrides = data.current && data.spaces[data.current];
    if (overrides && property in overrides) {
      // null: reset, the space shows the default
      overrides[property] = live(property);
      save(data);
    }
  },
};
let observing = false;
export function observe() {
  if (observing) {
    return;
  }
  observing = true;
  for (const { property } of SETTINGS) {
    Services.prefs.addObserver(property, observer);
  }
}
