// Zen Fluent: checks the mods of enhanced/settings/compatible-mods.json against their repositories.
//
// For every checked mod: is the repository still there and not archived,
// and is its theme.json version still the one Zen Fluent was checked with
// (tested.version)? A new version is listed with the selectors of its CSS
// that touch an id Zen Fluent styles too: the parts to look at again before
// updating tested. Vertex Mods (the authors of most mods Zen Fluent
// supports) also have their active repositories (not archived, pushed this
// year) listed when compatible-mods.json lacks them.
//
//   npm run check:mods            report, exit 1 when a mod is gone
//   GITHUB_TOKEN=… raises GitHub's rate limit (the CI passes it)
//
// In GitHub Actions the report also goes to the job summary and each
// finding becomes a warning annotation.

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(
  fs.readFileSync(
    path.join(root, "enhanced/settings/compatible-mods.json"),
    "utf8",
  ),
);
const ORGS = ["Vertex-Mods"];
const year = String(new Date().getUTCFullYear());
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "zen-fluent-check-mods",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

async function get(url, { json = true } = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    return { status: response.status };
  }
  return {
    status: 200,
    body: json ? await response.json() : await response.text(),
  };
}

/** Every id Zen Fluent's CSS uses in a selector. */
function zenFluentIds() {
  const ids = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(file);
      } else if (entry.name.endsWith(".css")) {
        const css = fs
          .readFileSync(file, "utf8")
          .replace(/\/\*[\s\S]*?\*\//g, "");
        for (const [, selector] of css.matchAll(/([^{};]+)\{/g)) {
          for (const [, id] of selector.matchAll(/#([A-Za-z][\w-]*)/g)) {
            ids.add(id);
          }
        }
      }
    }
  };
  walk(path.join(root, "core/src"));
  return ids;
}

/** The CSS files a mod's theme.json loads, with their @imports. */
async function modCss(repo, branch, theme) {
  const base = `https://raw.githubusercontent.com/${repo}/${branch}/`;
  const entries = [];
  const style = theme.style;
  if (typeof style === "string") {
    entries.push(style);
  } else if (style && typeof style === "object") {
    entries.push(...Object.values(style).filter(Boolean));
  }
  const seen = new Set();
  let css = "";
  const load = async (file) => {
    if (seen.has(file) || seen.size > 40) {
      return;
    }
    seen.add(file);
    const { body } = await get(base + file, { json: false });
    if (typeof body !== "string") {
      return;
    }
    css += `\n${body}`;
    const dir = path.posix.dirname(file);
    for (const [, url] of body.matchAll(
      /@import\s+(?:url\()?["']([^"')]+)["']/g,
    )) {
      if (!/^[a-z]+:/.test(url)) {
        await load(path.posix.normalize(path.posix.join(dir, url)));
      }
    }
  };
  for (const file of entries) {
    await load(file);
  }
  return css;
}

/** The selectors of a CSS text that name one of Zen Fluent's ids. */
function overlaps(css, ids) {
  const found = new Set();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, selector] of clean.matchAll(/([^{};]+)\{/g)) {
    const text = selector.trim().replace(/\s+/g, " ");
    if (text.startsWith("@")) {
      continue;
    }
    for (const [, id] of text.matchAll(/#([A-Za-z][\w-]*)/g)) {
      if (ids.has(id)) {
        found.add(text.length > 90 ? `${text.slice(0, 87)}…` : text);
        break;
      }
    }
  }
  return [...found];
}

const lines = [];
const warnings = [];
let failed = false;
const ids = zenFluentIds();
const known = new Set(registry.mods.map((mod) => mod.repo.toLowerCase()));

lines.push(
  "| Mod | Status | Checked | Latest | Note |",
  "| --- | --- | --- | --- | --- |",
);
for (const mod of registry.mods) {
  const repo = await get(`https://api.github.com/repos/${mod.repo}`);
  if (repo.status !== 200) {
    failed = true;
    lines.push(
      `| ${mod.name} | ${mod.status} | ${mod.tested?.version ?? ""} | — | repository not found (${repo.status}) |`,
    );
    warnings.push(`${mod.name}: repository ${mod.repo} not found`);
    continue;
  }
  const branch = repo.body.default_branch;
  const prefix = mod.path ? `${mod.path}/` : "";
  const theme = await get(
    `https://raw.githubusercontent.com/${mod.repo}/${branch}/${prefix}theme.json`,
  );
  const latest = theme.status === 200 ? String(theme.body.version ?? "") : "";
  const notes = [];
  if (repo.body.archived) {
    notes.push("archived");
    warnings.push(`${mod.name}: ${mod.repo} is archived`);
  }
  if (
    latest &&
    mod.tested &&
    latest !== mod.tested.version &&
    mod.status !== "breaks"
  ) {
    notes.push("new version: check it again");
    const touched = overlaps(
      await modCss(mod.repo, branch, theme.body),
      ids,
    ).slice(0, 8);
    if (touched.length) {
      notes.push(`touches ${touched.map((s) => `\`${s}\``).join(", ")}`);
    }
    warnings.push(
      `${mod.name}: v${latest} out, checked with v${mod.tested.version}`,
    );
  }
  lines.push(
    `| ${mod.name} | ${mod.status} | ${mod.tested?.version ?? ""} | ${latest || "?"} | ${notes.join("; ")} |`,
  );
}

for (const org of ORGS) {
  const list = await get(
    `https://api.github.com/orgs/${org}/repos?per_page=100&type=all`,
  );
  if (list.status !== 200) {
    continue;
  }
  const missing = list.body.filter(
    (repo) =>
      !repo.archived &&
      repo.pushed_at?.startsWith(year) &&
      !repo.name.startsWith(".") &&
      !known.has(repo.full_name.toLowerCase()),
  );
  if (missing.length) {
    lines.push("", `Active ${org} repositories not checked yet:`, "");
    for (const repo of missing) {
      lines.push(
        `- [${repo.full_name}](${repo.html_url}), pushed ${repo.pushed_at.slice(0, 10)}`,
      );
      warnings.push(`${repo.full_name} is not in compatible-mods.json`);
    }
  }
}

const report = lines.join("\n");
console.log(report);
if (process.env.GITHUB_ACTIONS) {
  for (const warning of warnings) {
    console.log(`::warning title=Mod compatibility::${warning}`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Mod compatibility\n\n${report}\n`,
    );
  }
}
process.exitCode = failed ? 1 : 0;
