import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolRegistry } from "./tools/registry.js";
import { getSnippetTool } from "./tools/knowledge/getSnippet.js";
import { searchSnippetTool } from "./tools/knowledge/searchSnippet.js";
import { getTemplateTool } from "./tools/knowledge/getTemplate.js";
import { explainConceptTool } from "./tools/knowledge/explainConcept.js";
import { generateSetupTool } from "./tools/knowledge/generateSetup.js";

const server = new McpServer(
  { name: "dev-assist-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

const registry = new ToolRegistry();
registry.register(getSnippetTool);
registry.register(searchSnippetTool);
registry.register(getTemplateTool);
registry.register(explainConceptTool);
registry.register(generateSetupTool);

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
