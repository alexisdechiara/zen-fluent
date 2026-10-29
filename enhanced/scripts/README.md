# Zen Fluent Enhanced scripts

One feature = one `<name>.uc.js` file, declared in `enhanced/theme.json`:

```json
"scripts": {
  "scripts/<name>.uc.js": { "include": ["chrome://browser/content/browser.xhtml"] }
}
```

Rules (Sine 2.3, checked in its code):

- Sine has no per-script switch: each script reads and observes its own
  `zen-fluent.enhanced.<name>` preference (a checkbox in
  `enhanced/preferences.json`), stops cleanly when it turns `false` and starts
  again when it comes back.
- Sine runs every script of a mod again when a mod is installed, enabled or
  updated, so a script must survive running twice. All the code goes in a
  `{ … }` block (no global `let` / `const`), and clean-up goes through
  `window.addUnloadListener(…)`.
- Elements, classes and attributes the scripts add are prefixed `zf-`.
- Styles for the added elements go in `enhanced/src/<name>.css`, imported by
  `enhanced/chrome.css`. Anything CSS can do stays in Zen Fluent.
- JavaScript from a mod installed from GitHub only runs when
  `sine.allow-unsafe-js` is `true` (Sine's "JS from unofficial sources"
  checkbox), unless the mod comes from the Sine store.
