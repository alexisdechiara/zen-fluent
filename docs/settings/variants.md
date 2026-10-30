# Variants

Fill and shape of buttons and tiles, for all components at once or one by
one.

Group header: `zen-fluent.ui.open-variants` (open by default: `false`).

| Setting                            | Preference                            | Values                                                                                                                                                  | Default |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Fill, everywhere                   | `zen-fluent.variant.global`           | `auto` Automatic (each component's own)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`pill` Pill (pill shape, own fill) | `auto`  |
| Shape, everywhere                  | `zen-fluent.variant.global-shape`     | `auto` Automatic (each component's own)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                          | `auto`  |
| Toolbar and sidebar buttons: fill  | `zen-fluent.variant.buttons`          | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`pill` Pill (pill shape, own fill)           | `auto`  |
| Toolbar and sidebar buttons: shape | `zen-fluent.variant.buttons-shape`    | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`  |
| Extension buttons: fill            | `zen-fluent.variant.extensions`       | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`pill` Pill (pill shape, own fill)           | `auto`  |
| Extension buttons: shape           | `zen-fluent.variant.extensions-shape` | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`  |
| Essentials: fill                   | `zen-fluent.variant.essentials`       | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`pill` Pill (pill shape, own fill)           | `auto`  |
| Essentials: shape                  | `zen-fluent.variant.essentials-shape` | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`  |

## How the choices combine

Two axes, so that choices combine: the **fill** (solid, subtle, ghost,
outline) and the **shape** (square, rounded, pill). **Pill** in a fill list
is a shortcut for the pill shape with the component's current fill.

- The fill of a component is its own when it names one, else the one set
  for every component; Automatic on both keeps the look of the other
  settings (for instance **Button style** in the Sidebar group, which a
  buttons fill replaces).
- The shape is, in this order: the component's shape, its Pill fill, the
  shape set for every component, the Pill fill set for every component.
  Rounded keeps the component's own radius (and blocks a shape set for every
  component).

## Fills

- **Solid**: the WinUI Button: a control fill and the elevation stroke at
  rest (the Edge style: the address bar's white field and hairline).
- **Subtle**: no fill at rest, a fill on hover and press (WinUI subtle
  buttons).
- **Ghost**: no fill at rest, a faint one on hover; glyph buttons turn to the
  accent on hover.
- **Outline**: a 1 px stroke, the subtle fills on hover and press. Contrast
  themes draw it in the button text color.

## Components

- **Toolbar and sidebar buttons**: the sidebar's top and foot buttons (menu,
  compact mode, back, forward, reload, Library, New) and the toolbar's with
  multiple toolbars. The new tab row, the media card and the spaces keep their
  own look. Pill on these square buttons draws circles.
- **Extension buttons**: the row of pinned extensions (Extensions group).
- **Essentials**: the fill is for the tiles at rest; the selected tile keeps
  **Selected Essential** (Sidebar group). The shape is for every tile. Ghost
  and Subtle leave bare icons at rest, like the taskbar: the grid then shows
  through only on hover.

More components (tabs, pinned tabs, folders, URL bar, badges, panels) will
follow.
