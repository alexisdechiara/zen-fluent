// Zen Fluent Enhanced: browsing stats read from Firefox's own history.
//
// Nothing is recorded here: visits come from Places (moz_historyvisits),
// time on pages from Firefox's Interactions (moz_places_metadata, its
// total_view_time; on by default in Zen, kept 60 days by
// browser.places.interactions.expireDays). Private windows write neither.
// Reloads, embedded frames, framed links and downloads are not visits.
// Every query is read-only and starts at `from` (ms), never before the
// day the stats were turned on.

const { PlacesUtils } = ChromeUtils.importESModule(
  "resource://gre/modules/PlacesUtils.sys.mjs",
);

// Firefox's visit types: 4 embed, 7 download, 8 framed link, 9 reload
const NOT_VISITS = "4, 7, 8, 9";

const day = (column, divisor) =>
  `date(${column} / ${divisor}, 'unixepoch', 'localtime')`;

/**
 * Per day and per site: visits and time on pages.
 *
 * @param {number} from - Start, in ms since the epoch.
 * @returns {Promise<{day: string, host: string, url: string, visits: number, time: number}[]>}
 *   time in ms; url is one page of that site (for its icon).
 */
export async function siteDays(from) {
  const db = await PlacesUtils.promiseDBConnection();
  const rows = new Map();
  const entry = (dayName, host, url) => {
    const key = `${dayName} ${host}`;
    let row = rows.get(key);
    if (!row) {
      row = { day: dayName, host, url, visits: 0, time: 0 };
      rows.set(key, row);
    }
    return row;
  };
  for (const row of await db.executeCached(
    `SELECT ${day("v.visit_date", 1000000)} AS day, o.host AS host,
            MAX(p.url) AS url, COUNT(*) AS visits
     FROM moz_historyvisits v
     JOIN moz_places p ON p.id = v.place_id
     JOIN moz_origins o ON o.id = p.origin_id
     WHERE v.visit_date >= :from AND v.visit_type NOT IN (${NOT_VISITS})
       AND o.prefix IN ('http://', 'https://')
     GROUP BY day, host`,
    { from: from * 1000 },
  )) {
    entry(
      row.getResultByName("day"),
      row.getResultByName("host"),
      row.getResultByName("url"),
    ).visits = row.getResultByName("visits");
  }
  for (const row of await db.executeCached(
    `SELECT ${day("m.created_at", 1000)} AS day, o.host AS host,
            MAX(p.url) AS url, SUM(m.total_view_time) AS time
     FROM moz_places_metadata m
     JOIN moz_places p ON p.id = m.place_id
     JOIN moz_origins o ON o.id = p.origin_id
     WHERE m.created_at >= :from AND o.prefix IN ('http://', 'https://')
     GROUP BY day, host`,
    { from },
  )) {
    entry(
      row.getResultByName("day"),
      row.getResultByName("host"),
      row.getResultByName("url"),
    ).time = row.getResultByName("time") ?? 0;
  }
  return [...rows.values()];
}

/** Whether Firefox records time on pages. */
export function timeTracked() {
  return Services.prefs.getBoolPref(
    "browser.places.interactions.enabled",
    false,
  );
}
