// Zen Fluent Enhanced: a veil over the page of a private window in the background.
//
// While a private window is not the active window, its pages (split view
// and Glance included, not the sidebar) are covered by a solid veil in
// the window's color with a lock: Alt+Tab, the taskbar preview or someone
// behind you see nothing of them. Activating the window lifts it at once.
// The script only marks private windows (zf-private-veil on the root);
// src/private-veil.css draws the veil on :-moz-window-inactive, which a
// menu or a panel of the window does not set (they never deactivate it).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs",
  );

  const feature = ZFFeature.attach(window, {
    name: "private-veil",
    start(ctx) {
      if (!PrivateBrowsingUtils.isWindowPrivate(ctx.window)) {
        return;
      }
      ctx.attribute(ctx.document.documentElement, "zf-private-veil");
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
