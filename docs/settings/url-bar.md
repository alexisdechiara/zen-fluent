# URL bar

Shape, accent line, URL position, icons.

Group header: `zen-fluent.ui.open-urlbar` (open by default: `false`).

| Setting                                                      | Preference                        | Values                                                                                                                                                                                                | Default |
| ------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| URL bar shape                                                | `zen-fluent.url-style`            | `auto` Automatic (the style’s)<br>`textbox` Text box (WinUI)<br>`flat` Flat (File Explorer)<br>`pill` Pill (Edge)<br>`transparent` Transparent                                                        | `auto`  |
| Accent line under the URL bar                                | `zen-fluent.url-underline`        | `focus` On focus (WinUI)<br>`animated` On focus, animated (Fluent 2)<br>`always` Always<br>`none` Never                                                                                               | `focus` |
| Floating URL bar color                                       | `zen-fluent.url-floating-color`   | `solid` Solid (white or black, opaque)<br>`standard` Standard (the window’s material)<br>`tint` Tint (the space’s color, else the accent)<br>`translucent` Translucent (see-through glass, as in Arc) | `solid` |
| Centered URL                                                 | `zen-fluent.url-centered`         | `true` / `false`                                                                                                                                                                                      | `false` |
| Hide the zoom level                                          | `zen-fluent.url-hide-zoom`        | `true` / `false`                                                                                                                                                                                      | `false` |
| Hide permission icons (only the open request keeps its icon) | `zen-fluent.url-hide-permissions` | `true` / `false`                                                                                                                                                                                      | `false` |

## Notes

- **URL bar shape**: follow the style (WinUI text box, Edge pill), text box,
  flat, pill or transparent. Flat is the text box without its edges, as the
  search box of Windows 11's File Explorer: the control fill alone, no
  stroke and no stronger bottom line at rest; the accent line still shows
  on focus. The pill is a real pill (radius = half the height), with
  the site button at the start and round 28 px buttons centered on the ends.
  Open, the surface grows by 4 px all around (radius 20); floating, it is a card
  with a 24 px radius, a full pill when there are no results.
- **Accent line**: on focus (WinUI, default), on focus and animated from the
  center (Fluent 2), always (1 px at rest, 2 px on focus) or never. On the pill,
  the line stops at the rounded ends.
- **Floating URL bar color**, with the variants' names: **Solid**, white in
  light mode and near black in dark mode (default); **Standard**, the
  window's material (the opaque Mica Alt color under Mica Alt); **Tint**,
  the solid card tinted with the space's color, or with the accent while
  the space has none; **Translucent**, see-through glass like Arc's command
  bar (the blur reaches the sidebar, not the page: Firefox never blurs web
  content, the page is only dimmed). "Material" and "Space color", saved by
  0.4.2, read as Standard and Tint. While the bar floats, its place in the
  sidebar keeps the resting field's look (fill, stroke and corners)
  instead of Zen's.
- **Hide permission icons**: only the request on screen keeps its icon; a
  request denied for now no longer has an icon to come back to it.
