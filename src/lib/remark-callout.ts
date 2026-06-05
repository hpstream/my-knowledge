/**
 * remark-callout — converts `:::name 标签` containerDirective blocks
 * into custom HAST elements that React-Markdown renders via the
 * CalloutBlock component.
 *
 * Syntax:
 *
 *   :::prep 准备清单
 *   - 你的网站项目
 *   - 信用卡
 *   :::
 *
 *   :::apply[label="申请 DeepSeek API Key"]
 *   1. 访问 platform.deepseek.com
 *   2. 注册并实名认证
 *   :::
 */

import { visit } from "unist-util-visit";

type Root = { type: "root"; children: unknown[] };

export const CALLOUT_KINDS = [
  "prep",
  "apply",
  "prompt",
  "verify",
  "pitfall",
] as const;

export type CalloutKind = (typeof CALLOUT_KINDS)[number];

export function isCalloutKind(name: string): name is CalloutKind {
  return (CALLOUT_KINDS as readonly string[]).includes(name);
}

export const CALLOUT_LABELS: Record<CalloutKind, string> = {
  prep: "准备清单",
  apply: "申请清单",
  prompt: "给 AI 的提示词",
  verify: "验证步骤",
  pitfall: "AI 翻车点",
};

export const CALLOUT_ICONS: Record<CalloutKind, string> = {
  prep: "📋",
  apply: "🪪",
  prompt: "🤖",
  verify: "✅",
  pitfall: "⚠️",
};

type DirectiveNode = {
  type: "containerDirective" | "leafDirective" | "textDirective";
  name?: string;
  attributes?: Record<string, string | null | undefined> | null;
  children?: Array<{
    type: string;
    children?: Array<{ type: string; value?: string }>;
    data?: { directiveLabel?: boolean };
  }>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
};

function extractLabel(node: DirectiveNode): string | null {
  const first = node.children?.[0];
  if (!first || first.type !== "paragraph") return null;
  if (!first.data?.directiveLabel) return null;
  const txt = first.children?.find((c) => c.type === "text");
  return txt?.value ?? null;
}

export function remarkCallout() {
  return (tree: Root) => {
    visit(tree, (node) => {
      const n = node as unknown as DirectiveNode;
      if (n.type !== "containerDirective") return;
      const rawName = (n.name ?? "").toLowerCase();
      if (!isCalloutKind(rawName)) return;

      const label = extractLabel(n);
      if (label && n.children && n.children.length > 0) {
        n.children.shift();
      }

      const attrLabel =
        typeof n.attributes?.label === "string"
          ? (n.attributes.label as string)
          : null;

      n.data = n.data ?? {};
      n.data.hName = "callout";
      n.data.hProperties = {
        ...(n.data.hProperties ?? {}),
        "data-kind": rawName,
        ...(label || attrLabel
          ? { "data-label": label ?? attrLabel ?? "" }
          : {}),
      };
    });
  };
}
