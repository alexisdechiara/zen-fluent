# Sidebar

Buttons, workspaces, compact mode.

Group header: `zen-fluent.ui.open-sidebar` (open by default: `false`).

| Setting                                        | Preference                          | Values                                                                                                          | Default  |
| ---------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| Button style                                   | `zen-fluent.button-style`           | `subtle` Subtle (fill on hover)<br>`standard` Standard (fill and border)                                        | `subtle` |
| Sidebar padding (expert)                       | `zen-fluent.sidebar-padding`        | `auto` Automatic (the style’s)<br>`0` None<br>`2` 2 px<br>`5` 5 px<br>`8` 8 px<br>`12` 12 px<br>`custom` Custom | `auto`   |
| Custom sidebar padding                         | `zen-fluent.sidebar-padding-custom` | a length in px                                                                                                  | `6px`    |
| Hide the Forward button when it is disabled    | `zen-fluent.hide-forward-disabled`  | `true` / `false`                                                                                                | `false`  |
| Workspace indicator                            | `zen-fluent.workspace-indicator`    | `true` / `false`                                                                                                | `true`   |
| Workspace icon style                           | `zen-fluent.workspace-style`        | `pill` Pill<br>`fill` Fill<br>`minimal` Minimal                                                                 | `pill`   |
| Page fills the window in compact mode          | `zen-fluent.compact-flush`          | `true` / `false`                                                                                                | `false`  |
| Acrylic sidebar background in compact mode     | `zen-fluent.compact-sidebar-bg`     | `true` / `false`                                                                                                | `true`   |
| Edge hint at the window border in compact mode | `zen-fluent.compact-edge-hint`      | `true` / `false`                                                                                                | `true`   |

## Notes

- **Page fills the window in compact mode**: while the sidebar is hidden,
  the page takes the whole window, with no gap, corners or stroke.
- **Sidebar padding** (expert): the space between the sidebar's content and
  its edges; Zen's is 5 px.

- **Button style**: subtle (WinUI, a fill on hover) or standard (fill and
  border at rest); in the Edge style, the white fill and hairline of the URL bar.
  A fill chosen in the Variants group replaces it.
