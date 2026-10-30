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
  web page scrolling; loaded by `core/userContent.css`), `core/src/a11y/`
  (contrast themes, reduced motion; one forced-colors file per zone).
- Zones (`docs/settings/zones.md`): the import of a zone's file carries
  `not (-moz-pref("zen-fluent.fluent-<zone>", false))`, its a11y file included.
  Tokens, base plumbing, keyframes and global options are imported without a
  condition; `core/src/base/corner-shape.css` stays global (one `*` rule).
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
- String settings: Sine rebuilds their `:root` variables when the preference
  changes through its dialog, not when a script sets it (in tests, set the
  variable too).

## What Zen 1.23 really does (checked in the browser)

- The selected tab has `selected=""` (empty): target `[selected]`, never
  `[selected="true"]`.
- Zen writes `--zen-main-browser-background*` inline on every
  `.zen-browser-generic-background`: override them on those elements, not only
  `:root`.
- A Glance tab is nested in its parent tab: target
  `.tabbrowser-tab > .tab-stack > .tab-background`, not any descendant.
- Pinned extensions (single toolbar): `#zen-overflow-extensions-list`, under the
  URL bar. The old `#TabsToolbar-customization-target` technique no longer works:
  extensions placed in `TabsToolbar` (Arc 2.0, Nebula) stack one per row in the
  tab area; unpin then pin them (the panel's Pin to Toolbar puts them in
  `nav-bar`). Zen 1.24b (CustomizableUI `getOverflowInfo`): the list only gets
  them when (URL bar icons + extensions) x 26px exceed
  `zen.view.overflow-webext-toolbar-threshold` (55) % of `#urlbar-container`'s
  width; below that they sit before `#page-action-buttons` in the URL bar.
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
  `::part()`, `:host()` and `:host-context()` never match from them. To scope a
  rule to one component, key it on a marker inside its shadow root (e.g.
  `link[href$="/infobar.css"] ~ .container` for `notification-message`), or set
  a custom property on the host and test it with `@container style(--x: v)`.
- `notification-message`: Firefox slides bars with an inline `margin-top` and
  removes a closed bar on its `transitionend`: never set `margin-top` or
  `opacity` with `!important` on the bar. `PRIORITY_SYSTEM` bars have no
  `.icon-container`. The tab's stack and the global one (`#notifications-toolbar`)
  float at the same spot. `moz-button type=split` needs `display: grid` on the
  host, or its two parts take half each.
- `.tab-audio-button` (moz-button) paints its icon on the inner
  `.button-background`; `.tab-icon-overlay` shows in the collapsed sidebar and
  on Essentials. Every Essential gets `zenDefaultUserContextId`. Zen's
  `.tab-background` is `row-reverse`: Firefox's `.tab-context-line` sits at the
  end edge. `tab[zen-empty-tab]` is also the window's blank new tab. A folder
  collapses by animating `.zen-tab-group-start`'s `margin-top`: a child needs
  `display: flow-root` so its margin does not collapse through it.
- An `!important` value on an animated property stops the animation (user
  `!important` beats animations).
- The Library renders in light DOM; its Spaces cards copy the tab strip under a
  second `id="tabbrowser-tabs"`. Context menu rows hover with `-moz-menuhover`,
  not the `--panel-item-*` tokens.
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
- `-moz-pref()` also works in the media list of an `@import` in the user sheet
  (Gecko 158): the imported sheet drops out or comes back live, in every chrome
  document (dialogs, Firefox sidebar pages) and in `about:` pages. `@import`
  cannot sit inside `@media`, so each file carries its own condition.
- Firefox 158 supports `sign()` and typed arithmetic (length / length gives a
  number) in chrome CSS.
- Firefox 159 refuses any percentage in a `<number>` context (`50% / 1%`,
  `sign(50%)`): `progress(p, -100%, 100%)` in a `<length-percentage>`
  registered property turns it into a length, then length / 1px a number.
  `progress()` is clamped to 0..1. Relative color syntax works
  (`oklch(from c clamp(0, (0.7 - l) * 1000, 1) 0 0deg)` = black or white).
- `-moz-pref(name, "v")` is false while the pref does not exist: write a
  condition as the list of the other values, never `not (-moz-pref(name, v))`
  for a non-default look.
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
  Headless on 2026-10-29, that tooltip (`tooltip[default][page]`) matched only
  `xul.css` rules (4px, padding 2px 3px): check on the real desktop whether the
  tokens and `tooltips/box.css` reach it.
- With Mica popups (Windows 11) the CSS radius of `menupopup` / `panel` and their
  content is 0: Windows draws the corners, so the radius settings do not reach
  them; `--panel-border-radius` only matters without Mica popups.
- The visible New Tab row is a second `#tabs-newtab-button`, in each
  `zen-workspace`'s `#tabbrowser-arrowscrollbox-periphery`; the one under
  `#TabsToolbar` stays hidden, and `getElementById` returns it. The row paints
  its hover fill on itself, not on its 16px icon box.
- A toolbarbutton's `::after` takes `content: url()` and inherits
  `-moz-context-properties`: a context-fill glyph drawn there matches the real
  icon pixel for pixel (animated icons turn that copy).
- Zen plays the Library sprite on hover (`zen-library-sprite-hover`, 0.35s,
  `steps(36)`) and turns the space chevron (`transform 0.1s`) when the pinned
  tabs fold away (`zen-workspace[collapsedpinnedtabs]`).
- Firefox sidebar (Ctrl+B, history): its pages are chrome documents that get
  Sine's chrome sheet; lists are XUL trees (`tree`).
- Loading bar: `hbox#zen-loading-progress-bar` is the first child of the selected
  tab's `.browserSidebarContainer` (positioned, `overflow: clip`, the page
  corners), only while that tab is `[busy]`; Zen fades it by script and sets
  `[long-load]` after 3 s. A Glance tab is never `[busy]`: no bar there. Only the
  focused split pane has `.deck-selected`.
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
- Zen 1.24b (Gecko 159, checked 2026-10-30 against its omni.ja): of the
  mod's ~700 selector tokens only `#zen-site-data-boost` (Boost moved to the
  site panel's quick action tiles, `#zen-site-data-header-boost`; reader view
  moved to the footer, `#zen-site-data-reader-mode`) and
  `#zenSpaceRoutingDialog` (Space Routing is now a Library section,
  `.zen-library-routing-*`) are gone. New UI: Boost sharing (`.zbs-*`), the
  space's scroll-to-tab button (`.zen-workspace-scroll-to-tab`), `.ghost`
  buttons.
- Essentials: Zen's favicon glow is `.tab-background::after` (inset -50%,
  blur 20px) clipped by `overflow` on `.tab-background`; the mod clips with
  `overflow: clip`. `--zen-primary-color` (on `:root`) is the accent Zen
  derives from the current space's theme.
- Single toolbar: `#zen-overflow-extensions-list` is the first child of
  `#titlebar` (flex column) before `#TabsToolbar`, which holds the Essentials,
  the tabs and `#zen-sidebar-foot-buttons`: `order` can put the row at the
  very bottom, not between the Essentials and the tabs.

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
of `chrome://sine/content/chrome.css`. At startup the first window can keep the
previous session's aggregated sheet even though Sine rewrote it: reload it that
way and check `--zf-accent` on `:root` before trusting a test. A refactor that
must not change the look: compare the flattened declarations (selector chain,
property, value) of both versions, then A/B in **one** instance (remove Sine's
sheet, `loadSheet` one entry file, snapshot every element's computed style,
swap, repeat twice to measure noise). Compare properties by name: enumerating a
computed style stops at `length`, so removing a token drops other `--zf-*`
names from the tail. Two identical runs differ on about 85 elements (context
menus, search field), `blob:` URLs change each session, and custom property
values keep their source line breaks. Mica does not show in Marionette screenshots: capture the screen
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
30 s: raise it with `WebDriver:SetTimeouts` for long scripts. Async scripts get
the resolve callback as their last argument (`resolve` is reserved). Panels and
popups are separate widgets, missing from window screenshots: clone their content
into the window to look at them. `ui.useAccessibilityTheme = 1` emulates forced
colors headless, `ui.prefersReducedMotion = 1` reduced motion. Marionette
dismisses user prompts (`commonDialog`) before every command: to test a dialog,
open a SubDialog that is not a prompt (`Sanitizer.showUI(window)`). Computed
style enumeration also leaves out some registered custom properties
(`--zf-accent-custom`), which `getPropertyValue()` still returns.
Firefox 158 has `InspectorUtils.getMatchingCSSRules`. Since Zen 1.24b
(installed 2026-10-29), the chrome context also needs the environment variable
`MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1`: the `--remote-allow-system-access` flag
alone is refused ("System access is required").
A tab left loading blocks the next Marionette session ("active session"):
call `gBrowser.selectedBrowser.stop()` before a script ends. To try a CSS fix
live, empty the child sheet with `deleteRule` and `loadSheet` the patched copy
(`CSSStyleSheet.disabled` has no effect on an `@import` child).
`WebDriver:TakeScreenshot` ends a page load in progress, and `drawSnapshot`
paints remote pages over the chrome: to picture an overlay of a loading page,
build it on a static page. A slow local page (a server that sends a chunk, then
waits) keeps a tab `[busy]`. Several agents can test at once: one headless
instance each, its own profile and Marionette port.

## To do

- Check the install from GitHub with Sine for both mods (root URL and
  `…/tree/<branch>/enhanced`), which needs a pushed branch.
- Run the campaign again on the Windows 11 desktop for the Edge / Mica Alt / new
  settings batch: compare by eye the opaque Mica Alt color of surfaces over the
  page, the "From the button" animation with Mica menus, the context menu
  command bar.
- On the real desktop (headless has no Mica): prompts with Mica popups, Mica
  behind notification bars, toasts, dimmed and tinted tab rows; the Ctrl+Tab
  shadow and corners; sound bars at 125 / 150 % DPI; the Second Sidebar panel and
  Calmer's accent menus.
- Retake `screenshots/sine.png` (English labels, collapsible groups) and add an
  Edge style screenshot.
- Density: the text box URL bar keeps Zen's height in compact (Zen writes
  `--urlbar-height` inline and sizes its container itself); only the pill
  follows `--zf-size-url-field`.
- Not checked live yet: right-to-left (animated Back / Forward / Reload), a
  real Windows contrast theme (only `ui.useAccessibilityTheme` emulation),
  Picture-in-Picture, Glance, the media card and `about:addons` /
  `about:config` in contrast mode, the blur values on the real desktop.
- Mission next: Mica tint opacity (P2; it clashes with the tint intensity
  setting dropped earlier: the owner decides), then Zen Fluent Enhanced (P4).
