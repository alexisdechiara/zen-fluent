// Zen Fluent Enhanced: which tabs may sleep, putting them to sleep, and the
// memory Zen uses.
//
// The rules of the Sleeping tabs feature (performance.uc.js), shared with
// the efficiency card. A tab sleeps through Firefox's own discardBrowser,
// which keeps the tab and its history and reloads it when it is selected;
// Firefox itself refuses a page that would ask before leaving or shows a
// dialog (canSleep leaves out the first already, so that a count is
// right). On top of that a tab stays awake when it is the selected one,
// plays sound, shares the camera, microphone or screen, is in
// Picture-in-Picture, is a Glance, or is part of the split view on screen.
//
// API: loaded(tab), canSleep(win, tab), sleepTabs(win, tabs) (how many
// fell asleep), zenMemory() ({ total, byPid }: bytes for every process
// of Zen, from ChromeUtils.requestProcInfo, about 10 ms).

/** A tab whose page is loaded in a content process. */
export function loaded(tab) {
  return Boolean(
    !tab.closing &&
    !tab.hasAttribute("pending") &&
    !tab.hasAttribute("zen-empty-tab") &&
    tab.linkedPanel &&
    tab.linkedBrowser?.isRemoteBrowser,
  );
}

/** Part of the split view the window shows. */
function onScreenSplit(win, tab) {
  const splitter = win.gZenViewSplitter;
  return Boolean(
    tab.splitView &&
    splitter?.currentView >= 0 &&
    splitter._data[splitter.currentView]?.tabs.includes(tab),
  );
}

/**
 * A tab of win that may sleep (never the selected one). A page that would
 * ask before leaving is left out here too, so that a count of these tabs
 * matches what discardBrowser then does.
 */
export function canSleep(win, tab) {
  return (
    loaded(tab) &&
    !tab.selected &&
    !tab.linkedBrowser.hasBeforeUnload &&
    !tab.hasAttribute("soundplaying") &&
    !tab.hasAttribute("sharing") &&
    !tab.pictureinpicture &&
    !tab.hasAttribute("zen-glance-tab") &&
    !onScreenSplit(win, tab)
  );
}

/**
 * Puts tabs to sleep; Firefox skips a page that would ask before leaving.
 *
 * @returns {number} How many fell asleep.
 */
export function sleepTabs(win, tabs) {
  return tabs.filter((tab) => win.gBrowser.discardBrowser(tab, false)).length;
}

/**
 * The memory of every process of Zen.
 *
 * @returns {Promise<{total: number, byPid: Map<number, number>}>} Bytes.
 */
export async function zenMemory() {
  const info = await ChromeUtils.requestProcInfo();
  let total = info.memory;
  const byPid = new Map();
  for (const child of info.children) {
    total += child.memory;
    byPid.set(child.pid, child.memory);
  }
  return { total, byPid };
}
