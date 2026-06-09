# scripts/ 使用速查

> 项目根目录跑命令。前置已就绪：`.venv/` 已建好，`.env` 里有 `IMAGE_API_KEY` 和 `IMAGE_API_URL`。
>
> ```bash
> cd /Users/hpstream/Desktop/code/my-knowledge
> ```

---

## 1. 文生图

走 `/v1/images/generations` 端点。默认模型 `gpt-image-2`。

```bash
.venv/bin/python scripts/1.py \
  "一只布偶猫坐在窗台上，阳光从左侧斜射进来，背景是模糊的绿色树叶，写实风格，高细节" \
  -o img/output-cat.png \
  -s 1024x1024
```

- 改提示词：换双引号里的中文
- 改输出位置：换 `-o` 后面的路径
- 改尺寸：`-s 1024x1024`（正方）/ `1024x1536`（竖版）/ `1536x1024`（横版）
- 一次出多张：加 `-n 3`，自动生成 `output-cat-1.png` / `output-cat-2.png` / `output-cat-3.png`
- 想看更慢/更高质量：加 `--quality high`（默认 auto）

---

## 2. 图生图 / 改图

走 `/v1/images/edits` 端点。**必须显式用 `--model gpt-image-1`**（这家 key 上 `gpt-image-2` 的 edit 端点不可用，会 524/429）。

```bash
.venv/bin/python scripts/1.py \
  "放一只狗在图片中" \
  --edit \
  -i img/7051780876285_.pic.jpg \
  --model gpt-image-2 \
  --stream --partial-images 2 \
  -s 1024x1024 \
  -o img/output-edited.png
```

- `--edit` 切到改图模式（没这个就是文生图）
- `-i` 参考图路径；想传**多张**就写多次：`-i 图1.png -i 图2.jpg`
- `--stream --partial-images 2` 流式接收 SSE，保连接活着，防 Cloudflare 100 秒掐断
- 其他参数（`-s`、`-o`、`-n`、`--quality`）跟文生图一样

---

## 3. 查看 key 能用哪些模型

```bash
.venv/bin/python scripts/list_models.py
```

加过滤：

```bash
.venv/bin/python scripts/list_models.py --filter image
.venv/bin/python scripts/list_models.py --filter dall
```

---

## 4. 本地像素级对调两个矩形（不调接口）

```bash
# 先生成带坐标网格的预览
.venv/bin/python scripts/swap_regions.py img/原图.jpg --grid

# 再按预览读出的坐标做对调（x,y,w,h）
.venv/bin/python scripts/swap_regions.py img/原图.jpg \
  --a 560,400,160,360 \
  --b 880,400,160,360 \
  -o img/swapped.jpg
```

---

## 5. 常见坑

| 现象                                              | 原因                              | 处理                                                        |
| ------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
| `ModuleNotFoundError: No module named 'requests'` | 用了系统 Python                   | 改用 `.venv/bin/python`，不要用 `python3`                   |
| 504 / Cloudflare 524 (HTML)                       | 图生图 + `gpt-image-2` + 这家网关 | 换 `--model gpt-image-1`，并加 `--stream`                   |
| `429 Rate limit exceeded`                         | 配额超限                          | 等几分钟；如果一直 429 说明 key 上该模型没配额              |
| `403` / `401`                                     | key 错或没传                      | 看 `.env` 里 `IMAGE_API_KEY` 是不是空、是不是 `re_xxx` 占位 |
| 没传 `-o` 输出到哪                                | 默认 `output.png`（项目根）       | 显式写 `-o img/xxx.png`                                     |

---

## 6. 改环境变量

`.env` 里两条都得有：

```env
IMAGE_API_KEY=sk-...               # 你的 key
IMAGE_API_URL=https://xxx.com      # 网关 base URL（不用带 /v1/images/generations 后缀，脚本会自己拼）
```

可以直接换成另一家网关 base URL，再跑上面的命令，不用改脚本。
