// Zen Fluent Enhanced: tab numbers while Ctrl is held.
//
// Holding Ctrl (Cmd on macOS) alone for a moment shows on each tab the
// number that Ctrl+1 to Ctrl+8 selects, and 9 on the last tab (Ctrl+9). The
// numbers follow Firefox's own count (gBrowser.visibleTabs, which
// selectTabAtIndex uses), so they match the shortcuts in every space. They
// go away when Ctrl is released, another key is pressed or the window loses
// focus. The number sits on the tab's icon (.tab-icon-stack[zf-tab-number],
// enhanced/src/tab-numbers.css).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { AppConstants } = ChromeUtils.importESModule(
    "resource://gre/modules/AppConstants.sys.mjs",
  );

  const ACCEL = AppConstants.platform === "macosx" ? "Meta" : "Control";
  // Long enough not to flash on Ctrl+C, short enough to feel immediate
  const DELAY = 400;
  const ATTRIBUTE = "zf-tab-number";

  const feature = ZFFeature.attach(window, {
    name: "tab-numbers",
    default: true,
    start(ctx) {
      const { document } = ctx;
      const root = document.documentElement;
      let timer = 0;

      function show() {
        const tabs = gBrowser.visibleTabs;
        tabs.forEach((tab, index) => {
          let number = 0;
          if (index < 8) {
            number = index + 1;
          } else if (index === tabs.length - 1) {
            number = 9;
          }
          if (number) {
            tab
              .querySelector(".tab-icon-stack")
              ?.setAttribute(ATTRIBUTE, number);
          }
        });
        root.setAttribute("zf-tab-numbers", "");
      }

      function hide() {
        ctx.window.clearTimeout(timer);
        timer = 0;
        root.removeAttribute("zf-tab-numbers");
        for (const stack of document.querySelectorAll(`[${ATTRIBUTE}]`)) {
          stack.removeAttribute(ATTRIBUTE);
        }
      }

      ctx.listen(
        ctx.window,
        "keydown",
        (event) => {
          const other = ACCEL === "Control" ? event.metaKey : event.ctrlKey;
          if (event.key !== ACCEL || event.shiftKey || event.altKey || other) {
            hide();
          } else if (!event.repeat && !timer) {
            timer = ctx.window.setTimeout(show, DELAY);
          }
        },
        true,
      );
      ctx.listen(
        ctx.window,
        "keyup",
        (event) => {
          if (event.key === ACCEL) {
            hide();
          }
        },
        true,
      );
      ctx.listen(ctx.window, "blur", hide);
      ctx.listen(ctx.window, "TabSelect", hide);
      ctx.onCleanup(hide);
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
