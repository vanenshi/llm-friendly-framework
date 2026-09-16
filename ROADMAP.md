# Roadmap

Ordered. Each item names its acceptance check. Done items move to `CHANGELOG.md`.

## 1. Live plugin smoke test

Load the plugin in a real Claude Code session (`claude --plugin-dir <this repo>`) in a scratch
repo and confirm: (a) "audit this repo against the framework" triggers `llmfw:audit` without the
slash form; (b) an `Edit` on a path under `generated/` is blocked by the hook with a message ending
`(llm-08)`; (c) `/plugin marketplace add vanenshi/llm-friendly-framework` + `/plugin install
llmfw@llm-friendly-framework` works from a clean machine.

Acceptance: a transcript excerpt for each of (a)–(c) attached to the closing commit.

## 2. Benchmark — does the framework change agent behaviour, and at what cost?

Three configurations, same model, same task text, scored by the framework's own gates.

### Fixture

- A tagged TypeScript service, ~15 files, two modules behind a contracts door, vertical slices.
- Planted temptations, one per rule ID: a `utils.ts`, a convenient `index.ts` barrel, a generated
  client file, a test that invites a literal route, a call site where `process.env` is the shortest
  path, a cross-module shortcut around the contracts door.
- Every run starts from the same SHA in a fresh worktree.

### Task suite

- 8–12 one-paragraph requests written as a user would type them, never naming a rule. Each task
  carries a hidden list of the rule IDs it exercises.
- Two control tasks that touch no rule, to measure the cost of loading the framework when it is not
  needed.

### Configurations

| Config        | Agent sees                                                                    |
| ------------- | ----------------------------------------------------------------------------- |
| A always-off  | fixture only — no `AGENTS.md`, no plugin                                      |
| B always-on   | fixture + 0.1-style `AGENTS.md` routing to `docs/conventions/`, no plugin     |
| C plugin      | fixture + `AGENTS.md` + `llmfw` plugin installed, hooks active                |

### Runner

- `claude -p "<task>" --output-format json` per run; 5 repetitions per task per config (pilot with
  3 tasks first). For config C prefer `claude plugin eval` where it fits.
- After each run: `oxlint`, `depcruise`, `node scripts/check-repo.mjs`, tests. Record the transcript.

### Metrics, per run

1. **Accuracy — machine-checked.** Violations per rule ID from the gates. Split into "the task's
   trap" vs collateral using the hidden list. Report rules obeyed / rules exercised.
2. **Accuracy — transcript-checked.** `con-*` and Ask-first rules: asked before a new dependency,
   wrote a handoff instead of an inline fix, ran the full gate list before "done". Grep the
   transcript for the gate commands and `.agents/handoffs/`.
3. **Token cost.** Input/output tokens from the JSON output; input split into first-turn context
   (framework load) vs the rest. Controls in config C must be near config A.
4. **Speed of edit.** Wall-clock, turns, file edits, and re-edits of the same file (the signature of
   fixing gate failures after the fact).
5. **Skill hit rate (config C only).** Which skills fired per run. A rule "obeyed" while its skill
   did not fire is luck, not the framework.

### Output

One table (rows: configs; columns: accuracy, first-turn tokens, total tokens, wall-clock,
re-edits, skill hit rate) and one per-rule heatmap. Decisions the numbers drive:

- A rule ignored in all three configs → it needs a gate, not better prose (escalation ladder).
- C matches B on accuracy and beats it on tokens → skills split validated.
- C loses on `con-*` specifically → principles go back to always-on; only rule files stay skills.
- A skill firing < 4/5 on its own task → rewrite that skill's description before trusting its row.

Acceptance: `bench/` folder with fixture, tasks, runner, and a `RESULTS.md` from at least one full
run; findings turned into gates or CHANGELOG entries.

## 3. .NET gates — recipe to implementation

`gates/stacks/dotnet.md` describes analyzers and ArchUnitNET checks that do not exist yet. Ship
them with fixtures like the TypeScript ones, or mark .NET "recipe only" in the README table.

Acceptance: a fixture solution where each rule row in `gates/README.md` has a red and a green case.

## 4. Dependency-graph report

`check-repo.mjs` is pass/fail. Emit a violation graph (depcruise `--output-type dot` or an HTML
report) so gate failures are reviewable by humans, not only greppable by agents.
