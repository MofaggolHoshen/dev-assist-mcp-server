import { z } from "zod";
import { glob } from "glob";
import fs from "fs/promises";
import path from "path";
import { Tool } from "../types.js";
import { resolveSafePath } from "./safePath.js";

function isTextFile(filename: string): boolean {
  // Simple extension check; can be improved
  return /\.(ts|js|json|md|txt|c?jsx?|tsx?)$/i.test(filename);
}

export const searchCodeTool: Tool = {
  name: "search_code",
  description:
    "Searches for a keyword in text files (relative to project root)",
  inputSchema: z.object({
    keyword: z.string().describe("Text to search for in file contents"),
    path: z
      .string()
      .optional()
      .describe("Subdirectory to scope the search (default: project root)"),
  }),
  async execute(input) {
    const relPath = input.path || ".";
    const dir = resolveSafePath(relPath);
    const files = glob.sync("**/*", {
      cwd: dir,
      ignore: ["node_modules/**", "dist/**", ".git/**"],
      nodir: true,
    });
    const matches: string[] = [];
    for (const file of files) {
      if (!isTextFile(file)) continue;
      try {
        const content = await fs.readFile(path.join(dir, file), "utf-8");
        content.split(/\r?\n/).forEach((line: string, idx: number) => {
          if (line.toLowerCase().includes(input.keyword.toLowerCase())) {
            matches.push(`${file}:${idx + 1}: ${line}`);
          }
        });
        if (matches.length >= 50) break;
      } catch {}
    }
    return {
      content: [
        {
          type: "text",
          text: matches.slice(0, 50).join("\n"),
        },
      ],
    };
  },
};
