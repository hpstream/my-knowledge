"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAllProgress,
  loadAllProgress,
  PROGRESS_UPDATE_EVENT,
  type ArticleProgress,
} from "@/lib/progress";
import { useAuth } from "@/components/auth/AuthProvider";

type Lesson = {
  slug: string;
  title: string;
  order: number;
  readMinutes: number;
  quizCount: number;
};

type Props = {
  pathSlug: string;
  lessons: Lesson[];
};

type LessonState =
  | "completed"
  | "current"
  | "locked"
  | "available";

export function PathLessonList({ pathSlug, lessons }: Props) {
  const router = useRouter();
  const { user, openLoginModal } = useAuth();
  const [progress, setProgress] = useState<Record<string, ArticleProgress>>({});
  const [hydrated, setHydrated] = useState(false);

  async function handleLessonClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    lessonSlug: string,
  ) {
    if (user) return;
    event.preventDefault();
    const target = `/paths/${pathSlug}/${lessonSlug}`;
    const result = await openLoginModal({ returnTo: target });
    if (result.ok) {
      router.push(target);
    }
  }

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
    (lesson) => progress[lesson.slug]?.completedAt,
  ).length;
  const firstIncompleteIdx = lessons.findIndex(
    (lesson) => !progress[lesson.slug]?.completedAt,
  );

  function resolveState(idx: number, lesson: Lesson): LessonState {
    if (!hydrated) {
      return idx === 0 ? "current" : "locked";
    }
    if (progress[lesson.slug]?.completedAt) return "completed";
    if (idx === firstIncompleteIdx) return "current";
    return "locked";
  }

  return (
    <div>
      <div className="mb-5 rounded-[24px] border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
              Learning progress
            </div>
            <div className="mt-2 text-base text-slate-800">
              已完成 {hydrated ? completedCount : 0} / {lessons.length} 讲
            </div>
          </div>
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                style={{
                  width: hydrated
                    ? `${(completedCount / lessons.length) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <ol className="space-y-3">
        {lessons.map((lesson, idx) => {
          const state = resolveState(idx, lesson);
          const lessonProgress = progress[lesson.slug];
          const score = lessonProgress?.score;

          const sharedInner = (
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <LessonBadge state={state} order={lesson.order} />
                <div className="min-w-0">
                  <div
                    className={`truncate text-base font-medium ${
                      state === "locked" ? "text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {lesson.title}
                  </div>
                  <div
                    className={`mt-1 text-sm ${
                      state === "locked" ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {lesson.readMinutes} 分钟 · {lesson.quizCount} 道题
                    {hydrated && score
                      ? ` · 得分 ${score.correct}/${score.total}`
                      : ""}
                  </div>
                </div>
              </div>
              <LessonAction state={state} />
            </div>
          );

          const wrapperBase =
            "block rounded-[24px] border p-5 transition duration-300";
          const wrapperStyle =
            state === "current"
              ? "border-emerald-300 bg-emerald-50/60"
              : state === "completed"
                ? "border-slate-200 bg-white"
                : state === "locked"
                  ? "border-slate-200 bg-slate-50"
                  : "border-slate-200 bg-white";

          return (
            <li key={lesson.slug}>
              {state === "locked" ? (
                <div
                  aria-disabled
                  className={`${wrapperBase} ${wrapperStyle} cursor-not-allowed`}
                >
                  {sharedInner}
                </div>
              ) : (
                <Link
                  href={`/paths/${pathSlug}/${lesson.slug}`}
                  onClick={(e) => handleLessonClick(e, lesson.slug)}
                  className={`${wrapperBase} ${wrapperStyle} hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.06)]`}
                >
                  {sharedInner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-xs text-slate-500">
        提示：完成当前讲的文章 + 小测后，会自动解锁下一讲。
      </p>
    </div>
  );
}

function LessonBadge({
  state,
  order,
}: {
  state: LessonState;
  order: number;
}) {
  const base =
    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium";

  if (state === "completed") {
    return <span className={`${base} bg-emerald-500 text-white`}>✓</span>;
  }
  if (state === "current") {
    return <span className={`${base} bg-slate-900 text-white`}>{order}</span>;
  }
  if (state === "locked") {
    return (
      <span className={`${base} bg-slate-100 text-slate-400`} aria-label="未解锁">
        <LockIcon />
      </span>
    );
  }
  return <span className={`${base} bg-slate-100 text-slate-600`}>{order}</span>;
}

function LessonAction({ state }: { state: LessonState }) {
  if (state === "completed") {
    return <span className="flex-shrink-0 text-sm text-slate-500">复习 →</span>;
  }
  if (state === "current") {
    return <span className="flex-shrink-0 text-sm text-emerald-700">开始 →</span>;
  }
  if (state === "locked") {
    return (
      <span className="flex-shrink-0 text-xs text-slate-400">
        完成上一讲后解锁
      </span>
    );
  }
  return <span className="flex-shrink-0 text-sm text-slate-500">查看 →</span>;
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
