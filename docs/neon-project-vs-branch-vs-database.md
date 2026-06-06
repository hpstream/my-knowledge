# Neon 里 Project / Branch / Database / Schema 到底是什么？

> 适合人群：第一次接触 Neon，被它的层级结构绕晕的人  
> 目标：**看完后你知道一个项目应该建几个 Project、Branch 是干嘛的、为什么你现在看到的表都在 `public` 下面**

---

## 先给结论（最重要）

如果你现在只想记住一句话，请记住：

> **一个网站项目，通常对应一个 Neon Project。**

比如：

- 超级个体 → 一个 Neon Project
- 你以后第二个 SaaS → 另一个 Neon Project
- 再做第三个工具站 → 再开一个 Neon Project

这样最不容易混。

---

# 一张图看懂 Neon 的层级

Neon 里大概是这样的关系：

```text
Project（项目）
  └── Branch（分支）
        └── Database（数据库）
              └── Schema（模式，默认 public）
                    └── Tables（表）
```

也就是说：

- **Project 最大**
- Branch 是 Project 下面的“数据库分支”
- Database 是真正装表的数据库
- Schema 是数据库里的一个命名空间（默认 `public`）
- Tables 才是你实际看到的 `User`、`Article`、`LearningPath` 这些表

---

# 1. Project 是什么？

Project 是你最应该关注的一层。

你可以把它理解成：

> **一个完整数据库项目的大盒子。**

这个盒子里会放：
- 一套数据库
- 一些分支
- 连接信息
- 备份能力
- 访问控制

## 对你来说，Project 的意义是什么？

Project 基本就等于：

> **一个网站项目的数据库边界**

### 举例

如果你现在有 3 个不同的网站：

1. 超级个体
2. 一个 AI 工具导航站
3. 一个自己的博客 SaaS

那最推荐的方式是：

```text
Project 1: super-solo
Project 2: ai-tools-directory
Project 3: blog-saas
```

每个网站一个 Project。

---

# 2. Branch 是什么？

Branch 可以理解成：

> **数据库的分支 / 副本**

这和 Git 的 branch 有一点像。

## 它适合干嘛？

适合同一个项目里的不同环境，比如：

```text
Project: super-solo
  ├── main      （正式环境）
  ├── staging   （预发布测试）
  └── dev       （开发测试）
```

这样你可以：
- 在 `dev` 分支乱改表结构
- 在 `staging` 分支验证迁移
- `main` 保持稳定

## 你现在要不要用 Branch？

如果你是小白，**暂时不用。**

因为你现在最重要的是：

> 先让一个数据库跑起来。

所以你可以先把 Branch 理解成：

> **同一个项目内部的“实验副本”**

不是拿来区分“不同网站”的。

---

# 3. Database 是什么？

Database 就是：

> **真正存表的数据库。**

你现在截图里看到的是：

```text
database = neondb
```

这说明你现在正在看的数据库名字叫：

> `neondb`

## 为什么它总叫 `neondb`？

很多人第一次看到这里会困惑：

> “如果我以后有两个项目，不就都叫 `neondb` 了吗？”

答案是：

> **是的，名字可以重复，但没关系。**

因为真正隔离你的，不是 database 名字，而是它外面的 Project。

比如：

```text
Project: super-solo
  Database: neondb

Project: second-product
  Database: neondb
```

这两个 `neondb` 完全不是同一个东西。

就像很多电脑里都有一个叫 `Documents` 的文件夹，但它们不在同一台电脑里，不会冲突。

---

# 4. Schema 是什么？

Schema 可以理解成：

> **数据库里的一个“文件夹” / 命名空间。**

PostgreSQL 默认都有一个：

```text
public
```

所以你现在看到：

```text
public
  ├── Article
  ├── User
  ├── LearningPath
  └── ...
```

这意思就是：

> 这些表都在 `neondb` 数据库的 `public` schema 里面。

## 你现在要不要管 Schema？

对你当前阶段来说：

> **不用管。**

默认用 `public` 就行。

以后只有在很复杂的大型项目里，才会考虑：
- `auth` schema
- `billing` schema
- `analytics` schema

你现在完全不需要。

---

# 5. Tables（表）才是你真正熟悉的东西

表就是你现在最关心的那些：

- `User`
- `Article`
- `LearningPath`
- `ArticleFeedback`
- `UserLessonProgress`

这些表才是网站真正的“内容和数据”。

你在 Neon 网页里看到这些表，说明：

> **你已经在看这个数据库的真实内容了。**

只是你看到的是：

```text
Project → Branch → Database → Schema → Tables
```

里最底层那一层。

---

# 6. 那我现在这个项目，应该建几个 Project？

## 对你当前的 `my-knowledge / 超级个体`

答案：

> **1 个就够。**

也就是说：
- 当前这个 Project 就继续用
- 当前这个 `neondb` 就继续用

没问题。

---

# 7. 如果我以后再做第二个网站呢？

这时候不要在同一个 Project 里继续加表。

正确做法是：

> **重新新建一个 Neon Project**

比如：

```text
Project 1: super-solo
Project 2: ai-tools-site
```

## 为什么不要混在一个 Project 里？

因为会带来很多问题：

### 1. 容易搞混
你不知道哪张表属于哪个项目。

### 2. 环境变量会串
两个网站如果共用同一个数据库，稍不注意就互相污染。

### 3. 权限不好管
以后如果你想给别人看某个项目数据库，不方便隔离。

### 4. 备份不好做
一个项目出问题，另一个项目也跟着风险变大。

所以最简单的规则就是：

> **一个网站 / 一个产品 = 一个 Neon Project**

---

# 8. 那 Branch 什么时候才该用？

当你的网站已经不只是你一个人在本地试的时候。

比如以后你会有：

- 正式环境（线上用户真的在用）
- 预发布环境（你想先测试）
- 开发环境（你乱改东西）

那时候你就可以这样：

```text
Project: super-solo
  ├── main
  ├── staging
  └── dev
```

## 但你现在先别碰
因为 Branch 会增加复杂度。

你现在更应该先把：
- 本地项目
- Neon 数据库
- Vercel 部署
- Resend 邮件

这一条主线打通。

等这些跑稳了，再考虑多分支。

---

# 9. 你现在这个页面里到底在看什么？

如果你在 Neon 控制台里看到的是：

```text
Project: steep-hill-49050732
Branch: br-weathered-pond-aq5t2udp
Database: neondb
Schema: public
```

那你现在看到的所有表，都是：

> **这个 Project 的这个 Branch 下的这个 Database 的 public 模式里的表。**

翻成人话：

> 你现在正在看“这个网站当前正在用的数据库内容”。

所以如果这里有：
- `LearningPath`
- `Article`
- `User`

那就是你的这个项目的数据。

---

# 10. 对你最实用的规则（只记这个就行）

## 规则 1
**一个网站项目，对应一个 Neon Project。**

## 规则 2
**同一个项目有多个环境时，再考虑用 Branch。**

## 规则 3
**Database 名字是不是都叫 `neondb` 不重要，关键看它属于哪个 Project。**

## 规则 4
**Schema 现在一律用默认的 `public`，别折腾。**

---

# 11. 你现在要不要改什么？

## 现在不用改

你当前这个项目：
- 已经有一个 Neon Project
- 已经连上数据库
- 已经能看到表

所以：

> **继续用现在这个 Project 就可以。**

没必要为了“命名更优雅”现在去重建。

## 以后再开新项目时记住
到时候直接：

> **New Project**

不要复用这个。

---

# 12. 一句话总结

> **Neon 里真正代表“这是一个独立项目数据库”的，是 Project。**
>
> **Branch 是同一个项目的分支副本。**
>
> **Database 是里面真正装表的库。**
>
> **Schema 先一直用 `public` 就行。**

你现在最该做的，不是纠结这一层，而是继续把：

- Vercel
- Neon
- Resend
- 域名

这一整条上线链路跑通。
