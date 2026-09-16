/** @type {import('dependency-cruiser').IConfiguration} */
// Module and feature boundaries (vs-04, vs-11, llm-03). Rule names are the convention IDs so the
// failure output routes the agent to the paragraph. Adjust `path` globs to your layout only.
module.exports = {
  forbidden: [
    {
      name: "vs-04-module-boundaries",
      comment: "A module reaches another module only through its contracts folder (vs-04).",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/([^/]+)/",
        pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/contracts/"],
      },
    },
    {
      name: "vs-04-contracts-depend-on-nothing",
      comment: "A contracts folder imports only the runtime and other contracts (vs-04).",
      severity: "error",
      from: { path: "^src/modules/[^/]+/contracts/" },
      to: { path: "^src/", pathNot: ["^src/modules/[^/]+/contracts/", "^src/kernel/types/"] },
    },
    {
      name: "vs-11-feature-doors",
      comment: "A feature imports another feature only via its public.ts (vs-11).",
      severity: "error",
      from: { path: "^src/features/([^/]+)/" },
      to: {
        path: "^src/features/([^/]+)/",
        pathNot: ["^src/features/$1/", "^src/features/[^/]+/public\\.tsx?$"],
      },
    },
    {
      name: "llm-03-gen-untouched",
      comment:
        "Generated client is imported by its declared consumers only; nothing re-exports it (llm-03, llm-08).",
      severity: "error",
      from: { pathNot: ["^src/api/client\\.ts$", "^src/api/gen/", "^src/features/"] },
      to: { path: "^src/api/gen/" },
    },
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
