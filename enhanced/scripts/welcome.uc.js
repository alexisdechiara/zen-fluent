// Zen Fluent Enhanced: a welcome tour of Zen Fluent, once, over the window.
//
// After Zen's own welcome: when Zen's welcome screen ends (its
// zen-welcome-stage attribute leaves the root), Zen Fluent's zones are
// turned off while Zen fades its window in, so the window first shows in
// Zen's look; Zen Fluent's look then sweeps in from the middle, and the
// tour opens over the window, dimmed (what you pick shows behind it at
// once). A start screen, then pages in a card (text and buttons on the
// left, the choices on the right): a theme and the mode, the accent, the
// window, tabs and sidebar, URL bar and menus, motion, Enhanced's
// features, and where to find it all again. The setting pages are drawn
// from core/preferences.json (labels, options; the Custom values left to
// the settings page), the features from enhanced/preferences.json. It
// shows in the first browser window while zen-fluent.enhanced.welcome.seen
// is false, waits for Zen's and other mods' welcome screens to close, and
// sets the pref when it closes; the settings page (About) clears it to
// show the tour again. Escape closes it. Text in English, translated by
// lib/zf-l10n.sys.mjs (ids and classes start with zf-).
//
// Motion (none with reduced motion), with Zen's own motion library
// (gZenUIManager.motion, the springs and staggers of Zen's welcome; the
// Web Animations API when it is missing): the hero's letters rise one by
// one, a page's text springs in from the side it comes from while the
// previous one slides out, its rows rise in turn; a theme, a mode or a
// setting crossfades the window (a view transition), an accent spreads
// from the swatch clicked; each feature row has a small looping drawing;
// at the end the card flies to the button that opens the settings again,
// which pulses.
//
// Clicks: Zen's welcome and other screens mark the window as a drag
// region, and Windows answers "caption" for a point in one before Gecko
// sees the click (a first click moved the window, a second one reached the
// button): the tour's card and start screen are no-drag (welcome.css).
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { openSettings } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-settings.sys.mjs",
  );

  const SEEN = "zen-fluent.enhanced.welcome.seen";
  // The zones' values while the tour shows Zen's look, kept in case Zen
  // quits before they come back (restored at the next start)
  const SAVED = "zen-fluent.enhanced.welcome.zones";
  const CORE_PREFS = "chrome://sine/content/Zen-Fluent/core/preferences.json";
  const ENHANCED_PREFS =
    "chrome://sine/content/Zen-Fluent-Enhanced/preferences.json";
  const QUICK = "chrome://sine/content/Zen-Fluent-Enhanced/quick-settings.json";
  const ICONS = "chrome://sine/content/Zen-Fluent-Enhanced/icons/fluent/";
  const SCHEME = "zen.view.window.scheme";
  const ACCENT = "zen-fluent.accent";
  // Marks a window whose zones the tour turned off
  const ACTIVE = "zf-wl-active";
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
  // The settings people change most, by page: a property of
  // core/preferences.json, or [property, a label of the tour's own or null,
  // a description of its own ("" for none)]
  const SETTING_PAGES = [
    {
      title: "The window",
      text: "The material behind the window and how much it is tinted, the corners, the density and the font.",
      settings: [
        ["zen-fluent.material", null, ""],
        "zen-fluent.tint-opacity",
        "zen-fluent.corners",
        "zen-fluent.corner-radius",
        "zen-fluent.density",
        "zen-fluent.font",
      ],
    },
    {
      title: "Tabs and sidebar",
      text: "How the selected Essential and the selected tab stand out, where the extensions sit, and when tabs show their close button.",
      settings: [
        "zen-fluent.essentials.selected-style",
        ["zen-fluent.essentials.align", "Essentials alignment"],
        ["zen-fluent.extensions.position", "Extensions row"],
        "zen-fluent.tab-pill",
        "zen-fluent.tab-close-button",
      ],
    },
    {
      title: "URL bar and menus",
      text: "The URL bar's shape and accent line, when it floats over the page, the caption buttons and the menus' tint.",
      settings: [
        "zen-fluent.url-style",
        "zen-fluent.url-underline",
        "zen.urlbar.behavior",
        "zen-fluent.titlebar-style",
        "zen-fluent.menu-tint",
      ],
    },
    {
      title: "Motion",
      text: "How tabs, menus and the URL bar open, and the small animations of buttons and icons.",
      settings: [
        "zen-fluent.tab-switch-animation",
        "zen-fluent.menu-animation",
        "zen-fluent.urlbar-animation",
        "zen-fluent.button-animations",
        "zen-fluent.animated-icons",
      ],
    },
  ];
  // Enhanced's features worth a switch on the first day: [feature, its
  // drawing (welcome.css) or a Fluent icon]
  const FEATURES = [
    ["site-color", { art: true }],
    ["adaptive-accent", { art: true }],
    ["hover-cards", { art: true }],
    ["tab-switcher", { art: true }],
    ["tab-archive", { art: true }],
    ["performance", { icon: "bed" }],
    ["start-page", { icon: "home" }],
    ["breadcrumbs", { icon: "folder" }],
    ["focus-session", { icon: "timer" }],
    ["shelf", { icon: "box" }],
  ];
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

  // Zen's welcome springs and fades (ZenWelcome.mjs)
  const SPRING = { type: "spring", bounce: 0.3, visualDuration: 0.35 };
  const EXIT = { duration: 0.12, ease: "easeIn" };
  const FADE = { duration: 0.25, ease: "easeOut" };
  const EASINGS = {
    easeIn: "cubic-bezier(0.42, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.58, 1)",
    easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
  };

  /** A Sine label: its title and the ~grey description~ after it. */
  const splitLabel = (label = "") => {
    const [title, description] = label.split("~");
    return [title.trim(), description?.trim() || ""];
  };

  /** A pref's value whatever its type, or `fallback` while it is missing. */
  function readPref(property, fallback) {
    const prefs = Services.prefs;
    switch (prefs.getPrefType(property)) {
      case prefs.PREF_STRING:
        return prefs.getStringPref(property);
      case prefs.PREF_INT:
        return String(prefs.getIntPref(property));
      case prefs.PREF_BOOL:
        return prefs.getBoolPref(property);
    }
    return fallback;
  }

  function writePref(property, value) {
    const prefs = Services.prefs;
    if (typeof value === "boolean") {
      prefs.setBoolPref(property, value);
    } else if (prefs.getPrefType(property) === prefs.PREF_INT) {
      prefs.setIntPref(property, Number(value));
    } else {
      prefs.setStringPref(property, String(value));
    }
  }

  const feature = ZFFeature.attach(window, {
    name: "welcome",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      let root = null;
      let waiting = false;

      const firstWindow = () =>
        Services.wm.getMostRecentWindow("navigator:browser") === win;
      const wait = (ms) =>
        new Promise((resolve) => win.setTimeout(resolve, ms));
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
      const json = async (url) => {
        try {
          return await (await win.fetch(url)).json();
        } catch {
          return null;
        }
      };

      // -------- Motion --------

      const reduced = () =>
        win.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const frames = (count) =>
        new Promise((resolve) => {
          const step = () =>
            --count < 0 ? resolve() : win.requestAnimationFrame(step);
          step();
        });

      /** One end of `keyframes` (0 or 1) as CSS values. */
      function keyframe(keyframes, end) {
        const at = (name, fallback) => {
          const value = keyframes[name];
          return value == null
            ? fallback
            : Array.isArray(value)
              ? value[end ? value.length - 1 : 0]
              : value;
        };
        const frame = {};
        if ("opacity" in keyframes) {
          frame.opacity = at("opacity", 1);
        }
        if ("x" in keyframes || "y" in keyframes || "scale" in keyframes) {
          frame.transform = `translate(${at("x", 0)}px, ${at("y", 0)}px) scale(${at("scale", 1)})`;
        }
        if ("filter" in keyframes) {
          frame.filter = at("filter", "none");
        }
        return frame;
      }

      /** Zen's motion library on `targets` (Motion's keyframes: opacity,
       * x, y, scale, filter as [from, to]; its options, plus `stagger` and
       * `delay` in seconds), or the Web Animations API; reduced motion
       * goes straight to the end. Resolves when it has played. */
      function move(targets, keyframes, options = {}) {
        const { stagger = 0, delay = 0, ...rest } = options;
        const list = (
          targets instanceof win.Element ? [targets] : [...targets]
        ).filter(Boolean);
        if (!list.length) {
          return Promise.resolve();
        }
        const settle = (node) =>
          Object.assign(node.style, keyframe(keyframes, 1));
        if (reduced()) {
          list.forEach(settle);
          return Promise.resolve();
        }
        const motion = win.gZenUIManager?.motion;
        if (typeof motion?.animate === "function") {
          try {
            const played = motion.animate(list, keyframes, {
              ...rest,
              delay: stagger
                ? motion.stagger(stagger, { startDelay: delay })
                : delay,
            });
            return Promise.resolve(played).catch(() => list.forEach(settle));
          } catch {
            // The Web Animations API below
          }
        }
        const spring = rest.type === "spring";
        const duration =
          (rest.duration ?? rest.visualDuration ?? 0.3) *
          (spring ? 1400 : 1000);
        const easing = spring
          ? "cubic-bezier(0.2, 1.25, 0.35, 1)"
          : (EASINGS[rest.ease] ?? EASINGS.easeOut);
        const frames = [keyframe(keyframes, 0), keyframe(keyframes, 1)];
        return Promise.all(
          list.map((node, index) => {
            settle(node);
            return node
              .animate(frames, {
                duration,
                easing,
                delay: (delay + index * stagger) * 1000,
                fill: "backwards",
              })
              .finished.catch(() => {});
          }),
        );
      }

      /** Out, then gone: Zen's quick exit, toward `x`. */
      const leave = (node, x = 0) =>
        move(node, { opacity: [1, 0], x: [0, x] }, EXIT).then(() =>
          node.remove(),
        );

      let transition = null;

      /** Runs `apply` (pref changes) in a view transition: a crossfade, or
       * a circle growing from `from` ({x, y}). The -moz-pref() media
       * queries settle within a few ms, before the new snapshot. A
       * transition that waits too long for a frame is skipped, which still
       * applies the change. */
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
        let watchdog = 0;
        try {
          // Not requestAnimationFrame here: a view transition holds frames
          // back until this callback ends
          const current = doc.startViewTransition(async () => {
            apply();
            applied = true;
            await new Promise((resolve) => win.setTimeout(resolve, 40));
            win.getComputedStyle(rootNode).color;
          });
          transition = current;
          watchdog = win.setTimeout(() => current.skipTransition(), 2500);
          await current.finished;
        } catch {
          if (!applied) {
            apply();
          }
        } finally {
          win.clearTimeout(watchdog);
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

      // -------- Zen's look, then Zen Fluent's --------

      let saved = null;
      /** The zones off (Zen's look), their values kept in SAVED. */
      function hideFluent() {
        if (saved) {
          return;
        }
        saved = ZONES.map((name) => [
          name,
          Services.prefs.prefHasUserValue(name)
            ? Services.prefs.getBoolPref(name, true)
            : null,
        ]);
        doc.documentElement.setAttribute(ACTIVE, "");
        Services.prefs.setStringPref(SAVED, JSON.stringify(saved));
        for (const name of ZONES) {
          Services.prefs.setBoolPref(name, false);
        }
      }
      /** The zones back, exactly as they were. */
      function showFluent() {
        if (!saved) {
          return;
        }
        for (const [name, value] of saved) {
          if (value === null) {
            Services.prefs.clearUserPref(name);
          } else {
            Services.prefs.setBoolPref(name, value);
          }
        }
        saved = null;
        Services.prefs.clearUserPref(SAVED);
        doc.documentElement.removeAttribute(ACTIVE);
      }
      ctx.onCleanup(showFluent);

      // Zen quit while the zones were off: they come back now (unless
      // another window's tour has them off right now)
      const leftover = Services.prefs.getStringPref(SAVED, "");
      const busy = [...Services.wm.getEnumerator("navigator:browser")].some(
        (other) =>
          other !== win && other.document.documentElement.hasAttribute(ACTIVE),
      );
      if (leftover && !busy) {
        try {
          saved = JSON.parse(leftover);
        } catch {
          saved = [];
        }
        showFluent();
      }

      /** Zen's look sweeps into Zen Fluent's from the middle. The zones
       * may already be off (after Zen's welcome); otherwise the window
       * crossfades to Zen's look first. */
      async function sweepIn() {
        if (reduced() || typeof doc.startViewTransition !== "function") {
          showFluent();
          return;
        }
        if (!saved) {
          await animate(hideFluent);
          await wait(350);
        }
        try {
          await frames(2);
          await animate(showFluent, {
            from: { x: win.innerWidth / 2, y: win.innerHeight / 2 },
            kind: "sweep",
          });
        } finally {
          showFluent();
        }
      }

      // -------- Closing --------

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
        // The card shrinks into the button, the scrim fades, the button pulses
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

      // -------- Controls --------

      /** A group of buttons, one pressed: the pressed mark moves at once,
       * then `pick` applies the value (in a crossfade, mostly). */
      function choices(items, { current, pick, className, role = "radio" }) {
        const group = html("div", {
          class: className,
          role: role === "radio" ? "radiogroup" : "group",
        });
        const state = role === "radio" ? "aria-checked" : "aria-pressed";
        group.append(
          ...items.map((item) =>
            html(
              "button",
              {
                class: item.className,
                role: role === "radio" ? "radio" : null,
                [state]: String(current(item)),
                style: item.style,
                onclick: (event) => {
                  for (const other of group.children) {
                    other.setAttribute(
                      state,
                      String(other === event.currentTarget),
                    );
                  }
                  pick(item, event);
                },
              },
              item.content,
            ),
          ),
        );
        return group;
      }

      /** A WinUI ToggleSwitch, 40 x 20, writing `property`. */
      function toggleSwitch(property, fallback, label) {
        const toggle = html("button", {
          class: "zf-wl-switch",
          role: "switch",
          "aria-label": label,
        });
        const value = () => readPref(property, fallback) === true;
        const update = () =>
          toggle.setAttribute("aria-checked", String(value()));
        toggle.addEventListener("click", () => {
          writePref(property, !value());
          update();
        });
        update();
        return toggle;
      }

      /** A settings card: a title, its description, and its control at the
       * end (a switch) or under it (the values as buttons). */
      function settingCard({ title, description, control, inline, lead }) {
        return html(
          "div",
          { class: `zf-wl-setting${inline ? " zf-wl-inline" : ""}` },
          lead,
          html(
            "span",
            { class: "zf-wl-setting-text" },
            html("span", { class: "zf-wl-setting-title" }, title),
            description &&
              html("span", { class: "zf-wl-setting-desc" }, description),
          ),
          control,
        );
      }

      /** A setting of core/preferences.json as a card. */
      function settingFromDef(def, ownLabel, ownDescription) {
        const [label, sineDescription] = splitLabel(def.label);
        const title = ownLabel ?? label;
        const description = ownDescription ?? sineDescription;
        if (def.type === "checkbox") {
          return settingCard({
            title,
            description,
            inline: true,
            control: toggleSwitch(def.property, def.defaultValue, title),
          });
        }
        const options = (def.options ?? []).filter(
          (option) => option.value !== "custom",
        );
        return settingCard({
          title,
          description,
          control: choices(
            options.map((option) => ({
              className: "zf-wl-chip",
              value: String(option.value),
              content: option.label,
            })),
            {
              className: "zf-wl-chips",
              current: (item) =>
                item.value === String(readPref(def.property, def.defaultValue)),
              pick: (item) =>
                animate(() => writePref(def.property, item.value)),
            },
          ),
        });
      }

      /** A small looping drawing of a feature: a mini window in spans,
       * animated by welcome.css (data-art = the feature), or an icon in
       * the same frame. */
      const art = (name, look) =>
        look.icon
          ? html(
              "span",
              { class: "zf-wl-art", "data-art": "icon", "aria-hidden": "true" },
              icon(look.icon),
            )
          : html(
              "span",
              { class: "zf-wl-art", "data-art": name, "aria-hidden": "true" },
              ...Array.from({ length: 4 }, (_, i) =>
                html("span", { class: `zf-wl-art-${i + 1}` }),
              ),
            );

      // -------- Pages --------

      /** The theme cards and the mode. */
      function themePage(presets, defs) {
        // A setting never changed reads as its default
        const fallback = (property) =>
          defs?.find((d) => d.property === property)?.defaultValue ?? "";
        const matches = (preset) =>
          Object.entries(preset.prefs).every(
            ([property, value]) =>
              String(readPref(property, fallback(property))) === value,
          );
        return {
          title: "Your look",
          text: "Pick a theme: it sets the style, the material, the Essentials and the buttons at once. Then the mode. Everything applies right away, and every detail can change later.",
          render: () => [
            choices(
              presets.map((preset) => ({
                className: "zf-wl-theme",
                preset,
                content: [
                  html("span", { class: "zf-wl-theme-name" }, preset.name),
                  html(
                    "span",
                    { class: "zf-wl-theme-desc" },
                    preset.description,
                  ),
                ],
              })),
              {
                className: "zf-wl-themes",
                role: "toggle",
                current: (item) => matches(item.preset),
                pick: (item) =>
                  animate(() => {
                    for (const [property, value] of Object.entries(
                      item.preset.prefs,
                    )) {
                      Services.prefs.setStringPref(property, value);
                    }
                  }),
              },
            ),
            html("h3", { class: "zf-wl-subtitle" }, "Mode"),
            choices(
              MODES.map((mode) => ({ ...mode, content: mode.label })),
              {
                className: "zf-wl-segmented",
                current: (item) =>
                  Services.prefs.getIntPref(SCHEME, 2) === item.value,
                pick: (item) =>
                  animate(() => Services.prefs.setIntPref(SCHEME, item.value)),
              },
            ),
          ],
        };
      }

      function accentPage() {
        return {
          title: "Accent color",
          text: "The color of selections, switches, the URL bar's line and the main buttons. Windows' own accent, your space's color, or one of these.",
          render: () => [
            choices(
              ACCENTS.map((accent) => ({
                ...accent,
                className: "zf-wl-accent",
                content: [
                  html("span", {
                    class: "zf-wl-swatch",
                    style: `--zf-wl-swatch: ${accent.color}`,
                  }),
                  html("span", {}, accent.label),
                ],
              })),
              {
                className: "zf-wl-accents",
                current: (item) =>
                  Services.prefs.getStringPref(ACCENT, "system") === item.value,
                pick: (item, event) =>
                  animate(
                    () => Services.prefs.setStringPref(ACCENT, item.value),
                    {
                      from: origin(event),
                    },
                  ),
              },
            ),
          ],
        };
      }

      /** A page of core settings, those core/preferences.json declares. */
      function settingsPage(page, defs) {
        const cards = () =>
          page.settings
            .map((entry) => {
              const [property, label = null, description = null] =
                Array.isArray(entry) ? entry : [entry];
              const def = defs.find((d) => d.property === property);
              return def ? settingFromDef(def, label, description) : null;
            })
            .filter(Boolean);
        return { title: page.title, text: page.text, render: cards };
      }

      function featuresPage(defs) {
        return {
          title: "Features",
          text: "Zen Fluent Enhanced adds features you can turn on or off at any time, each one a script of its own. A few to start with:",
          render: () =>
            FEATURES.map(([name, look]) => {
              const def = defs.find(
                (d) => d.property === `zen-fluent.enhanced.${name}`,
              );
              if (!def) {
                return null;
              }
              const [title, description] = splitLabel(def.label);
              return settingCard({
                title,
                description,
                inline: true,
                lead: art(name, look),
                control: toggleSwitch(
                  def.property,
                  def.defaultValue === true,
                  title,
                ),
              });
            }).filter(Boolean),
        };
      }

      function readyPage() {
        return {
          title: "You're all set",
          text: "Change any of this later from these places, where every setting is.",
          render: () =>
            HIGHLIGHTS.map(([title, description, iconName]) =>
              settingCard({
                title,
                description,
                inline: true,
                lead: icon(iconName),
              }),
            ),
          finish: true,
        };
      }

      // -------- The tour --------

      async function show() {
        if (root || !firstWindow()) {
          return;
        }
        const [quick, core, enhanced] = await Promise.all([
          json(QUICK),
          json(CORE_PREFS),
          json(ENHANCED_PREFS),
        ]);
        if (root) {
          return;
        }
        const pages = [
          themePage(quick?.presets ?? [], core),
          accentPage(),
          ...(core
            ? SETTING_PAGES.map((page) => settingsPage(page, core))
            : []),
          ...(enhanced ? [featuresPage(enhanced)] : []),
          readyPage(),
        ];
        let index = -1;

        // The start screen: the hero's letters rise one by one
        const hero = html(
          "h1",
          { class: "zf-wl-hero", "aria-label": "Zen Fluent" },
          ..."Zen Fluent"
            .split("")
            .map((char) =>
              char === " "
                ? " "
                : html(
                    "span",
                    { class: "zf-wl-char", "aria-hidden": "true" },
                    char,
                  ),
            ),
        );
        const startButton = button("Get started", () => begin(), true);
        const kicker = html("p", { class: "zf-wl-kicker" }, "Welcome to");
        const lead = html(
          "p",
          { class: "zf-wl-lead" },
          "Mica, Acrylic and the controls of Windows 11 for Zen.",
        );
        const start = html(
          "div",
          { class: "zf-wl-start" },
          kicker,
          hero,
          lead,
          startButton,
        );

        // The card: the text on the left, the choices on the right
        const back = html(
          "button",
          { class: "zf-wl-back", onclick: () => go(index - 1, -1) },
          "Back",
        );
        const texts = html("div", { class: "zf-wl-texts" });
        const dots = html(
          "div",
          { class: "zf-wl-dots" },
          pages.map(() => html("span", { "aria-current": "false" })),
        );
        const actions = html("div", { class: "zf-wl-actions" });
        const content = html("div", { class: "zf-wl-pages" });
        const card = html(
          "div",
          { class: "zf-wl-card", hidden: true },
          html("div", { class: "zf-wl-side" }, back, texts, dots, actions),
          content,
        );
        const scrim = html("div", { class: "zf-wl-scrim" });

        const finish = () => {
          close({ fly: true });
          win.setTimeout(() => openSettings(win), reduced() ? 0 : 700);
        };

        let begun = false;
        async function begin() {
          if (begun) {
            return;
          }
          begun = true;
          await move(
            [
              kicker,
              ...hero.querySelectorAll(".zf-wl-char"),
              lead,
              startButton,
            ],
            { opacity: [1, 0], y: [0, -14] },
            { duration: 0.3, ease: "easeIn", stagger: 0.012 },
          );
          start.hidden = true;
          card.hidden = false;
          card.style.opacity = "0";
          go(0, 1);
          move(
            card,
            { opacity: [0, 1], scale: [0.96, 1], y: [24, 0] },
            { ...SPRING, bounce: 0.25, visualDuration: 0.45 },
          );
        }

        /** Shows page `to`, coming from `direction` (1 forward, -1 back). */
        function go(to, direction) {
          if (to < 0 || to === index) {
            return;
          }
          if (to >= pages.length) {
            close();
            return;
          }
          index = to;
          const page = pages[index];

          // The text: the old one slides out, the new one springs in
          for (const old of [...texts.children]) {
            if (!old.hasAttribute("zf-leaving")) {
              old.setAttribute("zf-leaving", "");
              leave(old, -80 * direction);
            }
          }
          const text = html(
            "div",
            { class: "zf-wl-text-page" },
            html(
              "span",
              { class: "zf-wl-counter" },
              `${index + 1} / ${pages.length}`,
            ),
            html("h2", { class: "zf-wl-title" }, page.title),
            html("p", { class: "zf-wl-text" }, page.text),
          );
          texts.append(text);
          for (const child of text.children) {
            child.style.opacity = "0";
          }
          move(
            text.children,
            { opacity: [0, 1], x: [120 * direction, 0] },
            { ...SPRING, bounce: 0.4, visualDuration: 0.3, stagger: 0.03 },
          );

          // The choices: the old ones fade, the new rows rise in turn
          for (const old of [...content.children]) {
            if (!old.hasAttribute("zf-leaving")) {
              old.setAttribute("zf-leaving", "");
              leave(old);
            }
          }
          const body = html("div", { class: "zf-wl-page" }, ...page.render());
          content.append(body);
          move(body, { opacity: [0, 1] }, FADE);
          for (const child of body.children) {
            child.style.opacity = "0";
          }
          move(
            body.children,
            { opacity: [0, 1], y: [14, 0] },
            { ...SPRING, bounce: 0.2, stagger: 0.035, delay: 0.04 },
          );

          back.toggleAttribute("disabled", index === 0);
          [...dots.children].forEach((dot, i) =>
            dot.setAttribute("aria-current", String(i === index)),
          );
          actions.replaceChildren(
            ...(page.finish
              ? [
                  button("Start browsing", () => close({ fly: true })),
                  button("Open the settings", finish, true),
                ]
              : [
                  button("Skip", () => close()),
                  button("Next", () => go(index + 1, 1), true),
                ]),
          );
          actions.lastElementChild.focus();
        }

        root = html(
          "div",
          {
            id: "zf-welcome",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": "Welcome to Zen Fluent",
          },
          scrim,
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
        for (const part of [kicker, ...hero.children, lead, startButton]) {
          part.style.opacity = "0";
        }
        doc.documentElement.append(root);
        ctx.onCleanup(() => root?.remove());
        move(scrim, { opacity: [0, 1] }, { duration: 0.45, ease: "easeOut" });
        move(
          kicker,
          { opacity: [0, 1], y: [12, 0], filter: ["blur(2px)", "blur(0px)"] },
          { ...SPRING, delay: 0.15 },
        );
        await move(
          hero.querySelectorAll(".zf-wl-char"),
          { opacity: [0, 1], y: [50, 0] },
          {
            type: "spring",
            bounce: 0.3,
            visualDuration: 0.45,
            stagger: 0.035,
            delay: 0.25,
          },
        );
        move(
          lead,
          { opacity: [0, 1], y: [12, 0] },
          { ...FADE, duration: 0.35 },
        );
        await move(
          startButton,
          { opacity: [0, 1], y: [20, 0], filter: ["blur(2px)", "blur(0px)"] },
          {
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 1.8,
            delay: 0.1,
          },
        );
        if (!begun) {
          startButton.focus();
        }
      }

      // -------- When --------

      /** Zen's own welcome screen is up. */
      const zenWelcome = () =>
        doc.documentElement.hasAttribute("zen-welcome-stage") ||
        !!doc.getElementById("zen-welcome");

      /** Waits for Zen's welcome and other mods' welcome screens to close,
       * then shows. */
      function showWhenFree() {
        if (Services.prefs.getBoolPref(SEEN, false) || root || waiting) {
          return;
        }
        if (zenWelcome()) {
          waiting = true;
          const observer = new win.MutationObserver(() => {
            if (zenWelcome()) {
              return;
            }
            observer.disconnect();
            // Zen fades its window in now: in Zen's look, for the sweep
            if (!reduced() && firstWindow()) {
              hideFluent();
            }
            ctx.timeout(() => {
              waiting = false;
              showWhenFree();
            }, 1200);
          });
          observer.observe(doc.documentElement, {
            attributes: true,
            attributeFilter: ["zen-welcome-stage"],
          });
          ctx.onCleanup(() => observer.disconnect());
          return;
        }
        if (doc.querySelector(OTHER_WELCOMES)) {
          waiting = true;
          const observer = new win.MutationObserver(() => {
            if (!doc.querySelector(OTHER_WELCOMES)) {
              observer.disconnect();
              ctx.timeout(() => {
                waiting = false;
                showWhenFree();
              }, 600);
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
      // Zen's welcome starts with the window: look at once, then again
      // once the window has settled (session restore, other mods' screens)
      if (zenWelcome()) {
        showWhenFree();
      }
      ctx.timeout(showWhenFree, 2500);
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
