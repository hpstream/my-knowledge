"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getAllProgress,
  loadAllProgress,
  PROGRESS_UPDATE_EVENT,
  type ArticleProgress,
} from "@/lib/progress";

type Lesson = {
  slug: string;
  title: string;
  order: number;
};

type Props = {
  pathSlug: string;
  lessons: Lesson[];
};

export function PathHeroCta({ pathSlug, lessons }: Props) {
  const router = useRouter();
  const { user, openLoginModal } = useAuth();
  const [progress, setProgress] = useState<Record<string, ArticleProgress>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAllProgress().then((p) => {
      if (cancelled) return;
      setProgress(p);
      setHydrated(true);
    });
    const handler = () => setProgress({ ...getAllProgress() });
    window.addEventListener(PROGRESS_UPDATE_EVENT, handler);
    return () => {
      cancelled = true;
      window.removeEventListener(PROGRESS_UPDATE_EVENT, handler);
    };
  }, []);

  const completedCount = lessons.filter(
    (l) => progress[l.slug]?.completedAt,
  ).length;
  const firstIncompleteIdx = lessons.findIndex(
    (l) => !progress[l.slug]?.completedAt,
  );
  const continueIdx = firstIncompleteIdx === -1 ? 0 : firstIncompleteIdx;
  const continueLesson = lessons[continueIdx] ?? lessons[0];
  const allDone = completedCount === lessons.length && lessons.length > 0;
  const started = completedCount > 0;
  const percent =
    lessons.length === 0
      ? 0
      : Math.round((completedCount / lessons.length) * 100);

  async function handleContinue(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!continueLesson || user) return;
    e.preventDefault();
    const target = `/paths/${pathSlug}/${continueLesson.slug}`;
    const result = await openLoginModal({ returnTo: target });
    if (result.ok) router.push(target);
  }

  if (!continueLesson) return null;

  const buttonLabel = allDone
    ? "重新学习"
    : started
      ? `继续学习 · 第 ${continueLesson.order} 讲`
      : "开始学习";

  return (
    <div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-700">
          已完成{" "}
          <span className="font-semibold text-slate-900">
            {hydrated ? completedCount : 0}
          </span>{" "}
          / {lessons.length}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: hydrated ? `${percent}%` : "0%" }}
          />
        </div>
        <span className="font-medium tabular-nums text-slate-500">
          {hydrated ? `${percent}%` : "0%"}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/paths/${pathSlug}/${continueLesson.slug}`}
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-1 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          {buttonLabel}
          <span aria-hidden>→</span>
        </Link>
        <a
          href="#course-outline"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
        >
          查看大纲
        </a>
      </div>
    </div>
  );
}
