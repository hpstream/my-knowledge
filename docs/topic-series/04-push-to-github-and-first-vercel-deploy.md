# 第 04 篇｜把你本地的项目推到 GitHub，然后让 Vercel 第一次跑起来

> 适合人群：已经注册好 GitHub 和 Vercel，但没真正把项目上线过的人  
> 目标：**今天结束时，你会拿到一个真的能打开的临时网址（`xxx.vercel.app`）**  
> 提醒：今天的目标只是“让网站先跑起来”，不是把数据库、邮件、域名一步到位。

---

## 你今天到底要完成什么？

只做两件事：

1. 把你本地项目推到 GitHub
2. 让 Vercel 从 GitHub 拉代码并部署成功

这一步成功后，你会第一次得到一个线上地址，比如：

```text
https://my-knowledge-xxxx.vercel.app
```

别人打开这个地址，就能看到你的网站。

---

## 一张链路图先看懂

你现在的链路是：

```text
你本地电脑上的项目
   ↓
Git 记录代码版本
   ↓
GitHub 存代码
   ↓
Vercel 拉 GitHub 仓库
   ↓
Vercel 把代码跑成网站
   ↓
得到一个线上临时网址
```

这里最重要的认知是：

> **GitHub 不是部署平台，Vercel 才是。**

GitHub 只是：
- 存代码
- 给 Vercel 一个能读到代码的入口

---

## 第 1 章：先确认你是不是在项目根目录

这一步非常重要，因为后面你敲的所有命令都要在正确目录里执行。

### 什么叫“项目根目录”？

就是：

> **包含 `package.json` 的那个文件夹**

比如你现在这个项目，根目录大概是：

```text
/Users/hpstream/Desktop/code/my-knowledge
```

### 怎么确认？

在终端里输入：

```bash
pwd
```

如果输出是：

```bash
/Users/hpstream/Desktop/code/my-knowledge
```

说明你在对的地方。

再输入：

```bash
ls
```

如果能看到这些文件 / 文件夹：

- `package.json`
- `src/`
- `prisma/`
- `README.md`

那就说明位置正确。

> 如果你不在这个目录，先用 `cd` 进去，再继续后面的步骤。

---

## 第 2 章：看看这个项目是不是已经在 Git 管理下

在项目根目录执行：

```bash
git status
```

### 两种情况

#### 情况 A：输出很多文件状态
比如：

```bash
On branch main
Changes not staged for commit:
...
```

这说明：

> **这个项目已经是一个 Git 仓库了。**

你可以直接跳到第 3 章。

#### 情况 B：报错
比如：

```bash
fatal: not a git repository (or any of the parent directories): .git
```

这说明：

> 还没初始化 Git

那就继续执行：

```bash
git init
```

这一步的意思是：

> “从现在开始，让 Git 负责记录这个项目的版本历史。”

---

## 第 3 章：把当前代码做成第一次快照（commit）

### 第一步：把文件加入“准备保存”的列表

执行：

```bash
git add .
```

这一步不是上传代码，它只是告诉 Git：

> 这些文件，准备作为下一次快照的一部分。

### 第二步：做第一次 commit

执行：

```bash
git commit -m "init"
```

### 这一步是什么意思？

`commit` 可以理解成：

> **把当前项目打一个版本快照。**

`-m "init"` 是给这次快照写一句说明。

以后你也可以写：

- `add topic pages`
- `add email login`
- `fix feedback modal`

### 如果这一步报错怎么办？

#### 报错：Please tell me who you are

说明你本机 Git 还没配置用户名和邮箱。

执行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

然后重新执行：

```bash
git commit -m "init"
```

---

## 第 4 章：在 GitHub 上新建仓库

现在代码已经有了本地版本历史，但还只在你电脑里。下一步是创建一个远端仓库。

### 第一步：去 GitHub

打开：

> <https://github.com>

登录你的账号。

### 第二步：新建仓库

点右上角：

```text
+
```

然后点：

```text
New repository
```

### 第三步：填写仓库信息

#### Repository name
推荐直接填：

```text
my-knowledge
```

这样和你本地项目名一致，不容易乱。

#### Description
可填可不填。新手可以先留空。

#### Public / Private
建议选：

> **Private**

因为：
- 现在代码没必要公开
- Vercel 一样能部署私有仓库
- 更安全

#### Add a README file
不要勾。

因为你本地项目已经有 README 了，GitHub 再生成一个会让初始状态冲突。

#### Add .gitignore
不要选。

因为你本地项目已经有 `.gitignore`。

#### Choose a license
不要选。

现在仓库还是私有的，license 没意义。

### 第四步：点 Create repository

点完后，GitHub 会进入一个新页面，并给你一段命令。

你会看到类似：

```bash
git remote add origin https://github.com/你的用户名/my-knowledge.git
git branch -M main
git push -u origin main
```

不要慌，下一章就用它。

---

## 第 5 章：把本地项目连到 GitHub 仓库

### 第一步：复制仓库地址

GitHub 页面上会显示你的仓库 URL，比如：

```text
https://github.com/你的用户名/my-knowledge.git
```

### 第二步：回终端执行

```bash
git remote add origin https://github.com/你的用户名/my-knowledge.git
```

这一步的意思是：

> “以后这个本地项目，对应的远端仓库就是 GitHub 上这一个。”

### 第三步：设主分支为 main

```bash
git branch -M main
```

你现在不需要完全理解分支，但可以先记住：

> `main` 就是主线版本。

### 第四步：第一次 push

```bash
git push -u origin main
```

### 这一步的意义

这一步就是：

> **把本地代码上传到 GitHub。**

如果成功，你回 GitHub 刷新，就能看到：

- `package.json`
- `src/`
- `prisma/`
- `README.md`
- 其他所有代码文件

### 如果这里要你登录怎么办？

现在 GitHub 往往不再让你直接输密码，常见做法是：

- 浏览器弹出授权
- 或者你本机已经登录 GitHub CLI / GitHub Desktop

如果你卡在认证，最简单的解决办法通常是：

- 装 GitHub Desktop
- 或让浏览器授权完成

---

## 第 6 章：去 Vercel 导入仓库

现在 GitHub 里已经有代码了，下一步是让 Vercel 读取这个仓库。

### 第一步：打开 Vercel Dashboard

登录你的 Vercel 账号。

### 第二步：点击 New Project / Add New Project

你会看到一个页面，列出你 GitHub 的仓库。

找到：

```text
my-knowledge
```

然后点：

```text
Import
```

### 这一步的意义

它不是“复制一份代码”而已。

它做的是：

> **建立 GitHub → Vercel 的自动部署关系。**

以后只要你：

```bash
git push
```

Vercel 就会自动开始重新部署。

---

## 第 7 章：导入配置页怎么填

导入后，Vercel 会出现一个配置页。

### 你要关注 4 个地方

#### 1. Framework Preset
应该是：

> **Next.js**

如果不是，就手动选 `Next.js`。

#### 2. Root Directory
如果你的 GitHub 仓库根目录里直接就有：

- `package.json`
- `src/`
- `prisma/`

那这里：

> **留空即可**

#### 3. Install Command
如果它没自动识别出来，就手动填：

```bash
pnpm install
```

#### 4. Build Command
如果它没自动识别出来，就手动填：

```bash
pnpm build
```

### 现在要不要填环境变量？

第一次部署时你可以暂时不填，**只为了先让 Vercel 跑起来**。

但如果你的项目一打开就强依赖数据库，那它后面可能会报错。没关系，这代表下一篇我们该接 Neon 了。

---

## 第 8 章：点击 Deploy

配置确认后，点：

```text
Deploy
```

### 这一步会发生什么？

Vercel 会：

1. 从 GitHub 拉代码
2. 安装依赖
3. 构建 Next.js 项目
4. 部署到它的服务器
5. 给你一个线上临时地址

这个过程一般需要 1-3 分钟。

---

## 第 9 章：第一次部署成功时，你会得到什么？

如果成功，Vercel 会给你一个地址，类似：

```text
https://my-knowledge-xxxx.vercel.app
```

### 你现在要做什么？

- 点开这个地址
- 看看页面能不能打开
- 用手机也试一下

如果别人能打开它，说明：

> **你的网站第一次真正上线成功了。**

虽然现在可能还没数据库、还没邮件、还没正式域名。

但“别人能访问”这一步已经达成了。

---

## 第 10 章：最常见的报错是什么？

### 报错 1：No Next.js version detected

这通常不是你代码坏了，而是：

- Vercel 没读到正确的 `package.json`
- Root Directory 错了
- Framework 没识别到

### 解决方式

确认：
- GitHub 仓库根目录里有 `package.json`
- Root Directory 留空（如果项目就在仓库根目录）
- Framework 选 `Next.js`
- Install = `pnpm install`
- Build = `pnpm build`

---

### 报错 2：`DATABASE_URL` not found

意思是：

> 项目已经开始执行数据库逻辑了，但线上环境没配数据库连接串。

这不是今天的失败，而是下一篇该做的事情。

你不用现在就全懂，只要知道：

> 这意味着“网站已经能运行到要查数据库那一步了”。

也就是：部署基础没问题，卡的是数据库接入。

---

### 报错 3：`LearningPath table does not exist`

意思是：

> 你已经给 Vercel 配了 `DATABASE_URL`，也连上了远程数据库，
> 但数据库里面还没有对应表结构。

这说明：

> 下一步要跑 Prisma migration + seed。

也就是下一篇第 04 篇要讲的内容。

---

## 第 11 章：今天成功的标准是什么？

你今天不要求：
- 登录能用
- 数据库已接通
- 邮件能发
- 域名已配好

今天成功的标准只有这 4 条：

- [ ] GitHub 仓库里能看到完整项目代码
- [ ] Vercel 成功导入项目
- [ ] Vercel 至少开始构建
- [ ] 你拿到了一个 `xxx.vercel.app` 地址（即使功能还不完整）

如果这四条做到，你就已经跨过了最大的一道心理门槛：

> **本地项目真的能被互联网上的人访问。**

---

## 第 12 章：做完今天，你真正得到什么？

你今天不是“学了 Git”。

你真正得到的是：

### 1. 一个可以持续更新的代码仓库
以后每次你改代码，都有地方存档。

### 2. 一个自动部署链路
以后只要 push，Vercel 会自动更新网站。

### 3. 一个能给别人访问的网址
哪怕只是临时的 `vercel.app`，它也意味着：

> 这个项目已经走出了你电脑。

---

## 第 13 章：下一篇最该写什么？

最自然的下一篇就是：

## 《第 05 篇：把当前项目接到 Neon，上线后真正有数据库》

因为你现在最容易卡在：

- `DATABASE_URL` 是什么
- Neon 连接串怎么用
- Vercel 环境变量在哪里配
- Prisma migration 怎么跑
- seed 怎么跑
- 为什么线上不能继续用 SQLite

这正是下一篇要解决的。

---

## 最后一句

很多人第一次部署，卡住不是因为不会写代码。

而是因为：

> **不知道“本地项目 → GitHub → Vercel”这条链路到底怎么接。**

今天你如果把这条链路接上了，后面的数据库、邮件、域名，都只是再往上加一层而已。
