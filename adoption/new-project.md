# Adoption — new project

Day-zero checklist for an agent bootstrapping a repo with this framework. Order matters: gates
before code, so the first slice is already checked. Budget: one session, about 2 hours of agent time.

## 0. Inputs (from the human, three blanks)

- **Stack:** TypeScript (Next/Node), .NET, or both. Which is the API, which is the UI.
- **Product in one sentence** and the first three product questions it must answer (these become
  the first modules — `vs-03`).
- **Layout:** single repo / monorepo / one of several repos (then read `monorepo.md` or
  `cross-repo.md` after this file).

## 1. Truth layer

1. `cp PRINCIPLES.md docs/CONSTITUTION.md`. Rename the title; keep `con-01`–`con-19` verbatim.
2. `cp -r conventions/ docs/conventions/`. Keep the framework files verbatim; add `backend.md`
   (`be-`) and/or `frontend.md` (`fe-`) with the stack's reference slice named in `be-01`/`fe-01`.
   Add their rows to the routing table.
3. From `agents/templates/`: `AGENTS.root.md → AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`,
   `ARCHITECTURE.md`, `tech-debts.md → docs/tech-debts.md`, `adr.md → docs/adr/_TEMPLATE.md`,
   `handoff.md → .agents/handoffs/_TEMPLATE.md`, `pull_request_template.md → .github/`.
4. Fill `AGENTS.md`: gates as literal commands, scope-card pattern, stack Nevers with rule IDs,
   "Versions that differ from training data" for every major dependency.
5. `CONTEXT.md`: the product's nouns from the one-sentence description. Five to ten terms is enough.

## 2. Gates layer — before the first slice

1. `cp gates/check-repo.mjs scripts/`; `cp gates/llmfw.config.example.json llmfw.config.json`; edit
   globs to the layout. Run `node scripts/check-repo.mjs` — it must pass on the empty repo.
2. Stack gates per `gates/stacks/typescript/README.md` and/or `gates/stacks/dotnet.md`: compiler
   strictness, formatter, linter config + custom rules + fixtures, dependency boundaries,
   architecture test project (empty but wired over the module list).
3. Pin toolchains (`vc-10`) and add the `toolchain` entries.
4. Commit hooks: formatter + linter on pre-commit, commitlint on commit-msg (`vc-01`).
5. CI: one `verify` job running **exactly** the `AGENTS.md` gate list, on pull requests.
6. First commit: `chore(tooling): adopt llm-friendly-framework 0.1.0`. Every gate green.

## 3. Skeleton

1. Kernel/platform package: error bases + wire-key derivation (`err-01`), problem-details mapping
   (`err-03`), typed config module (`llm-12`), request transaction if there is a database.
2. Bootstrap file with the explicit module list (`vs-06`) — empty list, but the architecture tests
   already read it.
3. Generated-client pipeline (`llm-08`): the gen script, the `.gen.` marker, the CI drift step —
   with zero endpoints it generates an empty contract and proves the loop.

## 4. First module, first slice

1. `<Module>/README.md` with the three justifications (`vs-03`), `<Module>/AGENTS.md` from the scope
   template (≤ 40 lines), contracts project even if empty (`vs-04`).
2. One slice in the fixed order (`vs-01`), registered (`vs-06`), auth declared (`vs-07`), one typed
   error with a message per locale (`err-01`, `err-02`), `<Slice>Tests` happy + denial (`tst-01`).
3. Name this slice as the reference in `be-01`/`fe-01`. Every later slice copies it.
4. Run the full gate list. Paste tails. `feat(<module>): <first slice>`.

## 5. Handoff to normal work

From here every change follows `workflow/README.md`: plan → execute → gates → PR. The board of
deferred items lives in `ARCHITECTURE.md` "What we deliberately don't have yet" until the project
needs a real queue.

## Definition of Done for adoption

- [ ] `node scripts/check-repo.mjs` → `check-repo: ok`
- [ ] every stack gate green, output tails in the PR
- [ ] `AGENTS.md` gate list == CI job steps (diff them by eye; they are the same strings)
- [ ] one reference slice exists and is named in the stack convention file
- [ ] custom-rule fixtures pass (`run-fixtures.mjs` → `all fixtures pass`)
