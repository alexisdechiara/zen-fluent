// Zen Fluent Enhanced: a settings page, about:zen-fluent.
//
// Every Zen Fluent and Zen Fluent Enhanced setting on one page, in the
// Windows Settings style, with a live preview and the presets
// (enhanced/settings/). This script registers the page
// (lib/zf-settings.sys.mjs) and adds its entry points: a Zen Fluent item in
// the app menu, under Settings, and in the Tools menu, and
// Ctrl+Alt+Shift+F. Quick Settings' "All settings" opens it too. A settings
// tab restored before the page was registered shows an error: it is
// reloaded once the page exists.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { SETTINGS_URL, openSettings, useAboutPage } =
    ChromeUtils.importESModule(
      "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-settings.sys.mjs",
    );

  const feature = ZFFeature.attach(window, {
    name: "settings-page",
    default: true,
    start(ctx) {
      const { document } = ctx;
      const win = ctx.window;
      ctx.onCleanup(useAboutPage());

      for (const tab of gBrowser.tabs) {
        const browser = tab.linkedBrowser;
        if (
          browser?.currentURI?.spec.startsWith(SETTINGS_URL) &&
          browser.documentURI?.spec.startsWith("about:neterror")
        ) {
          browser.reload();
        }
      }

      const open = () => openSettings(win);

      const tools = document.getElementById("menu_ToolsPopup");
      if (tools) {
        const item = ctx.element("menuitem", {
          id: "zf-tools-settings",
          label: "Zen Fluent settings",
        });
        tools.prepend(item);
        ctx.listen(item, "command", open);
      }
      // The app menu's buttons only exist once it was first shown
      ctx.listen(
        win,
        "ViewShowing",
        (event) => {
          if (
            // appMenu-mainView in Zen 1.24, appMenu-protonMainView in Firefox
            !/^appMenu-(proton)?[mM]ainView$/.test(event.target.id) ||
            document.getElementById("zf-appmenu-settings")
          ) {
            return;
          }
          const settings = document.getElementById("appMenu-settings-button");
          if (!settings) {
            return;
          }
          const button = ctx.element("toolbarbutton", {
            id: "zf-appmenu-settings",
            class: "subviewbutton",
            label: "Zen Fluent",
          });
          settings.after(button);
          ctx.listen(button, "command", () => {
            PanelUI.hide();
            open();
          });
        },
        true,
      );
      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyF" &&
            event.ctrlKey &&
            event.altKey &&
            event.shiftKey &&
            !event.metaKey &&
            !event.repeat
          ) {
            event.preventDefault();
            event.stopPropagation();
            open();
          }
        },
        true,
      );
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
