#!/usr/bin/env node
// PreToolUse hook: blocks Edit|Write|MultiEdit on generated output (llm-08 — "edit generated output
// by hand" is Never in every AGENTS.md). Reads the project's llmfw.config.json for `generatedPaths`
// (glob-ish prefixes), falling back to a sane default when the project has no config yet.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_GENERATED_PATHS = ["**/generated/**", "**/*.generated.*"];

// Minimal glob → RegExp, same shape as gates/check-repo.mjs globToRegExp.
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += glob[i + 2] === "/" ? "(?:.*/)?" : ".*";
        i += glob[i + 2] === "/" ? 2 : 1;
      } else re += "[^/]*";
    } else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

let input = "";
for await (const chunk of process.stdin) input += chunk;

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0); // malformed input — never block on our own parse failure
}

const filePath = payload?.tool_input?.file_path;
if (!filePath) process.exit(0);

const cwd = payload.cwd ?? process.cwd();
const relPath = path.isAbsolute(filePath) ? path.relative(cwd, filePath) : filePath;

let generatedPaths = DEFAULT_GENERATED_PATHS;
const configPath = path.join(cwd, "llmfw.config.json");
if (existsSync(configPath)) {
  try {
    const cfg = JSON.parse(readFileSync(configPath, "utf8"));
    if (Array.isArray(cfg.generatedPaths)) generatedPaths = cfg.generatedPaths;
  } catch {
    // fall back to defaults on a malformed config
  }
}

const matched = generatedPaths.some((glob) => globToRegExp(glob).test(relPath));
if (matched) {
  console.error(
    `${relPath} is generated output — regenerate it instead of editing by hand (llm-08)`,
  );
  process.exit(2);
}
process.exit(0);
