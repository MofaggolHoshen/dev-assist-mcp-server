import { z } from "zod";
import { Tool } from "../types.js";
import { textResponse } from "../../shared/response.js";
import {
  listMarkdownDocNames,
  loadNamedMarkdownDocument,
  searchSnippetDocumentsWithOptions,
} from "../../storage/markdownKnowledgeStore.js";

export const getTemplateTool: Tool = {
  name: "get_template",
  description:
    "Return a complete implementation starter template for an architecture or project structure. Use this when the user asks for a 'template', 'starter', 'scaffold', or 'project structure' (e.g. 'clean architecture template', 'CQRS starter', 'get me a DDD project layout'). The 'template' parameter must be a slug (e.g. 'clean-architecture', 'cqrs-starter'). This returns full folder structure and boilerplate — not a single code snippet.",
  inputSchema: z.object({
    template: z
      .string()
      .regex(/^[A-Za-z0-9-]+$/)
      .describe("Template id, e.g. clean-architecture"),
  }),
  async execute(input) {
    const doc = await loadNamedMarkdownDocument(
      "content/templates",
      input.template,
    );
    if (!doc) {
      const available = await listMarkdownDocNames("content/templates");
      return textResponse(
        `Template '${input.template}' was not found. Available templates: ${available.join(", ") || "none"}`,
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
