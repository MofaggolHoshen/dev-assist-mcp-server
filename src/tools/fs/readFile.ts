import { z } from "zod";
import fs from "fs/promises";
import { Tool } from "../types.js";
import { resolveSafePath } from "./safePath.js";

export const readFileTool: Tool = {
  name: "read_file",
  description: "Reads the content of a text file (relative to project root)",
  inputSchema: z.object({
    path: z.string().describe("Relative path to the file to read"),
  }),
  async execute(input) {
    try {
      const filePath = resolveSafePath(input.path);
      const content = await fs.readFile(filePath, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading file: ${err.message}`,
          },
        ],
      };
    }
  },
};
