// Zen Fluent Enhanced: a short glow when the window changes color.
//
// The window's color changes with the space's theme (Zen writes new
// --zen-* values on its background layers), the site color and the
// adaptive accent (attributes and properties on the root). On each change
// the root gets zf-window-glow for a moment: enhanced/src/window-glow.css
// lights the window's background in the new color, under everything else,
// and fades it out. Not on the window's first second (its first colors),
// and never twice within 300ms.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const ATTRIBUTE = "zf-window-glow";
  const LENGTH = 1100;
  const ROOT_ATTRIBUTES = [
    "zen-default-theme",
    "zen-should-be-dark-mode",
    "zf-site-color",
    "zf-adaptive-accent",
  ];
  // the root's inline properties that carry a window color
  const ROOT_PROPERTIES = ["--zf-site-color", "--zf-accent-dynamic"];

  const feature = ZFFeature.attach(window, {
    name: "window-glow",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const root = ctx.document.documentElement;
      const started = Date.now();
      let last = 0;
      let timer = 0;
      const colors = () =>
        ROOT_PROPERTIES.map((name) => root.style.getPropertyValue(name)).join();
      let seen = colors();

      const glow = () => {
        const now = Date.now();
        if (now - started < 1000 || now - last < 300) {
          return;
        }
        last = now;
        root.removeAttribute(ATTRIBUTE);
        // a reflow restarts the animation when glows follow each other
        void root.offsetWidth;
        root.setAttribute(ATTRIBUTE, "");
        win.clearTimeout(timer);
        timer = win.setTimeout(() => root.removeAttribute(ATTRIBUTE), LENGTH);
      };
      ctx.onCleanup(() => {
        win.clearTimeout(timer);
        root.removeAttribute(ATTRIBUTE);
      });

      ctx.mutations(
        root,
        { attributes: true, attributeFilter: [...ROOT_ATTRIBUTES, "style"] },
        (records) => {
          if (records.some((r) => ROOT_ATTRIBUTES.includes(r.attributeName))) {
            glow();
            return;
          }
          const now = colors();
          if (now !== seen) {
            seen = now;
            glow();
          }
        },
      );
      // Zen writes a space's colors on its background layers
      for (const layer of ctx.document.querySelectorAll(
        ".zen-browser-generic-background",
      )) {
        ctx.mutations(
          layer,
          { attributes: true, attributeFilter: ["style"] },
          glow,
        );
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
