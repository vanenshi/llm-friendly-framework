# <Scope> — agent card

What this scope owns, exposes and deliberately lacks: `README.md` (this folder). This file is only
what an agent must not get wrong here. ≤ 40 lines; pointers, not prose.

**Slices:** every one is listed in `<RegistrationFile>:<line>` — a slice not registered there is
dead (`vs-06`).

**Contracts door:** `<Scope>.Contracts` exposes `<IFoo>`, `<BarDto>`, `<BazEvents>`. Adding a type
to it is a cross-module API change; adding a second door is ask-first (`vs-04`).

**Binding ADRs**

- **NNNN** — <one-line consequence for code in this scope>.

**Rules a compiler will not catch**

- <Thing that looks like a defect and is not — with `file:line`.>
- <Thing that looks fine and is a security or data-loss bug — with `file:line`.>
- <Mirror that must stay in sync with X, and the test that proves it — with `file:line`.>
- An error class name **is** the wire key (`<Scope>.<ClassName>`); renaming is ask-first (`err-01`).

**Gate:** `<one command that verifies this scope>` — this scope's tests live in `<path>`.
