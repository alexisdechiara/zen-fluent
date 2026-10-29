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
| Acrylic sidebar background in compact mode                 | `zen-fluent.compact-sidebar-bg`    | `true` / `false`                                                         | `true`   |
| Edge hint at the window border in compact mode             | `zen-fluent.compact-edge-hint`     | `true` / `false`                                                         | `true`   |

## Notes

- **Button style**: subtle (WinUI, a fill on hover) or standard (fill and
  border at rest); in the Edge style, the white fill and hairline of the URL bar.
- **Extensions under the URL bar**: Zen 1.23's single toolbar shows pinned
  extensions in `#zen-overflow-extensions-list`; the mod lays them out as a
  WinUI row.
