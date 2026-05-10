// Example MCP call for snippet search.
// Replace `client` with your MCP client instance.

type CallToolArgs = {
  name: string;
  arguments: Record<string, unknown>;
};

type McpClient = {
  callTool(input: CallToolArgs): Promise<unknown>;
};

export async function runBasicSearch(client: McpClient): Promise<void> {
  const result = await client.callTool({
    name: "search_snippet",
    arguments: {
      query: "jwt authentication asp.net 9",
      framework: "aspnet",
      version: ".net9",
      limit: 5,
    },
  });

  console.log(JSON.stringify(result, null, 2));
}
