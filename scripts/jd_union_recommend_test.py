#!/usr/bin/env python3
"""
京东联盟「商品推荐查询」接口连通性测试。

默认读取项目根目录 `.env`：
  - my_key / JD_APP_KEY / JD_APPKEY / APP_KEY / APPKEY 作为 app_key
  - JD_APP_SECRET / JD_SECRET / APP_SECRET / SECRET 作为 app_secret
  - JD_ACCESS_TOKEN / JD_SESSION_KEY / SESSIONKEY / SESSION_KEY 作为可选 access_token

示例：
  .venv/bin/python scripts/jd_union_recommend_test.py --keyword phone
  .venv/bin/python scripts/jd_union_recommend_test.py --keyword 手机 --patch-sign-utf8
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import sys
import types
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SDK_PATH = Path("/Users/hpstream/Downloads/360CSEX/jos-python3-open-api-sdk-2.0")


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


def install_httpx_compat_if_needed() -> None:
    """The official SDK imports httpx. Provide a tiny stdlib fallback if absent."""
    if importlib.util.find_spec("httpx") is not None:
        return

    class CompatResponse:
        def __init__(self, body: bytes):
            self._body = body

        def json(self) -> Any:
            return json.loads(self._body.decode("utf-8"))

    def request(method: str, url: str, data: dict[str, Any] | None = None, timeout: int = 30) -> CompatResponse:
        body = None
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        if data is not None:
            body = urllib.parse.urlencode(data).encode("utf-8")
        req = urllib.request.Request(url, data=body, method=method, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return CompatResponse(resp.read())

    httpx = types.ModuleType("httpx")
    httpx.post = lambda url, data=None, timeout=30: request("POST", url, data, timeout)  # type: ignore[attr-defined]
    httpx.get = lambda url, timeout=30: request("GET", url, None, timeout)  # type: ignore[attr-defined]
    sys.modules["httpx"] = httpx


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="测试京东联盟商品推荐查询接口是否能调用。")
    parser.add_argument("--sdk-path", default=None, help=f"官方 SDK 目录，默认 {DEFAULT_SDK_PATH}")
    parser.add_argument("--domain", default=None, help="接口域名，默认 gw.api.360buy.com")
    parser.add_argument("--port", type=int, default=None, help="SDK 构造参数 port，默认 80")
    parser.add_argument("--ssl", action="store_true", help="使用 https 调用；默认按官方 SDK 使用 http")
    parser.add_argument("--timeout", type=int, default=30, help="请求超时秒数，默认 30")
    parser.add_argument(
        "--patch-sign-utf8",
        action="store_true",
        help="把官方 SDK 的 latin1 签名编码临时改为 utf-8；传中文参数时通常需要",
    )

    parser.add_argument("--app-key", default=None, help="京东 app_key；默认从 .env 读取")
    parser.add_argument("--app-secret", default=None, help="京东 app_secret；默认从 .env 读取")
    parser.add_argument("--access-token", default=None, help="可选 access_token/sessionkey；默认从 .env 读取")

    parser.add_argument("--keyword", default=None, help="推荐关键词，例如 手机")
    parser.add_argument("--scene-id", default=None, help="京东推荐场景 ID")
    parser.add_argument("--sku-id", default=None, help="京东 skuId")
    parser.add_argument("--item-id", default=None, help="京东 itemId")
    parser.add_argument("--req-json", default=None, help='直接传 RecommendGoodsReq JSON，例如 {"keyword":"手机"}')
    parser.add_argument("--dry-run", action="store_true", help="只检查配置和构造参数，不真正请求京东")
    return parser.parse_args()


def hidden_status(source: str | None, value: str | None) -> str:
    if not value:
        return "未配置"
    return f"{source or '参数'} 已读取，长度 {len(value)}，不显示内容"


def build_recommend_req(args: argparse.Namespace):
    from jd.api.rest.UnionOpenGoodsRecommendQueryRequest import RecommendGoodsReq

    if args.req_json:
        try:
            data = json.loads(args.req_json)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"--req-json 不是合法 JSON: {exc}") from exc
        if not isinstance(data, dict):
            raise SystemExit("--req-json 必须是 JSON object")
        return data

    req = RecommendGoodsReq()
    req.keyword = args.keyword or os.environ.get("JD_RECOMMEND_KEYWORD") or "phone"
    req.sceneId = args.scene_id or os.environ.get("JD_RECOMMEND_SCENE_ID")
    req.skuId = args.sku_id or os.environ.get("JD_RECOMMEND_SKU_ID")
    req.itemId = args.item_id or os.environ.get("JD_RECOMMEND_ITEM_ID")
    return req


def compact_req(req: Any) -> dict[str, Any]:
    if isinstance(req, dict):
        return {k: v for k, v in req.items() if v not in (None, "")}
    return {k: v for k, v in req.__dict__.items() if v not in (None, "")}


def patch_sign_utf8() -> None:
    import jd.api.base as jd_base

    def sign(secret: str, parameters: Any) -> str:
        if not hasattr(parameters, "items"):
            return ""
        keys = sorted(parameters.keys())
        raw = f"{secret}{''.join(f'{key}{parameters[key]}' for key in keys)}{secret}"
        return hashlib.md5(raw.encode("utf-8")).hexdigest().upper()

    jd_base.sign = sign


def main() -> int:
    env = load_env(PROJECT_ROOT / ".env")
    args = parse_args()

    sdk_path = Path(args.sdk_path or os.environ.get("JD_SDK_PATH") or DEFAULT_SDK_PATH)
    if not sdk_path.exists():
        print(f"SDK 目录不存在: {sdk_path}", file=sys.stderr)
        return 2
    sys.path.insert(0, str(sdk_path))
    install_httpx_compat_if_needed()

    app_key_source, app_key = first_value(env, "JD_APP_KEY", "JD_APPKEY", "APP_KEY", "APPKEY", "my_key")
    secret_source, app_secret = first_value(env, "JD_APP_SECRET", "JD_SECRET", "APP_SECRET", "SECRET")
    token_source, access_token = first_value(env, "JD_ACCESS_TOKEN", "JD_SESSION_KEY", "SESSIONKEY", "SESSION_KEY")

    if args.app_key:
        app_key_source, app_key = "--app-key", args.app_key
    if args.app_secret:
        secret_source, app_secret = "--app-secret", args.app_secret
    if args.access_token is not None:
        token_source, access_token = "--access-token", args.access_token or None

    print(f"SDK: {sdk_path}", file=sys.stderr)
    print(f"app_key: {hidden_status(app_key_source, app_key)}", file=sys.stderr)
    print(f"app_secret: {hidden_status(secret_source, app_secret)}", file=sys.stderr)
    print(f"access_token/sessionkey: {hidden_status(token_source, access_token)}", file=sys.stderr)

    if not app_key:
        print("缺少 app_key。请在 .env 配置 JD_APP_KEY，或继续使用 my_key。", file=sys.stderr)
        return 2
    if not app_secret:
        print(
            "缺少 app_secret。请在 .env 增加 JD_APP_SECRET=你的京东应用密钥；"
            "当前 my_key 只会作为 app_key 兼容读取。",
            file=sys.stderr,
        )
        return 2

    import jd
    from jd.api.rest.UnionOpenGoodsRecommendQueryRequest import UnionOpenGoodsRecommendQueryRequest

    if args.patch_sign_utf8:
        patch_sign_utf8()

    jd.setDefaultAppInfo(app_key, app_secret)
    domain = args.domain or os.environ.get("JD_API_DOMAIN") or "gw.api.360buy.com"
    port = args.port or int(os.environ.get("JD_API_PORT") or "80")

    request = UnionOpenGoodsRecommendQueryRequest(domain, port)
    request.RecommendGoodsReq = build_recommend_req(args)

    print(f"api: {request.getapiname()} v{request.get_version()}", file=sys.stderr)
    print(f"domain: {domain}, port: {port}, ssl: {args.ssl}", file=sys.stderr)
    print(f"RecommendGoodsReq: {json.dumps(compact_req(request.RecommendGoodsReq), ensure_ascii=False)}", file=sys.stderr)

    if args.dry_run:
        print("dry-run 通过：配置和请求对象已构造，未发送网络请求。", file=sys.stderr)
        return 0

    response = request.getResponse(access_token or None, timeout=args.timeout, ssl=args.ssl)
    print(json.dumps(response, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
