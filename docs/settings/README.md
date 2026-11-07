# Settings

Zen Fluent's settings are in Zen settings › Sine › Mods › gear on Zen Fluent's
card, or on the settings page of Zen Fluent Enhanced. Each one is a preference
(`about:config`), so a setting can also be changed there or kept in `user.js`.

## Zen Fluent

Every setting, its preference and its default (checked by `npm run check`).
Values and notes: one page per group, linked from the first column.

| Group                                   | Setting                                          | Preference                                                                  | Default            |
| --------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- | ------------------ |
| [Appearance](appearance.md)             | Interface style                                  | `zen-fluent.style`                                                          | `winui`            |
|                                         | Backdrop material                                | `zen-fluent.material`                                                       | `mica`             |
|                                         | Tint opacity                                     | `zen-fluent.tint-opacity`                                                   | `auto`             |
|                                         | Custom opacity                                   | `zen-fluent.tint-opacity-custom`                                            | `64%`              |
|                                         | Space color                                      | `zen-fluent.space-color`                                                    | `zen`              |
|                                         | Accent color                                     | `zen-fluent.accent`                                                         | `system`           |
|                                         | Custom color                                     | `zen-fluent.accent-custom`                                                  | `#0078d4`          |
|                                         | Corners and gaps                                 | `zen-fluent.corners`                                                        | `winui`            |
|                                         | Corner radius                                    | `zen-fluent.corner-radius`                                                  | `auto`             |
|                                         | Custom radius                                    | `zen-fluent.corner-radius-custom`                                           | `6px`              |
|                                         | Density                                          | `zen-fluent.density`                                                        | `standard`         |
|                                         | Expert mode                                      | `zen-fluent.expert`                                                         | `false`            |
|                                         | Gap around the page (expert)                     | `zen-fluent.page-gap`                                                       | `auto`             |
|                                         | Custom gap around the page                       | `zen-fluent.page-gap-custom`                                                | `6px`              |
|                                         | Gap between the sidebar and the page (expert)    | `zen-fluent.page-gap-sidebar`                                               | `auto`             |
|                                         | Custom gap beside the sidebar                    | `zen-fluent.page-gap-sidebar-custom`                                        | `6px`              |
|                                         | Page corners (expert)                            | `zen-fluent.page-radius`                                                    | `auto`             |
|                                         | Custom page corners                              | `zen-fluent.page-radius-custom`                                             | `10px`             |
|                                         | Font                                             | `zen-fluent.font`                                                           | `segoe`            |
|                                         | Custom font                                      | `zen-fluent.font-custom`                                                    | `(empty)`          |
|                                         | Text selection in the accent color               | `zen-fluent.accent-selection`                                               | `true`             |
|                                         | Acrylic blur                                     | `zen-fluent.acrylic-blur`                                                   | `auto`             |
|                                         | Custom blur                                      | `zen-fluent.acrylic-blur-custom`                                            | `20px`             |
|                                         | Acrylic noise                                    | `zen-fluent.acrylic-noise`                                                  | `false`            |
| [Sidebar](sidebar.md)                   | Button style                                     | `zen-fluent.button-style`                                                   | `subtle`           |
|                                         | Sidebar padding (expert)                         | `zen-fluent.sidebar-padding`                                                | `auto`             |
|                                         | Custom sidebar padding                           | `zen-fluent.sidebar-padding-custom`                                         | `6px`              |
|                                         | Hide the Forward button when it is disabled      | `zen-fluent.hide-forward-disabled`                                          | `false`            |
|                                         | Workspace indicator                              | `zen-fluent.workspace-indicator`                                            | `true`             |
|                                         | Workspace icon style                             | `zen-fluent.workspace-style`                                                | `pill`             |
|                                         | Page fills the window in compact mode            | `zen-fluent.compact-flush`                                                  | `false`            |
|                                         | Acrylic sidebar background in compact mode       | `zen-fluent.compact-sidebar-bg`                                             | `true`             |
|                                         | Edge hint at the window border in compact mode   | `zen-fluent.compact-edge-hint`                                              | `true`             |
| [Essentials](essentials.md)             | Selected Essential                               | `zen-fluent.essentials.selected-style`                                      | `glow`             |
|                                         | Selected Essential color                         | `zen-fluent.essentials.selected-color`                                      | `accent`           |
|                                         | Open page indicator                              | `zen-fluent.essentials.running`                                             | `none`             |
|                                         | Hover                                            | `zen-fluent.essentials.hover`                                               | `fill`             |
|                                         | Labels                                           | `zen-fluent.essentials.labels`                                              | `hide`             |
|                                         | Essentials per row                               | `zen-fluent.essentials-per-row`                                             | `auto`             |
|                                         | Custom Essentials per row                        | `zen-fluent.essentials-per-row-custom`                                      | `7`                |
|                                         | Essentials width                                 | `zen-fluent.essentials.width`                                               | `auto`             |
|                                         | Custom Essential width                           | `zen-fluent.essentials.width-custom`                                        | `60px`             |
|                                         | Icon size                                        | `zen-fluent.essentials.icon-size`                                           | `medium`           |
|                                         | Essentials height                                | `zen-fluent.essentials.height`                                              | `auto`             |
|                                         | Custom Essential height                          | `zen-fluent.essentials.height-custom`                                       | `40px`             |
|                                         | Space between Essentials                         | `zen-fluent.essentials.gap`                                                 | `auto`             |
|                                         | Custom gap between Essentials                    | `zen-fluent.essentials.gap-custom`                                          | `5px`              |
|                                         | Alignment                                        | `zen-fluent.essentials.align`                                               | `start`            |
|                                         | Grey Essentials icons                            | `zen-fluent.essentials-gray`                                                | `false`            |
| [Extensions](extensions.md)             | WinUI style for the extensions row               | `zen-fluent.pinned-extensions`                                              | `true`             |
|                                         | Place                                            | `zen-fluent.extensions.position`                                            | `top`              |
|                                         | Columns                                          | `zen-fluent.extensions.columns`                                             | `auto`             |
|                                         | Custom extension columns                         | `zen-fluent.extensions.columns-custom`                                      | `9`                |
|                                         | Rows                                             | `zen-fluent.extensions.rows`                                                | `auto`             |
|                                         | Custom extension rows                            | `zen-fluent.extensions.rows-custom`                                         | `5`                |
|                                         | Icon size                                        | `zen-fluent.extensions.icon-size`                                           | `auto`             |
|                                         | Custom extension icon size                       | `zen-fluent.extensions.icon-size-custom`                                    | `22px`             |
|                                         | Button size                                      | `zen-fluent.extensions.button-size`                                         | `auto`             |
|                                         | Custom extension button size                     | `zen-fluent.extensions.button-size-custom`                                  | `30px`             |
|                                         | Space between buttons                            | `zen-fluent.extensions.gap`                                                 | `auto`             |
|                                         | Custom gap between extensions                    | `zen-fluent.extensions.gap-custom`                                          | `3px`              |
|                                         | Alignment                                        | `zen-fluent.extensions.align`                                               | `auto`             |
|                                         | Badges                                           | `zen-fluent.extensions.badge`                                               | `show`             |
| [Variants](variants.md)                 | Fill, everywhere                                 | `zen-fluent.variant.global`                                                 | `auto`             |
|                                         | Shape, everywhere                                | `zen-fluent.variant.global-shape`                                           | `auto`             |
|                                         | Toolbar and sidebar buttons: fill                | `zen-fluent.variant.buttons`                                                | `auto`             |
|                                         | Toolbar and sidebar buttons: shape               | `zen-fluent.variant.buttons-shape`                                          | `auto`             |
|                                         | Extension buttons: fill                          | `zen-fluent.variant.extensions`                                             | `auto`             |
|                                         | Extension buttons: shape                         | `zen-fluent.variant.extensions-shape`                                       | `auto`             |
|                                         | Extensions row: fill                             | `zen-fluent.variant.extensions-row`                                         | `auto`             |
|                                         | Extensions row: shape                            | `zen-fluent.variant.extensions-row-shape`                                   | `auto`             |
|                                         | Extension buttons: fill and shape for (0.4.2)    | `zen-fluent.variant.extensions-scope`                                       | `buttons`          |
|                                         | Essentials: fill                                 | `zen-fluent.variant.essentials`                                             | `auto`             |
|                                         | Essentials: shape                                | `zen-fluent.variant.essentials-shape`                                       | `auto`             |
|                                         | Tabs: fill                                       | `zen-fluent.variant.tabs`                                                   | `auto`             |
|                                         | Tabs: shape                                      | `zen-fluent.variant.tabs-shape`                                             | `auto`             |
|                                         | Pinned tabs: fill                                | `zen-fluent.variant.pinned-tabs`                                            | `auto`             |
|                                         | Pinned tabs: shape                               | `zen-fluent.variant.pinned-tabs-shape`                                      | `auto`             |
|                                         | Folder headers: fill                             | `zen-fluent.variant.folders`                                                | `auto`             |
|                                         | Folder headers: shape                            | `zen-fluent.variant.folders-shape`                                          | `auto`             |
|                                         | Space buttons: fill                              | `zen-fluent.variant.spaces`                                                 | `auto`             |
|                                         | Space buttons: shape                             | `zen-fluent.variant.spaces-shape`                                           | `auto`             |
|                                         | URL bar: fill                                    | `zen-fluent.variant.urlbar`                                                 | `auto`             |
|                                         | URL bar: shape                                   | `zen-fluent.variant.urlbar-shape`                                           | `auto`             |
|                                         | URL bar buttons: fill                            | `zen-fluent.variant.urlbar-buttons`                                         | `auto`             |
|                                         | URL bar buttons: shape                           | `zen-fluent.variant.urlbar-buttons-shape`                                   | `auto`             |
|                                         | Badges: fill                                     | `zen-fluent.variant.badges`                                                 | `auto`             |
|                                         | Badges: shape                                    | `zen-fluent.variant.badges-shape`                                           | `auto`             |
|                                         | Panel and dialog buttons: fill                   | `zen-fluent.variant.panel-buttons`                                          | `auto`             |
|                                         | Panel and dialog buttons: shape                  | `zen-fluent.variant.panel-buttons-shape`                                    | `auto`             |
| [Tabs](tabs.md)                         | Tab text size                                    | `zen-fluent.tab-text-size`                                                  | `normal`           |
|                                         | Row height (expert)                              | `zen-fluent.tab-height`                                                     | `auto`             |
|                                         | Custom row height                                | `zen-fluent.tab-height-custom`                                              | `38px`             |
|                                         | Space between tabs (expert)                      | `zen-fluent.tab-gap`                                                        | `auto`             |
|                                         | Custom space between tabs                        | `zen-fluent.tab-gap-custom`                                                 | `3px`              |
|                                         | Bold title on the selected tab                   | `zen-fluent.tab-bold`                                                       | `false`            |
|                                         | Accent pill on the selected tab                  | `zen-fluent.tab-pill`                                                       | `true`             |
|                                         | Tab shadow                                       | `zen-fluent.tab-shadow`                                                     | `true`             |
|                                         | Tab close button                                 | `zen-fluent.tab-close-button`                                               | `1`                |
|                                         | Close button in the collapsed sidebar            | `zen-fluent.collapsed-tab-close`                                            | `default`          |
|                                         | Highlights on the selected tab, menus and panels | `zen-fluent.extra-highlights`                                               | `false`            |
|                                         | Dim unloaded tabs                                | `zen-fluent.dim-unloaded-tabs`                                              | `true`             |
|                                         | Animated sound bars on playing tabs              | `zen-fluent.sound-bars`                                                     | `true`             |
|                                         | Container tabs                                   | `zen-fluent.container-tabs`                                                 | `line`             |
|                                         | “Drag tabs here” in empty folders                | `zen-fluent.empty-folder-hint`                                              | `true`             |
| [URL bar](url-bar.md)                   | URL bar shape                                    | `zen-fluent.url-style`                                                      | `auto`             |
|                                         | Accent line under the URL bar                    | `zen-fluent.url-underline`                                                  | `focus`            |
|                                         | Floating URL bar color                           | `zen-fluent.url-floating-color`                                             | `solid`            |
|                                         | Centered URL                                     | `zen-fluent.url-centered`                                                   | `false`            |
|                                         | Hide the zoom level                              | `zen-fluent.url-hide-zoom`                                                  | `false`            |
|                                         | Hide permission icons                            | `zen-fluent.url-hide-permissions`                                           | `false`            |
| [Window and menus](window-and-menus.md) | Caption buttons                                  | `zen-fluent.titlebar-style`                                                 | `windows11`        |
|                                         | Auto-hide the bookmarks toolbar                  | `zen-fluent.bookmarks-autohide`                                             | `false`            |
|                                         | Page loading bar                                 | `zen-fluent.loading-bar`                                                    | `winui`            |
|                                         | macOS-style arrows                               | `zen-fluent.mac-back-forward`                                               | `false`            |
|                                         | Back / Forward in the context menu               | `zen-fluent.context-navigation`                                             | `icons`            |
|                                         | Hide menu shortcuts                              | `zen-fluent.hide-shortcuts`                                                 | `false`            |
|                                         | Hide underlined letters in menus                 | `zen-fluent.hide-access-keys`                                               | `false`            |
|                                         | Thin scrollbars in web pages                     | `zen-fluent.thin-scrollbars-web`                                            | `false`            |
| [Animations](animations.md)             | Tab switch animation                             | `zen-fluent.tab-switch-animation`                                           | `fluent`           |
|                                         | URL bar opening animation                        | `zen-fluent.urlbar-animation`                                               | `fade`             |
|                                         | Menu animation                                   | `zen-fluent.menu-animation`                                                 | `flyout`           |
|                                         | WinUI 3 button animations                        | `zen-fluent.button-animations`                                              | `true`             |
|                                         | Back / Forward arrow bounce                      | `zen-fluent.nav-bounce`                                                     | `false`            |
|                                         | Moving gradient                                  | `zen-fluent.gradient-animation`                                             | `false`            |
|                                         | Animated icons                                   | `zen-fluent.animated-icons`                                                 | `true`             |
| [Zones](zones.md)                       | Window                                           | `zen-fluent.fluent-window`                                                  | `true`             |
|                                         | Sidebar                                          | `zen-fluent.fluent-sidebar`                                                 | `true`             |
|                                         | URL bar                                          | `zen-fluent.fluent-urlbar`                                                  | `true`             |
|                                         | Menus and panels                                 | `zen-fluent.fluent-menus`                                                   | `true`             |
|                                         | Notifications                                    | `zen-fluent.fluent-notifications`                                           | `true`             |
|                                         | Find bar                                         | `zen-fluent.fluent-findbar`                                                 | `true`             |
|                                         | Library                                          | `zen-fluent.fluent-library`                                                 | `true`             |
|                                         | Media                                            | `zen-fluent.fluent-media`                                                   | `true`             |
|                                         | Split view and Glance                            | `zen-fluent.fluent-split-glance`                                            | `true`             |
|                                         | Dialogs                                          | `zen-fluent.fluent-dialogs`                                                 | `true`             |
|                                         | Firefox sidebar                                  | `zen-fluent.fluent-firefox-sidebar`                                         | `true`             |
|                                         | Zen screens                                      | `zen-fluent.fluent-screens`                                                 | `true`             |
|                                         | Fluent icons                                     | `zen-fluent.fluent-icons`                                                   | `true`             |
|                                         | Allow the mod's icons                            | `svg.context-properties.content.enabled`                                    | `true`             |
|                                         | Settings and internal pages                      | `zen-fluent.fluent-content`                                                 | `true`             |
| [Zen settings](zen-settings.md)         | Floating URL bar                                 | `zen.urlbar.behavior`                                                       | `floating-on-type` |
|                                         | New tab in the floating URL bar                  | `zen.urlbar.replace-newtab`                                                 | `true`             |
|                                         | Copy link button                                 | `zen.urlbar.single-toolbar-show-copy-url`                                   | `true`             |
|                                         | Domain only in the URL bar                       | `zen.urlbar.show-domain-only-in-sidebar`                                    | `true`             |
|                                         | Tracking protection icon                         | `zen.urlbar.show-protections-icon`                                          | `false`            |
|                                         | Picture-in-Picture button in the URL bar         | `zen.urlbar.show-pip-button`                                                | `false`            |
|                                         | Tab preview on hover                             | `browser.tabs.hoverPreview.enabled`                                         | `false`            |
|                                         | Page thumbnail in the preview                    | `browser.tabs.hoverPreview.showThumbnails`                                  | `true`             |
|                                         | Page loading indicator                           | `zen.view.enable-loading-indicator`                                         | `true`             |
|                                         | Grey out inactive windows                        | `zen.view.grey-out-inactive-windows`                                        | `true`             |
|                                         | Drop a tab on the page to split the view         | `zen.splitView.enable-tab-drop`                                             | `true`             |
|                                         | Glance                                           | `zen.glance.enabled`                                                        | `true`             |
|                                         | Open a link in Glance with                       | `zen.glance.activation-method`                                              | `alt`              |
|                                         | Picture-in-Picture when leaving a video's tab    | `media.videocontrols.picture-in-picture.enable-when-switching-tabs.enabled` | `false`            |
|                                         | Full Picture-in-Picture controls                 | `media.videocontrols.picture-in-picture.improved-video-controls.enabled`    | `true`             |

The `zen-fluent.ui.open-<group>` checkboxes are the group headers (open or
closed; only **Appearance** is open by default) and `zen-fluent.ui.expand-all`
(**Show all settings**, default `false`) opens every group.

## Zen Fluent Enhanced

One checkbox per feature, with its options; what each feature does:
[../enhanced.md](../enhanced.md).

| Feature                                        | Preference                                        | Default                                                              |
| ---------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| Quick Settings                                 | `zen-fluent.enhanced.quick-settings`              | `true`                                                               |
| Settings page                                  | `zen-fluent.enhanced.settings-page`               | `true`                                                               |
| Open Zen's settings on Zen Fluent              | `zen-fluent.enhanced.settings-page.home`          | `true`                                                               |
| Icon colors                                    | `zen-fluent.enhanced.favicon-color`               | `true`                                                               |
| Adaptive accent                                | `zen-fluent.enhanced.adaptive-accent`             | `false`                                                              |
| Window glow                                    | `zen-fluent.enhanced.window-glow`                 | `true`                                                               |
| Site color                                     | `zen-fluent.enhanced.site-color`                  | `false`                                                              |
| Site color strength                            | `zen-fluent.enhanced.site-color.strength`         | `light`                                                              |
| Settings per space                             | `zen-fluent.enhanced.space-settings`              | `true`                                                               |
| Extensions under the Essentials                | `zen-fluent.enhanced.extensions-below-essentials` | `false`                                                              |
| Tab numbers while Ctrl is held                 | `zen-fluent.enhanced.tab-numbers`                 | `true`                                                               |
| Shortcuts                                      | `zen-fluent.enhanced.shortcuts`                   | `true`                                                               |
| Tab archiving                                  | `zen-fluent.enhanced.tab-archive`                 | `false`                                                              |
| Archive tabs unused for (hours)                | `zen-fluent.enhanced.tab-archive.after`           | `12`                                                                 |
|                                                | Custom time before archiving                      | `zen-fluent.enhanced.tab-archive.after-custom`                       | `36`  |
| Keep archived tabs (days)                      | `zen-fluent.enhanced.tab-archive.keep`            | `90`                                                                 |
|                                                | Custom time archived tabs are kept                | `zen-fluent.enhanced.tab-archive.keep-custom`                        | `60`  |
| Archive pinned tabs too                        | `zen-fluent.enhanced.tab-archive.pinned`          | `false`                                                              |
| Archive tabs in folders too                    | `zen-fluent.enhanced.tab-archive.folders`         | `false`                                                              |
| PDF viewer                                     | `zen-fluent.enhanced.pdf-viewer`                  | `true`                                                               |
| Fluent controls on websites                    | `zen-fluent.enhanced.web-controls`                | `false`                                                              |
| Browsing stats                                 | `zen-fluent.enhanced.browsing-stats`              | `false`                                                              |
| Folder colors                                  | `zen-fluent.enhanced.folder-colors`               | `true`                                                               |
| Fluent icons in the icon picker                | `zen-fluent.enhanced.icon-picker`                 | `true`                                                               |
| Tab hover cards                                | `zen-fluent.enhanced.hover-cards`                 | `false`                                                              |
| Hover card delay (ms)                          | `zen-fluent.enhanced.hover-cards.delay`           | `500`                                                                |
|                                                | Custom hover card delay                           | `zen-fluent.enhanced.hover-cards.delay-custom`                       | `400` |
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
|                                                | Custom time before tabs sleep                     | `zen-fluent.enhanced.performance.sleep-after-custom`                 | `45`  |
| Tab notes                                      | `zen-fluent.enhanced.tab-notes`                   | `false`                                                              |
| AI controls page                               | `zen-fluent.enhanced.ai-controls`                 | `false`                                                              |
| AI chatbot panel                               | `zen-fluent.enhanced.ai-chat`                     | `false`                                                              |
| Focus sessions                                 | `zen-fluent.enhanced.focus-session`               | `false`                                                              |
| Focus session length (minutes)                 | `zen-fluent.enhanced.focus-session.minutes`       | `25`                                                                 |
|                                                | Custom focus session length                       | `zen-fluent.enhanced.focus-session.minutes-custom`                   | `50`  |
| Hide the sidebar during a focus session        | `zen-fluent.enhanced.focus-session.compact`       | `true`                                                               |
| Mute tabs playing sound during a focus session | `zen-fluent.enhanced.focus-session.mute`          | `true`                                                               |
| Block distracting sites during a focus session | `zen-fluent.enhanced.focus-session.block`         | `true`                                                               |
| Distracting sites                              | `zen-fluent.enhanced.focus-session.sites`         | `youtube.com,reddit.com,x.com,facebook.com,instagram.com,tiktok.com` |
| Widgets and shelf                              | `zen-fluent.enhanced.shelf`                       | `false`                                                              |
| Start page                                     | `zen-fluent.enhanced.start-page`                  | `false`                                                              |
| Quick window                                   | `zen-fluent.enhanced.quick-window`                | `false`                                                              |
