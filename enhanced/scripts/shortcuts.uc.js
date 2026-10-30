// Zen Fluent Enhanced: keyboard shortcuts for the density, the window theme
// and the material.
//
//   Ctrl+Alt+Shift+D  density: standard <-> compact (zen-fluent.density)
//   Ctrl+Alt+Shift+T  window theme: automatic -> light -> dark
//                     (Zen's zen.view.window.scheme, as its View menu)
//   Ctrl+Alt+Shift+M  material: Mica -> Mica Alt -> Acrylic
//                     (zen-fluent.material)
//
// Keys are read by position (event.code), so they stay on the same keys on
// any layout. Each change shows its new value in a toast.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );

  /** Sets a string pref to the value after its current one. */
  function cycle(pref, names, fallback) {
    const values = Object.keys(names);
    const current = Services.prefs.getStringPref(pref, fallback);
    const next = values[(values.indexOf(current) + 1) % values.length];
    Services.prefs.setStringPref(pref, next);
    return names[next];
  }

  const ACTIONS = {
    KeyD: () =>
      `Density: ${cycle(
        "zen-fluent.density",
        { standard: "Standard", compact: "Compact" },
        "standard",
      )}`,
    KeyT() {
      // Zen's values: 2 automatic, 1 light, 0 dark
      const pref = "zen.view.window.scheme";
      const order = [2, 1, 0];
      const names = ["Dark", "Light", "Automatic"];
      const current = Services.prefs.getIntPref(pref, 2);
      const next = order[(order.indexOf(current) + 1) % order.length];
      Services.prefs.setIntPref(pref, next);
      return `Theme: ${names[next]}`;
    },
    KeyM: () =>
      `Material: ${cycle(
        "zen-fluent.material",
        { mica: "Mica", "mica-alt": "Mica Alt", acrylic: "Acrylic" },
        "mica",
      )}`,
  };

  const feature = ZFFeature.attach(window, {
    name: "shortcuts",
    default: true,
    start(ctx) {
      ctx.listen(
        ctx.window,
        "keydown",
        (event) => {
          const action = ACTIONS[event.code];
          if (
            !action ||
            event.repeat ||
            !event.ctrlKey ||
            !event.altKey ||
            !event.shiftKey ||
            event.metaKey
          ) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          showToast(ctx.window, action());
        },
        true,
      );
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
