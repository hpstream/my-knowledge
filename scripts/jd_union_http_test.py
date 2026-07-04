#!/usr/bin/env python3
"""
京东联盟开放平台纯 HTTP 调用测试。

不依赖官方 SDK，但仍然需要 app_key 和 app_secret：
  - my_key / JD_APP_KEY / JD_APPKEY / APP_KEY / APPKEY 作为 app_key
  - JD_APP_SECRET / JD_SECRET / APP_SECRET / SECRET / my_secret 作为 app_secret
  - JD_ACCESS_TOKEN / JD_SESSION_KEY / SESSIONKEY / SESSION_KEY 作为可选 access_token

示例：
  .venv/bin/python scripts/jd_union_http_test.py --keyword 鞋
  .venv/bin/python scripts/jd_union_http_test.py --rank
  .venv/bin/python scripts/jd_union_http_test.py --dry-run --keyword 鞋
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_URL = "https://api.jd.com/routerjson"


def load_env(env_path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not env_path.exists():
        return values

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line.removeprefix("export ").strip()
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            values[key] = value
            os.environ.setdefault(key, value)
    return values


def first_value(env: dict[str, str], *names: str) -> tuple[str | None, str | None]:
    for name in names:
        value = os.environ.get(name) or env.get(name)
        if value:
            return name, value
    return None, None


def hidden_status(source: str | None, value: str | None) -> str:
    if not value:
        return "未配置"
    return f"{source or '参数'} 已读取，长度 {len(value)}，不显示内容"


def jd_timestamp() -> str:
    tz = dt.timezone(dt.timedelta(hours=8))
    return dt.datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")


def compact_dict(value: dict[str, Any]) -> dict[str, Any]:
    return {key: item for key, item in value.items() if item not in (None, "")}


def int_value(value: Any, name: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise SystemExit(f"{name} 必须是数字，当前值: {value}") from exc


def build_param_json(args: argparse.Namespace) -> str:
    if args.param_json:
        try:
            data = json.loads(args.param_json)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"--param-json 不是合法 JSON: {exc}") from exc
        if not isinstance(data, dict):
            raise SystemExit("--param-json 必须是 JSON object")
        payload = data
    else:
        if args.rank:
            page_size = int_value(args.page_size or os.environ.get("JD_PAGE_SIZE") or 10, "pageSize")
            if page_size > 20:
                raise SystemExit("pageSize 单页最大 20")
            req = compact_dict(
                {
                    "rankId": int_value(args.rank_id or os.environ.get("JD_RANK_ID") or 200000, "rankId"),
                    "sortType": int_value(args.sort_type or os.environ.get("JD_RANK_SORT_TYPE") or 2, "sortType"),
                    "pageIndex": int_value(args.page_index or os.environ.get("JD_PAGE_INDEX") or 1, "pageIndex"),
                    "pageSize": page_size,
                }
            )
            payload = {"RankGoodsReq": req}
        else:
            req = compact_dict(
                {
                    "keyword": args.keyword or os.environ.get("JD_RECOMMEND_KEYWORD") or "鞋",
                    "sceneId": args.scene_id or os.environ.get("JD_RECOMMEND_SCENE_ID"),
                    "skuId": args.sku_id or os.environ.get("JD_RECOMMEND_SKU_ID"),
                    "itemId": args.item_id or os.environ.get("JD_RECOMMEND_ITEM_ID"),
                }
            )
            payload = {args.param_name: req}
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def make_sign(app_secret: str, params: dict[str, str]) -> str:
    raw = app_secret + "".join(f"{key}{params[key]}" for key in sorted(params)) + app_secret
    return hashlib.md5(raw.encode("utf-8")).hexdigest().upper()


def post_form(url: str, params: dict[str, str], timeout: int) -> Any:
    body = urllib.parse.urlencode(params).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read().decode("utf-8")
    return json.loads(raw)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="按京东开放平台 HTTP 协议测试 API 是否能调用。")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"网关地址，默认 {DEFAULT_URL}")
    parser.add_argument("--method", default=None, help="API 接口名称")
    parser.add_argument("--version", default="1.0", help="API 协议版本，默认 1.0")
    parser.add_argument("--timeout", type=int, default=30, help="请求超时秒数，默认 30")
    parser.add_argument("--dry-run", action="store_true", help="只检查参数和签名构造，不真正请求京东")

    parser.add_argument("--app-key", default=None, help="京东 app_key；默认从 .env 读取")
    parser.add_argument("--app-secret", default=None, help="京东 app_secret；默认从 .env 读取")
    parser.add_argument("--access-token", default=None, help="可选 access_token/sessionkey；默认从 .env 读取")

    parser.add_argument("--param-name", default="RecommendGoodsReq", help="业务参数外层字段名")
    parser.add_argument("--param-json", default=None, help='完整 360buy_param_json JSON，例如 {"goodsReqDTO":{"keyword":"鞋","pageIndex":"1"}}')
    parser.add_argument("--rank", action="store_true", help="快捷调用 jd.union.open.goods.rank.query")
    parser.add_argument("--rank-id", default=None, help="榜单 ID，默认 200000：全部")
    parser.add_argument("--sort-type", default=None, help="排序类型，默认 2：高佣；1：2小时，3：24小时")
    parser.add_argument("--page-index", default=None, help="页码，默认 1")
    parser.add_argument("--page-size", default=None, help="每页条数，默认 10")
    parser.add_argument("--keyword", default=None, help="推荐关键词，例如 鞋")
    parser.add_argument("--scene-id", default=None, help="京东推荐场景 ID")
    parser.add_argument("--sku-id", default=None, help="京东 skuId")
    parser.add_argument("--item-id", default=None, help="京东 itemId")
    return parser.parse_args()


def main() -> int:
    env = load_env(PROJECT_ROOT / ".env")
    args = parse_args()

    app_key_source, app_key = first_value(env, "JD_APP_KEY", "JD_APPKEY", "APP_KEY", "APPKEY", "my_key")
    secret_source, app_secret = first_value(env, "JD_APP_SECRET", "JD_SECRET", "APP_SECRET", "SECRET", "my_secret")
    token_source, access_token = first_value(env, "JD_ACCESS_TOKEN", "JD_SESSION_KEY", "SESSIONKEY", "SESSION_KEY")

    if args.app_key:
        app_key_source, app_key = "--app-key", args.app_key
    if args.app_secret:
        secret_source, app_secret = "--app-secret", args.app_secret
    if args.access_token is not None:
        token_source, access_token = "--access-token", args.access_token or None

    print(f"app_key: {hidden_status(app_key_source, app_key)}", file=sys.stderr)
    print(f"app_secret: {hidden_status(secret_source, app_secret)}", file=sys.stderr)
    print(f"access_token/sessionkey: {hidden_status(token_source, access_token)}", file=sys.stderr)

    if not app_key:
        print("缺少 app_key。请在 .env 配置 JD_APP_KEY，或继续使用 my_key。", file=sys.stderr)
        return 2
    if not app_secret:
        print("缺少 app_secret。京东开放平台签名必须用 app_secret，非授权接口只是不需要 access_token。", file=sys.stderr)
        return 2

    method = args.method or ("jd.union.open.goods.rank.query" if args.rank else "jd.union.open.goods.recommend.query")
    params = {
        "360buy_param_json": build_param_json(args),
        "app_key": app_key,
        "format": "json",
        "method": method,
        "sign_method": "md5",
        "timestamp": jd_timestamp(),
        "v": args.version,
    }
    if access_token:
        params["access_token"] = access_token
    params["sign"] = make_sign(app_secret, params)

    print(f"url: {args.url}", file=sys.stderr)
    print(f"method: {method}", file=sys.stderr)
    print(f"360buy_param_json: {params['360buy_param_json']}", file=sys.stderr)
    print(f"timestamp: {params['timestamp']}", file=sys.stderr)
    print(f"sign: {params['sign']}", file=sys.stderr)

    if args.dry_run:
        print("dry-run 通过：参数和签名已构造，未发送网络请求。", file=sys.stderr)
        return 0

    response = post_form(args.url, params, args.timeout)
    print(json.dumps(response, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
