// Zen Fluent Enhanced: Firefox's AI chatbot panel, back in Zen.
//
// Firefox can keep a chatbot of your choice (Claude, ChatGPT, Copilot,
// Gemini, Le Chat…) in its sidebar, with "Ask a chatbot" in the page's
// context menu and a shortcut on selected text. Zen turns it all off
// (browser.ml.chat.*); while checked, this feature turns the chatbot and
// those entry points back on, and adds a button to Zen's sidebar bottom
// row that opens or closes the panel (as Ctrl+Alt+X). Unchecked, Zen's
// defaults come back. The chatbot itself is chosen in the panel, or in
// the AI controls page (ai-controls.uc.js).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const FIREFOX_PREFS = [
    "browser.ml.chat.enabled",
    "browser.ml.chat.sidebar",
    "browser.ml.chat.menu",
    "browser.ml.chat.page",
    "browser.ml.chat.shortcuts",
    "browser.ml.chat.shortcuts.custom",
  ];
  const PANEL = "viewGenaiChatSidebar";

  const feature = ZFFeature.attach(window, {
    name: "ai-chat",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      for (const pref of FIREFOX_PREFS) {
        Services.prefs.setBoolPref(pref, true);
      }

      const foot = doc.getElementById("zen-sidebar-foot-buttons");
      if (!foot) {
        return;
      }
      const button = ctx.element("toolbarbutton", {
        id: "zf-ai-chat-button",
        class: "toolbarbutton-1 chromeclass-toolbar-additional",
        label: "AI chatbot",
        tooltiptext: "AI chatbot (Ctrl+Alt+X)",
        image: "chrome://global/skin/icons/highlights.svg",
        removable: "false",
        skipintoolbarset: "true",
      });
      foot.insertBefore(button, doc.getElementById("zen-create-new-button"));
      ctx.listen(button, "command", () => win.SidebarController.toggle(PANEL));

      // the button shows the panel's state
      const sync = () =>
        button.toggleAttribute(
          "checked",
          win.SidebarController.isOpen &&
            win.SidebarController.currentID === PANEL,
        );
      ctx.listen(win, "SidebarShown", sync);
      ctx.listen(win, "SidebarFocused", sync);
      ctx.mutations(
        doc.getElementById("sidebar-box"),
        { attributes: true, attributeFilter: ["hidden", "sidebarcommand"] },
        sync,
      );
      sync();
    },
    stop(ctx) {
      // Unchecked (not a closed window): Zen's defaults, the panel closed
      if (!Services.prefs.getBoolPref("zen-fluent.enhanced.ai-chat", false)) {
        if (ctx.window.SidebarController?.currentID === PANEL) {
          ctx.window.SidebarController.hide();
        }
        for (const pref of FIREFOX_PREFS) {
          Services.prefs.clearUserPref(pref);
        }
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
