# <Project> — architecture

What exists and how the pieces fit, as of the last change to this file. Decisions live in
`docs/adr/`; rules in `docs/conventions/`; this file narrates the current shape with pointers.

## Shape

<One paragraph: hosts, modules, persistence, how a request enters and leaves. Name the bootstrap
file that lists every module (`vs-06`) and the file that lists allowed module → contracts edges.>

## Modules

| Module   | Product question it answers | Owns (schema, keys, events) | Exposes (contracts door) | Card               |
| -------- | --------------------------- | --------------------------- | ------------------------ | ------------------ |
| <Module> | <question>                  | `<schema>.*`, `<Module>.*`  | `<Module>.Contracts`     | `<path>/AGENTS.md` |

## Request path (one worked example)

<Trace ONE real request end to end with `file:line` at each hop: entry → auth filter → validator →
handler → persistence → side effects → response. Real identifiers, not placeholders.>

## Cross-cutting machinery (`con-16`)

| Mechanic                      | Implementation (`file:line`) | Convention line | Test that fails when it stops |
| ----------------------------- | ---------------------------- | --------------- | ----------------------------- |
| <e.g. transaction enlistment> | `<path>`                     | `<id>`          | `<TestName>`                  |

## What we deliberately don't have yet

- <Deferred item> — <the concrete trigger that will make us add it>. Remove the line in the same
  change that ships it.
