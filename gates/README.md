# Gates — prose does not fail a build

A rule an agent can violate without a red build is a suggestion. This folder turns every convention
that _can_ be checked by a machine into a gate, and tells you which layer catches what. The agent's
job is then mechanical: run the gates, read the failure (every message names its rule ID), open the
rule, fix, rerun.

## The gate ladder — cheapest layer that can catch it

| Layer                     | Catches                                                                                      | Cost to add a rule  | Where                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------ |
| 0 Agent hooks              | Blocks the edit before it happens                                                            | one hook entry      | `hooks/block-generated-edit.mjs`                             |
| 1 Compiler                | Types, nullability, exhaustiveness, unused symbols                                           | a flag              | `tsconfig` strict, `<Nullable>enable`, `-warnaserror`        |
| 2 Formatter               | Everything about whitespace — never discussed in review                                      | zero                | Prettier / CSharpier, `--check` in CI                        |
| 3 Linter (built-in rules) | Language-level smells: `any`, floating promises, empty catch, console                        | one config line     | Oxlint categories, Roslyn analyzers via `.editorconfig`      |
| 4 Linter (custom rules)   | Repo conventions with an AST shape: barrels, composed identifiers, route literals in tests   | ~30 lines + fixture | `stacks/typescript/oxlint/llmfw-plugin.mjs`, Roslyn analyzer |
| 5 Dependency boundaries   | Who may import whom: module → contracts only, feature → public only, generated untouched     | one rule block      | dependency-cruiser, Oxlint `import/*`, ArchUnitNET           |
| 6 Architecture tests      | Shape invariants across the whole assembly: every slice has a route const + tests + auth     | one test            | ArchUnitNET / reflection tests, Vitest over the file tree    |
| 7 Repo-shape checker      | Cross-language facts: docs ↔ code parity, card freshness, pinned versions, forbidden regexes | one config entry    | `check-repo.mjs` + `llmfw.config.json`                       |
| 8 CI drift steps          | Generated output committed, lockfile current                                                 | one CI line         | `gen && git diff --exit-code`                                |
| 9 Startup assertions      | Things only the running host knows: every endpoint declares auth, every error has a message  | one guard           | host `Program` guard, catalog test                           |

Rule of thumb: pick the **lowest** layer that can express the rule. A custom lint rule (4) beats an
architecture test (6) because it fails in the editor; an architecture test beats `check-repo` (7)
because it has the type system.

## Rule → gate catalog

Every framework rule that a machine can check, and the artifact that checks it. A project extends
this table in its own `docs/conventions/README.md` for `be-`/`fe-` rules.

| Rule     | What                                            | TypeScript gate                                        | .NET gate                                                                        |
| -------- | ----------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `llm-01` | identifiers grep-complete                       | `llmfw/no-composed-identifier`                         | analyzer: string interpolation into `Route` const (stacks/dotnet.md)             |
| `llm-02` | no grab-bag files                               | `llmfw/no-grab-bag-file`, `check-repo forbidden-paths` | `check-repo forbidden-paths`                                                     |
| `llm-03` | no barrels                                      | `llmfw/no-barrel`, depcruise `gen-untouched`           | n/a (no barrels in C#); static facade classes → ArchUnit                         |
| `llm-04` | no reflection scans                             | `check-repo forbidden-patterns` (`import.meta.glob`)   | `check-repo forbidden-patterns` (`*FromAssembly`, `.Scan(`), banned-API analyzer |
| `llm-06` | files fit a context window                      | `llmfw/max-file-lines`                                 | `check-repo file-size`                                                           |
| `llm-07` | typed, unique errors                            | `err-01` gates                                         | ArchUnit: every exception sealed, derives from a status base                     |
| `llm-08` | generated output untouched                      | CI `gen && git diff --exit-code`                       | same                                                                             |
| `llm-10` | `DEBT #N` not TODO                              | `llmfw/no-bare-todo`, `check-repo debt-ledger`         | `.editorconfig` S1135/MA0026 as error, `check-repo debt-ledger`                  |
| `llm-11` | typed public surface                            | `typescript/no-explicit-any`                           | `<Nullable>enable`, CA1062 off (validate at boundary instead)                    |
| `llm-12` | config read in one place                        | `llmfw/no-env-outside-config`                          | banned-API analyzer: `Environment.GetEnvironmentVariable` outside `Settings`     |
| `vs-01`  | slice section order                             | `llmfw/slice-section-order`                            | ArchUnit: nested `Route` const + `Endpoint` type per slice                       |
| `vs-04`  | module → contracts only                         | depcruise `module-boundaries`                          | ArchUnit: module assembly references only `*.Contracts`                          |
| `vs-06`  | module list in one file                         | `check-repo forbidden-patterns` (no scans)             | ArchUnit: every module assembly appears in the bootstrap list                    |
| `vs-07`  | auth declared on every entry point              | e2e smoke: unauthenticated hits every route → 401/403  | startup guard (`AssertEveryEndpointDeclaresAuthorization`)                       |
| `vs-09`  | persistence module-private                      | n/a                                                    | schema test: no FK leaves the schema                                             |
| `vs-11`  | feature → public file only                      | `llmfw/no-cross-feature-internal-import`, depcruise    | n/a                                                                              |
| `err-01` | error name is the wire key                      | generated key union → `tsc` fails on unknown key       | catalog test: every exception has a message in every locale                      |
| `err-06` | no swallowed failures                           | `no-empty`, `typescript/no-floating-promises`          | `.editorconfig` CA1031 / S2486 as error                                          |
| `tst-01` | every slice has tests                           | Vitest file-tree test: `features/*/**` ↔ `*.spec.ts`   | `FeatureCoverageAssert` per module                                               |
| `tst-04` | no literal route in tests                       | `llmfw/no-literal-route-in-test`                       | analyzer or grep gate: `"/` string literal in `*Tests.cs` call                   |
| `tst-07` | e2e spec per feature                            | `check-repo feature-e2e`                               | n/a                                                                              |
| `vc-05`  | codegen in same commit                          | CI drift step                                          | CI drift step                                                                    |
| `vc-09`  | no machine paths committed                      | `check-repo forbidden-patterns`                        | same                                                                             |
| `vc-10`  | toolchain pinned everywhere                     | `check-repo toolchain-version` (`.nvmrc`)              | `check-repo toolchain-version` (`global.json`)                                   |
| `doc-01` | vendor files import `AGENTS.md`                 | `check-repo agents-link`                               | same                                                                             |
| nesting  | scope cards exist, ≤ 40 lines, pointers resolve | `check-repo scope-cards`                               | same                                                                             |

Rules with no row (`con-*` principles, `vs-03`, `vs-05`, `vs-08`, `doc-02`) are review rules. They
get a row the second time they are violated (escalation ladder).

## The gate list in `AGENTS.md`

Every adopting repo lists its gates as literal commands, and CI runs the **same commands**. Green
locally and red in CI is a bug in the CI file, not a flaky gate. Shape:

```
<build, warnings as errors>
<format --check>
<lint>                       # oxlint / dotnet format style --verify-no-changes
<test>                       # includes architecture + schema + coverage tests
<gen> && git diff --exit-code <generated paths>
node scripts/check-repo.mjs
```

## Failure message contract

Every gate message ends with the rule ID in parentheses: `… (llm-03)`. The agent greps
`docs/conventions/` for the ID and lands on the one paragraph that explains and shows ✓/✗. A gate
whose message lacks an ID is a gate an agent cannot act on — treat that as a bug in the gate.

## Contents

- `check-repo.mjs` — language-neutral repo-shape checker; copy to `scripts/`. Config:
  `llmfw.config.example.json` → `llmfw.config.json` at repo root.
- `stacks/typescript/` — Oxlint base config, `llmfw` custom-rule plugin (9 rules, fixtures, runner),
  dependency-cruiser boundary rules, `tsconfig` strictness. See its README for **adding a rule**.
- `stacks/dotnet.md` — `.editorconfig` severities, analyzer packages, ArchUnitNET test skeletons,
  schema and coverage assertions, startup guards.
