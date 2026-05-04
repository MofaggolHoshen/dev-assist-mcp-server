import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolRegistry } from "./tools/registry.js";
import { pingTool } from "./tools/ping.js";
import { listFilesTool } from "./tools/fs/listFiles.js";
import { readFileTool } from "./tools/fs/readFile.js";
import { searchCodeTool } from "./tools/fs/searchCode.js";

const server = new Server(
  { name: "dev-assist-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

const registry = new ToolRegistry();
registry.register(pingTool);
registry.register(listFilesTool);
registry.register(readFileTool);
registry.register(searchCodeTool);

const transport = new StdioServerTransport();
await server.connect(transport);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: registry.list().map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.inputSchema as any),
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = registry.get(req.params.name);
  if (!tool) throw new Error(`Unknown tool: ${req.params.name}`);
  const input = tool.inputSchema.parse(req.params.arguments);
  return await tool.execute(input);
});
