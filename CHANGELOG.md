# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
[Semantic Versioning](https://semver.org/); both mods share one version and one
`vX.Y.Z` tag.

## [Unreleased]

### Added

- Zen Fluent Enhanced, **Settings per space**: a space can have its own
  mode, style, material and tint, space color, accent, density, floating URL
  bar color, and Enhanced's site color, adaptive accent and window glow. Set
  them on the settings page's new **Spaces** page (or **Space settings…**
  in a space's context menu), or on each settings page with **Settings
  for** in its header
  ([Enhanced](docs/enhanced.md#features)).

- Zen Fluent Enhanced in **French** when Zen is: the settings page, Zen's
  settings entries, menus, toasts, Library boards and Command Palette
  actions (`enhanced/l10n/fr/strings.json`). Sine's own dialog keeps the
  English labels. The empty folder hint of Zen Fluent follows too.
- **Open Zen's settings on Zen Fluent** (on by default): the settings
  button opens Zen Fluent's Overview.

- Compatibility with the active Vertex Mods (Zen Tidy Tabs, Tidy
  Downloads, Reopen Closed Tabs Menu, Browse Bot, Zen Auto Wallpaper,
  Search Keyboard Shortcuts, Search Engine Select, Compact Settings,
  Floating Sidebar): their shared `--zenux-*` tokens take Zen Fluent's, and
  Browse Bot's floating find bar, Compact Settings' icon strip and Floating
  Sidebar's unpinned sidebar get compat rules
  ([compatibility](docs/compatibility.md#vertex-mods)).
- Zen Fluent Enhanced, **Mods**: a **Featured** section (Zen Fluent's
  picks), **Details** opens the mod's card in a dialog (what it does, its
  compatibility, version, links) instead of the documentation, and
  **Installed** is a greyed button of the Install button's size.
- A weekly CI job checks the listed mods for new versions to check again
  and the Vertex Mods for repositories missing from the list
  (`npm run check:mods`).

### Changed

- Zen Fluent Enhanced, **Mods**: the marketplace and the installed mods
  show in pages (12 cards or 20 rows), and Sine's own **Sine Mods** entry
  leaves Zen's settings while the settings page is on (Mods replaces it).
- Whole themes that replace Zen's look (Nebula, Arc 2.0, Zia, Neo Zen, Livs
  Theme, macaron, Wireframe 2.0) are marked **Breaks Zen Fluent** and left
  out of the Mods page's marketplace
  ([compatibility](docs/compatibility.md#whole-themes)).
- Installing an incompatible mod, from the marketplace or a GitHub address,
  asks first in a dialog.
- The settings page's Appearance chooses **Style**, **Material**, **Corners
  and gaps** and **Density** in dropdowns again (the Overview and Themes
  pages keep their pictures).
- **Window glow** is softer and only shows when the space's colors or the
  color scheme change.

### Fixed

- BetterZenGradientPicker: Zen Fluent's look of the gradient picker won
  over half of the mod's redesign; it steps aside while the mod's picker is
  there.
- Themes: the previews of the Taskbar and Compact themes now draw their
  Subtle fill (nothing filled at rest).

- Installing, turning on or off a mod from the Mods page left Zen's
  settings on another pane: the page comes back on its section once Sine
  has run the scripts again.

- Text on the accent (selected text, the autofilled part of the floating
  URL bar, accent buttons) picks black or white by the accent's lightness:
  a light adaptive or custom accent gave white text on a light color.
- The media card in the sidebar is opaque: the tab titles under it showed
  through, hovered or not.
- Windows: clicking the window's very top-right corner (the cursor thrown
  there) only lit Close up: that strip was still part of the window's drag
  region.
- Zen Fluent Enhanced, **Fluent controls on websites**: only fields and
  buttons without a class or a style attribute change. Styled ones, such as
  Google's search box, got the accent line and borders on the sides they
  left alone.
- Mods: the button that opens a mod's page (and the links of the settings
  page) did nothing: Firefox refuses the system principal for a web link.
- **Window glow** flashed the whole window on tab switches: Zen rewrites
  its background layers with the same colors, and the glow's stacking
  context came and went with each glow.
- Variants, extensions: with 0.4.2's "Fill and shape for: The whole row"
  still saved, **Each button** styled the row. Opening the extensions pin
  moves that look to **The row**.

## [0.4.3] - 2026-11-01

### Added

- Zen Fluent Enhanced: **Mods**, in place of Compatible mods: Sine's
  marketplace on the settings page, with each mod's compatibility with Zen
  Fluent (**Not checked** for a mod outside Zen Fluent's list), previews,
  stars, filters by badge and tag, a sort, Install, Update, Uninstall,
  Check for updates and an install from a GitHub address.
- **Extensions row: fill** and **shape**: the row and its buttons each
  have their own look, both applied (the settings page's extensions pin
  has a tab for each). The 0.4.2 "Fill and shape for: The whole row" still
  works until a row look is picked.
- The settings page's Variants panel docks on the right of the drawing on
  a window 1300 px wide or more.
- **Style**, **Material**, **Corners and gaps** and **Density** are chosen
  on pictures on the settings page, as on the Themes page.
- Expert mode: a **Custom (expert mode)** value for every numeric setting
  (Essentials, extensions row, Enhanced's times), and its switch on
  Overview. **Interface style** only shows in expert mode: a theme sets it.
- **Moving gradient** (`zen-fluent.gradient-animation`, off): the space's
  gradient drifts slowly.
- Zen Fluent Enhanced: **Window glow** (`zen-fluent.enhanced.window-glow`,
  on): a short glow when the window changes color.

### Changed

- **Floating URL bar color** takes the variants' names: Solid (default),
  Standard (the material), Tint (the space's color, else the accent, so it
  never looks like Solid) and Translucent. "Material" and "Space color"
  read as Standard and Tint.
- Every "auto" choice reads **Automatic (…)**.
- Zen's settings panes (Look and Feel, Tab Management) lay their settings
  out as WinUI's Settings app: one card per setting, 4 px apart, group
  titles as text, child settings indented. Firefox's nested settings
  (Permissions: pop-up and add-on exceptions) are expander items under
  their card instead of a card inside a card.
- Firefox's **Window density** and **Browser theme** are hidden: Zen
  Fluent's Density and colors replace them.
- The README is a short presentation (what each mod does, a gallery,
  install); the table of every setting and its default moved to
  `docs/settings/README.md`. New screenshots on Zen 1.24, with the pages of
  Zen's website, plus the Edge style and Enhanced's settings page and Quick
  Settings.

### Fixed

- Picture-in-Picture: the bottom buttons are centred on play / pause, and
  every icon has the same size.
- Close is reached by throwing the cursor into the window's top-right
  corner (Fitts's law): its target runs to the corner, and Zen's hover
  band starts at the window's top.
- Before the mod's settings were first opened, the settings on by default
  looked off: Sine only writes a checkbox's default then, and the CSS read
  the missing preference as off. The space name was hidden, and the Fluent
  icons, button animations, pill tabs, tab shadow, pinned extensions row,
  compact sidebar background and compact edge hint were missing. These
  settings now only turn off on an explicit `false`, and `npm run check`
  refuses the old form.

## [0.4.2] - 2026-11-01

### Changed

- **Variant fills take Microsoft's names** (Fluent 2 and WinUI), and Solid
  is now opaque: **Solid** (opaque, `ControlSolidFillColorDefault`),
  **Standard** (new: WinUI's default button, the see-through control fill
  that Solid used to be), **Tint** (was Subtle: a tint in a border),
  **Outline**, **Subtle** (was Ghost: a fill on hover only),
  **Transparent** (new: no fill, accent glyph on hover) and
  **Translucent**. A Ghost fill saved before reads as Subtle; a Subtle fill
  saved before now reads as the new Subtle: pick Tint for the old look.

### Added

- **Expert mode** (`zen-fluent.expert`, off by default): shows and applies
  more settings: **Gap around the page**, **Gap between the sidebar and the
  page**, **Page corners**, **Sidebar padding**, **Row height** and **Space
  between tabs**, each a list of lengths or a custom one.
- **Page fills the window in compact mode** (`zen-fluent.compact-flush`):
  no gap, corners or stroke while the sidebar is hidden.
- Zen Fluent Enhanced: on a wide window, the settings page lays its
  settings out in two columns (three from 2000 px), and Zen's settings give
  it the room.
- **Floating URL bar color** (`zen-fluent.url-floating-color`): white or
  black (default), translucent like Arc, the space's color, or the
  material (the previous look, opaque Mica Alt under Mica Alt).

### Changed

- Zen Fluent Enhanced: **Widgets**, **Focus** and **Quick settings** are
  tabs of Zen's Library instead of buttons in the sidebar's bottom row
  (Focus shows its timer there only while a session runs). Zen's Choose
  tabs hides them; with ZenLibraryTweaks they are reordered and removed
  like its own sections. While the Library is off, each opens in a panel
  from its button, as before.

### Fixed

- While the URL bar floats, its place in the sidebar kept Zen's look (a
  14px radius and the toolbar button fill): it now keeps the resting
  field's fill, stroke and corners in every URL bar shape.
- The text box URL bar's bottom corners looked cut square: its stronger
  bottom line was a border of another color, which Gecko splits on a
  diagonal in the corners. It is now an inset shadow that follows the
  radius (WinUI's elevation border), and the input row takes the field's
  radius.
- Split view: the right pane overflowed the window by 5px (Zen pulls the
  tabbox past the edge by its own 9px gap, the panes used 4px).
- Media card: with two media playing, the card stacked behind showed its
  icon and buttons through the front one.
- Zen set to dark on a light Windows (or the reverse): Windows draws Mica
  in the system's scheme, and the dark tint over it gave a mid grey. When
  the two disagree, the window's coat now covers the backdrop at 92 %.
- A space with a color that Zen reads as dark, on a light window: light
  text on a light tint (1.3:1). The material's coat, in Zen's scheme, now
  goes under the gradient when the two disagree.
- Multiple toolbars: the URL bar opened in place was cut at the window's
  top (a 48px row centered on a 38px toolbar); the row now fits the
  toolbar, and the empty 24px band above the results is gone.
- Zen Fluent Enhanced: Quick settings dropdowns take the WinUI ComboBox
  look, each under its label at full width (values were cut short).
- Zen Fluent Enhanced: the app menu's Zen Fluent item has an icon (its
  label sat 16px left of the others).
- about:preferences: Keyboard Shortcuts and Extensions and themes (links,
  not buttons) took Firefox's spacing, 7px off the other items.
- Glance: the Glance chip nested in its parent's row no longer shows a
  close button past the row's end.

## [0.4.1] - 2026-10-31

### Added

- Zen Fluent Enhanced: **Site color** (`zen-fluent.enhanced.site-color`,
  off by default): the window takes a tint of the site in the selected tab,
  over the space's theme, read from the top of the page (a site's header,
  usually its `theme-color`), else from its icon; the space's theme comes
  back on a site without a color. **Site color strength**
  (`zen-fluent.enhanced.site-color.strength`): Light (default), Medium or
  Strong.

## [0.4.0] - 2026-10-31

### Added

- A space's color tints the window: a color picked in Zen's gradient picker
  shows over Mica, Mica Alt or Acrylic as in Zen, and the material's own
  color only shows when the space has none (`zen-fluent.space-color`, Zen's
  gradient by default; Always the material keeps the old look).
- Variants: a **Translucent** fill, Zen's own see-through fills (a share of
  the text color, the selected item in Zen's white veil). The Arc preset
  uses it.
- Variants: **Extension buttons: fill and shape for**
  (`zen-fluent.variant.extensions-scope`): each button, or the whole row as
  one surface 4px around the buttons.
- Zen Fluent Enhanced, Compatible mods: a **Marketplace** of the checked mods
  as cards, with **Install** through Sine, and every installed Sine mod as a
  list, with its switch, its page and **Settings** (its own settings in a
  dialog, or Sine's pane when the page cannot draw them). Each mod's badge
  says Works, Works with a limit, Not tested with this version or
  Incompatible, from the Zen Fluent and mod versions of its last check
  (`tested` in `enhanced/settings/compatible-mods.json`), the Marketplace
  reading each mod's latest version on GitHub. Search, a filter by badge
  and a Cards / List switch on each section.

### Changed

- Variants: **Subtle** sits between Solid and Outline (half the control
  fill inside the outline's stroke). The fill lists drop **Pill**: the
  shape gives it, and a Pill fill saved before still reads as the pill
  shape.
- The URL bar, the Essentials, the tabs and the extensions row share the
  same left and right edges in the sidebar, in every style; the extension
  buttons stretch to both edges as the Essentials do (Automatic alignment),
  and Center and End really center or end a short row.
- Zen Fluent Enhanced, Overview: the hero drops its summary badges and gets
  a **Project page** link beside its buttons.
- BetterZenGradientPicker now works fully: its gradient shows in the window.

### Removed

- Extensions: **Row background** (`zen-fluent.extensions.background`): the
  row's surface now comes from the extensions variant on The whole row.

## [0.3.0] - 2026-10-31

### Added

- Zen Fluent Enhanced: **Quick window** (`zen-fluent.enhanced.quick-window`, off by default): Ctrl+Alt+Shift+O or a link's menu opens a small unsynced window in compact mode, with a button that moves its tab to the main window, as Arc's Little Arc.
- Zen Fluent Enhanced: **Start page** (`zen-fluent.enhanced.start-page`, off by default): new tabs show the time, a search field and the top sites on an accent bloom, as Windows 11 and Edge's new tab.
- Zen Fluent Enhanced: **Widgets and shelf** (`zen-fluent.enhanced.shelf`, off by default): a board with the time, what is playing, the last downloads and a shelf where links, text and images dropped on it are kept for later.
- Zen Fluent Enhanced: **Focus sessions** (`zen-fluent.enhanced.focus-session`, off by default): a timer in the sidebar's bottom row, as in Windows' Clock, with compact mode, muted tabs and blocked distracting sites while it runs.
- Zen Fluent Enhanced: **AI controls page** (`zen-fluent.enhanced.ai-controls`) shows Firefox's AI controls page that Zen hides, and **AI chatbot panel** (`zen-fluent.enhanced.ai-chat`) turns Firefox's sidebar chatbot back on with a button in the sidebar's bottom row. Both off by default.
- Zen Fluent Enhanced: **Tab notes** (`zen-fluent.enhanced.tab-notes`, off by default) turns on Firefox's tab notes and adds a list of every note (Ctrl+Alt+Shift+N) and the note in the hover cards.
- Zen Fluent Enhanced: **Sleeping tabs and Performance** (`zen-fluent.enhanced.performance`, off by default): unused tabs go to sleep after a delay (`zen-fluent.enhanced.performance.sleep-after`, 30 minutes), and a Performance panel shows memory, sleeping tabs and the tabs using the most memory.
- Zen Fluent Enhanced: **Boost editor extras** (`zen-fluent.enhanced.boost-extras`): Narrow column, No motion, Hide images and Sepia tiles in Zen's Boost editor, stored in the boost's custom CSS.
- Zen Fluent Enhanced: **Ctrl+Tab as Alt+Tab** (`zen-fluent.enhanced.tab-switcher`, off by default): Ctrl+Tab shows the space's tabs, last used first, with thumbnails, as Windows 11's Alt+Tab.
- Zen Fluent Enhanced: **Snap layouts** (`zen-fluent.enhanced.snap-layouts`): hovering the maximize button (or Ctrl+Alt+Shift+Z) shows Windows 11's layouts for Zen's split view, with Snap Assist to pick the other tabs; custom sizes such as two thirds and a third are kept in the session.
- Zen Fluent Enhanced: **Keyboard shortcuts sheet** (`zen-fluent.enhanced.shortcut-overlay`): Ctrl+Alt+Shift+K shows the main shortcuts of Firefox, Zen and Zen Fluent over the window, as they are set now, with a search field.
- Zen Fluent Enhanced: **Command Palette actions** (`zen-fluent.enhanced.command-palette`): with the Zen Command Palette mod, Zen Fluent's settings, presets, features and panels become palette commands.
- Zen Fluent Enhanced: **Breadcrumb address** (`zen-fluent.enhanced.breadcrumbs`, off by default) shows the address as the site, its folders and the page, File Explorer style; a click on a level opens it.
- Zen Fluent Enhanced: a **Zen Fluent** page in Zen's settings, below Sine
  Mods (`zen-fluent.enhanced.settings-page`, on by default), whose sections
  unfold as sub-items. Every setting in the style of Windows Settings, with
  a live preview of the window, the presets gallery, per-setting and
  per-page reset, settings export and import, and Variants as a drawing of
  the window with a pin per component and an All pin (a TeachingTip picks
  their fill and shape). Overview recommends the settings you changed
  recently and most; Themes holds the presets and your theme file;
  Compatible mods lists the mods checked with Zen Fluent and which are
  installed; the pages of a zone carry its Fluent style switch beside
  Reset. Zen's **Find in Settings** finds Zen Fluent's settings, themes and
  mods. Opened
  from the app menu, the Tools menu, Ctrl+Alt+Shift+F and Quick Settings'
  **All settings**.

### Changed

- Zen's settings are laid out as the Windows 11 Settings app
  (`zen-fluent.fluent-content`): a Mica background, a 320px navigation pane
  with the search box under its title, the content beside it up to 1000px
  wide under a 28px page title, sections titled above their cards and one
  SettingsCard per setting, select boxes at the end of their row, WinUI
  text boxes, 20px check boxes. Sine's Mods pane follows: page title,
  sections, store tiles and installed mods as cards, WinUI buttons and text
  boxes.

## [0.2.0] - 2026-10-30

### Changed

- The selected Essential's favicon glow is half as strong.
- The repository holds two Sine mods: Zen Fluent (`core/`, CSS only) and Zen
  Fluent Enhanced (`enhanced/`, JavaScript, no feature yet). The 21 modules are
  now 188 files with one subject each, imported in the same order: the look
  does not change.
- The project is in English: settings labels, README and docs.
- Grey Essentials icons are desaturated and faded, and fade back in color.
- The Picture-in-Picture player is cut to the overlay radius token (12 px with
  Zen corners or the Edge style).
- Icons moved to `core/icons/`.
- The Fluent folder icons only replace the icon of Zen folders (and of ZenLibraryTweaks' bookmark folders). Advanced Tab Groups' folder look keeps its own icon and group color.
- Button animations no longer override the Library tabs' own transition. A Library tab's hover fill and press now fade on its pill (`zen-fluent.button-animations`).
- The Firefox sidebar's colors also reach the web panel box of Zen Second Sidebar Enhanced (`#sb2-box`).
- The theme picker gets Zen's 10 px padding back: with the 4 px every panel gets, its color dots sat 6 px off the spot Zen reads their color from.
- The split view header and Glance buttons no longer blur without hardware acceleration (`zen-no-acrylic`) or with reduced transparency, where they already took the solid Acrylic color.
- Firefox's own focus rings take the WinUI outer ring color (near-black / white) instead of the accent. The focused field border and the tab drag-over outline keep the accent.
- Reduced motion now also stops the selected tab pill's entrance, the settings groups' chevron, the knob slide of the settings' ToggleSwitches and the media card thumb's hover growth.
- **Fluent icons** and **Allow the mod's icons** moved from Window and menus to the Zones group. Allow the mod's icons is hidden while Fluent icons is off.
- The mod's settings group headers keep their icon, title and chevron layout on their own, even when Settings and internal pages is off.

### Added

- Zen settings group: **Glance** (`zen.glance.enabled`) and **Open a link in Glance with** (`zen.glance.activation-method`, Alt, Ctrl, Shift or the Windows key). Zen Fluent Enhanced: **Glance link preview** (`zen-fluent.enhanced.glance`, default `true`): holding that key over a link shows its icon, title, address and the Glance click.
- Zen Fluent Enhanced: **Tab hover cards** (`zen-fluent.enhanced.hover-cards`, default `false`): a card beside the hovered tab with a page thumbnail, title, address, state and actions (copy link, duplicate, mute, unload, close); delay (`.delay`) and thumbnails (`.thumbnails`) options.
- Zen Fluent Enhanced: **Fluent icons in the icon picker** (`zen-fluent.enhanced.icon-picker`, default `true`): 142 Fluent UI System Icons (MIT, Microsoft) after Zen's own in its icon picker, for spaces, folders and pinned tabs.
- Zen Fluent Enhanced: **Folder colors** (`zen-fluent.enhanced.folder-colors`, default `true`): a Folder color menu in the folder context menu, with the Windows accent palette, for the folder icon.
- Zen Fluent Enhanced: **Browsing stats** (`zen-fluent.enhanced.browsing-stats`, default `false`): time on pages, visits and sites for today, 7 or 30 days, a bar per day and the top sites, read from Firefox's history and page interactions from the day it is turned on; Ignore a site, Clear stats.
- Zen Fluent Enhanced: **PDF viewer** (`zen-fluent.enhanced.pdf-viewer`, default `true`), Firefox's PDF viewer in Fluent colors, and **Fluent controls on websites** (`zen-fluent.enhanced.web-controls`, default `false`), the WinUI look for buttons and text fields a site leaves unstyled, through sheets registered with Firefox's style sheet service.
- Zen Fluent Enhanced: **Tab archiving** (`zen-fluent.enhanced.tab-archive`, default `false`): tabs unused for 12 hours (`.after`) are saved to an archive file and closed, with Undo; never the selected tab, Essentials, tabs playing sound, Glance or split tabs, pinned tabs (`.pinned`) or tabs in folders (`.folders`); a searchable archive panel (tab context menu, Ctrl+Alt+Shift+A) reopens them in their space; entries kept 90 days (`.keep`).
- Zen Fluent Enhanced: **Quick Settings** (`zen-fluent.enhanced.quick-settings`, default `true`), a sidebar button with Zen Fluent's main settings and five presets (Windows 11, Microsoft Edge, Taskbar, Arc, Compact) with Undo; **Adaptive accent** (`zen-fluent.enhanced.adaptive-accent`, default `false`), the accent in the color of the site's icon; **Extensions under the Essentials** (`zen-fluent.enhanced.extensions-below-essentials`, default `false`); **Tab numbers while Ctrl is held** (`zen-fluent.enhanced.tab-numbers`, default `true`); **Shortcuts** (`zen-fluent.enhanced.shortcuts`, default `true`) for the density, the window theme and the material.
- Zen Fluent Enhanced's first feature, **Icon colors** (`zen-fluent.enhanced.favicon-color`, default `true`): it reads the dominant color of each tab's icon, and with **Selected Essential color** on Icon color the selected Essential takes that exact color, its rings and borders included.
- Zen Fluent Enhanced: the life cycle every feature script shares (`enhanced/scripts/lib/zf-feature.sys.mjs`: its own checkbox, clean stop, safe reruns) and its rules in `npm run check`. No feature yet.
- Selected Essential: a Glow only style (the favicon glow without the dash, whatever Zen's glow setting) and an Icon color (`icon`) for **Selected Essential color**: fills and marks take the favicon's color.
- Tab note icons, if Firefox's tab notes are turned back on (`browser.tabs.notes.enabled`): the row glyph in the secondary text color, the badge over a pinned tab's icon in the accent.
- The Boost editor window (Zen 1.24) in Fluent: Mica surfaces, WinUI buttons, the accent for active tools and Share (`core/src/components/panels/boost-editor-window.css`).
- Zen Easel compatibility: the panels of `about:easel` take Zen Fluent's accent, Acrylic, text and stroke colors (`core/src/compat/easel.css`).
- Essentials labels (`zen-fluent.essentials.labels`, default `hide`): the page title under each icon, like labelled taskbar apps.
- Essentials hover (`zen-fluent.essentials.hover`, default `fill`): a soft light under the icon of the hovered tile, like the taskbar.
- Essentials open page indicator (`zen-fluent.essentials.running`, default `none`): a dot under loaded tiles, like the taskbar's running apps. Selected Essential gets two more styles: Side bar and None (fill only).
- Essentials icon size (`zen-fluent.essentials.icon-size`, default `medium`): 16, 20 or 24 px favicons.
- Essentials alignment (`zen-fluent.essentials.align`, default `start`): Center centers each row of tiles, the last one too, like the centered Windows taskbar.
- An Essentials settings group: the Essentials settings of the Sidebar group moved there, with the taskbar-style ones below.
- A Variants settings group: a fill (solid, subtle, ghost, outline, or pill = pill shape with the current fill) and a shape (square, rounded, pill) for every component at once (`zen-fluent.variant.global`, `zen-fluent.variant.global-shape`) or per component (`zen-fluent.variant.<component>` and `-shape`): toolbar and sidebar buttons, extension buttons, Essentials, tabs, pinned tabs, folder headers, space buttons, URL bar, URL bar buttons, badges, panel and dialog buttons. Automatic everywhere keeps today's look.
- Essentials width (`zen-fluent.essentials.width`, default `auto`): with an automatic count per row, tiles 40 to 80 px wide instead of stretched across the row.
- An Extensions settings group for the row of pinned extensions (`zen-fluent.extensions.*`): place (above the Essentials, bottom of the sidebar, hidden), columns, rows (or one scrolling row), icon and button size (also in the classic toolbar), gap, alignment, row background (subtle, card, Acrylic) and badges (count, dot, none). **Extensions under the URL bar, WinUI style** moved to this group.
- Selected Essential style (`zen-fluent.essentials.selected-style`, default `glow`): the dash and Zen's favicon glow as today, or Arc (colored border, 3D edge), Fill, Taskbar indicator, Outline, Lift or Tint. Every style stays inside its tile.
- Selected Essential color (`zen-fluent.essentials.selected-color`, default `accent`): the accent or the current space's color.
- Essentials height (`zen-fluent.essentials.height`) and space between them (`zen-fluent.essentials.gap`), both `auto` by default: the density's 42 / 36 px tiles and 6 / 4 px gap, or a fixed size.
- Page loading bar as a WinUI ProgressBar (`zen-fluent.loading-bar`, default
  `winui`): Zen’s indicator becomes a 3 px indeterminate bar along the top of
  the page.
- Compact density (`zen-fluent.density`, default `standard`): WinUI compact
  sizing for tabs, toolbar buttons, the find bar, menus, panels, the Library and
  Firefox’s sidebar, through new size tokens (`core/src/tokens/density.css`).
- Zen Fluent Enhanced, an empty Sine mod that installs Zen Fluent if missing.
- `components.json`, the manifest for the future installer.
- `npm run check` (imports, urls, headers, manifests, settings, docs, versions),
  `npm run release`, and a CI workflow.
- `docs/`: installation, one page per settings group, Enhanced, contributing.
- A default column in the README settings table.
- `THIRD-PARTY-NOTICES.md` for the code taken from Firefox-WinUI and Edge-Frfox.
- Unloaded tabs dimmed (`zen-fluent.dim-unloaded-tabs`, default on): the favicon and title of a tab with no page loaded fade to WinUI's tertiary text, on rows, pinned tabs, Essentials and in the collapsed sidebar; Zen's own favicon fade is replaced, not stacked.
- Animated sound bars (`zen-fluent.sound-bars`, default on): three bars replace the speaker on playing tabs, in the accent color in the audio button and in the on-accent color in the audio badge (Essentials and the collapsed sidebar). Muted and blocked tabs keep Zen's glyphs, and the bars stand still with reduced motion.
- Container tabs (`zen-fluent.container-tabs`, default `line`): a rounded bar in the container color at the tab's start edge, which yields to the accent pill on the selected tab; `tint` also washes the tab in the container color; `none` keeps Zen's look.
- “Drag tabs here” in empty folders (`zen-fluent.empty-folder-hint`, default on): an open folder with no tab shows a dashed WinUI drop slot.
- Notification bars as WinUI InfoBars: site and global bars get the severity background and icon (Segoe Fluent glyphs on Windows), 14 px text, 32 px Buttons and a 38 px close button, on a solid surface with a flyout shadow over the page.
- Permission prompts as a WinUI TeachingTip: 12 px margins, semibold title, CheckBox, 40 px close button in the corner, and an AccentButton and a Button (or SplitButton) sharing the row.
- Zen toasts as WinUI notifications: solid Acrylic, flyout shadow, 14 px text, keycaps for shortcuts and a standard icon Button. Zen's position and animation are kept, without the scale when reduced motion is on.
- Compatibility rules for third-party mods in `core/src/compat/`. They need no setting and only match what those mods add. Advanced Tab Groups headers become folder rows. ZenLibraryTweaks gets the History rows, slides Library tabs again when reordering, and gets matching edit outlines, folder tint and Fluent folder icons. Zen Second Sidebar Enhanced web panels become cards, with solid Acrylic over the page. Zen Command Palette follows the mod's accent, with an accent mode pill. Zen Calmer Context Menu's quick actions hover like menu rows, and its restored icons line up with the rows. With its "Apply the Zen space gradient" option, the Acrylic menu is kept. Glance Plus's Copy link and Bookmark buttons take the Fluent icons.
- `docs/compatibility.md`: which mods work with Zen Fluent, which need its compat rules, and which conflict and why (Zen Page Tint, Blended Addressbar, Better Find Bar, SuperPins).
- Collapsed sidebar (icons only) as a WinUI NavigationView compact pane: every item of the 48 px column is a rounded tile. Essentials keep the token gap; the current workspace is a centred tile at full opacity; folder rows and the pinned tabs separator are as wide as the tabs; the bottom buttons and the workspace switcher are nav item tiles, with the active workspace marked on the leading edge; a playing tab shows an accent audio badge, as the Essentials do. With a single toolbar, the top bar buttons keep the sidebar's look.
- Zen screens in WinUI style: the space creation form (TextBox, ComboBox, standard and accent Buttons), the theme picker (segmented scheme switch, subtle buttons, Slider colors on the wave, custom color list), the Ctrl+Tab panel as the Windows 11 task switcher (`browser.ctrlTab.sortByRecentlyUsed`) and the bookmarks toolbar (subtle buttons sized by the density, divider separators, accent drop indicator).
- Auto-hidden bookmarks toolbar (`zen-fluent.bookmarks-autohide`, default `false`): no height until the toolbar area is hovered or focused, a menu of the bar is open or a link is dragged over it.
- Essentials per row (`zen-fluent.essentials-per-row`, default `auto`): 2 to 6 equal columns of Essentials, fewer when the sidebar is too narrow; tiles keep their height, gap, dash and audio badge, and the collapsed sidebar stays one column.
- Animated icons (`zen-fluent.animated-icons`, default `true`): WinUI AnimatedIcon-style motion on the Fluent icons. Back / Forward nudge where they point, Reload turns, the New and New Tab plus turn a quarter, the Library books hop, the Settings gear turns a tooth, folders pop as they open or close, and the space chevron follows the WinUI timing. Nothing moves with reduced motion or the arrow bounce on.
- Corner radius (`zen-fluent.corner-radius`, default `auto`): square, small (2 px), medium (4 px), large (8 px) or a custom radius (`zen-fluent.corner-radius-custom`) for buttons, tabs, rows and fields; cards, menus, flyouts, Edge Essentials and the page card keep the style's ratio to it, circles and pills stay round, and container lines never get shorter than the accent pill (`core/src/tokens/corner-radius.css`).
- Tint opacity (`zen-fluent.tint-opacity`, default `auto`): each material keeps its own coat over the backdrop (Mica 64 %, Mica Alt none on Windows / 79.75 % elsewhere, Acrylic 80.64 / 87.04 %), or one opacity for all: none, light (40 %), strong (85 %), solid or a custom percentage (`zen-fluent.tint-opacity-custom`). Zen's compact sidebar follows with the matching single coat (`core/src/tokens/tint-opacity.css`).
- Acrylic blur (`zen-fluent.acrylic-blur`, default `auto`, 20 px): none, light (10 px), strong (30 px, WinUI's AcrylicBrush) or a custom radius (`zen-fluent.acrylic-blur-custom`) for the split view header and Glance buttons, through one token, `--zf-acrylic-blur` (`core/src/tokens/acrylic-blur.css`). No blur without a GPU, with reduced transparency or in a contrast theme.
- WinUI focus visual on keyboard focus: a 2 px outer ring (FocusStrokeColorOuter) around a 1 px inner ring (FocusStrokeColorInner), drawn as outline plus box-shadow so nothing moves. Covers toolbar buttons, tabs, URL bar buttons, menu and panel items, buttons, checkboxes, lists, dialogs and prompts, the find bar, notification bars, and Sine's and Zen's settings. Never on a click. Text fields and the URL bar keep their accent line.
- Contrast themes (forced colors): every color token maps to a system color (core/src/tokens/forced-colors.css), because Firefox forces nothing in the browser window nor in a user sheet. Each zone gets visible edges, hover outlines, a Highlight accent and a single Highlight focus ring (core/src/a11y/).
- Zones group: the Fluent style can be turned off area by area (`zen-fluent.fluent-window`, `-sidebar`, `-urlbar`, `-menus`, `-notifications`, `-findbar`, `-library`, `-media`, `-split-glance`, `-dialogs`, `-firefox-sidebar`, `-screens`, `-content`, all on by default). An unchecked area keeps Zen's look, live and without a restart: its files are imported under `not (-moz-pref("zen-fluent.fluent-<zone>", false))`. Tokens, the font, the corner shape, scrollbars, button animations and the settings groups stay on (docs/settings/zones.md).

### Removed

- Two unused tokens, `--zf-acrylic-filter` and `--zf-fill-command`.

### Fixed

- Full screen video (YouTube and others): a 1px frame, the page's rounded top corner and a 2px strip of the URL bar no longer show in the top left corner.
- A folder given its own icon (Zen's Change icon) showed only Zen Fluent's Fluent folder icon, without that icon: it now keeps Zen's folder, which draws it.
- Zen 1.24: the hovered media card grows over the tabs above it; their titles no longer show through its card fill: it takes Acrylic while hovered.
- The favicon glow of the selected Essential (`zen.theme.essentials-favicon-bg`) stays inside its tile: the mod's `overflow: visible` let it spill over the neighbouring tiles.
- Zen 1.24: the site panel's reader view button, moved to the footer, gets the footer's 32 px subtle button and the accent while reader view is on (Boost, now a quick action tile, already had the tile style).
- A custom tint opacity (`50%` or `50`) is applied: Firefox refused the percentage in a number, so every custom value fell back to 64 %. An invalid entry still keeps the material's own coat.
- The selected Essential's accent dash is centred again, 3 px above the tile's edge: Zen's own margin had moved it 9 px aside.

## [0.1.0] - 2026-10-26

First version, a single CSS mod:

- Mica, Mica Alt and Acrylic tints over Mica For Everyone, translucent tints on
  Linux and macOS, solid fallbacks without hardware acceleration.
- WinUI 3 tokens and controls, and a Microsoft Edge (Fluent 2) style.
- Sidebar, tabs, folders, Essentials, workspaces, URL bar, find bar, split view,
  Glance, media card, Picture-in-Picture, Library, Firefox sidebar, menus,
  panels, dialogs, tooltips, tab preview, internal pages.
- Fluent stroke icons, WinUI animations, thin scrollbars.
- About fifty settings in collapsible groups in Sine.
