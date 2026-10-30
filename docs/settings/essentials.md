# Essentials

The Essentials tiles, with choices modelled on the Windows taskbar: how the
selected tile is marked, size, layout and indicators.

Group header: `zen-fluent.ui.open-essentials` (open by default: `false`).

| Setting                                    | Preference                             | Values                                                                                                                                                                 | Default  |
| ------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Selected Essential                         | `zen-fluent.essentials.selected-style` | `glow` Dash and favicon glow<br>`arc` Arc (colored border, 3D edge)<br>`fill` Fill<br>`indicator` Taskbar indicator<br>`outline` Outline<br>`lift` Lift<br>`tint` Tint | `glow`   |
| Selected Essential color                   | `zen-fluent.essentials.selected-color` | `accent` Accent<br>`space` Space color                                                                                                                                 | `accent` |
| Essentials per row                         | `zen-fluent.essentials-per-row`        | `auto` Automatic<br>`2` 2<br>`3` 3<br>`4` 4<br>`5` 5<br>`6` 6                                                                                                          | `auto`   |
| Essentials width (automatic count per row) | `zen-fluent.essentials.width`          | `auto` Automatic (fill the row)<br>`40` 40 px<br>`48` 48 px<br>`56` 56 px<br>`64` 64 px<br>`72` 72 px<br>`80` 80 px                                                    | `auto`   |
| Icon size                                  | `zen-fluent.essentials.icon-size`      | `small` Small (16 px)<br>`medium` Medium (20 px)<br>`large` Large (24 px)                                                                                              | `medium` |
| Essentials height                          | `zen-fluent.essentials.height`         | `auto` Automatic (density)<br>`32` 32 px<br>`36` 36 px<br>`42` 42 px<br>`48` 48 px<br>`56` 56 px                                                                       | `auto`   |
| Space between Essentials                   | `zen-fluent.essentials.gap`            | `auto` Automatic (density)<br>`0` 0 px<br>`2` 2 px<br>`4` 4 px<br>`6` 6 px<br>`8` 8 px<br>`12` 12 px                                                                   | `auto`   |
| Alignment                                  | `zen-fluent.essentials.align`          | `start` Left<br>`center` Center                                                                                                                                        | `start`  |
| Grey Essentials icons                      | `zen-fluent.essentials-gray`           | `true` / `false`                                                                                                                                                       | `false`  |

## Notes

- **Essentials per row**: Automatic keeps as many 36 px columns as fit, a lone row stretched across. A count sets 2 to 6 equal columns: the tiles keep their height and gap, and keep their width when their row is not full. A sidebar too narrow for the count keeps as many 36 px columns as fit; the collapsed sidebar stays one column.
- **Essentials width**: with Essentials per row on Automatic, the tiles
  stretch to fill each row. A width keeps them that wide, as many per row as
  fit, from the start of the row (never wider than the sidebar). Hidden when
  Essentials per row is a count, which sets the width itself.
- **Essentials height** and **Space between Essentials**: Automatic follows
  the density (42 px tiles 6 px apart, 36 px and 4 px in compact). The width
  stays the grid's: see Essentials per row.
- **Selected Essential**: how the selected tile is marked. All styles stay
  inside the tile.
  - _Dash and favicon glow_ (default): the card tile with a dash under the
    icon (the Edge style raises the tile instead), and Zen's blurred favicon
    glow behind it while `zen.theme.essentials-favicon-bg` is on.
  - _Arc_: a 2 px border in the color, a light top edge and a dark 3 px bottom
    edge (the lip is drawn inside the tile: the grid would cut an outer one).
  - _Fill_: the tile in the color; glyph icons turn black or white, whichever
    reads on it, and a favicon gets a thin outline of that color.
  - _Taskbar indicator_: a neutral fill and a 16 px rounded bar under the icon,
    like the Windows taskbar's running app.
  - _Outline_: a 2 px ring inside the tile, no fill (the WinUI focus look).
  - _Lift_: a lighter fill, a soft shadow, 1 px up.
  - _Tint_: 25 % of the color with a 1 px border of it.
- **Selected Essential color**: the accent, or the current space's color (Zen's
  `--zen-primary-color`, the dominant color of the space's theme). A site's own
  color needs a script and will come with Zen Fluent Enhanced. Contrast themes
  keep the system colors whatever the choice. Hidden with Lift, which uses no
  color.
- **Alignment**: Left keeps the grid. Center centers each row, the last one
  too, like the centered Windows taskbar; the tiles keep the width set above
  (or the column of a count per row), else they are nearly square (the
  height less 4 px). The extensions row has its own Alignment (Extensions
  group).
- **Icon size**: the favicon, 16, 20 or 24 px like the taskbar's small, medium
  and large icons; the tile keeps its height.
