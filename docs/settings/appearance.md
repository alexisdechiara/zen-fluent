# Appearance

Style, material, accent color, corners and font.

Group header: `zen-fluent.ui.open-appearance` (open by default: `true`).

| Setting                                                            | Preference                    | Values                                                                                                                                                                            | Default   |
| ------------------------------------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Interface style                                                    | `zen-fluent.style`            | `winui` WinUI 3 (Windows 11)<br>`edge` Microsoft Edge (Fluent 2)                                                                                                                  | `winui`   |
| Backdrop material (the same as the Mica For Everyone rule for zen) | `zen-fluent.material`         | `mica` Mica<br>`mica-alt` Mica Alt (Tabbed)<br>`acrylic` Acrylic                                                                                                                  | `mica`    |
| Accent color                                                       | `zen-fluent.accent`           | `system` Windows accent<br>`zen` Zen workspace color<br>`blue` Blue<br>`violet` Violet<br>`mint` Mint<br>`orange` Orange<br>`pink` Pink<br>`graphite` Graphite<br>`custom` Custom | `system`  |
| Custom color (any CSS color: #0078d4, rgb(0 120 212), teal…)       | `zen-fluent.accent-custom`    | text                                                                                                                                                                              | `#0078d4` |
| Corners and gaps                                                   | `zen-fluent.corners`          | `winui` WinUI (no gaps)<br>`zen` Zen (rounded, with gaps)                                                                                                                         | `winui`   |
| Font                                                               | `zen-fluent.font`             | `segoe` Segoe UI Variable<br>`aptos` Aptos<br>`system` System font<br>`custom` Custom                                                                                             | `segoe`   |
| Custom font (a font name, for example Inter or Fira Sans)          | `zen-fluent.font-custom`      | text                                                                                                                                                                              | `(empty)` |
| Text selection in the accent color                                 | `zen-fluent.accent-selection` | `true` / `false`                                                                                                                                                                  | `true`    |
| Acrylic noise (menus, panels and floating surfaces)                | `zen-fluent.acrylic-noise`    | `true` / `false`                                                                                                                                                                  | `false`   |

## Notes

- **Interface style**: see [Edge style](../core.md#edge-style). In the Edge style,
  **Corners and gaps** does not apply and its row is hidden.
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
