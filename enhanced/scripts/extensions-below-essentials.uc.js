// Zen Fluent Enhanced: the extensions row between the Essentials and the tabs.
//
// Single toolbar: Zen keeps the pinned extensions in
// #zen-overflow-extensions-list, the first child of #titlebar, above
// #TabsToolbar, which holds the Essentials and the tabs: CSS cannot put the
// row between them (Zen Fluent's zen-fluent.extensions.position only offers
// above, at the very bottom, or hidden). This moves the element itself,
// right after #zen-essentials, while Zen Fluent's position is "top" (its
// default), and puts it back on stop. Zen and CustomizableUI find the row
// by its id, wherever it is.
//
// #zen-essentials has no height: its grid is absolutely positioned over the
// space, which Zen pads by the grid's height. The row, in the flow after
// it, pushes the space down by its own height; it is drawn under the grid
// by --zf-essentials-height (the tallest grid, measured here), as a
// translation (enhanced/src/extensions-below-essentials.css).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const POSITION = "zen-fluent.extensions.position";
  const HEIGHT = "--zf-essentials-height";

  const feature = ZFFeature.attach(window, {
    name: "extensions-below-essentials",
    start(ctx) {
      const { document } = ctx;
      const list = document.getElementById("zen-overflow-extensions-list");
      if (!list) {
        return;
      }
      const home = list.parentNode;
      const homeNext = list.nextSibling;
      const sizes = new ctx.window.ResizeObserver(measure);
      ctx.onCleanup(() => sizes.disconnect());
      let grids = null;

      function measure() {
        const essentials = document.getElementById("zen-essentials");
        let height = 0;
        for (const grid of essentials?.children ?? []) {
          height = Math.max(height, grid.getBoundingClientRect().height);
        }
        list.style.setProperty(HEIGHT, `${height}px`);
      }

      function watch(essentials) {
        sizes.disconnect();
        for (const grid of essentials.children) {
          sizes.observe(grid);
        }
        measure();
      }

      function goHome() {
        list.removeAttribute("zf-below-essentials");
        list.style.removeProperty(HEIGHT);
        sizes.disconnect();
        grids?.disconnect();
        grids = null;
        if (list.parentNode !== home) {
          home.insertBefore(
            list,
            homeNext?.parentNode === home ? homeNext : null,
          );
        }
      }

      function place() {
        const essentials = document.getElementById("zen-essentials");
        const wanted =
          Services.prefs.getStringPref(POSITION, "top") === "top" &&
          document.documentElement.getAttribute("zen-single-toolbar") ===
            "true";
        if (!wanted || !essentials) {
          goHome();
          return;
        }
        if (list.previousSibling !== essentials) {
          essentials.after(list);
        }
        list.setAttribute("zf-below-essentials", "");
        // Zen adds a grid per container (Firefox's containers) as needed
        grids ??= new ctx.window.MutationObserver(() => watch(essentials));
        grids.observe(essentials, { childList: true });
        watch(essentials);
      }

      ctx.observePref(POSITION, place);
      ctx.mutations(
        document.documentElement,
        { attributes: true, attributeFilter: ["zen-single-toolbar"] },
        place,
      );
      ctx.onCleanup(goHome);
      place();
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
