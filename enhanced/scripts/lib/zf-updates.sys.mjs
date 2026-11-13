// Zen Fluent Enhanced: the installed version of Zen Fluent, and whether
// this start is the first one since it was updated.
//
// The version is read from the mods' own theme.json, as Sine installed
// them (both mods share one version, set by scripts/release.mjs; the
// higher one counts if they ever differ). The last version the user was
// told about is a pref: missing on the first run, when it is recorded
// without telling anything (Enhanced's welcome tour does that job). One
// window per process shows the news: the first to claim the version.

const THEMES = [
  "chrome://sine/content/Zen-Fluent/theme.json",
  "chrome://sine/content/Zen-Fluent-Enhanced/theme.json",
];
export const SEEN_PREF = "zen-fluent.enhanced.update-card.seen";
const REPOSITORY = "https://github.com/alexisdechiara/zen-fluent";

let claimed = null;

/**
 * Compares two dotted versions ("0.5.1"), part by part as numbers.
 *
 * @returns {number} Below 0 when a is older, 0 when equal, above 0 when newer.
 */
export function compareVersions(a, b) {
  const pa = String(a).split(/[.-]/);
  const pb = String(b).split(/[.-]/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = Number.parseInt(pa[i] ?? "0", 10) || 0;
    const y = Number.parseInt(pb[i] ?? "0", 10) || 0;
    if (x !== y) {
      return x - y;
    }
  }
  return 0;
}

/**
 * The installed version of Zen Fluent, or null when no theme.json reads.
 *
 * @param {Window} win - A chrome window (for its fetch).
 * @returns {Promise<string|null>}
 */
export async function installedVersion(win) {
  const versions = await Promise.all(
    THEMES.map((url) =>
      win
        .fetch(url)
        .then((response) => response.json())
        .then((theme) => theme?.version ?? null)
        .catch(() => null),
    ),
  );
  return (
    versions
      .filter((v) => typeof v === "string" && /^\d+(\.\d+)*$/.test(v))
      .sort(compareVersions)
      .pop() ?? null
  );
}

/**
 * The version to announce in this window, claimed for the process, or null:
 * nothing new, the first run (recorded silently), a downgrade (recorded),
 * or another window already took it.
 *
 * @param {Window} win
 * @returns {Promise<string|null>}
 */
export async function takeUpdate(win) {
  const version = await installedVersion(win);
  if (!version) {
    return null;
  }
  // Read after the wait: another window may have recorded it meanwhile
  const seen = Services.prefs.getStringPref(SEEN_PREF, "");
  if (!seen || compareVersions(version, seen) < 0) {
    Services.prefs.setStringPref(SEEN_PREF, version);
    return null;
  }
  if (compareVersions(version, seen) === 0 || claimed === version) {
    return null;
  }
  claimed = version;
  return version;
}

/** Gives the version back (the window closed before showing it). */
export function releaseUpdate(version) {
  if (claimed === version) {
    claimed = null;
  }
}

/** The user was told: the next start says nothing until the next update. */
export function markSeen(version) {
  Services.prefs.setStringPref(SEEN_PREF, version);
}

/**
 * The page that says what changed: the version's release on GitHub (each
 * vX.Y.Z tag has one, its notes being that version's part of the
 * changelog), or the changelog itself.
 */
export function notesUrl(version) {
  return /^\d+\.\d+\.\d+$/.test(version)
    ? `${REPOSITORY}/releases/tag/v${version}`
    : `${REPOSITORY}/blob/main/CHANGELOG.md`;
}

// The labels of Zen's sidebar notification are Fluent ids
export { useFluent } from "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs";
