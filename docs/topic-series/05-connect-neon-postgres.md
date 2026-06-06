# 第 05 篇｜把当前项目接到 Neon：让线上网站真正有数据库

> 适合人群：已经把项目推上 GitHub、让 Vercel 第一次跑起来了，但开始遇到数据库相关报错的人  
> 目标：**把本地 SQLite 思维彻底切掉，让你的网站从一开始就用远程数据库跑起来**  
> 这篇会直接基于你当前项目的真实情况来讲，不再走“先本地 SQLite 再切远程”的绕路。

---

## 先说结论：正式要上线的网站，不应该继续用本地 SQLite

如果你的网站最终要让别人访问、让别人登录、让别人提交反馈、让你自己在后台录文章，那么：

> **数据必须一开始就放到远程数据库。**

你之前已经亲身遇到过两个典型问题：

### 问题 1：`DATABASE_URL` 没配
这说明：

> 线上环境不会自动读取你本地电脑的 `.env`

### 问题 2：`LearningPath table does not exist`
这说明：

> 线上数据库不是“本地那个 dev.db 文件”，而是一个全新的数据库，表必须重新建进去

这些都不是 bug，而是在提醒你：

> **线上数据库和本地文件不是一回事。**

所以这篇的核心思路非常明确：

- 本地开发可以继续用 Prisma
- 但数据库不要再围绕 SQLite 转
- 直接让本地和线上都使用同一个类型的远程数据库（PostgreSQL）

---

## 第 1 章：先搞懂今天要完成什么

今天这篇的目标不是“数据库原理”，而是 4 件非常具体的事：

1. 在 Neon 拿到数据库连接串
2. 把连接串放进项目的 `.env`
3. 让 Prisma 按 PostgreSQL 生成并迁移表结构
4. 把初始内容灌进远程数据库，让网站真正有数据可读

做完后，你会得到：

- 一个**真的能存数据**的网站
- 一个线上数据库（Neon）
- 管理后台、文章、反馈、学习进度都能正常读写

---

## 第 2 章：什么是 `DATABASE_URL`？

这是你后面最常看到的环境变量。

它看起来会像这样：

```env
DATABASE_URL="postgresql://用户名:密码@主机名/数据库名?sslmode=require"
```

### 你可以把它理解成什么？

> **数据库的门牌号 + 钥匙 + 进入方法**

这一串里包含了：
- 去哪个数据库服务器
- 用哪个用户名
- 用哪个密码
- 打开哪个数据库

所以：

> **如果没有 `DATABASE_URL`，你的代码根本不知道要去哪儿找数据库。**

这也是为什么你之前会报：

```text
Environment variable not found: DATABASE_URL
```

---

## 第 3 章：去 Neon 拿连接串

### 第一步：打开 Neon

登录：

> <https://console.neon.tech>

进入你给这个项目开的那个 Project。

如果你忘了 Project 是什么，回看：
- `docs/neon-project-vs-branch-vs-database.md`

### 第二步：找到连接信息

在 Neon 后台，一般会在这些位置出现：

- **Connection Details**
- **Connection string**
- **Connect**
- **Overview** 页面右侧

你会看到一串像这样的东西：

```text
postgresql://neondb_owner:密码@主机名/neondb?sslmode=require
```

### 这一步你要做什么？

复制这一整串。

但要记住：

> **这串连接信息等于数据库钥匙，不要随便截图发给别人。**

---

## 第 4 章：把 `DATABASE_URL` 放到项目里

回到你的项目根目录，打开 `.env`。

你应该把它改成这样：

```env
DATABASE_URL="postgresql://你的实际连接串"
```

### 注意 1：两边的双引号不要漏
建议保留双引号。

### 注意 2：不要继续保留旧的 SQLite 值
像这种：

```env
DATABASE_URL="file:./dev.db"
```

现在就应该彻底不用了。

### 为什么？

因为你现在已经决定：

> **本地和线上都走 Neon，同一套数据库形态。**

这样最清楚，也最不容易出“本地没问题、线上炸了”的错觉。

---

## 第 5 章：让 Prisma 知道你现在用的是 PostgreSQL

你的项目里，Prisma 的数据库类型写在：

```text
prisma/schema.prisma
```

找到这里：

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

把它改成：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 这一步为什么必须做？

因为 Prisma 也需要知道：

> “我现在面对的是 SQLite 还是 PostgreSQL？”

你之前已经踩过一次坑了：

- `.env` 已经换成了 Postgres 连接串
- 但 `provider` 还写着 `sqlite`
- Prisma 直接报错：

```text
the URL must start with the protocol file:
```

原因就是：

> Prisma 以为自己在连 SQLite，但你给它的是 PostgreSQL 的钥匙。

所以：

> `.env` 和 `schema.prisma` 必须一致。**两边都改成 PostgreSQL。**

---

## 第 6 章：重新生成 Prisma Client

在项目根目录执行：

```bash
npx prisma generate
```

### 这一步是干嘛的？

当你改了 `schema.prisma`，Prisma 需要重新生成一套新的客户端代码。

你可以理解成：

> “告诉 Prisma：从现在起，按 PostgreSQL 规则工作。”

如果这一步不做，后面就可能继续拿旧规则运行。

---

## 第 7 章：重建迁移历史（因为你之前是 SQLite）

这是最容易让人崩的一步，但其实不复杂。

你之前这个项目已经有一套 **SQLite 时代的 migration 历史**。

当你切到 PostgreSQL 时，Prisma 会报类似：

```text
The datasource provider `postgresql` specified in your schema
 does not match the one specified in the migration_lock.toml, `sqlite`.
```

翻成人话：

> “你以前按 SQLite 建过迁移，现在突然说自己是 Postgres，我不认。请重新来一套。”

### 正确做法

把旧 migration 目录备份掉：

```bash
mv prisma/migrations prisma/migrations.sqlite-backup
```

然后重新生成一套 PostgreSQL 的初始迁移：

```bash
npx prisma migrate dev --name init_postgres
```

### 这一步会发生什么？

Prisma 会：
- 读取当前 `schema.prisma`
- 在 Neon 里创建表
- 生成新的 `prisma/migrations/...init_postgres` 目录

### 为什么这个动作是安全的？

因为你现在是在：

> **第一次把项目从本地 SQLite 思维切到远程 PostgreSQL 思维。**

这时重建迁移历史，比硬保留旧 SQLite 迁移要更干净。

---

## 第 8 章：把初始数据灌进去

表结构建好了，数据库里还是空的。

现在执行：

```bash
pnpm db:seed
pnpm db:seed:topics
```

### 分别做什么？

#### `pnpm db:seed`
灌：
- 学习路径
- 基础文章（如果有 seed 源）

#### `pnpm db:seed:topics`
灌：
- 专题文章
- 专题题目

你之前项目里我们已经准备好了这些脚本，所以不用你自己写 SQL。

### 做完后，你会有什么？

比如当前项目，应该大概有：
- 路径：1-2 条
- 文章：十几篇
- 专题：几篇
- 用户：至少你自己一个
- 进度：你之前做过小测的记录

---

## 第 9 章：怎么确认远程数据库真的连上了？

最简单的方法有两个。

### 方法 A：Prisma Studio

执行：

```bash
pnpm db:studio
```

打开后看：
- `LearningPath`
- `Article`
- `User`
- `UserLessonProgress`

如果这些表里都有数据，说明：

> **本地代码已经成功连上 Neon。**

### 方法 B：Neon SQL Editor

在 Neon 控制台的 SQL Editor 里执行：

```sql
SELECT COUNT(*) FROM "Article";
SELECT COUNT(*) FROM "LearningPath";
SELECT COUNT(*) FROM "User";
```

如果能看到数字，说明远程数据库本身也正常。

---

## 第 10 章：为什么不建议“本地 SQLite → 上线再换库”？

你这次已经亲身验证了它的问题：

### 问题 1：认知上容易混乱
小白会误以为：

> “我本地都能跑，为什么线上不行？”

其实是因为本地和线上根本不是同一种数据库环境。

### 问题 2：会走重复路线
你要学两遍：
- 一遍 SQLite
- 一遍 Postgres

而你真正需要的只有：

> **最终网站该怎么跑。**

### 问题 3：会制造假问题
比如你之前遇到的：
- `DATABASE_URL` 缺失
- `LearningPath table does not exist`
- provider 不一致

这些不是业务问题，而是因为“路线绕了”。

所以我现在给你的建议是：

> **以后这类上线文章，默认都直接以远程库为主路线。**

SQLite 只保留给真正只想本地实验的人。

---

## 第 11 章：Vercel 那边接下来怎么配？

现在你本地 `.env` 已经是：

```env
DATABASE_URL="postgresql://..."
```

那 Vercel 后台也必须同样配置。

路径：

```text
Vercel 项目
→ Settings
→ Environment Variables
```

把 `DATABASE_URL` 的值，改成和你 `.env` 一样的 Neon 连接串。

### 为什么本地改了还不够？

因为：

> **Vercel 不会自动读取你电脑里的 `.env` 文件。**

线上环境变量必须在 Vercel 后台手动配。

### 配完后做什么？

重新部署一次：
- 在 Vercel 后台点 **Redeploy**
- 或者本地改一行代码再 push

这样线上也会开始用 Neon。

---

## 第 12 章：今天完成的标准是什么？

做完这篇后，你应该达到：

- [ ] `.env` 里的 `DATABASE_URL` 已经是 Neon 连接串
- [ ] `schema.prisma` 的 provider 已经是 `postgresql`
- [ ] `npx prisma generate` 成功
- [ ] `npx prisma migrate dev --name init_postgres` 成功
- [ ] `pnpm db:seed` 成功
- [ ] `pnpm db:seed:topics` 成功
- [ ] `pnpm db:studio` 能看到远程数据库里的表和数据
- [ ] Vercel 后台也已经改成同一个 `DATABASE_URL`

做到这些，说明：

> **你的项目已经真正完成了“本地文件数据库 → 远程数据库”的切换。**

---

## 第 13 章：下一步该做什么？

最自然的下一篇就是：

## 《第 06 篇：把邮箱验证码从“终端打印”改成真实邮件（Resend）》

因为你现在：
- 代码能跑了
- 数据库能存了

下一步就该让：

> **用户真正能收到邮件验证码。**

这一篇会讲：
- Resend API Key 从哪拿
- 域名验证是干嘛的
- 环境变量怎么配
- 线上验证码登录怎么真正跑通

---

## 最后一句

今天这一步的本质，不是“改个连接串”。

而是：

> **让你的项目第一次真正拥有了一个线上长期可用的数据大脑。**

从这一步开始，你的网站就不再只是“一个页面”，而是真正开始像一个产品了。
