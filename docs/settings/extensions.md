# Extensions

The row of extensions pinned to the toolbar: place, size, layout, badges.

Group header: `zen-fluent.ui.open-extensions` (open by default: `false`).

| Setting                            | Preference                          | Values                                                                                                       | Default |
| ---------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------- |
| WinUI style for the extensions row | `zen-fluent.pinned-extensions`      | `true` / `false`                                                                                             | `true`  |
| Place                              | `zen-fluent.extensions.position`    | `top` Above the Essentials<br>`bottom` Bottom of the sidebar<br>`hidden` Hidden                              | `top`   |
| Columns                            | `zen-fluent.extensions.columns`     | `auto` Automatic<br>`3` 3<br>`4` 4<br>`5` 5<br>`6` 6<br>`7` 7<br>`8` 8                                       | `auto`  |
| Rows                               | `zen-fluent.extensions.rows`        | `auto` All<br>`1` 1<br>`2` 2<br>`3` 3<br>`4` 4<br>`scroll` One row, scrolls sideways                         | `auto`  |
| Icon size                          | `zen-fluent.extensions.icon-size`   | `auto` Automatic (16 px)<br>`12` 12 px<br>`14` 14 px<br>`16` 16 px<br>`18` 18 px<br>`20` 20 px<br>`24` 24 px | `auto`  |
| Button size                        | `zen-fluent.extensions.button-size` | `auto` Automatic (density)<br>`24` 24 px<br>`28` 28 px<br>`32` 32 px<br>`36` 36 px<br>`40` 40 px             | `auto`  |
| Space between buttons              | `zen-fluent.extensions.gap`         | `auto` Automatic<br>`0` 0 px<br>`2` 2 px<br>`4` 4 px<br>`6` 6 px<br>`8` 8 px<br>`12` 12 px                   | `auto`  |
| Alignment                          | `zen-fluent.extensions.align`       | `auto` Automatic (style)<br>`stretch` Stretch<br>`start` Start<br>`center` Center<br>`end` End               | `auto`  |
| Row background                     | `zen-fluent.extensions.background`  | `none` None<br>`subtle` Subtle<br>`card` Card<br>`acrylic` Acrylic                                           | `none`  |
| Badges                             | `zen-fluent.extensions.badge`       | `show` Count<br>`dot` Dot<br>`hide` Hidden                                                                   | `show`  |

## Notes

- **WinUI style for the extensions row**: Zen's single toolbar shows the
  extensions pinned to the toolbar in a row under the URL bar
  (`#zen-overflow-extensions-list`); the mod lays it out as WinUI buttons.
  Columns, rows, sizes, gap, alignment and background need it on; place and
  badges work either way.
  Since Zen 1.24, while the URL bar's icons and the extensions take less than
  55 % of its width (`zen.view.overflow-webext-toolbar-threshold`), they sit
  inside the URL bar instead; set that preference to `0` to always have the
  row.
  Extensions moved to the tab bar by an older mod (Arc 2.0, Nebula) stay
  stacked at the bottom of the sidebar: in the Extensions menu (puzzle icon),
  click each one's gear, **Unpin from Toolbar**, then **Pin to Toolbar**.
- **Place**: above the Essentials (Zen's place) or at the very bottom of the
  sidebar, under the Library and New buttons. Between the Essentials and the
  tabs needs a script: Zen Fluent Enhanced's **Extensions under the
  Essentials** moves the row there while Place is above the Essentials
  ([docs/enhanced.md](../enhanced.md)). Hidden: the
  extensions stay in the site panel and the Extensions menu.
- **Columns**: Automatic fits as many buttons as the width allows; a count
  makes that many columns, narrower than a button if the sidebar is narrow.
- **Rows**: All, or at most 1 to 4 rows with the rest scrolling; One row
  scrolls sideways (Shift + wheel) and ignores Columns.
- **Icon size**, **Button size**: also for the extension buttons of the
  classic toolbar (single toolbar off), not for those inside the URL bar.
  40 px is 2 px taller than the classic toolbar.
- **Alignment**: Automatic follows the style (WinUI stretches the buttons
  across the row, Edge keeps them square at the start); Start, Center and End
  keep square buttons.
- **Row background**: a surface under the buttons, 4 px around them: a subtle
  fill, a card (fill and border) or Acrylic.
- **Badges**: the count (in the accent), a dot like the Windows taskbar's, or
  none; in the row and in the classic toolbar.
