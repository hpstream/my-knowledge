# AI 改图脚本到底在做什么？

> 用大白话讲清楚"端点"是什么、整个流程在干嘛、每个参数起什么作用。

---

## 1. 先搞懂"端点"是个啥

**端点（endpoint）= 服务器上一个具体的入口**。

可以把 AI 服务想成一栋大楼，每层有不同的窗口：

| 窗口（端点） | 干啥的 |
|---|---|
| `/v1/images/generations` | 文生图：你写一句话，他画一张图 |
| `/v1/images/edits` | 改图：你**给他一张已有的图**，再写一句话告诉他怎么改 |
| `/v1/chat/completions` | 聊天：发消息，他回消息 |

整个 URL 就是「**地址 + 窗口名**」：

```
https://fufei.mossx.ai  /v1/images/edits
└──── 哪栋大楼 ────┘ └─── 哪个窗口 ───┘
```

> 👉 同一栋大楼可以有 100 个窗口。我们脚本默认走"文生图"那个，加 `--edit` 就改成走"改图"那个。

---

## 2. 这次到底干了什么

任务：**把第一张图的狗，放到第二张图中间，替换那只猫**。

整个流程像这样：

```
[1] 你在本地有两张图：
    img/狗.jpg   ← 站着的小狗
    img/猫.webp  ← 一堆猫，中间有只大猫

[2] 你运行脚本：
    python scripts/1.py "把狗换到中间替换猫" --edit -i 狗.jpg -i 猫.webp -o 结果.png

[3] 脚本干的事：
    a. 把两张图打开，读成字节流（就是把照片变成 0101 数据）
    b. 把图 + 提示词 + 模型名 一起打包，通过 HTTP 发给服务器
       发的目的地：https://fufei.mossx.ai/v1/images/edits
       请求里带着：
         - Authorization: 你的 API Key（证明你交过钱）
         - 文件：两张图
         - 文字：提示词 + 模型 + 出几张 + 多大尺寸

[4] 服务器干的事：
    a. 把请求转给 AI 模型 gpt-image-2
    b. AI 看图、读提示词、理解你想干啥
    c. AI 生成一张新图（狗替换了猫，其他保留）
    d. 把新图编码成 base64 字符串，塞进 JSON 返回给你

[5] 脚本干的事（收到响应后）：
    a. 把 base64 字符串解码回字节
    b. 写到你指定的文件路径 img/dog-replaces-cat.png

[6] 你在文件夹里看到新图 ✓
```

---

## 3. 完整调用命令

```bash
scripts/.venv/bin/python scripts/1.py \
  "Take the cute dog from the first image, and seamlessly composite it into the second image to replace the cat at the center. Preserve the exact composition, lighting, background, and other cats from the second image." \
  --edit \
  -i "img/73451780835868_.pic.jpg" \
  -i "img/猫咪高清版 (2).webp" \
  -o img/dog-replaces-cat.png \
  --timeout 240
```

---

## 4. 每个参数干嘛的

### 4.1 给脚本的参数

| 参数 | 是啥 | 这次填了啥 | 作用 |
|---|---|---|---|
| 第一个位置参数（无 flag） | 提示词 | "Take the cute dog…" | **告诉 AI 你想让结果长啥样**。这是最关键的一句话 |
| `--edit` | 开关 | 加上了 | 切换到"改图"模式。**不加就是从无到有画**，加了就是基于参考图改 |
| `-i` | 参考图路径 | 狗.jpg 和 猫.webp | **AI 要看的图**。可以传多张，每张都用一次 `-i` |
| `-o` | 输出路径 | `img/dog-replaces-cat.png` | **新图存哪里**。不写就默认 `output.png` |
| `--timeout` | 超时秒数 | 240（4 分钟） | AI 画图慢，**等多久就放弃**。默认 180，复杂场景调到 240 比较稳 |

### 4.2 没写但有默认值的参数

| 参数 | 默认值 | 作用 |
|---|---|---|
| `-n` / `--count` | 1 | 一次出几张图 |
| `-s` / `--size` | `1024x1024` | 图的尺寸 |
| `--model` | `gpt-image-2` | 用哪个 AI 模型 |
| `--url` | mossx 内置 | 服务器地址 |

---

## 5. 这些参数到了 AI 那边变成什么

服务器把你的请求拆开后，**AI 实际看到的是这样**：

```
🤖 AI 你好，我接到一个改图任务：

📷 用户给我看了 2 张图：
   - 图 1（狗.jpg）：一只可爱的小狗坐姿
   - 图 2（猫.webp）：一群猫围成一团，中间是只大猫

📝 用户说：
   "把第一张图的小狗，无缝合成到第二张图里，
    替换掉中间那只猫。保留原本的构图、光照、其他猫。
    狗要按正常比例坐进去，光照要匹配。"

📏 出图要求：
   - 一张（n=1）
   - 1024x1024 大小
   - 用 gpt-image-2 模型出
   - 4 分钟内出完
```

**AI 的工作步骤**：

1. 看图 1 学"这只狗长什么样"
2. 看图 2 学"这个场景什么样、中间猫在哪个位置"
3. 在脑子里把中间那只猫"擦掉"
4. 把图 1 那只狗"画"到擦掉的位置，调整大小和光照
5. 输出最终图

**AI 出图返回的内容**：

```json
{
  "data": [
    { "b64_json": "iVBORw0KGgoAAAANSUh..." }   // 一长串字符串就是图
  ]
}
```

脚本把这串字符串解码（`base64.b64decode`），就是 PNG 文件的原始字节，存盘就是 .png 图片。

---

## 6. 怎么调整提示词让效果更好

提示词写得越精确，AI 越知道你想干啥。**改图提示词的 3 段式**：

```
[要改成什么]  +  [保留什么]  +  [质感要求]
```

| 段 | 你这次写的 |
|---|---|
| 要改成什么 | "Take the cute dog from the first image, … replace the cat at the center" |
| 保留什么 | "Preserve the exact composition, lighting, background, and other cats from the second image" |
| 质感要求 | "Realistic high quality" |

**如果效果不满意，调这三段就行**：

- **比例不对** → 在"质感"加一句 `dog should be the same size as the cat it replaces`
- **狗的姿势变了** → 在"要改成什么"加 `keep the dog's exact pose from image 1`
- **整体太糊** → 在"质感"加 `sharp focus, high detail`
- **改了其他东西** → 在"保留什么"再强调一遍 `do NOT change any other cat`

---

## 7. 常见报错和原因

| 错误信息 | 原因 | 怎么修 |
|---|---|---|
| `unsupported MIME type` | 上传图片时没说清楚格式 | 脚本里已处理（自动识别 .jpg/.png/.webp） |
| 524 Cloudflare timeout | AI 出图太久，被中间网关掐了 | 把 `--timeout` 调大，或简化提示词 |
| 401 Unauthorized | API Key 错了 / 没钱了 | 检查 `.env` 里 `IMAGE_API_KEY` |
| 没有 `data` 字段 | 服务器抽风 | 重试一次 |

---

## 8. 一句话总结

> **端点** = 服务器上的一个具体入口。
> 文生图走 `/images/generations`，改图走 `/images/edits`。
> 脚本就是把"你想干啥"打包成 HTTP 请求，发给对应的入口，
> 收到 AI 返回的图，存到本地。

参数都是给 AI 的**指令**：
- 提示词告诉 AI **要做什么**
- 参考图告诉 AI **看哪些素材**
- size / n / model 告诉服务器 **怎么出货**
- API Key 证明 **你是付费用户**

---

# 第二部分：请求参数大全

每次发 HTTP 请求都带一堆字段，下面把**全部参数**都列清楚。

## 9. 文生图 `/v1/images/generations` 全部参数

**发请求时是 JSON 格式**：

```json
{
  "model": "gpt-image-2",
  "prompt": "一只橘色小猫，水彩插画风格",
  "n": 1,
  "size": "1024x1024"
}
```

### 完整字段表

| 字段 | 必填？ | 例子 | 干嘛的 |
|---|---|---|---|
| `model` | ✅ 必填 | `"gpt-image-2"` | 用哪个模型出图。不同模型画风、价钱、速度都不一样 |
| `prompt` | ✅ 必填 | `"一只橘色小猫"` | 提示词，**告诉 AI 你要啥**。**核心，决定 80% 的结果** |
| `n` | 选填，默认 1 | `4` | 一次出几张。1-10 之间 |
| `size` | 选填 | `"1024x1024"` | 图的尺寸。常见：`1024x1024`（方）、`1792x1024`（横屏）、`1024x1792`（竖屏） |
| `response_format` | 选填，默认 `b64_json` | `"url"` | AI 返回**图片本体**还是**临时链接**。后面会讲 |
| `quality` | 选填 | `"high"` 或 `"standard"` | 画质。`high` 更精但贵 |
| `style` | 选填 | `"vivid"` 或 `"natural"` | 风格调性。`vivid` 鲜艳，`natural` 写实（仅 DALL-E 3 支持） |
| `user` | 选填 | `"user_123"` | 标识是谁调的，用来追踪滥用。我们的脚本不用 |

### 重点解释

**`response_format` 是什么意思？**

AI 出图后，把图给你有两种方式：

```
方式 A：response_format = "b64_json"
  AI 把图编码成超长字符串塞进 JSON 直接给你
  优点：拿到即用，不依赖外部链接
  缺点：JSON 包很大（一张 1024x1024 大概 1-3 MB 文字）

方式 B：response_format = "url"
  AI 把图先存到自己服务器，给你一个临时下载链接（通常 24 小时失效）
  优点：JSON 小，传输快
  缺点：链接会过期，必须及时下载存自己服务器
```

> 👉 我们脚本两种都能处理（看 `save_image()` 函数），但默认走 b64_json 最稳。

**`quality` 区别有多大？**

- `standard`：8-12 秒，价格 $0.02 / 张
- `high`：20-30 秒，价格 $0.04 / 张

> 👉 出着玩用 standard，正式封面用 high。

---

## 10. 图生图 `/v1/images/edits` 全部参数

**发请求时是 multipart/form-data 格式**（因为要传文件），不是 JSON。

```
POST /v1/images/edits
Content-Type: multipart/form-data

model=gpt-image-2
prompt=把第一张图的狗放到第二张图中间替换猫
n=1
size=1024x1024
image[]=<二进制图片 1>
image[]=<二进制图片 2>
```

### 完整字段表

| 字段 | 必填？ | 例子 | 干嘛的 |
|---|---|---|---|
| `model` | ✅ 必填 | `"gpt-image-2"` | 同上 |
| `image` 或 `image[]` | ✅ 必填 | 文件 | 参考图。**最少 1 张，gpt-image 支持最多 16 张** |
| `prompt` | ✅ 必填 | `"用第一张的狗替换第二张中间的猫"` | 告诉 AI 怎么改 |
| `mask` | 选填 | 一张 png | **白色区域 = 保留**，**黑色透明区域 = 让 AI 改**。这是"局部重画"的关键 |
| `n` | 选填，默认 1 | `4` | 出几张 |
| `size` | 选填 | `"1024x1024"` | 尺寸 |
| `response_format` | 选填，默认 `b64_json` | `"url"` | 同上 |
| `user` | 选填 | `"user_123"` | 同上 |

### 文生图 vs 图生图 的核心区别

| 维度 | 文生图 | 图生图 |
|---|---|---|
| **要不要给图** | ❌ 不用 | ✅ 至少 1 张 |
| **请求格式** | JSON | multipart/form-data（因为要传文件） |
| **AI 干啥** | 从无到有画一张 | 看你给的图，按提示词改 |
| **prompt 怎么写** | 描述**要画的东西** | 描述**怎么改、保留什么** |
| **典型用途** | 出封面、出原创素材 | 换主体、改风格、扩图、补图 |

### `mask`（遮罩）是什么神奇东西？

如果你想**精确控制"只改某一块"**，用 mask：

```
原图：一张猫坐在沙发上
mask（黑白图，和原图同样大小）：
    沙发部分 = 白色（保留）
    猫的部分 = 透明（让 AI 重画）
prompt: "一只狗"
结果：沙发不变，猫被换成狗
```

> 👉 没传 mask 时，AI 自己决定改哪里（不太可控）
> 👉 传 mask 时，AI 严格只改你标透明的地方（可控但要会画 mask）

---

## 11. 还有第三种：`/v1/images/variations`（变体）

> 给一张图，**不写提示词**，让 AI 出几张相似的"姐妹版"。

### 完整字段表

| 字段 | 必填？ | 例子 | 干嘛的 |
|---|---|---|---|
| `image` | ✅ 必填 | 一张图 | 要变体的原图 |
| `n` | 选填 | 4 | 出几个变体 |
| `size` | 选填 | `"1024x1024"` | 尺寸 |
| `response_format` | 选填 | `"b64_json"` | 同上 |

> ⚠️ **没有 `prompt` 字段**！这是和图生图最大的区别。

### 文生图 / 图生图 / 变体 三兄弟对比

| 模式 | 端点 | 给什么 | 干啥 |
|---|---|---|---|
| **文生图** | `/images/generations` | 只有文字 | 凭空画 |
| **图生图** | `/images/edits` | 文字 + 图（+ 可选 mask） | 按文字改图 |
| **变体** | `/images/variations` | 只有图 | 出"差不多的姐妹版" |

> 实际用得最多的是前两个。变体偶尔用：「这张图我喜欢，再来 3 张差不多的让我挑」。

---

## 12. 都用了哪些 HTTP Header

不管哪个端点，每次请求都必须带这俩 header：

| Header | 例子 | 干嘛的 |
|---|---|---|
| `Authorization` | `Bearer sk-xxxxxx` | **证明你是谁、有没有付费**。每次都要带 |
| `Content-Type` | `application/json` 或 `multipart/form-data; boundary=...` | **告诉服务器请求体是啥格式**。文生图是 JSON，图生图/变体是 multipart |

> 👉 multipart 那个 boundary 不用你自己写，`requests` 库会自动拼。所以 Python 里**不要手动设 multipart 的 Content-Type**，让库自己来。

---

## 13. 服务器返回的格式

不管哪个端点，**返回都是同样的 JSON 结构**：

```json
{
  "created": 1717734567,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhE..."   // 一长串字符串
      // 或者：
      // "url": "https://temp.openai.com/xxx.png"
      // 或者两个都有
    },
    {
      "b64_json": "..."   // 第二张图，如果 n>1
    }
  ]
}
```

### 字段含义

| 字段 | 干嘛的 |
|---|---|
| `created` | 时间戳，秒级。**没啥用，给日志看的** |
| `data` | 一个数组，每张图占一个元素 |
| `data[i].b64_json` | 图片本体的 base64 编码字符串（拿来 decode 就是 PNG 字节） |
| `data[i].url` | 图片的临时下载链接 |
| `data[i].revised_prompt`（仅 DALL-E 3） | AI 把你的提示词改写成更清晰的版本。**有助于调 prompt** |

---

## 14. 错误返回长啥样

请求失败时，HTTP 状态码 ≠ 200，body 是这样：

```json
{
  "error": {
    "message": "Invalid 'image' parameter: file too large",
    "type": "invalid_request_error",
    "code": "file_too_large",
    "param": "image"
  }
}
```

### 常见错误码对照

| 状态码 | code | 大概意思 | 怎么修 |
|---|---|---|---|
| 400 | `invalid_request_error` | 请求参数填错 | 看 `message` 里说哪个参数错了 |
| 401 | `invalid_api_key` | API Key 错了 | 检查 `.env` 里 `IMAGE_API_KEY` |
| 403 | `insufficient_quota` | 余额不够 | 充钱 |
| 413 | `file_too_large` | 图太大 | 压缩或裁剪后再传 |
| 429 | `rate_limit_exceeded` | 请求太频繁 | 等几秒重试 |
| 500 | `server_error` | 服务器抽风 | 重试 |
| 524 | (Cloudflare) | 出图太慢被网关掐 | 调大 timeout 或简化提示词 |

---

## 15. 一张速查表

```
                  ┌────────────────────────┐
                  │  我要干啥？             │
                  └───┬───────────┬────────┘
                      │           │
              凭空画一张？    改一张已有的图？
                  │                 │
        ┌─────────┘                 └─────────┐
        │                                     │
        ▼                                     ▼
  /images/generations                  /images/edits
  必填：model + prompt                必填：model + prompt + image
  选填：n, size, quality, style       选填：n, size, mask
  请求格式：JSON                       请求格式：multipart
        │                                     │
        └──────────────┬──────────────────────┘
                       ▼
            ┌──────────────────────┐
            │ 返回 JSON：           │
            │ { data: [ {b64_json} │
            │           {b64_json} │
            │         ] }          │
            └──────────────────────┘
                       │
                       ▼
            脚本把 b64_json 解码 → 写到本地 .png
```

---

## 16. 总结口诀

- **文生图：只发字，给我画** → `generations`
- **图生图：发字+发图，按字改图** → `edits`
- **变体：只发图，给我姐妹版** → `variations`
- **所有响应**：JSON 里 `data` 数组，每张图给你 b64 字符串
- **失败时**：看 `error.message` 找原因，按 HTTP 状态码定位类型

---

# 第三部分：同一套 API 还能干很多事

讲了半天画图，其实同一个 API Key、同一套协议，能干的事远不止画图。

## 17. 完整端点全家桶

| 类别 | 端点 | 干嘛的 |
|---|---|---|
| **图像** | `/v1/images/generations` | 文生图（讲过） |
| | `/v1/images/edits` | 图生图（讲过） |
| | `/v1/images/variations` | 变体（讲过） |
| **文本/聊天** | `/v1/chat/completions` | **跟 GPT 聊天**。最常用，做 ChatGPT 那种对话框 |
| | `/v1/responses` | 新版统一接口，集成工具调用、长任务 |
| | `/v1/completions` | 老版本补全（基本被淘汰） |
| **向量** | `/v1/embeddings` | **文字→向量**。做语义搜索、RAG 必用 |
| **音频** | `/v1/audio/transcriptions` | **语音→文字**（Whisper） |
| | `/v1/audio/translations` | 语音翻译成英文 |
| | `/v1/audio/speech` | **文字→语音**（朗读） |
| **审核** | `/v1/moderations` | 检测是否含暴力/色情/仇恨 |
| **文件** | `/v1/files` | 上传文件给 AI 后续引用 |
| **微调** | `/v1/fine_tuning/jobs` | 用自己数据训练专属模型 |
| **批量** | `/v1/batches` | **离线批量任务**，价格打 5 折，但 24 小时内出结果 |
| **助手** | `/v1/assistants` / `/v1/threads` | 有状态的对话 Agent |

---

## 18. 图像 API 本身还有哪些"高级玩法"

| 玩法 | 怎么搞 | 适合 |
|---|---|---|
| **流式出图**（streaming） | 请求带 `stream: true`，AI 边生成边返回模糊版 | 用户体验好，看着图慢慢清晰 |
| **批量出图**（Batch API） | 把多个请求扔 jsonl 文件 → 上传 → 24h 内出货 | 一次跑 100 张，省一半钱 |
| **Mask 局部重画** | 上传 mask 图，黑色区域 = 让 AI 改 | 精确换衣服、换脸、补天空 |
| **Outpainting 扩图** | 给原图 + 透明边缘的 mask | 把 1:1 图扩成 16:9 |
| **多张参考图融合** | edits 端点传多张图 | 我们刚才做的就是 |

---

## 19. 真实组合场景

单个端点没意思，**真正项目里都是多个端点串起来用**：

| 任务 | 用到哪些端点 |
|---|---|
| **RAG 问答**（文档库 + 提问）| embeddings + chat/completions |
| **AI 配音视频** | audio/speech（朗读）+ images/generations（封面） |
| **客服机器人** | chat/completions + moderations（过滤脏话） |
| **PPT 一键生成** | chat/completions（生成大纲）+ images/generations（每页配图） |
| **简历改图配文** | images/edits（改照片）+ chat/completions（生成文案） |
| **会议纪要** | audio/transcriptions（录音转文字）+ chat/completions（总结） |

---

## 20. 最终一句话

> **图像那 3 个端点只是冰山一角。**
>
> 同一套 API、同一个 Key，可以画图、聊天、生成向量、转写语音、生成音频。
> 全部用一样的协议（HTTP + Bearer Token + JSON），**切端点和参数就行**。
>
> 真正强大的产品都是**多端点组合**——一个调用搞一件事，串起来能干 90% 的 AI 应用场景。

---

# 第四部分：Claude / Claude Code 能画图吗？

> 上面讲的 `images/generations` 是 **OpenAI（GPT 系列）** 的 API。
> 那 **Claude（Anthropic）和 Claude Code** 能不能画图？容易混淆，单独讲清楚。

## 21. 先分清两个东西

| 名字 | 是啥 |
|---|---|
| **Claude** | Anthropic 家的 AI **模型**（类比 GPT-4） |
| **Claude Code** | Anthropic 出的**命令行工具**（类比你装的 ChatGPT 网页版），里面跑的还是 Claude 模型 |

> Claude Code 不是新模型，**只是一个驱动 Claude 干活的壳子**。

---

## 22. Claude 能不能画图？

**不能。**

Anthropic 至今**没有官方的图像生成模型**，所以：

| 能力 | Claude | GPT | Gemini |
|---|---|---|---|
| **看图**（vision，分析图片内容）| ✅ 一流 | ✅ | ✅ |
| **画图**（生成新图）| ❌ **没有这个 API** | ✅（DALL-E / gpt-image）| ✅（Imagen）|

具体差异：
- GPT API 有 `/v1/images/generations`，发提示词就能画
- **Claude API 完全没有画图端点**，发图给它只能让它"描述/分析"

---

## 23. Claude Code 怎么"画图"的？

虽然 Claude 本身画不了，**Claude Code 可以驱动别的工具来画**：

```
你说：帮我画一只猫
  ↓
Claude Code 想：我画不了，但我能跑命令
  ↓
Claude Code 决定运行：python scripts/1.py "a cute cat"
  ↓
脚本调 mossx 的 gpt-image-2 接口（这才是真正的画图 API）
  ↓
拿到图，存到本地
  ↓
Claude Code 告诉你：图存在 cat.png
```

**关键**：Claude Code = 指挥官，**不是画师**。它通过 **Bash 工具**调用别人的画图 API，再把结果汇报给你。

> 我们这次做的就是这个流程：Claude Code 帮你写脚本、改脚本、跑脚本，**但真正出图的是 OpenAI 兼容接口**（gpt-image-2）。

---

## 24. 实用对照

| 你想干啥 | 用啥最爽 |
|---|---|
| 让 AI **写代码 / 改代码 / 分析代码** | **Claude Code**（顶级） |
| 让 AI **画图 / 改图** | OpenAI / 国内 mossx / 智谱 / 通义 |
| 让 AI **看一张截图分析里面的问题** | Claude 也行，GPT 也行 |
| **组合**：让 AI 自动画图配合写文章 | Claude Code 写文 + 脚本调画图 API |

---

## 25. 你现在干的就是组合用法

```
       ┌────────────────────┐
       │   你（人）           │
       └────┬───────────────┘
            │ 提需求
            ▼
       ┌──────────────────┐
       │  Claude Code     │ ← 帮你写脚本、改代码、跑命令
       │  （Claude 模型）  │
       └────┬─────────────┘
            │ 通过 Bash 工具
            ▼
       ┌──────────────────┐
       │  scripts/1.py    │ ← 用 Python 调 API
       └────┬─────────────┘
            │ HTTP 请求
            ▼
       ┌──────────────────┐
       │  fufei.mossx.ai  │ ← 真正的画图服务
       │  (gpt-image-2)   │
       └────┬─────────────┘
            │ 返回图
            ▼
        img/output.png
```

每一层各司其职：
- **Claude Code**：理解需求、写脚本、跑命令
- **Python 脚本**：处理参数、发 HTTP 请求、存文件
- **mossx**：真正用 AI 生成图像

---

## 26. 总结口诀

- **Claude（模型）**：会看图，不会画图
- **Claude Code（工具）**：通过 Bash 调别的画图 API 间接画
- **GPT / DALL-E**：自己能画
- **正确用法**：Claude Code 写代码 + 通过脚本调 OpenAI 兼容画图 API

> **永远不要去搜"Claude 画图 API"——压根不存在。**

