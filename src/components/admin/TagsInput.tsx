"use client";

import { useState, type KeyboardEvent } from "react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
};

const MAX_TAG_LEN = 24;

function normalize(raw: string): string {
  return raw.trim().slice(0, MAX_TAG_LEN);
}

export function TagsInput({
  value,
  onChange,
  placeholder = "输入标签后按回车",
  max = 20,
}: Props) {
  const [input, setInput] = useState("");

  function add(raw: string) {
    const tag = normalize(raw);
    if (!tag) return;
    if (value.includes(tag)) {
      setInput("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setInput("");
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      remove(value.length - 1);
    }
  }

  function onBlur() {
    if (input.trim()) add(input);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2 focus-within:border-slate-300">
        {value.map((tag, i) => (
          <span
            key={tag + i}
            className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-orange-400 transition hover:text-orange-700"
              aria-label={`删除 ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent px-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        回车 / 逗号添加，删除键删除最后一个 · 最多 {max} 个
      </p>
    </div>
  );
}
