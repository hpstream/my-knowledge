import sqlite3 from "node:sqlite";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readSqliteRows<T = Record<string, unknown>>(
  db: sqlite3.DatabaseSync,
  sql: string,
): T[] {
  const stmt = db.prepare(sql);
  return stmt.all() as T[];
}

async function main() {
  const sqlite = new sqlite3.DatabaseSync("prisma/dev.db", { readonly: true });

  console.log("[migrate-sqlite] 读取本地 SQLite 数据…");

  const paths = readSqliteRows<{
    id: string;
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
    status: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
  }>(sqlite, "SELECT * FROM LearningPath");

  const articles = readSqliteRows<{
    id: string;
    slug: string;
    pathSlug: string | null;
    kind: string;
    title: string;
    summary: string | null;
    body: string;
    order: number;
    readMinutes: number;
    estimatedMinutes: number | null;
    difficulty: number | null;
    cost: string | null;
    quizJson: string;
    status: string;
    lastVerifiedAt: string | null;
    authorId: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
  }>(sqlite, "SELECT * FROM Article");

  const users = readSqliteRows<{
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
    lastLoginAt: string | null;
  }>(sqlite, "SELECT * FROM User");

  const sessions = readSqliteRows<{
    id: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
    userAgent: string | null;
  }>(sqlite, "SELECT * FROM Session");

  const codes = readSqliteRows<{
    id: string;
    email: string;
    codeHash: string;
    expiresAt: string;
    consumedAt: string | null;
    attempts: number;
    createdAt: string;
  }>(sqlite, "SELECT * FROM EmailVerification");

  const feedback = readSqliteRows<{
    id: string;
    articleSlug: string;
    userId: string | null;
    email: string | null;
    category: string;
    body: string;
    status: string;
    createdAt: string;
    resolvedAt: string | null;
  }>(sqlite, "SELECT * FROM ArticleFeedback");

  const progress = readSqliteRows<{
    id: string;
    userId: string;
    pathSlug: string;
    lessonSlug: string;
    completedAt: string | null;
    scoreCorrect: number | null;
    scoreTotal: number | null;
    attemptsJson: string | null;
    createdAt: string;
    updatedAt: string;
  }>(sqlite, "SELECT * FROM UserLessonProgress");

  console.log("[migrate-sqlite] 开始写入 Neon…");

  for (const row of users) {
    await prisma.user.upsert({
      where: { email: row.email },
      update: {
        displayName: row.displayName,
        avatarUrl: row.avatarUrl,
        role: row.role,
        createdAt: new Date(row.createdAt),
        lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt) : null,
      },
      create: {
        id: row.id,
        email: row.email,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl,
        role: row.role,
        createdAt: new Date(row.createdAt),
        lastLoginAt: row.lastLoginAt ? new Date(row.lastLoginAt) : null,
      },
    });
  }

  for (const row of paths) {
    await prisma.learningPath.upsert({
      where: { slug: row.slug },
      update: {
        title: row.title,
        description: row.description,
        estimatedHours: row.estimatedHours,
        level: row.level,
        category: row.category,
        badge: row.badge,
        pricing: row.pricing,
        priceLabel: row.priceLabel,
        statusLabel: row.statusLabel,
        highlightsJson: row.highlightsJson,
        accent: row.accent,
        status: row.status,
        sortOrder: row.sortOrder,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
      },
      create: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        estimatedHours: row.estimatedHours,
        level: row.level,
        category: row.category,
        badge: row.badge,
        pricing: row.pricing,
        priceLabel: row.priceLabel,
        statusLabel: row.statusLabel,
        highlightsJson: row.highlightsJson,
        accent: row.accent,
        status: row.status,
        sortOrder: row.sortOrder,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
      },
    });
  }

  for (const row of articles) {
    await prisma.article.upsert({
      where: { slug: row.slug },
      update: {
        pathSlug: row.pathSlug,
        kind: row.kind,
        title: row.title,
        summary: row.summary,
        body: row.body,
        order: row.order,
        readMinutes: row.readMinutes,
        estimatedMinutes: row.estimatedMinutes,
        difficulty: row.difficulty,
        cost: row.cost,
        quizJson: row.quizJson,
        status: row.status,
        lastVerifiedAt: row.lastVerifiedAt ? new Date(row.lastVerifiedAt) : null,
        authorId: row.authorId,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
      },
      create: {
        id: row.id,
        slug: row.slug,
        pathSlug: row.pathSlug,
        kind: row.kind,
        title: row.title,
        summary: row.summary,
        body: row.body,
        order: row.order,
        readMinutes: row.readMinutes,
        estimatedMinutes: row.estimatedMinutes,
        difficulty: row.difficulty,
        cost: row.cost,
        quizJson: row.quizJson,
        status: row.status,
        lastVerifiedAt: row.lastVerifiedAt ? new Date(row.lastVerifiedAt) : null,
        authorId: row.authorId,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
      },
    });
  }

  for (const row of sessions) {
    await prisma.session.upsert({
      where: { id: row.id },
      update: {
        userId: row.userId,
        createdAt: new Date(row.createdAt),
        expiresAt: new Date(row.expiresAt),
        userAgent: row.userAgent,
      },
      create: {
        id: row.id,
        userId: row.userId,
        createdAt: new Date(row.createdAt),
        expiresAt: new Date(row.expiresAt),
        userAgent: row.userAgent,
      },
    });
  }

  for (const row of codes) {
    await prisma.emailVerification.create({
      data: {
        id: row.id,
        email: row.email,
        codeHash: row.codeHash,
        expiresAt: new Date(row.expiresAt),
        consumedAt: row.consumedAt ? new Date(row.consumedAt) : null,
        attempts: row.attempts,
        createdAt: new Date(row.createdAt),
      },
    }).catch(() => undefined);
  }

  for (const row of feedback) {
    await prisma.articleFeedback.create({
      data: {
        id: row.id,
        articleSlug: row.articleSlug,
        userId: row.userId,
        email: row.email,
        category: row.category,
        body: row.body,
        status: row.status,
        createdAt: new Date(row.createdAt),
        resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      },
    }).catch(() => undefined);
  }

  for (const row of progress) {
    await prisma.userLessonProgress.upsert({
      where: { userId_lessonSlug: { userId: row.userId, lessonSlug: row.lessonSlug } },
      update: {
        pathSlug: row.pathSlug,
        completedAt: row.completedAt ? new Date(row.completedAt) : null,
        scoreCorrect: row.scoreCorrect,
        scoreTotal: row.scoreTotal,
        attemptsJson: row.attemptsJson,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
      create: {
        id: row.id,
        userId: row.userId,
        pathSlug: row.pathSlug,
        lessonSlug: row.lessonSlug,
        completedAt: row.completedAt ? new Date(row.completedAt) : null,
        scoreCorrect: row.scoreCorrect,
        scoreTotal: row.scoreTotal,
        attemptsJson: row.attemptsJson,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
    });
  }

  sqlite.close();
  console.log("[migrate-sqlite] 完成：本地 SQLite 数据已迁到 Neon");
}

main()
  .catch((err) => {
    console.error("[migrate-sqlite] 失败：", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
