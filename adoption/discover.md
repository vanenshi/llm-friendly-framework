# Discover — mine existing conventions before authoring anything

Phase 0a, before `existing-project.md` Phase 0 (audit). Read-only: no file changes except the one
output below. A repo with code already has conventions — usually undocumented and inconsistent, but
real. Writing `docs/CONSTITUTION.md` or `docs/conventions/` before finding them means inventing
rules the codebase already contradicts.

Run each step, record what you find, then produce the output table.

## Steps

**(a) Existing instruction files → candidate rules.**

```
ls AGENTS.md CLAUDE.md .cursorrules .github/copilot-instructions.md CONTRIBUTING.md 2>/dev/null
```

Read whichever exist. Every imperative sentence ("always...", "never...", "we use X not Y") is a
candidate rule — record its source file and line.

**(b) Folder shape.**

```
ls -d */
find . -maxdepth 3 -iname "index.*" -not -path "*/node_modules/*" | wc -l
find . -iname "utils.*" -o -iname "helpers.*" -o -iname "common.*" | grep -v node_modules
```

Record: top-level dirs, whether feature folders exist (`features/*`, `Modules/*`), barrel count,
grab-bag file count.

**(c) Naming patterns.**

```
grep -rn "const.*[Rr]oute" --include="*.ts" --include="*.tsx" -l | head -20
find . -iname "*Error*.cs" -o -iname "*Exception*.ts" | grep -v node_modules
find . -iname "*.spec.*" -o -iname "*.test.*" | head -5
```

Record: how routes are declared, error/exception naming, test file suffix convention.

**(d) Toolchain pins.**

```
cat .nvmrc global.json 2>/dev/null
grep -m1 packageManager package.json 2>/dev/null
ls package-lock.json pnpm-lock.yaml yarn.lock 2>/dev/null
```

Record: pinned runtime version, package manager, which lockfile is the source of truth.

**(e) Generated-output markers.**

```
grep -rln "DO NOT EDIT\|auto-generated\|@generated" --include="*.ts" --include="*.cs" | grep -v node_modules | head -10
find . -iname "*.gen.*" -o -path "*/generated/*" | grep -v node_modules
```

Record: existing generated-file convention (marker comment, suffix, folder) if any.

**(f) Existing lint/format configs.**

```
ls .eslintrc* .oxlintrc* .prettierrc* .editorconfig 2>/dev/null
```

Read each briefly. Record: which built-in rules are already at `error`, whether a custom rule
already enforces something the framework would also enforce.

## Output — `docs/adoption-discovery.md`

One table:

| Observed convention | Evidence (`file:line`) | Proposed rule ID or "keep as-is" |
| -------------------- | ----------------------- | ---------------------------------- |
| Routes as `ROUTES.X` consts | `web/src/routes.ts:12` | matches `tst-04` shape — keep as-is |
| No barrels, but 9 exist under `src/shared/` | `src/shared/index.ts` (×9) | candidate `llm-03` violation, feed to Phase 2 |
| Node pinned via `.nvmrc` (20.11.0) | `.nvmrc:1` | matches `vc-10` — keep as-is |

Every row is either "keep as-is" (the repo already does what the framework would ask) or feeds a
specific phase of `existing-project.md` — cite the phase. This table is the input to
`llmfw-audit`: an audit that skips discovery ends up proposing rules the repo already follows under
a different name.
