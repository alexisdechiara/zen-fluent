# Contributing to Zen Fluent

Thanks for wanting to help. Every kind of help counts: a clear bug report,
a screenshot of a mod that clashes, a translation, a fix.

## Where to start

- **Found a bug?** [Open an issue](https://github.com/alexisdechiara/zen-fluent/issues/new/choose)
  with the bug form: the versions and a screenshot are usually enough.
- **A question, or help with the install?** Ask in
  [Discussions, Q&A](https://github.com/alexisdechiara/zen-fluent/discussions/categories/q-a).
- **An idea?** Talk it through in
  [Ideas](https://github.com/alexisdechiara/zen-fluent/discussions/categories/ideas),
  or open a feature issue when it is clear.
- **Want to code?** Pick an issue labelled
  [good first issue](https://github.com/alexisdechiara/zen-fluent/labels/good%20first%20issue)
  or [help wanted](https://github.com/alexisdechiara/zen-fluent/labels/help%20wanted),
  and say so in a comment so nobody works on it twice. What is planned is on
  the [roadmap](https://github.com/users/alexisdechiara/projects).

## Making a change

1. Fork, then `npm install`.
2. Read [docs/contributing.md](docs/contributing.md): the layout, the rules
   every CSS file follows, how a setting is added and how to test in Zen.
3. Check in Zen with the setting on and off (live editing: Ctrl+Shift+Alt+I,
   Style Editor), in light and dark.
4. `npm run lint` (prettier and stylelint) and `npm run check` must pass.
5. Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md), then open
   a pull request with before and after screenshots.

The project is written in English (code, comments, docs and settings labels).

## Labels

| Label                                                     | Meaning                                   |
| --------------------------------------------------------- | ----------------------------------------- |
| `bug`, `enhancement`, `compatibility`, `documentation`    | The kind of issue                         |
| `core`, `enhanced`, `installer`, `settings`, `zen update` | The part of the project                   |
| `needs triage`, `needs repro`, `confirmed`, `blocked`     | Where it stands                           |
| `breaking`                                                | Ships in a minor version (see below)      |
| `good first issue`, `help wanted`                         | Open to contributors                      |
| `real desktop`                                            | Needs a check on a real Windows 11 screen |

## Versions

1.0 comes when Zen leaves beta. Until then a minor version (0.6, 0.7…)
follows a change that breaks something, from Zen or from the mod, and a
patch (0.5.1…) each Zen update and everything else
([details](docs/contributing.md#versions)).

## Licences

Zen Fluent is MIT. Code from another project keeps its licence notice
([THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)); never copy from a
GPL project such as Nebula.

By taking part you agree to the [code of conduct](CODE_OF_CONDUCT.md).
