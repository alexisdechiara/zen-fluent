// Zen Fluent Enhanced: a color per folder.
//
// The folder context menu gets Folder color: the Windows accent palette
// (or the default, the accent). The chosen color goes on the zen-folder as
// zf-folder-color; enhanced/src/folder-colors.css paints the folder icon
// with it. Colors are kept by folder id, which Zen restores with the
// session, in zen-fluent.enhanced.folder-colors.map (JSON), shared by
// every window.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const MAP = "zen-fluent.enhanced.folder-colors.map";
  const ATTRIBUTE = "zf-folder-color";
  // Names match enhanced/src/folder-colors.css; swatches are the light values
  const COLORS = [
    ["red", "Red", "#d13438"],
    ["orange", "Orange", "#ca5010"],
    ["yellow", "Yellow", "#c19c00"],
    ["green", "Green", "#107c10"],
    ["teal", "Teal", "#038387"],
    ["blue", "Blue", "#0078d4"],
    ["purple", "Purple", "#8764b8"],
    ["pink", "Pink", "#e3008c"],
    ["gray", "Gray", "#69797e"],
  ];

  function readMap() {
    try {
      const map = JSON.parse(Services.prefs.getStringPref(MAP, "{}"));
      return map && typeof map === "object" ? map : {};
    } catch {
      return {};
    }
  }

  const swatch = (color) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="${color}"/></svg>`,
    )}`;

  const feature = ZFFeature.attach(window, {
    name: "folder-colors",
    default: true,
    start(ctx) {
      const { document } = ctx;

      function paint() {
        const map = readMap();
        for (const folder of document.querySelectorAll("zen-folder")) {
          const color = map[folder.id];
          if (COLORS.some(([name]) => name === color)) {
            folder.setAttribute(ATTRIBUTE, color);
          } else {
            folder.removeAttribute(ATTRIBUTE);
          }
        }
      }

      function setColor(folder, color) {
        const map = readMap();
        if (color) {
          map[folder.id] = color;
        } else {
          delete map[folder.id];
        }
        Services.prefs.setStringPref(MAP, JSON.stringify(map));
      }

      // -------- The menu --------
      const actions = document.getElementById("zenFolderActions");
      if (!actions) {
        return;
      }
      const menu = ctx.element("menu", {
        id: "zf-folder-color",
        label: "Folder color",
      });
      const popup = document.createXULElement("menupopup");
      const items = [["", "Default", null], ...COLORS].map(
        ([name, label, color]) => {
          const item = document.createXULElement("menuitem");
          item.setAttribute("type", "radio");
          item.setAttribute("name", "zf-folder-color");
          item.setAttribute("label", label);
          item.setAttribute("value", name);
          if (color) {
            item.classList.add("menuitem-iconic");
            item.setAttribute("image", swatch(color));
          }
          popup.append(item);
          return item;
        },
      );
      menu.append(popup);
      const anchor = document.getElementById("context_zenFolderChangeIcon");
      if (anchor) {
        anchor.after(menu);
      } else {
        actions.append(menu);
      }

      let target = null;
      // The same folder Zen's own menu acts on
      ctx.listen(actions, "popupshowing", (event) => {
        if (event.target !== actions) {
          return;
        }
        const node = actions.triggerNode ?? event.explicitOriginalTarget;
        target =
          node?.closest?.("zen-folder") ??
          (gBrowser.isTabGroupLabel(node) ? node.group : null);
        menu.hidden = !target?.isZenFolder;
        const current = target ? (readMap()[target.id] ?? "") : "";
        for (const item of items) {
          if (item.value === current) {
            item.setAttribute("checked", "true");
          } else {
            item.removeAttribute("checked");
          }
        }
      });
      ctx.listen(popup, "command", (event) => {
        if (target) {
          setColor(target, event.target.value);
        }
      });

      ctx.observePref(MAP, paint);
      // New and restored folders
      ctx.listen(ctx.window, "TabGroupCreate", () =>
        ctx.window.queueMicrotask(paint),
      );
      ctx.onCleanup(() => {
        for (const folder of document.querySelectorAll(`[${ATTRIBUTE}]`)) {
          folder.removeAttribute(ATTRIBUTE);
        }
      });
      paint();
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
