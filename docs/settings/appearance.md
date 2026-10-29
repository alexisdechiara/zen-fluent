# Appearance

Style, material, accent color, corners and their radius, density, font and Acrylic blur.

Group header: `zen-fluent.ui.open-appearance` (open by default: `true`).

| Setting                                                                             | Preference                        | Values                                                                                                                                                                            | Default    |
| ----------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Interface style                                                                     | `zen-fluent.style`                | `winui` WinUI 3 (Windows 11)<br>`edge` Microsoft Edge (Fluent 2)                                                                                                                  | `winui`    |
| Backdrop material (the same as the Mica For Everyone rule for zen)                  | `zen-fluent.material`             | `mica` Mica<br>`mica-alt` Mica Alt (Tabbed)<br>`acrylic` Acrylic                                                                                                                  | `mica`     |
| Accent color                                                                        | `zen-fluent.accent`               | `system` Windows accent<br>`zen` Zen workspace color<br>`blue` Blue<br>`violet` Violet<br>`mint` Mint<br>`orange` Orange<br>`pink` Pink<br>`graphite` Graphite<br>`custom` Custom | `system`   |
| Custom color (any CSS color: #0078d4, rgb(0 120 212), teal…)                        | `zen-fluent.accent-custom`        | text                                                                                                                                                                              | `#0078d4`  |
| Corners and gaps                                                                    | `zen-fluent.corners`              | `winui` WinUI (no gaps)<br>`zen` Zen (rounded, with gaps)                                                                                                                         | `winui`    |
| Corner radius (buttons, tabs, cards and menus; circles and pills stay round)        | `zen-fluent.corner-radius`        | `auto` Follow the style (WinUI 4 px, Edge and Zen corners 8 px)<br>`square` Square<br>`small` Small (2 px)<br>`medium` Medium (4 px)<br>`large` Large (8 px)<br>`custom` Custom   | `auto`     |
| Custom radius (of buttons and tabs, in px, for example 6px; cards and menus follow) | `zen-fluent.corner-radius-custom` | text                                                                                                                                                                              | `6px`      |
| Density (row and control heights; not Zen’s compact mode)                           | `zen-fluent.density`              | `standard` Standard<br>`compact` Compact (WinUI compact sizing)                                                                                                                   | `standard` |
| Font                                                                                | `zen-fluent.font`                 | `segoe` Segoe UI Variable<br>`aptos` Aptos<br>`system` System font<br>`custom` Custom                                                                                             | `segoe`    |
| Custom font (a font name, for example Inter or Fira Sans)                           | `zen-fluent.font-custom`          | text                                                                                                                                                                              | `(empty)`  |
| Text selection in the accent color                                                  | `zen-fluent.accent-selection`     | `true` / `false`                                                                                                                                                                  | `true`     |
| Acrylic blur (split view header and Glance buttons)                                 | `zen-fluent.acrylic-blur`         | `auto` Default (20 px)<br>`none` None<br>`light` Light (10 px)<br>`strong` Strong (30 px, as in WinUI)<br>`custom` Custom                                                         | `auto`     |
| Custom blur (a radius in px, for example 30px)                                      | `zen-fluent.acrylic-blur-custom`  | text                                                                                                                                                                              | `20px`     |
| Acrylic noise (menus, panels and floating surfaces)                                 | `zen-fluent.acrylic-noise`        | `true` / `false`                                                                                                                                                                  | `false`    |

## Notes

- **Interface style**: see [Edge style](../core.md#edge-style). In the Edge style,
  **Corners and gaps** does not apply and its row is hidden.
- **Density**: compact follows WinUI’s compact sizing. Controls (buttons,
  text boxes, combo boxes) go from 32 to 24 px, list rows from 40 to 32 px,
  sidebar tabs, folders and Library rows from 36 to 32 px, tree rows from 32 to
  24 px, menu rows from 32 to 28 px, toolbar and icon buttons to 28 px, and
  Essentials from 42 to 36 px, and the pill URL bar from 32 to 28 px (the text
  box URL bar keeps Zen’s height). Text keeps its size. Dialogs and internal pages
  keep the standard sizes. It is not Zen’s compact mode, which hides the
  sidebar and the toolbar.
- **Custom color** accepts any CSS color (`#0078d4`, `rgb(0 120 212)`,
  `teal`…). Its row only shows when the accent is **Custom**. An invalid value
  falls back to the Windows accent, and so do internal pages (`about:`), where
  Sine does not pass text settings.
- **Font**: Segoe UI Variable (default), Aptos, the system font or a custom
  font. A custom font is one font name (`Inter`, `Fira Sans`, `"Fira Sans"`)
  or a list of one-word names (`Inter, Arial`). An invalid value, or a list
  mixing both forms, falls back to Segoe UI Variable, and so do internal pages.
  Its row only shows when the font is **Custom**.
- **Text selection in the accent color**: the interface and internal pages,
  never web pages.
- **Acrylic noise**: about 2 %, like WinUI's AcrylicBrush, on menus, panels,
  the split view header, Glance buttons, the status text and floating surfaces
  (not with Mica Alt). It goes away without hardware acceleration, with reduced
  transparency and in high contrast.
- **Corner radius**: **Follow the style** keeps each style's radii for
  controls, cards and overlays: WinUI 4 / 8 / 8 px, Zen corners 8 / 10 / 12 px,
  Edge 8 / 8 / 12 px. The other values set the radius of buttons, tabs, rows
  and fields (square 0, small 2 px, medium 4 px, large 8 px, or custom); cards
  and overlays (the page card, menus, flyouts, dialogs) keep the style's ratio
  to it, so large in the WinUI style gives 8 / 16 / 16 px. Circles and pills
  stay round. With Mica popups (Windows 11), Windows draws the corners of menus
  and panels itself.
- **Custom radius**: a length such as `6px` (`6` alone means pixels). Its row
  only shows when the corner radius is **Custom**. An invalid value (text, a
  percentage, a negative length) falls back to the style's radii, and so do
  internal pages and the Firefox sidebar's pages, where Sine does not pass
  text settings.
- **Acrylic blur**: the blur behind the split view header and Glance's
  buttons, the two translucent Acrylic surfaces: 20 px by default, none, 10 px,
  30 px (WinUI's AcrylicBrush) or custom. Firefox does not blur a web page
  behind the interface, so over a page only the interface behind them is
  blurred; the other surfaces over the page are solid. No blur without
  hardware acceleration or with reduced transparency, whatever the setting.
- **Custom blur**: a length such as `30px` (`30` alone means pixels). Its row
  only shows when the blur is **Custom**. An invalid value falls back to 20 px.
