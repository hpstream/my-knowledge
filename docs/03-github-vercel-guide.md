# 第 03 篇｜把你本地的项目推到 GitHub，然后让 Vercel 第一次跑起来

> 适合人群：已经看过前两篇、账号也基本注册好了，但没把代码推上过 GitHub，也没让 Vercel 真正跑起来过的人  
> 目标：**今天结束时，你会拿到一个真的能被别人访问的临时网址（`xxx.vercel.app`）**  
> 读完收获：你会第一次真正体会到「本地项目 → 线上网站」这条链路是怎么接上的。

---

## 先说清楚：今天你要完成什么？

今天只做两件事：

1. **把你本地项目推到 GitHub**
2. **让 Vercel 从 GitHub 拉代码并部署成功**

做完后，你会得到一个地址，比如：

```text
https://your-project-name.vercel.app
```

别人打开这个地址，就能看到你的网站。

这就是你第一次真正“上线”。

> 注意：今天的目标不是接数据库，也不是接邮件，也不是买域名。
> 今天先证明：**网站能在互联网上打开。**

---

# 第 1 章：今天你会遇到的 4 个新概念

在开始之前，我先把今天会出现的 4 个词讲明白。

## 1.1 Git 是什么？

Git 是一个：

> **记录代码变化历史的工具**

它会帮你记住：

- 你什么时候改了什么
- 哪个版本是稳定的
- 出问题时怎么退回上一个版本

你可以把它理解成：

> **代码世界的“撤销历史 + 存档功能”**

---

## 1.2 commit 是什么？

commit 就是：

> **保存一次当前代码状态的快照**

比如你写完一版功能，就做一次 commit。

这样 Git 就记住了：

> “这一刻的代码长什么样。”

以后你回头看，就能知道：
- 这是第一版
- 这是修 bug 版
- 这是上线前版本

---

## 1.3 push 是什么？

push 就是：

> **把你本地电脑里的代码，上传到 GitHub。**

本地和 GitHub 的关系，你可以理解成：

- 本地 = 你桌面上的文件夹
- GitHub = 远端备份仓库

你在本地改了代码，只是改在自己电脑里；
只有 push 之后，GitHub 才知道这些代码存在。

---

## 1.4 部署（Deploy）是什么？

部署就是：

> **把 GitHub 上的代码，真正放到能被别人访问的服务器上运行。**

GitHub 只是存代码，**不会自动把代码变成网站**。

Vercel 才负责这件事。

所以今天的链路是：

```text
你的电脑
  ↓ (git commit)
Git 记录一个版本
  ↓ (git push)
GitHub 存代码
  ↓ (Vercel import)
Vercel 把代码跑起来
  ↓
得到一个线上网址
```

---

# 第 2 章：开始前检查

在你真正敲命令之前，先确认这 4 件事：

- [ ] 你已经有 GitHub 账号
- [ ] 你已经有 Vercel 账号，并且能登录
- [ ] 你本地项目文件夹已经存在
- [ ] 你在项目根目录可以运行 `pnpm dev`，网站本地能打开

如果你本地 `pnpm dev` 都跑不起来，先不要继续。因为：

> **本地都跑不起来，线上一定跑不起来。**

---

# 第 3 章：怎么判断自己是不是在“项目根目录”

这是小白最容易卡住的点之一。

## 什么叫项目根目录？

项目根目录就是：

> **包含 `package.json` 的那个文件夹。**

比如你的项目在：

```text
/Users/hpstream/Desktop/code/my-knowledge
```

你可以先在终端里输入：

```bash
pwd
```

如果输出是：

```bash
/Users/hpstream/Desktop/code/my-knowledge
```

说明你就在项目根目录。

再输入：

```bash
ls
```

如果能看到：

- `package.json`
- `src/`
- `prisma/`
- `README.md`

这种结构，那就对了。

---

# 第 4 章：初始化 Git（如果还没有）

## 第一步：看当前项目是不是已经有 Git

在项目根目录输入：

```bash
git status
```

### 可能出现两种情况

#### 情况 A：正常输出很多文件状态
比如：

```bash
On branch main
Changes not staged for commit:
...
```

说明：

> 这个项目**已经初始化过 Git 了**。

你可以跳到第 5 章。

#### 情况 B：报错
比如：

```bash
fatal: not a git repository (or any of the parent directories): .git
```

说明：

> 这个文件夹还不是 Git 仓库。

那你就继续做下面这一步。

## 第二步：初始化 Git 仓库

输入：

```bash
git init
```

你会看到类似：

```bash
Initialized empty Git repository in .../.git/
```

这句话的意思是：

> Git 已经开始管理这个文件夹了。

你可以把它理解成：

> “这个项目现在开始有历史记录功能了。”

---

# 第 5 章：做第一次 commit

## 第一步：看看当前有哪些文件要保存

输入：

```bash
git status
```

你会看到一堆文件，说明 Git 已经发现它们，但还没正式保存进历史。

## 第二步：把所有文件加入暂存区

输入：

```bash
git add .
```

### 这一步是什么意思？

不是上传，不是部署。

它只是告诉 Git：

> “这些文件我准备保存到这次快照里。”

## 第三步：做第一次 commit

输入：

```bash
git commit -m "init"
```

### `-m "init"` 是什么？

这是在给这次快照起名字。

`init` 的意思是：

> “初始化版本”

以后你也可以用更清楚的名字，比如：

- `add email login`
- `add topic pages`
- `fix feedback modal`

### 如果这里报错怎么办？

#### 报错 1：没配置 git 用户名邮箱

你可能看到类似：

```bash
Please tell me who you are.
```

那就执行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

然后重新执行：

```bash
git commit -m "init"
```

#### 报错 2：没有东西可 commit

说明可能：
- 你已经提交过一次了
- 或你没改任何文件

这时不用慌，继续看 `git status` 就行。

---

# 第 6 章：在 GitHub 上新建仓库

现在你的代码已经有了 Git 历史，但还只在本地。下一步是去 GitHub 开一个远端仓库。

## 第一步：打开 GitHub

进入：

> <https://github.com>

登录你的账号。

## 第二步：新建仓库

点右上角：

```text
+
```

然后点：

```text
New repository
```

## 第三步：填写仓库信息

你会看到几个字段：

### Repository name
仓库名。

建议：

- 用项目英文名
- 简单明了

比如：

```text
my-knowledge
```

### Description（可选）
可填可不填。

### Public / Private
这个很重要。

#### Public
任何人都能看到你的代码。

#### Private
只有你和你授权的人能看到。

### 现在选哪个？

建议你一开始选：

> **Private**

这样更安全，你以后想公开再改。

## 第四步：不要勾这些选项

如果 GitHub 问你要不要：

- Add a README
- Add .gitignore
- Choose a license

**这里先都不要勾。**

### 为什么？

因为你本地项目已经有这些文件了。现在勾上会让远端和本地初始状态不一致，后面 push 时会更容易让新手混乱。

## 第五步：点 Create repository

做完后，GitHub 会跳到一个新页面。

这时候它会显示一段命令，通常像这样：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

先别慌，这就是下一章要用的。

---

# 第 7 章：把本地代码连接到 GitHub 仓库

## 第一步：复制 GitHub 给你的仓库地址

在 GitHub 页面上，你会看到仓库地址，大概长这样：

```text
https://github.com/你的用户名/my-knowledge.git
```

## 第二步：回到终端，执行远程绑定

```bash
git remote add origin https://github.com/你的用户名/my-knowledge.git
```

### 这一步是什么意思？

它是在告诉 Git：

> “我这个本地项目，以后对应的远端仓库就是这个 GitHub 地址。”

也就是：

```text
本地项目 ↔ GitHub 仓库
```

## 第三步：把默认分支设成 main

```bash
git branch -M main
```

### 为什么要做这步？

因为现在主流默认分支名都用 `main`。你不一定理解分支是什么，但先照做就对了。

## 第四步：第一次 push

```bash
git push -u origin main
```

### 这一步会发生什么？

- Git 会把你本地这份代码上传到 GitHub
- `-u` 表示以后记住这个远端对应关系

### 如果你是第一次 push，可能会遇到登录

现在 GitHub 一般不让直接输密码了，常见方式是：

- 浏览器弹出授权
- 或要求你用 GitHub Desktop / token

### 对新手最简单的方法

如果终端 push 一直卡认证，建议你安装：

> **GitHub Desktop**

官网：<https://desktop.github.com>

它会帮你完成图形化登录和同步，不用理解 token。

不过很多时候 macOS / Git 已经会自动拉浏览器授权，不一定需要额外装。

## 第五步：回 GitHub 刷新页面

如果成功，你会看到：

- 项目文件已经出现在仓库里
- README、src、package.json 等都能看见

到这里你完成了：

> **本地代码 → GitHub**

---

# 第 8 章：在 Vercel 上导入 GitHub 仓库

现在代码已经在 GitHub 了，下一步就是让 Vercel 跑它。

## 第一步：打开 Vercel Dashboard

登录你的 Vercel 账号。

如果你之前没绑定 GitHub，这一步就会卡住；但前一篇我们已经做过账号准备了。

## 第二步：Add New Project

在 Vercel Dashboard 里，点：

```text
Add New Project
```

或者：

```text
New Project
```

## 第三步：选择刚才的 GitHub 仓库

你会看到 GitHub 仓库列表。

找到：

```text
my-knowledge
```

然后点：

```text
Import
```

### 这一步是什么意思？

意思是：

> “让 Vercel 把这份代码当成要部署的网站。”

它并不是复制一份文件而已，而是建立一个持续关系：

```text
以后这个仓库一有更新 → Vercel 自动重新部署
```

## 第四步：看构建配置页

导入后，Vercel 会展示一个配置页。

如果它识别到你是 Next.js 项目，通常会自动填好：

- Framework Preset: `Next.js`
- Build Command: 自动
- Output Directory: 自动

### 你该做什么？

第一次部署时：

> **大多数情况下，先别改，直接 Deploy。**

### 为什么可以直接 Deploy？

因为今天我们的目标只是：

> 先证明网站能在 Vercel 上跑起来。

复杂的数据库、邮件、环境变量，我们后面再接。

## 第五步：点击 Deploy

点：

```text
Deploy
```

然后等它构建。

构建过程一般会显示：

- Installing dependencies
- Building project
- Deploying

这通常需要 1-3 分钟。

---

# 第 9 章：第一次部署成功后，你会得到什么？

部署成功后，Vercel 会给你一个地址，比如：

```text
https://my-knowledge-xxxx.vercel.app
```

或者：

```text
https://my-knowledge.vercel.app
```

这就是你网站的**临时线上地址**。

### 你现在要做的事

1. 点击这个地址
2. 看看页面能不能打开
3. 用手机也试着打开一下

如果能打开，说明你已经做到了：

> **让别人也能访问你的项目。**

这就是第一次上线。

---

# 第 10 章：如果部署失败，最常见的原因是什么？

## 情况 1：本地能跑，Vercel 上构建失败

### 原因可能是：
- 本地有依赖，但 `package.json` 没写进去
- 代码里有 TypeScript 报错
- Prisma 没生成
- 环境变量依赖过早

### 你该怎么做？

先看 Vercel 的日志，最底部通常会有明确报错。

你可以把错误整段复制给 AI，这样问：

```text
这是我在 Vercel 第一次部署时的完整日志。
请你告诉我：
1. 真正的报错点在哪
2. 是缺依赖、缺环境变量，还是代码本身有问题
3. 给我最小改动的修复方案

（把完整日志粘进来）
```

### 注意

不要只截最后一行。

很多真正的错误都藏在前面几十行。

---

## 情况 2：部署成功了，但页面打开 500 / 白屏

### 可能原因：
- 你的网站一打开就依赖数据库
- 你还没接 Neon
- 你还没配 `DATABASE_URL`

### 这正常吗？

非常正常。

因为今天我们只是：

> **把前端网站跑起来**

如果你当前项目已经强依赖数据库，那它在 Vercel 上第一次运行报错也很常见。

这不代表路线错了，只代表：

> 下一步该做数据库接入了。

---

## 情况 3：Vercel 找不到你的仓库

### 原因
- GitHub 没授权给 Vercel
- 你推送没成功
- 你选错 GitHub 账号了

### 检查顺序
1. 回 GitHub，确认仓库里真的有代码
2. 回 Vercel，看 GitHub Integration 是否已连接
3. 必要时重新授权 GitHub 给 Vercel

---

# 第 11 章：今天完成的标志是什么？

你今天真正完成，不是“Vercel 账号注册好了”，而是下面这件事：

- [ ] GitHub 上能看到你的项目代码
- [ ] Vercel 里能看到这个项目
- [ ] Vercel 已经部署成功
- [ ] 你打开 `xxx.vercel.app` 能看到页面

只要这 4 条都达成，今天就成功了。

---

# 第 12 章：今天结束后，你得到了什么？

你现在得到了两样极其关键的东西：

## 1. 一个远端代码仓库

代码不再只在你电脑里了。

## 2. 一个能在互联网上打开的网站

虽然可能还是临时地址、可能还没接数据库、可能还没接邮件。

但它已经是：

> **别人真的可以访问的网站。**

这一步对新手特别重要，因为它会让你第一次明确感受到：

> “原来上线不是一团黑魔法，它是可以拆成一小步一小步的。”

---

# 第 13 章：下一步应该做什么？

下一步最合理的是：

## 《第 04 篇：把本地 SQLite 切换到 Neon，让线上网站真正有数据库》

因为你现在的网站虽然可能已经跑起来了，但如果要：

- 真的登录
- 保存文章
- 保存反馈
- 保存学习进度

你必须接上数据库。

第 04 篇就应该教：

- `DATABASE_URL` 是什么
- Neon 那串连接怎么放进环境变量
- Vercel 上环境变量在哪里配
- Prisma migration 怎么跑
- seed 怎么跑
- 怎么验证线上数据库真的连上了

---

## 最后一段

今天你做成了一件很多人没意识到的事：

> 你第一次把“只在自己电脑里能跑的项目”，推进到了“互联网上能访问”的阶段。

这不是小事。

接下来我们只要继续把：

- 数据库
- 邮件
- 域名

一层一层接上去，
你的网站就真的活起来了。
