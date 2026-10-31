// Zen Fluent Enhanced: Firefox's AI controls page in Zen's settings.
//
// Firefox 158 has a settings page where each AI feature can be left
// available, turned on or blocked, with a switch that blocks them all
// (translations, PDF alt text, link preview key points, the sidebar
// chatbot, speech recognition…). Zen hides it (browser.preferences.
// aiControls); this feature shows it while checked and puts Zen's default
// back when unchecked. The page writes Firefox's own switches itself.
// Tools › AI controls and the Command Palette open it.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const FIREFOX_PREF = "browser.preferences.aiControls";

  const feature = ZFFeature.attach(window, {
    name: "ai-controls",
    start(ctx) {
      Services.prefs.setBoolPref(FIREFOX_PREF, true);
      const tools = ctx.document.getElementById("menu_ToolsPopup");
      if (tools) {
        const item = ctx.element(
          "menuitem",
          { id: "zf-tools-ai-controls", label: "AI controls" },
          tools,
        );
        ctx.listen(item, "command", () => ctx.window.openPreferences("ai"));
      }
    },
    stop() {
      // Unchecked (not a closed window): back to Zen's default
      if (
        !Services.prefs.getBoolPref("zen-fluent.enhanced.ai-controls", false)
      ) {
        Services.prefs.clearUserPref(FIREFOX_PREF);
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
