# Zen Fluent

The CSS-only mod: install it with Sine and set everything from its settings.
No JavaScript, no fx-autoconfig.

## What it styles

Built for Zen 1.23 (tested with 1.23.4b on Windows 11 and Linux):

- the window: Mica, Mica Alt or Acrylic, the page card, caption buttons;
- the sidebar: tabs, folders, Essentials, workspaces, toolbar buttons, pinned
  extensions, compact mode;
- the URL bar and its results, the find bar, the split view and Glance;
- the media card and the Picture-in-Picture player;
- the Library, Firefox's sidebar (bookmarks, history, synced tabs);
- menus, panels (site panel, permissions, tracking protection, downloads,
  extensions), dialogs, tooltips, the tab preview;
- notifications: site and global notification bars (WinUI InfoBars),
  permission prompts (a TeachingTip), Zen’s toasts;
- internal pages: `about:preferences` (Zen's and Sine's panes, the mod's own
  settings), `about:addons`, `about:config`, the new tab page.

Colors are `light-dark()` pairs: light or dark follows `zen.view.window.scheme`.
The accent is derived with `color-mix()` (+45 % white in dark, +15 % black in
light).

Settings: [docs/settings/](settings/). Install: [installation.md](installation.md).

## Edge style

**Interface style** › **Microsoft Edge (Fluent 2)** takes Edge's geometry:

- the page is a card 4 px from the sidebar, the window edge and the bottom,
  with 8 px corners and a hairline;
- 36 px tabs with 8 px corners, the selected tab raised (fill and shadow), no
  accent pill;
- 32 px buttons 4 px apart, Essentials with 12 px corners, a round close button,
  a raised media card;
- a pill URL bar (at rest, open and floating);
- menus and panels at 12 px, items at 8 px, Fluent 2 shadows; tooltips at 8 px.

Corners are true arcs, and **Corners and gaps** does not apply.

## Known limits

- The robot icon in the URL bar (`#remote-control-box`) only shows when the
  browser is remote-controlled (Marionette, WebDriver): it is not the mod.
- Upgrading from an early version: "Pill bar", "Transparent bar" and "Aptos
  font" were replaced by **URL bar shape** and **Font**; their old values are
  not carried over, set them again.
- Two animations ignore `prefers-reduced-motion`: the selected tab pill and the
  settings groups' chevron.
- Other mods: [compatibility.md](compatibility.md) lists those that need Zen
  Fluent’s compat rules (included) and those that conflict with it.
