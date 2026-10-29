# Zones

The Fluent style area by area: uncheck a zone to keep Zen's own look there.

Group header: `zen-fluent.ui.open-zones` (open by default: `false`).

| Setting                                                                             | Preference                               | Values           | Default |
| ----------------------------------------------------------------------------------- | ---------------------------------------- | ---------------- | ------- |
| Window (backdrop tint, page card, caption buttons, page loading bar)                | `zen-fluent.fluent-window`               | `true` / `false` | `true`  |
| Sidebar (tabs, folders, Essentials, spaces, toolbar buttons, extensions)            | `zen-fluent.fluent-sidebar`              | `true` / `false` | `true`  |
| URL bar (field, buttons, suggestions)                                               | `zen-fluent.fluent-urlbar`               | `true` / `false` | `true`  |
| Menus and panels (menus, site panels, downloads, tooltips, tab preview)             | `zen-fluent.fluent-menus`                | `true` / `false` | `true`  |
| Notifications (notification bars, permission prompts, toasts)                       | `zen-fluent.fluent-notifications`        | `true` / `false` | `true`  |
| Find bar                                                                            | `zen-fluent.fluent-findbar`              | `true` / `false` | `true`  |
| Library (the Library, its button, the downloads stack)                              | `zen-fluent.fluent-library`              | `true` / `false` | `true`  |
| Media (media card, Picture-in-Picture)                                              | `zen-fluent.fluent-media`                | `true` / `false` | `true`  |
| Split view and Glance                                                               | `zen-fluent.fluent-split-glance`         | `true` / `false` | `true`  |
| Dialogs (prompts, window dialogs, print)                                            | `zen-fluent.fluent-dialogs`              | `true` / `false` | `true`  |
| Firefox sidebar (bookmarks, history, synced tabs (Ctrl+B))                          | `zen-fluent.fluent-firefox-sidebar`      | `true` / `false` | `true`  |
| Zen screens (space creation, theme picker, Ctrl+Tab, bookmarks toolbar)             | `zen-fluent.fluent-screens`              | `true` / `false` | `true`  |
| Fluent icons (uncheck to get Zen's icons back)                                      | `zen-fluent.fluent-icons`                | `true` / `false` | `true`  |
| Allow the mod's icons (check it: without this Firefox setting, Zen keeps its icons) | `svg.context-properties.content.enabled` | `true` / `false` | `true`  |
| Settings and internal pages (Zen settings, add-ons, about:config, new tab)          | `zen-fluent.fluent-content`              | `true` / `false` | `true`  |

## What each zone covers

Files under `core/src/`. A zone takes its components, the options that style
them (`features/`), their compatibility rules (`compat/`) and their
forced-colors file (`a11y/forced-colors-<zone>.css`).

- **Window**: `base/window-background.css`, `base/page-card.css`,
  `base/compact-mode.css`, `features/corners-winui/page-card.css`,
  `features/style-edge/page-card.css`, `features/loading-bar.css`,
  `features/animations/tab-switch-animation.css`, `components/window/`.
- **Sidebar**: `components/sidebar/` and the options of tabs, folders,
  Essentials, spaces, toolbar buttons and compact mode (`features/tab-*`,
  `features/style-edge/tabs.css`, `style-edge/essentials.css`,
  `style-edge/toolbar-buttons.css`, `button-style.css`,
  `pinned-extensions.css`, `compact-sidebar-bg.css`, `essentials-per-row.css`,
  `compact-edge-hint.css`…), `features/animations/nav-bounce.css`, the
  compact mode hint of the Firefox sidebar,
  `compat/advanced-tab-groups.css`.
- **URL bar**: `components/urlbar/`, `features/url-*`,
  `features/style-edge/urlbar.css`, the URL bar animations,
  `components/panels/site-panel-anchor.css` (the site panel button),
  `compat/command-palette.css`.
- **Menus and panels**: `components/menus/` (but Ctrl+Tab),
  `components/tooltips/`, `components/tab-preview/`,
  `components/panels/` (but the theme picker and the site panel button),
  `features/extra-highlights/`, `style-edge/menus.css`,
  `style-edge/tab-preview.css`, `hide-shortcuts.css`,
  `hide-access-keys.css`, `context-navigation/`, the menu animation,
  `components/toggle-switch-motion.css`, `compat/calmer-context-menu.css`.
- **Notifications**: `components/notifications/`.
- **Find bar**: `components/findbar/`.
- **Library**: `components/library/`, `compat/zen-library-tweaks.css`.
- **Media**: `components/media/`.
- **Split view and Glance**: `components/split-view/`,
  `components/glance.css`.
- **Dialogs**: `components/dialogs/`.
- **Firefox sidebar**: `components/firefox-sidebar/`,
  `compat/second-sidebar.css`.
- **Zen screens**: `components/workspace-creation.css`,
  `components/panels/gradient-picker.css`, `components/menus/ctrl-tab.css`,
  `components/bookmarks-toolbar.css`, `features/bookmarks-autohide.css`.
- **Fluent icons**: `features/fluent-icons/`, `features/animations/animated-icons.css`.
- **Settings and internal pages**, in `core/userContent.css`:
  `content/newtab.css`, `content/preferences/`, `content/sine/dialog.css`,
  `content/zen-settings.css`, `content/toggle-switches.css`,
  `content/preferences-dialogs.css`.

## Notes

- **How it works**: each zone's imports in `core/chrome.css` (and
  `core/userContent.css` for Settings and internal pages) carry the media
  condition `not (-moz-pref("zen-fluent.fluent-<zone>", false))`. Unchecked,
  Firefox drops those sheets at once, in every window, dialog and Firefox
  sidebar page, without a restart; checked again, they come back. A
  preference Sine has not written yet counts as checked, so the mod looks the
  same before and after the first start.
- **Always on**, whatever the zones: the tokens (colors, accent, radii,
  density, font) and the accent handed to Firefox (focus rings, links,
  primary buttons), the font of the window, menus and panels, the corner
  shape (plain arcs with WinUI or Edge corners, where Zen draws squircles),
  the thin scrollbars, the WinUI button animations, the accent text
  selection, the Acrylic noise, the shared keyframes, the accessibility files
  that are not tied to a zone (focus ring, reduced motion, the system colors
  given back to Zen's toolbox, button and field variables in a contrast
  theme), and the
  collapsible settings groups of the mod's Sine dialog. Most have their own
  setting: **Accent color** (Zen workspace color), **Font** (System font),
  **Corners and gaps** (Zen keeps its squircles), **Text selection in the
  accent color**, **Acrylic noise**, **WinUI 3 button animations**.
- **Options of a zone that is off** do nothing until it is back (for example
  **URL bar shape** with the URL bar zone off); their rows stay in their
  groups.
- **Shared parts**: an element keeps what the other zones give it. The Menus
  and panels zone draws every panel, so the permission prompt, the Ctrl+Tab
  panel and the theme picker keep the WinUI panel type and rows while
  Notifications or Zen screens are off; the menus inside a dialog or the
  Firefox sidebar follow Menus and panels too. The media card buttons and the
  Library button are toolbar buttons: the Sidebar zone styles them.
- **Window and Firefox sidebar**: the WinUI corners that set the panel flush
  against the page (`features/corners-winui/firefox-sidebar.css`) need both
  zones. With either one off, the panel and the page are two cards across
  Zen's gap.
- **Fluent icons** need **Allow the mod's icons**
  (`svg.context-properties.content.enabled`, a Firefox preference). The icons
  take the theme color through `context-fill`, which Firefox only grants to
  files outside `chrome://` when that preference is `true`. Sine does not
  write it because the preference already exists: check it by hand. Until then
  Zen keeps its own icons. Its row hides while **Fluent icons** is off. Unlike
  the other zones, Fluent icons are only on once Sine has written their
  preference (`true`). They also cover the buttons Glance Plus adds to Glance
  and the bookmark folders ZenLibraryTweaks adds to the Library; on Zen
  folders only, so Advanced Tab Groups keeps its own folder icon and color
  ([compatibility](../compatibility.md)). Zen’s animated Library and folder
  icons stay hidden under the Fluent icons, which get their own motion from
  **Animated icons** (Animations group).
- **Settings and internal pages** off: about:preferences, about:addons,
  about:config and the new tab page are Zen's, and so are the dialogs of
  about:preferences (they belong to this zone, not to Dialogs). In the mod's
  Sine dialog, the rows take Sine's checkboxes but the groups stay collapsible
  cards, so this group can bring the style back.
