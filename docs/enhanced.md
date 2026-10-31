# Zen Fluent Enhanced

A second Sine mod, installed on top of Zen Fluent, for what CSS cannot do. Each
feature is one script with its own on/off setting. JavaScript stays at the
strict minimum: anything CSS can do lives in Zen Fluent.

## Features

| Feature                                        | Setting                                           | Default                                                              |
| ---------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| Quick Settings                                 | `zen-fluent.enhanced.quick-settings`              | `true`                                                               |
| Icon colors                                    | `zen-fluent.enhanced.favicon-color`               | `true`                                                               |
| Adaptive accent                                | `zen-fluent.enhanced.adaptive-accent`             | `false`                                                              |
| Extensions under the Essentials                | `zen-fluent.enhanced.extensions-below-essentials` | `false`                                                              |
| Tab numbers while Ctrl is held                 | `zen-fluent.enhanced.tab-numbers`                 | `true`                                                               |
| Shortcuts                                      | `zen-fluent.enhanced.shortcuts`                   | `true`                                                               |
| Tab archiving                                  | `zen-fluent.enhanced.tab-archive`                 | `false`                                                              |
| Archive tabs unused for (hours)                | `zen-fluent.enhanced.tab-archive.after`           | `12`                                                                 |
| Keep archived tabs (days)                      | `zen-fluent.enhanced.tab-archive.keep`            | `90`                                                                 |
| Archive pinned tabs too                        | `zen-fluent.enhanced.tab-archive.pinned`          | `false`                                                              |
| Archive tabs in folders too                    | `zen-fluent.enhanced.tab-archive.folders`         | `false`                                                              |
| PDF viewer                                     | `zen-fluent.enhanced.pdf-viewer`                  | `true`                                                               |
| Fluent controls on websites                    | `zen-fluent.enhanced.web-controls`                | `false`                                                              |
| Browsing stats                                 | `zen-fluent.enhanced.browsing-stats`              | `false`                                                              |
| Folder colors                                  | `zen-fluent.enhanced.folder-colors`               | `true`                                                               |
| Fluent icons in the icon picker                | `zen-fluent.enhanced.icon-picker`                 | `true`                                                               |
| Tab hover cards                                | `zen-fluent.enhanced.hover-cards`                 | `false`                                                              |
| Hover card delay (ms)                          | `zen-fluent.enhanced.hover-cards.delay`           | `500`                                                                |
| Page thumbnails in hover cards                 | `zen-fluent.enhanced.hover-cards.thumbnails`      | `true`                                                               |
| Glance link preview                            | `zen-fluent.enhanced.glance`                      | `true`                                                               |
| Breadcrumb address                             | `zen-fluent.enhanced.breadcrumbs`                 | `false`                                                              |
| Command Palette actions                        | `zen-fluent.enhanced.command-palette`             | `true`                                                               |
| Keyboard shortcuts sheet                       | `zen-fluent.enhanced.shortcut-overlay`            | `true`                                                               |
| Snap layouts for split view                    | `zen-fluent.enhanced.snap-layouts`                | `true`                                                               |
| Ctrl+Tab as Alt+Tab                            | `zen-fluent.enhanced.tab-switcher`                | `false`                                                              |
| Boost editor extras                            | `zen-fluent.enhanced.boost-extras`                | `true`                                                               |
| Sleeping tabs and Performance panel            | `zen-fluent.enhanced.performance`                 | `false`                                                              |
| Put inactive tabs to sleep after (minutes)     | `zen-fluent.enhanced.performance.sleep-after`     | `30`                                                                 |
| Tab notes                                      | `zen-fluent.enhanced.tab-notes`                   | `false`                                                              |
| AI controls page                               | `zen-fluent.enhanced.ai-controls`                 | `false`                                                              |
| AI chatbot panel                               | `zen-fluent.enhanced.ai-chat`                     | `false`                                                              |
| Focus sessions                                 | `zen-fluent.enhanced.focus-session`               | `false`                                                              |
| Focus session length (minutes)                 | `zen-fluent.enhanced.focus-session.minutes`       | `25`                                                                 |
| Hide the sidebar during a focus session        | `zen-fluent.enhanced.focus-session.compact`       | `true`                                                               |
| Mute tabs playing sound during a focus session | `zen-fluent.enhanced.focus-session.mute`          | `true`                                                               |
| Block distracting sites during a focus session | `zen-fluent.enhanced.focus-session.block`         | `true`                                                               |
| Distracting sites                              | `zen-fluent.enhanced.focus-session.sites`         | `youtube.com,reddit.com,x.com,facebook.com,instagram.com,tiktok.com` |
| Widgets and shelf                              | `zen-fluent.enhanced.shelf`                       | `false`                                                              |

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
  the address, the state (sleeping, playing, muted), the tab's note (with
  **Tab notes**) and buttons: copy the
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
- **Breadcrumb address** (off by default): while the URL bar shows the
  page's address, it reads like File Explorer's address bar: the site, each
  folder of the path, then the page, with a chevron between them. A click on
  the site or a folder opens that level (Ctrl or middle click: in a new tab,
  Shift: in a new window); a click on the page or the empty space edits the
  address as usual, and the breadcrumb goes away while you type. Only web and
  file addresses get one. When the bar is too narrow, the inner folders fold
  into a **…** segment that opens the last of them.
- **Command Palette actions**: with the
  [Zen Command Palette](https://github.com/Vertex-Mods/Zen-Command-Palette)
  mod installed, its palette gets Zen Fluent's commands: each value of the
  Quick Settings settings (_Zen Fluent: Backdrop material: Acrylic_), the
  presets, every Enhanced feature on or off, and the panels: Quick
  Settings, archived tabs, **Archive this tab**, browsing stats, the
  keyboard shortcuts sheet, Snap layouts, Performance, Tab notes, AI controls, the AI chatbot,
  Focus session, Widgets and shelf
  and all of
  Zen Fluent's settings. A command only shows when it changes something
  (the current value and a feature's panel while it is off are left out).
  Without the mod, it does nothing.
- **Keyboard shortcuts sheet**: Ctrl+Alt+Shift+K, Help › **Keyboard
  shortcuts sheet** or the Command Palette opens a card over the window with
  the main shortcuts of Firefox and Zen (tabs, page, Zen, window), then Zen
  Fluent's own while their feature is on, with a search field. Each one is
  read from the browser, so a shortcut changed in `about:keyboard` shows as
  it is now and a removed one is left out. Escape, the same keys or a click
  outside closes it.
- **Snap layouts**: Windows 11's Snap layouts for Zen's split view. Hover
  the window's maximize button for half a second (or Ctrl+Alt+Shift+Z, the
  tab context menu's **Snap layouts…**, the Command Palette): a flyout shows
  six layouts, two halves, two thirds and a third, three columns, one zone
  and two stacked, four quarters, two stacked halves. A click on a zone puts
  the selected tab there; **Snap Assist** then lists the space's recent
  tabs (Essentials aside) for each zone left, and the split opens once every
  zone has a tab. The sizes stay resizable with Zen's handles and come back
  with the session. A layout with more zones than tabs to offer is dimmed;
  tabs already in a split leave it for the new one.
- **Ctrl+Tab as Alt+Tab** (off by default): Ctrl+Tab works like Windows
  11's Alt+Tab. Hold Ctrl and press Tab: a band over the window shows the
  space's tabs, last used first, each with its icon, its title and a
  thumbnail of the page (its icon while there is none, as for a sleeping
  tab). Tab moves on, Shift+Tab or the arrows move around, releasing Ctrl
  (or Enter) goes to the highlighted tab, Escape cancels; the pointer can
  pick a card, and **×** on a card closes its tab. A quick Ctrl+Tab goes
  back to the previous tab without showing the band. It replaces Firefox's
  Ctrl+Tab while it is on, including its **Ctrl+Tab cycles through tabs in
  recently used order** previews.
- **Boost editor extras**: Zen's Boost editor gets four more tiles after
  **Code**: **Narrow column** (the page's text in a 72-character column),
  **No motion** (animations and transitions stopped), **Hide images**
  (images, videos and background images) and **Sepia**. Each tile adds or
  takes out a block of CSS in the boost's own custom CSS, between
  `/* zen-fluent:<tile> */` comments you can see and edit in the Code
  editor, so they are saved, shared and applied per site like the rest of
  the boost, and need nothing changed in Zen. The editor window grows by
  the new row.
- **Sleeping tabs and Performance** (off by default), as in Edge:
  - **Sleeping tabs**: tabs left unused longer than **Put inactive tabs to
    sleep after** (30 minutes by default; 5 minutes to 4 hours, or never)
    are unloaded with Firefox's own mechanism: the tab stays with its
    history and reloads when you select it. Never put to sleep: the
    selected tab, tabs playing sound or sharing the camera, microphone or
    screen, Picture-in-Picture, Glance and the split view on screen, and
    (Firefox's rule) a page that would ask before leaving or shows a
    dialog. Zen 1.24 has no inactivity timer of its own, and Firefox only
    unloads tabs when memory runs low.
  - **Performance panel**: app menu › **Performance**, Tools ›
    **Performance**, Ctrl+Alt+Shift+P or the Command Palette. The memory
    Zen uses, the active and sleeping tabs, the sleep delay, **Put N other
    tabs to sleep** at once, and the tabs using the most memory with a
    **Sleep** button each. A tab's memory is an estimate: its process's,
    shared between the tabs in it (Firefox does not count per tab). **Open
    the task manager** opens `about:processes`.
- **Tab notes** (off by default): turns on Firefox's own tab notes, which
  Zen ships turned off (`browser.tabs.notes.enabled`, put back to Zen's
  default when unchecked): tab context menu › **Add note** or **Edit
  note**, and the note icon on a tab opens it. A note belongs to the page
  (its canonical address), so it comes back when the page is opened again.
  Zen Fluent Enhanced adds:
  - **All notes**: Tools › **Tab notes**, the tab context menu's **All
    notes…**, Ctrl+Alt+Shift+N or the Command Palette: every note, newest
    first, with its site and date, a search field, and a click that goes to
    the page's tab or opens it. Read from Firefox's notes database, never
    written.
  - With **Tab hover cards** on, a tab's card shows its note.
- **AI controls page** (off by default): shows Firefox's **AI controls**
  page in Zen's settings, which Zen hides (`browser.preferences.aiControls`,
  put back to Zen's default when unchecked): each AI feature can be left
  available, turned on or blocked (translations, PDF image descriptions,
  link preview key points, the sidebar chatbot, speech recognition), and
  one switch blocks them all. The page sets Firefox's own switches. Tools ›
  **AI controls** or the Command Palette opens it.
- **AI chatbot panel** (off by default): Firefox's chatbot in the sidebar,
  which Zen turns off (`browser.ml.chat.*`, put back to Zen's defaults
  when unchecked). Choose Claude, ChatGPT, Gemini, HuggingChat or Mistral
  in the panel; open or close it with the new button in the sidebar's
  bottom row, Ctrl+Alt+X or the Command Palette. The page's context menu
  gets **Ask an AI chatbot**, and selected text a shortcut to it.
- **Focus sessions** (off by default), as in Windows' Clock app: a timer
  button in the sidebar's bottom row (or the Command Palette) opens the
  Focus panel. Pick 15, 25, 45, 60 or 90 minutes (**Focus session
  length**) and start. While it runs, the button draws its progress as a
  ring, and the panel shows the time left with **+5 min** and **End
  session**. As chosen in the panel or in Sine, during the session:
  - **Hide the sidebar**: compact mode in every window, put back after;
  - **Mute tabs playing sound**, the selected one aside, unmuted after;
  - **Block distracting sites** (**Distracting sites**, separated by
    commas; subdomains included): a tab that opens one goes back, with a
    message saying until when.

  When the time is up, a message and a system notification say so. The
  session is shared by all windows and survives closing the panel.

- **Widgets and shelf** (off by default): a button in the sidebar's bottom
  row, Ctrl+Alt+Shift+W or the Command Palette opens a board like Windows'
  widgets: the time and the date, **Now playing** (the tabs playing sound,
  to go to or mute), the last **Downloads** (a click opens a finished one),
  and the **Shelf**: links, text and images kept for later. Drop them on
  the shelf (dragging over the button opens the board) or click **Add this
  page**. A click opens a link or an image in a new tab and copies a text;
  items can be dragged out again, to a page or the address bar; × (or
  Delete) takes one away. The shelf is kept in the profile
  (`zen-fluent-shelf.json`, 100 items at most) and shared by every window.
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
