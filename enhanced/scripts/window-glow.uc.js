// Zen Fluent Enhanced: a short glow when the window changes color.
//
// The window's color changes with the space's theme (Zen writes new
// --zen-* values inline on its background layers and the root) and with
// light / dark mode. When that color really changes, the root gets
// zf-window-glow for a moment: enhanced/src/window-glow.css lights the
// window's background in the new color, under everything else, and fades
// it out. Zen rewrites its layers on every tab switch with the same values,
// and the site color and adaptive accent change with every tab: neither
// glows. Not on the window's first second (its first colors), and a burst
// of writes (a space switch's transition) gives one glow.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const ATTRIBUTE = "zf-window-glow";
  // On while the feature runs: the stacking context the glow needs stays
  // put instead of coming and going with each glow
  const READY = "zf-window-glow-ready";
  const LENGTH = 1400;
  // Wait for the writes of one change to settle before comparing
  const SETTLE = 200;
  const ROOT_ATTRIBUTES = ["zen-default-theme", "zen-should-be-dark-mode"];

  const feature = ZFFeature.attach(window, {
    name: "window-glow",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const root = ctx.document.documentElement;
      const layers = [
        ...ctx.document.querySelectorAll(".zen-browser-generic-background"),
      ];
      const started = Date.now();
      let timer = 0;
      let settle = 0;
      // The space's colors as Zen wrote them, and the color scheme
      const signature = () =>
        [
          ...ROOT_ATTRIBUTES.map((name) => root.getAttribute(name) ?? ""),
          root.style.getPropertyValue("--zen-primary-color"),
          ...layers.map((layer) => layer.getAttribute("style") ?? ""),
        ].join("|");
      let seen = signature();

      const glow = () => {
        root.removeAttribute(ATTRIBUTE);
        // a reflow restarts the animation when glows follow each other
        void root.offsetWidth;
        root.setAttribute(ATTRIBUTE, "");
        win.clearTimeout(timer);
        timer = win.setTimeout(() => root.removeAttribute(ATTRIBUTE), LENGTH);
      };
      const check = () => {
        win.clearTimeout(settle);
        settle = win.setTimeout(() => {
          const now = signature();
          if (now === seen) {
            return;
          }
          seen = now;
          if (Date.now() - started >= 1000) {
            glow();
          }
        }, SETTLE);
      };

      root.setAttribute(READY, "");
      ctx.onCleanup(() => {
        win.clearTimeout(timer);
        win.clearTimeout(settle);
        root.removeAttribute(ATTRIBUTE);
        root.removeAttribute(READY);
      });

      ctx.mutations(
        root,
        { attributes: true, attributeFilter: [...ROOT_ATTRIBUTES, "style"] },
        check,
      );
      for (const layer of layers) {
        ctx.mutations(
          layer,
          { attributes: true, attributeFilter: ["style"] },
          check,
        );
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
