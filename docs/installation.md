# Installation

## With Sine

[Sine](https://github.com/CosmoCreeper/Sine) is the mod manager for Zen.

1. Zen settings › Sine › Mods, install from GitHub:
   `alexisdechiara/zen-fluent`.
2. Open the mod's settings (gear on its card).

Sine writes the defaults of `core/preferences.json`, except for Firefox and
Zen preferences that already exist (**Allow the mod's icons** and the **Zen
settings** group): they keep their value, and **Allow the mod's icons** has to
be checked by hand.

The settings sit in collapsible groups, like WinUI's SettingsExpander: click a
group's title to open or close it, and the state is kept between sessions.
**Appearance** is open at first; **Show all settings** opens everything. With
the keyboard, Space opens or closes a group for the session only (Sine does not
save a checkbox changed from the keyboard). Rows that do nothing with the
values chosen are hidden.

### Zen Fluent Enhanced

Install it from GitHub as well, from its folder:
`alexisdechiara/zen-fluent/tree/main/enhanced`. It installs Zen Fluent if it is
missing. Sine only runs JavaScript from mods outside its store when **Enable
installing JS from unofficial sources** is checked in Sine's settings
(`sine.allow-unsafe-js`). Enhanced has no feature yet: see
[enhanced.md](enhanced.md).

## Fluent icons

The mod replaces Zen's icons with Fluent stroke icons (`core/icons/`):
Back, Forward, Reload, New tab, tab close, Library, compact mode, extensions,
menu, folders (open and closed), workspace chevron, copy link and site settings
in the URL bar, Glance and split view buttons, the media card (play, pause,
tracks, sound, Picture-in-Picture), the whole ≡ menu, and the "briefcase" and
"code" workspace icons (other workspace icons stay Zen's). With **Fluent
icons** unchecked, Zen keeps its own.

These icons take the theme color through `context-fill`, which Firefox keeps
for its own files while `svg.context-properties.content.enabled` is `false`.
Until that preference is `true` (**Allow the mod's icons** in Sine, or
`about:config`), Zen keeps its icons too.

## Manual install

1. `about:config`: `toolkit.legacyUserProfileCustomizations.stylesheets` =
   `true`.
2. Copy the `core/` folder into the profile's `chrome/` folder
   (`about:support` › Profile folder).
3. In `chrome/userChrome.css`, add `@import url("core/chrome.css");`, and in
   `chrome/userContent.css`, `@import url("core/userContent.css");` (create
   the files if needed; imports go before any other rule).
4. In `about:config`, create the `zen-fluent.*` preferences of the
   [settings table](../README.md#settings) with their defaults: without Sine,
   nothing writes them. Also set `svg.context-properties.content.enabled` to
   `true` for the icons.
5. Restart Zen.

## Windows 11: Mica For Everyone

The real Mica / Acrylic backdrop comes from
[Mica For Everyone](https://github.com/MicaForEveryone/MicaForEveryone); Zen
Fluent only tints it.

1. Install Mica For Everyone.
2. **Add rule** › **Process rule**: `zen`.
3. Pick the backdrop type that matches **Backdrop material** in Sine:

   | Backdrop material (Sine) | Mica For Everyone |
   | ------------------------ | ----------------- |
   | Mica                     | Mica              |
   | Mica Alt (Tabbed)        | Tabbed            |
   | Acrylic                  | Acrylic           |

4. Windows Settings › Personalization › Colors: turn off **Show accent color
   on title bars and window borders**, or the transparency does not show.
5. Leave `widget.windows.mica` at `true` (Zen's default): it keeps the window
   transparent.
6. If Zen and Windows are not in the same light / dark mode, set the rule's
   **Title bar color** to **Default**: with **System**, Windows draws the
   system theme's Mica under the mod's tint (dark Zen over light Mica gives a
   grey background).

Tint laid over Mica For Everyone's backdrop (a single coat): Mica 64 %,
Acrylic 80.64 % in light and 87.04 % in dark, Mica Alt 0 %; **Tint opacity**
changes it ([appearance](settings/appearance.md)). The Library has no
surface of its own: it shows the window material, like the sidebar it replaces.

### Mica Alt

With **Mica Alt (Tabbed)**, the mod tints nothing: it is Mica For Everyone's
Mica Alt, untinted, as in WinUI apps. Sidebar, toolbars, Library and the gaps
around the page are one uniform background. What floats over the page (open URL
bar, compact mode sidebar and top bar, find bar, dialogs) takes an opaque Mica
Alt color, because Firefox does not blur web content.

## Linux: transparency and compositor blur

Linux has no Mica: Zen makes the window transparent and the compositor blurs
what is behind it.

1. `about:config`: `zen.widget.linux.transparency` = `true`, then restart Zen.
   Zen Fluent then switches from solid to translucent tints (Mica 64 %, Mica Alt
   79.75 %, Acrylic 80.64 % in light and 87.04 % in dark).
2. Turn on blur for your desktop:
   - **KDE Plasma**: install
     [Better Blur DX](https://github.com/xarblu/kwin-effects-better-blur-dx),
     then System Settings › Window Management › Desktop Effects: turn off
     **Blur**, turn on **Better Blur DX**, and add the `zen` class in its **Force
     blur** tab (`zen-browser` for the AUR package `zen-browser-bin`).
   - **GNOME**: the [Blur my Shell](https://github.com/aunetx/blur-my-shell)
     extension, **Applications** tab: turn on application blur, turn off
     **Opaque focused window**, opacity at the maximum, add `zen` to the list.
   - **Hyprland**: `decoration { blur { enabled = true } }` in
     `hyprland.conf`; transparent windows get blurred.

Without a compositor, transparency gives a black background: leave the
preference at `false`, and the mod paints the material solid.

On macOS, the mod tints the window's transparent background with the same
values as transparent Linux.

## Without hardware acceleration

With software rendering, Zen marks the window `zen-no-acrylic` and CSS blur
does not work. Acrylic surfaces (menus, panels, split view header, Glance
buttons) then take WinUI's solid fallback color, as with "Reduce transparency",
and the Acrylic noise goes away. What floats over the page (open URL bar,
compact sidebar's Acrylic background) is always solid.
