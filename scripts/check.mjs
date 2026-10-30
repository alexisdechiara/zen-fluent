// Repository checks run by `npm run check` (and CI): imports, urls, file headers,
// Sine manifests, preferences and their documentation, versions.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);
const rel = (p) => path.relative(root, p).split(path.sep).join("/");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p) => {
  try {
    return JSON.parse(read(p));
  } catch (e) {
    fail(`${p}: invalid JSON (${e.message})`);
    return null;
  }
};
const walk = (dir, ext) =>
  fs.existsSync(path.join(root, dir))
    ? fs
        .readdirSync(path.join(root, dir), { recursive: true })
        .map((f) => path.join(dir, f).split(path.sep).join("/"))
        .filter((f) => f.endsWith(ext))
    : [];

// ---- Entry points: every src file imported, each once (tokens: once per entry)
const imports = {};
for (const entry of [
  "core/chrome.css",
  "core/userContent.css",
  "enhanced/chrome.css",
]) {
  if (!fs.existsSync(path.join(root, entry))) {
    fail(`${entry}: missing`);
    continue;
  }
  const seen = new Set();
  for (const m of read(entry).matchAll(/@import\s+url\("([^"]+)"\)/g)) {
    const target = rel(path.resolve(root, path.dirname(entry), m[1]));
    if (!fs.existsSync(path.join(root, target)))
      fail(`${entry}: imports missing ${target}`);
    if (seen.has(target)) fail(`${entry}: imports ${target} twice`);
    seen.add(target);
    (imports[target] ??= []).push(entry);
  }
}
for (const dir of ["core/src", "enhanced/src"]) {
  for (const file of walk(dir, ".css")) {
    const by = imports[file] || [];
    if (!by.length) fail(`${file}: not imported by any entry point`);
    if (by.length > 1 && !file.startsWith("core/src/tokens/"))
      fail(`${file}: imported by ${by.join(", ")}`);
    if (/(chrome|userContent)\.css$/.test(file))
      fail(`${file}: Sine would take this name for an entry point`);
  }
}

// ---- Every stylesheet: header justifying !important, relative urls resolve
const sheets = [...walk("core", ".css"), ...walk("enhanced", ".css")];
for (const file of sheets) {
  const css = read(file);
  if (!css.startsWith("/* Zen Fluent"))
    fail(`${file}: missing the "/* Zen Fluent…" header`);
  if (
    /!important/.test(css) &&
    !/User sheet: declarations take !important/.test(css.slice(0, 400))
  )
    fail(`${file}: uses !important without the user-sheet line in its header`);
  for (const m of css.matchAll(/url\("([^"]+)"\)/g)) {
    if (/^[a-z-]+:/i.test(m[1])) continue;
    if (!fs.existsSync(path.resolve(root, path.dirname(file), m[1])))
      fail(`${file}: url ${m[1]} not found`);
  }
}

// ---- Sine manifests
const core = json("theme.json");
const enhanced = json("enhanced/theme.json");
const isoDate = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/;
for (const [file, theme, base] of [
  ["theme.json", core, ""],
  ["enhanced/theme.json", enhanced, "enhanced/"],
]) {
  if (!theme) continue;
  for (const key of [
    "id",
    "name",
    "author",
    "homepage",
    "version",
    "updatedAt",
  ])
    if (!theme[key]) fail(`${file}: ${key} is required (Sine store)`);
  if (theme.updatedAt && !isoDate.test(theme.updatedAt))
    fail(
      `${file}: updatedAt must be a full ISO time (Sine compares it to detect updates)`,
    );
  const style =
    typeof theme.style === "string"
      ? { chrome: theme.style }
      : theme.style || {};
  for (const p of [style.chrome, style.content, theme.preferences].filter(
    Boolean,
  ))
    if (!fs.existsSync(path.join(root, base, p)))
      fail(`${file}: ${p} not found`);
  for (const [script, opts] of Object.entries(theme.scripts || {})) {
    if (!fs.existsSync(path.join(root, base, script)))
      fail(`${file}: script ${script} not found`);
    if (!opts.include) fail(`${file}: script ${script} needs "include"`);
  }
}
if (core && enhanced && !(enhanced.modules || []).includes(core.homepage))
  fail(
    `enhanced/theme.json: modules must list Zen Fluent's exact homepage ${core.homepage}`,
  );

// ---- Preferences: Sine rules, and every zen-fluent.* pref used and documented
const prefFiles = [
  core?.preferences,
  enhanced?.preferences && `enhanced/${enhanced.preferences}`,
].filter(Boolean);
const prefs = prefFiles.flatMap((f) => json(f) || []);
const ids = new Set();
for (const p of prefs) {
  if (!p.property) continue;
  if (ids.has(p.property)) fail(`preferences: ${p.property} declared twice`);
  ids.add(p.property);
  if (p.type === "dropdown") {
    if (p.placeholder !== false)
      fail(`preferences: ${p.property} needs "placeholder": false`);
    const values = (p.options || []).map((o) => o.value);
    for (const v of values)
      if (!/^[\x21-\x7e]+$/.test(v))
        fail(
          `preferences: ${p.property} value "${v}" must be ASCII without spaces`,
        );
    if (!values.includes(p.defaultValue))
      fail(`preferences: ${p.property} default is not one of its options`);
  }
}
const allCss = sheets.map(read).join("\n");
const ownPrefs = prefs.filter(
  (p) =>
    p.property?.startsWith("zen-fluent.") &&
    !p.property.startsWith("zen-fluent.ui.") &&
    // Read by their script (checked under "Enhanced scripts")
    !p.property.startsWith("zen-fluent.enhanced."),
);
for (const p of ownPrefs) {
  const dashed = p.property.replace(/\./g, "-");
  if (!allCss.includes(`"${p.property}"`) && !allCss.includes(`--${dashed}`))
    fail(`preferences: ${p.property} is never read by the CSS`);
}
for (const m of allCss.matchAll(/-moz-pref\(\s*"(zen-fluent\.[^"]+)"/g))
  if (!ids.has(m[1]))
    fail(`CSS reads ${m[1]}, which no preferences.json declares`);

const readme = read("README.md");
const shown = (v) =>
  typeof v === "boolean" ? String(v) : v === "" ? "(empty)" : v;
for (const p of prefs.filter(
  (p) => p.property && !p.property.startsWith("zen-fluent.ui."),
)) {
  const row = readme
    .split("\n")
    .find((l) => l.startsWith("|") && l.includes(`\`${p.property}\``));
  if (!row) fail(`README: no settings row for ${p.property}`);
  else if (!row.includes(`\`${shown(p.defaultValue)}\``))
    fail(
      `README: the row of ${p.property} must show its default \`${shown(p.defaultValue)}\``,
    );
}

// ---- Enhanced scripts: declared, the shared life cycle, a pref each
// (enhanced/scripts/README.md). Feature scripts are .uc.js files in
// enhanced/scripts/; shared modules in enhanced/scripts/lib/ are imported by
// them and never declared, or Sine would also import them at startup.
const declared = new Set(Object.keys(enhanced?.scripts || {}));
const scriptFiles = [
  ...walk("enhanced/scripts", ".js"),
  ...walk("enhanced/scripts", ".mjs"),
];
const featureNames = new Set();
for (const file of scriptFiles) {
  const key = file.slice("enhanced/".length);
  const code = read(file);
  if (!code.startsWith("// Zen Fluent Enhanced: "))
    fail(`${file}: missing the "// Zen Fluent Enhanced: …" header`);
  if (key.startsWith("scripts/lib/")) {
    if (declared.has(key))
      fail(`enhanced/theme.json: ${key} is a shared module, not a script`);
    continue;
  }
  if (!key.endsWith(".uc.js")) {
    fail(`${file}: feature scripts are .uc.js files`);
    continue;
  }
  if (!declared.has(key))
    fail(`${file}: not declared in enhanced/theme.json "scripts"`);
  if (!/ZFFeature\.attach\(window,/.test(code))
    fail(`${file}: must start through ZFFeature.attach(window, …)`);
  if (!/window\.addUnloadListener\?\.\(/.test(code))
    fail(
      `${file}: must give Sine its clean-up (window.addUnloadListener?.(…))`,
    );
  const name = code.match(/\bname:\s*"([a-z][a-z0-9-]*)"/)?.[1];
  if (name) featureNames.add(name);
  if (!name) fail(`${file}: no feature name: "…"`);
  else if (!ids.has(`zen-fluent.enhanced.${name}`))
    fail(
      `${file}: its checkbox zen-fluent.enhanced.${name} is missing from enhanced/preferences.json`,
    );
  else {
    // A missing pref reads as the script's default, before Sine writes it
    const checkbox = prefs.find(
      (p) => p.property === `zen-fluent.enhanced.${name}`,
    );
    const scripted = /\bdefault:\s*true\b/.test(code);
    if (scripted !== (checkbox.defaultValue === true))
      fail(
        `${file}: default: ${scripted} differs from the checkbox's defaultValue ${checkbox.defaultValue === true}`,
      );
  }
}
for (const p of prefs.filter((p) =>
  p.property?.startsWith("zen-fluent.enhanced."),
))
  // A feature's own options are zen-fluent.enhanced.<feature>.<option>
  if (
    !featureNames.has(
      p.property.slice("zen-fluent.enhanced.".length).split(".")[0],
    )
  )
    fail(`preferences: ${p.property} has no feature script`);

// ---- Quick Settings: every setting and preset value is one of Zen Fluent's
const quick = fs.existsSync(path.join(root, "enhanced/quick-settings.json"))
  ? json("enhanced/quick-settings.json")
  : null;
if (quick) {
  const byId = new Map(prefs.map((p) => [p.property, p]));
  const known = (property, where) => {
    const pref = byId.get(property);
    if (!pref || !property.startsWith("zen-fluent."))
      fail(
        `enhanced/quick-settings.json: ${where} ${property} is not a Zen Fluent setting`,
      );
    else if (!["dropdown", "checkbox"].includes(pref.type))
      fail(
        `enhanced/quick-settings.json: ${where} ${property} is a ${pref.type} (dropdowns and checkboxes only)`,
      );
    return pref;
  };
  for (const property of quick.settings || []) known(property, "setting");
  for (const property of Object.keys(quick.labels || {}))
    if (!(quick.settings || []).includes(property))
      fail(
        `enhanced/quick-settings.json: label for ${property}, which is not in "settings"`,
      );
  for (const preset of quick.presets || []) {
    if (!preset.id || !preset.name || !preset.description)
      fail(
        `enhanced/quick-settings.json: a preset needs id, name and description`,
      );
    for (const [property, value] of Object.entries(preset.prefs || {})) {
      const pref = known(property, `preset ${preset.id}:`);
      if (
        pref?.type === "dropdown" &&
        !pref.options.some((o) => o.value === value)
      )
        fail(
          `enhanced/quick-settings.json: preset ${preset.id}: ${value} is not a value of ${property}`,
        );
      if (pref?.type === "checkbox" && typeof value !== "boolean")
        fail(
          `enhanced/quick-settings.json: preset ${preset.id}: ${property} takes true or false`,
        );
    }
  }
}

// ---- Fluent icons: icons.json and the SVG files match, each with its notice
const iconDir = "enhanced/icons/fluent";
if (fs.existsSync(path.join(root, iconDir))) {
  const listed = json(`${iconDir}/icons.json`)?.icons ?? [];
  const files = walk(iconDir, ".svg").map((f) => path.basename(f, ".svg"));
  for (const name of listed)
    if (!files.includes(name))
      fail(`${iconDir}/icons.json: ${name}.svg missing`);
  for (const name of files) {
    if (!listed.includes(name))
      fail(`${iconDir}/${name}.svg: not listed in icons.json`);
    if (!read(`${iconDir}/${name}.svg`).includes("Microsoft Corporation"))
      fail(`${iconDir}/${name}.svg: missing its licence comment`);
  }
}

// ---- Paths quoted in the docs exist
for (const file of [
  "README.md",
  "THIRD-PARTY-NOTICES.md",
  "CLAUDE.md",
  ...walk("docs", ".md"),
]) {
  for (const m of read(file).matchAll(
    /`((?:core|enhanced|docs|scripts|installer)\/[\w./-]+)`/g,
  )) {
    if (/[<*]/.test(m[1])) continue;
    if (!fs.existsSync(path.join(root, m[1])))
      fail(`${file}: ${m[1]} does not exist`);
  }
}

// ---- Versions: package.json is the release version
const pkg = json("package.json");
const components = json("components.json");
const version = pkg?.version;
for (const [what, v] of [
  ["theme.json", core?.version],
  ["enhanced/theme.json", enhanced?.version],
  [
    "components.json zen-fluent",
    components?.components.find((c) => c.id === "zen-fluent")?.version,
  ],
  [
    "components.json zen-fluent-enhanced",
    components?.components.find((c) => c.id === "zen-fluent-enhanced")?.version,
  ],
])
  if (v !== version)
    fail(`${what}: version ${v}, package.json says ${version}`);
if (
  !new RegExp(`^## \\[${version?.replace(/\./g, "\\.")}\\]`, "m").test(
    read("CHANGELOG.md"),
  )
)
  fail(`CHANGELOG.md: no "## [${version}]" section`);

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  console.error(`\n${errors.length} problem(s)`);
  process.exit(1);
}
console.log(
  `✓ ${sheets.length} stylesheets, ${prefs.length} preferences, version ${version}`,
);
