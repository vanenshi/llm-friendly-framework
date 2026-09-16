# Adoption — monorepo

One repo, several deployables and packages. The framework's single-repo shape holds; what changes
is **where the levels live** and **which gates run per change**.

## Layout

```
repo/
├── AGENTS.md                    ← root contract: whole-repo gates, routing, session rules
├── CLAUDE.md                    ← @AGENTS.md
├── llmfw.config.json            ← one checker config; scope globs cover every app
├── docs/                        ← ONE constitution, ONE conventions folder, ONE adr/, ONE glossary
├── apps/
│   ├── api/
│   │   ├── AGENTS.md            ← app card: its gate command, its stack rule file, its module pattern
│   │   └── src/Modules/<M>/AGENTS.md   ← module card (level 3 — the ceiling)
│   └── web/
│       ├── AGENTS.md
│       └── src/features/<f>/AGENTS.md
└── packages/
    ├── contracts/               ← cross-app contract: OpenAPI doc + generated clients (llm-08)
    │   └── AGENTS.md            ← "never hand-edited; regenerate with <cmd>; consumers: apps/web"
    └── <lib>/AGENTS.md
```

Rules that follow from this:

- **One truth layer.** `docs/` is not duplicated per app. Stack rule files (`backend.md`,
  `frontend.md`) live in the one `docs/conventions/` with their prefixes; an app card points at its
  file. Two constitutions is how two teams drift into two products.
- **Three levels, no more** (`agents/nesting.md`): root → app/package → module/feature. A fourth
  level means an app is too big to be one app.
- **One glossary.** `CONTEXT.md` at root; an app-specific term is still a product term.
- **Numbering is repo-wide.** ADR numbers, `DEBT #N`, `con-NN` — one sequence each, because
  parallel sessions collide on "next free" and `check-repo` checks uniqueness across the tree.

## Gates in a monorepo

- The root `AGENTS.md` gate list is the **full** list. Each app card names the subset that can be
  affected by a change inside it, so an agent editing `apps/web` runs the web gates locally and CI
  runs everything.
- CI: affected-only for the expensive gates (build/test per app via the workspace tool's `--filter
...[origin/main]` or a path filter), **always** for `check-repo.mjs`, formatter and lint — those
  are seconds and they are the ones that catch cross-app drift.
- The contracts package is the seam between apps: `apps/api` produces the OpenAPI document,
  `packages/contracts` holds it plus generated clients, `apps/web` consumes. The drift step
  (`gen && git diff --exit-code packages/contracts`) is the gate that makes a backend change and its
  frontend fallout land in **one PR** — the main reason to be a monorepo at all.

## Ownership

- A package's card names its **consumers** (which apps import it) so an agent changing it knows
  which gates prove the change safe.
- `CODEOWNERS` maps to the same folders the cards live in; the card is the human-readable half.
- A shared package that has no domain meaning (logging, http client) is a `kernel/` package and is
  the only thing every app may import. A shared package _with_ domain meaning is a module in the
  wrong place (`vs-08`).

## Parallel sessions

Several agents work the same monorepo in worktrees. The root `AGENTS.md` § Agent sessions holds:
launch config with dynamic ports, per-worktree build output dirs (two sessions sharing one
`.next/` corrupt each other), handoffs as files (`workflow/handoffs.md`), and "never `git pull`
without `--rebase`". Anything gitignored edited inside a worktree is lost with it — edit it in the
main checkout.
