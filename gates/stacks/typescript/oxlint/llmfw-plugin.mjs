// llmfw — Oxlint/ESLint-compatible custom rules that turn conventions/*.md into build failures.
//
// Written against the ESLint rule API subset Oxlint's `jsPlugins` supports (context.filename,
// context.options, context.sourceCode.{text,getAllComments}, context.report({node,message})), so the
// same file loads under Oxlint (`jsPlugins`) or ESLint 9 flat config unchanged.
//
// Every rule: one convention ID in `meta.docs.ruleId`, one message that names the ID, one fixture
// pair under ./fixtures/<rule>/{bad,good}.ts. Add a rule by copying the smallest one
// (`no-grab-bag-file`) — see ./README.md § Adding a rule.

import path from "node:path";

const rule = (ruleId, description, create, { schema = [], fixable } = {}) => ({
  meta: { type: "problem", docs: { description, ruleId }, schema, fixable },
  create,
});

const basename = (file) => file.split(/[\\/]/).pop();
const isTestFile = (file) => /\.(spec|test)\.[cm]?[jt]sx?$/.test(file);

// llm-03 — no `export *` and no re-export hubs.
const noBarrel = rule(
  "llm-03",
  "No barrels: import the real source, never a re-export hub.",
  (context) => ({
    ExportAllDeclaration(node) {
      context.report({
        node,
        message: "`export *` is a barrel — import the real source (llm-03).",
      });
    },
    ExportNamedDeclaration(node) {
      if (node.source && /^index\./.test(basename(context.filename)))
        context.report({
          node,
          message: "index re-export is a barrel — import the real source (llm-03).",
        });
    },
  }),
);

// llm-02 — file path predicts content; grab-bag names are banned.
const noGrabBagFile = rule(
  "llm-02",
  "No utils/helpers/misc/common grab-bag files.",
  (context) => {
    const names = context.options[0]?.names ?? [
      "utils",
      "util",
      "helpers",
      "helper",
      "misc",
      "common",
      "shared",
      "stuff",
    ];
    const stem = basename(context.filename)
      .replace(/\.[^.]+$/, "")
      .replace(/\.(spec|test)$/, "");
    return {
      Program(node) {
        if (names.includes(stem))
          context.report({
            node,
            message: `"${stem}" is a grab-bag file name — name the file after the one thing it does (llm-02).`,
          });
      },
    };
  },
  {
    schema: [
      { type: "object", properties: { names: { type: "array", items: { type: "string" } } } },
    ],
  },
);

// llm-01 — identifiers (routes, keys, event types) are one literal, never assembled.
const noComposedIdentifier = rule(
  "llm-01",
  "A route/key/event-type constant is one unbroken literal.",
  (context) => {
    const namePattern = new RegExp(
      context.options[0]?.namePattern ?? "(route|path|key|event|topic|claim)$",
      "i",
    );
    const composed = (init) =>
      (init?.type === "TemplateLiteral" && init.expressions.length > 0) ||
      (init?.type === "BinaryExpression" && init.operator === "+") ||
      (init?.type === "CallExpression" && init.callee?.property?.name === "concat");
    const check = (node, name, init) => {
      if (namePattern.test(name) && composed(init))
        context.report({
          node,
          message: `"${name}" is assembled at runtime — grep cannot find it. Declare one literal string (llm-01).`,
        });
    };
    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier") check(node, node.id.name, node.init);
      },
      Property(node) {
        const key = node.key?.name ?? node.key?.value;
        if (typeof key === "string") check(node, key, node.value);
      },
      PropertyDefinition(node) {
        if (node.key?.type === "Identifier") check(node, node.key.name, node.value);
      },
    };
  },
  { schema: [{ type: "object", properties: { namePattern: { type: "string" } } }] },
);

// llm-06 — files fit a context window.
const maxFileLines = rule(
  "llm-06",
  "A source file stays under the line limit.",
  (context) => {
    const max = context.options[0]?.max ?? 300;
    return {
      Program(node) {
        const lines = context.sourceCode.text.split("\n").length;
        if (lines > max)
          context.report({
            node,
            message: `${lines} lines, limit ${max} — has this file grown a second responsibility? (llm-06)`,
          });
      },
    };
  },
  { schema: [{ type: "object", properties: { max: { type: "integer" } } }] },
);

// llm-10 — a known cut is `DEBT #N`, never a bare TODO.
const noBareTodo = rule(
  "llm-10",
  "TODO/FIXME/HACK must be a DEBT #N with a ledger line.",
  (context) => ({
    Program() {
      for (const c of context.sourceCode.getAllComments()) {
        if (/\b(TODO|FIXME|HACK|XXX)\b/.test(c.value) && !/DEBT #\d+/.test(c.value))
          context.report({
            node: c,
            message:
              "Bare TODO — write `// DEBT #N: what — ceiling` and add the ledger line (llm-10).",
          });
      }
    },
  }),
);

// tst-04 — tests reference the slice's route const, never a literal path.
const noLiteralRouteInTest = rule(
  "tst-04",
  "Tests use Slice.ROUTE, not a literal path.",
  (context) => {
    if (!isTestFile(context.filename)) return {};
    const callees = new Set(
      context.options[0]?.callees ?? [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "goto",
        "fetch",
        "request",
        "visit",
      ],
    );
    return {
      CallExpression(node) {
        const name =
          node.callee.type === "Identifier" ? node.callee.name : node.callee.property?.name;
        if (!callees.has(name)) return;
        const arg = node.arguments[0];
        const literal =
          arg?.type === "Literal" && typeof arg.value === "string"
            ? arg.value
            : arg?.type === "TemplateLiteral" && arg.quasis.length === 1
              ? arg.quasis[0].value.cooked
              : null;
        if (literal && /^\/[a-z0-9-]+(\/|$)/i.test(literal) && !/^\/\//.test(literal))
          context.report({
            node: arg,
            message: `Literal route "${literal}" in a test — reference the slice's ROUTE const so a rename cannot leave a green test hitting a 404 (tst-04).`,
          });
      },
    };
  },
  {
    schema: [
      { type: "object", properties: { callees: { type: "array", items: { type: "string" } } } },
    ],
  },
);

// llm-12 — process.env is read in exactly one module.
const noEnvOutsideConfig = rule(
  "llm-12",
  "process.env only inside the one config module.",
  (context) => {
    const allow = new RegExp(context.options[0]?.allow ?? "(^|/)src/env\\.[cm]?[jt]s$");
    if (allow.test(context.filename.replace(/\\/g, "/"))) return {};
    return {
      MemberExpression(node) {
        if (
          node.object.type === "Identifier" &&
          node.object.name === "process" &&
          node.property?.name === "env"
        )
          context.report({
            node,
            message:
              "process.env outside the config module — import the typed `env` object instead (llm-12).",
          });
      },
    };
  },
  { schema: [{ type: "object", properties: { allow: { type: "string" } } }] },
);

// vs-11 — a feature imports another feature only through its public file.
const noCrossFeatureInternalImport = rule(
  "vs-11",
  "Cross-feature imports go through the feature's public file.",
  (context) => {
    const featuresRoot = context.options[0]?.featuresRoot ?? "features";
    const publicFile = context.options[0]?.publicFile ?? "public";
    const re = new RegExp(`(?:^|/)${featuresRoot}/([^/]+)(?:/(.*))?$`);
    const file = context.filename.replace(/\\/g, "/");
    const here = re.exec(file)?.[1];
    if (!here) return {};
    // A relative specifier is resolved against the importing file so `../catalog/x` becomes
    // `.../features/catalog/x`; an alias (`@/features/catalog/x`) already contains the root.
    const resolve = (spec) =>
      spec.startsWith(".") ? path.posix.join(path.posix.dirname(file), spec) : spec;
    return {
      ImportDeclaration(node) {
        const m = re.exec(resolve(node.source.value));
        if (!m || m[1] === here) return;
        const inner = (m[2] ?? "").replace(/\.[cm]?[jt]sx?$/, "");
        if (inner && inner !== publicFile)
          context.report({
            node,
            message: `Feature "${here}" imports "${m[1]}/${m[2]}" — only "${m[1]}/${publicFile}" is a door (vs-11).`,
          });
      },
    };
  },
  {
    schema: [
      {
        type: "object",
        properties: { featuresRoot: { type: "string" }, publicFile: { type: "string" } },
      },
    ],
  },
);

// vs-01 — slice section order: ROUTE before types before handler.
const sliceSectionOrder = rule(
  "vs-01",
  "In a slice file, the route const is declared before the handler.",
  (context) => {
    const routeName = new RegExp(context.options[0]?.routeName ?? "^(ROUTE|Route)$");
    const handlerName = new RegExp(context.options[0]?.handlerName ?? "^(handle|Handle|handler)$");
    return {
      Program(program) {
        let routeIdx = -1;
        let handlerIdx = -1;
        program.body.forEach((stmt, i) => {
          const decl = stmt.type === "ExportNamedDeclaration" ? stmt.declaration : stmt;
          const names =
            decl?.type === "VariableDeclaration"
              ? decl.declarations.map((d) => d.id?.name).filter(Boolean)
              : decl?.type === "FunctionDeclaration" && decl.id
                ? [decl.id.name]
                : [];
          for (const n of names) {
            if (routeName.test(n) && routeIdx < 0) routeIdx = i;
            if (handlerName.test(n) && handlerIdx < 0) handlerIdx = i;
          }
        });
        if (routeIdx >= 0 && handlerIdx >= 0 && handlerIdx < routeIdx)
          context.report({
            node: program.body[handlerIdx],
            message:
              "Handler is declared before the route const — contract first, logic last (vs-01, llm-05).",
          });
      },
    };
  },
  {
    schema: [
      {
        type: "object",
        properties: { routeName: { type: "string" }, handlerName: { type: "string" } },
      },
    ],
  },
);

export default {
  meta: { name: "llmfw", version: "0.1.0" },
  rules: {
    "no-barrel": noBarrel,
    "no-grab-bag-file": noGrabBagFile,
    "no-composed-identifier": noComposedIdentifier,
    "max-file-lines": maxFileLines,
    "no-bare-todo": noBareTodo,
    "no-literal-route-in-test": noLiteralRouteInTest,
    "no-env-outside-config": noEnvOutsideConfig,
    "no-cross-feature-internal-import": noCrossFeatureInternalImport,
    "slice-section-order": sliceSectionOrder,
  },
};
