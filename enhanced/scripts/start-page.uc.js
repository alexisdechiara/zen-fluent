// Zen Fluent Enhanced: a start page for new tabs.
//
// While checked, new tabs open enhanced/start/start.html: a greeting and
// the time, a search field with the default engine, the top sites, on the
// space's background (the page: enhanced/start/). It takes the place of
// Firefox's new tab page (AboutNewTab.newTabURL, unless an extension
// already replaced it), and turns off Zen's "replace the new tab with the
// URL bar" (zen.urlbar.replace-newtab), which would never show it. Its
// address stays out of the URL bar, as Firefox's own new tab. Unchecked,
// both come back as they were.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { AboutNewTab } = ChromeUtils.importESModule(
    "resource:///modules/AboutNewTab.sys.mjs",
  );

  const URL = "chrome://sine/content/Zen-Fluent-Enhanced/start/start.html";
  const REPLACE = "zen.urlbar.replace-newtab";
  // set while this feature has turned Zen's replacement off
  const TOOK_OVER = "zen-fluent.enhanced.start-page.replace-newtab-off";

  const feature = ZFFeature.attach(window, {
    name: "start-page",
    start(ctx) {
      const win = ctx.window;
      if (!AboutNewTab.newTabURLOverridden || AboutNewTab.newTabURL === URL) {
        AboutNewTab.newTabURL = URL;
      }
      if (Services.prefs.getBoolPref(REPLACE, true)) {
        Services.prefs.setBoolPref(REPLACE, false);
        Services.prefs.setBoolPref(TOOK_OVER, true);
      }
      // an empty URL bar on the page, as on Firefox's new tab
      if (
        Array.isArray(win.gInitialPages) &&
        !win.gInitialPages.includes(URL)
      ) {
        win.gInitialPages.push(URL);
        ctx.onCleanup(() => {
          const i = win.gInitialPages.indexOf(URL);
          if (i >= 0) {
            win.gInitialPages.splice(i, 1);
          }
        });
      }
    },
    stop() {
      // Unchecked (not a closed window): Firefox's and Zen's new tab back
      if (Services.prefs.getBoolPref("zen-fluent.enhanced.start-page", false)) {
        return;
      }
      if (AboutNewTab.newTabURL === URL) {
        AboutNewTab.resetNewTabURL();
      }
      if (Services.prefs.getBoolPref(TOOK_OVER, false)) {
        Services.prefs.clearUserPref(REPLACE);
        Services.prefs.clearUserPref(TOOK_OVER);
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
