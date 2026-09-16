# Plans

A plan is a file under `.agents/plans/` that a **different** session can execute without the
conversation that produced it. It exists for any change that touches more than one module, more
than one repo, or a wire contract.

## Shape

```markdown
---
status: draft | approved | done
run-with: <model/effort the executor should use>
origin: <handoff path or user request, one line>
---

# <Title — the change as an assertion>

## Goal — one paragraph, the product question it answers

## Use-case trace — the request path end to end, `file:line` at each hop, and where new code sits on it (con-17)

## Boundaries crossed — each module door touched, and the ADR/rule that allows it. "None" is a valid answer and a strong one.

## Rules loaded — the convention files and rule IDs this plan is written against

## Tasks — atomic, ordered, each with its verification command

1. [ ] <one bounded edit> — verify: `<command>` → `<expected>`
2. [ ] …

## Out of scope — what this plan deliberately does not do, and the handoff for each

## Risks — what could be wrong in this plan's claims, and how the reviewer should check
```

## Draft → review → execute

1. **Draft** (high-effort model): read the routed rules, trace the use case in the real code, write
   the file. Every `file:line` in it must exist — the reviewer will check.
2. **Cold review** (a fresh session or subagent, read-only): verify each claim against the code,
   check the task list is atomic/ordered/verifiable, check named rules and skills exist, return
   APPROVE or REVISE with findings ranked. Never edits the plan or source.
3. **Approve** — the human flips `status: approved`. An agent does not approve its own plan.
4. **Execute** (the model named in `run-with`): one task at a time, run its verification, tick it,
   commit per logical unit. A task that turns out wrong stops execution and returns to draft — it
   does not improvise.
5. **Done** — gates in full (`doc-04`), the plan's status flipped in the main checkout, handoffs
   for everything the Out-of-scope section promised.

## Why the trace is mandatory

An agent that has not traced the request path will add the new field in the DTO and forget the
validator, or add the slice and forget the registration line. The trace is where the plan proves it
knows every hop; the reviewer's cheapest check is "does every hop in the trace have a task".
