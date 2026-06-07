import "server-only";

import { prisma } from "@/lib/db";
import {
  quizQuestionSchema,
  type Article,
  type ArticleFrontmatter,
  type QuizQuestion,
} from "@/lib/types";

type ArticleRow = {
  slug: string;
  pathSlug: string | null;
  title: string;
  summary: string | null;
  body: string;
  order: number;
  readMinutes: number;
  quizJson: string;
  status: string;
};

function parseQuiz(quizJson: string): QuizQuestion[] {
  if (!quizJson) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(quizJson);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const result: QuizQuestion[] = [];
  for (const item of parsed) {
    const safe = quizQuestionSchema.safeParse(item);
    if (safe.success) result.push(safe.data);
  }
  return result;
}

function rowToArticle(row: ArticleRow): Article {
  const frontmatter: ArticleFrontmatter = {
    title: row.title,
    slug: row.slug,
    pathSlug: row.pathSlug ?? "",
    order: row.order,
    readMinutes: row.readMinutes,
    summary: row.summary ?? undefined,
    quiz: parseQuiz(row.quizJson),
  };
  return { frontmatter, body: row.body };
}

export async function listPublishedArticles(): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: [{ pathSlug: "asc" }, { order: "asc" }],
  });
  return rows.map(rowToArticle);
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const row = await prisma.article.findUnique({ where: { slug } });
  if (!row) return null;
  if (row.status !== "published") return null;
  return rowToArticle(row);
}

export async function getPublishedArticlesByPath(
  pathSlug: string,
): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { pathSlug, status: "published" },
    orderBy: { order: "asc" },
  });
  return rows.map(rowToArticle);
}

export type TopicSummary = {
  slug: string;
  title: string;
  summary: string | null;
  difficulty: number | null;
  estimatedMinutes: number | null;
  cost: string | null;
  coverUrl: string | null;
  tags: string[];
  ribbon: string | null;
  readMinutes: number;
  publishedAt: Date | null;
  lastVerifiedAt: Date | null;
};

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

const STALE_DAYS = 60;

export function isStale(lastVerifiedAt: Date | null): boolean {
  if (!lastVerifiedAt) return false;
  const diff = Date.now() - lastVerifiedAt.getTime();
  return diff > STALE_DAYS * 24 * 60 * 60 * 1000;
}

export async function listPublishedTopics(): Promise<TopicSummary[]> {
  const rows = await prisma.article.findMany({
    where: { kind: "topic", status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      slug: true,
      title: true,
      summary: true,
      difficulty: true,
      estimatedMinutes: true,
      cost: true,
      coverUrl: true,
      tagsJson: true,
      ribbon: true,
      readMinutes: true,
      publishedAt: true,
      lastVerifiedAt: true,
    },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    difficulty: r.difficulty,
    estimatedMinutes: r.estimatedMinutes,
    cost: r.cost,
    coverUrl: r.coverUrl,
    tags: parseTags(r.tagsJson),
    ribbon: r.ribbon,
    readMinutes: r.readMinutes,
    publishedAt: r.publishedAt,
    lastVerifiedAt: r.lastVerifiedAt,
  }));
}

export type TopicDetail = {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  difficulty: number | null;
  estimatedMinutes: number | null;
  cost: string | null;
  readMinutes: number;
  publishedAt: Date | null;
  lastVerifiedAt: Date | null;
  updatedAt: Date;
  quiz: QuizQuestion[];
};

export async function getPublishedTopicBySlug(
  slug: string,
): Promise<TopicDetail | null> {
  const row = await prisma.article.findUnique({ where: { slug } });
  if (!row) return null;
  if (row.kind !== "topic") return null;
  if (row.status !== "published") return null;
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimatedMinutes,
    cost: row.cost,
    readMinutes: row.readMinutes,
    publishedAt: row.publishedAt,
    lastVerifiedAt: row.lastVerifiedAt,
    updatedAt: row.updatedAt,
    quiz: parseQuiz(row.quizJson),
  };
}
