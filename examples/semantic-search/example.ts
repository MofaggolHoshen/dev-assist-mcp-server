// Future-facing semantic-style query example.
// Replace `client` with your MCP client instance.

type CallToolArgs = {
  name: string;
  arguments: Record<string, unknown>;
};

type McpClient = {
  callTool(input: CallToolArgs): Promise<unknown>;
};

export async function runSemanticStyleSearch(client: McpClient): Promise<void> {
  const result = await client.callTool({
    name: "search_snippet",
    arguments: {
      query: "how to handle transient API failures",
      limit: 5,
    },
  });

  console.log(JSON.stringify(result, null, 2));
}
