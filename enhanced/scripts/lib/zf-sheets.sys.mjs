// Zen Fluent Enhanced: style sheets for every document, web pages included.
//
// Sine's content sheet never reaches web pages (CLAUDE.md), but the style
// sheet service does: a sheet registered there applies to every document
// of every process, chrome windows too, so each sheet scopes itself with
// @-moz-document. Registration is global while features run per window:
// each window's feature calls useSheet() and the release function it
// returns on stop; the sheet goes away with its last user.

const sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(
  Ci.nsIStyleSheetService,
);
const users = new Map();

/**
 * @param {string} url - A chrome:// URL of the sheet.
 * @param {"agent"|"user"} level - "agent" sits under the page's own CSS
 *   (it only replaces the browser's defaults); "user" can win over it.
 * @returns {Function} release
 */
export function useSheet(url, level) {
  const type = level === "agent" ? sss.AGENT_SHEET : sss.USER_SHEET;
  const key = `${type} ${url}`;
  const uri = Services.io.newURI(url);
  const count = users.get(key) ?? 0;
  if (count === 0 && !sss.sheetRegistered(uri, type)) {
    sss.loadAndRegisterSheet(uri, type);
  }
  users.set(key, count + 1);
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    const left = users.get(key) - 1;
    users.set(key, left);
    if (left === 0 && sss.sheetRegistered(uri, type)) {
      sss.unregisterSheet(uri, type);
    }
  };
}
