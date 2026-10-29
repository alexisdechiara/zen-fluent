# Sidebar

Buttons, extensions, workspaces, compact mode.

Group header: `zen-fluent.ui.open-sidebar` (open by default: `false`).

| Setting                                                    | Preference                         | Values                                                                   | Default  |
| ---------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ | -------- |
| Button style                                               | `zen-fluent.button-style`          | `subtle` Subtle (fill on hover)<br>`standard` Standard (fill and border) | `subtle` |
| Hide the Forward button when it is disabled                | `zen-fluent.hide-forward-disabled` | `true` / `false`                                                         | `false`  |
| Extensions under the URL bar, WinUI style (single toolbar) | `zen-fluent.pinned-extensions`     | `true` / `false`                                                         | `true`   |
| Workspace indicator                                        | `zen-fluent.workspace-indicator`   | `true` / `false`                                                         | `true`   |
| Workspace icon style                                       | `zen-fluent.workspace-style`       | `pill` Pill<br>`fill` Fill<br>`minimal` Minimal                          | `pill`   |
| Grey Essentials icons                                      | `zen-fluent.essentials-gray`       | `true` / `false`                                                         | `false`  |
| Essentials per row                                         | `zen-fluent.essentials-per-row`    | `auto` Automatic<br>`2` 2<br>`3` 3<br>`4` 4<br>`5` 5<br>`6` 6            | `auto`   |
| Acrylic sidebar background in compact mode                 | `zen-fluent.compact-sidebar-bg`    | `true` / `false`                                                         | `true`   |
| Edge hint at the window border in compact mode             | `zen-fluent.compact-edge-hint`     | `true` / `false`                                                         | `true`   |

## Notes

- **Button style**: subtle (WinUI, a fill on hover) or standard (fill and
  border at rest); in the Edge style, the white fill and hairline of the URL bar.
- **Extensions under the URL bar**: Zen 1.23's single toolbar shows pinned
  extensions in `#zen-overflow-extensions-list`; the mod lays them out as a
  WinUI row.
- **Essentials per row**: Automatic keeps as many 36 px columns as fit, a lone row stretched across. A count sets 2 to 6 equal columns: the tiles keep their height and gap, and keep their width when their row is not full. A sidebar too narrow for the count keeps as many 36 px columns as fit; the collapsed sidebar stays one column.
