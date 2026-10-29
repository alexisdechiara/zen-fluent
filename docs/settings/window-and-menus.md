# Window and menus

Caption buttons, icons, menus, scrolling.

Group header: `zen-fluent.ui.open-window` (open by default: `false`).

| Setting                                                                             | Preference                               | Values                                                                                                 | Default     |
| ----------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------- |
| Caption buttons                                                                     | `zen-fluent.titlebar-style`              | `windows11` Windows 11<br>`rounded` Rounded<br>`rounded-accent` Rounded, accent color<br>`short` Short | `windows11` |
| Fluent icons (uncheck to get Zen's icons back)                                      | `zen-fluent.fluent-icons`                | `true` / `false`                                                                                       | `true`      |
| Allow the mod's icons (check it: without this Firefox setting, Zen keeps its icons) | `svg.context-properties.content.enabled` | `true` / `false`                                                                                       | `true`      |
| macOS-style arrows                                                                  | `zen-fluent.mac-back-forward`            | `true` / `false`                                                                                       | `false`     |
| Back / Forward in the context menu                                                  | `zen-fluent.context-navigation`          | `icons` Icons (Firefox)<br>`list` List (WinUI)<br>`commandbar` Command bar (File Explorer)             | `icons`     |
| Hide menu shortcuts                                                                 | `zen-fluent.hide-shortcuts`              | `true` / `false`                                                                                       | `false`     |
| Hide underlined letters in menus                                                    | `zen-fluent.hide-access-keys`            | `true` / `false`                                                                                       | `false`     |
| Thin scrollbars in web pages (manual install only)                                  | `zen-fluent.thin-scrollbars-web`         | `true` / `false`                                                                                       | `false`     |

## Notes

- **Caption buttons**, "Rounded, accent color": the glyph only takes the accent
  on hover and press.
- **Fluent icons** need **Allow the mod's icons**
  (`svg.context-properties.content.enabled`, a Firefox preference). The icons
  take the theme color through `context-fill`, which Firefox only grants to
  files outside `chrome://` when that preference is `true`. Sine does not
  write it because the preference already exists: check it by hand. Until then
  Zen keeps its own icons.
- **Back / Forward in the context menu**: icons (Firefox), a list (WinUI) or a
  command bar (File Explorer).
- **Thin scrollbars**: thin at rest, wider and stronger on hover (sidebar,
  Library, menus). The web pages option goes through `core/userContent.css`:
  with Sine under Zen 1.23, a mod's content sheet only reaches internal pages,
  so the option only works for a [manual install](../installation.md#manual-install).
