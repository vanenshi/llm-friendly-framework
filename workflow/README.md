# Workflow — the minimum that works, and how it grows

Every layer below has one owner and one gate. Start with the first two; add the rest when the
project has enough parallel work to need them. A layer added before its need is `con-09`.

| Layer       | Front door                                       | Owns                                    | Add when                                           |
| ----------- | ------------------------------------------------ | --------------------------------------- | -------------------------------------------------- |
| L1 Truth    | `AGENTS.md` → `docs/` → scope cards              | rules; every process reads, none writes | day zero                                           |
| L2 Gates    | `node scripts/check-repo.mjs` + stack gates      | the build stays honest                  | day zero                                           |
| L3 Plans    | `plan-draft` → review → `plan-execute`           | `.agents/plans/`                        | the first change that touches more than one module |
| L4 Handoffs | handoff file                                     | `.agents/handoffs/`                     | day zero — it is how scope stays clean (`con-19`)  |
| L5 Queue    | a board (`.pm/`, issues, a `BACKLOG.md`)         | what is next, by whom                   | two or more parallel sessions                      |
| L6 Routines | scoped, budgeted cleanup passes                  | dead code, duplication, flaky tests     | the codebase is old enough to have any             |
| L7 Live QA  | drive the running app, file findings as handoffs | bugs no test caught                     | there is a running app                             |

## The per-change loop (L1 + L2 + L4, always)

1. **Route.** Read `AGENTS.md`, walk the scope cards down to the file, load the routed rule files.
2. **Name the boundary** you are inside and the contract you cross (`con-17`). A crossing outside
   the documented door is a design change — surface it first.
3. **Trace the use case** end to end before editing: entry → validator → handler → persistence →
   side effects → response, with `file:line`. For a non-trivial change this trace goes in the plan
   or the PR.
4. **Edit** in the slice shape. Register. Regenerate.
5. **Gates**, in full, output tails kept.
6. **Out-of-scope findings → handoff files**, never inline fixes.
7. **Done** per `doc-04`: gates, proof per criterion, manual QA script, debts named, sibling docs
   current, handoffs listed.

## Plans (L3) — `plans.md`

A plan is a file another session can execute cold. Its task list is atomic, ordered, verifiable; it
names the skills/rule files each task needs; a cold reviewer checks its claims against the code
before anyone executes it. `plans.md` has the shape.

## Handoffs (L4) — `handoffs.md`

The replacement for every "want me to also…?" and every native side-task mechanism. One file per
finding, self-contained, acceptance as runnable commands. `handoffs.md` has the rules.

## Queue (L5)

Whatever tool the team uses, three rules keep it agent-safe: **one writer** (a single skill or a
human owns the board file; every other process reaches it through that writer), **anti-goals are
written** (a `DO_NOT_DO.md` that rejects an item outright — routines and QA read it before proposing
anything), and **a milestone links to a goal** (an item that serves no written goal is not
scheduled).

## Routines and live QA (L6, L7)

An autonomous pass follows one contract: **discover → prove → fix → verify → ship**, one finding
at a time, inside one scope (a module or feature), never crossing a boundary — a finding that
spans two modules is a boundary question, which is a STOP. Proof standard: a failing test, a
still-green sabotaged test, or an empty reference sweep. A detector hit is a candidate, not a
finding. Every pass reads the scope card's "rules a compiler will not catch" first — that list is
exactly the things that look like defects and are not.
