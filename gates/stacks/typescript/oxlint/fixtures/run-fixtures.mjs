#!/usr/bin/env node
// Proves every llmfw rule fires on its ✗ fixtures and stays silent on its ✓ fixtures.
//
//   node run-fixtures.mjs            (from this folder; needs `oxlint` resolvable via npx)
//
// Layout: fixtures/<rule-name>/**/*.ts. A fixture's first line carries `// ✗` (must report exactly
// that rule) or `// ✓` (must report nothing from that rule). Add a fixture pair whenever you add a
// rule — a rule with no fixture is a rule nobody can trust.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const norm = (p) => p.replace(/\\/g, "/");

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

let out;
try {
  out = execFileSync(
    "npx",
    ["--yes", "oxlint", "-c", path.join(here, "fixtures.oxlintrc.json"), "--format", "json", here],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
} catch (e) {
  out = e.stdout; // oxlint exits 1 when it reports — expected here
  if (!out) {
    console.error(e.stderr ?? e.message);
    process.exit(2);
  }
}
const report = JSON.parse(out);
const codesByFile = new Map();
for (const d of report.diagnostics ?? []) {
  const f = norm(path.resolve(d.filename));
  codesByFile.set(f, [...(codesByFile.get(f) ?? []), d.code]);
}

let failed = 0;
const rules = readdirSync(here, { withFileTypes: true }).filter((d) => d.isDirectory());
for (const ruleDir of rules) {
  const code = `llmfw(${ruleDir.name})`;
  for (const file of walk(path.join(here, ruleDir.name))) {
    const firstLine = readFileSync(file, "utf8").split("\n")[0];
    const expectBad = firstLine.includes("✗");
    const expectGood = firstLine.includes("✓");
    if (!expectBad && !expectGood) continue; // support file (e.g. a feature's public.ts)
    const fired = (codesByFile.get(norm(file)) ?? []).filter((c) => c === code).length;
    const ok = expectBad ? fired > 0 : fired === 0;
    console.log(`${ok ? "✓" : "✗"} ${path.relative(here, file)} — ${fired} report(s) from ${code}`);
    if (!ok) failed++;
  }
}
console.log(failed ? `\n${failed} fixture(s) failed` : "\nall fixtures pass");
process.exit(failed ? 1 : 0);
