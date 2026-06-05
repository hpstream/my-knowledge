import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import {
  marketingCourseSchema,
  type Article,
  type LearningPath,
  type MarketingCourse,
} from "./types";
import {
  getPublishedArticleBySlug,
  getPublishedArticlesByPath,
  listPublishedArticles,
} from "./articles";
import {
  getPublishedPathBySlug,
  listPublishedPaths,
  listPublishedPathsWithCounts,
  type PathWithCount,
} from "./paths";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const PAID_COURSES_PATH = path.join(CONTENT_ROOT, "paid-courses.json");

export async function getAllArticles(): Promise<Article[]> {
  return listPublishedArticles();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getPublishedArticleBySlug(slug);
}

export async function getAllPaths(): Promise<LearningPath[]> {
  return listPublishedPaths();
}

export async function getFreePaths(): Promise<PathWithCount[]> {
  const all = await listPublishedPathsWithCounts();
  return all.filter((p) => p.pricing === "free");
}

export async function getPaidCourses(): Promise<MarketingCourse[]> {
  const raw = await fs.readFile(PAID_COURSES_PATH, "utf8");
  const data = JSON.parse(raw) as unknown[];
  return data.map((item) => marketingCourseSchema.parse(item));
}

export async function getPathBySlug(
  slug: string,
): Promise<LearningPath | null> {
  return getPublishedPathBySlug(slug);
}

export async function getPathWithArticles(slug: string) {
  const learningPath = await getPathBySlug(slug);
  if (!learningPath) return null;
  const articles = await getPublishedArticlesByPath(slug);
  return { learningPath, articles };
}

export async function getAdjacentArticles(slug: string) {
  const article = await getArticleBySlug(slug);
  if (!article) return { prev: null, next: null };
  const result = await getPathWithArticles(article.frontmatter.pathSlug);
  if (!result) return { prev: null, next: null };
  const idx = result.articles.findIndex(
    (a) => a.frontmatter.slug === slug,
  );
  return {
    prev: idx > 0 ? result.articles[idx - 1] : null,
    next:
      idx >= 0 && idx < result.articles.length - 1
        ? result.articles[idx + 1]
        : null,
  };
}
