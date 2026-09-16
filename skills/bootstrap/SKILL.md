---
name: bootstrap
description: Bootstrap a new project with the LLM-Friendly Framework — truth layer, gates before code, skeleton, first reference slice. Use for "bootstrap a new project with llmfw", "start a new repo with the framework", "set up llm-friendly-framework from scratch".
---

# Bootstrap a new project with the framework

You are bootstrapping a new project with the LLM-Friendly Framework at `${CLAUDE_PLUGIN_ROOT}`.

Ask the user for, if not already given:

- **Stack:** TypeScript (Next.js/Node) | .NET | both — which is API and which is UI.
- **Product:** one sentence. First three product questions it must answer.
- **Layout:** single repo | monorepo | one of several repos (name the siblings).

Read, in order: `${CLAUDE_PLUGIN_ROOT}/README.md`, `PRINCIPLES.md`, `conventions/README.md` and
every framework rule file it routes to, `agents/nesting.md`, `gates/README.md`, the stack recipe(s)
under `gates/stacks/`, `workflow/README.md`, then `adoption/new-project.md` (and `monorepo.md` /
`cross-repo.md` if the layout needs it).

Execute `adoption/new-project.md` sections 1–4 completely, in order — truth layer, gates before
code, skeleton, first module with one reference slice — committing at the points it names with
conventional commits. Every gate in `AGENTS.md` must be green before each commit; paste output
tails in your progress messages. The custom lint rules' fixtures must pass (`run-fixtures.mjs` →
`all fixtures pass`).

Design constraints you must honor and may not "simplify" away: vertical slices in the fixed section
order with one reference slice named in the stack convention file; modules reach each other only
through a contracts surface; every registration is an explicit list; typed errors whose name is
the wire key with a message per locale; generated client with a `.gen.` marker and a CI drift step;
config read in one typed module; nested `AGENTS.md` cards ≤ 40 lines per module; `check-repo.mjs`
green.

Ask before: adding any dependency not named in the stack recipe, creating a module beyond the three
product questions, writing an ADR.

Finish with: the folder tree, the gate list, the reference slice path, and the "What we
deliberately don't have yet" list from `ARCHITECTURE.md`.
