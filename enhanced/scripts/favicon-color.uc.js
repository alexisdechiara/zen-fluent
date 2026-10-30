// Zen Fluent Enhanced: the exact color of each tab's icon, for the Essentials.
//
// Reads the dominant color of every tab's icon (lib/zf-colors.sys.mjs) and
// sets it on the tab as --zf-favicon-color, with the zf-favicon-color
// attribute; enhanced/src/favicon-color.css turns them into the selected
// Essential's color.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { iconColor, iconOf, rgb } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-colors.sys.mjs",
  );

  const PROPERTY = "--zf-favicon-color";
  const ATTRIBUTE = "zf-favicon-color";

  const feature = ZFFeature.attach(window, {
    name: "favicon-color",
    default: true,
    start(ctx) {
      const { document } = ctx;
      let running = true;

      function clear(tab) {
        tab.style.removeProperty(PROPERTY);
        tab.removeAttribute(ATTRIBUTE);
      }

      async function update(tab) {
        // Zen announces an Essential's new icon before it writes it
        await null;
        const url = iconOf(tab);
        const color = url ? await iconColor(ctx.window, url) : null;
        if (!running || !tab.isConnected || iconOf(tab) !== url) {
          return;
        }
        if (color) {
          tab.style.setProperty(PROPERTY, rgb(color));
          tab.setAttribute(ATTRIBUTE, "");
        } else {
          clear(tab);
        }
      }

      // On the window: the Essentials are outside the tab container
      ctx.listen(ctx.window, "TabAttrModified", (event) => {
        if (event.detail.changed.includes("image")) {
          update(event.target);
        }
      });
      ctx.listen(ctx.window, "ZenTabIconChanged", (event) =>
        update(event.detail.tab),
      );
      ctx.onCleanup(() => {
        running = false;
        for (const tab of document.querySelectorAll(`[${ATTRIBUTE}]`)) {
          clear(tab);
        }
      });
      for (const tab of gBrowser.tabs) {
        update(tab);
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
