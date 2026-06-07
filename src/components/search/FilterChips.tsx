"use client";

import { useRouter } from "next/navigation";
import type { SearchKind } from "@/lib/search";

const CHIPS: Array<{ value: SearchKind; label: string }> = [
  { value: "all", label: "全部" },
  { value: "path", label: "系列课程" },
  { value: "topic", label: "专题文章" },
];

type Props = {
  currentKind: SearchKind;
  currentQuery: string;
};

export function FilterChips({ currentKind, currentQuery }: Props) {
  const router = useRouter();

  function select(kind: SearchKind) {
    const params = new URLSearchParams();
    if (currentQuery) params.set("q", currentQuery);
    if (kind !== "all") params.set("kind", kind);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((c) => {
        const active = c.value === currentKind;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => select(c.value)}
            className={
              active
                ? "rounded-full bg-orange-500 px-4 py-1.5 text-sm font-medium text-white transition"
                : "rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            }
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
