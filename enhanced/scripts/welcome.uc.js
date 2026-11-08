// Zen Fluent Enhanced: a welcome tour of Zen Fluent, once, over the window.
//
// Over Zen's own welcome video: a start screen, then four pages in a
// Fluent card (text and buttons on the left, what they change on the
// right): a theme and the mode, the accent, features to turn on, and the
// rest (the settings page, Quick Settings, settings per space, shortcuts).
// What you pick applies at once. It shows in the first browser window
// while zen-fluent.enhanced.welcome.seen is false, waits for another mod's
// welcome screen to close first, and sets the pref when it closes; the
// settings page (About) clears it to show the tour again. Escape closes it.
// Text in English, translated by lib/zf-l10n.sys.mjs (ids start with zf-).
//
// Motion (none with reduced motion): the window sweeps from Zen's look to
// Zen Fluent's before the tour (its zones turned off, then back on in a
// view transition growing from the middle); a theme or a mode crossfades
// the window; an accent spreads from the swatch clicked; each feature row
// has a small looping drawing; at the end the card flies to the button
// that opens the settings again, which pulses.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { openSettings } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-settings.sys.mjs",
  );

  const SEEN = "zen-fluent.enhanced.welcome.seen";
  const VIDEO = "chrome://browser/content/zen-videos/welcome-background.mp4";
  const QUICK = "chrome://sine/content/Zen-Fluent-Enhanced/quick-settings.json";
  const ICONS = "chrome://sine/content/Zen-Fluent-Enhanced/icons/fluent/";
  const SCHEME = "zen.view.window.scheme";
  const ACCENT = "zen-fluent.accent";
  // Other mods' welcome screens: the tour waits for them to close
  const OTHER_WELCOMES = "#bgp-welcome-root, #ltw-welcome-root";
  // Zen Fluent's zones (docs/settings/zones.md): off, the window looks like Zen
  const ZONES = [
    "window",
    "sidebar",
    "urlbar",
    "menus",
    "notifications",
    "findbar",
    "library",
    "media",
    "split-glance",
    "dialogs",
    "firefox-sidebar",
    "screens",
    "icons",
    "content",
  ].map((zone) => `zen-fluent.fluent-${zone}`);
  // Where the settings are found again: the first one on screen
  const SETTINGS_BUTTONS = [
    "zf-quick-settings-button",
    "zen-library-button",
    "PanelUI-menu-button",
  ];

  const MODES = [
    { label: "System", value: 2 },
    { label: "Light", value: 1 },
    { label: "Dark", value: 0 },
  ];
  const ACCENTS = [
    { label: "Windows accent", value: "system", color: "AccentColor" },
    {
      label: "Zen workspace color",
      value: "zen",
      color: "var(--zen-primary-color, #8b80d8)",
    },
    { label: "Blue", value: "blue", color: "#0078d4" },
    { label: "Violet", value: "violet", color: "#8764b8" },
    { label: "Mint", value: "mint", color: "#00b294" },
    { label: "Orange", value: "orange", color: "#ca5010" },
    { label: "Pink", value: "pink", color: "#e3008c" },
    { label: "Graphite", value: "graphite", color: "#69797e" },
  ];
  // Features worth a switch on the first day: [pref, title, text, icon]
  const FEATURES = [
    [
      "zen-fluent.enhanced.site-color",
      "Site color",
      "The window takes the color of the site you are on.",
      "drop",
    ],
    [
      "zen-fluent.enhanced.adaptive-accent",
      "Adaptive accent",
      "The accent follows the icon of the site.",
      "paint-brush",
    ],
    [
      "zen-fluent.enhanced.hover-cards",
      "Tab hover cards",
      "A preview and actions beside the tab under the pointer.",
      "image",
    ],
    [
      "zen-fluent.enhanced.tab-archive",
      "Tab archiving",
      "Tabs left unused close into a searchable archive.",
      "archive",
    ],
    [
      "zen-fluent.enhanced.tab-switcher",
      "Ctrl+Tab as Alt+Tab",
      "The space's tabs, last used first, with thumbnails.",
      "shapes",
    ],
  ];
  const DEFAULTS = {
    "zen-fluent.enhanced.site-color": false,
    "zen-fluent.enhanced.adaptive-accent": false,
    "zen-fluent.enhanced.hover-cards": false,
    "zen-fluent.enhanced.tab-archive": false,
    "zen-fluent.enhanced.tab-switcher": false,
  };
  const HIGHLIGHTS = [
    [
      "Settings page",
      "Every setting, with a live preview: Zen's settings › Zen Fluent, or Ctrl+Alt+Shift+F.",
      "apps",
    ],
    [
      "Quick Settings",
      "A tab of Zen's Library with the main settings and the themes.",
      "wrench",
    ],
    [
      "Settings per space",
      "A space can have its own mode, material, accent or site color.",
      "design-ideas",
    ],
    [
      "Keyboard shortcuts sheet",
      "Ctrl+Alt+Shift+K shows the main shortcuts over the window.",
      "clipboard",
    ],
  ];

  const feature = ZFFeature.attach(window, {
    name: "welcome",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      let root = null;

      const firstWindow = () =>
        Services.wm.getMostRecentWindow("navigator:browser") === win;
      const html = (tag, attributes = {}, ...children) => {
        const node = doc.createElementNS("http://www.w3.org/1999/xhtml", tag);
        for (const [name, value] of Object.entries(attributes)) {
          if (name.startsWith("on")) {
            node.addEventListener(name.slice(2), value);
          } else if (value !== false && value != null) {
            node.setAttribute(name, value === true ? "" : value);
          }
        }
        node.append(...children.flat().filter((c) => c != null && c !== false));
        return node;
      };
      const icon = (name) =>
        html("img", {
          class: "zf-wl-icon",
          src: `${ICONS}${name}.svg`,
          alt: "",
        });
      const button = (label, onclick, primary = false) =>
        html(
          "button",
          { class: `zf-wl-button${primary ? " zf-wl-primary" : ""}`, onclick },
          label,
        );

      // -------- Motion --------

      const reduced = () =>
        win.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const frames = (count) =>
        new Promise((resolve) => {
          const step = () =>
            --count < 0 ? resolve() : win.requestAnimationFrame(step);
          step();
        });
      let transition = null;

      /** Runs `apply` (pref changes) in a view transition: a crossfade, or
       * a circle growing from `from` ({x, y}). The -moz-pref() media
       * queries settle within a few ms, before the new snapshot. */
      async function animate(apply, { from = null, kind = "ripple" } = {}) {
        const rootNode = doc.documentElement;
        if (reduced() || typeof doc.startViewTransition !== "function") {
          apply();
          return;
        }
        transition?.skipTransition();
        let applied = false;
        if (from) {
          const radius = Math.hypot(
            Math.max(from.x, win.innerWidth - from.x),
            Math.max(from.y, win.innerHeight - from.y),
          );
          rootNode.style.setProperty("--zf-wl-x", `${from.x}px`);
          rootNode.style.setProperty("--zf-wl-y", `${from.y}px`);
          rootNode.style.setProperty("--zf-wl-r", `${Math.ceil(radius)}px`);
        }
        rootNode.setAttribute("zf-wl-motion", from ? kind : "fade");
        try {
          // Not requestAnimationFrame here: a view transition holds frames
          // back until this callback ends
          transition = doc.startViewTransition(async () => {
            apply();
            applied = true;
            await new Promise((resolve) => win.setTimeout(resolve, 40));
            win.getComputedStyle(rootNode).color;
          });
          await transition.finished;
        } catch {
          if (!applied) {
            apply();
          }
        } finally {
          transition = null;
          rootNode.removeAttribute("zf-wl-motion");
        }
      }

      /** Where the pointer clicked, or the middle of the element. */
      const origin = (event) => {
        if (event?.clientX || event?.clientY) {
          return { x: event.clientX, y: event.clientY };
        }
        const rect = event?.currentTarget?.getBoundingClientRect?.();
        return rect
          ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          : { x: win.innerWidth / 2, y: win.innerHeight / 2 };
      };

      /** Zen's look, then Zen Fluent's sweeping in from the middle. The
       * zones get back exactly the values they had. */
      async function sweepIn() {
        if (reduced() || typeof doc.startViewTransition !== "function") {
          return;
        }
        const saved = ZONES.map((name) => [
          name,
          Services.prefs.prefHasUserValue(name)
            ? Services.prefs.getBoolPref(name, true)
            : null,
        ]);
        const restore = () => {
          for (const [name, value] of saved) {
            if (value === null) {
              Services.prefs.clearUserPref(name);
            } else {
              Services.prefs.setBoolPref(name, value);
            }
          }
        };
        ctx.onCleanup(restore);
        try {
          for (const name of ZONES) {
            Services.prefs.setBoolPref(name, false);
          }
          await frames(2);
          await new Promise((resolve) => win.setTimeout(resolve, 450));
          await animate(restore, {
            from: { x: win.innerWidth / 2, y: win.innerHeight / 2 },
            kind: "sweep",
          });
        } finally {
          restore();
        }
      }

      /** The first settings button on screen. */
      const settingsButton = () =>
        SETTINGS_BUTTONS.map((id) => doc.getElementById(id)).find((node) => {
          const rect = node?.getBoundingClientRect();
          return rect && rect.width > 0 && rect.height > 0;
        });

      function close({ fly = false } = {}) {
        Services.prefs.setBoolPref(SEEN, true);
        if (!root) {
          return;
        }
        const node = root;
        root = null;
        const target = fly && !reduced() ? settingsButton() : null;
        const card = node.querySelector(".zf-wl-card:not([hidden])");
        if (!target || !card) {
          node.setAttribute("zf-closing", "");
          win.setTimeout(() => node.remove(), 300);
          return;
        }
        // The card shrinks into the button, the video fades, the button pulses
        const from = card.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        const scale = Math.max(to.width / from.width, 0.04);
        node.setAttribute("zf-flying", "");
        card
          .animate(
            [
              { transform: "none", opacity: 1 },
              {
                transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
                opacity: 0,
              },
            ],
            {
              duration: 560,
              easing: "cubic-bezier(0.7, 0, 0.84, 0)",
              fill: "forwards",
            },
          )
          .finished.catch(() => {})
          .then(() => {
            node.remove();
            pulse(target);
          });
      }

      /** Two accent rings around the button, then nothing left behind. */
      function pulse(target) {
        const rect = target.getBoundingClientRect();
        const ring = html("div", {
          class: "zf-wl-pulse",
          style: `left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;`,
        });
        doc.documentElement.append(ring);
        win.setTimeout(() => ring.remove(), 1900);
        ctx.onCleanup(() => ring.remove());
      }

      /** A small looping drawing of a feature: a mini window in spans,
       * animated by welcome.css (data-art = the feature). */
      const art = (pref) =>
        html(
          "span",
          {
            class: "zf-wl-art",
            "data-art": pref.replace("zen-fluent.enhanced.", ""),
            "aria-hidden": "true",
          },
          ...Array.from({ length: 4 }, (_, i) =>
            html("span", { class: `zf-wl-art-${i + 1}` }),
          ),
        );

      async function loadPresets() {
        try {
          return (await (await win.fetch(QUICK)).json()).presets ?? [];
        } catch {
          return [];
        }
      }

      /** The theme cards, the selected one marked, applied on click. */
      function themePage(presets) {
        const matches = (preset) =>
          Object.entries(preset.prefs).every(
            ([property, value]) =>
              Services.prefs.getStringPref(property, "") === value,
          );
        const grid = html("div", { class: "zf-wl-themes" });
        const draw = () =>
          grid.replaceChildren(
            ...presets.map((preset) =>
              html(
                "button",
                {
                  class: "zf-wl-theme",
                  "aria-pressed": String(matches(preset)),
                  onclick: () =>
                    animate(() => {
                      for (const [property, value] of Object.entries(
                        preset.prefs,
                      )) {
                        Services.prefs.setStringPref(property, value);
                      }
                      draw();
                    }),
                },
                html("span", { class: "zf-wl-theme-name" }, preset.name),
                html("span", { class: "zf-wl-theme-desc" }, preset.description),
              ),
            ),
          );
        draw();
        const mode = html("div", { class: "zf-wl-segmented", role: "group" });
        const drawMode = () =>
          mode.replaceChildren(
            ...MODES.map(({ label, value }) =>
              html(
                "button",
                {
                  "aria-pressed": String(
                    Services.prefs.getIntPref(SCHEME, 2) === value,
                  ),
                  onclick: () =>
                    animate(() => {
                      Services.prefs.setIntPref(SCHEME, value);
                      drawMode();
                    }),
                },
                label,
              ),
            ),
          );
        drawMode();
        return {
          title: "Your look",
          text: "Pick a theme: it sets the style, the material, the Essentials and the buttons at once. Then the mode. Everything applies right away, and every detail can change later.",
          content: [
            grid,
            html("h3", { class: "zf-wl-subtitle" }, "Mode"),
            mode,
          ],
        };
      }

      function accentPage() {
        const list = html("div", { class: "zf-wl-accents" });
        const draw = () => {
          const current = Services.prefs.getStringPref(ACCENT, "system");
          list.replaceChildren(
            ...ACCENTS.map(({ label, value, color }) =>
              html(
                "button",
                {
                  class: "zf-wl-accent",
                  "aria-pressed": String(current === value),
                  onclick: (event) =>
                    animate(
                      () => {
                        Services.prefs.setStringPref(ACCENT, value);
                        draw();
                      },
                      { from: origin(event) },
                    ),
                },
                html("span", {
                  class: "zf-wl-swatch",
                  style: `--zf-wl-swatch: ${color}`,
                }),
                html("span", {}, label),
              ),
            ),
          );
        };
        draw();
        return {
          title: "Accent color",
          text: "The color of selections, switches, the URL bar's line and the main buttons. Windows' own accent, your space's color, or one of these.",
          content: [list],
        };
      }

      function featuresPage() {
        const rows = FEATURES.map(([pref, title, text]) => {
          const toggle = html("button", {
            class: "zf-wl-switch",
            role: "switch",
            "aria-label": title,
          });
          const update = () =>
            toggle.setAttribute(
              "aria-checked",
              String(Services.prefs.getBoolPref(pref, DEFAULTS[pref])),
            );
          toggle.addEventListener("click", () => {
            Services.prefs.setBoolPref(
              pref,
              !Services.prefs.getBoolPref(pref, DEFAULTS[pref]),
            );
            update();
          });
          update();
          return html(
            "div",
            { class: "zf-wl-row" },
            art(pref),
            html(
              "span",
              { class: "zf-wl-row-text" },
              html("span", { class: "zf-wl-row-title" }, title),
              html("span", { class: "zf-wl-row-desc" }, text),
            ),
            toggle,
          );
        });
        return {
          title: "Features",
          text: "Zen Fluent Enhanced adds features you can turn on or off at any time, each one a script of its own. A few to start with:",
          content: [html("div", { class: "zf-wl-rows" }, rows)],
        };
      }

      function morePage() {
        return {
          title: "And there is more",
          text: "The settings page has everything else, from the tab row height to the zones Zen Fluent styles, and Sine's marketplace with each mod's compatibility.",
          content: [
            html(
              "div",
              { class: "zf-wl-rows" },
              HIGHLIGHTS.map(([title, text, iconName]) =>
                html(
                  "div",
                  { class: "zf-wl-row" },
                  icon(iconName),
                  html(
                    "span",
                    { class: "zf-wl-row-text" },
                    html("span", { class: "zf-wl-row-title" }, title),
                    html("span", { class: "zf-wl-row-desc" }, text),
                  ),
                ),
              ),
            ),
          ],
          finish: true,
        };
      }

      async function show() {
        if (root || !firstWindow()) {
          return;
        }
        const pages = [
          themePage(await loadPresets()),
          accentPage(),
          featuresPage(),
          morePage(),
        ];
        let index = 0;

        const video = html("video", {
          class: "zf-wl-video",
          src: VIDEO,
          autoplay: true,
          loop: true,
          muted: true,
        });
        video.muted = true;
        const start = html(
          "div",
          { class: "zf-wl-start" },
          html("p", { class: "zf-wl-kicker" }, "Welcome to"),
          html("h1", { class: "zf-wl-hero" }, "Zen Fluent"),
          html(
            "p",
            { class: "zf-wl-lead" },
            "Mica, Acrylic and the controls of Windows 11 for Zen.",
          ),
          button("Get started", () => go(0), true),
        );
        const counter = html("span", { class: "zf-wl-counter" });
        const title = html("h2", { class: "zf-wl-title" });
        const text = html("p", { class: "zf-wl-text" });
        const content = html("div", { class: "zf-wl-content" });
        const back = button("Back", () => go(index - 1));
        const finish = () => {
          close({ fly: true });
          win.setTimeout(() => openSettings(win), reduced() ? 0 : 700);
        };
        const next = button(
          "Next",
          () => (pages[index].finish ? finish() : go(index + 1)),
          true,
        );
        const skip = button("Skip", () => close());
        const dots = html("div", { class: "zf-wl-dots" });
        const card = html(
          "div",
          { class: "zf-wl-card", hidden: true },
          html(
            "div",
            { class: "zf-wl-side" },
            counter,
            title,
            text,
            dots,
            html("div", { class: "zf-wl-actions" }, back, next),
            skip,
          ),
          content,
        );

        function go(to) {
          if (to < 0) {
            return;
          }
          if (to >= pages.length) {
            close();
            return;
          }
          index = to;
          start.hidden = true;
          card.hidden = false;
          const page = pages[index];
          counter.textContent = `${index + 1} / ${pages.length}`;
          title.textContent = page.title;
          text.textContent = page.text;
          content.replaceChildren(...page.content);
          back.hidden = index === 0;
          skip.hidden = !!page.finish;
          next.textContent = page.finish ? "Open the settings" : "Next";
          dots.replaceChildren(
            ...pages.map((_, i) =>
              html("span", { "aria-current": String(i === index) }),
            ),
          );
          card.querySelector(".zf-wl-finish")?.remove();
          if (page.finish) {
            card.querySelector(".zf-wl-actions").after(
              html(
                "div",
                { class: "zf-wl-finish" },
                button("Start browsing", () => close({ fly: true })),
              ),
            );
          }
          next.focus();
        }
        root = html(
          "div",
          {
            id: "zf-welcome",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": "Welcome to Zen Fluent",
          },
          video,
          html("div", { class: "zf-wl-scrim" }),
          start,
          card,
        );
        root.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        });
        // Zen's look turns into Zen Fluent's, then the tour opens
        const node = root;
        await sweepIn();
        if (root !== node) {
          return;
        }
        doc.documentElement.append(root);
        start.querySelector("button")?.focus();
        ctx.onCleanup(() => root?.remove());
      }

      // Waits for another mod's welcome screen to close, then shows
      function showWhenFree() {
        if (Services.prefs.getBoolPref(SEEN, false) || root) {
          return;
        }
        if (doc.querySelector(OTHER_WELCOMES)) {
          const observer = new win.MutationObserver(() => {
            if (!doc.querySelector(OTHER_WELCOMES)) {
              observer.disconnect();
              ctx.timeout(showWhenFree, 600);
            }
          });
          observer.observe(doc.documentElement, {
            childList: true,
            subtree: true,
          });
          ctx.onCleanup(() => observer.disconnect());
          return;
        }
        show();
      }

      // The settings page clears the pref to show it again
      ctx.observePref(SEEN, () => {
        if (!Services.prefs.getBoolPref(SEEN, false)) {
          showWhenFree();
        }
      });
      // After the window has settled (session restore, other mods' screens)
      ctx.timeout(showWhenFree, 2500);
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
