"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

type Props = {
  articleSlug: string;
};

type Category = "issue" | "improve" | "praise";

const CATEGORY_LABELS: Record<Category, string> = {
  issue: "这步跑不通",
  improve: "建议改进",
  praise: "想说声谢谢",
};

export function FeedbackTrigger({ articleSlug }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("issue");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setTimeout(() => {
      setBody("");
      setEmail("");
      setCategory("issue");
      setDone(false);
      setError(null);
    }, 200);
  }

  async function submit() {
    if (body.trim().length < 2) {
      setError("请写几个字描述一下");
      return;
    }
    if (!user && !email.trim()) {
      setError("没登录的话留个邮箱，方便我们回复你");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleSlug,
          category,
          body: body.trim(),
          email: user ? null : email.trim(),
        }),
      });
      if (!res.ok) {
        setError("提交失败，请稍后再试");
        return;
      }
      setDone(true);
    } catch {
      setError("网络异常");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCategory("issue");
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span aria-hidden>🐛</span>
          <span>跑不通</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setCategory("improve");
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span aria-hidden>💡</span>
          <span>建议</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setCategory("praise");
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span aria-hidden>💚</span>
          <span>感谢</span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="关闭"
            onClick={close}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">反馈这一篇</h3>
                <p className="mt-1 text-sm text-slate-500">
                  告诉我们哪里有问题，我们会更新这篇文章。
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="关闭"
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {done ? (
              <div className="mt-8 text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">
                  ✓
                </div>
                <p className="mt-4 text-lg font-medium text-slate-900">
                  收到，谢谢你！
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  我们会一条条看，重要的会回复你。
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
                >
                  关闭
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <div className="mb-2 text-xs font-medium text-slate-500">
                    类型
                  </div>
                  <div className="flex gap-2">
                    {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={
                          category === c
                            ? "flex-1 rounded-full bg-orange-500 px-3 py-2 text-sm font-medium text-white transition"
                            : "flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                        }
                      >
                        {CATEGORY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="fb-body" className="text-xs font-medium text-slate-500">
                    描述
                  </label>
                  <textarea
                    id="fb-body"
                    rows={5}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={
                      category === "issue"
                        ? "卡在哪一步？看到的错误是什么？AI 给的 prompt 是什么？"
                        : category === "improve"
                          ? "建议补充哪段、删掉哪段、加哪个示例？"
                          : "随便聊聊都行"
                    }
                    maxLength={2000}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                  />
                  <div className="mt-1 text-right text-xs text-slate-400">
                    {body.length} / 2000
                  </div>
                </div>

                {!user && (
                  <div className="mt-3">
                    <label htmlFor="fb-email" className="text-xs font-medium text-slate-500">
                      你的邮箱（可选，方便我们回复）
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    />
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    disabled={submitting}
                    className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-40"
                  >
                    {submitting ? "提交中…" : "提交反馈"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
