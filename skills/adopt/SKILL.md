---
name: adopt
description: Apply the LLM-Friendly Framework to an existing repo — discover its conventions, audit, then install the truth layer and gates at baseline severity. Use for "adopt llmfw here", "apply the framework to this existing repo", "onboard this codebase onto llm-friendly-framework".
---

# Apply the framework to an existing repo

You are adopting the LLM-Friendly Framework at `${CLAUDE_PLUGIN_ROOT}` into this repository. Read,
in order: `${CLAUDE_PLUGIN_ROOT}/README.md`, `PRINCIPLES.md`, `conventions/README.md`,
`adoption/existing-project.md`, then the stack recipe(s) under `gates/stacks/` that match this repo
(TypeScript: `typescript/README.md`; C#: `dotnet.md`). If the repo is a monorepo or one of several
repos, also read `adoption/monorepo.md` or `adoption/cross-repo.md`.

Then execute **Phase 0a, Phase 0 and Phase 1** of `adoption/existing-project.md`:

0. **Discover first.** Run `llmfw:discover` (`adoption/discover.md`) before anything else. Its
   output, `docs/adoption-discovery.md`, is read by the audit below — do not audit a repo whose
   existing conventions haven't been mined yet.
1. Audit read-only (`llmfw:audit`). Produce `docs/adoption-scorecard.md` with real counts and
   `file:line` samples, measured by running the framework's gates in report mode (Oxlint llmfw
   rules at `warn`, `check-repo.mjs` output captured), informed by `docs/adoption-discovery.md`. Do
   not fix anything in this step.
2. Install the truth layer: `docs/CONSTITUTION.md` (framework `con-01`–`con-19` verbatim),
   `docs/conventions/` (framework files verbatim + a stack file with this repo's reference slice
   named), root `AGENTS.md` from the template with **literal** gate commands, `CLAUDE.md` =
   `@AGENTS.md`, `CONTEXT.md` with at least five terms taken from this codebase, `ARCHITECTURE.md`
   with one real request trace, `docs/tech-debts.md`, handoff and ADR templates.
3. Install gates at baseline severity: `scripts/check-repo.mjs` + `llmfw.config.json` with exemptions
   for what fails today (each exemption named in the scorecard), the stack linter config with the
   custom rules at `warn`, fixtures runner, dependency boundaries, toolchain pins. Add a
   warning-count baseline and a CI step that fails if any count grows.
4. CI: one job running exactly the `AGENTS.md` gate list on pull requests.
5. Open one PR. Paste every gate's output tail. The PR must be green.

Constraints: no big-bang refactor; never disable a gate to merge — exempt a path and record why;
never edit generated output by hand; every out-of-scope finding becomes a handoff file in
`.agents/handoffs/` using the template; list every handoff in your final message. Ask before adding
any dependency other than the ones the stack recipe names.

Finish with: the scorecard summary (top five gaps, ranked by count × risk), the gate list as it
now stands, and the recommended order for Phases 2–4.
