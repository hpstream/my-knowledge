import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedPath = {
  slug: string;
  title: string;
  description: string;
  estimatedHours: number;
  level: string;
  category: string;
  tags: string[];
  ribbon: string | null;
  coverUrl: string | null;
  highlights: string[];
  sortOrder: number;
};

type SeedTopic = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  readMinutes: number;
  difficulty: number;
  cost: string;
  tags: string[];
  ribbon: string | null;
  coverUrl: string | null;
};

const PATHS: SeedPath[] = [
  {
    slug: "ai-fundamentals",
    title: "AI 基础概念入门",
    description: "从 0 搞懂 Token、上下文、提示词、模型差异，建立用 AI 写代码的基本认知。",
    estimatedHours: 2,
    level: "入门",
    category: "AI 认知",
    tags: ["AI 认知", "入门", "概念", "提示词"],
    ribbon: "新品",
    coverUrl: "/covers/ai-fundamentals.png",
    highlights: [
      "Token｜搞清楚这是 AI 计费和上下文的核心单位",
      "提示词｜怎么写一句话才能让 AI 真听懂",
      "模型差异｜便宜 vs 强模型，什么场景选哪个",
      "实战误区｜哪些是初学者最容易踩的坑",
    ],
    sortOrder: 1,
  },
  {
    slug: "vibecoding-mastery",
    title: "vibeCoding 从入门到精通",
    description:
      "建立 AI 编程范式的完整理解：搞懂 VibeCoding 是什么、装好工具、读懂 LLM 边界、掌握核心心智模型，并亲手做出第一个项目。",
    estimatedHours: 3,
    level: "进阶",
    category: "AI 编程",
    tags: ["AI 编程", "Cursor", "Claude Code", "实战"],
    ribbon: "精品",
    coverUrl: "/covers/vibecoding.png",
    highlights: [
      "搞懂 VibeCoding｜不是用 AI 替你写代码，是和它合作",
      "装好工具｜Cursor / Claude Code 这一套要怎么用",
      "读懂边界｜哪些事 AI 能做，哪些不要交给它",
      "动手项目｜从 0 跑通一个真正能用的小应用",
    ],
    sortOrder: 2,
  },
  {
    slug: "launch-your-first-site",
    title: "了解整个网站的运行流程",
    description:
      "从 0 搞懂 GitHub、Vercel、Neon、Cloudflare、Resend，到把你的网站真正上线。按顺序学，不再被一堆平台名词吓到。",
    estimatedHours: 4,
    level: "入门",
    category: "全栈基础",
    tags: ["部署", "Vercel", "GitHub", "Neon", "Cloudflare"],
    ribbon: "推荐",
    coverUrl: "/covers/website-stack.png",
    highlights: [
      "技术栈全景｜搞清楚每个平台到底是干嘛的",
      "GitHub｜代码托管的最小可用工作流",
      "Vercel + Neon｜把你的网站和数据库连起来",
      "上线清单｜出发前最后一遍检查",
    ],
    sortOrder: 3,
  },
  {
    slug: "become-a-pm",
    title: "学习如何当产品经理",
    description: "不是教你做汇报，是教你怎么把一个想法变成可以上线的东西。需求拆解、优先级、最小可行产品全流程。",
    estimatedHours: 3,
    level: "入门",
    category: "产品思维",
    tags: ["产品", "需求", "MVP", "独立开发"],
    ribbon: null,
    coverUrl: "/covers/become-pm.png",
    highlights: [
      "需求拆解｜把模糊想法变成可以做的小卡片",
      "优先级｜哪些功能这周必须做，哪些以后再说",
      "MVP｜怎么砍出一个最小可上线的版本",
      "用户对话｜如何用 5 个问题验证一个想法",
    ],
    sortOrder: 4,
  },
];

const TOPICS: SeedTopic[] = [
  {
    slug: "integrate-ai-image-generation",
    title: "如何在自己的应用中接入 AI 绘图",
    summary: "讲清楚选哪家 API、Node/Next.js 怎么调、怎么把生成的图存起来、生产环境的坑。",
    body: `## 适合人群

* 已经做过 Next.js / Node 项目
* 想给应用加一个"AI 画图"功能
* 不想被 prompt、参数、计费、存储这一堆细节卡住

---

## 一、选哪家 API

先用一句话说清楚常见三家：

| 服务 | 特点 | 适合 |
|---|---|---|
| OpenAI \`images.generate\` | 接入最简单，按图收费 | 简单一次性出图 |
| Stability / Replicate | 模型多、可微调 | 风格控制需求强 |
| 国内中转（如 mossx） | 免代理、人民币计费 | 国内部署 |

> 👉 选型口诀：**简单选 OpenAI，国内选中转，需要控风格选 Replicate。**

---

## 二、最小代码示例

\`\`\`ts
// app/api/images/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }
  const data = await res.json();
  return NextResponse.json({ url: data.data[0].url });
}
\`\`\`

---

## 三、生产环境的几个坑

1. **图片只能临时下载** — OpenAI 返回的 URL 24 小时就失效。要持久化必须存到自己的对象存储（R2 / Vercel Blob / S3）
2. **生成耗时** — 一张 1024×1024 通常 8-30 秒，要么前端转圈，要么用 webhook
3. **NSFW 限制** — 用户输入要先过滤敏感词，被封号没人赔
4. **价格** — 一张 \$0.04 起，单用户连续生成可能日烧 \$50+

---

## 四、上线前最后检查

* [ ] API Key 放在服务端，不要扔到客户端
* [ ] 图片立即下载到自己的存储，存数据库的是你存储里的 URL
* [ ] 有限流（每用户每分钟 N 张）
* [ ] 有错误兜底（API 挂了显示什么）
`,
    readMinutes: 8,
    difficulty: 3,
    cost: "免费",
    tags: ["AI 绘图", "Next.js", "API", "实战"],
    ribbon: "新品",
    coverUrl: "/covers/integrate-ai-image.png",
  },
  {
    slug: "how-to-use-ai-image-generation",
    title: "如何使用 AI 绘制图片",
    summary: "不是教你装 SD，是讲清楚提示词怎么写、参数怎么调、不同场景选什么工具。",
    body: `## 适合人群

* 听过 Midjourney、SD，但从没真用过
* 想给自己的产品、公众号、PPT 配几张能看的图
* 不想花太多时间学，能用就行

---

## 一、不会装 SD 也能开始

**最简单三个入口**：

| 工具 | 价格 | 上手 |
|---|---|---|
| Midjourney | \$10/月 | 极简，Discord 里发命令 |
| ChatGPT 的 DALL·E | 包月里送 | 直接对话 |
| Bing / Copilot 画图 | 免费 | 一句话出图 |

> 👉 先在这三个里试用一周，确定你需要什么风格，再考虑装本地 SD。

---

## 二、提示词三段式

很多人一开始写：「画一只猫」→ 然后失望。

试试这个公式：

\`\`\`
[主体] + [风格 / 氛围] + [细节修饰]
\`\`\`

例子：

* ❌ 一只猫
* ✅ 一只橘色小猫，水彩插画风格，蹲在木窗台上，阳光从侧面打过来

**关键技巧**：

1. **先写一次生成 3-4 张**，挑选接着微调，这是 AI 出图的正常工作方式
2. **出来的图不满意这样做**：复述一遍生图细节 → 告诉它哪里要改 → 再次生成

---

## 三、四流式 vs 非流式对设计师意味着什么

* **流式 (Streaming)** — 适合需要快速预览的场景
* **非流式 (One-shot)** — 适合最终高质量出图

跑完会按顺序得到 3-4 张图，从模糊到清晰，你能亲眼看到流式和非流式的体验差别。

---

## 四、几个常见误区

1. **以为提示词越长越好** — 80 字以内最稳，超过 AI 抓不住重点
2. **用中文 prompt 出图不好** — 翻成英文常常质量翻倍
3. **追求完美一次出图** — 真实流程是 3-5 张里挑一张接着改

---

## 总结

* 先用现成工具（Midjourney / DALL·E），别一上来折腾本地 SD
* 提示词写**主体 + 风格 + 细节**
* 不满意就**接着对话改**，不是重写
* 中英文 prompt 都试，挑效果好的
`,
    readMinutes: 6,
    difficulty: 2,
    cost: "免费",
    tags: ["AI 绘图", "提示词", "Midjourney", "入门"],
    ribbon: null,
    coverUrl: "/covers/use-ai-image.png",
  },
];

async function upsertPath(p: SeedPath) {
  await prisma.learningPath.upsert({
    where: { slug: p.slug },
    update: {
      title: p.title,
      description: p.description,
      estimatedHours: p.estimatedHours,
      level: p.level,
      category: p.category,
      tagsJson: JSON.stringify(p.tags),
      ribbon: p.ribbon,
      coverUrl: p.coverUrl,
      highlightsJson: JSON.stringify(p.highlights),
      sortOrder: p.sortOrder,
      pricing: "free",
      status: "published",
      publishedAt: new Date(),
    },
    create: {
      slug: p.slug,
      title: p.title,
      description: p.description,
      estimatedHours: p.estimatedHours,
      level: p.level,
      category: p.category,
      tagsJson: JSON.stringify(p.tags),
      ribbon: p.ribbon,
      coverUrl: p.coverUrl,
      highlightsJson: JSON.stringify(p.highlights),
      sortOrder: p.sortOrder,
      pricing: "free",
      status: "published",
      publishedAt: new Date(),
    },
  });
  console.log(`✓ path: ${p.slug}`);
}

async function upsertTopic(t: SeedTopic) {
  await prisma.article.upsert({
    where: { slug: t.slug },
    update: {
      title: t.title,
      summary: t.summary,
      body: t.body,
      kind: "topic",
      pathSlug: null,
      readMinutes: t.readMinutes,
      difficulty: t.difficulty,
      cost: t.cost,
      tagsJson: JSON.stringify(t.tags),
      ribbon: t.ribbon,
      coverUrl: t.coverUrl,
      status: "published",
      publishedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
    create: {
      slug: t.slug,
      title: t.title,
      summary: t.summary,
      body: t.body,
      kind: "topic",
      pathSlug: null,
      order: 1,
      readMinutes: t.readMinutes,
      difficulty: t.difficulty,
      cost: t.cost,
      tagsJson: JSON.stringify(t.tags),
      ribbon: t.ribbon,
      coverUrl: t.coverUrl,
      status: "published",
      publishedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
  });
  console.log(`✓ topic: ${t.slug}`);
}

async function main() {
  console.log("→ seeding paths…");
  for (const p of PATHS) await upsertPath(p);
  console.log("→ seeding topics…");
  for (const t of TOPICS) await upsertTopic(t);
  console.log("done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
