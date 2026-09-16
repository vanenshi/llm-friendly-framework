# TypeScript stack gates

Oxlint is the linter of choice: Rust-fast on the built-in rules, and its `jsPlugins` load
ESLint-compatible custom rules — so a convention becomes a lint rule in ~30 lines, with a fixture
that proves it. Verified against Oxlint 1.83.

## Install

```bash
pnpm add -D oxlint oxlint-tsgolint dependency-cruiser typescript
cp <framework>/gates/stacks/typescript/oxlint/.oxlintrc.json .oxlintrc.json
mkdir -p scripts/oxlint && cp <framework>/gates/stacks/typescript/oxlint/llmfw-plugin.mjs scripts/oxlint/
cp -r <framework>/gates/stacks/typescript/oxlint/fixtures scripts/oxlint/fixtures
cp <framework>/gates/stacks/typescript/dependency-cruiser.cjs .dependency-cruiser.cjs
```

`package.json` scripts, which are also the `AGENTS.md` gate lines:

```json
{
  "lint": "oxlint --type-aware",
  "lint:fixtures": "node scripts/oxlint/fixtures/run-fixtures.mjs",
  "depcruise": "depcruise src --config .dependency-cruiser.cjs",
  "typecheck": "tsc --noEmit",
  "check": "pnpm typecheck && pnpm lint && pnpm depcruise && pnpm lint:fixtures"
}
```

## Layer 1 — compiler (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  }
}
```

`noUncheckedIndexedAccess` alone removes a class of "worked in the demo" bugs an agent writes
constantly (`items[0].id`).

## Layer 3–4 — Oxlint

`oxlint/.oxlintrc.json` is the base. Built-in rules carry the convention ID as a trailing comment;
the `llmfw/*` rules carry it in their message. The nine custom rules:

| Rule                                     | ID       | Fires on                                                      |
| ---------------------------------------- | -------- | ------------------------------------------------------------- |
| `llmfw/no-barrel`                        | `llm-03` | `export *`; `export {x} from` inside an `index.*`             |
| `llmfw/no-grab-bag-file`                 | `llm-02` | file stem in `utils, helpers, misc, common, shared, stuff`    |
| `llmfw/no-composed-identifier`           | `llm-01` | a `*Route/*Key/*Event/*Topic` const built from a template/`+` |
| `llmfw/max-file-lines`                   | `llm-06` | file longer than `max` (300)                                  |
| `llmfw/no-bare-todo`                     | `llm-10` | `TODO/FIXME/HACK/XXX` comment without `DEBT #N`               |
| `llmfw/no-literal-route-in-test`         | `tst-04` | `get/post/goto/fetch…("/literal/path")` inside `*.spec        | test.*` |
| `llmfw/no-env-outside-config`            | `llm-12` | `process.env` outside the `allow` regex (`src/env.ts`)        |
| `llmfw/no-cross-feature-internal-import` | `vs-11`  | `features/a/*` importing `features/b/<anything but public>`   |
| `llmfw/slice-section-order`              | `vs-01`  | `handle` declared above `ROUTE` in the same file              |

Run the fixtures: `node oxlint/fixtures/run-fixtures.mjs` → `all fixtures pass`.

### Adding a rule (the progressive part)

When a convention is violated the second time:

1. Open `llmfw-plugin.mjs`, copy the smallest rule (`noGrabBagFile`). Keep the shape: `rule(<id>,
<description>, create, {schema})`, message ends with `(<id>)`.
2. Find the AST node type at <https://astexplorer.net> (parser: `typescript-eslint`). The subset of
   the ESLint rule API you may rely on under Oxlint: `context.filename`, `context.options`,
   `context.sourceCode.text`, `context.sourceCode.getAllComments()`, `context.report({node,
message})`. No `context.getScope`, no type services — if you need types, that is a `tsc` or
   architecture-test job instead.
3. Register it in the `rules` export and in `.oxlintrc.json` (with the ID comment) and in
   `fixtures/fixtures.oxlintrc.json`.
4. Add `fixtures/<rule-name>/bad.ts` (first line `// ✗ <id> — why`) and `good.ts` (first line `// ✓`).
   Run `run-fixtures.mjs`; both must pass before the rule ships.
5. Add the line `Enforced by: Oxlint llmfw/<rule-name>` to the convention paragraph.

The same plugin file loads under ESLint 9 flat config (`plugins: { llmfw }`) if a repo is not on
Oxlint yet — write rules once.

## Layer 5 — dependency boundaries (`dependency-cruiser.cjs`)

Oxlint sees one file at a time; module boundaries need the graph. The shipped config has three
rules, each named after its convention:

- `vs-04-module-boundaries` — `src/modules/<a>/**` may import `src/modules/<b>/contracts/**` only.
- `vs-11-feature-doors` — `src/features/<a>/**` may import `src/features/<b>/public.ts` only.
- `llm-03-gen-untouched` — `src/api/gen/**` is imported only from `src/api/client.ts` and features;
  nothing re-exports it.

Adjust the globs to your layout; keep the rule names, they are what the failure message shows.

## Layer 6 — architecture tests (Vitest over the file tree)

For invariants with no AST shape, a test that reads the tree is the cheapest gate:

```ts
// tests/architecture/slices.test.ts
import { globSync, readFileSync } from "node:fs";
test("every slice exports a ROUTE literal and has a spec (vs-01, tst-01)", () => {
  for (const file of globSync("src/features/*/slices/*.ts")) {
    const src = readFileSync(file, "utf8");
    expect(src, file).toMatch(/export const ROUTE = "\/[^"]+";/);
    expect(globSync(file.replace(/\.ts$/, ".spec.ts")), file).toHaveLength(1);
  }
});
```

## Layer 8 — CI drift

```yaml
- run: pnpm gen:api && git diff --exit-code src/api/gen
```

## Layer 7 — `check-repo.mjs`

The TypeScript-relevant entries in `llmfw.config.json`: `forbiddenPatterns` for `import.meta.glob`
(`llm-04`), `forbiddenPaths` for `index.ts` barrels outside framework-mandated folders (`llm-03`),
`features` for `tst-07`, `toolchain` for `.nvmrc` (`vc-10`).
