# my-knowledge

面向开发者的 AI 知识学习网站。

## 当前已完成的核心能力

- 学习路径首页 + 文章阅读页（Markdown 驱动）
- 章末选择题小测（modal 弹窗）
- **邮箱验证码登录**（6 位数字，15 分钟过期）
- **登录闸门**：点击锁定课时 → 弹模态登录框；直接键入 URL → middleware 重定向
- **学习进度落库**（SQLite），跨设备一致
- **文章后台 `/admin/articles`**（admin 角色专属）：列表 / 新建 / 编辑 / 发布 / 删除
- 文章正文从数据库读取，不再依赖项目里的 `.md` 文件

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Prisma 6 + SQLite
- zod / gray-matter / react-markdown

## 本地启动（首次）

```bash
cd /Users/hpstream/Desktop/code/my-knowledge

# 1. 安装依赖
pnpm install
# 安装过程会自动执行 prisma generate

# 2. 复制环境变量模板
cp .env.example .env

# 3. 初始化数据库（创建 prisma/dev.db 并跑迁移）
pnpm db:migrate

# 4. （可选）从 content/articles/ 的 .md 源把 5 篇文章灌进 DB
#    如果 content/articles/ 已经被归档/删除，会跳过
pnpm db:seed

# 5. 启动开发服务器
pnpm dev
```

打开 <http://localhost:3000>。

## 体验邮箱登录

1. 打开 <http://localhost:3000/paths/vibecoding-getting-started>
2. 点 "开始学习 ›" 或任一课时 → 弹出登录模态
3. 输入任意邮箱（例如 `you@example.com`）
4. **回到运行 `pnpm dev` 的终端窗口**，会看到类似：

   ```
   ────────────────────────────────────────────────────────────
   [mail] 模拟发送邮件
     to:      you@example.com
     subject: 你的登录验证码：482301
     ...
   ────────────────────────────────────────────────────────────
   ```
5. 把那 6 位数字回填到模态框 → 登录成功
6. 自动跳转到第一讲，开始阅读

首次登录会自动创建账号。验证码 15 分钟过期、最多输错 5 次、60 秒可重发一次。

## 把自己升级为 admin（解锁文章后台）

先登录任意邮箱注册一个账号，然后：

```bash
pnpm db:studio
```

打开浏览器：
1. 进 `User` 表
2. 找到你的邮箱对应那一行
3. 把 `role` 字段从 `user` 改成 `admin`
4. 保存

刷新前台页面，右上角头像下拉里会出现"文章管理"入口，打开就是 `/admin/articles`。

也可以直接命令行 SQL（替换邮箱）：

```bash
echo "UPDATE User SET role='admin' WHERE email='you@example.com';" | sqlite3 prisma/dev.db
```

## 文章后台 `/admin/articles`

仅 `role=admin` 用户可见。能力：
- 按学习路径分组列出所有文章（包含草稿）
- 新建文章：填 slug / pathSlug / order / 标题 / 摘要 / Markdown 正文 / Quiz JSON / 状态
- 编辑现有文章，可即时切换发布/草稿
- 删除文章（带二次确认）
- 已发布文章可一键在前台预览

> 文章数据完全在 DB 里。`content/articles/` 目录已废弃，仅作为种子源保留在 `content/articles.archive/`（.gitignore）。
> 学习路径配置（`content/paths/*.json`）暂时仍在项目里，下一步再考虑入库。

## 内容目录约定

### 学习路径

放在 `content/paths/*.json`（暂时仍在项目里）。

示例：

```json
{
  "slug": "vibecoding-getting-started",
  "title": "VibeCoding 从入门到熟练使用 · 5 讲",
  "description": "...",
  "estimatedHours": 2,
  "lessonSlugs": ["vibecoding-intro", "..."]
}
```

### 文章

不再放项目里。所有文章正文 + 小测都存在 SQLite 的 `Article` 表，通过 `/admin/articles` 后台维护。

## 当前页面结构

| 路由 | 说明 | 是否需登录 |
|---|---|---|
| `/` | 首页（免费课程 / 付费课程列表） | 否 |
| `/paths/[slug]` | 路径概览（介绍 + 章节列表） | 否 |
| `/paths/[slug]/[lesson]` | 课时阅读页（左目录 + 右文章 + 小测 modal） | **是** |
| `/api/auth/email/request-code` | 发送验证码 | 否 |
| `/api/auth/email/verify-code` | 校验验证码 + 建会话 | 否 |
| `/api/auth/me` | 当前用户 | 否（无登录返回 null） |
| `/api/auth/logout` | 退出登录 | 是 |
| `/api/progress` | 当前用户进度 | 否（匿名返回 `{}`） |
| `/api/progress/attempt` | 提交答题 | 是 |
| `/api/progress/complete` | 完成本讲 | 是 |

## 生成图片脚本

把 OpenAI key 放到根目录 `.env` / `.env.local`:

```bash
OPENAI_API_KEY="sk-proj-..."
```

也可以把纯 key 放到根目录 `openai.key`。脚本默认使用 `gpt-image-2`:

```bash
pnpm image:generate -- "Draw a clean app icon for a personal knowledge base"
pnpm image:generate -- --prompt "A clean app icon" --out public/generated/icon.png
```

## 下一步

按优先级：

1. 文章后台（`/admin/articles`，admin 录入、编辑、发布）
2. 把现有 5 篇 markdown 一次性 seed 到 DB，删掉 `content/articles/*.md`
3. 把 path 配置也迁到 DB
4. 部署到生产 + 接真实邮件服务（Resend / 腾讯企业邮 SMTP）
5. 微信扫码登录（需服务号已认证 + 域名备案）

## 已验证

```bash
pnpm build
```

构建成功，所有 API + 页面路由生成正常。
