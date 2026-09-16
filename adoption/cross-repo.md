# Adoption — cross-repo systems

Several repos (backend, web, mobile, shared SDK) that together form one product. The monorepo's
main advantage — one PR for a contract change and its fallout — is gone, so the framework replaces
it with **a versioned contract artifact, a contract repo card, and handoff files that cross repos**.

## Where each level lives

| Level                | Lives in                                                                               | Notes                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Principles           | every repo's `docs/CONSTITUTION.md`, **identical**                                     | `con-01`–`con-19` verbatim; product principles from `con-20` also identical. A drift is caught by the contract repo's CI comparing hashes |
| Framework rule files | every repo, verbatim                                                                   | same reason                                                                                                                               |
| Stack rule files     | the repo that owns the stack                                                           | `backend.md` in the API repo, `frontend.md` in the web repo                                                                               |
| Glossary             | the **contract repo**, mirrored read-only into consumers                               | one vocabulary; a consumer that needs a new term files a handoff to the contract repo                                                     |
| ADRs                 | the repo whose code the invariant lives in; cross-repo invariants in the contract repo | numbering per repo, prefixed in cross-references: `api#0007`                                                                              |
| Root `AGENTS.md`     | each repo                                                                              | its own gates; a **"Sibling repos"** section naming each sibling, its contract artifact and version, and where handoffs to it go          |
| Scope cards          | each repo                                                                              | unchanged                                                                                                                                 |

## The contract repo

A small repo (or the API repo's `contracts/` folder published as a package) that owns:

- The API contract document (OpenAPI) and generated clients per consumer stack (`llm-08`), tagged
  with a semantic version.
- The wire-key catalog (`err-04`): the set of error keys as a typed enum in every generated client.
- `CONTEXT.md`, the glossary.
- Its `AGENTS.md` card: "never hand-edited; produced by `<api repo>` CI on tag; consumers pin a
  version; breaking change = major bump + a handoff in every consumer".

Consumers pin a version. Upgrading is a PR in the consumer whose gate is: regenerate against the
pinned version, `tsc`/build passes (an unknown error key or removed route fails there — `err-04`).

## Change flow that crosses repos

Example: web needs a new field on `GET /listings/{id}`.

1. **Web session** finds it cannot proceed. It does not stub the field. It writes
   `.agents/handoffs/2026-09-16-listing-detail-needs-seller-rating.md` in the **web** repo with the
   Contract section written from the consumer's side (the exact JSON shape it needs), `area: api`,
   and `target-repo: <api repo>` in the frontmatter.
2. The human (or a coordinating agent) copies the handoff into the API repo's `.agents/handoffs/`
   — same file, `status: open`. The two files carry each other's path in `origin:`.
3. **API session** executes it: slice change, tests, `gen`, contract version bump (minor), tag. Marks
   its copy `done` with the released version.
4. **Web session** bumps the pinned contract version, regenerates, implements. Marks its copy `done`.

A handoff is the unit of cross-repo coordination because it is a file: reviewable, greppable,
survives sessions, and its Acceptance section is a runnable command in the target repo.

## Gates that hold the seam

- **Producer side (API repo CI):** on tag, publish the contract artifact; run a **breaking-change
  diff** against the previous tag (`oasdiff breaking` or equivalent) and fail the build if the
  version bump is not major.
- **Consumer side:** the regenerate + build step against the pinned version, on every PR. A stale
  pin is visible: CI comments the latest contract version if it is ahead.
- **Cross-repo parity:** the contract repo's CI fetches each sibling's `docs/CONSTITUTION.md` and
  the framework rule files and fails if their hashes differ — the cheapest possible "one truth"
  check. Store the expected hashes in `siblings.json`.
- **Glossary parity:** consumers vendor `CONTEXT.md` from the contract repo at the pinned version;
  a local edit fails the drift step exactly like a hand-edited generated file.

## Session coordination

When two agent sessions run at once in sibling repos:

- Each session's root `AGENTS.md` § Sibling repos names the other repo and its handoff folder, so
  a session knows **where** to write a request rather than inventing a stub.
- Never implement the other side "temporarily". A mock of a sibling's endpoint in production code
  is a `con-03` violation (two sources of truth); a mock in a **test** is fine and is named after
  the contract version it fakes.
- If the harness offers direct session-to-session messaging, the message carries the handoff path;
  the file is still written. Chat is not a rule store (`con-04`) and not a contract store either.

## What stays per repo

Gates, CI, scope cards, ADR numbering, `DEBT #N` numbering, plans. Only the contract artifact, the
glossary and the principles are shared — and all three are shared as **versioned, hash-checked
files**, never as "everyone remembers".
