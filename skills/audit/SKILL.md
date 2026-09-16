---
name: audit
description: Audit a repo against the LLM-Friendly Framework, read-only, producing docs/adoption-scorecard.md. Use for "audit this repo", "how far are we from llmfw", "score this codebase against the framework", or before adopting the framework.
---

# Audit only (no changes)

Audit this repository against the LLM-Friendly Framework at `${CLAUDE_PLUGIN_ROOT}`. Read
`PRINCIPLES.md`, every file in `conventions/`, `agents/nesting.md` and `gates/README.md`. Change no
source file; you may write exactly one file: `docs/adoption-scorecard.md`.

Measure, do not estimate. For each rule that a gate can check, run the gate in report mode against
this repo and record the count:

- TypeScript: `npx oxlint -c ${CLAUDE_PLUGIN_ROOT}/gates/stacks/typescript/oxlint/.oxlintrc.json`
  with `jsPlugins` pointed at the framework's plugin, all llmfw rules at `warn`; `depcruise` with the
  framework config adjusted to this layout.
- Any stack: `node ${CLAUDE_PLUGIN_ROOT}/gates/check-repo.mjs --root . --config <a config you write
  in the scratch folder from the example, globs adjusted>`.
- .NET: `dotnet build -warnaserror` with `AnalysisLevel=latest-all` in a scratch
  `Directory.Build.props` (do not commit it); count by diagnostic ID.

For rules with no gate (`vs-03`, `vs-04` where no modules exist, `doc-*`), answer from the tree:
import graph clusters, presence and size of agent/doc files, prose restatements of code.

Scorecard table columns: Area · Rule(s) · Current state (count + up to three `file:line` samples) ·
Gate that will hold it · Suggested phase (per `adoption/existing-project.md`). Below the table:

1. The five highest-value gaps, ranked by count × blast radius, one paragraph each with the fix
   shape.
2. The module seams you found (clusters, their product question, their implicit cross-calls) — the
   input to Phase 3.
3. What is already good and should be named as the reference (`be-01`/`fe-01` candidate slice,
   existing tests worth keeping as the pattern).
4. Anything that would make Phase 1 fail on day one (a gate that cannot be green even at baseline)
   and the exemption needed.

No fixes, no PR, no dependencies installed into the repo (use `npx`/scratch folders).
