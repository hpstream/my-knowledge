import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

// 文件名 → 短哈希 slug。避免中文 URL 编码 / NFC 等一切坑。
function slugForFile(pathSlug: string, file: string): string {
  return crypto
    .createHash("sha1")
    .update(`${pathSlug}/${file}`)
    .digest("hex")
    .slice(0, 10);
}

const prisma = new PrismaClient();

type SeriesConfig = {
  dir: string;
  pathSlug: string;
  pathTitle: string;
  pathDescription: string;
  level: string;
  category: string;
  badge: string;
  pricing: "free" | "paid";
  priceLabel: string;
  statusLabel: string;
  highlights: string[];
  accent: string;
  sortOrder: number;
};

// 写入数据库时，把 ./img/... 这种相对路径改成 GitHub raw 链接，
// 这样前台 markdown 渲染时就能直接拿到图。
const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/hpstream/my-knowledge/main";

function encodePathPreservingSlash(p: string): string {
  return p
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function rewriteImagePaths(body: string, articleDirRelative: string): string {
  return body.replace(
    /!\[([^\]]*)\]\(\.\/((?:[^)\s]|\s(?!\)))+?)\)/g,
    (_match, alt, rel) => {
      const cleanRel = rel.trim();
      const encoded = encodePathPreservingSlash(`${articleDirRelative}/${cleanRel}`);
      return `![${alt}](${GITHUB_RAW_BASE}/${encoded})`;
    },
  );
}

const SERIES: SeriesConfig[] = [
  {
    dir: "article/普通人也能做产品",
    pathSlug: "ordinary-people-build-product",
    pathTitle: "普通人也能做产品",
    pathDescription:
      "写给普通人的入门系列：不要求你会写代码，先帮你建立完整地图。一个普通人怎样借助 AI 和工具，理解产品、看懂技术词、迈出做产品的第一步。",
    level: "Beginner",
    category: "入门认知",
    badge: "Free Series",
    pricing: "free",
    priceLabel: "免费",
    statusLabel: "先建立地图，再去实操",
    highlights: [
      "13 篇按顺序看的入门文章",
      "完全按零基础视角写，不预设技术背景",
      "先看懂概念，再去看专题和实战",
    ],
    accent: "amber",
    sortOrder: 1,
  },
  {
    dir: "article/系列/从0开始用github管理项目",
    pathSlug: "github-from-zero",
    pathTitle: "从 0 开始用 GitHub 管理你的第一个项目",
    pathDescription:
      "从注册 GitHub 账号，到建立仓库、装 Git，到把代码推上 GitHub 的完整闭环。Mac 主线，Windows 在文章里有对照。",
    level: "Beginner",
    category: "GitHub 与 Git",
    badge: "Free Series",
    pricing: "free",
    priceLabel: "免费",
    statusLabel: "拥有自己的 GitHub 项目能力",
    highlights: [
      "4 篇按顺序学习的系列文章",
      "完全按小白视角写，先理解后操作",
      "学完拥有完整的 GitHub + Git 闭环",
    ],
    accent: "emerald",
    sortOrder: 3,
  },
];

function isArticleFile(name: string): boolean {
  // 只导入开头是数字的文件，README 和其它 md 跳过
  return /^\d+-.+\.md$/.test(name);
}

function titleFromBody(raw: string): string {
  const match = raw.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "未命名文章";
}

function summaryFromBody(raw: string): string {
  // 优先取第一个引用块
  const quote = raw.match(/^>\s*(.+?)$/m);
  if (quote) return quote[1].trim().slice(0, 110);
  // 次选第一个非标题非引用段
  const paras = raw
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#") && !s.startsWith(">"));
  return paras[0]?.slice(0, 110) ?? "";
}

// 剥掉文章里的 "## 下一篇" 区块（含下面那行 "继续看 [...](./...)"）。
// 前台已经有底部的上一篇/下一篇导航条，文章正文不再需要这一段。
function stripInlineNextLink(body: string): string {
  return body.replace(
    /\n*##\s*下一篇\s*\n+继续看[^\n]*\n*/g,
    "\n\n",
  );
}

function bodyWithoutH1(raw: string): string {
  return raw.replace(/^#\s+.+\n+/, "").trim();
}

function inferMinutes(body: string): number {
  // 中文按 ~500 字/分钟估
  return Math.max(3, Math.round(body.length / 500));
}

async function importSeries(cfg: SeriesConfig) {
  const dir = path.join(process.cwd(), cfg.dir);
  const all = await fs.readdir(dir);
  const files = all.filter(isArticleFile).sort();

  if (files.length === 0) {
    console.warn(`[seed] ${cfg.pathTitle}: 找不到任何文章，跳过`);
    return;
  }

  // 1) 准备 path
  const existingPath = await prisma.learningPath.findUnique({
    where: { slug: cfg.pathSlug },
  });

  const pathPayload = {
    slug: cfg.pathSlug,
    title: cfg.pathTitle,
    description: cfg.pathDescription,
    estimatedHours: Math.max(1, Math.round(files.length * 0.4 * 10) / 10),
    level: cfg.level,
    category: cfg.category,
    badge: cfg.badge,
    pricing: cfg.pricing,
    priceLabel: cfg.priceLabel,
    statusLabel: cfg.statusLabel,
    highlightsJson: JSON.stringify(cfg.highlights),
    accent: cfg.accent,
    status: "published",
    sortOrder: cfg.sortOrder,
    publishedAt: existingPath?.publishedAt ?? new Date(),
  };

  if (existingPath) {
    await prisma.learningPath.update({
      where: { slug: cfg.pathSlug },
      data: pathPayload,
    });
  } else {
    await prisma.learningPath.create({ data: pathPayload });
  }

  // 清掉这个 path 下所有旧 article。
  // 原因：早期 seed 用 macOS 文件名（NFD）当 slug 写进了 DB，
  // 浏览器 URL 解码出来是 NFC，导致路由找不到。
  // 直接 deleteMany 重建，保证所有 slug 统一为 NFC。
  await prisma.article.deleteMany({ where: { pathSlug: cfg.pathSlug } });

  // 2) 依次导入文章
  let created = 0;
  let updated = 0;
  const now = new Date();

  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    // slug 用文件名的短哈希，避免中文 URL 编码 / NFC 等问题。
    const slug = slugForFile(cfg.pathSlug, file);
    const title = titleFromBody(raw);
    const summary = summaryFromBody(raw);
    const body = stripInlineNextLink(
      rewriteImagePaths(bodyWithoutH1(raw) || raw, cfg.dir),
    );
    const orderMatch = file.match(/^(\d+)/);
    const order = orderMatch ? Number(orderMatch[1]) : 0;
    const readMinutes = inferMinutes(body);

    const existing = await prisma.article.findUnique({ where: { slug } });

    const payload = {
      slug,
      kind: "lesson",
      pathSlug: cfg.pathSlug,
      title,
      summary,
      body,
      order,
      readMinutes,
      estimatedMinutes: readMinutes,
      difficulty: 1,
      cost: "免费",
      quizJson: "[]",
      status: "published",
      publishedAt: existing?.publishedAt ?? now,
      lastVerifiedAt: now,
    };

    if (existing) {
      await prisma.article.update({ where: { slug }, data: payload });
      updated++;
    } else {
      await prisma.article.create({ data: payload });
      created++;
    }
  }

  console.log(
    `[seed] ${cfg.pathTitle}: 新建 ${created} 篇，覆盖 ${updated} 篇`,
  );
}

async function main() {
  for (const cfg of SERIES) {
    await importSeries(cfg);
  }
}

main()
  .catch((err) => {
    console.error("[seed] 失败：", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
