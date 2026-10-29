# Animations

Tab switch, URL bar, menus, buttons.

Group header: `zen-fluent.ui.open-animations` (open by default: `false`).

| Setting                     | Preference                        | Values                                                                                                                                                          | Default  |
| --------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Tab switch animation        | `zen-fluent.tab-switch-animation` | `fluent` Fluent (entrance)<br>`fade` Fade<br>`none` None                                                                                                        | `fluent` |
| URL bar opening animation   | `zen-fluent.urlbar-animation`     | `fade` Fade<br>`zoom` Zoom<br>`slide` Slide<br>`stagger` Staggered results<br>`stagger-up` Staggered upward<br>`bounce` Bounce (Microsoft Store)<br>`none` None | `fade`   |
| Menu animation              | `zen-fluent.menu-animation`       | `flyout` Flyout (WinUI)<br>`popin` From the button<br>`fade` Fade<br>`none` None                                                                                | `flyout` |
| WinUI 3 button animations   | `zen-fluent.button-animations`    | `true` / `false`                                                                                                                                                | `true`   |
| Back / Forward arrow bounce | `zen-fluent.nav-bounce`           | `true` / `false`                                                                                                                                                | `false`  |

## Notes

- **URL bar opening animation**: fade, zoom, and, from Firefox-WinUI, slide,
  staggered results (down or up) and the Microsoft Store bounce. Results only
  animate when the bar opens, not while typing.
- **Menu animation**: WinUI flyout (default), from the button, fade or none.
- **WinUI 3 button animations**: a fast fill change and a press scale on
  toolbar buttons, tabs and URL bar results. Library tabs fade and press on
  their pill, and keep their own transition, which ZenLibraryTweaks uses to
  slide them while they are reordered.
- Animations stop with `prefers-reduced-motion`, except two known ones: the
  selected tab pill and the chevron of the settings groups.
