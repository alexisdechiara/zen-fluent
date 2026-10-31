// Zen Fluent Enhanced: Zen Fluent's actions in the Zen Command Palette mod.
//
// When the Command Palette mod (Vertex-Mods/Zen-Command-Palette) is
// installed, its window.ZenCommandPalette gets Zen Fluent's commands:
//   - each setting of Quick Settings (enhanced/quick-settings.json), one
//     command per other value, with the labels of core/preferences.json
//     ("Zen Fluent: Backdrop material: Acrylic");
//   - the presets ("Zen Fluent preset: Taskbar");
//   - each Enhanced feature turned on or off;
//   - the panels of the features that have one (Quick Settings, archived
//     tabs, browsing stats, the shortcuts sheet, Snap layouts, Performance) and Zen Fluent's settings
//     page.
// A command only shows when it changes something (its condition). The
// palette's script runs after this one (Sine loads mods in id order) and
// again on its own rebuilds: a timer adds the commands to whichever palette
// is on the window and does nothing without one.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const CORE_PREFS = "chrome://sine/content/Zen-Fluent/core/preferences.json";
  const ENHANCED_PREFS =
    "chrome://sine/content/Zen-Fluent-Enhanced/preferences.json";
  const QUICK = "chrome://sine/content/Zen-Fluent-Enhanced/quick-settings.json";
  const PREFIX = "zen-fluent:";
  const TAGS = ["zen fluent", "fluent", "theme"];

  /** A Sine label without its grey description (~…~). */
  const plain = (label) => label.replace(/\s*~[^~]*~\s*/g, " ").trim();

  const current = (pref) =>
    pref.type === "checkbox"
      ? Services.prefs.getBoolPref(pref.property, pref.defaultValue)
      : Services.prefs.getStringPref(pref.property, pref.defaultValue);

  function settingCommands(prefs, quick) {
    const commands = [];
    for (const property of quick.settings) {
      const pref = prefs.get(property);
      if (!pref) {
        continue;
      }
      const name = quick.labels?.[property] ?? plain(pref.label);
      if (pref.type === "checkbox") {
        for (const on of [true, false]) {
          commands.push({
            key: `${PREFIX}${property}:${on}`,
            label: `Zen Fluent: ${name}: ${on ? "On" : "Off"}`,
            command: () => Services.prefs.setBoolPref(property, on),
            condition: () => current(pref) !== on,
            tags: TAGS,
          });
        }
        continue;
      }
      for (const option of pref.options ?? []) {
        commands.push({
          key: `${PREFIX}${property}:${option.value}`,
          label: `Zen Fluent: ${name}: ${plain(option.label)}`,
          command: () => Services.prefs.setStringPref(property, option.value),
          condition: () => current(pref) !== option.value,
          tags: [...TAGS, plain(option.label)],
        });
      }
    }
    for (const preset of quick.presets ?? []) {
      const entries = Object.entries(preset.prefs);
      const applied = () =>
        entries.every(([property, value]) => {
          const pref = prefs.get(property);
          return pref && current(pref) === value;
        });
      commands.push({
        key: `${PREFIX}preset:${preset.id}`,
        label: `Zen Fluent preset: ${preset.name}`,
        command() {
          for (const [property, value] of entries) {
            if (typeof value === "boolean") {
              Services.prefs.setBoolPref(property, value);
            } else {
              Services.prefs.setStringPref(property, value);
            }
          }
        },
        condition: () => !applied(),
        tags: [...TAGS, "preset", preset.description],
      });
    }
    return commands;
  }

  /** On and off for each feature (zen-fluent.enhanced.<name>, no option). */
  function featureCommands(enhancedPrefs) {
    return enhancedPrefs
      .filter(
        (pref) =>
          pref.type === "checkbox" &&
          /^zen-fluent\.enhanced\.[a-z-]+$/.test(pref.property) &&
          pref.property !== "zen-fluent.enhanced.command-palette",
      )
      .flatMap((pref) =>
        [true, false].map((on) => ({
          key: `${PREFIX}${pref.property}:${on}`,
          label: `Zen Fluent Enhanced: ${on ? "Turn on" : "Turn off"} ${plain(pref.label)}`,
          command: () => Services.prefs.setBoolPref(pref.property, on),
          condition: () => current(pref) !== on,
          tags: [...TAGS, "enhanced"],
        })),
      );
  }

  /** The features' panels, through the menu items and buttons they add. */
  function panelCommands(win) {
    const doc = win.document;
    const run = (id) => () => doc.getElementById(id)?.doCommand();
    const has = (id) => () => !!doc.getElementById(id);
    return [
      {
        key: `${PREFIX}settings`,
        label: "Zen Fluent: All settings",
        command: () => win.openPreferences("paneSineMods"),
        tags: [...TAGS, "settings", "preferences", "sine"],
      },
      {
        key: `${PREFIX}quick-settings`,
        label: "Zen Fluent: Quick Settings",
        command: run("zf-quick-settings-button"),
        condition: has("zf-quick-settings-button"),
        tags: [...TAGS, "settings", "presets"],
      },
      {
        key: `${PREFIX}archived-tabs`,
        label: "Zen Fluent: Archived tabs",
        command: run("zf-context-archived-tabs"),
        condition: has("zf-context-archived-tabs"),
        tags: [...TAGS, "archive", "tabs"],
      },
      {
        key: `${PREFIX}archive-tab`,
        label: "Zen Fluent: Archive this tab",
        command() {
          // the menu item archives the context menu's tab
          win.TabContextMenu.contextTab = win.gBrowser.selectedTab;
          doc.getElementById("zf-context-archive-tab")?.doCommand();
        },
        condition: () =>
          !!doc.getElementById("zf-context-archive-tab") &&
          !win.gBrowser.selectedTab.hasAttribute("zen-essential"),
        tags: [...TAGS, "archive", "close"],
      },
      {
        key: `${PREFIX}shortcuts`,
        label: "Zen Fluent: Keyboard shortcuts sheet",
        command: run("zf-help-shortcuts"),
        condition: has("zf-help-shortcuts"),
        tags: [...TAGS, "keyboard", "keys", "help"],
      },
      {
        key: `${PREFIX}snap-layouts`,
        label: "Zen Fluent: Snap layouts",
        command: run("zf-context-snap-layouts"),
        condition: has("zf-context-snap-layouts"),
        tags: [...TAGS, "split", "layout", "snap"],
      },
      {
        key: `${PREFIX}performance`,
        label: "Zen Fluent: Performance",
        command: run("zf-tools-performance"),
        condition: has("zf-tools-performance"),
        tags: [...TAGS, "memory", "sleeping tabs", "sleep"],
      },
      {
        key: `${PREFIX}browsing-stats`,
        label: "Zen Fluent: Browsing stats",
        command: run("zf-tools-stats"),
        condition: has("zf-tools-stats"),
        tags: [...TAGS, "stats", "history", "time"],
      },
    ];
  }

  const feature = ZFFeature.attach(window, {
    name: "command-palette",
    default: true,
    start(ctx) {
      const win = ctx.window;
      let commands = null;
      let palette = null;

      const load = async () => {
        const json = (url) =>
          win.fetch(url).then((response) => response.json());
        const [core, enhanced, quick] = await Promise.all([
          json(CORE_PREFS),
          json(ENHANCED_PREFS),
          json(QUICK),
        ]);
        const prefs = new Map(
          [...core, ...enhanced]
            .filter((pref) => pref.property)
            .map((pref) => [pref.property, pref]),
        );
        return [
          ...panelCommands(win),
          ...settingCommands(prefs, quick),
          ...featureCommands(enhanced),
        ];
      };

      const sync = () => {
        const next = win.ZenCommandPalette;
        if (!commands || !next?.addCommands) {
          return;
        }
        // a rebuilt palette is a new object without our commands
        if (
          next !== palette ||
          !next.staticCommands?.some((c) => c.key === commands[0].key)
        ) {
          palette = next;
          next.addCommands(commands);
        }
      };

      load()
        .then((list) => {
          commands = list;
          sync();
        })
        .catch((error) =>
          console.error("[Zen Fluent Enhanced] command-palette:", error),
        );
      ctx.interval(sync, 2000);
      // removeCommand takes out one command per call
      ctx.onCleanup(() => {
        const mine = (c) => c.key?.startsWith(PREFIX);
        while (win.ZenCommandPalette?.removeCommand?.(mine));
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
