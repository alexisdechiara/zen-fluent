// Zen Fluent Enhanced: Fluent defaults for the mods Zen Fluent styles, for settings never changed.
//
// Zen Calmer Context Menu (sinazadeh/zen-calmer-context-menu) keeps its
// options in prefs it only writes when they are changed: while one is
// missing, Zen Fluent gives it the value closest to Windows 11's menus.
// Icons on every option, in the Fluent icon set, and the quick actions as
// a row of buttons at the top of the tab menu (the command bar of File
// Explorer's menu). A pref that exists (set by its settings page, Sine or
// about:config) is never touched, nor an option whose alternative was
// picked. Its "Menu color" choice is left to Zen Fluent's Menu tint
// (core/src/features/menu-tint.css), and hidden from its settings page.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  // [mod folder, [pref, value, prefs that rule it out]...]
  const DEFAULTS = [
    [
      "zen-context-menu",
      [
        ["uc.fixcontext.iconpack", "fluent", []],
        ["uc.fixcontext.restoreicons", true, ["uc.hidecontext.icons"]],
        ["uc.fixcontext.tabactions", true, []],
      ],
    ],
  ];

  const missing = (pref) =>
    Services.prefs.getPrefType(pref) === Services.prefs.PREF_INVALID;

  const feature = ZFFeature.attach(window, {
    name: "mod-defaults",
    default: true,
    async start() {
      const mods = PathUtils.join(
        Services.dirsvc.get("ProfD", Ci.nsIFile).path,
        "chrome",
        "sine-mods",
      );
      for (const [folder, prefs] of DEFAULTS) {
        if (!(await IOUtils.exists(PathUtils.join(mods, folder)))) {
          continue;
        }
        for (const [pref, value, rivals] of prefs) {
          if (!missing(pref) || rivals.some((rival) => !missing(rival))) {
            continue;
          }
          if (typeof value === "boolean") {
            Services.prefs.setBoolPref(pref, value);
          } else {
            Services.prefs.setStringPref(pref, value);
          }
        }
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
