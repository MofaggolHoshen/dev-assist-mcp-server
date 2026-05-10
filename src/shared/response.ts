/**
 * Shared MCP tool response helpers.
 * All knowledge tools should use these helpers so output shape stays consistent.
 */

export type ToolResponse = {
  content: { type: "text"; text: string }[];
};

/** Wrap a plain string into a valid MCP tool content array. */
export function textResponse(text: string): ToolResponse {
  return { content: [{ type: "text", text }] };
}

/** Produce a structured error message in the same envelope. */
export function errorResponse(message: string): ToolResponse {
  return textResponse(`Error: ${message}`);
}
