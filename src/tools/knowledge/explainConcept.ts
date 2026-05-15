import { z } from "zod";
import { Tool } from "../types.js";
import { textResponse } from "../../shared/response.js";
import {
  listMarkdownDocNames,
  loadNamedMarkdownDocument,
  searchSnippetDocumentsWithOptions,
} from "../../storage/markdownKnowledgeStore.js";

export const explainConceptTool: Tool = {
  name: "explain_concept",
  description:
    "Explain an engineering concept or pattern with practical guidance, use cases, and examples. Use this ONLY when the user asks to 'explain', 'what is', or 'how does X work' for a known architectural concept (e.g. 'explain circuit breaker', 'what is CQRS', 'how does saga pattern work'). The 'concept' parameter must be a slug with only letters, numbers, and hyphens (e.g. 'circuit-breaker', 'cqrs', 'saga-pattern'). Do NOT use this for setup requests, code snippet requests, or free-form questions.",
  inputSchema: z.object({
    concept: z
      .string()
      .regex(/^[A-Za-z0-9-]+$/)
      .describe("Concept id, e.g. circuit-breaker"),
  }),
  async execute(input) {
    const doc = await loadNamedMarkdownDocument(
      "content/concepts",
      input.concept,
    );
    if (!doc) {
      const available = await listMarkdownDocNames("content/concepts");
      return textResponse(
        `Concept '${input.concept}' was not found. Available concepts: ${available.join(", ") || "none"}`,
      );
    }

    const lines = [
      `# ${doc.title}`,
      "",
      doc.summary ?? "",
      "",
      "## Metadata",
      `- Framework: ${doc.framework ?? "n/a"}`,
      `- Version: ${doc.version ?? "n/a"}`,
      `- Tags: ${doc.tags.length ? doc.tags.join(", ") : "n/a"}`,
      "",
      `Path: ${doc.path}`,
      "",
      doc.body,
    ];

    const related = await searchSnippetDocumentsWithOptions(
      `${doc.title} ${doc.tags.join(" ")}`,
      {
        framework: doc.framework,
        version: doc.version,
        limit: 3,
      },
    );

    if (related.length) {
      lines.push("", "## Related Snippets");
      related.forEach((item) => {
        lines.push(
          `- ${item.id}: ${item.title} (${item.confidence}, score=${item.rankScore.toFixed(2)})`,
        );
      });
    }

    return textResponse(lines.join("\n"));
  },
};
