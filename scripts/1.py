#!/usr/bin/env python3
"""
图像生成命令行工具。

用法:
    python scripts/1.py "a cute cat"
    python scripts/1.py "封面：山间日出" -o cover.png
    python scripts/1.py "未来都市" -n 3 -s 1024x1024 --model gpt-image-2

环境变量 (从项目根目录 .env 读取):
    IMAGE_API_KEY   必填，API key
    IMAGE_API_URL   选填，默认 https://fufei.mossx.ai/v1/images/generations
"""

from __future__ import annotations

import argparse
import base64
import os
import sys
from pathlib import Path

import requests


DEFAULT_URL = "https://fufei.mossx.ai/v1/images/generations"
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
        "--url",
        default=None,
        help="覆盖 API URL（默认读 IMAGE_API_URL 或内置默认）",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=180,
        help="请求超时秒数，默认 180",
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


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    load_env(project_root / ".env")

    args = parse_args()

    api_key = os.environ.get("IMAGE_API_KEY")
    if not api_key:
        print("错误: 缺少环境变量 IMAGE_API_KEY，请在 .env 中配置。", file=sys.stderr)
        return 1

    url = args.url or os.environ.get("IMAGE_API_URL") or DEFAULT_URL

    try:
        resp = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": args.model,
                "prompt": args.prompt,
                "n": args.count,
                "size": args.size,
            },
            timeout=args.timeout,
        )
        resp.raise_for_status()
    except requests.HTTPError as e:
        print(f"请求失败 [{resp.status_code}]: {resp.text}", file=sys.stderr)
        return 2
    except requests.RequestException as e:
        print(f"网络错误: {e}", file=sys.stderr)
        return 3

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
