"use client";

import { useEffect, useState } from "react";

const PAID_COURSES = [
  {
    slug: "build-ai-agent",
    title: "如何实现一个 AI Agent",
    description: "从工具调用到记忆系统，亲手做一个能干活的 Agent。",
    cover: "violet",
    badge: "进阶",
    estimatedHours: 6,
    lessonCount: 12,
  },
  {
    slug: "build-and-launch-site",
    title: "如何从零搭建一个上线网站",
    description: "不是 Hello World，而是真的能上线、能赚钱的项目从 0 到 1。",
    cover: "orange",
    badge: "实战",
    estimatedHours: 10,
    lessonCount: 20,
  },
  {
    slug: "build-desktop-app",
    title: "如何开发一个桌面应用",
    description: "用 Tauri / Electron 把网页能力打包成 Mac/Windows 桌面应用。",
    cover: "emerald",
    badge: "实战",
    estimatedHours: 8,
    lessonCount: 14,
  },
];

const COVER_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  violet: { bg: "bg-violet-100", text: "text-violet-800", dot: "bg-violet-500" },
  orange: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
};

export function PaidCoursesSection() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  function handleClick(title: string) {
    setToast(`「${title}」即将上线，敬请期待`);
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            付费课程
          </h2>
          <span className="text-sm text-slate-400">即将上线</span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PAID_COURSES.map((c) => {
            const styles = COVER_STYLES[c.cover];
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => handleClick(c.title)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="relative">
                  <div
                    className={`flex h-28 items-center justify-center px-4 ${styles.bg}`}
                  >
                    <span
                      className={`line-clamp-2 text-center text-sm font-semibold leading-snug ${styles.text}`}
                    >
                      {c.title}
                    </span>
                  </div>
                  <span className="absolute right-2 top-2 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
                    付费
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                    {c.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {c.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {c.badge}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      实战
                    </span>
                  </div>
                  <div className="mt-auto pt-4 text-xs text-slate-400">
                    {c.lessonCount} 讲 · 约 {c.estimatedHours} 小时
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="pointer-events-auto rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
