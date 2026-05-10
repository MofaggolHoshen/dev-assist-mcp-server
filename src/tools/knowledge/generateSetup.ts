import { z } from "zod";
import { Tool } from "../types.js";
import { textResponse } from "../../shared/response.js";
import {
  listMarkdownDocNames,
  loadNamedMarkdownDocument,
} from "../../storage/markdownKnowledgeStore.js";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const generateSetupTool: Tool = {
  name: "generate_setup",
  description: "Generate production-ready setup guidance for a technology type",
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
    return textResponse(
      `No setup found for type='${input.type}'${input.framework ? ` framework='${input.framework}'` : ""}. Available setups: ${available.join(", ") || "none"}`,
    );
  },
};
