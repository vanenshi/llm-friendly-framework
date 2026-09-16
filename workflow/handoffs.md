# Handoffs

A handoff is a **file** describing out-of-scope work found mid-task, written so that a fresh session
with no memory of yours can execute it. It replaces native side-task proposals, backlog chips and
"want me to also…?" offers (`con-19`). Template: `agents/templates/handoff.md`.

## When

- You are working task A and find bug or debt B outside A's scope.
- You need a change in another module, package or repo before A can finish.
- A routine or QA pass finds something it may not fix inside its scope.
- A plan review finds a gap that is not this plan's job.

Not a handoff: a trivial fix on a line you are already editing (do it inline); a question the user
must answer now (ask it).

## Where and how

`.agents/handoffs/YYYY-MM-DD-<slug>.md` (or the vendor folder the project chose — `doc-01`).
Frontmatter: `status: open | planned | done`, `area`, `date`, `origin` (plan path or "none — found
during <task>"), optional `target-repo` for cross-repo (`adoption/cross-repo.md`).

Four sections, all required:

- **Context** — what surfaced it and why it was out of scope. Point at the origin plan; do not
  restate it.
- **Problem** — evidence as `file:line`, verbatim error text, failing command + output. A claim
  without a pointer is a hint, not a finding.
- **Contract** — the expected behavior or fix shape the origin side depends on: endpoints, DTOs,
  error keys, rule IDs, before/after examples.
- **Acceptance** — each criterion is a **command with checkable output**. "Works correctly" is not
  a criterion; `dotnet test --filter CancelOrderTests → 3 passed` is.

## Lifecycle

`open` → (`planned` when a plan is drafted from it; the plan path goes in the frontmatter) → `done`
(the executing PR marks it, in the same commit). Done handoffs stay in the folder for a release and
are then deleted — the PR and the ADR/convention it produced are the record.

## Rules

- **Mention every handoff you created** in the final response of the session: path + one line.
- **Never fix the out-of-scope thing inline** because "it was small". Scope stays clean; the
  handoff carries it. Small things become handoffs that a routine pass drains in batches.
- Status flips happen in the **main checkout**, never inside a worktree (they evaporate).
- A handoff whose Acceptance cannot be written as commands is a design question, not a handoff —
  write it as a question to the user instead.
