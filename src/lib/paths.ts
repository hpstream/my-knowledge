import "server-only";

import { prisma } from "@/lib/db";
import {
  learningPathSchema,
  type LearningPath,
} from "@/lib/types";

type PathRow = {
  slug: string;
  title: string;
  description: string;
  estimatedHours: number;
  level: string;
  category: string;
  badge: string | null;
  pricing: string;
  priceLabel: string | null;
  statusLabel: string | null;
  highlightsJson: string;
  accent: string | null;
  coverUrl: string | null;
  tagsJson: string;
  ribbon: string | null;
  status: string;
};

function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

function rowToPath(row: PathRow): LearningPath {
  let highlights: string[] = [];
  try {
    const parsed = JSON.parse(row.highlightsJson || "[]");
    if (Array.isArray(parsed)) highlights = parsed.filter((s) => typeof s === "string");
  } catch {
    highlights = [];
  }
  return learningPathSchema.parse({
    slug: row.slug,
    title: row.title,
    description: row.description,
    estimatedHours: row.estimatedHours,
    lessonSlugs: [],
    level: row.level,
    category: row.category,
    badge: row.badge ?? undefined,
    pricing: row.pricing as "free" | "paid",
    priceLabel: row.priceLabel ?? undefined,
    statusLabel: row.statusLabel ?? undefined,
    highlights,
    accent: row.accent ?? undefined,
    coverUrl: row.coverUrl ?? undefined,
    tags: parseStringArray(row.tagsJson),
    ribbon: row.ribbon ?? undefined,
  });
}

export async function listPublishedPaths(): Promise<LearningPath[]> {
  const rows = await prisma.learningPath.findMany({
    where: { status: "published" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(rowToPath);
}

export async function getPublishedPathBySlug(
  slug: string,
): Promise<LearningPath | null> {
  const row = await prisma.learningPath.findUnique({ where: { slug } });
  if (!row || row.status !== "published") return null;
  return rowToPath(row);
}

export async function countPublishedArticlesByPath(
  pathSlug: string,
): Promise<number> {
  return prisma.article.count({
    where: { pathSlug, status: "published" },
  });
}

export type PathWithCount = LearningPath & { lessonCount: number };

export async function listPublishedPathsWithCounts(): Promise<PathWithCount[]> {
  const paths = await listPublishedPaths();
  return Promise.all(
    paths.map(async (p) => ({
      ...p,
      lessonCount: await countPublishedArticlesByPath(p.slug),
    })),
  );
}
