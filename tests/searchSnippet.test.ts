import { searchSnippetTool } from "../src/tools/knowledge/searchSnippet";

describe("searchSnippetTool", () => {
  it("returns ranked snippet results for a resilience query", async () => {
    const result = await searchSnippetTool.execute({ query: "polly retry" });
    const parsed = JSON.parse(result.content[0].text) as {
      total: number;
      results: Array<{ id: string; title: string }>;
    };

    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.results.some((r) => r.id === "polly-retry")).toBe(true);
  });

  it("supports synonym and normalization matching", async () => {
    const result = await searchSnippetTool.execute({
      query: "entityframework repository",
      limit: 10,
    });

    const parsed = JSON.parse(result.content[0].text) as {
      total: number;
      results: Array<{ id: string }>;
    };

    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.results.some((r) => r.id === "efcore-repository")).toBe(true);
  });

  it("applies category and framework filters", async () => {
    const result = await searchSnippetTool.execute({
      query: "jwt",
      category: "auth",
      framework: "aspnet",
      limit: 20,
    });

    const parsed = JSON.parse(result.content[0].text) as {
      total: number;
      results: Array<{ id: string; category?: string; framework?: string }>;
    };

    expect(parsed.total).toBeGreaterThan(0);
    expect(
      parsed.results.every(
        (r) =>
          r.category?.toLowerCase() === "auth" &&
          (r.framework ?? "").toLowerCase().includes("aspnet"),
      ),
    ).toBe(true);
  });

  it("applies version and difficulty filters", async () => {
    const result = await searchSnippetTool.execute({
      query: "repository",
      version: ".net8",
      difficulty: "beginner",
      limit: 20,
    });

    const parsed = JSON.parse(result.content[0].text) as {
      total: number;
      results: Array<{ version?: string; difficulty?: string }>;
    };

    expect(parsed.total).toBeGreaterThan(0);
    expect(
      parsed.results.every(
        (r) =>
          (r.version ?? "").toLowerCase().includes(".net8") &&
          r.difficulty === "beginner",
      ),
    ).toBe(true);
  });

  it("includes confidence indicators and rank scores", async () => {
    const result = await searchSnippetTool.execute({
      query: "jwt auth",
      limit: 5,
    });
    const parsed = JSON.parse(result.content[0].text) as {
      total: number;
      results: Array<{
        confidence?: string;
        rankScore?: number;
        reasons?: string[];
      }>;
    };

    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.results[0].confidence).toBeDefined();
    expect(typeof parsed.results[0].rankScore).toBe("number");
    expect(Array.isArray(parsed.results[0].reasons)).toBe(true);
  });

  it("prioritizes version matching from query text", async () => {
    const result = await searchSnippetTool.execute({
      query: "jwt .net9",
      limit: 5,
    });
    const parsed = JSON.parse(result.content[0].text) as {
      total: number;
      results: Array<{ id: string; version?: string }>;
    };

    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.results[0].id).toBe("jwt-setup-dotnet9");
    expect((parsed.results[0].version ?? "").toLowerCase()).toContain(".net9");
  });
});
