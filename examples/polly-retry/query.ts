// Query example for resilience patterns with Polly.
// Replace `client` with your MCP client instance.

type CallToolArgs = {
  name: string;
  arguments: Record<string, unknown>;
};

type McpClient = {
  callTool(input: CallToolArgs): Promise<unknown>;
};

export async function queryPollyRetry(client: McpClient): Promise<void> {
  const result = await client.callTool({
    name: "search_snippet",
    arguments: {
      query: "polly retry exponential backoff timeout circuit breaker",
      category: "resilience",
      framework: "dotnet",
      limit: 5,
    },
  });

  console.log(JSON.stringify(result, null, 2));
}
