// Prepares a release: `npm run release -- 0.2.0`.
// Sets the version everywhere, stamps updatedAt (Sine updates a mod only when it
// grows) and turns the CHANGELOG's "Unreleased" section into the release.
// Tagging and pushing stay manual (printed at the end).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version || "")) {
  console.error("usage: npm run release -- <major.minor.patch>");
  process.exit(1);
}
const now = new Date();
const stamp = now.toISOString().replace(/\.\d+Z$/, "Z");
const day = stamp.slice(0, 10);

const editJSON = (file, fn) => {
  const p = path.join(root, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  fn(data);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
};
editJSON("package.json", (d) => (d.version = version));
for (const file of ["theme.json", "enhanced/theme.json"])
  editJSON(file, (d) => Object.assign(d, { version, updatedAt: stamp }));
editJSON("components.json", (d) => {
  for (const c of d.components) if (c.kind === "mod") c.version = version;
});

const log = path.join(root, "CHANGELOG.md");
const text = fs.readFileSync(log, "utf8");
if (!text.includes("## [Unreleased]")) {
  console.error('CHANGELOG.md: no "## [Unreleased]" section');
  process.exit(1);
}
fs.writeFileSync(
  log,
  text.replace(
    "## [Unreleased]",
    `## [Unreleased]\n\n## [${version}] - ${day}`,
  ),
);

console.log(`Version ${version}, updatedAt ${stamp}. Then:
  npm run lint && npm run check
  git commit -am "Release ${version}" && git tag v${version}
  git push && git push origin v${version}`);
