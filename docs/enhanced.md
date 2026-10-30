# Zen Fluent Enhanced

A second Sine mod, installed on top of Zen Fluent, for what CSS cannot do. Each
feature is one script with its own on/off setting. JavaScript stays at the
strict minimum: anything CSS can do lives in Zen Fluent.

## Features

| Feature                         | Setting                                           | Default |
| ------------------------------- | ------------------------------------------------- | ------- |
| Quick Settings                  | `zen-fluent.enhanced.quick-settings`              | `true`  |
| Icon colors                     | `zen-fluent.enhanced.favicon-color`               | `true`  |
| Adaptive accent                 | `zen-fluent.enhanced.adaptive-accent`             | `false` |
| Extensions under the Essentials | `zen-fluent.enhanced.extensions-below-essentials` | `false` |
| Tab numbers while Ctrl is held  | `zen-fluent.enhanced.tab-numbers`                 | `true`  |
| Shortcuts                       | `zen-fluent.enhanced.shortcuts`                   | `true`  |

- **Quick Settings**: a gear button in the sidebar's bottom row, before the
  New button. Its panel has a gallery of presets and Zen Fluent's main
  settings (style, material, tint, accent, corners, density, the selected
  Essential, the extensions row, the variants, the button animations), with
  the labels and choices of Zen Fluent's own settings. A preset sets
  several settings at once, combining a look, an Essentials style, an
  extensions layout and a variant:
  - _Windows 11_: Mica, WinUI corners, the dash and glow (Zen Fluent's
    defaults);
  - _Microsoft Edge_: the Edge style on Mica Alt;
  - _Taskbar_: centered Essentials with the taskbar pill in the icon's
    color, running dots, the reveal hover, extensions at the bottom, ghost
    buttons;
  - _Arc_: Acrylic, Zen corners, Arc Essentials in the icon's color, subtle
    pill buttons;
  - _Compact_: the compact density, side bar marks, running dots, extensions
    at the bottom, square ghost buttons.

  The preset whose settings all match is shown pressed. **Undo preset** puts
  back the settings from before the last preset. **All settings** opens
  Sine's page. The list lives in `enhanced/quick-settings.json`.

- **Icon colors**: reads the dominant color of each tab's icon (the most
  saturated color that covers enough of it, or the average of an icon with no
  color). With Zen Fluent's **Selected Essential color** on _Icon color_, the
  selected Essential takes that exact color: the rings and borders of the Arc,
  Outline and Tint styles get it too, where Zen Fluent alone keeps the accent,
  and the marks and fills are painted in it rather than with the blurred
  favicon. Its lightness is kept in a middle range so a white or black icon
  still shows. An icon that cannot be read keeps Zen Fluent's blurred favicon.
- **Adaptive accent**: the accent follows the site in the selected tab, the
  dominant color of its icon. A grey icon is skipped and Zen Fluent's own
  accent stays, as on pages without an icon. Everything drawn in the accent
  changes with it, and the Mica tint too. Off by default. A page's
  `theme-color` is not read: it lives in the page's process, where Firefox
  only runs code shipped with the browser.
- **Extensions under the Essentials**: with a single toolbar, moves the
  pinned extensions row from above the Essentials to between the Essentials
  and the tabs, which CSS cannot do. Only while Zen Fluent's
  **Extensions › Place** is _Above the Essentials_; Zen Fluent's other row
  settings still apply. Off by default.
- **Tab numbers while Ctrl is held**: hold Ctrl (Cmd on macOS) alone for a
  moment and each tab shows, on its icon, the number Ctrl+1 to Ctrl+8
  selects, and 9 on the last tab. They follow Firefox's own count, so they
  match the shortcuts in every space.
- **Shortcuts**: Ctrl+Alt+Shift+D switches the density (standard or
  compact), Ctrl+Alt+Shift+T the window theme (automatic, light, dark: Zen's
  View › Appearance), Ctrl+Alt+Shift+M the material (Mica, Mica Alt,
  Acrylic). The keys are read by position, so they stay the same on any
  keyboard layout. A message shows the new value.

## Install

Sine › Mods, install from GitHub: `alexisdechiara/zen-fluent/tree/main/enhanced`.
It installs Zen Fluent too if it is missing (`modules` in its `theme.json`).

Sine runs JavaScript from a mod outside its store only when **Enable installing
JS from unofficial sources** is checked (`sine.allow-unsafe-js`). No
fx-autoconfig: Sine ships its own loader, and fx-autoconfig would overwrite it.

## Planned features

| Feature                                       | Setting (planned)                   |
| --------------------------------------------- | ----------------------------------- |
| A color per folder                            | `zen-fluent.enhanced.folder-colors` |
| Fluent icon picker for workspaces and folders | `zen-fluent.enhanced.icon-picker`   |
| Tab hover cards with actions                  | `zen-fluent.enhanced.hover-cards`   |
| Glance style: link preview, Alt+click         | `zen-fluent.enhanced.glance`        |

Each one is documented here, with its default, when it lands.

## Writing a script

See [enhanced/scripts/README.md](../enhanced/scripts/README.md).
