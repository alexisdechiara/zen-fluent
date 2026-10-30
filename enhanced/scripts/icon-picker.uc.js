// Zen Fluent Enhanced: Fluent icons in Zen's icon picker.
//
// Zen's picker (spaces, folders, pinned tabs) lists its own icons, then
// asks gZenEmojiPicker.getSVGURL() for the address of the one picked. This
// adds a Fluent section after them, 142 Fluent UI System Icons (MIT,
// Microsoft; THIRD-PARTY-NOTICES.md) listed in enhanced/icons/fluent/
// icons.json, and answers getSVGURL() for them; the picked address is then
// stored by Zen like its own icons. The icons draw in context-fill, so they
// need Zen Fluent's Allow the mod's icons
// (svg.context-properties.content.enabled), as Zen Fluent's own icons:
// without it the section only says so.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const BASE = "chrome://sine/content/Zen-Fluent-Enhanced/icons/fluent/";
  const PREFIX = "zf-fluent:";
  const CONTEXT_FILL = "svg.context-properties.content.enabled";

  const feature = ZFFeature.attach(window, {
    name: "icon-picker",
    default: true,
    start(ctx) {
      const { document } = ctx;
      const picker = ctx.window.gZenEmojiPicker;
      const panel = document.getElementById("PanelUI-zen-emojis-picker");
      if (!picker || !panel) {
        return;
      }
      let icons = [];
      ctx.window
        .fetch(`${BASE}icons.json`)
        .then((response) => response.json())
        .then((data) => (icons = data.icons))
        .catch((error) =>
          console.error("[Zen Fluent Enhanced] icon picker: no list", error),
        );

      const original = picker.getSVGURL;
      const patched = function (icon) {
        return typeof icon === "string" && icon.startsWith(PREFIX)
          ? `${BASE}${icon.slice(PREFIX.length)}.svg`
          : original.call(this, icon);
      };
      picker.getSVGURL = patched;
      ctx.onCleanup(() => {
        if (picker.getSVGURL === patched) {
          picker.getSVGURL = original;
        }
      });

      // After Zen's own listener, which has just filled the grid
      ctx.listen(panel, "popupshowing", (event) => {
        if (event.target !== panel || !icons.length) {
          return;
        }
        const header = document.createXULElement("label");
        header.className = "zf-icon-picker-header";
        header.setAttribute("value", "Fluent icons");
        if (!Services.prefs.getBoolPref(CONTEXT_FILL, false)) {
          const note = document.createXULElement("description");
          note.className = "zf-icon-picker-note";
          note.textContent =
            "Check Allow the mod's icons in Zen Fluent's settings to use them.";
          picker.svgList.append(header, note);
          return;
        }
        const items = icons.map((name) => {
          const item = document.createXULElement("toolbarbutton");
          item.className =
            "toolbarbutton-1 zen-emojis-picker-svg zf-fluent-icon";
          item.setAttribute("label", name.replace(/-/g, " "));
          item.setAttribute("tooltiptext", name.replace(/-/g, " "));
          item.setAttribute("icon", `${PREFIX}${name}`);
          item.style.listStyleImage = `url(${BASE}${name}.svg)`;
          return item;
        });
        picker.svgList.append(header, ...items);
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
