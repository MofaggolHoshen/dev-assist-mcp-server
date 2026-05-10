import { z } from "zod";

/**
 * Canonical schema for a DevAssist snippet file stored under snippets/.
 *
 * Required fields are the same as the original minimal shape.
 * Optional fields represent Phase 1 metadata additions; all existing
 * snippets that do not yet carry them will still parse successfully.
 */
export const snippetSchema = z.object({
  /** Unique identifier — must match the filename without .json extension. */
  name: z
    .string()
    .regex(
      /^[A-Za-z0-9-]+$/,
      "name must only contain letters, numbers, and hyphens",
    ),

  /** Human-friendly display title. */
  title: z.string().min(1),

  /** Primary programming language of the code example. */
  language: z.string().min(1),

  /** Short description of what the snippet does. */
  description: z.string().min(1),

  /** The source code or configuration example. */
  code: z.string().min(1),

  // ─── Phase 1 metadata additions ─────────────────────────────────────────

  /** Top-level content category e.g. "auth", "resilience", "logging". */
  category: z.string().optional(),

  /** Searchable tags e.g. ["jwt", "bearer", "aspnet"]. */
  tags: z.array(z.string()).optional(),

  /** Target framework e.g. "aspnet", "dotnet", "nodejs". */
  framework: z.string().optional(),

  /** Target framework version e.g. ".net9", ".net8+", "node22". */
  version: z.string().optional(),

  /** Complexity level for the developer consuming the snippet. */
  difficulty: z.enum(["beginner", "medium", "advanced"]).optional(),

  /** Production-oriented best-practice notes. */
  bestPractices: z.array(z.string()).optional(),

  /** Common mistakes or anti-patterns to avoid. */
  pitfalls: z.array(z.string()).optional(),

  /** Security-specific guidance relevant to this snippet. */
  securityNotes: z.array(z.string()).optional(),
});

export type Snippet = z.infer<typeof snippetSchema>;
