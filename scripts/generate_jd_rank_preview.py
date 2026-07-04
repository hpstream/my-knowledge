#!/usr/bin/env python3
"""
生成京东联盟榜单商品 HTML 预览。

示例：
  .venv/bin/python scripts/generate_jd_rank_preview.py --rank-id 200000 --sort-type 2
  .venv/bin/python scripts/generate_jd_rank_preview.py --rank-id 200006 --filter-keyword 空调
"""

from __future__ import annotations

import argparse
import html
import json
import sys
from pathlib import Path
from typing import Any

import jd_union_http_test as jd_api


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = PROJECT_ROOT / "public" / "jd-rank-preview.html"

RANK_NAMES = {
    200000: "全部",
    200001: "食品酒水",
    200002: "家庭清洁",
    200003: "个护美妆",
    200004: "医药保健",
    200005: "生鲜",
    200006: "数码家电",
    200007: "家居日用",
    200008: "时尚生活",
}

SORT_NAMES = {
    1: "2小时",
    2: "高佣",
    3: "24小时",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="拉取京东联盟榜单商品并生成 HTML 预览页。")
    parser.add_argument("--rank-id", type=int, default=200000, help="榜单 ID，默认 200000：全部")
    parser.add_argument("--sort-type", type=int, default=2, help="排序类型，默认 2：高佣")
    parser.add_argument("--page-index", type=int, default=1, help="页码，默认 1")
    parser.add_argument("--page-size", type=int, default=20, help="每页数量，最大 20，默认 20")
    parser.add_argument("--max-pages", type=int, default=1, help="连续拉取页数，默认 1")
    parser.add_argument("--filter-keyword", default=None, help="只保留标题、标签或 itemId 中包含该关键词的商品")
    parser.add_argument("--timeout", type=int, default=30, help="请求超时秒数，默认 30")
    parser.add_argument("-o", "--output", default=str(DEFAULT_OUTPUT), help=f"输出 HTML，默认 {DEFAULT_OUTPUT}")
    return parser.parse_args()


def request_rank(args: argparse.Namespace, page_index: int) -> dict[str, Any]:
    env = jd_api.load_env(PROJECT_ROOT / ".env")
    _, app_key = jd_api.first_value(env, "JD_APP_KEY", "JD_APPKEY", "APP_KEY", "APPKEY", "my_key")
    _, app_secret = jd_api.first_value(env, "JD_APP_SECRET", "JD_SECRET", "APP_SECRET", "SECRET", "my_secret")
    _, access_token = jd_api.first_value(env, "JD_ACCESS_TOKEN", "JD_SESSION_KEY", "SESSIONKEY", "SESSION_KEY")

    if not app_key or not app_secret:
        raise SystemExit("缺少 JD_APP_KEY 或 JD_APP_SECRET，请先配置 .env")
    if args.page_size > 20:
        raise SystemExit("pageSize 单页最大 20")

    param_json = json.dumps(
        {
            "RankGoodsReq": {
                "rankId": args.rank_id,
                "sortType": args.sort_type,
                "pageIndex": page_index,
                "pageSize": args.page_size,
            }
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )
    params = {
        "360buy_param_json": param_json,
        "app_key": app_key,
        "format": "json",
        "method": "jd.union.open.goods.rank.query",
        "sign_method": "md5",
        "timestamp": jd_api.jd_timestamp(),
        "v": "1.0",
    }
    if access_token:
        params["access_token"] = access_token
    params["sign"] = jd_api.make_sign(app_secret, params)

    response = jd_api.post_form(jd_api.DEFAULT_URL, params, args.timeout)
    outer = response.get("jd_union_open_goods_rank_query_responce")
    if not outer:
        raise SystemExit(json.dumps(response, ensure_ascii=False, indent=2))
    query_result = outer.get("queryResult")
    if not query_result:
        raise SystemExit(json.dumps(response, ensure_ascii=False, indent=2))
    result = json.loads(query_result)
    if result.get("code") != 200:
        raise SystemExit(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def item_matches(item: dict[str, Any], keyword: str) -> bool:
    haystack = [str(item.get("skuName") or ""), str(item.get("itemId") or "")]
    for tag in item.get("skuTagList") or []:
        haystack.append(str(tag.get("name") or ""))
    return keyword in " ".join(haystack)


def fetch_rank(args: argparse.Namespace) -> dict[str, Any]:
    if args.max_pages < 1:
        raise SystemExit("--max-pages 必须大于等于 1")

    merged: dict[str, Any] | None = None
    items: list[dict[str, Any]] = []
    for offset in range(args.max_pages):
        result = request_rank(args, args.page_index + offset)
        if merged is None:
            merged = dict(result)
        page_items = result.get("data") or []
        if args.filter_keyword:
            page_items = [item for item in page_items if item_matches(item, args.filter_keyword)]
        items.extend(page_items)

    if merged is None:
        return {"code": 200, "data": [], "message": "success", "totalCount": 0}
    merged["data"] = items
    merged["fetchedPages"] = args.max_pages
    if args.filter_keyword:
        merged["filterKeyword"] = args.filter_keyword
    return merged


def money(value: Any) -> str:
    if value is None:
        return "-"
    try:
        return f"¥{float(value):.2f}"
    except (TypeError, ValueError):
        return html.escape(str(value))


def text(value: Any) -> str:
    if value is None:
        return ""
    return html.escape(str(value))


def render_tags(item: dict[str, Any]) -> str:
    tags = item.get("skuTagList") or []
    parts = []
    for tag in tags[:6]:
        name = tag.get("name")
        if name:
            parts.append(f"<span>{text(name)}</span>")
    return "".join(parts)


def render_cards(items: list[dict[str, Any]]) -> str:
    cards = []
    for index, item in enumerate(items, start=1):
        purchase = item.get("purchasePriceInfo") or {}
        coupon_list = purchase.get("couponList") or []
        coupon = coupon_list[0] if coupon_list else {}
        coupon_text = ""
        if coupon:
            coupon_text = f"<div class=\"coupon\">券 {money(coupon.get('discount'))} / 门槛 {money(coupon.get('quota'))}</div>"
        cards.append(
            f"""
            <article class="product-card">
              <div class="rank">#{index}</div>
              <img src="{text(item.get('imageUrl'))}" alt="{text(item.get('skuName'))}" loading="lazy">
              <div class="product-main">
                <h2>{text(item.get('skuName'))}</h2>
                <div class="tags">{render_tags(item)}</div>
                <div class="metrics">
                  <div><strong>{money(item.get('wlprice'))}</strong><span>券前价</span></div>
                  <div><strong>{money(purchase.get('purchasePrice'))}</strong><span>到手价</span></div>
                  <div><strong>{money(item.get('commission'))}</strong><span>预估佣金</span></div>
                  <div><strong>{text(item.get('commissionShare'))}%</strong><span>佣金比例</span></div>
                </div>
                {coupon_text}
                <dl>
                  <div><dt>评论</dt><dd>{text(item.get('comments'))}</dd></div>
                  <div><dt>好评率</dt><dd>{text(item.get('goodCommentsShare'))}%</dd></div>
                  <div><dt>itemId</dt><dd>{text(item.get('itemId'))}</dd></div>
                </dl>
              </div>
            </article>
            """
        )
    return "\n".join(cards)


def render_html(args: argparse.Namespace, result: dict[str, Any]) -> str:
    items = result.get("data") or []
    rank_name = RANK_NAMES.get(args.rank_id, str(args.rank_id))
    sort_name = SORT_NAMES.get(args.sort_type, str(args.sort_type))
    filter_suffix = f" / 筛选：{args.filter_keyword}" if args.filter_keyword else ""
    cards = render_cards(items)
    raw_json = html.escape(json.dumps(result, ensure_ascii=False, indent=2))
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>京东联盟榜单预览</title>
  <style>
    :root {{
      color-scheme: light;
      --bg: #f5f6f8;
      --panel: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --line: #e5e7eb;
      --accent: #d9231f;
      --accent-soft: #fff1f0;
      --green: #14804a;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}
    header {{
      position: sticky;
      top: 0;
      z-index: 2;
      background: rgba(255, 255, 255, 0.94);
      border-bottom: 1px solid var(--line);
      backdrop-filter: blur(10px);
    }}
    .header-inner {{
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 18px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }}
    h1 {{
      margin: 0;
      font-size: 24px;
      line-height: 1.2;
      letter-spacing: 0;
    }}
    .summary {{
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
      color: var(--muted);
      font-size: 13px;
    }}
    .summary span {{
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid #ffd7d3;
      border-radius: 999px;
      padding: 6px 10px;
    }}
    main {{
      width: min(1180px, calc(100vw - 32px));
      margin: 22px auto 48px;
    }}
    .product-list {{
      display: grid;
      gap: 14px;
    }}
    .product-card {{
      position: relative;
      display: grid;
      grid-template-columns: 156px minmax(0, 1fr);
      gap: 18px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }}
    .rank {{
      position: absolute;
      left: 16px;
      top: 16px;
      min-width: 38px;
      padding: 5px 9px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.72);
      color: #fff;
      font-size: 13px;
      text-align: center;
    }}
    .product-card img {{
      width: 156px;
      height: 156px;
      object-fit: cover;
      border-radius: 8px;
      background: #f3f4f6;
      border: 1px solid var(--line);
    }}
    .product-main {{
      min-width: 0;
    }}
    h2 {{
      margin: 0 0 10px;
      font-size: 17px;
      line-height: 1.45;
      letter-spacing: 0;
    }}
    .tags {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      min-height: 24px;
      margin-bottom: 12px;
    }}
    .tags span {{
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 3px 7px;
      border-radius: 5px;
      background: #f3f4f6;
      color: #4b5563;
      font-size: 12px;
    }}
    .metrics {{
      display: grid;
      grid-template-columns: repeat(4, minmax(110px, 1fr));
      gap: 10px;
      margin-bottom: 10px;
    }}
    .metrics div {{
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: #fbfbfc;
    }}
    .metrics strong {{
      display: block;
      font-size: 18px;
      line-height: 1.2;
      color: var(--accent);
    }}
    .metrics span {{
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: var(--muted);
    }}
    .coupon {{
      display: inline-flex;
      margin-bottom: 10px;
      padding: 6px 9px;
      border-radius: 6px;
      background: #ecfdf3;
      color: var(--green);
      font-size: 13px;
      font-weight: 600;
    }}
    dl {{
      display: grid;
      grid-template-columns: 120px 120px minmax(0, 1fr);
      gap: 10px;
      margin: 2px 0 0;
      color: var(--muted);
      font-size: 13px;
    }}
    dl div {{
      min-width: 0;
    }}
    dt {{
      margin-bottom: 3px;
      color: #9ca3af;
    }}
    dd {{
      margin: 0;
      overflow-wrap: anywhere;
      color: #4b5563;
    }}
    details {{
      margin-top: 18px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px 16px;
    }}
    summary {{
      cursor: pointer;
      color: var(--muted);
      font-weight: 600;
    }}
    pre {{
      overflow: auto;
      margin: 14px 0 0;
      padding: 14px;
      border-radius: 6px;
      background: #111827;
      color: #e5e7eb;
      font-size: 12px;
      line-height: 1.6;
    }}
    @media (max-width: 760px) {{
      .header-inner {{
        align-items: flex-start;
        flex-direction: column;
      }}
      .summary {{
        justify-content: flex-start;
      }}
      .product-card {{
        grid-template-columns: 112px minmax(0, 1fr);
        gap: 12px;
        padding: 12px;
      }}
      .product-card img {{
        width: 112px;
        height: 112px;
      }}
      h2 {{
        font-size: 15px;
      }}
      .metrics {{
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }}
      dl {{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <h1>京东联盟榜单预览</h1>
      <div class="summary">
        <span>{text(rank_name)} / {text(sort_name)}{text(filter_suffix)}</span>
        <span>第 {args.page_index} 页</span>
        <span>拉取 {text(result.get("fetchedPages") or 1)} 页</span>
        <span>{len(items)} 个商品</span>
        <span>总数 {text(result.get("totalCount"))}</span>
      </div>
    </div>
  </header>
  <main>
    <section class="product-list">
      {cards}
    </section>
    <details>
      <summary>查看原始返回 JSON</summary>
      <pre>{raw_json}</pre>
    </details>
  </main>
</body>
</html>
"""


def main() -> int:
    args = parse_args()
    result = fetch_rank(args)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_html(args, result), encoding="utf-8")
    print(f"已生成: {output}")
    print(f"商品数: {len(result.get('data') or [])}, totalCount: {result.get('totalCount')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
