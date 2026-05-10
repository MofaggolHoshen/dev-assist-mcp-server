import path from "node:path";
import { z } from "zod";
import { glob } from "glob";
import { Tool } from "../types.js";
import { resolveSafePath } from "../fs/safePath.js";
import { textResponse } from "../../shared/response.js";
import { findSnippetByName } from "../../storage/markdownKnowledgeStore.js";

async function listAvailableMarkdownSnippetNames(): Promise<string[]> {
  const snippetsDir = resolveSafePath("snippets");
  try {
    const files = await glob("**/*.md", {
      cwd: snippetsDir,
      nodir: true,
      ignore: ["**/node_modules/**", "**/.git/**"],
    });
    return files
      .map((file) => path.basename(file).replace(/\.md$/i, ""))
      .sort();
  } catch {
    return [];
  }
}

export const getSnippetTool: Tool = {
  name: "get_snippet",
  description:
    "Returns a reusable code snippet by name from the local snippets directory",
  inputSchema: z.object({
    name: z
      .string()
      .regex(
        /^[A-Za-z0-9-]+$/,
        "Snippet name can only contain letters, numbers, and hyphens",
      )
      .describe("Snippet name, e.g. 'polly-retry', 'jwt-setup'"),
  }),
  async execute(input) {
    const markdownSnippet = await findSnippetByName(input.name);
    if (markdownSnippet) {
      const lines: string[] = [
        `# ${markdownSnippet.title}`,
        "",
        markdownSnippet.summary,
        "",
      ];

      const meta: string[] = [];
      if (markdownSnippet.language)
        meta.push(`Language: ${markdownSnippet.language}`);
      if (markdownSnippet.framework)
        meta.push(`Framework: ${markdownSnippet.framework}`);
      if (markdownSnippet.version)
        meta.push(`Version: ${markdownSnippet.version}`);
      if (markdownSnippet.difficulty)
        meta.push(`Difficulty: ${markdownSnippet.difficulty}`);
      if (markdownSnippet.category)
        meta.push(`Category: ${markdownSnippet.category}`);
      if (markdownSnippet.tags.length)
        meta.push(`Tags: ${markdownSnippet.tags.join(", ")}`);
      if (meta.length) lines.push(meta.join(" | "), "");

      lines.push(markdownSnippet.body);

      if (markdownSnippet.bestPractices.length) {
        lines.push("", "## Best Practices");
        markdownSnippet.bestPractices.forEach((bp) => lines.push(`- ${bp}`));
      }

      if (markdownSnippet.pitfalls.length) {
        lines.push("", "## Pitfalls");
        markdownSnippet.pitfalls.forEach((p) => lines.push(`- ${p}`));
      }

      if (markdownSnippet.securityNotes.length) {
        lines.push("", "## Security Notes");
        markdownSnippet.securityNotes.forEach((s) => lines.push(`- ${s}`));
      }

      return textResponse(lines.join("\n"));
    }

    const markdownAvailable = await listAvailableMarkdownSnippetNames();
    const availableText = markdownAvailable.length
      ? markdownAvailable.join(", ")
      : "No snippets found. Add markdown files under snippets/.";

    return textResponse(
      `Snippet '${input.name}' was not found. Available snippets: ${availableText}`,
    );
  },
};
