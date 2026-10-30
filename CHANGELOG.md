# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
[Semantic Versioning](https://semver.org/); both mods share one version and one
`vX.Y.Z` tag.

## [Unreleased]

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
