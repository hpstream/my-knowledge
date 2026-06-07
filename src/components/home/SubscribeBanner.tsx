"use client";

import { useState, type FormEvent } from "react";

export function SubscribeBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-9Z" />
            <path d="m4.5 7 7.5 5 7.5-5" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-900">订阅更新</div>
          <div className="text-sm text-slate-500">每周一封 · 最新攻略和工具</div>
        </div>
      </div>

      {submitted ? (
        <div className="text-sm font-medium text-emerald-600 lg:ml-auto">
          订阅成功，感谢支持 ✓
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2 lg:ml-auto lg:max-w-md">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="输入你的邮箱"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
            aria-label="邮箱"
          />
          <button
            type="submit"
            className="flex-shrink-0 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            订阅
          </button>
        </form>
      )}
    </div>
  );
}
