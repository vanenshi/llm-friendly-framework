---
name: discover
description: Mine an existing repo's own conventions (instruction files, folder shape, naming patterns, toolchain pins, lint configs) before authoring any framework docs. Use before llmfw:audit or llmfw:adopt on a repo that already has code, or for "find our existing conventions first".
---

Follow `${CLAUDE_PLUGIN_ROOT}/adoption/discover.md` exactly. It is read-only: it produces
`docs/adoption-discovery.md` and writes nothing else. Run it before `llmfw:audit` or Phase 0 of
`llmfw:adopt` — the audit and the truth layer both read its output.
