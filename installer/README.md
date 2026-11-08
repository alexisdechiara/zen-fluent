# Installer

`ZenFluentSetup.exe` installs Sine, Zen Fluent and Zen Fluent Enhanced in a
Zen profile. It is a WinUI 3 application (`installer/winui/`, C#, Windows
App SDK, unpackaged and self-contained, about 63 MB): Mica behind the
window, the title bar drawn in it, settings cards, InfoBars for warnings
and results, the system's light or dark theme and accent, in French when
Windows is. `ZenFluentSetup.ps1` does the same steps without a window
(Windows PowerShell 5.1, for scripts; `-NoGui`).

`.github/workflows/installer.yml` builds both on every push and pull
request that touches this folder (`dotnet publish -c Release -r win-x64
-p:Platform=x64 -p:SourceRef=<branch>`; no SDK needed locally) and attaches
them to each release (`vX.Y.Z` tag). They install the mods from the branch
or tag they were built from. A branch push also publishes them as the
pre-release `installer-<branch>` (replaced at each push): a stable
download link to test a branch.

The window picks with option cards, as Zen's welcome screens do: a card
per installed Zen version (its version, folder, and a warning before Zen
1.23), the chosen version's profile in a select, then Zen Fluent or Zen
Fluent Enhanced side by side. The box allowing scripts of mods outside
Sine's store shows with Enhanced only, and turns red when Install is
clicked without it.

## Signing

The exe is not signed yet: SmartScreen may warn about it (More info › Run
anyway). [SignPath Foundation](https://signpath.org) signs open source
projects for free. Its terms ask for an OSI licence (MIT), builds from this
repository's CI, team roles with multi-factor authentication, a manual
approval of each release, a "Code signing policy" section on the home and
download pages, and an uninstaller for an installer (not written yet).
Once accepted, the repository gets the secret `SIGNPATH_API_TOKEN` and the
variables `SIGNPATH_ORGANIZATION_ID`, `SIGNPATH_PROJECT_SLUG` and
`SIGNPATH_POLICY_SLUG`: the CI then signs the exe
(`signpath/github-action-submit-signing-request`) before publishing it.

## Downloads

Downloads do not use GitHub's API (the latest bootloader comes from
`releases/latest/download`) and are tried five times over about a minute
on 5xx answers and timeouts, then the installer says GitHub may be down.

## What it does

1. Lists the installed editions of Zen with their version (Zen Browser,
   Zen Twilight: `Software\Mozilla\<edition>` in the registry, or a folder
   picked by hand), then the chosen edition's profiles: first the one it
   opens by default (`[Install<id>]` in `%APPDATA%\zen\profiles.ini`, the
   id read from Firefox's `TaskBarIDs` key), then the profiles no other
   edition opens by default. An edition older than Zen 1.23 gets a warning.
   A profile Zen is using (its `parent.lock` held) is refused: close Zen.
2. Sine, unless it is there already (`config.js` in Zen's folder and
   `chrome\JS\sine.sys.mjs` in the profile; `-ReinstallSine` replaces it):
   - the bootloader of [sineorg/bootloader](https://github.com/sineorg/bootloader)
     (latest release): `program.zip` into Zen's folder, asking Windows for
     administrator rights for that step only when the folder is protected,
     `profile.zip` into `<profile>\chrome`;
   - Sine's `engine.zip` into `<profile>\chrome`, from the release Zen Fluent
     is tested with (`$SineTag`, the same as `components.json`).
3. Zen Fluent, and Zen Fluent Enhanced if checked, the way Sine installs a
   mod: the repository's files in `chrome\sine-mods\Zen-Fluent\` (Enhanced:
   the `enhanced` folder in `chrome\sine-mods\Zen-Fluent-Enhanced\`) and
   their entries in `chrome\sine-mods\mods.json`: `theme.json`, the entry
   points, `"no-updates": false`, `enabled`, never `"origin": "store"`. The
   other mods are kept; the previous file is saved as
   `mods.json.zen-fluent-setup.bak`. Sine rebuilds its mods at every start,
   so they load at the next one, and its own updates take over from there.
4. Preferences in `prefs.js` (not `user.js`, so they can be changed later):
   `svg.context-properties.content.enabled` (the mod's icons) and, only
   when the box is checked, `sine.allow-unsafe-js` (scripts of mods
   installed outside Sine's store: Zen Fluent Enhanced needs it, the box
   is required to install it).
5. Clears the profile's startup cache.

## Without the window

```powershell
.\ZenFluentSetup.ps1 -NoGui -Enhanced -AllowUnsafeJs
```

| Parameter        | Meaning                                                    |
| ---------------- | ---------------------------------------------------------- |
| `-NoGui`         | No window: install with the parameters below.              |
| `-Edition`       | `Zen Browser` (default) or `Zen Twilight`.                 |
| `-ZenDir`        | Zen's folder (with `zen.exe`), instead of `-Edition`.      |
| `-ProfilePath`   | The profile folder. Default: the one the edition opens.    |
| `-Enhanced`      | Also install Zen Fluent Enhanced (needs `-AllowUnsafeJs`). |
| `-AllowUnsafeJs` | Consent to set `sine.allow-unsafe-js`.                     |
| `-Ref`           | Branch or tag of this repository to install (`main`).      |
| `-ReinstallSine` | Install Sine even when it is there.                        |

## Testing it

`ZenFluentSetup.exe --selftest <file>` builds the window without showing
it (XAML, the Zen editions and profiles found) and writes `ok …` or the
error to `<file>`: the CI runs it on every build, and it checks a build on
a desktop without opening anything. Any failure at startup is written to
`%TEMP%\ZenFluentSetup-error.log` and shown in a message box. The script:

Point it at a throwaway profile and a folder with a `zen.exe` file in it;
then start the real Zen on that profile (`-no-remote -profile <folder>`):
Zen's own folder already has the bootloader when Sine is installed.

```powershell
.\ZenFluentSetup.ps1 -NoGui -ZenDir C:\tmp\zen -ProfilePath C:\tmp\profile -Enhanced -AllowUnsafeJs -Ref <branch>
```

Checked on 2026-11-07 (Zen 1.24b, Sine 2.3.4.1c, bootloader 0.1.4): on a
new profile, Sine loads Zen Fluent and Zen Fluent Enhanced at the first
start, with Enhanced's scripts running.

## Later

- macOS and Linux (a shell script doing the same steps).
- Mica For Everyone and its `zen` rule on Windows 11 (`components.json`).
- The third-party mods of `components.json`, downloaded from their authors.

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
