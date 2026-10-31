// Zen Fluent Enhanced: the window takes the color of the site in the selected tab.
//
// The color is the top of the page as the browser drew it
// (lib/zf-colors.sys.mjs pageTopColor): a site's header is usually the
// color its <meta name="theme-color"> names, which the chrome cannot read
// (adaptive-accent.uc.js says why). A grey top (white, black) gives way to
// the dominant color of the tab's icon, and a grey icon to the space's own
// theme. The window gets --zf-site-color and the zf-site-color attribute;
// enhanced/src/site-color.css mixes it into the window, over the space's
// gradient, at the strength zen-fluent.enhanced.site-color.strength picks.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { chroma, iconColor, iconOf, pageTopColor, rgb } =
    ChromeUtils.importESModule(
      "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-colors.sys.mjs",
    );

  const MIN_CHROMA = 0.15;
  const PROPERTY = "--zf-site-color";
  const ATTRIBUTE = "zf-site-color";
  // A page that paints its header late (scripts, web fonts, a single-page
  // site changing its page) is read again after this delay
  const LATE_PAINT = 1500;
  const { STATE_STOP, STATE_IS_WINDOW, LOCATION_CHANGE_SAME_DOCUMENT } =
    Ci.nsIWebProgressListener;

  const feature = ZFFeature.attach(window, {
    name: "site-color",
    start(ctx) {
      const root = ctx.document.documentElement;
      // Last color read per page, shown as soon as its tab is selected again
      const known = new WeakMap();
      let running = true;
      let request = 0;

      function apply(color) {
        if (color) {
          root.style.setProperty(PROPERTY, rgb(color));
          root.setAttribute(ATTRIBUTE, "");
        } else {
          root.style.removeProperty(PROPERTY);
          root.removeAttribute(ATTRIBUTE);
        }
      }

      const colorful = (color) => color && chroma(color) >= MIN_CHROMA;

      async function refresh() {
        const current = ++request;
        // Zen announces an Essential's new icon before it writes it
        await null;
        const tab = gBrowser.selectedTab;
        const browser = tab.linkedBrowser;
        if (known.has(browser)) {
          apply(known.get(browser));
        }
        let color = await pageTopColor(ctx.window, browser);
        if (!colorful(color)) {
          const url = iconOf(tab);
          color = url ? await iconColor(ctx.window, url) : null;
        }
        if (!running || current !== request) {
          return;
        }
        color = colorful(color) ? color : null;
        known.set(browser, color);
        apply(color);
      }

      function refreshTwice() {
        refresh();
        ctx.timeout(refresh, LATE_PAINT);
      }

      // The selected tab's page only
      const progress = {
        onStateChange(webProgress, _request, flags) {
          if (
            webProgress.isTopLevel &&
            flags & STATE_STOP &&
            flags & STATE_IS_WINDOW
          ) {
            refreshTwice();
          }
        },
        onLocationChange(webProgress, _request, _location, flags) {
          if (webProgress.isTopLevel && flags & LOCATION_CHANGE_SAME_DOCUMENT) {
            ctx.timeout(refresh, LATE_PAINT);
          }
        },
      };
      gBrowser.addProgressListener(progress);
      ctx.onCleanup(() => gBrowser.removeProgressListener(progress));

      ctx.listen(ctx.window, "TabSelect", refreshTwice);
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
        apply(null);
      });
      refresh();
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
