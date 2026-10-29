# Contributing

## Layout

```
theme.json               Zen Fluent's Sine manifest (id Zen-Fluent), points into core/
core/
  chrome.css             @import of the chrome files, in cascade order
  userContent.css        @import of the internal-page files
  preferences.json       Sine settings
  icons/                 Fluent stroke icons (stroke="context-fill")
  src/
    tokens/              --zf-* values (light-dark() pairs), accent, radii, fonts
    base/                window-wide plumbing: type, corner shape, window coat
    components/<zone>/   the default look of each zone
    features/            one file per option (features/<pref>.css)
    content/             about: pages, Zen and Sine settings
    compat/              rules for third-party mods (docs/compatibility.md)
enhanced/                Zen Fluent Enhanced (id Zen-Fluent-Enhanced)
  theme.json · chrome.css · scripts/
components.json          manifest for the future installer (installer/README.md)
scripts/                 check.mjs, release.mjs
docs/
```

Sine installs Zen Fluent from the repository root (the whole repository) and
Enhanced from `tree/main/enhanced` (only that folder). Sine detects entry
points by name: no file under `src/` may end in `chrome.css` or
`userContent.css`.

## Rules

- **Import order is the cascade order.** `core/chrome.css` lists the files in
  the order their rules must apply; moving an import can change which rule wins
  a tie. Add a file next to the ones it overrides.
- **One subject per file**, starting with this header:

  ```css
  /* Zen Fluent: <subject>.
     User sheet: declarations take !important to win over Zen's own CSS. */
  ```

  Sine loads the mod as a user sheet: a declaration without `!important` loses
  to Zen's CSS, variables included. The header line is the justification for
  every `!important` in the file; add a comment only when `!important` is there
  for another reason.

- **Zones**: the import of a zone’s file in `core/chrome.css` (or
  `core/userContent.css`) carries `not (-moz-pref("zen-fluent.fluent-<zone>", false))`;
  tokens, base plumbing and global options are imported without a condition
  ([zones](settings/zones.md)). Prettier wraps a conditioned import.
- **Compat rules**: one file per mod in `core/src/compat/`, imported last.
  They only match what the mod adds and need no setting.
- **Names**: preferences `zen-fluent.*` (Enhanced: `zen-fluent.enhanced.*`),
  variables `--zf-*`, ids, classes, attributes and keyframes `zf-`.
- **Every setting** goes through `@media (-moz-pref("zen-fluent.xxx", "value"))`.
  A setting that is on by default reads `not (-moz-pref(name, false))`.
- Code comments in English; docs in English first.
- Zen's source ([zen-browser/desktop](https://github.com/zen-browser/desktop),
  `src/zen`) is the reference for selectors; check them live (Ctrl+Shift+Alt+I ›
  Style Editor) before relying on them.

## Adding a setting

1. A row in `core/preferences.json`: ASCII values without spaces (Sine rejects
   them), `"placeholder": false` on every dropdown.
2. The CSS, in `core/src/features/<pref>.css` when it is a separate block.
3. A row in the README settings table with its default, and in
   `docs/settings/<group>.md`.

Collapsible groups: each group starts with a `zen-fluent.ui.open-<group>`
checkbox (the header). A new group needs a header, a line in the hiding rule
of `core/src/content/sine/settings-groups.css` and an icon in
`core/src/content/sine/group-icons.css`. A conditional row must not end a group
(the bottom corners go to the last row). Sine only applies a row's
`conditions` after the first preference change, so hide conditional rows in
CSS too.

## Checks

```sh
npm install
npm run lint       # prettier + stylelint
npm run lint:fix
npm run check      # imports, urls, headers, manifests, settings, docs, versions
```

CI runs `lint` and `check` on every push.

## Testing in Zen

Zen driven by Marionette (`--marionette --remote-allow-system-access`) on a test
profile with Sine copied from an existing profile and the repository linked
into `chrome/sine-mods/Zen-Fluent` (a junction), declared in
`sine-mods/mods.json`. Apply each value of each setting live, then check the
computed style of the element on screen (not its container). Chrome and user
sheets report no CSS errors to the console: stylelint validates the values.

## Release

```sh
npm run release -- 0.2.0
```

It sets the version in `package.json`, both `theme.json` and
`components.json`, stamps `updatedAt` (Sine only updates a mod when that date
grows) and turns the CHANGELOG's **Unreleased** section into the release. Then
commit, tag `v0.2.0` and push.
