# DevAssist MCP Server

stdio-based MCP server in TypeScript that exposes project file access, reusable snippets, and lightweight project analysis tools for AI clients.

## Quick Start

1. Install dependencies:

```bash
npm install
```

1. Build the server:

```bash
npm run build
```

1. Run locally (compiled):

```bash
npm start
```

1. Or run in development mode:

```bash
npm run dev
```

## VS Code MCP Configuration

You can run the MCP server in VS Code either from this repository or from the published npm package.

Local workspace setup:

```json
{
  "servers": {
    "dev-assist": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

Build once with `npm run build`, then VS Code can launch the server through stdio.

Published npm package setup:

```json
{
  "servers": {
    "dev-assist": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@mofaggolhoshen/dev-assist-mcp-server"]
    }
  }
}
```

This package-based setup is useful when you do not want to build the server from source inside each workspace.

## Tool Catalog

| Tool | Description | Input |
| --- | --- | --- |
| `ping` | Returns pong to verify the server is reachable | `{}` |
| `list_files` | Lists files recursively under a directory | `{ path?: string }` |
| `read_file` | Reads a text file from the workspace | `{ path: string }` |
| `search_code` | Keyword search across text-like files | `{ keyword: string, path?: string }` |
| `get_snippet` | Returns a named snippet from `snippets/` | `{ name: string }` |
| `analyze_project` | Detects language/framework/architecture hints | `{ path?: string }` |

## Adding Custom Tools

1. Create a new tool module under `src/tools/...` implementing the `Tool` interface from `src/tools/types.ts`.
2. Define `name`, `description`, `inputSchema` (Zod), and `execute`.
3. Register the tool in `src/index.ts` using `registry.register(yourTool)`.
4. Rebuild with `npm run build`.

## Snippet Authoring

Add JSON files under `snippets/` using this schema:

```json
{
  "name": "snippet-name",
  "title": "Human Friendly Title",
  "language": "csharp",
  "description": "What this snippet does",
  "code": "...source code..."
}
```

The `name` must match `[A-Za-z0-9-]+` because it maps to `snippets/{name}.json`.
