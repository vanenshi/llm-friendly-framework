# .NET stack gates

C# has the strongest built-in gate ladder of any mainstream stack: compiler warnings as errors,
Roslyn analyzers configured per rule in `.editorconfig`, and reflection-based architecture tests
that run with the unit tests. The gap Oxlint fills for TypeScript is filled here by
**ArchUnitNET + `.editorconfig` severities**; a custom Roslyn analyzer is the last resort.

## Layer 1 — compiler (`Directory.Build.props`)

```xml
<Project>
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <AnalysisLevel>latest-all</AnalysisLevel>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <InvariantGlobalization>true</InvariantGlobalization>   <!-- con-15: `new CultureInfo("fa")` throws -->
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Meziantou.Analyzer" PrivateAssets="all" />
    <PackageReference Include="SonarAnalyzer.CSharp" PrivateAssets="all" />
    <PackageReference Include="Microsoft.CodeAnalysis.BannedApiAnalyzers" PrivateAssets="all" />
  </ItemGroup>
</Project>
```

`global.json` pins the SDK with `"rollForward": "disable"` (`vc-10`): analyzers ship with the SDK,
so a drifting patch makes `-warnaserror` disagree between machines. `check-repo toolchain-version`
asserts every Dockerfile agrees.

## Layer 2 — formatter

`dotnet csharpier check .` and `dotnet format style --verify-no-changes`. Both in the gate list; both
in CI; never discussed in review.

## Layer 3 — analyzer severities (`.editorconfig`)

Each line carries the convention ID it enforces. Severity `error` fails the build.

```ini
[*.cs]
# llm-10 — bare TODO is a failure; DEBT #N is the only allowed form
dotnet_diagnostic.MA0026.severity = error   # Meziantou: TODO comment
dotnet_diagnostic.S1135.severity = error    # Sonar: track TODO

# err-06 — no swallowed failures
dotnet_diagnostic.CA1031.severity = error   # do not catch general exception types
dotnet_diagnostic.S2486.severity = error    # exceptions should not be ignored
dotnet_diagnostic.S108.severity = error     # empty block

# con-14 — async work is awaited
dotnet_diagnostic.CA2007.severity = none    # ConfigureAwait noise off in app code
dotnet_diagnostic.MA0004.severity = none
dotnet_diagnostic.CS4014.severity = error   # unawaited task
dotnet_diagnostic.MA0040.severity = error   # forward the CancellationToken

# con-15 — culture is never ambient
dotnet_diagnostic.CA1305.severity = error   # IFormatProvider
dotnet_diagnostic.CA1310.severity = error   # StringComparison
dotnet_diagnostic.MA0011.severity = error

# con-06 / llm-11 — no `!` null-forgiving in Domain/ and Features/
[**/Domain/**.cs]
dotnet_diagnostic.CS8602.severity = error
[**/Features/**.cs]
dotnet_diagnostic.S3060.severity = error    # "is" should not be used with "this"
```

## Layer 3b — banned APIs (`BannedSymbols.txt`)

`Microsoft.CodeAnalysis.BannedApiAnalyzers` reads one file; each line is a rule with its ID:

```
M:System.Environment.GetEnvironmentVariable(System.String); llm-12 — read config through Settings only
M:System.DateTime.get_Now; con-15 — use TimeProvider
M:System.DateTimeOffset.get_Now; con-15 — use TimeProvider
P:System.Globalization.CultureInfo.CurrentCulture; con-15 — never set or read ambient culture
M:Microsoft.EntityFrameworkCore.RelationalEntityTypeBuilderExtensions.ToTable``1(...); be-10 — table names come from the convention
M:Microsoft.EntityFrameworkCore.ModelBuilder.ApplyConfigurationsFromAssembly(System.Reflection.Assembly); llm-04 — list configurations explicitly
M:FluentValidation.DependencyInjectionExtensions.AddValidatorsFromAssembly(...); llm-04 — construct validators at the call site
M:Microsoft.EntityFrameworkCore.DbContext.SaveChanges; be — use SaveChangesAsync inside the request transaction
```

Exempt the one config module with an `.editorconfig` section that sets `RS0030.severity = none` for
`**/Settings.cs`.

## Layer 6 — architecture tests (ArchUnitNET or plain reflection)

One test project, `Architecture.Tests`, runs over the explicit module list (`vs-06`) — the same
list the host uses, so a module cannot be registered and skipped by every rule. Skeletons (xunit):

```csharp
// vs-04 — a module references other modules only through their .Contracts
[Fact] public void A_module_references_other_modules_only_through_their_Contracts()
{
    foreach (var module in Modules.Assemblies)
    foreach (var reference in module.GetReferencedAssemblies())
        if (reference.Name!.StartsWith("App.Modules.") && !reference.Name.EndsWith(".Contracts"))
            Assert.Fail($"{module.GetName().Name} references {reference.Name} directly (vs-04)");
}

// vs-04 — a .Contracts assembly depends on nothing but the runtime
[Fact] public void A_contracts_assembly_depends_on_nothing_but_the_runtime() { /* referenced names all start with System. */ }

// vs-01 — every slice: static class in Features/, nested `Route` const string starting with "/", nested sealed Endpoint
[Fact] public void Every_endpoint_is_a_sealed_nested_class_of_a_static_slice_in_Features() { /* reflection over IEndpoint implementers */ }

// tst-01 — every slice has a <Slice>Tests class in the module's test assembly
public static void EverySliceHasTests(Assembly module, Assembly tests) { /* FeatureCoverageAssert */ }

// vs-09 / be — schema conventions per module: snake_case, no FK leaves the schema, tenant filter present, DateTimeOffset only
public static void AllIdentifiersFollowConventions(DbContext db, string schema) { /* SchemaConventionsAssert */ }

// con-15 — Domain/ types store instants as DateTimeOffset
[Fact] public void Domain_types_store_instants_as_DateTimeOffset() { /* no DateTime property in Domain namespace */ }

// err-01 — every exception is sealed and derives from a status base; every key has a message per locale
[Fact] public void Every_error_has_a_message_in_every_locale() { /* ErrorCatalogTests */ }
```

Each module's test project wires the shared assertions in two one-line tests
(`FeatureCoverageTests`, `SchemaTests`); a new module copies the two lines. Missing them is caught
by a meta-test over `Modules.Assemblies` that asserts each has a test assembly with both.

## Layer 9 — startup guards

Things only the composed host knows, asserted once at startup so they fail in the test host too:

- `vs-07` — every endpoint tagged as a slice endpoint declares `AllowAnonymous` or an authorization
  requirement; otherwise `app.AssertEndpoints()` throws before listening.
- `err-03` — every problem response has a non-empty `detail`; a kernel backfill covers
  framework-produced 404/400s and a test asserts it on every problem assertion helper.
- `be-12` — startup is database-free: the test host and OpenAPI build-time generation both run
  `Program` with no database reachable.

## Layer 7 — `check-repo.mjs`

.NET-relevant entries in `llmfw.config.json`: `forbiddenPatterns` for `*FromAssembly`/`.Scan(`
(`llm-04`) and `// TODO` (`llm-10`); `source.fileSize` with `**/Migrations/**` exempt (`llm-06`);
`toolchain` for `global.json` ↔ Dockerfiles (`vc-10`); `scopeCards` for `src/Modules/*`.

## Layer 8 — CI drift

```yaml
- run: dotnet build && pnpm gen:api && git diff --exit-code src/Api/openapi web/src/api/gen
- run: dotnet ef migrations has-pending-model-changes --project src/Modules/<M> # per module
```

## When to write a Roslyn analyzer

Only when a rule has an AST shape, no analyzer package has it, and ArchUnit cannot see it (it works
on metadata, not syntax): e.g. "a `Route` const is never an interpolated string" (`llm-01`). Cost is
a project + a test project; do it on the third violation, not the second — until then the regex in
`check-repo forbiddenPatterns` (`Route\s*=\s*\$"`) is the gate.
