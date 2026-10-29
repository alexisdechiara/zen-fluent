# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow
[Semantic Versioning](https://semver.org/); both mods share one version and one
`vX.Y.Z` tag.

## [Unreleased]

### Changed

- The repository holds two Sine mods: Zen Fluent (`core/`, CSS only) and Zen
  Fluent Enhanced (`enhanced/`, JavaScript, no feature yet). The 21 modules are
  now 188 files with one subject each, imported in the same order: the look
  does not change.
- The project is in English: settings labels, README and docs.
- Grey Essentials icons are desaturated and faded, and fade back in color.
- The Picture-in-Picture player is cut to the overlay radius token (12 px with
  Zen corners or the Edge style).
- Icons moved to `core/icons/`.

### Added

- Page loading bar as a WinUI ProgressBar (`zen-fluent.loading-bar`, default
  `winui`): Zen’s indicator becomes a 3 px indeterminate bar along the top of
  the page.
- Zen Fluent Enhanced, an empty Sine mod that installs Zen Fluent if missing.
- `components.json`, the manifest for the future installer.
- `npm run check` (imports, urls, headers, manifests, settings, docs, versions),
  `npm run release`, and a CI workflow.
- `docs/`: installation, one page per settings group, Enhanced, contributing.
- A default column in the README settings table.
- `THIRD-PARTY-NOTICES.md` for the code taken from Firefox-WinUI and Edge-Frfox.

### Removed

- Two unused tokens, `--zf-acrylic-filter` and `--zf-fill-command`.

## [0.1.0] - 2026-10-26

First version, a single CSS mod:

- Mica, Mica Alt and Acrylic tints over Mica For Everyone, translucent tints on
  Linux and macOS, solid fallbacks without hardware acceleration.
- WinUI 3 tokens and controls, and a Microsoft Edge (Fluent 2) style.
- Sidebar, tabs, folders, Essentials, workspaces, URL bar, find bar, split view,
  Glance, media card, Picture-in-Picture, Library, Firefox sidebar, menus,
  panels, dialogs, tooltips, tab preview, internal pages.
- Fluent stroke icons, WinUI animations, thin scrollbars.
- About fifty settings in collapsible groups in Sine.
