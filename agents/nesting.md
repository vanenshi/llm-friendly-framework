# Nested agent contracts

One root `AGENTS.md` plus one short card per scope. The card nearest the file being edited wins on
conflict; the root wins on anything the card is silent about. Nothing is duplicated between levels
— a card **points** at rule IDs, it never restates them.

## Why nested

A single 400-line root file is read once and forgotten by line 200. A module card is 40 lines, read
at the moment the agent opens that module, and says only what an agent would otherwise get wrong
_right here_. The root says what is true everywhere; the card says what is true in this folder.

## The three levels

| Level  | File                                                             | Holds                                                                                                           | Size  |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----- |
| Root   | `/AGENTS.md`                                                     | Routing table (need → file), Gates (literal commands), Always / Ask-first / Never, session rules, version notes | ≤ 200 |
| Scope  | `<module or package or feature>/AGENTS.md`                       | Agent card: slices list pointer, contracts door, binding ADRs, rules a compiler won't catch, this scope's gate  | ≤ 40  |
| Vendor | `/CLAUDE.md`, `/.cursorrules`, `.github/copilot-instructions.md` | One line importing `AGENTS.md`, or a symlink. Nothing else                                                      | 1     |

Vendor files at scope level follow the same rule: `<scope>/CLAUDE.md` is `@AGENTS.md` if the vendor
does not read `AGENTS.md` natively. This matters for nested cards specifically: Claude Code walks up
and reads nested `CLAUDE.md`, not nested `AGENTS.md`, so a scope card with no sibling import line is
invisible to it. Use a regular file, never a symlink — a Windows checkout materialises a symlink as
a text file holding the string `AGENTS.md`, which the agent then reads as its instructions. `check-repo.mjs` `agents-link` fails if a vendor file contains
anything but the import line.

## What goes in a scope card (and what does not)

In — only things an agent must not get wrong in this scope:

- **Slices:** one pointer to the explicit registration list (`vs-06`), not the list itself.
- **Contracts door:** what this scope exposes, and the sentence "adding a new door is ask-first".
- **Binding ADRs:** number + one-line consequence each.
- **Rules a compiler will not catch:** 3–8 bullets, each with a `file:line`. These are the things
  that look like defects and are not, and the things that look fine and are security bugs.
- **Gate:** the one command that verifies this scope.

Out — belongs elsewhere, link it:

- What the module _is_ → `<module>/README.md` (`vs-03`).
- Any rule that applies to more than this scope → `docs/conventions/`, cite the ID.
- API shapes, field lists, flow narration → `doc-02`.

## Discovery — how an agent finds the right card

1. Open the root `AGENTS.md`; its routing table maps needs to files and names the card pattern
   (`api/src/Modules/<M>/AGENTS.md`, `packages/<p>/AGENTS.md`).
2. Before editing any file, walk up from the file's directory to the repo root; read every
   `AGENTS.md` on the way, nearest last. Nearest wins on conflict.
3. Most agent harnesses do step 2 automatically for `CLAUDE.md`/`AGENTS.md`. For those that do
   not, the root file states the walk-up rule in its first section.

## Freshness

A card lies when its scope changes and it does not. Two mechanisms:

- `doc-04` Definition of Done item 5: the card is updated in the same change that changes the
  scope's surface, boundary or binding ADR.
- `check-repo.mjs` `scope-cards`: every directory matching a configured scope glob has a card, the
  card is ≤ the configured line limit, and every `file:line` pointer inside it resolves to an
  existing file (line existence checked when the file is text).

## Monorepo and cross-repo

- Monorepo: one root card at the repo root, one per package/app, one per module inside an app.
  Three levels deep is the ceiling; a fourth level means a package is too big (`adoption/monorepo.md`).
- Cross-repo: each repo has its own root card. A shared **contracts repo** carries the card that
  describes the contract discipline all consumers follow (`adoption/cross-repo.md`).

## Templates

- `templates/AGENTS.root.md` — root contract.
- `templates/AGENTS.scope.md` — scope card.
- `templates/CLAUDE.md` — vendor import line.
