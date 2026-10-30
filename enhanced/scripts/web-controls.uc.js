// Zen Fluent Enhanced: WinUI form controls on web pages.
//
// Registers enhanced/content/web-controls.css as an agent sheet: it takes
// the place of the browser's default look of buttons and text fields on
// http, https and file pages, and gives checkboxes, radios, sliders and
// progress bars the accent. A page's own CSS still wins, so only controls
// a site left unstyled change. Off by default.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { useSheet } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-sheets.sys.mjs",
  );

  const feature = ZFFeature.attach(window, {
    name: "web-controls",
    start(ctx) {
      ctx.onCleanup(
        useSheet(
          "chrome://sine/content/Zen-Fluent-Enhanced/content/web-controls.css",
          "agent",
        ),
      );
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
