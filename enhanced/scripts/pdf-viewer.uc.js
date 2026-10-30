// Zen Fluent Enhanced: Firefox's PDF viewer in Fluent colors.
//
// Registers enhanced/content/pdf-viewer.css as a user sheet: it sets the
// variables pdf.js draws its toolbar, sidebar, fields and menus with, only
// in the viewer's page (Sine's content sheet does not reach it: the viewer
// runs in the PDF's own web process).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { useSheet } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-sheets.sys.mjs",
  );

  const feature = ZFFeature.attach(window, {
    name: "pdf-viewer",
    default: true,
    start(ctx) {
      ctx.onCleanup(
        useSheet(
          "chrome://sine/content/Zen-Fluent-Enhanced/content/pdf-viewer.css",
          "user",
        ),
      );
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
