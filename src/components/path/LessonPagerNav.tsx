"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { completeLesson } from "@/lib/progress";

type Neighbor = {
  slug: string;
  title: string;
  order: number;
};

type Props = {
  pathSlug: string;
  pathTitle: string;
  currentSlug: string;
  prev: Neighbor | null;
  next: Neighbor | null;
};

export function LessonPagerNav({
  pathSlug,
  pathTitle,
  currentSlug,
  prev,
  next,
}: Props) {
  const router = useRouter();
  const { user, openLoginModal } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleAdvance(targetHref: string) {
    if (busy) return;
    setBusy(true);
    try {
      if (!user) {
        const result = await openLoginModal({ returnTo: targetHref });
        if (!result.ok) {
          setBusy(false);
          return;
        }
      }
      // 把当前这篇标记为完成（侧栏的"锁"会立刻打开）。
      await completeLesson(pathSlug, currentSlug);
      router.push(targetHref);
    } finally {
      setBusy(false);
    }
  }

  if (!prev && !next) return null;

  const nextHref = next
    ? `/paths/${pathSlug}/${next.slug}`
    : `/paths/${pathSlug}`;

  return (
    <nav aria-label="课程导航" className="mt-8 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/paths/${pathSlug}/${prev.slug}`}
          className="group flex flex-col rounded-2xl border border-slate-200 p-5 transition hover:border-orange-300 hover:bg-orange-50/40"
        >
          <span className="text-xs text-slate-500">← 上一篇</span>
          <span className="mt-1 line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-orange-700">
            第 {prev.order} 讲 · {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}

      <button
        type="button"
        onClick={() => handleAdvance(nextHref)}
        disabled={busy}
        className="group flex flex-col rounded-2xl border border-slate-200 p-5 text-left transition hover:border-orange-300 hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-60 sm:items-end sm:text-right"
      >
        <span className="text-xs text-slate-500">
          {next ? "下一篇 →" : "已是最后一篇"}
        </span>
        <span className="mt-1 line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-orange-700">
          {next ? `第 ${next.order} 讲 · ${next.title}` : `返回 ${pathTitle} →`}
        </span>
      </button>
    </nav>
  );
}
