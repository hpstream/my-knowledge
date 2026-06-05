"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getAllProgress,
  loadAllProgress,
  PROGRESS_UPDATE_EVENT,
  type ArticleProgress,
} from "@/lib/progress";

type LessonSummary = {
  slug: string;
  title: string;
  order: number;
  readMinutes: number;
  quizCount: number;
};

type Props = {
  pathSlug: string;
  pathTitle: string;
  lessons: LessonSummary[];
};

type LessonState = "active" | "completed" | "next" | "locked" | "pending";

export function PathSidebar({ pathSlug, pathTitle, lessons }: Props) {
  const pathname = usePathname();
  const [progress, setProgress] = useState<Record<string, ArticleProgress>>({});
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const completedCount = useMemo(
    () => lessons.filter((l) => progress[l.slug]?.completedAt).length,
    [lessons, progress],
  );

  const firstIncompleteIdx = useMemo(
    () => lessons.findIndex((l) => !progress[l.slug]?.completedAt),
    [lessons, progress],
  );

  function resolveState(idx: number, lesson: LessonSummary): LessonState {
    const isActive =
      pathname === `/paths/${pathSlug}/${lesson.slug}`;
    if (isActive) return "active";
    if (!hydrated) {
      return idx === 0 ? "next" : "pending";
    }
    if (progress[lesson.slug]?.completedAt) return "completed";
    if (idx === firstIncompleteIdx) return "next";
    return "locked";
  }

  const activeLesson = lessons.find(
    (l) => pathname === `/paths/${pathSlug}/${l.slug}`,
  );

  return (
    <div className="lg:py-8">
      <Link
        href={`/paths/${pathSlug}`}
        className="hidden text-sm text-slate-500 transition hover:text-slate-900 lg:inline-flex"
      >
        ← 返回路径概览
      </Link>

      {/* Mobile collapsible header */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left lg:hidden"
        aria-expanded={mobileOpen}
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            课程目录
          </div>
          <div className="mt-0.5 text-sm font-medium text-slate-900">
            {activeLesson
              ? `第 ${activeLesson.order} 讲 · ${activeLesson.title}`
              : pathTitle}
          </div>
        </div>
        <ChevronIcon open={mobileOpen} />
      </button>

      <div className={`${mobileOpen ? "block" : "hidden"} lg:block`}>
        <div className="mt-6 hidden lg:block">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Course
          </div>
          <Link
            href={`/paths/${pathSlug}`}
            className="mt-2 block text-base font-semibold leading-snug text-slate-900 transition hover:text-slate-950"
          >
            {pathTitle}
          </Link>
        </div>

        <ol className="mt-5 space-y-1.5">
          {lessons.map((lesson, idx) => {
            const state = resolveState(idx, lesson);
            return (
              <li key={lesson.slug}>
                <LessonRow
                  pathSlug={pathSlug}
                  lesson={lesson}
                  state={state}
                  onNavigate={() => setMobileOpen(false)}
                />
              </li>
            );
          })}
        </ol>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Progress
            </div>
            <div className="text-sm font-medium text-slate-800 tabular-nums">
              {hydrated ? completedCount : 0} / {lessons.length}
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
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

        <Link
          href={`/paths/${pathSlug}`}
          className="mt-4 inline-flex text-sm text-slate-500 transition hover:text-slate-900 lg:hidden"
        >
          ← 返回路径概览
        </Link>
      </div>
    </div>
  );
}

function LessonRow({
  pathSlug,
  lesson,
  state,
  onNavigate,
}: {
  pathSlug: string;
  lesson: LessonSummary;
  state: LessonState;
  onNavigate: () => void;
}) {
  const href = `/paths/${pathSlug}/${lesson.slug}`;

  const base =
    "group relative flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition";
  const styles: Record<LessonState, string> = {
    active:
      "border-emerald-200 bg-emerald-50 text-slate-900 shadow-[0_2px_8px_rgba(16,185,129,0.08)]",
    completed:
      "border-transparent bg-transparent text-slate-700 hover:bg-white",
    next: "border-transparent bg-transparent text-slate-800 hover:bg-white",
    pending: "border-transparent bg-transparent text-slate-700 hover:bg-white",
    locked:
      "border-transparent bg-transparent text-slate-400 cursor-not-allowed",
  };

  const titleClass =
    state === "active"
      ? "text-slate-900 font-semibold"
      : state === "locked"
        ? "text-slate-400"
        : "text-slate-800";

  const metaClass =
    state === "active"
      ? "text-emerald-700/80"
      : state === "locked"
        ? "text-slate-400"
        : "text-slate-500";

  const content = (
    <>
      {state === "active" && (
        <span className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-[3px] rounded-r-full bg-emerald-500" />
      )}
      <LessonNumber state={state} order={lesson.order} />
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm ${titleClass}`}>
          {lesson.title}
        </span>
        <span className={`mt-0.5 block text-[11px] ${metaClass}`}>
          {lesson.readMinutes} 分钟 · {lesson.quizCount} 题
        </span>
      </span>
    </>
  );

  if (state === "locked" || state === "active") {
    return (
      <div
        className={`${base} ${styles[state]}`}
        aria-current={state === "active" ? "page" : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${base} ${styles[state]}`}
    >
      {content}
    </Link>
  );
}

function LessonNumber({
  state,
  order,
}: {
  state: LessonState;
  order: number;
}) {
  const wrap =
    "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold";
  if (state === "completed") {
    return <span className={`${wrap} bg-emerald-500 text-white`}>✓</span>;
  }
  if (state === "active") {
    return (
      <span className={`${wrap} bg-emerald-500 text-white shadow-sm`}>
        {order}
      </span>
    );
  }
  if (state === "locked") {
    return (
      <span
        className={`${wrap} bg-slate-100 text-slate-400`}
        aria-label="未解锁"
      >
        <LockIcon />
      </span>
    );
  }
  if (state === "next") {
    return (
      <span
        className={`${wrap} border-[1.5px] border-emerald-400 bg-white text-emerald-700`}
      >
        {order}
      </span>
    );
  }
  return <span className={`${wrap} bg-slate-100 text-slate-500`}>{order}</span>;
}

function LockIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
