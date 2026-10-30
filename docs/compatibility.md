# Compatibility with other mods

Zen Fluent restyles most of Zen, so a mod that styles the same parts meets its
rules. This page lists the mods checked so far, what happens with each, and
what Zen Fluent does about it.

| Mod                                                         | Status                                |
| ----------------------------------------------------------- | ------------------------------------- |
| [Advanced Tab Groups](#advanced-tab-groups)                 | Works, with Zen Fluent's compat rules |
| [ZenLibraryTweaks](#zenlibrarytweaks)                       | Works, with Zen Fluent's compat rules |
| [Glance Plus](#glance-plus)                                 | Works, with Zen Fluent's compat rules |
| [Zen Second Sidebar Enhanced](#zen-second-sidebar-enhanced) | Works, with Zen Fluent's compat rules |
| [Zen Command Palette](#zen-command-palette)                 | Works, with Zen Fluent's compat rules |
| [Zen Calmer Context Menu](#zen-calmer-context-menu)         | Works, with Zen Fluent's compat rules |
| [BetterZenGradientPicker](#betterzengradientpicker)         | Works, but its gradient does not show |
| [Zen Easel](#zen-easel)                                     | Works, with Zen Fluent's compat rules |
| [Zen Page Tint](#zen-page-tint)                             | Conflicts: do not use both            |
| [Blended Addressbar](#blended-addressbar)                   | Conflicts: do not use both            |
| [Better Find Bar](#better-find-bar)                         | Conflicts: do not use both            |
| [SuperPins](#superpins)                                     | Conflicts: do not use both            |

The compat rules are part of Zen Fluent (`core/src/compat/` and a few
component files) and need no setting: they only match what those mods add.
They were checked in Zen 1.23.4b against each mod's CSS at the version given
below, with the elements their scripts create built by hand.

## How mods share the page

- Sine loads every mod as a **user** sheet, in the order of the mod ids:
  `Zen-Fluent` starts with a capital letter, so a mod whose id is in lower case
  (most of them) comes after it and wins any tie between two `!important`
  rules of the same specificity. Compat rules therefore use a more specific
  selector than the mod's.
- A mod that styles from a script with inline `!important` (author origin)
  loses to Zen Fluent's user `!important`, whatever the selector.
- A mod that wraps its rules in `@layer` wins over every unlayered
  `!important` rule of Zen Fluent.

## Advanced Tab Groups

[Vertex-Mods/Advanced-Tab-Groups](https://github.com/Vertex-Mods/Advanced-Tab-Groups)
(checked: 3.11.1). Turns on Firefox's tab groups and styles them.

- **Group headers** take the row of a Zen folder in Zen Fluent: the folder
  row's height, the control radius, the WinUI hover fill (Edge's in the Edge
  style) and a semibold label in the primary text color. This applies to the
  "folder look" (on by default) and to Advanced Tab Groups' own look; its
  Arc-like style keeps its own section label.
- **Folder icons**: the Fluent folder icons (**Fluent icons**) only replace
  Zen's folder icon on Zen folders. With the folder look, a group keeps
  Advanced Tab Groups' copy of the Zen folder icon, tinted with the group's
  color, and its open / closed animation.
- A Firefox tab group without Advanced Tab Groups keeps Firefox's look.

Files: `core/src/compat/advanced-tab-groups.css`,
`core/src/features/fluent-icons/folders.css`.

## ZenLibraryTweaks

[JustAdumbPrsn/ZenLibraryTweaks](https://github.com/JustAdumbPrsn/ZenLibraryTweaks)
(checked: 1.5.1). Adds sections to the Library and lets its tabs be reordered.

- Its **History** section replaces Zen's with a subclass: it gets the same
  one-line rows as Zen's. Its own touch (the time shown in place of the
  address on hover) is kept.
- **Reordering the Library tabs** slides them again: the button animations
  (**Button animations**) no longer replace the tabs' own transition; the
  hover fill and the press of a Library tab animate on the pill drawn behind
  it.
- In edit mode, the dashed outline follows the radius of the tab's pill, and
  the remove badge stays on its corner.
- Its colored Library icons and outlines use Zen Fluent's folder tint (the
  accent), its bookmark folders take the Fluent folder icons, and the row a
  context menu was opened on keeps the hover fill.

Files: `core/src/compat/zen-library-tweaks.css`,
`core/src/components/library/history.css`,
`core/src/features/animations/button-animations.css`,
`core/src/features/fluent-icons/folders.css`.

## Glance Plus

[apoapostolov/Zen-Glance-Plus](https://github.com/apoapostolov/Zen-Glance-Plus)
(checked: 1.1.0). Opens pages in a Glance by rules, and adds two buttons to
the Glance strip.

- Its **Copy link** and **Bookmark** buttons already take the round Acrylic
  buttons of the strip. With **Fluent icons**, they also take the Fluent link
  and star icons, like close, open and split next to them. In Raindrop mode,
  the bookmark button keeps the Raindrop glyph.

File: `core/src/features/fluent-icons/glance-split.css`.

## Zen Second Sidebar Enhanced

[sinazadeh/zen-second-sidebar-enhanced](https://github.com/sinazadeh/zen-second-sidebar-enhanced)
(checked: 1.13.8). Web panels in a second sidebar.

- The web panel takes the page card's radius and shadow (Edge: 8 px and the
  hairline), its toolbar the WinUI layer of Firefox's sidebar, its text that
  sidebar's color.
- The launcher buttons take the WinUI hover fill, and an open panel's button
  the selected fill.
- What floats over the page (an unpinned panel, the auto-hide launcher) is
  solid Acrylic, as everything Zen Fluent lays over the page: Firefox does not
  blur the page behind a translucent surface. A pinned panel stays transparent
  on the window's material, as Zen's sidebar does.

Files: `core/src/compat/second-sidebar.css`,
`core/src/components/firefox-sidebar/panel.css`.

## Zen Command Palette

[Vertex-Mods/Zen-Command-Palette](https://github.com/Vertex-Mods/Zen-Command-Palette)
(checked: 2.0.0). Commands in the URL bar. Its results are URL bar rows and
already look like Zen Fluent's.

- Its accents follow Zen Fluent's accent (**Accent color**) instead of the
  space color.
- The **Commands** pill shown in its prefix mode is an accent pill, with the
  text color made for the accent, like Zen Fluent's accent buttons.

File: `core/src/compat/command-palette.css`.

## Zen Calmer Context Menu

[sinazadeh/zen-calmer-context-menu](https://github.com/sinazadeh/zen-calmer-context-menu)
(checked: 5.4.3). Hides, folds and reorders context menu entries.

- **Apply the Zen space accent color** tints menus and panels in place of the
  Acrylic: it is a choice you make in its settings, and Zen Fluent lets it.
- **Apply the Zen space gradient** would paint Zen's gradient into menus, but
  Zen Fluent shows Mica instead of that gradient: there is nothing to paint,
  and menus would only turn to Zen's flat gray. Zen Fluent keeps the Acrylic
  then.
- The **quick actions** row (Reload, Pin…) hovers like the menu rows around
  it, and the **restored icons** line up with Zen Fluent's menu rows (12 px
  inset, 12 px before the label).

File: `core/src/compat/calmer-context-menu.css`.

## BetterZenGradientPicker

[JustAdumbPrsn/BetterZenGradientPicker](https://github.com/JustAdumbPrsn/BetterZenGradientPicker).
The picker works, but the window gradient it writes does not show: Zen Fluent
replaces Zen's gradient with Mica (or its own tint). Its colors only reach Zen
Fluent through **Accent color** › **Zen workspace color**. Not otherwise
checked in the browser.

## Zen Easel

[trashshii007/zen-easel](https://github.com/trashshii007/zen-easel) (checked:
0.9.0, its code read, not run). An infinite canvas at `about:easel`.

- The page's panels (top bar, toolbar, menus, popups) take Zen Fluent's
  accent, Acrylic, strokes, text colors, shadow and font: Easel declares
  them as tokens on its `<zen-easel>` element, which a user rule overrides.
  The board and its grips keep Easel's colors: they are the canvas.
- Its **Send to Easel** menu keeps the colors of Easel's own bar rather than
  the Acrylic, on purpose.

Checked on a hand-built `<zen-easel>` with Easel's token rules, not in a
running Easel.

File: `core/src/compat/easel.css`.

## Zen Page Tint

[caezium/zen-page-tint](https://github.com/caezium/zen-page-tint) (checked:
2.0.0). **Conflicts.** It colors the window from the page, which is what Zen
Fluent's material does: its rules sit in a cascade layer and win over all of
Zen Fluent's, so the toolbar and the sidebar turn the page's color over Mica
(and lose the Acrylic sidebar in compact mode). With several toolbars, it
also removes the Edge style's 4 px gaps around the page. Use one or the other.

## Blended Addressbar

[kkugot/blended-addressbar](https://github.com/kkugot/blended-addressbar)
(checked: 1.7.27). **Conflicts.** It recolors the URL bar and the top bar
from the page and frames the page with its own margin, radius and shadow,
over Zen Fluent's URL bar and page card. It also forces bookmark folder menus
to the system menu colors (no Acrylic) and, with several toolbars, removes the
Edge style's gaps around the page. Use one or the other.

## Better Find Bar

[RobotoSkunk/ff-better-findbar](https://github.com/RobotoSkunk/ff-better-findbar)
(checked: 1.7.1). **Conflicts.** It turns the find bar into a floating card
while Zen Fluent draws it as a strip along the page: the result is a floating
bar with the strip's fill and sizes. Use one or the other.

## SuperPins

[CosmoCreeper/Zen-Themes › SuperPins](https://github.com/CosmoCreeper/Zen-Themes/tree/main/SuperPins)
(checked: 1.7.2). **Conflicts.** Its Essentials grid and gap replace Zen
Fluent's, and its workspace indicator options overlap Zen Fluent's
(**Workspace indicator**). Some of its rules target elements and attributes
Zen 1.23 no longer has, so they do nothing. Use one or the other.

## Reporting a problem

If a mod looks wrong with Zen Fluent, open an issue with the mod's name and
version, a screenshot, and the Zen Fluent settings you changed. Compat rules
only target what a mod adds, never the mod's own settings.
