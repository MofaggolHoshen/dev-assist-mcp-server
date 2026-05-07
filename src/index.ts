import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolRegistry } from "./tools/registry.js";
import { listFilesTool } from "./tools/fs/listFiles.js";
import { readFileTool } from "./tools/fs/readFile.js";
import { searchCodeTool } from "./tools/fs/searchCode.js";
import { getSnippetTool } from "./tools/knowledge/getSnippet.js";
import { analyzeProjectTool } from "./tools/intelligence/analyzeProject.js";

const server = new McpServer(
  { name: "dev-assist-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

const registry = new ToolRegistry();
//registry.register(pingTool);
registry.register(listFilesTool);
registry.register(readFileTool);
registry.register(searchCodeTool);
registry.register(getSnippetTool);
registry.register(analyzeProjectTool);

for (const tool of registry.list()) {
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    async (args) => tool.execute(args),
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
