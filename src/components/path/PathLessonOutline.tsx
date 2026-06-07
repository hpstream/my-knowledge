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
  currentSlug: string;
  lessons: Lesson[];
};

type LessonState = "completed" | "current" | "available" | "locked";

export function PathLessonOutline({ pathSlug, currentSlug, lessons }: Props) {
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

  const firstIncompleteIdx = lessons.findIndex(
    (l) => !progress[l.slug]?.completedAt,
  );

  function resolveState(idx: number, lesson: Lesson): LessonState {
    if (lesson.slug === currentSlug) return "current";
    if (!hydrated) return "locked";
    if (progress[lesson.slug]?.completedAt) return "completed";
    if (idx <= firstIncompleteIdx) return "available";
    return "locked";
  }

  async function handleClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    lessonSlug: string,
  ) {
    if (user) return;
    e.preventDefault();
    const target = `/paths/${pathSlug}/${lessonSlug}`;
    const result = await openLoginModal({ returnTo: target });
    if (result.ok) router.push(target);
  }

  return (
    <nav aria-label="课程大纲" className="space-y-1">
      <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        课程大纲
      </div>
      <ol className="space-y-1">
        {lessons.map((lesson, idx) => {
          const state = resolveState(idx, lesson);
          const inner = (
            <div className="flex items-center gap-3">
              <StateBadge state={state} order={lesson.order} />
              <div className="min-w-0 flex-1">
                <div
                  className={
                    state === "locked"
                      ? "truncate text-sm text-slate-400"
                      : state === "current"
                        ? "truncate text-sm font-semibold text-orange-700"
                        : "truncate text-sm text-slate-700"
                  }
                >
                  {lesson.title}
                </div>
              </div>
            </div>
          );

          const baseClass = "block rounded-lg px-3 py-2 transition";
          const stateClass =
            state === "current"
              ? "bg-orange-50"
              : state === "locked"
                ? "cursor-not-allowed"
                : "hover:bg-slate-50";

          if (state === "locked") {
            return (
              <li key={lesson.slug}>
                <div
                  className={`${baseClass} ${stateClass}`}
                  aria-disabled="true"
                >
                  {inner}
                </div>
              </li>
            );
          }
          return (
            <li key={lesson.slug}>
              <Link
                href={`/paths/${pathSlug}/${lesson.slug}`}
                onClick={(e) => handleClick(e, lesson.slug)}
                className={`${baseClass} ${stateClass}`}
                aria-current={state === "current" ? "page" : undefined}
              >
                {inner}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StateBadge({
  state,
  order,
}: {
  state: LessonState;
  order: number;
}) {
  const base =
    "inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium";
  if (state === "completed") {
    return <span className={`${base} bg-emerald-500 text-white`}>✓</span>;
  }
  if (state === "current") {
    return (
      <span className={`${base} bg-orange-500 text-white`}>
        {String(order).padStart(2, "0")}
      </span>
    );
  }
  if (state === "available") {
    return (
      <span className={`${base} bg-slate-100 text-slate-600`}>
        {String(order).padStart(2, "0")}
      </span>
    );
  }
  return (
    <span className={`${base} bg-slate-100 text-slate-400`} aria-label="锁定">
      <LockIcon />
    </span>
  );
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
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
