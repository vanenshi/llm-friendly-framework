# <Project> — agent contract

<One line: what the product is, the stack, the layout (single repo / monorepo / one of N repos).>
Gates, routing, Always / Ask-first / Never for anyone — human or agent — changing code here.

Framework: llm-friendly-framework `0.1.0`. Root `CLAUDE.md` holds only `@AGENTS.md` and imports this
file; edit `AGENTS.md` only (`agents-link` check).

**Nearest card wins.** Before editing a file, read every `AGENTS.md` from the repo root down to the
file's directory. A scope card (`<pattern>/AGENTS.md`) overrides this file for its scope.

## Routing table — need → file

| Need                                                     | Read                                  |
| -------------------------------------------------------- | ------------------------------------- |
| Domain vocabulary                                        | `CONTEXT.md`                          |
| What exists, request path, "don't have yet"              | `ARCHITECTURE.md`                     |
| Principles that override every rule file                 | `docs/CONSTITUTION.md`                |
| Slice shape, module boundaries, contracts door           | `docs/conventions/vertical-slices.md` |
| Naming, comments, barrels, generated output — any change | `docs/conventions/llm-friendly.md`    |
| Errors, wire keys, messages                              | `docs/conventions/errors.md`          |
| Tests                                                    | `docs/conventions/testing.md`         |
| Commits, branches, PRs                                   | `docs/conventions/version-control.md` |
| Which doc owns which fact, Definition of Done            | `docs/conventions/documents.md`       |
| <stack-specific rules>                                   | `docs/conventions/<backend or frontend>.md` |
| Invariants a compiler can't check                        | `docs/adr/`                           |
| What one module owns, its door, its gate                 | `<pattern>/AGENTS.md`                 |
| Handoffs, plans, parallel sessions                       | `## Agent sessions` below             |

With the `llmfw` Claude Code plugin installed, each row is also a skill (`llmfw-<name>`) that loads
on demand; the table stays for other agents.

## Gates

Run in full before claiming done. Every one also runs in CI on the same command.

```
<build with warnings as errors>
<format check>
<lint>
<test>
<gen && git diff --exit-code <generated paths>>
node scripts/check-repo.mjs
```

## Always

- Load `docs/CONSTITUTION.md` plus the routed rule files before touching code.
- Slice shape per `vs-01`; one file per use case; register in the explicit list (`vs-06`).
- A module reaches another only through its contracts door (`vs-04`).
- Regenerate and commit generated output in the same commit as its cause (`vc-05`).
- Assume parallel agent sessions: never assume a port is free; use the repo's launch config.
- Out-of-scope bug or debt found mid-task → a handoff file (`## Agent sessions`), never an inline
  fix and never a native task proposal.

## Ask first

- A new dependency (`con-10`).
- A new module or a new contracts door (`vs-03`, `vs-04`).
- A new ADR.
- Changing a route const or renaming an error class (both are wire contracts — `tst-04`, `err-01`).
- Rewriting already-pushed history (`vc-03`).

## Never

- Edit generated output by hand (`llm-08`).
- Edit an applied migration (`vc-06`).
- Barrels, grab-bag files, reflection scans (`llm-02`, `llm-03`, `llm-04`).
- A literal route string in a test (`tst-04`).
- Read config/env outside the one config module (`llm-12`).
- Swallow a failure (`err-06`).
- Push `main` directly from an agent session (`vc-08`).
- Commit a machine-specific path (`vc-09`).
- <stack-specific nevers with rule IDs>

## Agent sessions

**Handoffs replace native task proposals.** Out-of-scope work → `.agents/handoffs/YYYY-MM-DD-<slug>.md`
from `.agents/handoffs/_TEMPLATE.md`, `status: open|planned|done`. Self-contained: Context ·
Problem (`file:line` evidence) · Contract · Acceptance (each criterion a command with checkable
output). Mention every handoff created in the final response.

**Parallel sessions.** Other sessions run in their own worktrees. Never assume a port is free. An
edit to a gitignored file inside a worktree is lost when the worktree is removed — make such edits
in the main checkout. Personal instructions go in a gitignored `CLAUDE.local.md`, never a committed
file.

## Versions that differ from training data

- <library — what changed, `file:line` showing the current usage>

## ADRs

- **0001** — <one-line assertion>

---

When a doc contradicts the code, the code is truth — fix the doc.
