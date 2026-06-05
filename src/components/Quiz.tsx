"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/types";
import { completeQuiz, recordAttempt } from "@/lib/progress";

type Props = {
  articleSlug: string;
  pathSlug: string;
  questions: QuizQuestion[];
  nextLessonSlug?: string | null;
  onClose?: () => void;
};

type SelectedMap = Record<number, number>;

export function Quiz({
  articleSlug,
  pathSlug,
  questions,
  nextLessonSlug,
  onClose,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<SelectedMap>({});
  const [finished, setFinished] = useState(false);

  const question = questions[current];
  const userChoice = selected[current];
  const hasAnswered = userChoice !== undefined;
  const isCorrect = hasAnswered && userChoice === question.answer;

  const score = useMemo(() => {
    const correct = Object.entries(selected).reduce((acc, [idx, choice]) => {
      const q = questions[Number(idx)];
      return q && choice === q.answer ? acc + 1 : acc;
    }, 0);
    return { correct, total: questions.length };
  }, [selected, questions]);

  function handleSelect(optionIndex: number) {
    if (hasAnswered) return;
    const correct = optionIndex === question.answer;
    const nextSelected: SelectedMap = { ...selected, [current]: optionIndex };
    setSelected(nextSelected);
    void recordAttempt(pathSlug, articleSlug, {
      questionIndex: current,
      selectedIndex: optionIndex,
      correct,
      at: Date.now(),
    });
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      void completeQuiz(pathSlug, articleSlug, score);
      setFinished(true);
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(current - 1);
  }

  if (finished) {
    const nextHref = nextLessonSlug
      ? `/paths/${pathSlug}/${nextLessonSlug}`
      : `/paths/${pathSlug}`;
    const nextLabel = nextLessonSlug ? "学习下一讲 ›" : "返回路径概览 ›";

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <div className="text-5xl font-semibold tabular-nums text-slate-950">
          {score.correct}
          <span className="text-slate-300"> / {score.total}</span>
        </div>
        <p className="mt-3 text-slate-600">
          本讲完成 · 答对率 {Math.round((score.correct / score.total) * 100)}%
        </p>
        <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              留在本讲
            </button>
          )}
          <Link
            href={nextHref}
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {nextLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="tabular-nums">
          {current + 1} / {questions.length}
        </span>
        <div className="mx-4 h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold leading-relaxed text-slate-950">
        {question.q}
      </h2>

      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const isSelected = userChoice === idx;
          const isAnswer = question.answer === idx;
          const showCorrect = hasAnswered && isAnswer;
          const showWrong = hasAnswered && isSelected && !isAnswer;
          const base =
            "w-full rounded-2xl border px-4 py-3 text-left transition-colors";
          const state = showCorrect
            ? "border-emerald-400 bg-emerald-50"
            : showWrong
              ? "border-rose-400 bg-rose-50"
              : isSelected
                ? "border-slate-900 bg-white"
                : "border-slate-200 bg-white hover:border-slate-400";
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={hasAnswered}
              className={`${base} ${state} disabled:cursor-default`}
            >
              <span className="mr-3 font-mono text-sm text-slate-400">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-slate-800">{option}</span>
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div
          className={`rounded-2xl border p-4 text-sm leading-relaxed ${
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="mb-1 font-semibold">
            {isCorrect ? "✓ 正确" : "✗ 不对"}
          </div>
          <div>{question.explanation}</div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={current === 0}
          className="text-sm text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← 上一题
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!hasAnswered}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {current === questions.length - 1 ? "完成 ›" : "下一题 ›"}
        </button>
      </div>
    </div>
  );
}
