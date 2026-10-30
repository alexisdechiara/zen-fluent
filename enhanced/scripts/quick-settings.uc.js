// Zen Fluent Enhanced: Quick Settings and the presets gallery.
//
// A button in the sidebar's bottom row opens a panel with Zen Fluent's main
// settings and a row of presets. Both are listed in
// enhanced/quick-settings.json; labels and choices are read from Zen
// Fluent's own core/preferences.json, so they always match Sine's dialog
// (a few labels, out of their group's context, are renamed in "labels").
// The panel writes the same zen-fluent.* prefs as that dialog (dropdowns
// and checkboxes only: Sine would not rebuild a text setting's variable).
// A preset sets every pref it names; Undo puts back the values from before
// the last preset. The current preset, if every one of its prefs matches,
// shows as pressed.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );

  const CORE_PREFS = "chrome://sine/content/Zen-Fluent/core/preferences.json";
  const QUICK = "chrome://sine/content/Zen-Fluent-Enhanced/quick-settings.json";
  const HTML = "http://www.w3.org/1999/xhtml";

  /** A Sine label without its ~grey description~. */
  const shortLabel = (label) => label.replace(/\s*~[^~]*~\s*/g, "").trim();

  function readPref(pref) {
    const { property, type, defaultValue } = pref;
    try {
      return type === "checkbox"
        ? Services.prefs.getBoolPref(property, defaultValue)
        : Services.prefs.getStringPref(property, defaultValue);
    } catch {
      return defaultValue;
    }
  }

  function writePref(pref, value) {
    try {
      if (pref.type === "checkbox") {
        Services.prefs.setBoolPref(pref.property, value);
      } else {
        Services.prefs.setStringPref(pref.property, value);
      }
    } catch (error) {
      console.error(`[Zen Fluent Enhanced] cannot set ${pref.property}`, error);
    }
  }

  const feature = ZFFeature.attach(window, {
    name: "quick-settings",
    default: true,
    start(ctx) {
      const { document } = ctx;
      const foot = document.getElementById("zen-sidebar-foot-buttons");
      const popups = document.getElementById("mainPopupSet");
      if (!foot || !popups) {
        return;
      }

      const button = ctx.element("toolbarbutton", {
        id: "zf-quick-settings-button",
        class: "toolbarbutton-1 chromeclass-toolbar-additional",
        label: "Quick settings",
        tooltiptext: "Zen Fluent quick settings",
        image: "chrome://global/skin/icons/settings.svg",
        removable: "false",
        skipintoolbarset: "true",
      });
      foot.insertBefore(
        button,
        document.getElementById("zen-create-new-button"),
      );
      const panel = ctx.element(
        "panel",
        {
          id: "zf-quick-settings",
          type: "arrow",
          role: "dialog",
          "aria-label": "Zen Fluent quick settings",
          orient: "vertical",
        },
        popups,
      );
      ctx.onCleanup(() => panel.hidePopup());

      let prefs = null;
      let quick = null;
      let undo = null;
      const loaded = Promise.all(
        [CORE_PREFS, QUICK].map((url) =>
          ctx.window.fetch(url).then((response) => response.json()),
        ),
      ).then(
        ([core, list]) => {
          prefs = new Map(
            core.filter((p) => p.property).map((p) => [p.property, p]),
          );
          quick = list;
        },
        (error) =>
          console.error("[Zen Fluent Enhanced] quick settings: no data", error),
      );

      const html = (tag, attributes = {}, text = "") => {
        const el = document.createElementNS(HTML, tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      function applyPreset(preset) {
        undo = {};
        for (const [property, value] of Object.entries(preset.prefs)) {
          const pref = prefs.get(property);
          if (!pref) {
            continue;
          }
          undo[property] = Services.prefs.prefHasUserValue(property)
            ? readPref(pref)
            : null;
          writePref(pref, value);
        }
        showToast(ctx.window, `Preset: ${preset.name}`);
        build();
      }

      function undoPreset() {
        for (const [property, value] of Object.entries(undo ?? {})) {
          if (value === null) {
            Services.prefs.clearUserPref(property);
          } else {
            writePref(prefs.get(property), value);
          }
        }
        undo = null;
        showToast(ctx.window, "Preset undone");
        build();
      }

      function presetRow() {
        const row = html("div", { class: "zf-qs-presets" });
        for (const preset of quick.presets) {
          const current = Object.entries(preset.prefs).every(
            ([property, value]) =>
              prefs.has(property) && readPref(prefs.get(property)) === value,
          );
          const card = html("button", {
            class: "zf-qs-preset",
            "aria-pressed": current,
            title: preset.description,
          });
          card.append(
            html("span", { class: "zf-qs-preset-name" }, preset.name),
            html("span", { class: "zf-qs-preset-text" }, preset.description),
          );
          card.addEventListener("click", () => applyPreset(preset));
          row.append(card);
        }
        return row;
      }

      function settingRow(pref, index) {
        const id = `zf-qs-${index}`;
        const label = document.createXULElement("label");
        label.setAttribute(
          "value",
          quick.labels?.[pref.property] ?? shortLabel(pref.label),
        );
        label.setAttribute("control", id);
        label.className = "zf-qs-label";
        let control;
        if (pref.type === "checkbox") {
          control = document.createXULElement("checkbox");
          control.checked = readPref(pref);
          control.addEventListener("command", () =>
            writePref(pref, control.checked),
          );
        } else {
          control = document.createXULElement("menulist");
          const popup = document.createXULElement("menupopup");
          for (const option of pref.options) {
            const item = document.createXULElement("menuitem");
            item.setAttribute("label", option.label);
            item.setAttribute("value", option.value);
            popup.append(item);
          }
          control.append(popup);
          control.value = readPref(pref);
          control.addEventListener("command", () =>
            writePref(pref, control.value),
          );
        }
        control.id = id;
        control.classList.add("zf-qs-control");
        return [label, control];
      }

      function build() {
        const header = html("div", { class: "zf-qs-header" });
        const all = html("button", { class: "zf-qs-link" }, "All settings");
        all.addEventListener("click", () => {
          panel.hidePopup();
          ctx.window.openPreferences("paneSineMods");
        });
        header.append(html("h2", { class: "zf-qs-title" }, "Zen Fluent"), all);
        const parts = [header];
        if (!prefs || !quick) {
          parts.push(
            html(
              "p",
              { class: "zf-qs-empty" },
              "Zen Fluent's settings could not be read: is Zen Fluent installed?",
            ),
          );
          panel.replaceChildren(...parts);
          return;
        }
        parts.push(html("h3", { class: "zf-qs-heading" }, "Presets"));
        parts.push(presetRow());
        if (undo) {
          const back = html("button", { class: "zf-qs-link" }, "Undo preset");
          back.addEventListener("click", undoPreset);
          parts.push(back);
        }
        parts.push(html("h3", { class: "zf-qs-heading" }, "Settings"));
        const grid = html("div", { class: "zf-qs-settings" });
        quick.settings
          .map((property) => prefs.get(property))
          .filter(Boolean)
          .forEach((pref, index) => grid.append(...settingRow(pref, index)));
        parts.push(grid);
        panel.replaceChildren(...parts);
      }

      ctx.listen(button, "command", async () => {
        await loaded;
        build();
        panel.openPopup(button, "before_start");
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
