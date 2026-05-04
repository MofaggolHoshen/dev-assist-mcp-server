import { z } from "zod";
import { glob } from "glob";
import { Tool } from "../types.js";
import { resolveSafePath } from "./safePath.js";

export const listFilesTool: Tool = {
  name: "list_files",
  description: "Lists files in a directory tree (relative to project root)",
  inputSchema: z.object({
    path: z
      .string()
      .optional()
      .describe("Subdirectory to list (default: project root)"),
  }),
  async execute(input) {
    const relPath = input.path || ".";
    const dir = resolveSafePath(relPath);
    const files = glob.sync("**/*", {
      cwd: dir,
      ignore: ["node_modules/**", "dist/**", ".git/**"],
      nodir: true,
    });
    return {
      content: [
        {
          type: "text",
          text: files.join("\n"),
        },
      ],
    };
  },
};
