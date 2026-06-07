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
  readMinutes: number;
  quizCount: number;
};

type Props = {
  pathSlug: string;
  lessons: Lesson[];
};

type LessonState = "completed" | "current" | "locked";

export function PathLessonList({ pathSlug, lessons }: Props) {
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
    if (!hydrated) return idx === 0 ? "current" : "locked";
    if (progress[lesson.slug]?.completedAt) return "completed";
    if (idx === firstIncompleteIdx) return "current";
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
    <ol className="space-y-3">
      {lessons.map((lesson, idx) => {
        const state = resolveState(idx, lesson);
        const score = progress[lesson.slug]?.score;

        const inner = (
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
                  className={`mt-1 text-xs ${
                    state === "locked" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {lesson.readMinutes} 分钟阅读 · {lesson.quizCount} 道题
                  {hydrated && score
                    ? ` · 答对 ${score.correct}/${score.total} 题`
                    : ""}
                </div>
              </div>
            </div>
            <LessonAction state={state} />
          </div>
        );

        const baseClass = "block rounded-2xl border p-4 transition";
        const stateClass = {
          completed:
            "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
          current:
            "border-orange-200 bg-orange-50/60 hover:border-orange-300 hover:shadow-sm",
          locked: "border-slate-200 bg-slate-50 cursor-not-allowed",
        }[state];

        return (
          <li key={lesson.slug}>
            {state === "locked" ? (
              <div
                className={`${baseClass} ${stateClass}`}
                aria-disabled="true"
              >
                {inner}
              </div>
            ) : (
              <Link
                href={`/paths/${pathSlug}/${lesson.slug}`}
                onClick={(e) => handleClick(e, lesson.slug)}
                className={`${baseClass} ${stateClass}`}
              >
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
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
    return (
      <span className={`${base} bg-orange-500 text-white`}>
        {String(order).padStart(2, "0")}
      </span>
    );
  }
  return (
    <span
      className={`${base} bg-slate-100 text-slate-400`}
      aria-label="锁定"
    >
      <LockIcon />
    </span>
  );
}

function LessonAction({ state }: { state: LessonState }) {
  if (state === "completed") {
    return (
      <span className="flex-shrink-0 text-sm text-emerald-600">复习 →</span>
    );
  }
  if (state === "current") {
    return (
      <span className="flex-shrink-0 text-sm font-medium text-orange-600">
        当前在学 →
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 text-xs text-slate-400">
      完成上一讲解锁
    </span>
  );
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
