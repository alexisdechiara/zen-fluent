// Zen Fluent Enhanced: each space can give its own value to the settings that change the whole window.
//
// The space shown in the window you use last decides (prefs are global):
// on a space switch, and when a window comes to the front, its space's
// overrides are written and the other settings go back to their own value
// (lib/zf-spaces.sys.mjs). The overrides are edited on the settings page
// (Spaces), opened from a space's context menu too.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const Spaces = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-spaces.sys.mjs",
  );
  const { openSettings } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-settings.sys.mjs",
  );

  const FEATURE = "zen-fluent.enhanced.space-settings";

  const feature = ZFFeature.attach(window, {
    name: "space-settings",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const spaces = () => win.gZenWorkspaces;
      const inFront = () =>
        Services.wm.getMostRecentWindow("navigator:browser") === win;

      function sync() {
        const manager = spaces();
        if (!manager?.workspaceEnabled || !inFront()) {
          return;
        }
        Spaces.activate(manager.activeWorkspace);
      }

      function prune() {
        const ids = (spaces()?.getWorkspaces() ?? []).map((s) => s.uuid);
        Spaces.prune(ids);
      }

      Spaces.observe();
      ctx.listen(win, "activate", sync);
      ctx.listen(win, "ZenWorkspacesUIUpdate", sync);
      ctx.listen(win, "ZenWorkspaceDataChanged", prune);
      // Every synced window writes the space it switches to here
      ctx.observePref("zen.workspaces.active", () => ctx.timeout(sync, 0));

      // "Space settings…" in a space's context menu
      const menu = ctx.document.getElementById("zenWorkspaceMoreActions");
      if (menu) {
        const item = ctx.element(
          "menuitem",
          { id: "zf-space-settings-item", label: "Space settings…" },
          null,
        );
        const anchor = menu.querySelector("menuseparator");
        menu.insertBefore(item, anchor ?? null);
        ctx.listen(item, "command", () => {
          // A space's icon carries its id; elsewhere the menu is the
          // current space's
          Spaces.requestFocus(
            menu.triggerNode
              ?.closest?.("toolbarbutton")
              ?.getAttribute("zen-workspace-id") ?? spaces()?.activeWorkspace,
          );
          openSettings(win, "spaces");
        });
      }

      sync();
    },
    stop() {
      // The feature turned off (not a window closing): settings go back
      if (!Services.prefs.getBoolPref(FEATURE, true)) {
        Spaces.restoreAll();
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
