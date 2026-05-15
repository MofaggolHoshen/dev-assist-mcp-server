import { z } from "zod";
import { Tool } from "../types.js";
import { textResponse } from "../../shared/response.js";
import {
  listMarkdownDocNames,
  loadNamedMarkdownDocument,
  searchSnippetDocumentsWithOptions,
} from "../../storage/markdownKnowledgeStore.js";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const generateSetupTool: Tool = {
  name: "generate_setup",
  description:
    "Generate a complete production-ready setup guide for a technology, framework, or stack. Use this when the user asks to 'set up', 'configure', 'bootstrap', or 'get started with' something (e.g. '.net api setup', 'setup jwt', 'configure serilog', 'aspnet web api setup'). The 'type' parameter accepts natural-language setup topics like 'jwt', 'aspnet-api', 'serilog'. Optionally pass a 'framework' like 'dotnet9' to get version-specific guidance.",
  inputSchema: z.object({
    type: z.string().min(2).describe("Setup type, e.g. jwt"),
    framework: z.string().optional().describe("Framework hint, e.g. dotnet9"),
  }),
  async execute(input) {
    const normalizedType = normalize(input.type);
    const normalizedFramework = input.framework
      ? normalize(input.framework)
      : undefined;

    const candidateNames = [
      normalizedFramework
        ? `${normalizedType}-${normalizedFramework}`
        : undefined,
      normalizedType,
    ].filter((n): n is string => Boolean(n));

    for (const candidate of candidateNames) {
      const doc = await loadNamedMarkdownDocument("content/setups", candidate);
      if (doc) {
        const lines = [
          `# ${doc.title}`,
          "",
          doc.summary ?? "",
          "",
          `Path: ${doc.path}`,
          "",
          doc.body,
        ];
        return textResponse(lines.join("\n"));
      }
    }

    const available = await listMarkdownDocNames("content/setups");

    // Fallback: search snippets for related content rather than dead-ending
    const snippetResults = await searchSnippetDocumentsWithOptions(input.type, {
      limit: 5,
    });

    const lines = [
      `No dedicated setup guide found for '${input.type}'.`,
      `Available setup guides: ${available.join(", ") || "none"}`,
    ];

    if (snippetResults.length) {
      lines.push(
        "",
        "## Related Snippets Found",
        "The following code snippets may help — use get_snippet to retrieve the full code:",
        ...snippetResults.map(
          (r) =>
            `- **${r.name}**: ${r.title} (confidence: ${r.confidence})`,
        ),
      );
    }

    return textResponse(lines.join("\n"));
  },
};
