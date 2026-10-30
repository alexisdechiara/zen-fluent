# Zen Fluent Enhanced

A second Sine mod, installed on top of Zen Fluent, for what CSS cannot do. Each
feature is one script with its own on/off setting. JavaScript stays at the
strict minimum: anything CSS can do lives in Zen Fluent.

## Features

| Feature     | Setting                             | Default |
| ----------- | ----------------------------------- | ------- |
| Icon colors | `zen-fluent.enhanced.favicon-color` | `true`  |

- **Icon colors**: reads the dominant color of each tab's icon (the most
  saturated color that covers enough of it, or the average of an icon with no
  color). With Zen Fluent's **Selected Essential color** on _Icon color_, the
  selected Essential takes that exact color: the rings and borders of the Arc,
  Outline and Tint styles get it too, where Zen Fluent alone keeps the accent,
  and the marks and fills are painted in it rather than with the blurred
  favicon. Its lightness is kept in a middle range so a white or black icon
  still shows. An icon that cannot be read keeps Zen Fluent's blurred favicon.

## Install

Sine › Mods, install from GitHub: `alexisdechiara/zen-fluent/tree/main/enhanced`.
It installs Zen Fluent too if it is missing (`modules` in its `theme.json`).

Sine runs JavaScript from a mod outside its store only when **Enable installing
JS from unofficial sources** is checked (`sine.allow-unsafe-js`). No
fx-autoconfig: Sine ships its own loader, and fx-autoconfig would overwrite it.

## Planned features

| Feature                                       | Setting (planned)                   |
| --------------------------------------------- | ----------------------------------- |
| Tab numbers while Ctrl is held                | `zen-fluent.enhanced.tab-numbers`   |
| A color per folder                            | `zen-fluent.enhanced.folder-colors` |
| Fluent icon picker for workspaces and folders | `zen-fluent.enhanced.icon-picker`   |
| Tab hover cards with actions                  | `zen-fluent.enhanced.hover-cards`   |
| Shortcuts to switch density and theme         | `zen-fluent.enhanced.shortcuts`     |
| Glance style: link preview, Alt+click         | `zen-fluent.enhanced.glance`        |

Each one is documented here, with its default, when it lands.

## Writing a script

See [enhanced/scripts/README.md](../enhanced/scripts/README.md).
