# 进度日志 · 待你验证

> 本批次按 `docs/product-strategy.md` §10 阶段 A-D 推进。
> 你照着「验证清单」一项一项走一遍，标 ✅ 或 ❌ 反馈给我即可。

---

## 0. 一句话总览

这一轮把 **阶段 A（专题内容形态）/ B（首页接 DB）/ C（再写 2 篇专题）/ D（反馈闭环 + admin 仪表盘）** 全部做完。
现在系统是：**3 篇真实专题已在线** + **读者能反馈** + **admin 能在仪表盘一眼看到全站状态**。

整套靠的还是邮箱登录、没有任何付费功能 —— 符合 v0.3 决议「先做内容、不急于收费」。

---

## 1. 改动清单（按时间顺序）

### 阶段 A · 专题内容形态

| 文件 | 变化 |
|---|---|
| `prisma/schema.prisma` | Article 表新增字段：`kind` / `difficulty` / `estimatedMinutes` / `cost` / `lastVerifiedAt` |
| `prisma/migrations/...article_kind_and_meta/` | 自动生成的迁移 |
| `src/lib/remark-callout.ts` | remark 插件：解析 `:::name 标签` 容器语法 |
| `src/components/article/CalloutBlock.tsx` | 渲染 5 种 callout 卡片（独立样式）|
| `src/components/ArticleMarkdown.tsx` | 接入 remark-directive 插件链 |
| `src/app/globals.css` | callout 内部 prose 适配（dark prompt / 待办框 / 红色症状）|
| `src/app/topics/page.tsx` | 新建：`/topics` 列表（杂志 TOC 风格）|
| `src/app/topics/[slug]/page.tsx` | 新建：`/topics/[slug]` 详情 + 验证 stamp + 过期提示 |
| `src/lib/articles.ts` | 增加 `listPublishedTopics` / `getPublishedTopicBySlug` / `isStale` |
| `src/lib/article-schema.ts` | Zod schema 支持 kind / 动态字段，lesson 强制 pathSlug |
| `src/app/api/admin/articles/route.ts` | POST 处理新字段 + kind = topic 时清空 pathSlug |
| `src/app/api/admin/articles/[id]/route.ts` | PATCH 同上 |
| `src/components/admin/ArticleForm.tsx` | 加 kind 切换 + 动态字段 + 「插入 5 模块模板」按钮 |
| `src/app/admin/articles/new/page.tsx` | 用新字段初始化 |
| `src/app/admin/articles/[id]/edit/page.tsx` | 用新字段编辑 |
| `prisma/seed-topics.ts` | 新建：第一批 3 篇专题 seed 脚本 |
| `package.json` | 新增 `db:seed:topics` script |

### 阶段 B · 首页接 DB

| 文件 | 变化 |
|---|---|
| `src/app/page.tsx` | 删除硬编码 `PLACEHOLDER_TOPICS`，改用 `listPublishedTopics()`，最多展示 6 条；空态友好降级 |
| `src/components/SiteHeader.tsx` | nav 第一项从「最新专题」改成 `/topics` 链接 |

### 阶段 C · 内容生产

`prisma/seed-topics.ts` 里写入了 3 篇真实专题（每篇 5 个 callout + 5 道小测）：

1. **`add-ai-chat-to-your-site`** — 在你的网站接入 AI 聊天（DeepSeek 兼容口径）
2. **`deploy-your-project-with-vercel`** — 把你的项目部署上线（Vercel + Cloudflare 域名 + HTTPS）
3. **`email-code-login`** — 邮箱 + 验证码登录（无密码方案）

跑 `pnpm db:seed:topics` 是幂等的，任意时候重跑都安全。

### 阶段 D · 反馈闭环 + Admin 仪表盘

| 文件 | 变化 |
|---|---|
| `prisma/schema.prisma` | 新增 `ArticleFeedback` 表 + User 关系 |
| `prisma/migrations/...article_feedback/` | 自动生成的迁移 |
| `src/app/api/feedback/route.ts` | POST：用户提交反馈（登录/非登录都支持，带分类）|
| `src/app/api/admin/feedback/[id]/route.ts` | PATCH 改状态 / DELETE |
| `src/components/article/FeedbackTrigger.tsx` | 前台「反馈这一篇」按钮 + modal |
| `src/components/admin/FeedbackRow.tsx` | admin 列表里的状态切换 / 删除 |
| `src/app/admin/feedback/page.tsx` | admin 反馈收件箱（待处理排前面、点 mailto 直接回邮）|
| `src/app/admin/page.tsx` | **新增 `/admin` 仪表盘**：6 个指标 + 过期专题 + 最近反馈 + 最近内容 + 最近注册 |
| `src/app/admin/layout.tsx` | 顶部 nav 加「仪表盘 / 反馈」入口 |
| `src/components/SiteHeader.tsx` | 头像下拉里 admin 菜单加「仪表盘 / 读者反馈」入口 |
| `src/app/topics/[slug]/page.tsx` | 文章底部加「反馈这一篇」按钮 |

---

## 2. 怎么验证（你要走的清单）

### 准备

```bash
# 拉新 schema（这一批加了 ArticleFeedback 表）
pnpm db:migrate

# 灌 3 篇专题进 DB（幂等，可重跑）
pnpm db:seed:topics

# 重启 dev server
# Ctrl+C 然后
pnpm dev
```

### Checklist A · 首页与品牌

打开 <http://localhost:3000>

- [ ] 顶部 header 显示「超级个体 / Super · Solo」logo，右侧 nav 有 **专题 / 基础认知 / 关于**
- [ ] 点 **专题** → 跳到 `/topics`，能看到 3 条专题
- [ ] 首页「本期专题」section 改成从 DB 读，能看到 3 条专题（不是之前的 PLACEHOLDER 占位）
- [ ] 点任一专题标题 → 跳到 `/topics/[slug]`
- [ ] 三栏「基础认知 / 专题攻略 / 实战项目」card 还在
- [ ] Manifesto 反转黑底「不教你「打螺丝」。教你「开车走人」。」还在
- [ ] Footer 写着 `Set in Fraunces + Geist Mono + Songti SC`

### Checklist B · 专题详情页 + 5 个 callout

打开 <http://localhost:3000/topics/add-ai-chat-to-your-site>

- [ ] 文章头部有「Topic · L2」stamp + 难度 ★★☆☆☆ + 60 分钟 + "≈ ¥0.5/月"
- [ ] 「VERIFIED · 2026/06/04」绿色已验证 stamp（不是红的「POSSIBLY OUTDATED」）
- [ ] 正文里 5 种 callout 都能看到、且**视觉互不相同**：
  - [ ] 📋 **prep**（灰底 + 黑色 stripe）
  - [ ] 🪪 **apply**（浅绿底 + emerald stripe）
  - [ ] 🤖 **prompt**（**黑底反转** + 黄色 stripe + 黄色高亮 inline code）
  - [ ] ✅ **verify**（白底 + 自动 ☐ 待办框，列表前面有方框）
  - [ ] ⚠️ **pitfall**（白底 + **红色** stripe + 红色 "症状" 关键字）
- [ ] 文章底部「📝 本讲小测 · 5 道题 · 开始答题 ›」按钮还在
- [ ] 点按钮 → 弹小测 modal → 答完显示分数 + 「学习下一讲 / 留在本讲」

### Checklist C · 读者反馈

仍在 topic 详情页

- [ ] 小测下方多了一块「有问题？卡住了？」+ 右侧「📨 反馈这一篇」按钮
- [ ] 点反馈按钮 → 弹 modal
- [ ] 类型切换：跑不通 / 建议改进 / 想说声谢谢
- [ ] 没登录的话：会显示「你的邮箱（可选）」输入框
- [ ] 填几个字 → 提交 → 显示 ✓「收到，谢谢你！」
- [ ] **关掉浏览器，看 admin 端**：见 Checklist E.5

### Checklist D · 其他两篇专题

- [ ] <http://localhost:3000/topics/deploy-your-project-with-vercel>
  - 标题：「把你的项目部署上线（Vercel + 自定义域名 + HTTPS）」
  - 5 个 callout 都能看到，里面有 4 个 pitfall（多个 pitfall 是允许的）
- [ ] <http://localhost:3000/topics/email-code-login>
  - 标题：「邮箱 + 验证码登录（无密码方案）」
  - 这一篇里的 callout 包含 prompt 提示词模板

### Checklist E · Admin 后台

前提：已用某个邮箱登录，并把那个 user 的 `role` 改成 `admin`（之前的步骤）。

#### E.1 仪表盘 `/admin`

- [ ] 顶部 nav 出现：**仪表盘 / 路径 / 文章 / 反馈 / 返回前台**
- [ ] 4 个顶部指标卡：用户总数 / 文章总数 / 专题 / 反馈
  - 用户总数 = 你创建的几个测试账号
  - 文章总数应该是 **9**：6 个 lesson（vibecoding 5 篇 + 你之前测试加的 1 篇）+ 3 个 topic
  - 专题 = 3，路径 = 1
- [ ] 第 5 个指标卡「可能过期的专题」= 0（因为刚 seed，全部 lastVerifiedAt 是今天）
- [ ] 「最近反馈」section 显示你刚才提交的那条
- [ ] 「最近内容更新」按 updatedAt 排序，最新的在最前
- [ ] 「最近注册」按 createdAt 排序

#### E.2 文章管理 `/admin/articles`

- [ ] 列表里 3 条 topic 在最前（分组 `(无路径 · 专题)`），下面是按 path 分组的 lesson
- [ ] 点任一 topic → 「编辑文章」页
  - kind 切换器显示 "专题文章 (Topic)" 高亮
  - 没有 pathSlug / order 字段
  - 有 difficulty / estimatedMinutes / cost 字段
- [ ] 切换到 lesson → pathSlug 下拉变出来，topic 字段消失

#### E.3 新建 topic `/admin/articles/new`

- [ ] kind 默认是 "基础课时"，点 "专题文章" 切换 → 字段动态变化
- [ ] 标题填一个，点正文上方「+ 插入 5 个内嵌模块模板」→ 模板代码塞进 textarea
- [ ] 状态选「立即发布」→ 保存
- [ ] 回 `/topics` 能看到新建的，点进去 5 个 callout 都渲染
- [ ] 回仪表盘看「最近内容更新」第一条就是它

#### E.4 反馈收件箱 `/admin/feedback`

- [ ] 显示「共 X 条 · Y 条待处理」
- [ ] 你刚才提交的那条在最上面，左边带「待」橘色 chip
- [ ] 邮箱字段如果有，是 mailto 链接（点了打开邮件 App）
- [ ] 文章 slug 是链接，点了去前台原文
- [ ] 状态下拉切「已分类」/「已解决」→ 页面刷新 → 排序按状态重排
- [ ] 删除按钮：弹确认，删完页面刷新

#### E.5 反馈闭环 round-trip

- [ ] 退出登录（无痕窗口也行）
- [ ] 访问 `/topics/add-ai-chat-to-your-site`
- [ ] 点反馈，分类选「这步跑不通」，留邮箱、写两行
- [ ] 提交 → 显示成功
- [ ] 切回 admin 浏览器，刷 `/admin/feedback`
- [ ] **新反馈出现**，未登录用户的邮箱显示在那里

### Checklist F · 路径页和 lesson 页（旧功能没坏）

- [ ] <http://localhost:3000/paths/vibecoding-getting-started> 还能打开
- [ ] 点任一讲 → 跳到 `/paths/.../[lesson]` 阅读页
- [ ] 左侧 sidebar 显示锁定/解锁状态
- [ ] 文章底部「开始答题」modal 还能弹

---

## 3. 已知限制 / 待办（我没做的）

### 故意没做（v0.3 决议先免费）

- 付费 / Order 表 / Stripe 接入
- 实战课 (L3 · Workshops) —— 卡片在首页显示「即将推出」，没做后端
- 邀请协作者机制 —— 所有 admin 直接能写，够用

### 简化版（先够用，后面可加强）

- **Markdown 编辑器**仍是普通 textarea。你提了「现阶段简单」，我没动。后续要加预览/工具栏告诉我。
- **图片上传**没有。文章里需要图，目前要么靠 Markdown 远程链接，要么用图床（imgur / cloudinary）后贴 URL。
- **季度全量验证机制**没做（D1 文档里提的）。当前是手动改 `lastVerifiedAt` 字段。后续我可以做一个 admin 按钮「标记已验证」一键更新今天日期。

### 真的还没做的（D 系列剩余）

- 季度全量检查的自动化（cron / scheduled job）

---

## 4. 路径 / 数据库当前状态

```bash
# 一键看全部数据：
pnpm db:studio
# → 浏览器开 Prisma Studio
```

预期表内容（如果你按上面步骤走过）：

| 表 | 行数 |
|---|---|
| User | 你建的几个测试账号（≥1 个 admin）|
| Session | 等同活跃登录数 |
| EmailVerification | 你发过的验证码记录 |
| LearningPath | 1 条（vibecoding-getting-started）|
| Article | 9 条（5 vibecoding 讲 + 你测试的 1 条 + 3 topic）|
| ArticleFeedback | 你提交的反馈条数 |
| UserLessonProgress | 你完成过的小测 |

---

## 5. 路由地图（这一批之后的样子）

```
前台
  /                                       ← 首页（超级个体品牌 + 真实专题列表）
  /paths/[slug]                           ← 路径概览
  /paths/[slug]/[lesson]                  ← 课时阅读（带 sidebar + 小测）
  /topics                                 ← 专题列表（杂志 TOC）★新
  /topics/[slug]                          ← 专题详情（5 callout + 小测 + 反馈）★新
  /login（已废弃，登录模态化）

Admin
  /admin                                  ← 仪表盘 ★新
  /admin/paths
  /admin/paths/new
  /admin/paths/[id]/edit
  /admin/articles
  /admin/articles/new                     ← 支持 kind 切换 ★改
  /admin/articles/[id]/edit               ← 支持 kind 切换 ★改
  /admin/feedback                         ← 读者反馈收件箱 ★新

API
  /api/auth/{email/{request-code,verify-code},logout,me}
  /api/progress{,/attempt,/complete}
  /api/admin/articles{,/[id]}
  /api/admin/paths{,/[id]}
  /api/feedback                           ★新
  /api/admin/feedback/[id]                ★新

Middleware
  /paths/:slug/:lesson                    ← 强制登录闸门
```

---

## 6. 反馈方式

- 走完上面 Checklist，把每一条 ✅ 或 ❌ 告诉我
- ❌ 的话附一句：哪里不对 / 截个图 / 期望是什么
- 如果有顺手想加的小功能（"按钮颜色想换"、"想要 X 字段"），一起说

---

**END · 阶段 A-D 完成 · 2026-06-04**
