#!/usr/bin/env python3
"""
调用文本模型问一句话。

用法:
    # 默认调用 gpt-5.5，问 "你好"
    python scripts/ask_model.py

    # 指定问题或模型
    python scripts/ask_model.py "你好，你是谁？" --model gpt-5.5

    # 输出原始 JSON
    python scripts/ask_model.py --json

环境变量 (从项目根目录 .env 读取):
    IMAGE_API_KEY   必填，API key
    IMAGE_API_URL   选填，默认 https://fufei.mossx.ai/v1/images/generations
                    脚本会自动取它的 /v1 前缀，然后去拼 /v1/chat/completions
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import requests


DEFAULT_URL = "https://fufei.mossx.ai/v1/images/generations"
DEFAULT_MODEL = "gpt-5.5"
DEFAULT_PROMPT = "你好"


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
        description="调用文本模型问一句话。",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "prompt",
        nargs="?",
        default=DEFAULT_PROMPT,
        help=f"要问模型的话，默认 {DEFAULT_PROMPT}",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"模型名，默认 {DEFAULT_MODEL}",
    )
    parser.add_argument(
        "--url",
        default=None,
        help="覆盖 base URL，例如 https://api.openai.com",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="请求超时秒数，默认 60",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="直接输出原始 JSON",
    )
    return parser.parse_args()


def derive_chat_url(base_or_endpoint: str) -> str:
    """
    无论传进来的是 base、/v1、还是 /v1/images/generations，
    都能正确推出 /v1/chat/completions。
    """
    parts = urlsplit(base_or_endpoint)
    path = parts.path or ""

    if "/v1" in path:
        head, _, _ = path.partition("/v1")
        new_path = f"{head}/v1/chat/completions"
    else:
        new_path = path.rstrip("/") + "/v1/chat/completions"

    return urlunsplit((parts.scheme, parts.netloc, new_path, "", ""))


def extract_reply(payload: dict) -> str | None:
    choices = payload.get("choices")
    if not isinstance(choices, list) or not choices:
        return None

    first = choices[0]
    if not isinstance(first, dict):
        return None

    message = first.get("message")
    if not isinstance(message, dict):
        return None

    content = message.get("content")
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                parts.append(item["text"])
        return "\n".join(parts) if parts else None

    return None


def decode_response_text(resp: requests.Response) -> str:
    try:
        return resp.content.decode("utf-8")
    except UnicodeDecodeError:
        return resp.text


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

    base = args.url or os.environ.get("IMAGE_API_URL") or DEFAULT_URL
    chat_url = derive_chat_url(base)

    try:
        resp = requests.post(
            chat_url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": args.model,
                "messages": [{"role": "user", "content": args.prompt}],
            },
            timeout=args.timeout,
        )
    except requests.RequestException as e:
        print(f"网络错误: {e}", file=sys.stderr)
        return 3

    if not resp.ok:
        print(f"请求失败 [{resp.status_code}]: {decode_response_text(resp)}", file=sys.stderr)
        return 2

    try:
        payload = json.loads(decode_response_text(resp))
    except ValueError:
        print(f"返回不是合法 JSON: {decode_response_text(resp)[:500]}", file=sys.stderr)
        return 4

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    reply = extract_reply(payload)
    if reply is None:
        print(f"无法从返回中解析回复: {json.dumps(payload, ensure_ascii=False)}", file=sys.stderr)
        return 5

    print(f"请求地址: {chat_url}")
    print(f"模型: {args.model}")
    print(f"问题: {args.prompt}")
    print()
    print("回复:")
    print(reply)
    return 0


if __name__ == "__main__":
    sys.exit(main())
