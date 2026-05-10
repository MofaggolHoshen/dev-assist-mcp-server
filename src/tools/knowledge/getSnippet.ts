import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { Tool } from "../types.js";
import { resolveSafePath } from "../fs/safePath.js";
import { snippetSchema } from "../../content/snippetSchema.js";
import { textResponse } from "../../shared/response.js";

async function listAvailableSnippetNames(
  snippetsDir: string,
): Promise<string[]> {
  try {
    const entries = await fs.readdir(snippetsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name.replace(/\.json$/i, ""))
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
    const snippetsDir = resolveSafePath("snippets");
    const filePath = path.join(snippetsDir, `${input.name}.json`);

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const snippet = snippetSchema.parse(JSON.parse(raw));

      const lines: string[] = [
        `# ${snippet.title}`,
        "",
        snippet.description,
        "",
      ];

      const meta: string[] = [`Language: ${snippet.language}`];
      if (snippet.framework) meta.push(`Framework: ${snippet.framework}`);
      if (snippet.version) meta.push(`Version: ${snippet.version}`);
      if (snippet.difficulty) meta.push(`Difficulty: ${snippet.difficulty}`);
      if (snippet.category) meta.push(`Category: ${snippet.category}`);
      if (snippet.tags?.length) meta.push(`Tags: ${snippet.tags.join(", ")}`);
      lines.push(meta.join(" | "), "");

      lines.push(`\`\`\`${snippet.language}`, snippet.code, "```");

      if (snippet.bestPractices?.length) {
        lines.push("", "## Best Practices");
        snippet.bestPractices.forEach((bp) => lines.push(`- ${bp}`));
      }

      if (snippet.pitfalls?.length) {
        lines.push("", "## Pitfalls");
        snippet.pitfalls.forEach((p) => lines.push(`- ${p}`));
      }

      if (snippet.securityNotes?.length) {
        lines.push("", "## Security Notes");
        snippet.securityNotes.forEach((s) => lines.push(`- ${s}`));
      }

      return textResponse(lines.join("\n"));
    } catch (err: any) {
      const available = await listAvailableSnippetNames(snippetsDir);
      const availableText = available.length
        ? available.join(", ")
        : "No snippets found. Add JSON files under snippets/.";

      const notFound = err?.code === "ENOENT";
      const text = notFound
        ? `Snippet '${input.name}' was not found. Available snippets: ${availableText}`
        : `Could not load snippet '${input.name}': ${err.message}. Available snippets: ${availableText}`;

      return textResponse(text);
    }
  },
};
