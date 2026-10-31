# Window and menus

Caption buttons, bookmarks toolbar, loading bar, icons, menus, scrolling.

Group header: `zen-fluent.ui.open-window` (open by default: `false`).

| Setting                                                                       | Preference                       | Values                                                                                                 | Default     |
| ----------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------- |
| Caption buttons                                                               | `zen-fluent.titlebar-style`      | `windows11` Windows 11<br>`rounded` Rounded<br>`rounded-accent` Rounded, accent color<br>`short` Short | `windows11` |
| Auto-hide the bookmarks toolbar (shown while the pointer is over the toolbar) | `zen-fluent.bookmarks-autohide`  | `true` / `false`                                                                                       | `false`     |
| Page loading bar (while a page loads, with Zen’s loading indicator on)        | `zen-fluent.loading-bar`         | `winui` WinUI ProgressBar<br>`zen` Zen’s indicator                                                     | `winui`     |
| macOS-style arrows                                                            | `zen-fluent.mac-back-forward`    | `true` / `false`                                                                                       | `false`     |
| Back / Forward in the context menu                                            | `zen-fluent.context-navigation`  | `icons` Icons (Firefox)<br>`list` List (WinUI)<br>`commandbar` Command bar (File Explorer)             | `icons`     |
| Hide menu shortcuts                                                           | `zen-fluent.hide-shortcuts`      | `true` / `false`                                                                                       | `false`     |
| Hide underlined letters in menus                                              | `zen-fluent.hide-access-keys`    | `true` / `false`                                                                                       | `false`     |
| Thin scrollbars in web pages (manual install only)                            | `zen-fluent.thin-scrollbars-web` | `true` / `false`                                                                                       | `false`     |

## Notes

- **Caption buttons**, "Rounded, accent color": the glyph only takes the accent
  on hover and press.
- **Auto-hide the bookmarks toolbar**: when the bookmarks toolbar is shown
  (`browser.toolbars.bookmarks.visibility`), it takes no height until the
  pointer is over the toolbar area, the keyboard is in it (F6, Tab), one of its
  menus is open, or a link is dragged over it. It slides in at WinUI’s normal
  duration, without motion when reduced motion is on, and comes in with the
  toolbar in compact mode.
- **Page loading bar**: a WinUI indeterminate ProgressBar (3 px, two accent
  indicators on a 2 s loop) along the top edge of the page, clipped by its
  corners; in split view, on the selected pane. It shows while Zen’s
  **Page loading indicator** is on (Zen settings group); with reduced motion it
  is a still accent line. **Zen’s indicator** keeps Zen’s pulsing pill.
- **Back / Forward in the context menu**: icons (Firefox), a list (WinUI) or a
  command bar (File Explorer).
- **Thin scrollbars**: thin at rest, wider and stronger on hover (sidebar,
  Library, menus). The web pages option goes through `core/userContent.css`:
  with Sine under Zen 1.23, a mod's content sheet only reaches internal pages,
  so the option only works for a [manual install](../installation.md#manual-install).
