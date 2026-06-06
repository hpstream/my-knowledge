import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedTopic = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  readMinutes: number;
  estimatedMinutes: number;
  difficulty: number;
  cost: string;
  quiz: Array<{
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }>;
};

const TOPIC_DIR = path.join(process.cwd(), "docs", "topic-series");

function defaultQuiz(title: string) {
  return [
    {
      q: `这篇《${title}》主要解决的核心问题是什么？`,
      options: [
        "如何写更复杂的前端动画",
        "先理解概念和顺序，避免在不会的地方乱点导致卡住",
        "如何压缩图片提升性能",
        "如何做付费订阅",
      ],
      answer: 1,
      explanation:
        "这一组文章的目标是按小白视角，把“先理解 → 再注册 → 再第一次操作”的链路讲清楚，而不是直接扔代码。",
    },
    {
      q: "如果你对某个平台完全没概念，最合理的方式是什么？",
      options: [
        "跳过解释，直接点按钮",
        "先理解它解决什么问题、和其他平台是什么关系，再开始注册和配置",
        "先看别人代码仓库",
        "等以后再学",
      ],
      answer: 1,
      explanation:
        "这套专题的核心方法就是：先建立认知，再操作；先理解“为什么要这么做”，再点按钮。",
    },
    {
      q: "这一组专题最适合什么样的人？",
      options: [
        "只适合资深后端工程师",
        "完全不会代码但已经有产品想法、想把链路跑通的人",
        "只适合做游戏的人",
        "只适合企业 IT 管理员",
      ],
      answer: 1,
      explanation:
        "这一组文章专门按小白视角写，目标就是让有想法但不懂基础设施的人也能照着做下去。",
    },
  ];
}

async function loadTopicDoc(filename: string): Promise<SeedTopic> {
  const slug = filename.replace(/^\d+-/, "").replace(/\.md$/, "");
  const filePath = path.join(TOPIC_DIR, filename);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);

  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? slug;

  const summaryMatch = raw.match(/^>\s*目标：\*\*(.+?)\*\*/m);
  const summary = summaryMatch?.[1]?.trim() ?? `${title} · 小白专题`;

  const minutes = Number((data as { estimatedMinutes?: number })?.estimatedMinutes) || 18;
  const difficulty = Number((data as { difficulty?: number })?.difficulty) || 1;
  const cost = (data as { cost?: string })?.cost || "免费";

  return {
    slug,
    title,
    summary,
    body: content.trim() || raw.trim(),
    readMinutes: minutes,
    estimatedMinutes: minutes,
    difficulty,
    cost,
    quiz: defaultQuiz(title),
  };
}

async function main() {
  const files = [
    "01-understand-the-stack.md",
    "02-github-why-it-matters.md",
    "03-register-the-platform-accounts.md",
  ];

  const topics = await Promise.all(files.map(loadTopicDoc));
  const slugs = topics.map((t) => t.slug);

  // Remove the old three topic articles from the current lineup so /topics only
  // shows the new beginner-first series.
  await prisma.article.deleteMany({
    where: {
      kind: "topic",
      slug: {
        in: [
          "add-ai-chat-to-your-site",
          "deploy-your-project-with-vercel",
          "email-code-login",
        ],
      },
    },
  });

  let created = 0;
  let updated = 0;
  const now = new Date();

  for (const [idx, t] of topics.entries()) {
    const existing = await prisma.article.findUnique({ where: { slug: t.slug } });

    const payload = {
      slug: t.slug,
      kind: "topic",
      pathSlug: null as string | null,
      title: t.title,
      summary: t.summary,
      body: t.body,
      order: idx + 1,
      readMinutes: t.readMinutes,
      estimatedMinutes: t.estimatedMinutes,
      difficulty: t.difficulty,
      cost: t.cost,
      quizJson: JSON.stringify(t.quiz),
      status: "published",
      publishedAt: existing?.publishedAt ?? now,
      lastVerifiedAt: now,
    };

    if (existing) {
      await prisma.article.update({ where: { slug: t.slug }, data: payload });
      updated++;
    } else {
      await prisma.article.create({ data: payload });
      created++;
    }
  }

  console.log(
    `[seed-topics] 初学者专题完成：新建 ${created} 篇，覆盖 ${updated} 篇，当前展示 ${slugs.length} 篇`,
  );
}

main()
  .catch((err) => {
    console.error("[seed-topics] 失败：", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
