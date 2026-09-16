# Tech debts — index

One line per `// DEBT #N:` comment in code (`llm-10`). The explanation lives **at the code**; this
file is only the index. `check-repo.mjs` `debt-ledger` fails if a `#N` exists on one side only.
Numbers are append-only; a retired debt's line is deleted together with its comment.

| #   | Label                      | Path             |
| --- | -------------------------- | ---------------- |
| 1   | <what was cut, five words> | `<path/to/file>` |
