import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERIES_DIR = path.join(process.cwd(), "docs", "topic-series");
const PATH_SLUG = "launch-your-first-site";
const PATH_TITLE = "从 0 到上线一个网站";

const FILES = [
  "01-understand-the-stack.md",
  "02-github-why-it-matters.md",
  "03-register-the-platform-accounts.md",
  "04-push-to-github-and-first-vercel-deploy.md",
  "05-connect-neon-postgres.md",
  "06-enable-email-login-with-resend.md",
  "07-buy-domain-and-connect-cloudflare.md",
  "08-launch-checklist.md",
];

type LessonDoc = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  order: number;
  readMinutes: number;
  quiz: Array<{
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }>;
};

function inferMinutes(raw: string): number {
  const line = raw.match(/预计.*?(\d+).*?分钟/);
  if (line) return Number(line[1]);
  const charCount = raw.length;
  return Math.max(8, Math.round(charCount / 550));
}

function summaryFrom(raw: string): string {
  const match = raw.match(/^>\s*目标：\*\*(.+?)\*\*/m);
  if (match) return match[1].trim();
  const paras = raw
    .split("\n\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("#") && !s.startsWith(">"));
  return paras[0]?.slice(0, 110) ?? "";
}

function titleFrom(raw: string): string {
  const match = raw.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "未命名文章";
}

function bodyWithoutH1(raw: string): string {
  return raw.replace(/^#\s+.+\n+/, "").trim();
}

function makeQuiz(title: string, order: number): LessonDoc["quiz"] {
  const seriesContext = "这是一组给小白看的系列文章，重点是先理解角色与顺序，再逐步完成上线链路。";

  if (order === 1) {
    return [
      {
        q: `《${title}》里，GitHub、Vercel、Neon、Cloudflare、Resend 分别解决什么问题？`,
        options: [
          "都只是存代码的平台",
          "GitHub 存代码、Vercel 跑网站、Neon 存数据、Cloudflare 管域名、Resend 发邮件",
          "Vercel 存数据库、Neon 管域名、Cloudflare 发邮件",
          "它们之间没有区别，只是名字不同",
        ],
        answer: 1,
        explanation:
          `${seriesContext} 第 01 篇最重要的收获就是先把 5 个角色分清楚。`,
      },
      {
        q: "为什么这组文章强调要先理解全图，再开始操作？",
        options: [
          "因为多看几篇文章显得更专业",
          "因为小白真正容易卡住的是不知道每个平台之间的关系，不知道第一步该去哪里",
          "因为代码太长不想写",
          "因为不理解全图就不能注册 GitHub",
        ],
        answer: 1,
        explanation:
          "这组系列的目标就是降低认知负担，先建立角色感，再做操作，不让你一上来被各种名词劝退。",
      },
      {
        q: "如果你以后再做第二个网站，数据库最推荐怎么隔离？",
        options: [
          "继续用同一个 Neon Project，表名区分就行",
          "一个网站一个 Neon Project，避免数据和配置串掉",
          "一个网站一个邮箱即可",
          "全部放 SQLite 就好",
        ],
        answer: 1,
        explanation:
          "这个系列后面会讲到数据库项目隔离，一般建议一个项目对应一个独立的云数据库项目。",
      },
    ];
  }

  if (order === 2) {
    return [
      {
        q: `《${title}》为什么把 GitHub 单独拎出来讲？`,
        options: [
          "因为 GitHub 负责运行网站",
          "因为 GitHub 是后续部署和协作的代码入口，没有它 Vercel 很难顺畅接管你的项目",
          "因为 GitHub 用来发邮件验证码",
          "因为 GitHub 可以替代数据库",
        ],
        answer: 1,
        explanation:
          "GitHub 的核心作用是存代码、记历史、给部署平台一个稳定入口，不是运行网站。",
      },
      {
        q: "Git 和 GitHub 的关系，哪种理解最准确？",
        options: [
          "Git 是网站，GitHub 是命令行",
          "Git 是本地版本记录工具，GitHub 是云端代码仓库",
          "GitHub 是数据库，Git 是服务器",
          "两者完全没有关系",
        ],
        answer: 1,
        explanation:
          `${seriesContext} 这篇专门帮小白拆开 Git 和 GitHub，避免把两个词混在一起。`,
      },
      {
        q: "为什么新手一开始建议把 GitHub 仓库设成 Private？",
        options: [
          "这样网站会更快",
          "因为项目还在早期，不需要把代码公开；部署平台照样能读取私有仓库",
          "因为公开仓库不能部署到 Vercel",
          "因为 Private 仓库不用登录",
        ],
        answer: 1,
        explanation:
          "Private 更安全，且不影响 Vercel / Cloudflare Pages 读取代码。以后真要开源再改也不晚。",
      },
    ];
  }

  if (order === 3) {
    return [
      {
        q: `《${title}》里，为什么推荐你用 GitHub 登录 Vercel / Neon / Resend？`,
        options: [
          "因为这些平台不支持邮箱注册",
          "因为可以统一身份、少记密码，也让平台间的协作关系更顺",
          "因为这样就不用数据库了",
          "因为这样部署会更快 10 倍",
        ],
        answer: 1,
        explanation:
          "用 GitHub 统一登录的核心价值是降低认知负担，让你少维护几套身份体系。",
      },
      {
        q: "注册完 Vercel 后，你真正得到了什么？",
        options: [
          "一个在线数据库",
          "一个可以读取 GitHub 仓库并把代码部署成网站的平台账号",
          "一个正式域名",
          "一个邮箱 SMTP 授权码",
        ],
        answer: 1,
        explanation:
          "Vercel 的角色是“运行网站”，不是数据库、域名注册商或邮件服务。",
      },
      {
        q: "为什么这篇强调今天先把账号开好，而不是马上全部部署？",
        options: [
          "因为部署太难不值得学",
          "因为先清空“临时缺账号”的阻塞点，后面真正操作时不会频繁被迫停下来注册账号",
          "因为平台注册越早越便宜",
          "因为只注册账号就已经算上线了",
        ],
        answer: 1,
        explanation:
          "这篇的目标不是上线网站，而是把后续链路要用到的入口先准备好。",
      },
    ];
  }

  if (order === 4) {
    return [
      {
        q: "GitHub 和 Vercel 在首次部署链路里，各自负责什么？",
        options: [
          "GitHub 负责运行网站，Vercel 负责存代码",
          "GitHub 存代码，Vercel 拉代码并把它跑成网站",
          "两者都负责存数据库",
          "GitHub 和 Vercel 只是备份关系",
        ],
        answer: 1,
        explanation:
          "这是小白第一次把“本地项目 → 线上网站”串起来时最关键的分工认知。",
      },
      {
        q: "为什么第一次在 GitHub 新建仓库时，README / .gitignore / license 都建议先不要勾？",
        options: [
          "因为这些文件有毒",
          "因为本地项目通常已经有这些文件了，再让 GitHub 生成一次容易让初始状态冲突",
          "因为勾选后仓库会公开",
          "因为 Next.js 项目不能有 README",
        ],
        answer: 1,
        explanation:
          "保持 GitHub 新仓库尽量空白，最适合把本地项目无缝 push 上去。",
      },
      {
        q: "如果 Vercel 第一次部署时提示找不到 Next.js，最可能该先检查什么？",
        options: [
          "电脑是不是没联网",
          "Root Directory / package.json / Framework Preset 是否识别正确",
          "是否已经买域名",
          "是否已经接了 Resend",
        ],
        answer: 1,
        explanation:
          "第一次部署常见问题大多不是代码逻辑，而是平台没在正确目录里识别项目结构。",
      },
    ];
  }

  if (order === 5) {
    return [
      {
        q: "为什么这个系列强调正式要上线的网站，不应该继续用本地 SQLite？",
        options: [
          "因为 SQLite 不支持字符串",
          "因为 SQLite 更适合本地实验，不适合云部署和长期线上写入；正式网站应该直接用远程数据库",
          "因为 Neon 速度更快 100 倍",
          "因为 Prisma 不支持 SQLite",
        ],
        answer: 1,
        explanation:
          "你这次已经遇到过“本地没问题、线上不行”的典型坑，所以系列明确改成远程库优先。",
      },
      {
        q: "`DATABASE_URL` 在这篇里的角色，最准确的理解是什么？",
        options: [
          "网站标题",
          "数据库的门牌号 + 钥匙 + 进入方式",
          "邮件模板",
          "域名备案编号",
        ],
        answer: 1,
        explanation:
          "如果没有 DATABASE_URL，代码就不知道该去哪里找数据库。",
      },
      {
        q: "当 `.env` 里已经改成 Postgres 连接串，但 `schema.prisma` 还写着 `provider = 「sqlite」` 时，会发生什么？",
        options: [
          "完全没影响",
          "Prisma 会报 provider 和连接串类型不一致的错误",
          "Vercel 会自动修复",
          "数据库会自己迁移",
        ],
        answer: 1,
        explanation:
          "这个错误你已经真的踩过。环境变量和 Prisma schema 必须对齐。",
      },
    ];
  }

  if (order === 6) {
    return [
      {
        q: "为什么线上不能继续用 `MAIL_DRIVER=console`？",
        options: [
          "因为 console 太慢",
          "因为线上用户看不到你的终端，终端打印验证码只能你自己本地开发时用",
          "因为浏览器不支持 console",
          "因为 Vercel 禁止打印日志",
        ],
        answer: 1,
        explanation:
          "本地开发可以看终端，线上用户不可能看到，所以必须改成真实发邮件。",
      },
      {
        q: "Resend 里的域名验证，本质是在证明什么？",
        options: [
          "你会写代码",
          "你真的拥有并控制这个域名，所以有资格从这个域名发邮件",
          "你买过服务器",
          "你已经部署成功",
        ],
        answer: 1,
        explanation:
          "没有域名验证，任何人都可以伪造发件人地址，邮件系统就会失控。",
      },
      {
        q: "为什么这篇把“终端打印验证码”定义为开发专用假邮件？",
        options: [
          "因为它完全没用",
          "因为它只能帮助开发者自测流程，不是真正的用户收件体验",
          "因为它比真实邮件更安全",
          "因为它会自动触发垃圾邮件",
        ],
        answer: 1,
        explanation:
          "它在本地开发时很高效，但一旦对外就必须换成真正能送达用户邮箱的机制。",
      },
    ];
  }

  if (order === 7) {
    return [
      {
        q: "Cloudflare 在这一篇里的核心角色是什么？",
        options: [
          "数据库平台",
          "邮件平台",
          "买域名、管理 DNS、让域名正确指向 Vercel、顺手提供加速和 HTTPS 辅助",
          "Git 仓库平台",
        ],
        answer: 2,
        explanation:
          "Cloudflare 不负责跑网站代码，它负责域名和指路系统。",
      },
      {
        q: "为什么这篇建议先让网站在 `vercel.app` 地址上跑起来，再买正式域名？",
        options: [
          "因为域名不能和 Vercel 一起用",
          "因为先把网站跑起来，再加域名，认知负担最小；否则新手容易被 DNS/HTTPS 提前劝退",
          "因为域名要等 30 天后才能买",
          "因为 Cloudflare 不支持新项目",
        ],
        answer: 1,
        explanation:
          "先证明网站能跑，再做品牌化网址，是对小白最友好的顺序。",
      },
      {
        q: "如果 Vercel 和 Cloudflare 都在让你“加域名”，正确顺序是什么？",
        options: [
          "先在 Cloudflare 乱配，再去 Vercel 看结果",
          "先在 Vercel 项目里添加域名，再按 Vercel 的提示去 Cloudflare DNS 配记录",
          "先买 3 个域名比较一下",
          "先去 Resend 配域名",
        ],
        answer: 1,
        explanation:
          "Vercel 必须先知道这个域名属于哪个项目，然后 Cloudflare 才知道该把它指到哪里。",
      },
    ];
  }

  return [
    {
      q: `《${title}》这一篇的核心目标是什么？`,
      options: [
        "学会更复杂的动画",
        "让网站从“看起来能用”变成“真正可以对外发布且不容易在第一天就翻车”",
        "学习数据库索引优化",
        "设计公司 logo",
      ],
      answer: 1,
      explanation:
        "最后一篇是上线清单，它的重点是帮你补齐最后的验证，而不是再加功能。",
    },
    {
      q: "为什么这篇强调上线后 24 小时不要立刻疯狂加新功能？",
      options: [
        "因为代码会自动坏",
        "因为上线后的第一优先级是观察真实用户、验证邮件/数据库/后台是否稳定，而不是继续堆功能",
        "因为 Vercel 不允许你继续部署",
        "因为 GitHub 会锁仓库",
      ],
      answer: 1,
      explanation:
        "上线后的重点是观察和纠错，不是立即进入下一轮大开发。",
    },
    {
      q: "真正的网站上线，不是在哪一刻？",
      options: [
        "代码 push 到 GitHub 的那一刻",
        "页面能打开、用户能登录、邮件能送达、数据库能写、后台能维护的那一刻",
        "买域名的那一刻",
        "创建 Vercel 账号的那一刻",
      ],
      answer: 1,
      explanation:
        "最后一篇的重点就是把“能打开页面”和“真正可用产品”区分开来。",
    },
  ];
}

async function loadSeriesDoc(filename: string): Promise<LessonDoc> {
  const slug = filename.replace(/^\d+-/, "").replace(/\.md$/, "");
  const filePath = path.join(SERIES_DIR, filename);
  const raw = await fs.readFile(filePath, "utf8");
  const { content } = matter(raw);

  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? slug;
  const summary = summaryFrom(raw);
  const order = Number(filename.match(/^(\d+)/)?.[1] ?? 0);
  const readMinutes = inferMinutes(raw);

  return {
    slug,
    title,
    summary,
    body: bodyWithoutH1(content.trim() ? `# ${title}\n\n${content.trim()}` : raw),
    order,
    readMinutes,
    quiz: makeQuiz(title, order),
  };
}

async function ensurePath() {
  const existing = await prisma.learningPath.findUnique({
    where: { slug: PATH_SLUG },
  });
  const payload = {
    slug: PATH_SLUG,
    title: PATH_TITLE,
    description:
      "从 0 搞懂 GitHub、Vercel、Neon、Cloudflare、Resend，到把你的网站真正上线。按顺序学，不再被一堆平台名词劝退。",
    estimatedHours: 4,
    level: "Beginner",
    category: "Launch Basics",
    badge: "Free Series",
    pricing: "free",
    priceLabel: "免费",
    statusLabel: "从 0 跑通全链路",
    highlightsJson: JSON.stringify([
      "8 篇按顺序学习的系列文章",
      "完全按小白视角写，先理解后操作",
      "重点解决“根本不知道先做什么”的卡点",
    ]),
    accent: "amber",
    status: "published",
    sortOrder: 2,
    publishedAt: existing?.publishedAt ?? new Date(),
  };

  if (existing) {
    await prisma.learningPath.update({ where: { slug: PATH_SLUG }, data: payload });
  } else {
    await prisma.learningPath.create({ data: payload });
  }
}

async function main() {
  const docs = await Promise.all(FILES.map(loadSeriesDoc));

  await ensurePath();

  let created = 0;
  let updated = 0;
  const now = new Date();

  for (const doc of docs) {
    const existing = await prisma.article.findUnique({ where: { slug: doc.slug } });

    const payload = {
      slug: doc.slug,
      kind: "lesson",
      pathSlug: PATH_SLUG,
      title: doc.title,
      summary: doc.summary,
      body: doc.body,
      order: doc.order,
      readMinutes: doc.readMinutes,
      estimatedMinutes: doc.readMinutes,
      difficulty: 1,
      cost: "免费",
      quizJson: JSON.stringify(doc.quiz),
      status: "published",
      publishedAt: existing?.publishedAt ?? now,
      lastVerifiedAt: now,
    };

    if (existing) {
      await prisma.article.update({ where: { slug: doc.slug }, data: payload });
      updated++;
    } else {
      await prisma.article.create({ data: payload });
      created++;
    }
  }

  // If the three docs were previously seeded as topics, remove those topic rows
  // to avoid duplicate content in /topics.
  await prisma.article.deleteMany({
    where: {
      kind: "topic",
      slug: {
        in: docs.map((d) => d.slug),
      },
    },
  });

  console.log(
    `[seed-series] 完成：新路径 ${PATH_TITLE} 已同步，文章新建 ${created} 篇，覆盖 ${updated} 篇`,
  );
}

main()
  .catch((err) => {
    console.error("[seed-series] 失败：", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
