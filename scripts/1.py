#!/usr/bin/env python3
"""
图像生成命令行工具，支持文生图 + 图像编辑（多参考图）。

用法:
    # 文生图
    python scripts/1.py "a cute cat"
    python scripts/1.py "封面：山间日出" -o cover.png

    # 图像编辑（用参考图 + 提示词生成新图）
    python scripts/1.py "把第一张图的狗放到第二张图中间替换猫" \
        --edit -i img/dog.jpg -i img/cats.webp -o out.png

环境变量 (从项目根目录 .env 读取，两个都必填):
    IMAGE_API_KEY   API key
    IMAGE_API_URL   图像生成端点完整 URL
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import requests


def derive_endpoint(base_or_full: str, endpoint_path: str) -> str:
    """
    无论 IMAGE_API_URL 填的是：
      - https://api.example.com               （根域名）
      - https://api.example.com/v1            （带版本）
      - https://api.example.com/v1/images/generations  （完整端点）
    都返回 https://api.example.com/v1/<endpoint_path>。
    endpoint_path 示例: "images/generations" / "images/edits" / "models"
    """
    parts = urlsplit(base_or_full)
    path = parts.path or ""

    if "/v1" in path:
        head, _, _ = path.partition("/v1")
        new_path = f"{head}/v1/{endpoint_path}"
    else:
        new_path = path.rstrip("/") + f"/v1/{endpoint_path}"

    return urlunsplit((parts.scheme, parts.netloc, new_path, "", ""))


DEFAULT_MODEL = "gpt-image-2"
DEFAULT_SIZE = "1024x1024"
DEFAULT_OUTPUT = "output.png"


def load_env(env_path: Path) -> None:
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="通过命令行调用图像生成 API。",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("prompt", help="提示词，例如：a cute cat")
    parser.add_argument(
        "-o",
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"输出文件路径，默认 {DEFAULT_OUTPUT}；多张图时自动加序号",
    )
    parser.add_argument(
        "-n",
        "--count",
        type=int,
        default=1,
        help="生成张数，默认 1",
    )
    parser.add_argument(
        "-s",
        "--size",
        default=DEFAULT_SIZE,
        help=f"尺寸，默认 {DEFAULT_SIZE}",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"模型名，默认 {DEFAULT_MODEL}",
    )
    parser.add_argument(
        "--quality",
        default=None,
        help="生成质量，例如 low / medium / high / auto；默认不传",
    )
    parser.add_argument(
        "--url",
        default=None,
        help="覆盖 API URL（默认读 .env 里的 IMAGE_API_URL）",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=180,
        help="请求超时秒数，默认 180",
    )
    parser.add_argument(
        "--stream",
        action="store_true",
        help="启用流式响应，边等边接收 SSE 事件，适合慢出图时避免网关长时间无响应",
    )
    parser.add_argument(
        "--partial-images",
        type=int,
        choices=range(0, 4),
        default=1,
        help="流式模式下请求 0-3 张部分进度图，默认 1；设为 0 只流式返回最终图",
    )
    parser.add_argument(
        "--save-partials",
        action="store_true",
        help="流式模式下同时保存收到的部分进度图",
    )
    # 加 --edit 就是"改图模式"——把现有的图改一改，不是从无到有画
    parser.add_argument(
        "--edit",
        action="store_true",
        help="编辑模式，使用 /v1/images/edits 端点，必须配合 -i 参考图",
    )
    # -i 后面跟图片路径，要传多张就写多次：-i 第一张.jpg -i 第二张.webp
    parser.add_argument(
        "-i",
        "--image",
        action="append",
        default=[],
        help="参考图路径（可多次指定，仅在 --edit 模式下使用）",
    )
    return parser.parse_args()


def build_output_paths(base: str, count: int) -> list[Path]:
    base_path = Path(base)
    if count == 1:
        return [base_path]
    stem = base_path.stem
    suffix = base_path.suffix or ".png"
    parent = base_path.parent
    return [parent / f"{stem}-{i + 1}{suffix}" for i in range(count)]


def save_image(item: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if "b64_json" in item and item["b64_json"]:
        path.write_bytes(base64.b64decode(item["b64_json"]))
        return
    if "url" in item and item["url"]:
        resp = requests.get(item["url"], timeout=60)
        resp.raise_for_status()
        path.write_bytes(resp.content)
        return
    raise RuntimeError(f"返回数据中没有 b64_json 也没有 url: {item}")


def partial_output_path(base: str, index: int) -> Path:
    base_path = Path(base)
    suffix = base_path.suffix or ".png"
    return base_path.parent / f"{base_path.stem}.partial-{index}{suffix}"


def extract_image_items(value: object) -> list[dict]:
    def dedupe(items: list[dict]) -> list[dict]:
        unique = []
        seen: set[tuple[str | None, str | None]] = set()
        for item in items:
            key = (item.get("b64_json"), item.get("url"))
            if key in seen:
                continue
            seen.add(key)
            unique.append(item)
        return unique

    if isinstance(value, list):
        items: list[dict] = []
        for child in value:
            items.extend(extract_image_items(child))
        return dedupe(items)

    if not isinstance(value, dict):
        return []

    items = []
    if value.get("b64_json") or value.get("url"):
        items.append(value)
    if value.get("result"):
        items.append({"b64_json": value["result"]})
    if value.get("image_b64"):
        items.append({"b64_json": value["image_b64"]})
    if value.get("partial_image_b64"):
        items.append({"b64_json": value["partial_image_b64"]})

    for key in ("data", "images", "output"):
        items.extend(extract_image_items(value.get(key)))

    return dedupe(items)


def read_streamed_images(resp: requests.Response, output_base: str, save_partials: bool) -> list[dict]:
    final_items: list[dict] = []
    partial_count = 0
    event_name = ""
    data_lines: list[str] = []

    def handle_event(payload: str, event: str) -> None:
        nonlocal partial_count, final_items

        payload = payload.strip()
        if not payload or payload == "[DONE]":
            return

        try:
            obj = json.loads(payload)
        except json.JSONDecodeError:
            print(f"收到非 JSON 流式数据: {payload[:160]}", file=sys.stderr)
            return

        event_type = str(obj.get("type") or obj.get("event") or event or "")
        image_items = extract_image_items(obj)
        if not image_items:
            # 错误事件要把内部 message / error 内容打出来，否则我们根本看不到原因
            if "error" in event_type.lower() or obj.get("error"):
                err = obj.get("error") or obj
                msg = (
                    err.get("message")
                    if isinstance(err, dict)
                    else None
                )
                code = (
                    err.get("code")
                    if isinstance(err, dict)
                    else None
                )
                print(
                    f"流式错误事件 [{event_type}]: code={code} message={msg}",
                    file=sys.stderr,
                )
                print(
                    f"  原始 payload: {json.dumps(obj, ensure_ascii=False)[:500]}",
                    file=sys.stderr,
                )
            else:
                print(f"收到事件: {event_type or 'message'}")
            return

        is_partial = "partial" in event_type or obj.get("partial_image_b64")
        if is_partial:
            for item in image_items:
                partial_count += 1
                print(f"收到部分图: {partial_count}")
                if save_partials:
                    out_path = partial_output_path(output_base, partial_count)
                    save_image(item, out_path)
                    print(f"已保存部分图: {out_path}")
            return

        final_items.extend(image_items)
        print(f"收到最终图: {len(final_items)}")

    for raw_line in resp.iter_lines(decode_unicode=True):
        if raw_line is None:
            continue
        line = raw_line.strip()
        if not line:
            if data_lines:
                handle_event("\n".join(data_lines), event_name)
                event_name = ""
                data_lines = []
            continue
        if line.startswith(":"):
            continue
        if line.startswith("event:"):
            event_name = line.removeprefix("event:").strip()
            continue
        if line.startswith("data:"):
            data_lines.append(line.removeprefix("data:").strip())
            continue

        # 有些兼容服务商直接按 NDJSON 推送，不包 SSE data: 前缀。
        handle_event(line, event_name)

    if data_lines:
        handle_event("\n".join(data_lines), event_name)

    return final_items


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    load_env(project_root / ".env")

    args = parse_args()

    api_key = os.environ.get("IMAGE_API_KEY")
    if not api_key:
        print("错误: 缺少环境变量 IMAGE_API_KEY，请在 .env 中配置。", file=sys.stderr)
        return 1

    url = args.url or os.environ.get("IMAGE_API_URL")
    if not url:
        print(
            "错误: 缺少环境变量 IMAGE_API_URL，请在 .env 中配置（或用 --url 覆盖）。",
            file=sys.stderr,
        )
        return 1

    if args.edit:
        # === 改图模式：把参考图传上去，让 AI 按提示词改 ===

        # 用户加了 --edit 但没传图，直接报错
        if not args.image:
            print("错误: --edit 模式必须用 -i 至少指定一张参考图", file=sys.stderr)
            return 1
        # 检查每张图是不是真的存在，避免上传时才发现
        for img in args.image:
            if not Path(img).exists():
                print(f"错误: 参考图不存在: {img}", file=sys.stderr)
                return 1

        # 改图用的接口和文生图不一样，按 base 推出正确 /v1/images/edits
        edit_url = derive_endpoint(url, "images/edits")

        # 上传图片要告诉服务器"这是什么格式的图"
        # 服务器不接受"未知格式"，要明确写 png / jpg / webp
        mime_by_ext = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
        }

        # 把每张图打开，准备一起塞进 HTTP 请求里
        # 字段名写 "image[]" 是告诉服务器"我要传好几张"
        files = []
        opened = []  # 先记下打开的文件，最后统一关掉
        for img_path in args.image:
            ext = Path(img_path).suffix.lower()
            mime = mime_by_ext.get(ext, "image/png")
            f = open(img_path, "rb")
            opened.append(f)
            files.append(("image[]", (Path(img_path).name, f, mime)))

        # 除了图，还要告诉服务器：用哪个模型、提示词是什么、出几张、多大
        form = {
            "model": args.model,
            "prompt": args.prompt,
            "n": str(args.count),
            "size": args.size,
        }
        if args.quality:
            form["quality"] = args.quality
        if args.stream:
            form["stream"] = "true"
            form["partial_images"] = str(args.partial_images)

        try:
            # 发请求：图通过 files= 传，文字字段通过 data= 传
            resp = requests.post(
                edit_url,
                headers={"Authorization": f"Bearer {api_key}"},
                files=files,
                data=form,
                stream=args.stream,
                timeout=args.timeout,
            )
            resp.raise_for_status()
        except requests.HTTPError:
            print(f"请求失败 [{resp.status_code}]: {resp.text}", file=sys.stderr)
            return 2
        except requests.RequestException as e:
            print(f"网络错误: {e}", file=sys.stderr)
            return 3
        finally:
            # 不管成功失败，都把刚才打开的图片文件关掉，避免占用句柄
            for f in opened:
                f.close()
    else:
        try:
            payload = {
                "model": args.model,
                "prompt": args.prompt,
                "n": args.count,
                "size": args.size,
            }
            if args.quality:
                payload["quality"] = args.quality
            if args.stream:
                payload["stream"] = True
                payload["partial_images"] = args.partial_images

            resp = requests.post(
                derive_endpoint(url, "images/generations"),
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                stream=args.stream,
                timeout=args.timeout,
            )
            resp.raise_for_status()
        except requests.HTTPError:
            print(f"请求失败 [{resp.status_code}]: {resp.text}", file=sys.stderr)
            return 2
        except requests.RequestException as e:
            print(f"网络错误: {e}", file=sys.stderr)
            return 3

    if args.stream:
        data = read_streamed_images(resp, args.output, args.save_partials)
    else:
        data = resp.json().get("data") or []
    if not data:
        print(f"返回数据为空: {resp.text}", file=sys.stderr)
        return 4

    output_paths = build_output_paths(args.output, len(data))
    for item, out_path in zip(data, output_paths):
        try:
            save_image(item, out_path)
            print(f"已保存: {out_path}")
        except Exception as e:
            print(f"保存失败 {out_path}: {e}", file=sys.stderr)
            return 5

    return 0


if __name__ == "__main__":
    sys.exit(main())
