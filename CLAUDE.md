# Zen Fluent

Sine mods for Zen Browser 1.23+: Mica, Mica Alt, Acrylic and WinUI 3 controls,
or the Microsoft Edge look (`zen-fluent.style`). Two mods in one repository:
**Zen Fluent** (`core/`, CSS only) and **Zen Fluent Enhanced** (`enhanced/`,
JavaScript, one script per feature). The project is public: **English first**
(code, comments, docs, settings labels); a French translation of the docs may
come later. The owner writes to Claude in French: answer in French.

## Layout

- `theme.json` (root) is Zen Fluent's manifest (id `Zen-Fluent`); its paths point
  into `core/`. Sine installs it from the repository root (whole repository).
- `core/chrome.css` and `core/userContent.css` `@import` the files of `core/src/`
  **in cascade order**: moving an import can change which rule wins a tie.
- `core/src/tokens/`: every `--zf-*` value (`light-dark()` pairs), accent, radii,
  fonts. Other files only read these variables (component-local `--zf-*` exist,
  e.g. `--zf-url-*` on `#urlbar`).
- `core/src/base/`, `core/src/components/<zone>/`, `core/src/features/<pref>.css`
  (one file per option), `core/src/content/` (about: pages, Zen and Sine settings,
  web page scrolling; loaded by `core/userContent.css`).
- `core/preferences.json`: Sine settings, prefix `zen-fluent.*`, ASCII values
  without spaces (Sine rejects them), `"placeholder": false` on every dropdown.
  Collapsible groups: each group starts with a `zen-fluent.ui.open-<group>`
  checkbox (SettingsExpander header); a new group = a header + a line in the
  hiding rule of `core/src/content/sine/settings-groups.css` + an icon in
  `core/src/content/sine/group-icons.css`. A conditional row must not end a group
  (the bottom corners go to the last row). The "Zen settings" group exposes Zen /
  Firefox preferences (Zen's defaults; Sine only writes `defaultValue` when the
  preference does not exist).
- `core/icons/`: SVGs with `stroke="context-fill"`. `screenshots/`: README images.
- `enhanced/`: `theme.json` (id `Zen-Fluent-Enhanced`, `modules` = Zen Fluent's
  exact homepage), `chrome.css`, `scripts/` (rules in `enhanced/scripts/README.md`).
  Installed from `…/tree/main/enhanced`. Preferences `zen-fluent.enhanced.*`.
- `components.json`: manifest for the future `.exe` installer
  (`installer/README.md`). `docs/`: installation, `docs/settings/<group>.md`,
  Enhanced, contributing.

## Conventions

- Before each commit: `npm run lint` (prettier + stylelint) and `npm run check`.
  `npm run lint:fix` fixes the format. Python on Windows writes CRLF: run
  prettier after scripted edits.
- Every CSS file starts with `/* Zen Fluent: <subject>.` and the line
  `User sheet: declarations take !important to win over Zen's own CSS.` (the
  check enforces it). The mod is loaded as a **user** sheet: a declaration
  without `!important` loses to Zen's CSS, variables included. Put `!important`
  wherever we override Zen; comment it only when the reason is different.
- Every setting goes through `@media (-moz-pref("zen-fluent.xxx", "value"))`.
- Names: `--zf-*`, `zf-` for ids, classes, attributes, keyframes.
- A new setting: `core/preferences.json`, its CSS, a README row with its default
  (checked), and `docs/settings/<group>.md`. A change: a `CHANGELOG.md` entry
  under **Unreleased**. Release: `npm run release -- X.Y.Z`, then tag `vX.Y.Z`.
- Code taken from another project keeps its licence notice:
  `THIRD-PARTY-NOTICES.md` plus a line in the file header. Nebula is GPL-3.0:
  never copy from it.

## Decisions (2026-10-29)

- Keep the `zen-fluent.*` prefix (the mission asked `zenfluent.*`; refused to
  keep users' values). Mod ids unchanged.
- Root `theme.json` for Zen Fluent rather than one inside `core/`: existing
  installs update without migration, and only Enhanced uses Sine's shared
  `sine-mods/temp` folder.
- `@import` rather than a build: Sine resolves relative imports; `npm run check`
  replaces the "built file is stale" check.
- MIT licence with third-party notices; git history left untouched (the first
  commit holds 8 lines close to Nebula, removed since).
- No fx-autoconfig: Sine ships its own loader (a fork of fx-autoconfig 0.10.7)
  that writes the same files.

## Sine 2.3 (read in its code, local 2.3.4.1c = `main` fb0bd4c)

- Install and update always download the whole repository zip. With two
  `theme.json` in the repository and a `/tree/<branch>/<folder>` URL, Sine keeps
  only that folder and strips the prefix from `style` and `preferences`, never
  from `scripts` keys. `user/repo/folder` (without `/tree/`) fails.
- Entry points are found by name: files ending in `chrome.css` /
  `userChrome.css`, `userContent.css`, `preferences.json`; on a tie the
  `theme.json` path wins. No file under `src/` may end in those names.
- Updates only compare `updatedAt` (full ISO time; `version` is ignored), fetched
  from the `theme.json` at the stored `homepage`.
- Mod CSS is `@import`ed into `sine-mods/chrome.css` / `content.css` in sorted
  id order (`Zen-Fluent` before `Zen-Fluent-Enhanced`, and before every
  lowercase id).
- JavaScript: `scripts` map with `include`; scripts from a mod outside the store
  only run with `sine.allow-unsafe-js`. No per-script toggle (scripts follow the
  mod), and every JS rebuild runs the scripts again: guard and clean up.
- `modules` (homepages) installs missing dependencies; no version constraint.

## What Zen 1.23 really does (checked in the browser)

- The selected tab has `selected=""` (empty): target `[selected]`, never
  `[selected="true"]`.
- Zen writes `--zen-main-browser-background*` inline on every
  `.zen-browser-generic-background`: override them on those elements, not only
  `:root`.
- A Glance tab is nested in its parent tab: target
  `.tabbrowser-tab > .tab-stack > .tab-background`, not any descendant.
- Pinned extensions (single toolbar): `#zen-overflow-extensions-list`, under the
  URL bar. The old `#TabsToolbar-customization-target` technique no longer works.
- Mod icons (`core/icons/`, `stroke="context-fill"`): invisible without
  `svg.context-properties.content.enabled` (files outside `chrome://`); every
  icon override is in `core/src/features/fluent-icons/`, behind that preference
  and `zen-fluent.fluent-icons`. Library: animated sprite `.zen-library-sprite`;
  workspaces: `img.zen-workspace-icon[src$="/selectable/<name>.svg"]` (replaced
  with `content: url()`); folders: inline SVG in `.tab-group-folder-icon`.
- Sine `string` setting: Sine sets `--<preference with dashes>` on `:root` of
  chrome windows only (not in `about:` pages); type the value with `@property`
  so an invalid entry has a fallback. Each rebuild adds an adopted sheet without
  removing the old ones: a cleared preference keeps its last variable until a
  restart (in tests, filter `document.adoptedStyleSheets`).
- **User** sheets apply inside Shadow DOM (simple selector on the inner element);
  `::part()` does not match from them.
- Sine: its content sheet is not injected into web pages (actor
  `SineUserContent` refused for `webIsolated`), only into `about:` pages.
- Sine 2.3: card `.sineItem`, settings in `dialog.sineItemPreferenceDialog`
  (separator = `vbox:has(> hr)` + `.separator-label`, `hbox` rows,
  `.sineItemPreferenceCheckbox` checkboxes). Zen panes:
  `groupbox[data-category^="paneZen"]`.
- Sine row: `id` = property with dots turned into dashes (case kept),
  `tooltiptext` = property. `~…~` in a label becomes `<u>` (grey description).
  `"placeholder": false` drops the "None" item (value `""`) from dropdowns.
  Space on a Sine checkbox is never saved (Sine only listens to `click` on the
  `hbox`): the inner checkbox changes alone, hence a group opened for the
  session. The dialog is built when the page loads (reload `about:preferences`
  to read `core/preferences.json` again; changing `#` is not enough).
- `-moz-pref()` works live in `about:preferences`, also for a Firefox preference
  (`browser.tabs.hoverPreview.enabled`). `-moz-pref(name, false)` only matches an
  explicit `false`: a setting on by default reads `not (-moz-pref(name, false))`.
- Firefox does not blur web content behind a `backdrop-filter`: an Acrylic
  surface over the page shows it sharp. Everything that floats over the page
  (open URL bar, compact sidebar and top bar, find bar, dialogs) takes
  `--zf-acrylic-over-page` (solid color).
- Compact mode, single toolbar: the collapsed `#zen-appcontent-navbar-wrapper`
  is 8px above the page; the mod makes it `position: absolute` (invisible hover
  zone) and cancels the margin Zen adds with `has-toolbar-hovered`
  (`core/src/base/compact-mode.css`).
- Sine only applies a setting's `conditions` on the first preference change, not
  when the dialog opens (`setupPrefObserver` runs before the row is in the
  page): hide the row in CSS (`core/src/content/sine/settings-groups.css`,
  `@media not (-moz-pref(...))`).
- Tokens are also declared on `tooltip`: the document's default tooltip
  (`tooltiptext`, `title=`) is native anonymous content, outside `:root`.
- Firefox sidebar (Ctrl+B, history): its pages are chrome documents that get
  Sine's chrome sheet; lists are XUL trees (`tree`).
- Zen sets `breakout-extend` on focus (bar opened in place): the accent line
  follows `[focused]` and `[breakout-extend]`.
- The Library never covers the page, except 8px in compact mode with WinUI
  corners (4px in Edge): `core/src/components/library/compact-mode.css` clips
  that band, and the page gets the clicks there.
- Firefox 158 reads `--toolbarbutton-background-color-hover` / `-active`, not
  `--toolbarbutton-hover-background`; `--toolbarbutton-icon-size` is resolved on
  `:root` (compute a width on the button itself).
- Edge style: `core/src/base/corner-shape.css` sets `corner-shape: round`
  everywhere under `zen-fluent.style` = `edge`; page card 4px away, radius 8,
  1px hairline.
- `#remote-control-box` (robot in the URL bar) = remote control indicator
  (Marionette, WebDriver), not a mod bug.
- Accent text selection (`core/src/features/accent-selection-browser.css`) only
  reaches chrome documents; `core/src/content/accent-selection.css` does it for
  `about:` pages, except `about:blank` / `about:srcdoc` (web page frames, text
  editors): `regexp()`, because `url-prefix("about:")` includes them.
- `zen.theme.acrylic-sidebar` / `acrylic-urlbar` (transparent background + blur):
  cancelled by the mod's user `!important` (checked).
- Folder icon: variables `--zen-folder-stroke`, `--zen-folder-front-bgcolor`,
  `--zen-folder-behind-bgcolor`.
- Media card: `.zen-media-card` (only created when audible media plays). Zen
  hides it (`hidden`) while the video is in Picture-in-Picture.
- Zen sets `corner-shape: superellipse(2.3)` on every element (Windows): a 50 %
  radius gives a rounded square. `core/src/base/corner-shape.css` sets `round`
  back (WinUI) and on circles / pills; add any new round element there.
- Caption buttons: Segoe Fluent Icons glyph in `::before`, not
  `.toolbarbutton-icon`. With a single toolbar they only show when hovering the
  top of the page (`zen-has-hover` on `#zen-appcontent-navbar-wrapper`).
- `about:preferences` (Firefox 158): `moz-*` web components with Shadow DOM, no
  `part`. Global tokens (`--button-*`, `--card-*`, `--border-radius-*`,
  `--color-accent-primary`) on `:root`; a component's tokens
  (`--page-nav-button-*`, `--box-*`, `--toggle-*`, `--select-*`) on its `:host`,
  so override them on the element itself.
- Menus: tokens `--panel-menuitem-*`, `--panel-separator-*` (panels) and
  `--menuitem-padding-block` / `-inline` (context menus).
- New tab: `zen.urlbar.replace-newtab` (default) opens the floating bar on an
  empty page; `about:home` uses `content-search-handoff-ui`.
- Picture-in-Picture: `#controls .control-button` for the buttons; `#timestamp`,
  `#controls-bottom-gradient` and the sliders are `.control-item` too.
- Zen's source (`zen-browser/desktop`, `src/zen`) is the reference for
  selectors.

## Tests

Final campaign on 2026-10-28 on Windows 11 (26 checks out of 26, README
screenshots retaken). After a new feature: lint, check, then a check in Zen (live
editing: Ctrl+Shift+Alt+I › Style Editor) and, before a release, run the
campaign again.

Method: Zen driven by Marionette (`--marionette --remote-allow-system-access`),
each value of each setting applied live then checked on the computed style **of
the element on screen** (not its container), console filtered on CSS errors,
screenshots in `screenshots/` with no local paths visible (serve pages under
real addresses). Never send keys or clicks to the owner's desktop: run Zen with
`--headless` unless a real-desktop capture is needed.

On Windows (installed Zen Twilight stayed at 1.21t): `zen.exe` 1.23 with
`-no-remote -profile <test profile>`, Sine copied from an existing profile
(`chrome/utils`, `chrome/JS`), the repository as a junction
`chrome/sine-mods/Zen-Fluent` and declared in `sine-mods/mods.json` (style
`core/chrome.css` / `core/userContent.css`); Enhanced as a junction to
`enhanced/` under `Zen-Fluent-Enhanced`. Hot reload:
`ChromeUtils.clearResourceCache()` then `windowUtils.removeSheet` / `loadSheet`
of `chrome://sine/content/chrome.css`. A refactor that must not change the look:
compare computed-style hashes of every element (chrome and `about:preferences`)
before and after, on several settings variants; two identical runs differ on
about 85 elements (context menus, search field), and `blob:` URLs change each
session. Mica does not show in Marionette screenshots: capture the screen
(`CopyFromScreen`, DPI-aware process). Chrome and user sheets report no CSS
error to the console: validate values with stylelint
(`declaration-property-value-no-unknown`). Glance only opens with a real click
(synthetic Alt+click through WebDriver actions); `openGlance()` from a script
stays stuck. Screenshots fail while the Windows session is locked (`LogonUI`).
Marionette ends the running script when a content prompt opens: load the code
in the window (`loadSubScript`, timers) and read the result afterwards. Sine's
dialog dropdowns open and pick through a WebDriver click (`content` context).
`windowUtils.sendMouseEvent` no longer exists (Firefox 158). The
`about:preferences` tab must be in front (otherwise no layout); it reloads on
`#sync`: `gotoPref("paneSineMods")`. Marionette's default script timeout is
30 s: raise it with `WebDriver:SetTimeouts` for long scripts.

## To do

- Check the install from GitHub with Sine for both mods (root URL and
  `…/tree/<branch>/enhanced`), which needs a pushed branch.
- Run the campaign again on the Windows 11 desktop for the Edge / Mica Alt / new
  settings batch: compare by eye the opaque Mica Alt color of surfaces over the
  page, the "From the button" animation with Mica menus, the context menu
  command bar.
- Retake `screenshots/sine.png` (English labels, collapsible groups) and add an
  Edge style screenshot.
- Guard the selected tab pill and the settings group chevron with
  `prefers-reduced-motion`.
- Mission order next: WinUI ProgressBar for Zen's loading bar, density, then the
  rest of P1–P5.
