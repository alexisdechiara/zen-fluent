// Zen Fluent Enhanced: about:zen-fluent, Zen Fluent's settings page.
//
// The page is enhanced/settings/settings.html, served under about:zen-fluent
// by an about: module registered in the parent process. Without
// URI_CAN_LOAD_IN_CHILD it loads in the parent with the system principal,
// so its script reads and writes prefs directly. The module stays
// registered while at least one window runs the settings-page feature
// (useAboutPage() counts them).

export const SETTINGS_URL = "about:zen-fluent";
const PAGE = "chrome://sine/content/Zen-Fluent-Enhanced/settings/settings.html";
const CID = Components.ID("{7c3f0a52-94d1-4f6b-a1c8-2e5b9d0f4a63}");
const CONTRACT = "@mozilla.org/network/protocol/about;1?what=zen-fluent";

const aboutModule = {
  QueryInterface: ChromeUtils.generateQI(["nsIAboutModule"]),
  newChannel(uri, loadInfo) {
    const channel = Services.io.newChannelFromURIWithLoadInfo(
      Services.io.newURI(PAGE),
      loadInfo,
    );
    channel.originalURI = uri;
    return channel;
  },
  getURIFlags() {
    return (
      Ci.nsIAboutModule.ALLOW_SCRIPT | Ci.nsIAboutModule.IS_SECURE_CHROME_UI
    );
  },
  getChromeURI() {
    return Services.io.newURI(PAGE);
  },
};

const factory = {
  QueryInterface: ChromeUtils.generateQI(["nsIFactory"]),
  createInstance(iid) {
    return aboutModule.QueryInterface(iid);
  },
};

let users = 0;

/**
 * Registers about:zen-fluent until the returned function is called.
 *
 * @returns {() => void} Releases this window's use of the page.
 */
export function useAboutPage() {
  const registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  if (users++ === 0 && !registrar.isCIDRegistered(CID)) {
    registrar.registerFactory(CID, SETTINGS_URL, CONTRACT, factory);
  }
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    if (--users === 0 && registrar.isCIDRegistered(CID)) {
      registrar.unregisterFactory(CID, factory);
    }
  };
}

/**
 * Selects the settings tab, or opens one.
 *
 * @param {Window} win - A browser window.
 * @param {string} [section] - A page of the settings, e.g. "tabs".
 */
export function openSettings(win, section = "") {
  const url = section ? `${SETTINGS_URL}#${section}` : SETTINGS_URL;
  win.switchToTabHavingURI(url, true, {
    ignoreFragment: "whenComparingAndReplace",
    triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
  });
}
