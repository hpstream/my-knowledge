/**
 * Seeds the first batch of topic articles into DB.
 *
 * Idempotent: upserts by slug. Safe to re-run.
 *
 * Usage:
 *   pnpm db:seed:topics
 */
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

// =====================================================================
// Topic 1: 在你的网站接入 AI 聊天
// =====================================================================

const TOPIC_AI_CHAT: SeedTopic = {
  slug: "add-ai-chat-to-your-site",
  title: "在你的网站接入 AI 聊天",
  summary:
    "用 DeepSeek 兼容口径 5 分钟做 demo，1 小时上线生产。含完整 AI 提示词模板和 3 类常见翻车的回退 prompt。",
  readMinutes: 25,
  estimatedMinutes: 60,
  difficulty: 2,
  cost: "≈ ¥0.5/月",
  body: `
很多人想给自己的网站加一个 AI 聊天框，但卡在三件事：用哪家 API、Key 怎么管、对接代码写不好。这篇带你走通最快路径——用 OpenAI 兼容口径的 DeepSeek，5 分钟做 demo，1 小时上线生产。

:::prep 准备清单
- 一个能本地启动的项目（任何前端框架都行，本文以 Next.js 16 为例）
- 一张信用卡（开 API 账号充值用）
- 已能在终端跑 \`pnpm\`/\`npm\` 命令
- 你的代码编辑器里有 AI 助手（Claude Code / Cursor / Copilot 任意一种）
:::

## 一、选 API 提供商

| 提供商 | 优势 | 劣势 |
|---|---|---|
| **DeepSeek** | 国内可访问、人民币付费、OpenAI 兼容、便宜（¥0.0014/1k token）| 模型能力略弱于 GPT-4o |
| 通义千问 / 智谱 | 国内可访问 | API 不完全 OpenAI 兼容 |
| OpenAI | 模型最强 | 国内访问需代理、信用卡门槛高 |
| OpenRouter | 一个 Key 用所有模型 | 跨境支付 |

**首选 DeepSeek**——成本极低、口径兼容、国内不用代理。

:::apply 申请 DeepSeek API Key
1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 用手机号注册并完成实名认证（5 分钟）
3. 充值 ¥10（够用半年以上）
4. 进入 **API Keys** → 点 **Create new secret key**
5. 复制 Key（格式：\`sk-xxxxxxxx...\`），**只显示一次，立刻保存到密码管理器**

最终你拿到：

- \`DEEPSEEK_API_KEY\`：你的密钥
- 充值额度：¥10
:::

## 二、把 Key 喂给 AI 让它写代码

打开 \`.env.local\` 加一行：

\`\`\`bash
DEEPSEEK_API_KEY=sk-你的密钥
\`\`\`

然后开 AI 新对话，**完整粘贴**下面这段提示词：

:::prompt 给 AI 的提示词（复制后改红色字段）
我要在我的项目里加 AI 聊天，要求：

**项目栈**：
- Next.js 16（App Router）
- TypeScript
- Tailwind CSS

**API 信息**：
- 提供商：DeepSeek（OpenAI 兼容接口）
- Base URL: \`https://api.deepseek.com/v1\`
- 模型：\`deepseek-chat\`
- 我已把 \`DEEPSEEK_API_KEY\` 放到 \`.env.local\`

**需要的文件**：
1. \`src/app/api/chat/route.ts\` —— 后端代理
   - POST 接收 \`{ messages: { role, content }[] }\`
   - 用 \`openai\` npm 包调用 DeepSeek 流式接口
   - 必须传 \`baseURL: 'https://api.deepseek.com/v1'\`
   - 返回 \`Response\` with \`Content-Type: text/event-stream\`，body 用 \`ReadableStream\`
2. \`src/components/Chat.tsx\` —— 前端组件（client component）
   - 一个聊天气泡列表（用户/AI 区分对齐）
   - 一个底部输入框 + 发送按钮
   - 用 \`fetch\` + \`ReadableStream\` 解析 SSE，逐字渲染 AI 回答
   - 维护 messages 状态

**关键约束**：
- 不要在前端直接调 DeepSeek API（暴露 Key 会被刷爆）
- 后端读 \`process.env.DEEPSEEK_API_KEY\`
- 流式回答，不要等全部生成完再显示
- 使用 Tailwind，配色简洁

给我完整可运行的代码，**不要省略 import**，**不要省略错误处理**。
:::

把这段扔给 Claude / ChatGPT / Cursor，它会一次生成两个文件，复制进项目就能跑。

## 三、装依赖 + 启动

\`\`\`bash
pnpm add openai
pnpm dev
\`\`\`

把 AI 给的 \`Chat\` 组件挂到任意页面（例如 \`src/app/page.tsx\`）。

## 四、验证

:::verify 验证步骤
- 浏览器打开 http://localhost:3000
- 在聊天框输入"你好"，按发送
- 字符逐个流式出现（不是等几秒一下子冒出来）
- 打开浏览器 DevTools → Network → 看 \`/api/chat\` 这一条
  - Status: 200
  - Content-Type: \`text/event-stream\`
- 多问几句，验证 AI 记得上下文
:::

## 五、如果某步跑不通：AI 在这里经常翻车

:::pitfall AI 翻车点 1 · 401 Unauthorized
**症状**：浏览器报 \`/api/chat 401\`，终端报 unauthorized

**原因**：AI 用了 \`openai\` SDK 但**没有指定 baseURL**，请求打到了 \`api.openai.com\` 而不是 DeepSeek。

**修复 prompt**（直接复制粘给 AI）：

> 你刚生成的 \`/api/chat\` 路由用了 OpenAI SDK 但没指定 baseURL，导致请求打到 api.openai.com 而不是 api.deepseek.com。请重写 route.ts，确保：
> 1. \`import OpenAI from 'openai'\`
> 2. \`const client = new OpenAI({ baseURL: 'https://api.deepseek.com/v1', apiKey: process.env.DEEPSEEK_API_KEY })\`
> 3. 用 \`stream: true\` 调 \`chat.completions.create\`
> 4. 返回 \`new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })\`
>
> 只重写 \`route.ts\`，其他文件不要动。
:::

:::pitfall AI 翻车点 2 · 前端收到一坨 JSON 而不是流
**症状**：等了几秒，整段回答一下子出现，不是逐字流式

**原因**：AI 写的后端**没有真正包成 ReadableStream**，或者 \`stream: true\` 没传。

**修复 prompt**：

> 后端响应没有真正流式输出。请用 Web 标准的 \`ReadableStream\` 包装 DeepSeek 流，并把 OpenAI SDK 返回的 async iterator 转成 SSE chunks。前端用 \`response.body.getReader()\` 逐 chunk 解析。
:::

:::pitfall AI 翻车点 3 · API Key 写到前端组件里
**症状**：浏览器 DevTools 里看到 \`sk-xxx\` 字样

**原因**：AI 把环境变量当成 \`NEXT_PUBLIC_\` 前缀的客户端变量用了。

**修复 prompt**：

> 前端组件里不能出现 API Key。请把所有调用 DeepSeek API 的代码全部移到 \`src/app/api/chat/route.ts\`，前端组件只 \`fetch('/api/chat')\`。\`DEEPSEEK_API_KEY\` 在 \`.env.local\` 里**不要**加 \`NEXT_PUBLIC_\` 前缀。
:::

## 六、收尾

到这里你已经有一个能用的 AI 聊天框了。下一步可以做的事：

- **加用户登录**，限制免费次数（参考下一篇专题）
- **接 Stripe / 微信支付** 解锁高级模型（再下一篇）
- **自定义 AI 人设**（system prompt），把这个聊天框变成"客服机器人 / 写作助手 / 角色扮演 …"

总成本：¥0.5/月起（按日均 200 次对话估算）。

---

最近更新：2026 / 06 / 04 · DeepSeek API 价格 ¥0.0014/1k token
`.trim(),
  quiz: [
    {
      q: "调用 DeepSeek API 时，OpenAI SDK 的 baseURL 应该设置成？",
      options: [
        "https://api.openai.com/v1",
        "https://api.deepseek.com/v1",
        "不需要设置",
        "https://platform.deepseek.com",
      ],
      answer: 1,
      explanation:
        "DeepSeek 兼容 OpenAI 接口，但必须显式指定 baseURL。不指定 → 请求打到 OpenAI 官方 API → 401。",
    },
    {
      q: "为什么 API Key 不能放在前端组件里？",
      options: [
        "性能问题",
        "浏览器会自动过滤",
        "任何访问者打开 DevTools 都能看到，会被盗刷",
        "Next.js 不支持",
      ],
      answer: 2,
      explanation:
        "前端代码是明文给浏览器的。任何人都能拿到 Key 然后白嫖你的余额。Key 必须只在后端使用。",
    },
    {
      q: "流式响应需要后端返回什么 Content-Type？",
      options: [
        "application/json",
        "text/plain",
        "text/event-stream",
        "multipart/form-data",
      ],
      answer: 2,
      explanation:
        "Server-Sent Events 标准的 Content-Type 是 text/event-stream。前端用 EventSource 或 fetch + ReadableStream 解析。",
    },
    {
      q: "如果 AI 给的代码报 401 unauthorized，最可能的原因是？",
      options: [
        "API Key 输错了",
        "OpenAI SDK 没指定 baseURL，请求打到了 OpenAI 而不是 DeepSeek",
        "Next.js 版本不对",
        "浏览器需要重启",
      ],
      answer: 1,
      explanation:
        "这是 AI 写 DeepSeek 代码时最高频的翻车点 —— 用 OpenAI SDK 习惯了，忘记加 baseURL。",
    },
    {
      q: "在 .env.local 里，DEEPSEEK_API_KEY 前面应不应该加 NEXT_PUBLIC_ 前缀？",
      options: [
        "必须加，不然 Next.js 不读",
        "可以加可以不加",
        "绝对不能加 —— 加了等于明文暴露 Key 给浏览器",
        "看 Next.js 版本",
      ],
      answer: 2,
      explanation:
        "NEXT_PUBLIC_ 前缀的环境变量会被打包到前端 JS 里。Key 必须只在服务端使用 → 不能加这个前缀。",
    },
  ],
};

// =====================================================================
// Topic 2: 把你的项目部署上线 (Vercel + custom domain + HTTPS)
// =====================================================================

const TOPIC_DEPLOY: SeedTopic = {
  slug: "deploy-your-project-with-vercel",
  title: "把你的项目部署上线（Vercel + 自定义域名 + HTTPS）",
  summary:
    "本地能跑 ≠ 上线。这篇带你完成第一次部署：GitHub 推送、Vercel 一键导入、域名绑定、HTTPS 自动签发，含 DNS 配置和环境变量管理。",
  readMinutes: 30,
  estimatedMinutes: 90,
  difficulty: 2,
  cost: "¥0 起",
  body: `
本地能跑 ≠ 用户能访问。把项目上线涉及几件事：代码托管在哪、谁来跑服务器、域名怎么配、HTTPS 怎么搞。这篇带你走最快的路径 —— Vercel 一键部署 + 一个域名绑定。

如果你的项目用到国内服务（微信支付、备案要求），还是要走阿里云 / 腾讯云。但 90% 的独立项目用 Vercel 完全够，**且免费**。

:::prep 准备清单
- 一个本地能跑的 Next.js / Vite / React / 任何 Vercel 支持的项目
- 一张能跨境支付的信用卡（**仅域名注册要用，Vercel 免费版完全够**）
- 你的项目已经用 Git 管理（\`git init\` + 至少一次 commit）
- 一个 GitHub / GitLab / Bitbucket 账号
:::

## 一、把代码推到 GitHub

如果还没有 GitHub 账号，先去 [github.com](https://github.com) 注册。

\`\`\`bash
# 在项目目录下
git init
git add .
git commit -m "init"

# 在 GitHub 网页上 New Repository（建议先 Private）
# 复制它给的 URL
git remote add origin https://github.com/你/你的项目.git
git branch -M main
git push -u origin main
\`\`\`

刷新 GitHub，能看到代码了 → 第一步完成。

## 二、申请 Vercel 账号 + 连 GitHub

:::apply 申请 Vercel 账号
1. 访问 [vercel.com](https://vercel.com)
2. 点 **Sign Up** → 选 **Continue with GitHub**
3. GitHub 弹出授权页面 → 授权
4. 进入 Vercel 后会让你选个人 / 团队，选个人（**Hobby Plan 免费版**）
5. 在 Dashboard 点 **Add New Project**
6. 看到刚才推的仓库 → 点 **Import**

Vercel 会自动检测出是 Next.js 项目，所有默认配置直接 **Deploy**。

3-5 分钟后会给你一个 \`xxx.vercel.app\` 域名，访问能看到你的项目。
:::

## 三、绑定你自己的域名

\`.vercel.app\` 不像正经网站。下一步绑域名。

:::apply 申请域名（推荐 Cloudflare Registrar）
1. 访问 [cloudflare.com](https://cloudflare.com) → 注册账号
2. 进 **Domain Registration** → **Register Domains**
3. 搜你想要的域名（建议 \`.com\` / \`.dev\` / \`.app\`，¥80-120/年）
4. 信用卡付款（**Cloudflare 不加溢价，是市面最便宜的**）
5. 注册完后，你已经默认在 Cloudflare 的 DNS 控制面板

**为什么选 Cloudflare 不选阿里云 / 腾讯云？**
- 不加价
- DNS 修改秒级生效
- 不用国内备案（除非你要把网站做给国内用户、放在国内服务器）
- 免费 CDN
:::

## 四、把域名指向 Vercel

回到 Vercel 项目 → **Settings** → **Domains** → 输你的域名 → **Add**。

Vercel 会告诉你需要在域名 DNS 加几条记录：

- \`A\` 记录：\`@\` → \`76.76.21.21\`
- \`CNAME\` 记录：\`www\` → \`cname.vercel-dns.com\`

回 Cloudflare DNS 面板加这两条。

:::verify 验证步骤
- DNS 修改后 1-5 分钟，回到 Vercel Domains 页，状态变成 ✅ \`Valid Configuration\`
- 浏览器打开 \`你的域名.com\` → 看到项目（HTTP）
- 等 1-2 分钟，Vercel 自动签发 HTTPS 证书
- 再刷一次 → 地址栏出现 🔒，HTTPS 生效
- 用 [whatsmydns.net](https://whatsmydns.net) 验证全球 DNS 解析是否一致
:::

## 五、环境变量怎么搞（Key 不能上传到 Git）

本地 \`.env.local\` 里的密钥**不要**提交。Vercel 有专门的环境变量管理：

- Vercel 项目 → **Settings** → **Environment Variables**
- 把 \`DEEPSEEK_API_KEY=sk-xxx\` 这样的一条条加进去
- Apply to: 选 **Production / Preview / Development** 三个都勾
- 加完后 **Redeploy** 一次让生效

## 六、如果跑不通：AI / 文档常见的坑

:::pitfall 翻车点 1 · 域名打开是 404 / 进了 Vercel 错误页
**症状**：DNS 配好了，浏览器打开域名报 404

**原因**：Vercel 项目里 **Domains** 没加这个域名 → 它不知道流量该路由到哪。

**修复**：回 Vercel 项目 Settings → Domains，确认你的域名在列表里且状态是 ✅。
:::

:::pitfall 翻车点 2 · HTTPS 不工作 / 浏览器报 "证书无效"
**症状**：HTTP 能打开，HTTPS 报错

**原因**：证书还在签发中。Vercel 用 Let's Encrypt 自动签证书，DNS 必须先生效。

**修复**：等 5-10 分钟，刷新。还不行：删掉 Vercel 里的域名 → 重新加 → 重新等。
:::

:::pitfall 翻车点 3 · 部署后 API 路由报 500，本地没事
**症状**：本地 \`pnpm dev\` 跑得好好的，部署后 \`/api/chat\` 报 500

**原因**：**环境变量没配到 Vercel**。本地 \`.env.local\` 不会自动同步。

**修复**：
1. Vercel 项目 Settings → Environment Variables
2. 把本地 \`.env.local\` 里所有非 \`NEXT_PUBLIC_\` 的变量全部添加
3. **Redeploy** 才生效（修改环境变量不会自动触发重新部署）

**给 AI 的 prompt**（如果忘了哪些 env 要传）：

> 这是我的 \`.env.local\` 文件，我把它部署到 Vercel。哪些环境变量需要在 Vercel 后台手动配置一遍？
> （把 \`.env.local\` 内容粘进来）
:::

:::pitfall 翻车点 4 · 数据库连不上
**症状**：本地 SQLite 跑得好好的，Vercel 上没数据 / 连不上

**原因**：**Vercel 的容器是无状态的**，本地 SQLite 文件不会被打包。

**修复**：
- 短期：换成 Vercel Postgres / Neon / Supabase（都有免费层）
- 给 AI 的 prompt：「我的 Prisma schema 用 SQLite，要切换成 Neon Postgres。请给我修改后的 schema.prisma 和 .env 配置示例。」
:::

## 七、上线之后

恭喜，你的项目已经在互联网上了。**之后每次 \`git push\` 到 main，Vercel 自动重新部署**，1 分钟见效。

下一步可以做：
- 加 Google Analytics / Plausible 看流量
- 在域名上加邮箱（Cloudflare Email Routing 免费转发）
- 接 Sentry / 飞书 webhook 做报错告警

---

最近更新：2026 / 06 / 04 · Vercel Hobby Plan 仍免费，每月 100GB 流量
`.trim(),
  quiz: [
    {
      q: "如果你的网站不需要给国内用户访问，**最简单**的部署组合是？",
      options: [
        "阿里云 ECS + 备案 + Nginx",
        "GitHub + Vercel + Cloudflare 域名",
        "腾讯云 + 香港服务器",
        "自己买物理机",
      ],
      answer: 1,
      explanation:
        "Vercel 部署完全免费（Hobby Plan），自动 HTTPS，不用备案；Cloudflare 域名最便宜（不加溢价）。",
    },
    {
      q: "Vercel 项目部署后 API 路由报 500，本地没问题，最可能的原因是？",
      options: [
        "Vercel 不支持 Next.js",
        "环境变量（API Key 等）没配到 Vercel 后台",
        "GitHub 仓库是 Private 的",
        "代码有 bug",
      ],
      answer: 1,
      explanation:
        "本地 .env.local 不会自动同步到 Vercel。必须在 Settings → Environment Variables 里手动加，并 Redeploy 才生效。",
    },
    {
      q: "项目里用 SQLite（本地文件）部署到 Vercel 会怎样？",
      options: [
        "正常工作",
        "数据库文件会被自动迁移",
        "数据会丢失（Vercel 容器无状态，文件不持久）",
        "Vercel 自动转换成 PostgreSQL",
      ],
      answer: 2,
      explanation:
        "Vercel 的 Serverless 容器是无状态的，每次请求可能是不同容器。本地 SQLite 文件部署后会被定期重置 / 不共享。生产要用云数据库（Neon / Supabase / Vercel Postgres）。",
    },
    {
      q: "DNS 修改后多久能在全球生效？",
      options: [
        "立刻",
        "1 小时左右",
        "1-5 分钟（用 Cloudflare 等现代 DNS 服务）",
        "24-72 小时",
      ],
      answer: 2,
      explanation:
        "现代 DNS 服务（Cloudflare、Vercel DNS）秒级到分钟级生效。旧时代说 24-72 小时主要是因为传统 ISP DNS 缓存。",
    },
    {
      q: "推送代码到 GitHub 之后，Vercel 多久会自动重新部署？",
      options: [
        "手动点 Redeploy",
        "推送后 30 秒内自动开始构建，1-3 分钟完成",
        "下一次工作时间",
        "需要付费才有自动部署",
      ],
      answer: 1,
      explanation:
        "Vercel 通过 GitHub webhook 监听 push 事件，自动触发构建。免费版完全支持。",
    },
  ],
};

// =====================================================================
// Topic 3: 邮箱 + 验证码登录
// =====================================================================

const TOPIC_EMAIL_LOGIN: SeedTopic = {
  slug: "email-code-login",
  title: "邮箱 + 验证码登录（无密码方案）",
  summary:
    "60 秒注册、不用密码、不用第三方。本地开发把验证码打印到控制台 0 成本，生产上接 Resend 也只要 5 分钟。",
  readMinutes: 28,
  estimatedMinutes: 75,
  difficulty: 2,
  cost: "免费（开发）/ ¥0-20/月（生产）",
  body: `
做新网站的第一个绕不开的问题：用户怎么登录。

选项有：

- **用户名 + 密码**：用户得记一个密码，你得做找回密码流程，得防撞库
- **第三方（GitHub / Google / 微信）**：要去申请 OAuth 应用，国内访问 Google 还要代理
- **邮箱 + 6 位验证码（推荐）**：不用密码、不用第三方、用户体验像短信验证

这篇做的就是第三种。

:::prep 准备清单
- 一个 Next.js 16 项目（其他框架同理，关键概念通用）
- 一个数据库（开发用 SQLite 即可）
- Prisma 或任意 ORM
- 邮件发送方式：开发用控制台打印，生产用 Resend（推荐）/ 阿里云邮件推送 / SMTP
:::

## 一、数据模型

需要 3 张表：

\`\`\`prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  displayName String?
  role        String    @default("user")  // user | admin
  createdAt   DateTime  @default(now())
  lastLoginAt DateTime?
  sessions    Session[]
}

model Session {
  id        String   @id            // 随机字符串，放进 cookie
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model EmailVerification {
  id         String    @id @default(cuid())
  email      String
  codeHash   String                    // 6 位验证码的 SHA-256，不存明文
  expiresAt  DateTime                  // 通常 15 分钟
  consumedAt DateTime?                 // 已验证过的标记
  attempts   Int       @default(0)     // 防爆破
  createdAt  DateTime  @default(now())
}
\`\`\`

## 二、本地开发不需要邮件服务

最妙的一点：开发环境**根本不用接邮件服务**。验证码直接 \`console.log\` 到运行 \`pnpm dev\` 的终端就行。你看到验证码 → 填到前端 → 完成登录。

零外部依赖、零等待。

:::prompt 给 AI 的提示词
我要在我的 Next.js 16 项目里加邮箱 + 6 位验证码登录。要求：

**项目栈**：Next.js 16 (App Router) / TypeScript / Prisma / SQLite

**数据模型**：见 Prisma schema（贴 User / Session / EmailVerification）

**业务规则**：
- 验证码：6 位数字，15 分钟过期
- 验证码用 SHA-256 hash 存 DB，不存明文
- 最多 5 次错误尝试，超过失效
- 同邮箱 60 秒内不能重发
- Session 30 天有效，存 DB
- Cookie 名 \`mk_sid\`，HttpOnly + Secure (prod) + SameSite=Lax

**需要的文件**：
1. \`src/lib/auth/code.ts\` — 生成 / hash / 校验验证码
2. \`src/lib/auth/email.ts\` — 发邮件抽象。\`MAIL_DRIVER=console\` 时直接 console.log，\`resend\` 时调 Resend
3. \`src/lib/auth/session.ts\` — createSession / getCurrentUser / destroySession（基于 next/headers 的 cookies）
4. \`src/app/api/auth/email/request-code/route.ts\` — POST { email } → 生成、存、发送验证码
5. \`src/app/api/auth/email/verify-code/route.ts\` — POST { email, code } → 校验、upsert user、签发 session
6. \`src/app/api/auth/logout/route.ts\` — POST → 销毁 session

**关键约束**：
- 不要存明文验证码
- 不要在错误响应里泄露 "邮箱不存在" 这种枚举信息
- 用 \`node:crypto\` 的 \`randomInt\` 生成验证码，不要用 Math.random
- session id 用 \`randomBytes(32).toString('base64url')\`

请给完整可运行代码，含 Zod 校验、错误处理、注释。
:::

## 三、本地测试流程

\`\`\`bash
# .env.local
DATABASE_URL="file:./prisma/dev.db"
MAIL_DRIVER="console"

# 跑迁移
pnpm prisma migrate dev --name init

# 启动
pnpm dev
\`\`\`

:::verify 验证步骤
- 打开 http://localhost:3000/login
- 输入任意邮箱（不用真的），点发送
- **回去看 \`pnpm dev\` 那个终端**，会看到类似输出：

  \`\`\`
  ────────────────────────
  [mail] 模拟发送邮件
    to:      you@example.com
    subject: 你的登录验证码：482301
  ────────────────────────
  \`\`\`

- 把 6 位数字回填到前端 → 点登录
- 进数据库（Prisma Studio：\`pnpm prisma studio\`）看 User 表多了一行
- Cookie \`mk_sid\` 出现在浏览器
- 刷新页面，登录态保持
:::

## 四、生产环境接 Resend

到要上线时，把 \`MAIL_DRIVER\` 换成 \`resend\`：

:::apply 申请 Resend API Key
1. 访问 [resend.com](https://resend.com) → Sign Up（用 GitHub 登录最快）
2. 验证你的域名（**这一步关键**）：
   - Dashboard → Domains → Add Domain
   - 输你的域名（如 \`example.com\`）
   - Resend 给你 3-4 条 DNS 记录（SPF / DKIM / DMARC / MX）
   - 回你的 DNS 服务商（Cloudflare）添加
   - 等 5-10 分钟，Resend 状态变 ✅ Verified
3. 在 Dashboard → **API Keys** → Create API Key
4. 复制保存

最终你拿到：
- \`RESEND_API_KEY\`
- 一个已验证的发件域名，例如 \`noreply@example.com\`

**注意**：未验证域名只能发到你自己的 Resend 注册邮箱，不能给真实用户用。
:::

把 Resend 接进去的 prompt：

\`\`\`
请把我的 src/lib/auth/email.ts 加上 Resend 驱动。要求：
- 当 process.env.MAIL_DRIVER === 'resend' 时
- 用 fetch 调用 https://api.resend.com/emails
- 不要装 sdk，直接 fetch
- Authorization: Bearer \${process.env.RESEND_API_KEY}
- from: process.env.MAIL_FROM
- 错误时降级到 console.log + 抛 Error
\`\`\`

## 五、AI 容易翻车的几个点

:::pitfall 翻车点 1 · 验证码存明文
**症状**：AI 直接在 EmailVerification 表里存 \`code: "482301"\`

**原因**：AI 默认按教科书例子写 —— 但教科书例子常忽略安全细节。

**修复 prompt**：

> 把 EmailVerification 表的 code 字段改成 codeHash，存 SHA-256 hash 而不是明文。校验时也 hash 后比对。
:::

:::pitfall 翻车点 2 · 没做 rate limit，可以无限重发
**症状**：随便一个人能爆 60 万次发邮件给同一个邮箱

**修复 prompt**：

> 加 rate limit：同一个邮箱 60 秒内只能请求 1 次验证码。如果 60 秒内重复请求，返回 429 with retryAfter 字段。
:::

:::pitfall 翻车点 3 · session 校验耗时（每次请求查 DB）
**症状**：每个页面请求都查 DB → 慢

**优化**：可选 —— 后期可以加 Redis 缓存 session，或用 JWT 无状态会话。但 MVP 阶段直接查 DB 完全没问题，每秒上千请求都扛得住。
:::

:::pitfall 翻车点 4 · Resend 验证域名失败
**症状**：DNS 记录加了，但 Resend 一直显示 Pending

**原因**：
1. Cloudflare 默认开了 Proxy（橙色云）—— 对 SPF/DKIM/MX 必须关掉（点云朵 → 灰色）
2. 旧 DNS 记录冲突（之前有别的 SPF 记录）

**修复**：
- Cloudflare DNS 里把 Resend 给的记录的 Proxy 状态全部改成 DNS only（灰色云朵）
- 删掉旧的 SPF 记录
- 等 10 分钟再验证
:::

## 六、收尾

到这一步你已经有完整的登录系统了。下一步建议：

- 把 \`/admin\` 路由加权限闸门（\`role === 'admin'\` 才能进）
- 加"修改邮箱"功能（也用同样的验证码流程）
- 用 middleware 把未登录的 \`/path/some-protected-route\` 重定向到 \`/login\`

---

最近更新：2026 / 06 / 04 · Resend 免费版每月 3000 封邮件
`.trim(),
  quiz: [
    {
      q: "为什么验证码不能在数据库里存明文？",
      options: [
        "性能问题",
        "数据库泄露时攻击者能直接登录任何账号；任何能看 DB 的内部人员也能盗号",
        "数据库不支持长字符串",
        "存明文会被搜索引擎索引",
      ],
      answer: 1,
      explanation:
        "验证码本质上等同于一次性密码。存明文 = 一旦 DB 泄露，攻击者拿着邮箱+code 直接登录。必须存 hash。",
    },
    {
      q: "本地开发阶段，最简单的发邮件方式是？",
      options: [
        "立刻申请 Resend 账号 + 域名验证",
        "搭一个自己的 SMTP 服务器",
        "把验证码直接 console.log 到运行 dev server 的终端",
        "用 nodemailer 连 Gmail",
      ],
      answer: 2,
      explanation:
        "开发阶段不需要真发邮件 —— 你能看到终端就能验证流程。零依赖、零等待、不污染真实邮箱。生产再切换驱动。",
    },
    {
      q: "Resend 域名验证一直 Pending，最可能的原因？",
      options: [
        "Resend 服务故障",
        "你的域名没用 Cloudflare",
        "Cloudflare DNS 记录开了 Proxy（橙色云）—— SPF/DKIM 不能走 Proxy",
        "需要等 24 小时",
      ],
      answer: 2,
      explanation:
        "Cloudflare 默认会给所有 DNS 记录加 Proxy 加速。但邮件相关记录（SPF/DKIM/MX）必须用 DNS only（灰云），否则邮件服务商收到的是 Cloudflare 的 IP 信息。",
    },
    {
      q: "Session ID 应该用什么生成？",
      options: [
        "Math.random()",
        "Date.now().toString()",
        "node:crypto 的 randomBytes(32)（加密安全的随机）",
        "用户邮箱的 hash",
      ],
      answer: 2,
      explanation:
        "Math.random 和 Date.now 可预测，攻击者能猜到下一个 session id 然后伪造身份。必须用密码学安全的随机源。",
    },
    {
      q: "为什么要做「验证码 60 秒重发限制」？",
      options: [
        "防止用户点太快",
        "省邮件服务的钱",
        "防止恶意脚本通过你的服务给目标邮箱刷发垃圾邮件（「邮件轰炸」）",
        "Next.js 要求",
      ],
      answer: 2,
      explanation:
        "不限制的话，攻击者可以拿你的服务给别人的邮箱发上万封邮件，让目标邮箱被淹。这是常见的「邮件炸弹」攻击。",
    },
  ],
};

const TOPICS: SeedTopic[] = [TOPIC_AI_CHAT, TOPIC_DEPLOY, TOPIC_EMAIL_LOGIN];

async function main() {
  const now = new Date();
  let created = 0;
  let updated = 0;

  for (const t of TOPICS) {
    const existing = await prisma.article.findUnique({
      where: { slug: t.slug },
    });

    const payload = {
      slug: t.slug,
      kind: "topic",
      pathSlug: null as string | null,
      title: t.title,
      summary: t.summary,
      body: t.body,
      order: 1,
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
      await prisma.article.update({
        where: { slug: t.slug },
        data: payload,
      });
      updated++;
    } else {
      await prisma.article.create({ data: payload });
      created++;
    }
  }

  console.log(
    `[seed-topics] 完成：新建 ${created} 篇，覆盖 ${updated} 篇`,
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
