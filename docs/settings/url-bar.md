# URL bar

Shape, accent line, URL position, icons.

Group header: `zen-fluent.ui.open-urlbar` (open by default: `false`).

| Setting                                                      | Preference                        | Values                                                                                                                               | Default |
| ------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| URL bar shape                                                | `zen-fluent.url-style`            | `auto` Follow the style (WinUI text box, Edge pill)<br>`textbox` Text box (WinUI)<br>`pill` Pill (Edge)<br>`transparent` Transparent | `auto`  |
| Accent line under the URL bar                                | `zen-fluent.url-underline`        | `focus` On focus (WinUI)<br>`animated` On focus, animated (Fluent 2)<br>`always` Always<br>`none` Never                              | `focus` |
| Centered URL                                                 | `zen-fluent.url-centered`         | `true` / `false`                                                                                                                     | `false` |
| Hide the zoom level                                          | `zen-fluent.url-hide-zoom`        | `true` / `false`                                                                                                                     | `false` |
| Hide permission icons (only the open request keeps its icon) | `zen-fluent.url-hide-permissions` | `true` / `false`                                                                                                                     | `false` |

## Notes

- **URL bar shape**: follow the style (WinUI text box, Edge pill), text box,
  pill or transparent. The pill is a real pill (radius = half the height), with
  the site button at the start and round 28 px buttons centered on the ends.
  Open, the surface grows by 4 px all around (radius 20); floating, it is a card
  with a 24 px radius, a full pill when there are no results.
- **Accent line**: on focus (WinUI, default), on focus and animated from the
  center (Fluent 2), always (1 px at rest, 2 px on focus) or never. On the pill,
  the line stops at the rounded ends.
- **Hide permission icons**: only the request on screen keeps its icon; a
  request denied for now no longer has an icon to come back to it.
