import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { Tool } from "../types.js";
import { resolveSafePath } from "../fs/safePath.js";

const snippetFileSchema = z.object({
  name: z.string(),
  title: z.string(),
  language: z.string(),
  description: z.string(),
  code: z.string(),
});

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
      const snippet = snippetFileSchema.parse(JSON.parse(raw));

      const text = [
        `# ${snippet.title}`,
        "",
        snippet.description,
        "",
        `Language: ${snippet.language}`,
        "",
        `\`\`\`${snippet.language}`,
        snippet.code,
        "\`\`\`",
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      const available = await listAvailableSnippetNames(snippetsDir);
      const availableText = available.length
        ? available.join(", ")
        : "No snippets found. Add JSON files under snippets/.";

      const notFound = err?.code === "ENOENT";
      const text = notFound
        ? `Snippet '${input.name}' was not found. Available snippets: ${availableText}`
        : `Could not load snippet '${input.name}': ${err.message}. Available snippets: ${availableText}`;

      return { content: [{ type: "text", text }] };
    }
  },
};
