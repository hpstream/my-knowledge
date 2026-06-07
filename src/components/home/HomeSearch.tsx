"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const HOT_SEARCHES = [
  { label: "API Key 申请", q: "API Key" },
  { label: "域名备案", q: "域名备案" },
  { label: "Vercel 上线", q: "Vercel" },
  { label: "Next.js 部署", q: "Next.js" },
];

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="mt-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-slate-300 focus-within:shadow"
      >
        <svg
          className="ml-3 h-5 w-5 flex-shrink-0 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a.75.75 0 11-1.06 1.06l-3.08-3.08A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜文章、专题、AI 工具…"
          className="min-w-0 flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          aria-label="搜索"
        />
        <button
          type="submit"
          className="flex-shrink-0 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          搜索
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-slate-400">
        <span>热门搜索：</span>
        {HOT_SEARCHES.map((h) => (
          <a
            key={h.q}
            href={`/search?q=${encodeURIComponent(h.q)}`}
            className="text-orange-500 transition hover:text-orange-600"
          >
            {h.label}
          </a>
        ))}
      </div>
    </div>
  );
}
