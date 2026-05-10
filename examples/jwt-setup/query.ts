// Query example for retrieving JWT setup guidance.
// Replace `client` with your MCP client instance.

type CallToolArgs = {
  name: string;
  arguments: Record<string, unknown>;
};

type McpClient = {
  callTool(input: CallToolArgs): Promise<unknown>;
};

export async function queryJwtSetup(client: McpClient): Promise<void> {
  const result = await client.callTool({
    name: "search_snippet",
    arguments: {
      query: "production jwt auth asp.net 9",
      category: "auth",
      framework: "aspnet",
      version: ".net9",
      difficulty: "medium",
      limit: 3,
    },
  });

  console.log(JSON.stringify(result, null, 2));
}
