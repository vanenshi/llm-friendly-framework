# Changelog

## 0.2.0

- Packaged as a Claude Code plugin (`llmfw`): `.claude-plugin/plugin.json` + `marketplace.json`,
  `skills/llmfw-audit`, `llmfw-adopt`, `llmfw-bootstrap` wrapping `prompts/*.md`.
- Split conventions into on-demand skills (`llmfw-principles` + one per `conventions/*.md` file) so
  rule files load per task instead of always-on; `conventions/README.md` and
  `agents/templates/AGENTS.root.md` document the split.
- Added a discovery phase (`adoption/discover.md`, `skills/llmfw-discover`) that mines an existing
  repo's own conventions before `existing-project.md` Phase 0 writes any docs.
- Self-CI: pinned `oxlint@1.83` in the fixtures runner, added root `package.json` and
  `llmfw.config.json` so the framework runs its own gates, `check-repo.mjs` now exits 1 (not 2) on
  a missing config unless `--allow-missing-config` is passed, and a GitHub Actions workflow runs
  both gates on push/PR.
- Added the first hook-layer gate: `hooks/block-generated-edit.mjs` (`PreToolUse` on
  `Edit|Write|MultiEdit`) blocks edits under configured `generatedPaths` before they happen
  (`llm-08`), documented as gate-ladder Layer 0.
- Fixed a broken table row in `agents/templates/AGENTS.root.md` (`<backend | frontend>` →
  `<backend or frontend>`).

## 0.1.0

- Initial framework: `PRINCIPLES.md`, `conventions/`, `agents/`, `gates/` (`check-repo.mjs` +
  TypeScript Oxlint stack), `adoption/`, `workflow/`, `prompts/`.
