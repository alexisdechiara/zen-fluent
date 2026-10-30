// Zen Fluent Enhanced: the accent follows the site in the selected tab.
//
// The color is the dominant color of the selected tab's icon
// (lib/zf-colors.sys.mjs). A grey one (a monochrome icon) does not make an
// accent: Zen Fluent's own accent stays. The window gets
// --zf-accent-dynamic and the zf-adaptive-accent attribute;
// enhanced/src/adaptive-accent.css makes it the accent, which also tints
// Mica.
//
// A page's <meta name="theme-color"> would come first, but it can only be
// read in the page's process, and Firefox refuses a window actor from a
// profile mod in web content processes ("doesn't match remote type
// webIsolated", checked on Zen 1.24b): the icon is what the chrome sees.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { chroma, iconColor, iconOf, rgb } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-colors.sys.mjs",
  );

  const MIN_CHROMA = 0.15;
  const PROPERTY = "--zf-accent-dynamic";
  const ATTRIBUTE = "zf-adaptive-accent";

  const feature = ZFFeature.attach(window, {
    name: "adaptive-accent",
    start(ctx) {
      const root = ctx.document.documentElement;
      let running = true;
      let request = 0;

      async function refresh() {
        const current = ++request;
        // Zen announces an Essential's new icon before it writes it
        await null;
        const url = iconOf(gBrowser.selectedTab);
        const icon = url ? await iconColor(ctx.window, url) : null;
        if (!running || current !== request) {
          return;
        }
        if (icon && chroma(icon) >= MIN_CHROMA) {
          root.style.setProperty(PROPERTY, rgb(icon));
          root.setAttribute(ATTRIBUTE, "");
        } else {
          root.style.removeProperty(PROPERTY);
          root.removeAttribute(ATTRIBUTE);
        }
      }

      ctx.listen(ctx.window, "TabSelect", refresh);
      ctx.listen(ctx.window, "TabAttrModified", (event) => {
        if (
          event.target === gBrowser.selectedTab &&
          event.detail.changed.includes("image")
        ) {
          refresh();
        }
      });
      ctx.listen(ctx.window, "ZenTabIconChanged", (event) => {
        if (event.detail.tab === gBrowser.selectedTab) {
          refresh();
        }
      });
      ctx.onCleanup(() => {
        running = false;
        root.style.removeProperty(PROPERTY);
        root.removeAttribute(ATTRIBUTE);
      });
      refresh();
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
