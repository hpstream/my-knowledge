import type { ReactNode } from "react";
import {
  CALLOUT_ICONS,
  CALLOUT_LABELS,
  isCalloutKind,
  type CalloutKind,
} from "@/lib/remark-callout";

type CalloutBlockProps = {
  "data-kind"?: string;
  "data-label"?: string;
  children?: ReactNode;
};

const KIND_STYLES: Record<
  CalloutKind,
  {
    container: string;
    stripe: string;
    iconBg: string;
    label: string;
    accent: string;
  }
> = {
  prep: {
    container:
      "border-ink bg-paper-deep/60",
    stripe: "bg-ink",
    iconBg: "bg-paper",
    label: "PREP · 准备清单",
    accent: "text-ink",
  },
  apply: {
    container: "border-marker bg-marker-wash/60",
    stripe: "bg-marker",
    iconBg: "bg-paper",
    label: "APPLY · 申请清单",
    accent: "text-marker",
  },
  prompt: {
    container: "border-ink bg-ink text-paper",
    stripe: "bg-highlight",
    iconBg: "bg-highlight",
    label: "PROMPT · 给 AI 的提示词",
    accent: "text-highlight",
  },
  verify: {
    container: "border-marker bg-paper",
    stripe: "bg-marker",
    iconBg: "bg-marker-wash",
    label: "VERIFY · 验证步骤",
    accent: "text-marker",
  },
  pitfall: {
    container: "border-stamp-red bg-paper",
    stripe: "bg-stamp-red",
    iconBg: "bg-paper",
    label: "PITFALL · AI 翻车点",
    accent: "text-stamp-red",
  },
};

export function CalloutBlock(props: CalloutBlockProps) {
  const kindRaw = props["data-kind"] ?? "";
  if (!isCalloutKind(kindRaw)) {
    return <div className="my-6">{props.children}</div>;
  }
  const kind = kindRaw as CalloutKind;
  const styles = KIND_STYLES[kind];
  const label = props["data-label"] || CALLOUT_LABELS[kind];
  const icon = CALLOUT_ICONS[kind];
  const isInverted = kind === "prompt";

  return (
    <aside
      data-callout={kind}
      className={`callout my-8 border ${styles.container} ink-shadow-static relative overflow-hidden`}
    >
      {/* left vertical stripe */}
      <span
        aria-hidden
        className={`absolute left-0 top-0 bottom-0 w-1 ${styles.stripe}`}
      />

      <header
        className={`flex items-center gap-3 border-b ${
          isInverted ? "border-paper/15" : "border-ink/15"
        } px-5 py-3 pl-7`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${styles.iconBg} text-base shadow-[inset_0_0_0_1px_currentColor]`}
          aria-hidden
        >
          {icon}
        </span>
        <span
          className={`font-mono text-[10px] uppercase tracking-mono-strip ${
            isInverted ? "text-paper/60" : styles.accent
          }`}
        >
          {styles.label}
        </span>
        {label !== CALLOUT_LABELS[kind] && (
          <>
            <span
              className={`font-mono text-[10px] ${
                isInverted ? "text-paper/30" : "text-ink-faint"
              }`}
            >
              ·
            </span>
            <span
              className={`font-cjk-serif text-sm font-semibold ${
                isInverted ? "text-paper" : "text-ink"
              }`}
            >
              {label}
            </span>
          </>
        )}
      </header>

      <div
        className={`callout-body px-5 py-4 pl-7 ${
          isInverted ? "text-paper/95" : "text-ink-soft"
        }`}
      >
        {props.children}
      </div>
    </aside>
  );
}
