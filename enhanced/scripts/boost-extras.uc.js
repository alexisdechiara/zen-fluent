// Zen Fluent Enhanced: four more tiles in Zen's Boost editor.
//
// Narrow column, No motion, Hide images and Sepia join Zen's own tiles
// (Zap, Focus, Code). Each one adds or takes out a marked block of CSS in
// the boost's own custom CSS (the Code tile's), so Zen saves, shares and
// applies it with the boost, per site, without any change to Zen; the
// block shows in the code editor between its two comments. The editor
// window has a fixed size: it grows by the new row while the feature is
// on.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const TILES = [
    {
      id: "narrow",
      label: "Narrow column",
      css: `body {
  max-width: 72ch !important;
  margin-inline: auto !important;
  padding-inline: 16px !important;
}`,
    },
    {
      id: "still",
      label: "No motion",
      css: `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition: none !important;
  scroll-behavior: auto !important;
}`,
    },
    {
      id: "no-images",
      label: "Hide images",
      css: `img, picture, video, canvas, svg image, [role="img"] {
  visibility: hidden !important;
}
* {
  background-image: none !important;
}`,
    },
    {
      id: "sepia",
      label: "Sepia",
      css: `html {
  filter: sepia(0.6) !important;
}`,
    },
  ];

  const start = (id) => `/* zen-fluent:${id} */`;
  const end = (id) => `/* /zen-fluent:${id} */`;
  const escape = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

  const feature = ZFFeature.attach(window, {
    name: "boost-extras",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const anchor = doc.getElementById("zen-boost-code");
      if (!anchor) {
        return;
      }

      const row = ctx.element("vbox", { id: "zf-boost-extras" });
      anchor.after(row);
      const buttons = [];
      for (let i = 0; i < TILES.length; i += 2) {
        const line = ctx.element("hbox", { class: "zf-boost-extras-row" }, row);
        for (const tile of TILES.slice(i, i + 2)) {
          const button = ctx.element(
            "button",
            {
              id: `zf-boost-${tile.id}`,
              class:
                "subviewbutton mod-button big-button toggleable-button med",
              enabled: "false",
            },
            line,
          );
          const text = doc.createElementNS("http://www.w3.org/1999/xhtml", "p");
          text.textContent = tile.label;
          button.append(text);
          buttons.push([button, tile]);
        }
      }

      const data = () => win.boostEditor?.currentBoostData;
      const has = (tile) => (data()?.customCSS ?? "").includes(start(tile.id));

      const refresh = () => {
        for (const [button, tile] of buttons) {
          button.setAttribute("enabled", String(has(tile)));
        }
      };

      const toggle = (tile) => {
        const boost = data();
        if (!boost) {
          return;
        }
        const css = boost.customCSS ?? "";
        boost.customCSS = has(tile)
          ? css
              .replace(
                new RegExp(
                  `\\n?${escape(start(tile.id))}[\\s\\S]*?${escape(end(tile.id))}\\n?`,
                ),
                "\n",
              )
              .trim()
          : `${css.trim()}\n${start(tile.id)}\n${tile.css}\n${end(tile.id)}`.trim();
        boost.changeWasMade = true;
        const editor = win.boostEditor;
        // the code editor shows the same text (setting it also saves)
        const code = editor.editorWindow?._editor;
        if (code) {
          code.setText(boost.customCSS);
        }
        editor.updateCurrentBoost();
        editor.onUpdateCodeButtonVisual?.();
        refresh();
      };
      for (const [button, tile] of buttons) {
        ctx.listen(button, "command", () => toggle(tile));
      }

      // the boost loads after the window; the code editor can change it
      ctx.interval(refresh, 1000);
      refresh();

      // the window's size is fixed: make room for the new rows
      ctx.timeout(() => {
        const grow = Math.round(row.getBoundingClientRect().height);
        if (grow > 0) {
          win.resizeBy(0, grow);
          ctx.onCleanup(() => win.resizeBy(0, -grow));
        }
      }, 0);
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
