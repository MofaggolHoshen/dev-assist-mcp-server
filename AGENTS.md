# AGENTS.md

This file helps AI coding agents become productive quickly in this repository.

## Scope

- Applies to the whole repository.
- Prefer minimal, targeted changes over broad refactors.
- Keep existing public tool names and response shapes stable unless explicitly requested.

## Quick Start Commands

- Install: `npm install`
- Build: `npm run build`
- Dev server (stdio MCP): `npm run dev`
- Run compiled server: `npm start`
- Test: `npm test`

## Project Map

- `src/index.ts`: MCP server bootstrap and tool registration.
- `src/tools/types.ts`: shared `Tool` contract.
- `src/tools/registry.ts`: tool registration and lookup.
- `src/tools/fs/`: filesystem tools and path safety.
- `src/tools/knowledge/`: snippet/template/concept/setup tools.
- `src/tools/intelligence/`: project analysis tooling.
- `src/storage/markdownKnowledgeStore.ts`: markdown loading, Fuse ranking, filtering.
- `src/schemas/markdownKnowledge.ts`: frontmatter validation schemas.
- `src/shared/response.ts`: `textResponse` and `errorResponse` helpers.
- `snippets/`: reusable snippet knowledge content.
- `content/`: concepts, templates, and setup docs used by knowledge tools.
- `tests/`: Jest test suite.

## Coding Conventions

- Runtime source is ESM (`type: module`, `NodeNext` in tsconfig).
- Keep `.js` import suffixes in TypeScript source files.
- Tests compile as CommonJS via `tsconfig.test.json`; Jest maps local `.js` imports.
- Validate inputs with Zod schemas for every tool.
- Return MCP responses using `textResponse(...)` (or `errorResponse(...)`) from `src/shared/response.ts`.
- Prefer structured JSON string payloads for machine-consumable tool output.

## Safety Rules

- For filesystem access, use `resolveSafePath` from `src/tools/fs/safePath.ts`.
- Never bypass project-root boundary checks.
- Keep tool names unique in the registry.

## Common Agent Tasks

### Add a new MCP tool

1. Create `src/tools/<category>/<toolName>.ts` implementing the `Tool` interface.
2. Define a Zod `inputSchema` and `execute` handler.
3. Register the tool in `src/index.ts`.
4. Add tests in `tests/`.
5. Run `npm test` and `npm run build`.

### Add or update snippet content

1. Edit/create markdown files under `snippets/` with valid YAML frontmatter.
2. Follow schema expectations in `src/schemas/markdownKnowledge.ts`.
3. Note: frontmatter dates may be parsed as Date objects; schema normalization handles `updatedAt`.
4. Run `npm test`.

## Documentation Links (Read Before Large Changes)

- Project overview and examples: [README](README.md)
- Product requirements: [PRD v2](docs/PRD-v2.md)
- Implementation roadmap: [Implementation Plan](docs/Implementation-Plan.md)
- Publishing workflow: [Publish Guide](docs/Publish.md)
- Usage examples: [examples](examples/)
