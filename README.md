# LLM-Friendly Framework

A stack-agnostic operating system for codebases that are written and maintained by AI agents at
least as often as by humans. It is a set of **documents, templates and machine-checked gates**, not
a library. You hand this folder to an agent and say "apply it" — the agent does the rest.

An agent works through `grep`, file paths and a limited context window. It cannot hold a
conversation's worth of tribal knowledge, and it will confidently violate any rule that exists only
in someone's head. This framework makes every rule either **greppable prose with a stable ID** or
**a gate that fails the build** — and it moves rules from the first form to the second the moment
they are violated twice.

## What you get

| Layer           | Folder          | What it is                                                                                           |
| --------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| Principles      | `PRINCIPLES.md` | Non-negotiables (`con-NN`) that override every rule file                                             |
| Conventions     | `conventions/`  | Rule files with stable IDs (`llm-`, `vs-`, `err-`, `tst-`, `vc-`, `doc-`) and a self-update protocol |
| Agent contracts | `agents/`       | Root `AGENTS.md` + nested scope cards, and how nesting works                                         |
| Gates           | `gates/`        | `check-repo.mjs` (config-driven repo-shape checks), Oxlint base config + custom rules, stack recipes |
| Adoption        | `adoption/`     | Step-by-step for new projects, existing projects, monorepos, cross-repo systems                      |
| Workflow        | `workflow/`     | Truth → gates → plans → handoffs; the minimum viable process and how to grow it                      |
| Prompts         | `prompts/`      | Paste-ready prompts: apply to existing repo, bootstrap a new one, audit only                         |

## How to use it (three ways)

1. **New project.** Paste [`prompts/bootstrap-new.md`](prompts/bootstrap-new.md) into your agent,
   fill the three blanks (stack, product, repo layout). The agent follows
   [`adoption/new-project.md`](adoption/new-project.md).
2. **Existing project.** Paste [`prompts/apply-to-existing.md`](prompts/apply-to-existing.md). The
   agent runs the audit, produces a scorecard, then adopts in phases per
   [`adoption/existing-project.md`](adoption/existing-project.md) — never a big-bang rewrite.
3. **Audit only.** Paste [`prompts/audit.md`](prompts/audit.md) to get the scorecard and a ranked
   gap list without changing code.

In every case the agent first reads `PRINCIPLES.md`, then `conventions/README.md`, then only the
rule files the task touches (the routing table tells it which).

## The five ideas, in one screen

1. **One home per fact.** Every durable fact — a rule, a term, a decision, a debt — has exactly one
   owning document. Everything else points at it. Duplicated prose drifts; drifted prose is what the
   next agent implements against. (`conventions/documents.md`)
2. **Rules have IDs, IDs are append-only.** `llm-03`, `vs-05`, `con-11`. Cite them in reviews and
   commits. Never renumber, never reuse. (`conventions/README.md`)
3. **Prose does not fail a build.** A rule violated twice becomes a lint rule, an architecture test,
   or a `check-repo.mjs` check. The prose stays as the explanation; the machine enforces.
   (`gates/README.md`)
4. **Vertical slices behind explicit doors.** One file per use case, modules that reach each other
   only through a named contracts surface, every registration an explicit greppable list — no
   reflection scans, no barrels, no magic. (`conventions/vertical-slices.md`)
5. **Nested agent contracts.** A root `AGENTS.md` holds the whole-repo contract in pointers; each
   module or package holds a ≤40-line card of what an agent must not get wrong _there_. The card
   nearest the file wins. (`agents/nesting.md`)

## Folder map

```
llm-friendly-framework/
├── README.md                    ← you are here
├── PRINCIPLES.md                ← con-NN, override everything
├── prompts/                     ← paste-ready entry points
├── adoption/                    ← new / existing / monorepo / cross-repo
├── conventions/                 ← rule files + routing table + self-update protocol
├── agents/                      ← nesting model + templates (AGENTS.md, scope card, ADR, handoff…)
├── gates/                       ← check-repo.mjs, oxlint config + custom rules, stack recipes
└── workflow/                    ← plans, handoffs, definition of done
```

## Compatibility

- **Any stack.** Rule files are written against concepts (slice, module, contracts door, generated
  output). `gates/stacks/*.md` maps each concept to concrete tooling for TypeScript/Node, .NET,
  Python and Go. Add a stack by adding one file.
- **Any agent.** `AGENTS.md` is the vendor-neutral contract file (read by Codex, Cursor, Copilot,
  Claude Code). `CLAUDE.md` contains only `@AGENTS.md`. Other vendors' files get the same one-line
  import or a symlink — never a second copy.
- **Any layout.** Single repo, monorepo, or many repos sharing contracts — see `adoption/`.

## Versioning

This framework is versioned (`FRAMEWORK_VERSION` below). A project records the version it adopted
in its `AGENTS.md` header so an upgrade is a diff, not archaeology. Rule IDs inside the framework
are append-only across versions.

`FRAMEWORK_VERSION: 0.1.0`
