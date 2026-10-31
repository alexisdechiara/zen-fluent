# Zen Fluent Enhanced

A second Sine mod, installed on top of Zen Fluent, for what CSS cannot do. Each
feature is one script with its own on/off setting. JavaScript stays at the
strict minimum: anything CSS can do lives in Zen Fluent.

## Features

| Feature                         | Setting                                           | Default |
| ------------------------------- | ------------------------------------------------- | ------- |
| Quick Settings                  | `zen-fluent.enhanced.quick-settings`              | `true`  |
| Settings page                   | `zen-fluent.enhanced.settings-page`               | `true`  |
| Icon colors                     | `zen-fluent.enhanced.favicon-color`               | `true`  |
| Adaptive accent                 | `zen-fluent.enhanced.adaptive-accent`             | `false` |
| Extensions under the Essentials | `zen-fluent.enhanced.extensions-below-essentials` | `false` |
| Tab numbers while Ctrl is held  | `zen-fluent.enhanced.tab-numbers`                 | `true`  |
| Shortcuts                       | `zen-fluent.enhanced.shortcuts`                   | `true`  |
| Tab archiving                   | `zen-fluent.enhanced.tab-archive`                 | `false` |
| Archive tabs unused for (hours) | `zen-fluent.enhanced.tab-archive.after`           | `12`    |
| Keep archived tabs (days)       | `zen-fluent.enhanced.tab-archive.keep`            | `90`    |
| Archive pinned tabs too         | `zen-fluent.enhanced.tab-archive.pinned`          | `false` |
| Archive tabs in folders too     | `zen-fluent.enhanced.tab-archive.folders`         | `false` |
| PDF viewer                      | `zen-fluent.enhanced.pdf-viewer`                  | `true`  |
| Fluent controls on websites     | `zen-fluent.enhanced.web-controls`                | `false` |
| Browsing stats                  | `zen-fluent.enhanced.browsing-stats`              | `false` |
| Folder colors                   | `zen-fluent.enhanced.folder-colors`               | `true`  |
| Fluent icons in the icon picker | `zen-fluent.enhanced.icon-picker`                 | `true`  |
| Tab hover cards                 | `zen-fluent.enhanced.hover-cards`                 | `false` |
| Hover card delay (ms)           | `zen-fluent.enhanced.hover-cards.delay`           | `500`   |
| Page thumbnails in hover cards  | `zen-fluent.enhanced.hover-cards.thumbnails`      | `true`  |
| Glance link preview             | `zen-fluent.enhanced.glance`                      | `true`  |

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
  the settings page (Sine's dialog while the settings page is off). The list
  lives in `enhanced/quick-settings.json`.

- **Settings page**: `about:zen-fluent`, every Zen Fluent and Zen Fluent
  Enhanced setting on one page in the style of Windows Settings, instead of
  Sine's dialog (which keeps working). Open it with **Zen Fluent** in the app
  menu (under Settings), **Zen Fluent settings** in the Tools menu,
  Ctrl+Alt+Shift+F, or **All settings** in Quick Settings; a link such as
  `about:zen-fluent#tabs` opens one page.
  - _Home_: a live preview of the window over a Fluent bloom (style,
    material, corners, density, the selected Essential, the extensions row,
    the variants), the style and material as picture tiles, light or dark
    mode, the accent swatches, the presets gallery with a preview of each,
    and a card per group.
  - _One page per group_ of Zen Fluent's settings, with each setting's
    description, a dot and a reset button on those you changed, and
    **Reset this page** (click twice; the toast offers Undo). Variants are
    laid out per component, fill and shape side by side.
  - _Enhanced_: each feature with its icon, its options under it.
  - _About_: versions, **Export** and **Import** of your settings (a JSON
    file; unknown or invalid values are skipped), **Reset everything**, a
    link to Sine's dialog and to the project.
  - _Find a setting_ (Ctrl+F or /) searches titles, descriptions, choices
    and preference names.

  Every change applies at once and every value follows changes made
  elsewhere (Sine, Quick Settings, a shortcut). A text setting (custom
  accent, radius, blur, opacity, font) is checked before it is saved and
  asks Sine to rebuild its CSS variable, which Sine only does by itself from
  its dialog. Presets, resets and imports can be undone from their toast.

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
- **Tab archiving** (off by default): every 5 minutes, tabs left unused
  longer than **Archive tabs unused for** (12 hours by default; 1 hour to 1
  week) are saved to an archive file in the profile
  (`zen-fluent-archive.json`), then closed; a message offers **Undo**. Never
  archived: the selected tab, Essentials, tabs playing sound or sharing the
  camera, microphone or screen, Picture-in-Picture, Glance and split view
  tabs, empty tabs, pages that would ask before you leave, and private
  windows. Pinned tabs and tabs in a folder only with their option. Sleeping
  tabs are archived like the others.
  - **The archive**: tab context menu › **Archived tabs…**, or
    Ctrl+Alt+Shift+A. Search by title or address; a click opens the tab
    again in its space (the current one if that space is gone) and takes it
    out of the archive; × removes an entry; **Clear archive** (click twice)
    empties it. **Archive tab** in the same menu archives the tabs at once
    (it closes a page that would ask, keeping its address).
  - **Keep archived tabs**: entries older than 7, 30, 90 days (default) or a
    year are dropped; or kept forever.
  - The archive is written through a temporary file, so a crash during a
    write keeps the previous archive; an archive that cannot be read is
    kept aside (`zen-fluent-archive.json.corrupt-<time>`), never overwritten.
- **PDF viewer**: Firefox's PDF viewer takes Fluent colors: Mica-like
  toolbar and sidebar, WinUI fields and buttons, solid menus, the accent on
  the progress bar, 4 and 8 px corners. Contrast themes keep its system
  colors.
- **Fluent controls on websites** (off by default): buttons and text fields
  that a site leaves to the browser's default look get the WinUI look (4 px
  corners, the darker bottom edge, the accent line of a focused field), and
  checkboxes, radios, sliders and progress bars the accent. A site's own
  CSS always wins (the sheet sits at the browser's level), so styled
  controls do not change. Only on http, https and file pages; contrast
  themes keep the system's controls.
  - Zen Fluent's own CSS cannot do it: Sine's content sheet only reaches
    `about:` pages. Both features register their sheet with Firefox's style
    sheet service, which reaches web pages.
- **Browsing stats** (off by default): app menu › **Browsing stats**, Tools ›
  **Browsing stats** or Ctrl+Alt+Shift+S. For today, the last 7 or 30 days:
  the time spent on pages, the visits and the sites, a bar per day (today in
  the accent) and the top 10 sites. Nothing is recorded by Zen Fluent: the
  visits come from your history and the time from Firefox's own page
  interactions (`browser.places.interactions.enabled`, on by default in Zen,
  kept 60 days by `browser.places.interactions.expireDays`); private
  windows write neither. Reloads, downloads and embedded frames do not
  count as visits.
  - **Counts from the day it is turned on**
    (`zen-fluent.enhanced.browsing-stats.since`, dropped when unchecked).
    **Clear stats** (click twice) starts counting again from now; the
    history is not touched.
  - **Ignore** on a site leaves it out
    (`zen-fluent.enhanced.browsing-stats.ignored`); **Ignored sites › Count
    again** brings it back. `www.` is merged with the site.
  - If time on pages is off in Firefox, the panel says so and offers to
    turn it on; the bars then show visits.
- **Folder colors**: a folder's context menu gets **Folder color**: Default
  (the accent) or one of the Windows accent colors (red, orange, yellow,
  green, teal, blue, purple, pink, gray), a lighter tone in dark mode. It
  colors the folder icon, Zen's or Zen Fluent's Fluent one. Each subfolder
  keeps its own color. Colors are kept by folder in
  `zen-fluent.enhanced.folder-colors.map` and come back with the session.
- **Fluent icons in the icon picker**: Zen's icon picker (a space's icon, a
  folder's, a pinned tab's) gets a **Fluent icons** section after Zen's own:
  142 icons from Microsoft's Fluent UI System Icons (MIT,
  `THIRD-PARTY-NOTICES.md`), from home and work to food, sport, travel,
  media and devices. A picked icon is stored by Zen like its own, and takes
  the text color. They need Zen Fluent's **Allow the mod's icons**
  (`svg.context-properties.content.enabled`), like Zen Fluent's icons;
  without it the section says so. An icon picked here shows as long as Zen
  Fluent Enhanced is installed.
- **Tab hover cards** (off by default): like the taskbar's previews, after a
  short hover (**Hover card delay**: 0.3, 0.5, 0.8 or 1.2 s) a card opens
  beside the tab: a thumbnail of the page (Firefox's own capture, not for the
  selected or a sleeping tab; **Page thumbnails in hover cards**), the title,
  the address, the state (sleeping, playing, muted) and buttons: copy the
  link, duplicate, mute or unmute, unload, close. Moving to another tab
  switches the card at once; it closes when the pointer leaves the tab and
  the card, on a click, a drag, a menu, or when the window loses focus.
  Firefox's tab tooltip and its own tab preview stay hidden meanwhile.
- **Glance link preview**: hold the key that opens Glance (Zen's
  **Open a link in Glance with**, Alt by default; exposed in Zen Fluent's Zen
  settings group) over a link for a moment: a card at the bottom of the page
  shows the link's icon, its title if your history knows the page, its
  address, and the click that opens it in Glance. It goes away when the key
  is released or the pointer leaves the link; nothing shows while Glance is
  off. The page itself is never read: the link is the one Firefox shows in
  its status bar.
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

## Writing a script

See [enhanced/scripts/README.md](../enhanced/scripts/README.md).
