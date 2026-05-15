import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import Fuse from "fuse.js";
import { glob } from "glob";
import { resolveSafePath } from "../shared/safePath.js";
import {
  markdownDocFrontmatterSchema,
  markdownSnippetFrontmatterSchema,
} from "../schemas/markdownKnowledge.js";

export type SnippetDocument = {
  id: string;
  name: string;
  title: string;
  summary: string;
  updatedAt?: string;
  framework?: string;
  version?: string;
  language?: string;
  category?: string;
  tags: string[];
  difficulty?: "beginner" | "medium" | "advanced";
  bestPractices: string[];
  pitfalls: string[];
  securityNotes: string[];
  body: string;
  path: string;
};

export type MarkdownDocument = {
  id: string;
  title: string;
  summary?: string;
  framework?: string;
  version?: string;
  tags: string[];
  body: string;
  path: string;
};

export type SnippetSearchOptions = {
  framework?: string;
  version?: string;
  category?: string;
  difficulty?: "beginner" | "medium" | "advanced";
  limit?: number;
};

export type SnippetSearchResult = SnippetDocument & {
  score?: number;
  rankScore: number;
  confidence: "high" | "medium" | "low";
  reasons: string[];
};

const TOKEN_SYNONYMS: Record<string, string[]> = {
  jwt: ["bearer", "token", "auth"],
  bearer: ["jwt", "token"],
  polly: ["resilience", "retry", "circuit-breaker"],
  resiliency: ["resilience", "polly"],
  efcore: ["entityframework", "entity-framework"],
  entityframework: ["efcore", "entity-framework"],
  redis: ["cache", "caching"],
  masstransit: ["messaging", "bus", "saga"],
  saga: ["state-machine", "workflow"],
};

async function readMarkdownFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export async function loadSnippetDocuments(): Promise<SnippetDocument[]> {
  const snippetsRoot = resolveSafePath("snippets");
  const files = await glob("**/*.md", {
    cwd: snippetsRoot,
    nodir: true,
    ignore: ["**/node_modules/**", "**/.git/**"],
  });

  const docs: SnippetDocument[] = [];
  for (const relativePath of files) {
    const absolutePath = path.join(snippetsRoot, relativePath);
    const raw = await readMarkdownFile(absolutePath);
    const parsed = matter(raw);
    const fm = markdownSnippetFrontmatterSchema.parse(parsed.data);
    const stat = await fs.stat(absolutePath);
    const updatedAt = fm.updatedAt ?? stat.mtime.toISOString();

    docs.push({
      id: fm.id,
      name: fm.name ?? fm.id,
      title: fm.title,
      summary: fm.summary,
      updatedAt,
      framework: fm.framework,
      version: fm.version,
      language: fm.language,
      category: fm.category,
      tags: fm.tags ?? [],
      difficulty: fm.difficulty,
      bestPractices: fm.bestPractices ?? [],
      pitfalls: fm.pitfalls ?? [],
      securityNotes: fm.securityNotes ?? [],
      body: parsed.content.trim(),
      path: `snippets/${relativePath.replace(/\\/g, "/")}`,
    });
  }

  return docs;
}

export async function findSnippetByName(
  snippetName: string,
): Promise<SnippetDocument | null> {
  const docs = await loadSnippetDocuments();
  return (
    docs.find((d) => d.name === snippetName || d.id === snippetName) ?? null
  );
}

export async function searchSnippetDocuments(
  query: string,
): Promise<SnippetSearchResult[]> {
  return searchSnippetDocumentsWithOptions(query, {});
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeText(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9.+-]+/g, " ")
    .replace(/\s+/g, " ");
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function expandQuery(query: string): {
  normalized: string;
  expanded: string;
  tokens: string[];
} {
  const tokens = tokenize(query);
  const expanded = new Set(tokens);

  for (const token of tokens) {
    const synonyms = TOKEN_SYNONYMS[token] ?? [];
    for (const synonym of synonyms) expanded.add(synonym);
  }

  const expandedQuery = Array.from(expanded).join(" ");
  return {
    normalized: normalizeText(query),
    expanded: expandedQuery,
    tokens,
  };
}

function extractVersionHints(
  query: string,
  explicitVersion?: string,
): string[] {
  const hints = new Set<string>();
  if (explicitVersion) hints.add(normalize(explicitVersion));

  const normalizedQuery = normalizeText(query);
  const patterns = [
    /\.net\s*\d+/g,
    /dotnet\s*\d+/g,
    /asp\.net\s*\d+/g,
    /net\s*\d+/g,
  ];

  for (const pattern of patterns) {
    const matches = normalizedQuery.match(pattern) ?? [];
    for (const match of matches) {
      hints.add(normalize(match).replace(/\s+/g, ""));
    }
  }

  return Array.from(hints);
}

function matchesVersion(
  docVersion: string | undefined,
  requested: string,
): boolean {
  if (!docVersion) return false;
  const a = normalize(docVersion).replace(/\s+/g, "");
  const b = normalize(requested).replace(/\s+/g, "");
  return a.includes(b) || b.includes(a);
}

function computeFreshnessScore(updatedAt?: string): number {
  if (!updatedAt) return 0;
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return 0;

  const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.8;
  if (ageDays <= 90) return 0.6;
  if (ageDays <= 180) return 0.4;
  if (ageDays <= 365) return 0.2;
  return 0;
}

function toConfidence(score: number): "high" | "medium" | "low" {
  if (score >= 0.75) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

export async function searchSnippetDocumentsWithOptions(
  query: string,
  options: SnippetSearchOptions,
): Promise<SnippetSearchResult[]> {
  const docs = await loadSnippetDocuments();
  if (!docs.length) return [];

  const {
    normalized: normalizedQuery,
    expanded: expandedQuery,
    tokens,
  } = expandQuery(query);
  const versionHints = extractVersionHints(query, options.version);

  const filteredDocs = docs.filter((doc) => {
    if (options.category) {
      if (normalize(doc.category ?? "") !== normalize(options.category))
        return false;
    }

    if (options.framework) {
      if (
        !normalize(doc.framework ?? "").includes(normalize(options.framework))
      ) {
        return false;
      }
    }

    if (options.version) {
      if (!matchesVersion(doc.version, options.version)) return false;
    }

    if (options.difficulty) {
      if (doc.difficulty !== options.difficulty) return false;
    }

    return true;
  });

  if (!filteredDocs.length) return [];

  const fuse = new Fuse(filteredDocs, {
    includeScore: true,
    threshold: 0.6,
    keys: ["title", "summary", "tags", "framework", "category", "body"],
  });

  let results = fuse.search(expandedQuery || query, {
    limit: Math.max(options.limit ?? 10, 50),
  });

  if (!results.length) {
    const fallback = filteredDocs
      .map((doc) => {
        const haystack = normalizeText(
          `${doc.title} ${doc.summary} ${doc.tags.join(" ")} ${doc.framework ?? ""} ${doc.category ?? ""} ${doc.body}`,
        );
        const tokenHits = tokens.filter((token) =>
          haystack.includes(token),
        ).length;
        const versionHit = versionHints.some((hint) =>
          matchesVersion(doc.version, hint),
        );
        const hitScore = tokenHits + (versionHit ? 1 : 0);
        return { doc, tokenHits, versionHit, hitScore };
      })
      .filter((item) => item.hitScore > 0)
      .sort((a, b) => b.hitScore - a.hitScore)
      .slice(0, Math.max(options.limit ?? 10, 50));

    results = fallback.map((item) => ({
      item: item.doc,
      refIndex: 0,
      score: Math.max(0.01, 1 - item.hitScore / 10),
    }));
  }

  const scored = results.map((r): SnippetSearchResult => {
    const doc = r.item;
    const fuseScore = r.score ?? 1;
    const baseRelevance = 1 - Math.min(Math.max(fuseScore, 0), 1);

    const reasons: string[] = [];

    const titleNormalized = normalizeText(doc.title);
    const exactTitleMatch =
      titleNormalized === normalizedQuery ||
      titleNormalized.includes(normalizedQuery);
    if (exactTitleMatch) reasons.push("title_match");

    const tagMatches = doc.tags.filter((tag) =>
      tokens.some((token) => normalize(tag).includes(token)),
    ).length;
    if (tagMatches > 0) reasons.push(`tag_matches:${tagMatches}`);

    const frameworkMatch = options.framework
      ? normalize(doc.framework ?? "").includes(normalize(options.framework))
      : false;
    if (frameworkMatch) reasons.push("framework_match");

    const versionMatch = versionHints.some((hint) =>
      matchesVersion(doc.version, hint),
    );
    if (versionMatch) reasons.push("version_precedence");

    const freshnessScore = computeFreshnessScore(doc.updatedAt);
    if (freshnessScore >= 0.6) reasons.push("fresh_content");

    const rankScore =
      baseRelevance * 0.55 +
      (exactTitleMatch ? 1 : 0) * 0.15 +
      (Math.min(tagMatches, 3) / 3) * 0.1 +
      (frameworkMatch ? 1 : 0) * 0.08 +
      (versionMatch ? 1 : 0) * 0.07 +
      freshnessScore * 0.05;

    return {
      ...doc,
      score: fuseScore,
      rankScore,
      confidence: toConfidence(rankScore),
      reasons,
    };
  });

  scored.sort((a, b) => {
    if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
    const titleCmp = a.title.localeCompare(b.title);
    if (titleCmp !== 0) return titleCmp;
    return a.id.localeCompare(b.id);
  });

  return scored.slice(0, options.limit ?? 10);
}

export async function loadNamedMarkdownDocument(
  folder: string,
  id: string,
): Promise<MarkdownDocument | null> {
  const root = resolveSafePath(folder);
  const idPattern = /^[A-Za-z0-9-]+$/;
  if (!idPattern.test(id)) {
    throw new Error(
      "Identifier can only contain letters, numbers, and hyphens",
    );
  }

  const filePath = path.join(root, `${id}.md`);
  try {
    const raw = await readMarkdownFile(filePath);
    const parsed = matter(raw);
    const fm = markdownDocFrontmatterSchema.parse(parsed.data);

    return {
      id: fm.id ?? id,
      title: fm.title,
      summary: fm.summary,
      framework: fm.framework,
      version: fm.version,
      tags: fm.tags ?? [],
      body: parsed.content.trim(),
      path: `${folder}/${id}.md`,
    };
  } catch (err: any) {
    if (err?.code === "ENOENT") return null;
    throw err;
  }
}

export async function listMarkdownDocNames(folder: string): Promise<string[]> {
  const root = resolveSafePath(folder);
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name.replace(/\.md$/i, ""))
      .sort();
  } catch {
    return [];
  }
}
