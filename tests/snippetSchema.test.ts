import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { glob } from "glob";
import { markdownSnippetFrontmatterSchema } from "../src/schemas/markdownKnowledge";

const SNIPPETS_DIR = path.resolve(process.cwd(), "snippets");

async function loadSnippetMarkdownFiles(): Promise<
  { file: string; frontmatter: unknown }[]
> {
  const files = await glob("**/*.md", {
    cwd: SNIPPETS_DIR,
    nodir: true,
    ignore: ["**/node_modules/**", "**/.git/**"],
  });

  const docs = await Promise.all(
    files.map(async (relativePath) => {
      const content = await fs.readFile(
        path.join(SNIPPETS_DIR, relativePath),
        "utf-8",
      );
      const parsed = matter(content);
      return {
        file: relativePath.replace(/\\/g, "/"),
        frontmatter: parsed.data,
      };
    }),
  );

  return docs;
}

describe("markdownSnippetFrontmatterSchema", () => {
  it("accepts a minimal valid frontmatter payload", () => {
    const result = markdownSnippetFrontmatterSchema.safeParse({
      id: "my-snippet",
      title: "My Snippet",
      summary: "A test summary.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a fully populated frontmatter payload", () => {
    const result = markdownSnippetFrontmatterSchema.safeParse({
      id: "jwt-setup",
      name: "jwt-setup",
      title: "JWT Setup",
      summary: "JWT bearer setup.",
      language: "csharp",
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

  it("rejects invalid difficulty values", () => {
    const result = markdownSnippetFrontmatterSchema.safeParse({
      id: "my-snippet",
      title: "My Snippet",
      summary: "Test.",
      difficulty: "expert",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = markdownSnippetFrontmatterSchema.safeParse({
      id: "my-snippet",
      title: "My Snippet",
    });
    expect(result.success).toBe(false);
  });

  describe("all markdown snippets conform to schema", () => {
    let snippetFiles: { file: string; frontmatter: unknown }[] = [];

    beforeAll(async () => {
      snippetFiles = await loadSnippetMarkdownFiles();
    });

    it("has at least 20 snippet markdown files", () => {
      expect(snippetFiles.length).toBeGreaterThanOrEqual(20);
    });

    it("every snippet frontmatter is valid", () => {
      const failures: string[] = [];

      for (const { file, frontmatter } of snippetFiles) {
        const result = markdownSnippetFrontmatterSchema.safeParse(frontmatter);
        if (!result.success) {
          const issues = result.error.issues
            .map((i) => `  ${i.path.join(".")}: ${i.message}`)
            .join("\n");
          failures.push(`${file}:\n${issues}`);
        }
      }

      if (failures.length > 0) {
        throw new Error(
          `The following snippet files failed frontmatter schema validation:\n\n${failures.join("\n\n")}`,
        );
      }
    });
  });
});
