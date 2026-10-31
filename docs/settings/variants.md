# Variants

Fill and shape of buttons and tiles, for all components at once or one by
one.

Group header: `zen-fluent.ui.open-variants` (open by default: `false`).

| Setting                               | Preference                                | Values                                                                                                                                                  | Default   |
| ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Fill, everywhere                      | `zen-fluent.variant.global`               | `auto` Automatic (each component's own)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen) | `auto`    |
| Shape, everywhere                     | `zen-fluent.variant.global-shape`         | `auto` Automatic (each component's own)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                          | `auto`    |
| Toolbar and sidebar buttons: fill     | `zen-fluent.variant.buttons`              | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Toolbar and sidebar buttons: shape    | `zen-fluent.variant.buttons-shape`        | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Extension buttons: fill               | `zen-fluent.variant.extensions`           | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Extension buttons: shape              | `zen-fluent.variant.extensions-shape`     | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Extension buttons: fill and shape for | `zen-fluent.variant.extensions-scope`     | `buttons` Each button<br>`row` The whole row                                                                                                            | `buttons` |
| Essentials: fill                      | `zen-fluent.variant.essentials`           | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Essentials: shape                     | `zen-fluent.variant.essentials-shape`     | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Tabs: fill                            | `zen-fluent.variant.tabs`                 | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Tabs: shape                           | `zen-fluent.variant.tabs-shape`           | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Pinned tabs: fill                     | `zen-fluent.variant.pinned-tabs`          | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Pinned tabs: shape                    | `zen-fluent.variant.pinned-tabs-shape`    | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Folder headers: fill                  | `zen-fluent.variant.folders`              | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Folder headers: shape                 | `zen-fluent.variant.folders-shape`        | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Space buttons: fill                   | `zen-fluent.variant.spaces`               | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Space buttons: shape                  | `zen-fluent.variant.spaces-shape`         | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| URL bar: fill                         | `zen-fluent.variant.urlbar`               | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| URL bar: shape                        | `zen-fluent.variant.urlbar-shape`         | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| URL bar buttons: fill                 | `zen-fluent.variant.urlbar-buttons`       | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| URL bar buttons: shape                | `zen-fluent.variant.urlbar-buttons-shape` | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Badges: fill                          | `zen-fluent.variant.badges`               | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Badges: shape                         | `zen-fluent.variant.badges-shape`         | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |
| Panel and dialog buttons: fill        | `zen-fluent.variant.panel-buttons`        | `auto` Automatic (everywhere)<br>`solid` Solid<br>`subtle` Subtle<br>`ghost` Ghost<br>`outline` Outline<br>`translucent` Translucent (as Zen)           | `auto`    |
| Panel and dialog buttons: shape       | `zen-fluent.variant.panel-buttons-shape`  | `auto` Automatic (everywhere)<br>`square` Square<br>`rounded` Rounded<br>`pill` Pill                                                                    | `auto`    |

## How the choices combine

Two axes, so that choices combine: the **fill** (solid, subtle, ghost,
outline, translucent) and the **shape** (square, rounded, pill). A **Pill**
fill saved by 0.3 or before still reads as the pill shape.

- The fill of a component is its own when it names one, else the one set
  for every component; Automatic on both keeps the look of the other
  settings (for instance **Button style** in the Sidebar group, which a
  buttons fill replaces).
- The shape is the component's shape, else the shape set for every
  component.
  Rounded keeps the component's own radius (and blocks a shape set for every
  component).

## Fills

- **Solid**: the WinUI Button: a control fill and the elevation stroke at
  rest (the Edge style: the address bar's white field and hairline).
- **Subtle**: between Solid and Outline: half the control fill inside the
  outline's 1 px stroke, the full control fill on hover.
- **Ghost**: no fill at rest, a faint one on hover; glyph buttons turn to the
  accent on hover.
- **Outline**: a 1 px stroke, the subtle fills on hover and press. Contrast
  themes draw it in the button text color.
- **Translucent**: Zen's own see-through fills, a share of the text color
  that lets the window color (and the space's gradient) show; the selected
  item takes Zen's white veil.

## Components

Buttons take the fill at rest, on hover and pressed. Lists (tabs, pinned
tabs, spaces) take it on their selected item: the others stay bare, with the
fill's hover. Solid raises the selected item, Subtle gives it the control
fill in the outline, Ghost leaves it bare (the accent pill or dot still marks
it), Outline rings it, Translucent lays Zen's white veil on it.

- **Toolbar and sidebar buttons**: the sidebar's top and foot buttons (menu,
  compact mode, back, forward, reload, Library, New) and the toolbar's with
  multiple toolbars. The new tab row, the media card and the spaces keep their
  own look. Pill on these square buttons draws circles.
- **Extension buttons**: the row of pinned extensions (Extensions group).
  **Fill and shape for** The whole row draws them on one surface 4 px around
  the buttons, which keep their own look.
- **Essentials**: the fill is for the tiles at rest; the selected tile keeps
  **Selected Essential** (Sidebar group). The shape is for every tile. Ghost
  leaves bare icons at rest, like the taskbar.
- **Tabs**: the selected tab keeps its accent pill. Pill rounds the row ends.
- **Pinned tabs**: the pinned tabs of a space, the tabs of its folders
  included.
- **Folder headers**: the folder's label row, as a button.
- **Space buttons**: the current space takes the fill. A fill replaces
  **Workspace icon style**'s Fill; its Pill dot and Minimal fading stay.
- **URL bar**: the field at rest and hovered; focused or open, it keeps its
  look. Solid is the style's own field (and brings it back with the
  Transparent URL bar shape), Subtle a light fill in a stroke, Outline a
  stroke without fill, Translucent Zen's see-through field. Ghost keeps a faint stroke: without any, nothing would show
  where to type. The shape only rounds the field: **URL bar shape**'s Pill
  also turns its buttons into circles.
- **URL bar buttons**: site information, permissions, tracking protection,
  bookmark star and page actions.
- **Badges**: extension counts and the Library's downloads count. Solid is
  the accent, Subtle an accent tint in an accent ring, Ghost accent text on
  the window color, Outline adds an accent ring, Translucent a see-through
  accent. Square gives them 2 px corners.
- **Panel and dialog buttons**: the standard buttons of the flyouts
  (downloads, site information) and of the dialogs; the accent button keeps
  its fill but takes the shape.

The window's caption buttons (minimize, maximize, close) follow the
**Caption buttons** setting: a fill or a shape would no longer look like
Windows'.
