"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuizQuestion } from "@/lib/types";
import { Quiz } from "./Quiz";

type Props = {
  articleSlug: string;
  pathSlug: string;
  lessonOrder: number;
  lessonTitle: string;
  questions: QuizQuestion[];
  nextLessonSlug: string | null;
};

export function QuizModalTrigger({
  articleSlug,
  pathSlug,
  lessonOrder,
  lessonTitle,
  questions,
  nextLessonSlug,
}: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <>
      <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl border border-orange-200 bg-orange-50/40 p-6 text-center">
        <div className="text-sm font-medium text-slate-700">
          {questions.length} 道题 ·
          {nextLessonSlug ? " 答完解锁下一讲" : " 答完即完成本路径"}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-1 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          {nextLessonSlug ? "完成本讲并答题" : "开始答题"}
          <span aria-hidden>→</span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
          aria-modal="true"
          role="dialog"
          aria-labelledby="quiz-modal-title"
        >
          <button
            type="button"
            aria-label="关闭小测"
            onClick={close}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                  第 {lessonOrder} 讲 · 小测
                </div>
                <h3
                  id="quiz-modal-title"
                  className="mt-1 text-lg font-semibold text-slate-950"
                >
                  {lessonTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="关闭"
                className="-mr-1 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <CloseIcon />
              </button>
            </div>

            <Quiz
              articleSlug={articleSlug}
              pathSlug={pathSlug}
              questions={questions}
              nextLessonSlug={nextLessonSlug}
              onClose={close}
            />
          </div>
        </div>
      )}
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
