# Installer (later)

A `.exe` where you pick the components. It will read `components.json` at the
root of the repository. Nothing is written yet.

## What the installer will do

1. Close Zen, find its install folder and the profile
   (`%APPDATA%\zen\profiles.ini`).
2. Install Sine from its release (loader in Zen's folder, engine in the
   profile), then clear the profile's `startupCache`. Never install
   fx-autoconfig as well: it writes the same files.
3. Install the chosen mods the way Sine does: the mod's files in
   `chrome/sine-mods/<id>/`, an entry in `chrome/sine-mods/mods.json`
   (`theme.json` fields, `style` / `preferences` paths relative to the mod
   folder, `enabled: true`, `"no-updates": false`, the installed version's
   `updatedAt`). Never write `"origin": "store"` for a mod that does not come
   from the store: that is Sine's safety check for JavaScript. The simplest path
   is to let Sine install the mod (Import button, or `installMod`).
4. Set the `prefs` (in `user.js` or through Sine). Ask before setting
   `sine.allow-unsafe-js`.
5. On Windows 11, offer Mica For Everyone and its `zen` rule.
6. Offer third-party mods: downloaded from their authors, never bundled.

## `components.json`

| Field       | Meaning                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| `id`        | Component id in the manifest.                                               |
| `kind`      | `loader`, `system`, `mod` (Zen Fluent) or `third-party`.                    |
| `required`  | Always installed.                                                           |
| `optional`  | Offered; checked or not by default is the installer's call.                 |
| `install`   | `false`: listed for information, never installed.                           |
| `offer`     | `false` (conflicts, not offered) or `"link"` (link only).                   |
| `os`        | Systems it applies to.                                                      |
| `version`   | Version of our mods, equal to their `theme.json` (`npm run check`).         |
| `tested`    | Version of an external component tested with Zen Fluent.                    |
| `source`    | `github-release`, `github`, `sine` (repository) or `sine-store` (store id). |
| `requires`  | Components to install first.                                                |
| `conflicts` | Components that cannot be installed together.                               |
| `prefs`     | Preferences to set.                                                         |
| `js`        | The mod has JavaScript (needs `sine.allow-unsafe-js` outside the store).    |
| `compat`    | `ok`, `needs-rules`, `partial`, `untested` or `conflict` with Zen Fluent.   |
| `notes`     | Details.                                                                    |
