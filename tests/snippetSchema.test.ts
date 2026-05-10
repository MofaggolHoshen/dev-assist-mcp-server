import fs from "node:fs/promises";
import path from "node:path";
import { snippetSchema } from "../src/content/snippetSchema";

const SNIPPETS_DIR = path.resolve(process.cwd(), "snippets");

async function loadSnippetFiles(): Promise<{ file: string; raw: unknown }[]> {
  const entries = await fs.readdir(SNIPPETS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (e) => e.isFile() && e.name.endsWith(".json"),
  );
  return Promise.all(
    jsonFiles.map(async (e) => {
      const content = await fs.readFile(
        path.join(SNIPPETS_DIR, e.name),
        "utf-8",
      );
      return { file: e.name, raw: JSON.parse(content) };
    }),
  );
}

describe("snippetSchema", () => {
  it("accepts a minimal valid snippet", () => {
    const result = snippetSchema.safeParse({
      name: "my-snippet",
      title: "My Snippet",
      language: "csharp",
      description: "A test snippet.",
      code: 'Console.WriteLine("hello");',
    });
    expect(result.success).toBe(true);
  });

  it("accepts a fully-populated valid snippet", () => {
    const result = snippetSchema.safeParse({
      name: "jwt-setup",
      title: "JWT Setup",
      language: "csharp",
      description: "JWT bearer setup.",
      code: "// code here",
      category: "auth",
      tags: ["jwt", "bearer"],
      framework: "aspnet",
      version: ".net9",
      difficulty: "medium",
      bestPractices: ["Validate issuer and audience"],
      pitfalls: ["Never hardcode the signing key"],
      securityNotes: ["Use HTTPS only"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a snippet with an invalid name (contains spaces)", () => {
    const result = snippetSchema.safeParse({
      name: "my snippet",
      title: "My Snippet",
      language: "csharp",
      description: "Test.",
      code: "// code",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a snippet with an invalid difficulty value", () => {
    const result = snippetSchema.safeParse({
      name: "my-snippet",
      title: "My Snippet",
      language: "csharp",
      description: "Test.",
      code: "// code",
      difficulty: "expert",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a snippet with a missing required field", () => {
    const result = snippetSchema.safeParse({
      name: "my-snippet",
      title: "My Snippet",
      language: "csharp",
      // description missing
      code: "// code",
    });
    expect(result.success).toBe(false);
  });

  describe("all snippet files in snippets/ conform to schema", () => {
    let snippetFiles: { file: string; raw: unknown }[] = [];

    beforeAll(async () => {
      snippetFiles = await loadSnippetFiles();
    });

    it("finds at least one snippet file", () => {
      expect(snippetFiles.length).toBeGreaterThan(0);
    });

    it("every snippet file is valid", () => {
      const failures: string[] = [];

      for (const { file, raw } of snippetFiles) {
        const result = snippetSchema.safeParse(raw);
        if (!result.success) {
          const issues = result.error.issues
            .map((i) => `  ${i.path.join(".")}: ${i.message}`)
            .join("\n");
          failures.push(`${file}:\n${issues}`);
        }
      }

      if (failures.length > 0) {
        throw new Error(
          `The following snippet files failed schema validation:\n\n${failures.join("\n\n")}`,
        );
      }
    });
  });
});
