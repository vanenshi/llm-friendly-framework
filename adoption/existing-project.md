# Adoption — existing project

Never a big-bang rewrite. The framework is adopted as a **ratchet**: every gate starts at "no worse
than today" and tightens as violations are retired. A rule the codebase violates 400 times is not a
rule yet — it is a baseline plus a burn-down.

## Phase 0a — Discover (read-only, one session)

Run `adoption/discover.md` before the audit. Output is `docs/adoption-discovery.md`: the repo's own
conventions, mined from its instruction files, folder shape, naming patterns, toolchain pins and
lint configs — each row evidence-backed and either "keep as-is" or feeding a later phase. Skipping
this step means the audit below proposes rules the repo already follows under a different name.

## Phase 0 — Audit (read-only, one session)

Run `prompts/audit.md`, informed by `docs/adoption-discovery.md`. Output is a scorecard in
`docs/adoption-scorecard.md`:

| Area              | Rule(s)  | Current state (count, `file:line` samples)      | Gate that will hold it   | Phase |
| ----------------- | -------- | ----------------------------------------------- | ------------------------ | ----- |
| Grab-bag files    | `llm-02` | 14 files: `src/utils.ts`, `src/lib/helpers.ts`… | `llmfw/no-grab-bag-file` | 2     |
| Barrels           | `llm-03` | 31 `index.ts`                                   | `llmfw/no-barrel`        | 2     |
| Module boundaries | `vs-04`  | no modules; 3 implicit clusters (see graph)     | depcruise                | 3     |
| …                 |          |                                                 |                          |       |

Measure, do not fix. Counts come from running the framework's gates in **report mode** against the
repo (Oxlint with the llmfw rules at `warn`, `check-repo.mjs` output piped to a file).

## Phase 1 — Truth + gates at baseline (one session, no code changes)

1. Truth layer exactly as `new-project.md` § 1. `AGENTS.md` gets a **"Baseline"** section: the rules
   currently violated, the count, and the sentence "new code follows the rule; existing violations
   burn down per `docs/adoption-scorecard.md`".
2. Gates installed at **baseline severity**:
   - Oxlint: every llmfw rule at `warn`; built-in `correctness` at `error` only if it already passes.
   - `check-repo.mjs`: checks that fail today get `exempt` globs or are left out of `--only` in the
     CI command; the scorecard names each.
   - Analyzers (.NET): `AnalysisLevel` at whatever is green today; per-rule `error` only for rules
     with zero hits.
3. CI runs the baseline gate list. It must be green on the first PR — a red first gate is how
   adoption dies.
4. **Ratchet rule** goes into `AGENTS.md` Always: "a gate at `warn` may not gain a new warning; a
   PR that adds one is rejected." Enforce with a warning-count snapshot committed as
   `gates-baseline.json` and a CI step that fails if any count grows (a 20-line script; `check-repo`
   has no built-in for this on purpose — the counts are stack-specific).

## Phase 2 — Cheap wins (file-level rules)

Retire, in this order, because each is mechanical and safe:

1. `llm-10` TODOs → `DEBT #N` with a ledger, or delete.
2. `llm-02` grab-bag files → split by the one thing each function does; the linter tells you the
   file, the callers tell you the names.
3. `llm-03` barrels → replace imports with the real path (a codemod; `git diff --stat` + spot-check,
   script deleted after).
4. `llm-12` config reads → one typed config module.
5. `vc-10` toolchain pins, `vc-09` machine paths.

Flip each rule from `warn` to `error` the moment its count hits zero. Update the scorecard row.

## Phase 3 — Boundaries (the real architectural work)

This is where an existing codebase pushes back. Do it module by module, not all at once:

1. **Find the seams.** Cluster by co-change and by import graph (`depcruise --output-type dot`, or
   a code-graph tool). Each cluster that answers one product question is a module candidate
   (`vs-03`). Write the three justifications for each _before_ moving code.
2. **Strangler, not surgery.** Create `<Module>/` with `README.md`, `AGENTS.md` and an empty contracts
   folder. Move one slice at a time into `Features/` in the fixed order (`vs-01`), registering it in
   the explicit list (`vs-06`). The old code keeps working; the depcruise rule for this module goes
   to `error` when the last file is inside.
3. **Doors before walls.** For every cross-module call the graph shows, add the contracts interface
   first, switch callers, then enable the boundary rule. A boundary enabled before the door exists
   just gets suppressed.
4. **Persistence last.** Splitting a shared database into per-module schemas is the expensive step;
   `vs-09` is often the last rule to turn on and may stay a documented debt (`DEBT #N`, ceiling
   named) for a long time. That is honest; a suppressed rule is not.

## Phase 4 — Tests and documents

1. `tst-01` coverage assertion: start with `warn`-equivalent (a test that lists missing `<Slice>Tests`
   and asserts the count does not grow), burn down, then assert zero.
2. Nested `AGENTS.md` per module (`agents/nesting.md`), `scope-cards` check on.
3. ADRs only for invariants the code cannot show (trigger test). Existing "architecture docs" are
   reduced to `ARCHITECTURE.md` + pointers; prose restatements of code are deleted (`doc-02`).

## What not to do

- Do not rewrite a working layered app into slices in one PR. A half-migrated codebase with green
  gates and a scorecard beats a "finished" one whose gates were disabled to merge it.
- Do not disable a gate to merge. Exempt the specific path in config, with the scorecard row as the
  reason, so the exemption is greppable and retireable.
- Do not add the framework's rules to `AGENTS.md` as prose while the gates stay off. Rules without
  gates are what the codebase already had.

## Definition of Done for Phase 1 (the only phase that must finish in one go)

- [ ] `docs/CONSTITUTION.md`, `docs/conventions/`, `AGENTS.md` + `CLAUDE.md`, `CONTEXT.md` (≥ 5
      terms), `docs/adoption-scorecard.md` exist
- [ ] `node scripts/check-repo.mjs` → `check-repo: ok` (with documented exemptions)
- [ ] CI green on the adoption PR with the baseline gate list
- [ ] `gates-baseline.json` committed; the ratchet step fails on a deliberately added warning
      (prove it once, revert)
