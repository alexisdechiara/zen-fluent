# Security

Zen Fluent Enhanced runs scripts with Zen's own rights, and the Windows
installer can ask for administrator rights to write Sine's loader into Zen's
folder. A flaw in either matters.

## Reporting

Please do not open a public issue. Use
[Report a vulnerability](https://github.com/alexisdechiara/zen-fluent/security/advisories/new)
(GitHub's private advisories), with what you found, how to reproduce it and
the versions. You will get an answer within a week.

## Supported versions

Only the latest release gets fixes. Before 1.0 (when Zen leaves beta), each
release replaces the previous one.

## The installer

`ZenFluentSetup.exe` is built only by
[`.github/workflows/installer.yml`](.github/workflows/installer.yml) from
this repository and attached to the releases. Download it from the
[releases](https://github.com/alexisdechiara/zen-fluent/releases) only.
