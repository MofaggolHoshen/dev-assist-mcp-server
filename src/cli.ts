#!/usr/bin/env node

import fs from "node:fs/promises";

const args = process.argv.slice(2);

async function getPackageVersion(): Promise<string> {
  try {
    const packagePath = new URL("../package.json", import.meta.url);
    const raw = await fs.readFile(packagePath, "utf-8");
    const pkg = JSON.parse(raw) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`dev-assist-mcp-server

Usage:
  npx -y @mofaggolhoshen/dev-assist-mcp-server

Options:
  -h, --help    Show this help message
  -v, --version Show package version

Description:
  Starts the DevAssist MCP server over stdio for MCP clients.

VS Code MCP setup:
{
  "servers": {
    "dev-assist": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@mofaggolhoshen/dev-assist-mcp-server"]
    }
  }
}`);
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log(await getPackageVersion());
  process.exit(0);
}

await import("./index.js");
