import "server-only";

import { prisma } from "@/lib/db";

export type SearchKind = "all" | "topic" | "path";

export type RibbonValue = "精品" | "推荐" | "新品" | "热门" | "付费" | null;

export type SearchResult = {
  slug: string;
  title: string;
  summary: string | null;
  kind: "topic" | "path";
  pathSlug: string | null;
  difficulty: number | null;
  cost: string | null;
  coverUrl: string | null;
  tags: string[];
  publishedAt: Date | null;
  readMinutes: number | null;
  ribbon: RibbonValue;
};

const RIBBON_VALUES = new Set(["精品", "推荐", "新品", "热门", "付费"]);

function normalizeRibbon(raw: string | null | undefined): RibbonValue {
  if (raw && RIBBON_VALUES.has(raw)) return raw as RibbonValue;
  return null;
}

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

type SearchOpts = {
  q: string;
  kind: SearchKind;
};

export async function searchAll(opts: SearchOpts): Promise<SearchResult[]> {
  const q = opts.q.trim();
  const kind = opts.kind;

  const articleQ = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { summary: { contains: q, mode: "insensitive" as const } },
          { body: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const pathQ = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const wantTopics = kind === "all" || kind === "topic";
  const wantPaths = kind === "all" || kind === "path";

  const [articles, paths] = await Promise.all([
    wantTopics
      ? prisma.article.findMany({
          where: {
            ...articleQ,
            status: "published",
            kind: "topic",
          },
          select: {
            slug: true,
            title: true,
            summary: true,
            kind: true,
            pathSlug: true,
            difficulty: true,
            cost: true,
            coverUrl: true,
            tagsJson: true,
            ribbon: true,
            publishedAt: true,
            readMinutes: true,
          },
          orderBy: [{ publishedAt: "desc" }],
          take: 40,
        })
      : Promise.resolve([]),
    wantPaths
      ? prisma.learningPath.findMany({
          where: { ...pathQ, status: "published" },
          select: {
            slug: true,
            title: true,
            description: true,
            level: true,
            estimatedHours: true,
            coverUrl: true,
            tagsJson: true,
            ribbon: true,
            publishedAt: true,
          },
          orderBy: [{ publishedAt: "desc" }],
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  const articleResults: SearchResult[] = articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    kind: "topic" as const,
    pathSlug: a.pathSlug,
    difficulty: a.difficulty,
    cost: a.cost,
    coverUrl: a.coverUrl,
    tags: parseTags(a.tagsJson),
    publishedAt: a.publishedAt,
    readMinutes: a.readMinutes,
    ribbon: normalizeRibbon(a.ribbon),
  }));

  const pathResults: SearchResult[] = paths.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.description,
    kind: "path" as const,
    pathSlug: null,
    difficulty: null,
    cost: null,
    coverUrl: p.coverUrl,
    tags: parseTags(p.tagsJson),
    publishedAt: p.publishedAt,
    readMinutes: null,
    ribbon: normalizeRibbon(p.ribbon),
  }));

  return [...articleResults, ...pathResults];
}
