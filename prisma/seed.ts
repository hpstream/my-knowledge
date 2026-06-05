import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PATHS_DIR = path.join(process.cwd(), "content", "paths");
const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

type ArticleFM = {
  title: string;
  slug: string;
  pathSlug: string;
  order: number;
  readMinutes: number;
  summary?: string;
  quiz?: unknown[];
};

type PathJson = {
  slug: string;
  title: string;
  description: string;
  estimatedHours: number;
  level?: string;
  category?: string;
  badge?: string;
  pricing?: string;
  priceLabel?: string;
  statusLabel?: string;
  highlights?: string[];
  accent?: string;
};

async function dirExists(p: string): Promise<boolean> {
  return fs
    .stat(p)
    .then((s) => s.isDirectory())
    .catch(() => false);
}

async function seedPaths() {
  if (!(await dirExists(PATHS_DIR))) {
    console.log(`[seed] ${PATHS_DIR} 不存在，跳过路径导入`);
    return;
  }
  const files = (await fs.readdir(PATHS_DIR)).filter((f) =>
    f.endsWith(".json"),
  );
  if (files.length === 0) {
    console.log("[seed] 没有路径 JSON 可导入");
    return;
  }

  let created = 0;
  let updated = 0;

  for (const filename of files) {
    const raw = await fs.readFile(path.join(PATHS_DIR, filename), "utf8");
    const data = JSON.parse(raw) as PathJson;
    if (!data.slug || !data.title) {
      console.warn(`[seed] 跳过 ${filename}：缺少 slug 或 title`);
      continue;
    }

    const existing = await prisma.learningPath.findUnique({
      where: { slug: data.slug },
    });

    const payload = {
      slug: data.slug,
      title: data.title,
      description: data.description,
      estimatedHours: data.estimatedHours ?? 2,
      level: data.level ?? "Beginner",
      category: data.category ?? "AI Engineering",
      badge: data.badge ?? null,
      pricing: data.pricing ?? "free",
      priceLabel: data.priceLabel ?? null,
      statusLabel: data.statusLabel ?? null,
      highlightsJson: JSON.stringify(data.highlights ?? []),
      accent: data.accent ?? null,
      status: "published",
      publishedAt: existing?.publishedAt ?? new Date(),
    };

    if (existing) {
      await prisma.learningPath.update({
        where: { slug: data.slug },
        data: payload,
      });
      updated++;
    } else {
      await prisma.learningPath.create({ data: payload });
      created++;
    }
  }

  console.log(`[seed] 路径完成：新建 ${created} 条，覆盖 ${updated} 条`);
}

async function seedArticles() {
  if (!(await dirExists(ARTICLES_DIR))) {
    console.log(`[seed] ${ARTICLES_DIR} 不存在，跳过文章导入`);
    return;
  }
  const files = (await fs.readdir(ARTICLES_DIR)).filter((f) =>
    f.endsWith(".md"),
  );
  if (files.length === 0) {
    console.log("[seed] 没有 .md 文章可导入");
    return;
  }

  let created = 0;
  let updated = 0;

  for (const filename of files) {
    const raw = await fs.readFile(path.join(ARTICLES_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const fm = data as ArticleFM;
    if (!fm.slug || !fm.pathSlug || !fm.title) {
      console.warn(`[seed] 跳过 ${filename}：缺少必填 frontmatter 字段`);
      continue;
    }

    const existing = await prisma.article.findUnique({
      where: { slug: fm.slug },
    });

    const payload = {
      slug: fm.slug,
      pathSlug: fm.pathSlug,
      title: fm.title,
      summary: fm.summary ?? null,
      body: content.trim(),
      order: fm.order,
      readMinutes: fm.readMinutes,
      quizJson: JSON.stringify(fm.quiz ?? []),
      status: "published",
      publishedAt: existing?.publishedAt ?? new Date(),
    };

    if (existing) {
      await prisma.article.update({
        where: { slug: fm.slug },
        data: payload,
      });
      updated++;
    } else {
      await prisma.article.create({ data: payload });
      created++;
    }
  }

  console.log(`[seed] 文章完成：新建 ${created} 篇，覆盖 ${updated} 篇`);
}

async function main() {
  await seedPaths();
  await seedArticles();
}

main()
  .catch((err) => {
    console.error("[seed] 失败：", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
