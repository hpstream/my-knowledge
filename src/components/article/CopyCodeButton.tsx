"use client";

import { useState } from "react";

type Props = {
  text: string;
};

export function CopyCodeButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`absolute right-3 top-3 rounded-md border px-2.5 py-1 text-xs transition-colors ${
        copied
          ? "border-emerald-400 bg-emerald-500 text-white"
          : "border-white/20 bg-black/20 text-white/80 hover:border-white/35 hover:bg-black/35 hover:text-white"
      }`}
      aria-label={copied ? "已复制代码" : "复制代码"}
      title={copied ? "已复制" : "复制代码"}
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}
