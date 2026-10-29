# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
[Semantic Versioning](https://semver.org/); both mods share one version and one
`vX.Y.Z` tag.

## [Unreleased]

### Changed

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

### Added

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

### Removed

- Two unused tokens, `--zf-acrylic-filter` and `--zf-fill-command`.

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
