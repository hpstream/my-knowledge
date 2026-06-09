#!/usr/bin/env python3
"""
列出当前 API key 能访问的所有模型。

用法:
    # 全部模型
    python scripts/list_models.py

    # 只看名字里含 "gpt" 的
    python scripts/list_models.py --filter gpt

    # 输出原始 JSON（方便管道处理）
    python scripts/list_models.py --json

环境变量 (从项目根目录 .env 读取，两个都必填):
    IMAGE_API_KEY   API key
    IMAGE_API_URL   任何带 /v1 前缀的端点 URL；脚本会自动截到 /v1，再拼 /v1/models
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import requests


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
        description="列出当前 API key 能访问的模型。",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--filter",
        "-f",
        default=None,
        help="按子串过滤模型名（大小写不敏感）",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="直接输出原始 JSON",
    )
    parser.add_argument(
        "--url",
        default=None,
        help="覆盖 base URL，例如 https://api.openai.com",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="请求超时秒数，默认 30",
    )
    return parser.parse_args()


def derive_models_url(base_or_endpoint: str) -> str:
    """
    无论传进来的是 base、/v1、还是 /v1/images/generations，
    都能正确推出 /v1/models。
    """
    parts = urlsplit(base_or_endpoint)
    path = parts.path or ""

    # 如果路径里已经有 /v1，就截到 /v1 为止
    if "/v1" in path:
        head, _, _ = path.partition("/v1")
        new_path = f"{head}/v1/models"
    else:
        # 否则当成 base，自己拼
        new_path = path.rstrip("/") + "/v1/models"

    return urlunsplit((parts.scheme, parts.netloc, new_path, "", ""))


def fmt_ts(epoch: int | None) -> str:
    if not epoch:
        return "—"
    try:
        return datetime.fromtimestamp(epoch, tz=timezone.utc).strftime("%Y-%m-%d")
    except (OSError, ValueError, OverflowError):
        return "—"


def print_table(models: list[dict]) -> None:
    if not models:
        print("（没有模型）")
        return

    rows = [
        (
            str(m.get("id", "")),
            str(m.get("owned_by", "")),
            fmt_ts(m.get("created")),
        )
        for m in models
    ]
    id_w = max(len("model"), max(len(r[0]) for r in rows))
    owner_w = max(len("owned_by"), max(len(r[1]) for r in rows))

    head = f"{'model'.ljust(id_w)}  {'owned_by'.ljust(owner_w)}  {'created'}"
    bar = "-" * len(head)
    print(head)
    print(bar)
    for row_id, owner, created in rows:
        print(f"{row_id.ljust(id_w)}  {owner.ljust(owner_w)}  {created}")
    print(bar)
    print(f"共 {len(rows)} 个模型")


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    load_env(project_root / ".env")

    args = parse_args()

    api_key = os.environ.get("IMAGE_API_KEY")
    if not api_key:
        print(
            "错误: 缺少环境变量 IMAGE_API_KEY，请在 .env 中配置。",
            file=sys.stderr,
        )
        return 1

    base = args.url or os.environ.get("IMAGE_API_URL")
    if not base:
        print(
            "错误: 缺少环境变量 IMAGE_API_URL，请在 .env 中配置（或用 --url 覆盖）。",
            file=sys.stderr,
        )
        return 1
    models_url = derive_models_url(base)

    try:
        resp = requests.get(
            models_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=args.timeout,
        )
    except requests.RequestException as e:
        print(f"网络错误: {e}", file=sys.stderr)
        return 3

    if resp.status_code == 401:
        print(
            "401 未授权: API key 无效，或没有 /v1/models 权限。",
            file=sys.stderr,
        )
        return 4
    if resp.status_code == 404:
        print(
            f"404 未找到: 这个网关可能没有开放 /v1/models 接口。\n  请求地址: {models_url}",
            file=sys.stderr,
        )
        return 5
    if not resp.ok:
        print(
            f"请求失败 [{resp.status_code}]: {resp.text}",
            file=sys.stderr,
        )
        return 2

    try:
        payload = resp.json()
    except ValueError:
        print(f"返回不是合法 JSON: {resp.text[:500]}", file=sys.stderr)
        return 6

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    models = payload.get("data") or []
    if not isinstance(models, list):
        print(
            f"返回结构不是 OpenAI 格式（缺少 data 数组）: {payload}",
            file=sys.stderr,
        )
        return 7

    if args.filter:
        needle = args.filter.lower()
        models = [m for m in models if needle in str(m.get("id", "")).lower()]

    # 按模型名排序，看起来清爽
    models.sort(key=lambda m: str(m.get("id", "")))

    print(f"请求地址: {models_url}")
    print()
    print_table(models)
    return 0


if __name__ == "__main__":
    sys.exit(main())
