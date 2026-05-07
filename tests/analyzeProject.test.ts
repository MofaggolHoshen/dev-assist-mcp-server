import fs from "node:fs/promises";
import path from "node:path";
import { analyzeProjectTool } from "../src/tools/intelligence/analyzeProject";

describe("analyzeProjectTool", () => {
  it("detects TypeScript Node project traits in this repository", async () => {
    const result = await analyzeProjectTool.execute({});
    const parsed = JSON.parse(result.content[0].text) as {
      language: string[];
      framework: string[];
      architecture: string[];
      files_count: number;
    };

    expect(parsed.language).toContain("TypeScript");
    expect(parsed.framework).toContain("Node.js");
    expect(parsed.architecture).toContain("standard src/test layout");
    expect(parsed.files_count).toBeGreaterThan(0);
  });

  it("returns empty arrays for an empty directory", async () => {
    const prefix = path.join(process.cwd(), "tmp-analyze-");
    const tempDir = await fs.mkdtemp(prefix);

    try {
      const relPath = path.relative(process.cwd(), tempDir);
      const result = await analyzeProjectTool.execute({ path: relPath });
      const parsed = JSON.parse(result.content[0].text) as {
        language: string[];
        framework: string[];
        architecture: string[];
        files_count: number;
      };

      expect(parsed.language).toEqual([]);
      expect(parsed.framework).toEqual([]);
      expect(parsed.architecture).toEqual([]);
      expect(parsed.files_count).toBe(0);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
