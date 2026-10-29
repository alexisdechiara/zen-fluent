# Tabs

Text, pill, shadow, close buttons, highlights, unloaded tabs, sound, containers, empty folders.

Group header: `zen-fluent.ui.open-tabs` (open by default: `false`).

| Setting                                                         | Preference                       | Values                                                                                   | Default   |
| --------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- | --------- |
| Tab text size                                                   | `zen-fluent.tab-text-size`       | `small` Small<br>`normal` Normal<br>`large` Large                                        | `normal`  |
| Bold title on the selected tab                                  | `zen-fluent.tab-bold`            | `true` / `false`                                                                         | `false`   |
| Accent pill on the selected tab                                 | `zen-fluent.tab-pill`            | `true` / `false`                                                                         | `true`    |
| Tab shadow (Zen corners)                                        | `zen-fluent.tab-shadow`          | `true` / `false`                                                                         | `true`    |
| Tab close button                                                | `zen-fluent.tab-close-button`    | `1` Selected tab and hover<br>`2` Hover only<br>`3` Never                                | `1`       |
| Close button in the collapsed sidebar                           | `zen-fluent.collapsed-tab-close` | `default` Default (top start corner)<br>`overlay` Badge in the corner<br>`hidden` Hidden | `default` |
| Highlights on the selected tab, menus and panels                | `zen-fluent.extra-highlights`    | `true` / `false`                                                                         | `false`   |
| Dim unloaded tabs (favicon and title faded until the tab loads) | `zen-fluent.dim-unloaded-tabs`   | `true` / `false`                                                                         | `true`    |
| Animated sound bars on playing tabs                             | `zen-fluent.sound-bars`          | `true` / `false`                                                                         | `true`    |
| Container tabs                                                  | `zen-fluent.container-tabs`      | `line` Colored line<br>`tint` Colored line and tint<br>`none` Zen’s look                 | `line`    |
| “Drag tabs here” in empty folders                               | `zen-fluent.empty-folder-hint`   | `true` / `false`                                                                         | `true`    |

## Notes

- **Tab text size**: small, normal or large (−1 px / +1 px). It also applies to
  folders, the workspace name, the media card and Firefox's side panels.
- **Accent pill** is hidden in the Edge style (the selected tab is raised
  instead); **Tab shadow** only applies with Zen corners and is hidden otherwise.
- **Close button in the collapsed sidebar**: default (top start corner, over
  the icon), a badge in the top end corner, or hidden (close with a middle click
  or the menu).
- **Dim unloaded tabs**: a tab with no page loaded (restored at startup, or unloaded) shows its favicon and title at 65 %, WinUI's tertiary text. This applies to rows, pinned tabs, Essentials and the collapsed sidebar; the selected tab is never dimmed. Zen's own fade of unloaded favicons is replaced, not added.
- **Animated sound bars**: three bars in the accent color rise and fall instead of the speaker. They show in the audio button after the favicon, and in the audio badge over the favicon (Essentials and the collapsed sidebar), in the on-accent color there. Muted and blocked tabs keep Zen's glyphs; with reduced motion the bars stand still.
- **Container tabs**: a rounded bar in the container's color at the tab's start edge (Zen draws it at the end edge). On the selected tab the accent pill takes its place; in the Edge style, or with the pill off, the bar stays. **Colored line and tint** also lays a light wash of the container color over the tab. Tabs of the space's default container, which includes every Essential, stay unmarked, as in Zen (`zen.workspaces.hide-default-container-indicator`).
- **“Drag tabs here”**: an open folder with no tab shows a dashed slot. It slides away with the folder when collapsed and is not shown in the collapsed sidebar. Drop tabs onto the folder as usual.
