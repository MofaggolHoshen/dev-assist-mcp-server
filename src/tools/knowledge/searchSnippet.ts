import { z } from "zod";
import { Tool } from "../types.js";
import { textResponse } from "../../shared/response.js";
import { searchSnippetDocumentsWithOptions } from "../../storage/markdownKnowledgeStore.js";

export const searchSnippetTool: Tool = {
  name: "search_snippet",
  description:
    "Search reusable production-ready code snippets by keyword or topic. Use this when the user asks for a code snippet, implementation example, or pattern (e.g. 'give me jwt code', 'show polly retry', 'how to cache with Redis'). Supports optional filters for framework, version, category, and difficulty. Returns a ranked list of matching snippets — follow up with get_snippet to retrieve the full code.",
  inputSchema: z.object({
    query: z.string().min(2).describe("Snippet search query"),
    framework: z.string().optional().describe("Optional framework filter"),
    version: z.string().optional().describe("Optional version filter"),
    category: z.string().optional().describe("Optional category filter"),
    difficulty: z
      .enum(["beginner", "medium", "advanced"])
      .optional()
      .describe("Optional difficulty filter"),
    limit: z.number().int().min(1).max(50).optional().describe("Max results"),
  }),
  async execute(input) {
    const results = await searchSnippetDocumentsWithOptions(input.query, {
      framework: input.framework,
      version: input.version,
      category: input.category,
      difficulty: input.difficulty,
      limit: input.limit,
    });

    const payload = {
      query: input.query,
      filters: {
        framework: input.framework,
        version: input.version,
        category: input.category,
        difficulty: input.difficulty,
        limit: input.limit ?? 10,
      },
      total: results.length,
      results: results.map((r) => ({
        id: r.id,
        name: r.name,
        title: r.title,
        summary: r.summary,
        updatedAt: r.updatedAt,
        framework: r.framework,
        version: r.version,
        category: r.category,
        difficulty: r.difficulty,
        tags: r.tags,
        fuseScore: r.score,
        rankScore: Number(r.rankScore.toFixed(4)),
        confidence: r.confidence,
        reasons: r.reasons,
        path: r.path,
      })),
    };

    return textResponse(JSON.stringify(payload, null, 2));
  },
};
