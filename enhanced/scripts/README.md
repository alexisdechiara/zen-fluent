# Zen Fluent Enhanced scripts

One feature = one `<name>.uc.js` file, declared in `enhanced/theme.json`:

```json
"scripts": {
  "scripts/<name>.uc.js": { "include": ["chrome://browser/content/browser.xhtml"] }
}
```

and one checkbox, `zen-fluent.enhanced.<name>`, in `enhanced/preferences.json`.
A script for another chrome window lists that window instead (the Boost
editor: `chrome://browser/content/zen-components/windows/zen-boost-editor.xhtml`).
`npm run check` enforces both, the header and the two calls below.

## Template

```js
// Zen Fluent Enhanced: <what the feature does>.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const feature = ZFFeature.attach(window, {
    name: "<name>",
    // default: true,  // when the checkbox is on by default
    start(ctx) {
      // Everything added through ctx is undone when the feature stops:
      // ctx.listen(target, type, fn), ctx.observePref(name, fn),
      // ctx.observe(topic, fn), ctx.mutations(target, options, fn),
      // ctx.timeout(fn, ms), ctx.interval(fn, ms),
      // ctx.element(tag, attributes, parent), ctx.attribute(el, "zf-…"),
      // ctx.styleProperty(el, "--zf-…", value), ctx.onCleanup(fn).
    },
    // stop(ctx) { … }  // only for what ctx does not know about
  });

  window.addUnloadListener?.(() => feature.destroy());
}
```

`ZFFeature` (`lib/zf-feature.sys.mjs`) starts the feature when its pref turns
`true` (a missing pref reads as `default`, which must match the checkbox's
`defaultValue`: Sine only writes that value once its settings page is built), stops it when it turns `false` or the window closes, and replaces an
instance left by an earlier run of the script. A failure in `start()` is logged
and undone.

## Shared modules (`lib/`)

- `zf-feature.sys.mjs`: the life cycle above.
- `zf-compact.sys.mjs`: `setCompact(window, value)`, compact mode in one
  window without changing the state the next startup opens in.
- `zf-colors.sys.mjs`: `iconOf(tab)` (the icon Zen shows), `iconColor(window,
url)` (dominant color of an icon, cached per process), `chroma()`, `rgb()`.
- `zf-archive.sys.mjs`: the tab archive file, shared by every window
  (`list`, `add`, `remove`, `prune`, `subscribe`).
- `zf-sheets.sys.mjs`: `useSheet(url, "agent" | "user")`, a sheet for every
  document (web pages included) through the style sheet service; its files
  live in `enhanced/content/` and scope themselves with `@-moz-document`.
- `zf-stats.sys.mjs`: `siteDays(from)`, visits and time on pages per day and
  site, read from Places.
- `zf-toast.sys.mjs`: `showToast(window, text, { action })`, a short message at the bottom
  of the window (`enhanced/src/toast.css`); Zen's own toasts only take its
  Fluent string ids.

Scripts cannot run code in web pages: Firefox refuses a window actor from a
profile mod in web content processes (CLAUDE.md, "Sine 2.3"). Style sheets
can reach them (`zf-sheets.sys.mjs`).

## How Sine 2.3 runs scripts (read in its code)

- `.uc.js` scripts are loaded with `loadSubScript` into every window their
  `include` matches, when the window loads and again whenever Sine rebuilds the
  mod (install, update, enable). Before a rebuild runs a script again, Sine
  calls the callback the script gave to `window.addUnloadListener`; without one
  it takes the script as still loaded and skips it. Disabling or removing the
  mod calls the callbacks too.
- Sine keys that callback on the file that calls `addUnloadListener`: the
  script must call it itself (a shared module would register its own file).
- `.sys.mjs` files declared in `scripts` are imported once at startup and never
  unloaded; `.uc.mjs` files are imported afresh at each rebuild. Zen Fluent
  Enhanced uses neither for features: the shared modules in `lib/` are not
  declared, only imported by the scripts. An ES module is loaded once per
  process: a change to `lib/` reaches the browser after a restart.
- Sine has no per-script switch: hence a checkbox per feature.
- JavaScript from a mod installed from GitHub only runs when
  `sine.allow-unsafe-js` is `true` (Sine's "JS from unofficial sources"
  checkbox), unless the mod comes from the Sine store.

## Rules

- All the code goes in a `{ … }` block: no global `let` / `const`.
- Elements, classes and attributes the scripts add are prefixed `zf-`, style
  properties `--zf-`; preferences `zen-fluent.enhanced.*`.
- Styles for the added elements go in `enhanced/src/<name>.css`, imported by
  `enhanced/chrome.css`. Anything CSS can do stays in Zen Fluent (`core/`),
  which never depends on Enhanced.
- Never run another mod's JavaScript; code taken from one keeps its licence
  notice (`THIRD-PARTY-NOTICES.md`).
