// Zen Fluent Enhanced: compact mode for one window, without changing the
// next startup.
//
// Zen 1.24 keeps compact mode per window, but each toggle also writes
// zen.view.compact.enable-at-startup, the state every window starts in.
// A feature that turns it on for a while (a quick window, a focus
// session) would then leave the next start in compact mode: this puts the
// startup value back once Zen has written it (after its animation).

// not the window's timer: a quick window can close before it fires
import { setTimeout } from "resource://gre/modules/Timer.sys.mjs";

const STARTUP_PREF = "zen.view.compact.enable-at-startup";
const WRITE_DELAY = 1500;

/**
 * Turns compact mode on or off in win only.
 *
 * @param {Window} win - A browser window.
 * @param {boolean} value - Compact mode on or off.
 * @returns {boolean} Whether it changed anything.
 */
export function setCompact(win, value) {
  const manager = win.gZenCompactModeManager;
  if (!manager || manager.preference === value) {
    return false;
  }
  const startup = Services.prefs.getBoolPref(STARTUP_PREF, false);
  manager.preference = value;
  setTimeout(
    () => Services.prefs.setBoolPref(STARTUP_PREF, startup),
    WRITE_DELAY,
  );
  return true;
}
