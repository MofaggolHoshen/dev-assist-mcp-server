import { z } from "zod";

export const markdownSnippetFrontmatterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  updatedAt: z
    .union([z.string(), z.date().transform((date) => date.toISOString())])
    .optional(),
  framework: z.string().optional(),
  version: z.string().optional(),
  language: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(["beginner", "medium", "advanced"]).optional(),
  bestPractices: z.array(z.string()).optional(),
  pitfalls: z.array(z.string()).optional(),
  securityNotes: z.array(z.string()).optional(),
});

export type MarkdownSnippetFrontmatter = z.infer<
  typeof markdownSnippetFrontmatterSchema
>;

export const markdownDocFrontmatterSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  summary: z.string().optional(),
  framework: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type MarkdownDocFrontmatter = z.infer<
  typeof markdownDocFrontmatterSchema
>;
