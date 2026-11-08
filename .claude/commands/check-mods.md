---
description: Check every mod of compatible-mods.json against this Zen Fluent, in a headless Zen
---

Check every mod listed in `enhanced/settings/compatible-mods.json` against the
current Zen Fluent and Zen Fluent Enhanced, then update the list and the docs.
$ARGUMENTS narrows it to some mods (ids) when given.

Follow CLAUDE.md (Tests: headless Zen driven by Marionette, never input on the
owner's desktop; Mods: the welcome screens to skip, the sheet order).

1. `npm run check:mods`: the mods' latest versions against `tested`, the
   Featured ones first, and active Vertex Mods repositories missing from the
   list. Add those to the list (status from the check below).
2. A throwaway test profile with Sine and both mods of this checkout
   (junctions), then install every listed mod through Sine's manager
   (`installMod(<GitHub URL>, "github", false)`, then `rebuildMods()`), and
   restart Zen. Set the welcome-screen prefs of BetterZenGradientPicker and
   ZenLibraryTweaks, and `zen-fluent.enhanced.welcome.seen`.
3. For each mod, Featured first: read its CSS and the elements its scripts
   create (clone its repository; never run it outside the test Zen), open its
   UI in the test Zen, and compare with Zen Fluent: computed styles of the
   elements on screen, screenshots (panels: clone their content into the
   window). Console errors from `sine-mods` too.
4. Conflicts: fix them in Zen Fluent (`core/src/compat/<mod>.css`, imported
   at the end of `core/chrome.css` or `core/userContent.css` under the
   zone's condition; Enhanced files when they are Enhanced's). Never edit or
   copy the mod; one without a licence is read, never copied.
5. Update `enhanced/settings/compatible-mods.json`: `tested` (this Zen Fluent
   version and the mod's version), `status`, `summary`, and its French line in
   `enhanced/l10n/fr/strings.json`; `featured` only names supported mods.
   Then `docs/compatibility.md` (table, section, checked versions) and a
   `CHANGELOG.md` entry.
6. `npm run lint` and `npm run check`, then report: each mod with its verdict,
   what was fixed, and what only the real desktop can show (Mica, panels).
