// Zen Fluent Enhanced: the archive of tabs, shared by every window.
//
// One JSON file in the profile, zen-fluent-archive.json:
//   { "version": 1, "tabs": [{ id, url, title, icon, workspaceId,
//     lastAccessed, archivedAt }] }, newest first.
// It is read once per process and written after each change through
// IOUtils' tmpPath (the data goes to a .tmp file, then replaces the
// archive): a crash during a write leaves the previous archive whole. A
// file that cannot be read is kept aside as .corrupt-<time>, never
// overwritten. Writes are queued, so two windows archiving at once do not
// interleave. Windows showing the archive subscribe to its changes.

const FILE = "zen-fluent-archive.json";
const VERSION = 1;
// A favicon in a data: URL can be large: past this, the entry keeps none
const MAX_ICON = 8192;

let entries = null;
let loading = null;
let writing = Promise.resolve();
const listeners = new Set();

function path() {
  return PathUtils.join(PathUtils.profileDir, FILE);
}

async function load() {
  if (entries) {
    return entries;
  }
  loading ??= (async () => {
    try {
      const data = await IOUtils.readJSON(path());
      entries = Array.isArray(data?.tabs) ? data.tabs : [];
    } catch (error) {
      entries = [];
      if (error.name !== "NotFoundError") {
        console.error("[Zen Fluent Enhanced] archive unreadable", error);
        await IOUtils.move(path(), `${path()}.corrupt-${Date.now()}`).catch(
          () => {},
        );
      }
    }
    return entries;
  })();
  return loading;
}

function save() {
  const data = { version: VERSION, tabs: entries };
  writing = writing
    .then(() => IOUtils.writeJSON(path(), data, { tmpPath: `${path()}.tmp` }))
    .catch((error) =>
      console.error("[Zen Fluent Enhanced] archive not saved", error),
    );
  for (const listener of listeners) {
    try {
      listener();
    } catch (error) {
      console.error(error);
    }
  }
  return writing;
}

/** Every archived tab, newest first (a copy). */
export async function list() {
  return [...(await load())];
}

/**
 * Archives tabs: resolves once they are on disk.
 *
 * @param {object[]} tabs - { url, title, icon, workspaceId, lastAccessed }
 * @returns {Promise<object[]>} the entries, with their id and archivedAt
 */
export async function add(tabs) {
  await load();
  const now = Date.now();
  const added = tabs.map((tab, index) => ({
    id: `${now.toString(36)}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    url: tab.url,
    title: tab.title || tab.url,
    icon: tab.icon && tab.icon.length <= MAX_ICON ? tab.icon : null,
    workspaceId: tab.workspaceId || null,
    lastAccessed: tab.lastAccessed || null,
    archivedAt: now,
  }));
  entries.unshift(...added);
  await save();
  return added;
}

/** Removes entries by id (restored or deleted). */
export async function remove(ids) {
  await load();
  const gone = new Set(ids);
  entries = entries.filter((entry) => !gone.has(entry.id));
  return save();
}

/** Drops entries archived more than `days` days ago. */
export async function prune(days) {
  await load();
  const limit = Date.now() - days * 24 * 60 * 60 * 1000;
  const kept = entries.filter((entry) => entry.archivedAt >= limit);
  if (kept.length !== entries.length) {
    entries = kept;
    await save();
  }
}

/** Calls fn after every change; returns the function that stops it. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Resolves when every queued write is on disk (tests, shutdown). */
export function flushed() {
  return writing;
}
