// Example for concept explanation mode.
// Replace `client` with your MCP client instance.

type CallToolArgs = {
  name: string;
  arguments: Record<string, unknown>;
};

type McpClient = {
  callTool(input: CallToolArgs): Promise<unknown>;
};

export async function explainCircuitBreaker(client: McpClient): Promise<void> {
  const result = await client.callTool({
    name: "explain_concept",
    arguments: {
      concept: "circuit-breaker",
    },
  });

  console.log(result);
}
