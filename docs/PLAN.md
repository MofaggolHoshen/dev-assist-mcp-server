# DevAssist MCP Server — Implementation Plan

stdio-based MCP server in TypeScript exposing file system, knowledge, and project intelligence tools to AI clients (Copilot, ChatGPT). Uses `@modelcontextprotocol/sdk` with a plugin-based tool architecture. Local-first, no cloud dependency.

---

## Phase 1 — Project Scaffolding

Set up the TypeScript project with MCP SDK and a minimal working server.

| #   | Step                                                                      | Status  |
| --- | ------------------------------------------------------------------------- | ------- |
| 1.1 | Init `package.json` — `type: module`, scripts (`build`, `start`, `dev`)   | ✅ Done |
| 1.2 | Add deps: `@modelcontextprotocol/sdk`, `zod`, `glob`, `typescript`, `tsx` | ✅ Done |
| 1.3 | Create `tsconfig.json` — ES2022, NodeNext, `dist/`, strict mode           | ✅ Done |
| 1.4 | Create `src/index.ts` — MCP `Server` + stdio transport bootstrap          | ✅ Done |
| 1.5 | Verify build compiles and server responds to MCP `initialize`             | ✅ Done |

### Step 1.1 — `package.json`

Creates the project manifest. Key settings:

- **`"type": "module"`** — enables native ES module imports (`import`/`export` instead of `require`). Required because the MCP SDK ships as ESM.
- **Scripts:**
  - `"build": "tsc"` — compiles TypeScript to JavaScript in `dist/`
  - `"start": "node dist/index.js"` — runs the compiled server (production)
  - `"dev": "tsx src/index.ts"` — runs TypeScript directly without compiling (fast dev iteration)

```bash
npm init -y
# then edit package.json to add "type": "module" and the scripts above
```

### Step 1.2 — Install Dependencies

| Package                     | Type | Purpose                                                                                                            |
| --------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| `@modelcontextprotocol/sdk` | prod | Official MCP SDK — `Server` class, request/response schemas, `StdioServerTransport` for JSON-RPC over stdin/stdout |
| `zod`                       | prod | Schema validation — the SDK uses Zod schemas to define and validate tool inputs                                    |
| `glob`                      | prod | File pattern matching — used by `list_files` and `search_code` to walk directories                                 |
| `typescript`                | dev  | TypeScript compiler — transpiles `.ts` → `.js`                                                                     |
| `tsx`                       | dev  | TypeScript executor — runs `.ts` files directly in Node, used by the `dev` script                                  |

```bash
npm install @modelcontextprotocol/sdk zod glob
npm install -D typescript tsx
```

### Step 1.3 — `tsconfig.json`

TypeScript compiler configuration:

- **`"target": "ES2022"`** — emit modern JS (top-level await, private fields). Node 18+ supports this.
- **`"module": "NodeNext"`** — use Node's native ESM resolution (matches `"type": "module"` in package.json).
- **`"moduleResolution": "NodeNext"`** — pairs with module setting for proper `node_modules` and exports map resolution.
- **`"outDir": "dist"`** — compiled JS goes to `dist/`, keeping `src/` clean.
- **`"rootDir": "src"`** — compiler only looks at `src/` for input files.
- **`"strict": true`** — enables all strict type-checking flags (null checks, no implicit any, etc.).
- **`"esModuleInterop": true`** — allows `import x from 'cjs-package'` syntax with CommonJS packages.

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
  },
  "include": ["src"],
}
```

### Step 1.4 — `src/index.ts` (Entry Point)

The minimal MCP server bootstrap. Three things happen:

1. **Create a `Server` instance** — from `@modelcontextprotocol/sdk/server`. Takes a server name + version and declares capabilities (e.g., `{ tools: {} }`).
2. **Create a `StdioServerTransport`** — from `@modelcontextprotocol/sdk/server/stdio`. Reads JSON-RPC messages from **stdin** and writes responses to **stdout**. This is how VS Code / Copilot communicates with the server.
3. **Call `server.connect(transport)`** — starts listening for MCP requests.

At this point no tools are registered yet (Phase 2). The server handles `initialize` and returns an empty `tools/list`.

**Why stdio?** MCP clients launch the server as a child process and communicate over stdin/stdout. No HTTP, no ports, no network — simple and secure.

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "dev-assist-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Step 1.5 — Verification

1. **`npm run build`** — should compile `src/index.ts` → `dist/index.js` with zero errors.
2. **`node dist/index.js`** — should start the server (sits waiting for stdin since no client is connected).
3. Optionally pipe a raw MCP `initialize` JSON-RPC message and confirm a response — or defer to Phase 2 where the MCP Inspector makes this easier.

---

## Phase 2 — Extensible Tool System

Core infrastructure: a `Tool` interface and registry so tools are self-contained, pluggable modules.

| #   | Step                                                                                             | Status         |
| --- | ------------------------------------------------------------------------------------------------ | -------------- |
| 2.1 | Define `Tool` interface (`src/tools/types.ts`) — name, description, Zod input schema, execute fn | ✅ Done |
| 2.2 | Create `ToolRegistry` (`src/tools/registry.ts`) — register / list / get by name                  | ✅ Done |
| 2.3 | Wire registry into `src/index.ts` — `ListTools` + `CallTool` handlers dispatch to registry       | ✅ Done |
| 2.4 | Verify with a dummy `ping` tool round-trip                                                       | ✅ Done |

### Step 2.1 — `Tool` Interface (`src/tools/types.ts`)

Define a contract that every tool must implement. This is what makes the system pluggable — any new tool just needs to conform to this shape.

```typescript
import { z } from "zod";

export interface Tool {
  name: string; // unique tool name, e.g. "list_files"
  description: string; // shown to AI clients so they know when to use it
  inputSchema: z.ZodObject<any>; // Zod schema defining accepted parameters
  execute(input: any): Promise<{ content: { type: string; text: string }[] }>;
}
```

- **`inputSchema`** — a Zod object. The SDK converts this to JSON Schema automatically for the `tools/list` response.
- **`execute`** — receives validated input, returns MCP-formatted content (array of `{ type: "text", text: "..." }`).

### Step 2.2 — `ToolRegistry` (`src/tools/registry.ts`)

A simple in-memory registry. Three methods:

- **`register(tool)`** — stores the tool by name. Throws if a duplicate name is registered.
- **`list()`** — returns all registered tools (used by the `tools/list` handler).
- **`get(name)`** — looks up a tool by name (used by the `tools/call` handler).

```typescript
import { Tool } from "./types.js";

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    /* store in map, throw on duplicate */
  }
  list(): Tool[] {
    /* return Array.from(this.tools.values()) */
  }
  get(name: string): Tool | undefined {
    /* return this.tools.get(name) */
  }
}
```

### Step 2.3 — Wire Registry into `src/index.ts`

Add two MCP request handlers to the server:

1. **`ListToolsRequestSchema`** — iterates `registry.list()`, converts each tool's Zod schema to JSON Schema via `zodToJsonSchema()`, and returns the tool catalog.
2. **`CallToolRequestSchema`** — receives `{ name, arguments }`, looks up the tool via `registry.get(name)`, validates input against the tool's Zod schema, calls `tool.execute(input)`, and returns the result.

```typescript
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema"; // you'll need: npm install zod-to-json-schema

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: registry.list().map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.inputSchema),
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = registry.get(req.params.name);
  if (!tool) throw new Error(`Unknown tool: ${req.params.name}`);
  const input = tool.inputSchema.parse(req.params.arguments);
  return await tool.execute(input);
});
```

> **Note:** You'll also need to `npm install zod-to-json-schema` as a prod dependency.

### Step 2.4 — Verify with a Dummy `ping` Tool

Create a minimal tool to test the full round-trip:

```typescript
// src/tools/ping.ts
import { z } from "zod";
import { Tool } from "./types.js";

export const pingTool: Tool = {
  name: "ping",
  description: "Returns pong — used to verify the server is working",
  inputSchema: z.object({}),
  execute: async () => ({ content: [{ type: "text", text: "pong" }] }),
};
```

Register it in `src/index.ts`: `registry.register(pingTool);`

**Test it:** Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) or pipe JSON-RPC into stdin. You should see `"pong"` in the response. Remove the ping tool after confirming.

---

## Phase 3 — File System Tools

Expose the project's file system to AI clients. **Path traversal protection on every tool.**

| #   | Step                                                                                      | Status         |
| --- | ----------------------------------------------------------------------------------------- | -------------- |
| 3.1 | `list_files` (`src/tools/fs/listFiles.ts`) — directory tree via `glob`                    | ✅ Done |
| 3.2 | `read_file` (`src/tools/fs/readFile.ts`) — return file content as text                    | ✅ Done |
| 3.3 | `search_code` (`src/tools/fs/searchCode.ts`) — keyword search, return file + line matches | ✅ Done |
| 3.4 | Validate all resolved paths stay within project root (security)                           | ✅ Done |
| 3.5 | Verify each tool against the server's own repo                                            | ✅ Done |

### Step 3.1 — `list_files` Tool

**File:** `src/tools/fs/listFiles.ts`

- **Input:** `{ path?: string }` — optional subdirectory to list (defaults to project root).
- **Behavior:** Uses `glob` with pattern `**/*` under the resolved path. Returns a newline-separated list of relative file paths.
- **Ignores:** `node_modules/`, `dist/`, `.git/` by default.

```typescript
inputSchema: z.object({
  path: z
    .string()
    .optional()
    .describe("Subdirectory to list (default: project root)"),
});
```

### Step 3.2 — `read_file` Tool

**File:** `src/tools/fs/readFile.ts`

- **Input:** `{ path: string }` — relative path to the file.
- **Behavior:** Reads the file using `fs.readFile(resolvedPath, "utf-8")` and returns the content as text.
- **Error handling:** Return a clear error message if the file doesn't exist or is binary.

```typescript
inputSchema: z.object({
  path: z.string().describe("Relative path to the file to read"),
});
```

### Step 3.3 — `search_code` Tool

**File:** `src/tools/fs/searchCode.ts`

- **Input:** `{ keyword: string, path?: string }` — search term and optional directory scope.
- **Behavior:** Walks all files under the path (using `glob`), reads each file, searches line-by-line for the keyword (case-insensitive). Returns matches as `file:line: content`.
- **Performance:** Skip binary files (check extension or use a quick byte check). Limit results (e.g., max 50 matches) to avoid huge responses.

```typescript
inputSchema: z.object({
  keyword: z.string().describe("Text to search for in file contents"),
  path: z
    .string()
    .optional()
    .describe("Subdirectory to scope the search (default: project root)"),
});
```

### Step 3.4 — Path Traversal Protection (Security)

**Critical.** Every FS tool must validate that the resolved path stays inside the project root. Create a shared utility:

```typescript
// src/tools/fs/safePath.ts
import path from "node:path";

const PROJECT_ROOT = process.cwd();

export function resolveSafePath(relativePath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, relativePath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error("Access denied: path is outside the project root");
  }
  return resolved;
}
```

- Call `resolveSafePath()` at the top of every FS tool's `execute` method.
- This blocks `../../etc/passwd` and similar path traversal attacks.
- Use `process.cwd()` as the root — the server is launched from the project directory.

### Step 3.5 — Verification

Test each tool against the server's own repo:

- `list_files` with no args → should return the project's file tree
- `read_file` with `"src/index.ts"` → should return the entry point source
- `search_code` with `"StdioServerTransport"` → should find the import in `src/index.ts`
- Try `read_file` with `"../../etc/passwd"` → should get "Access denied" error

---

## Phase 4 — Knowledge Tools

_(Can run in parallel with Phase 3)_

Serve reusable code snippets (Polly retry, EF Core patterns, JWT setup, etc.).

| #   | Step                                                                                 | Status         |
| --- | ------------------------------------------------------------------------------------ | -------------- |
| 4.1 | Create `snippets/` data dir with JSON/MD snippet files                               | ✅ Done |
| 4.2 | `get_snippet` (`src/tools/knowledge/getSnippet.ts`) — lookup by name, return content | ✅ Done |
| 4.3 | Verify snippet retrieval                                                             | ✅ Done |

### Step 4.1 — Create Snippet Data Files

Create a `snippets/` directory at the project root with one JSON file per snippet. Each file contains metadata + the code:

```
snippets/
  polly-retry.json
  efcore-repository.json
  jwt-setup.json
```

**Snippet file format:**

```json
{
  "name": "polly-retry",
  "title": "Polly Retry Policy (.NET)",
  "language": "csharp",
  "description": "Configures an HTTP retry policy with exponential backoff using Polly",
  "code": "builder.Services.AddHttpClient(\"MyClient\")\n  .AddTransientHttpErrorPolicy(p =>\n    p.WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt))));"
}
```

Start with 3–5 snippets covering common patterns from the PRD (Polly, EF Core, JWT). You can add more later — the tool auto-discovers files in the `snippets/` folder.

### Step 4.2 — `get_snippet` Tool

**File:** `src/tools/knowledge/getSnippet.ts`

- **Input:** `{ name: string }` — the snippet name (e.g., `"polly-retry"`).
- **Behavior:**
  1. Look for `snippets/{name}.json` on disk.
  2. Parse the JSON file.
  3. Return the snippet's title, description, language, and code block as formatted text.
- **If not found:** Return a helpful message listing available snippet names (read the `snippets/` directory).

```typescript
inputSchema: z.object({
  name: z.string().describe("Snippet name, e.g. 'polly-retry', 'jwt-setup'"),
});
```

> **Security note:** Validate that the `name` doesn't contain path separators (`/`, `\`, `..`). Only allow alphanumeric + hyphens.

### Step 4.3 — Verification

- `get_snippet` with `"polly-retry"` → should return the formatted Polly code
- `get_snippet` with `"nonexistent"` → should list available snippets
- `get_snippet` with `"../../etc/passwd"` → should be rejected by the name validator

---

## Phase 5 — Project Intelligence

Detect language, framework, and architecture by scanning marker files.

| #   | Step                                                                                                      | Status         |
| --- | --------------------------------------------------------------------------------------------------------- | -------------- |
| 5.1 | `analyze_project` (`src/tools/intelligence/analyzeProject.ts`) — scan project root                        | ✅ Done |
| 5.2 | Detection rules: `*.csproj`→.NET, `package.json`→Node, `angular.json`→Angular, `Dockerfile`→containerized | ✅ Done |
| 5.3 | Return `{ language, framework, architecture, files_count }`                                               | ✅ Done |
| 5.4 | Verify against sample projects                                                                            | ✅ Done |

### Step 5.1 — `analyze_project` Tool

**File:** `src/tools/intelligence/analyzeProject.ts`

- **Input:** `{ path?: string }` — optional project root override (defaults to `process.cwd()`).
- **Behavior:** Reads the top-level directory and checks for the presence of specific marker files/patterns.
- Uses `fs.readdir` and `glob` — no heavy indexing, just file existence checks.

```typescript
inputSchema: z.object({
  path: z
    .string()
    .optional()
    .describe("Project root to analyze (default: server working directory)"),
});
```

### Step 5.2 — Detection Rules

Implement as a simple rules table. Scan for these markers:

| Marker File / Pattern                  | Detected As                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `*.csproj` or `*.sln`                  | Language: **C# / .NET**                                                               |
| `package.json`                         | Language: **JavaScript / TypeScript** (check for `typescript` in deps to distinguish) |
| `go.mod`                               | Language: **Go**                                                                      |
| `requirements.txt` or `pyproject.toml` | Language: **Python**                                                                  |
| `angular.json`                         | Framework: **Angular**                                                                |
| `next.config.*`                        | Framework: **Next.js**                                                                |
| `vite.config.*`                        | Framework: **Vite**                                                                   |
| `Program.cs` + `*.csproj`              | Framework: **ASP.NET Core** (check csproj for `Microsoft.AspNetCore`)                 |
| `Dockerfile`                           | Flag: **containerized**                                                               |
| `docker-compose.yml`                   | Flag: **multi-container**                                                             |
| `src/` + `tests/` or `test/`           | Architecture hint: **standard src/test layout**                                       |
| `*.sln` + multiple `*.csproj`          | Architecture hint: **multi-project solution**                                         |

Rules are checked in order. Multiple can match (a project can be .NET + Angular + containerized).

### Step 5.3 — Structured Result

Return a JSON object like:

```json
{
  "language": ["TypeScript"],
  "framework": ["Node.js", "MCP SDK"],
  "architecture": ["standard src layout"],
  "containerized": false,
  "files_count": 42
}
```

- `language` and `framework` are arrays — a monorepo may have multiple.
- `files_count` — total files found (excluding `node_modules`, `.git`, `dist`).
- Format as readable text in the MCP response so AI clients can consume it naturally.

### Step 5.4 — Verification

Test against different project types:

- **This repo** → should detect TypeScript, Node.js, MCP SDK, standard src layout
- **A .NET repo** (if available) → should detect C#, ASP.NET Core
- **An Angular repo** → should detect TypeScript, Angular
- Edge case: empty directory → should return empty arrays and `files_count: 0`

---

## Phase 6 — Configuration & Polish

| #   | Step                                                        | Status         |
| --- | ----------------------------------------------------------- | -------------- |
| 6.1 | MCP config example for VS Code (`.vscode/mcp.json` snippet) | ✅ Done |
| 6.2 | `README.md` — setup, tool catalog, usage examples           | ✅ Done |
| 6.3 | `.gitignore` — node_modules, dist                           | ✅ Done |
| 6.4 | End-to-end verification in VS Code Copilot                  | ✅ Done |

### Step 6.1 — VS Code MCP Config

Create a `.vscode/mcp.json` (or document the `settings.json` snippet) so users can register the server with VS Code Copilot:

```jsonc
// .vscode/mcp.json
{
  "servers": {
    "dev-assist": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "${workspaceFolder}",
    },
  },
}
```

- **`type: "stdio"`** — tells VS Code to launch the process and communicate via stdin/stdout.
- **`cwd`** — ensures FS tools resolve paths relative to the current workspace.

### Step 6.2 — `README.md`

Write a README covering:

1. **What it is** — one-paragraph description of the MCP server.
2. **Quick start** — `npm install`, `npm run build`, configure in VS Code.
3. **Tool catalog** — table with each tool's name, description, and input params.
4. **Adding custom tools** — how to create a new tool module and register it.
5. **Snippet authoring** — how to add new snippet files.

### Step 6.3 — `.gitignore`

```
node_modules/
dist/
*.tsbuildinfo
```

Keep it minimal. Only ignore build outputs and dependencies.

### Step 6.4 — End-to-End Verification

Final checklist:

1. `npm run build` — no errors
2. Configure in VS Code using the `.vscode/mcp.json`
3. Open Copilot Chat → verify the server appears in the MCP server list
4. Test each tool from chat:
   - Ask Copilot to list files → triggers `list_files`
   - Ask to read a specific file → triggers `read_file`
   - Ask to search for a keyword → triggers `search_code`
   - Ask for a code snippet → triggers `get_snippet`
   - Ask "what kind of project is this?" → triggers `analyze_project`
5. Confirm all responses are accurate and well-formatted

---

## Key Decisions

| Decision                            | Rationale                                                               |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `@modelcontextprotocol/sdk` + stdio | Official SDK, standard MCP transport                                    |
| `zod` for input schemas             | Required by the SDK for tool input validation                           |
| Local-first, no cloud               | PRD non-goal — v1 has no cloud dependency                               |
| Path traversal guard on FS tools    | OWASP security requirement                                              |
| Plugin architecture                 | Each tool is a standalone module registered at startup — easy to extend |

## Dependency Graph

```
Phase 1 → Phase 2 → Phase 3 ──→ Phase 5 → Phase 6
                   ↘ Phase 4 ──↗
```

Phases 3 & 4 can execute **in parallel**. All other phases are sequential.
