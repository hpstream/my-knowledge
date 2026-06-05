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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 border border-ink/30 bg-paper px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <span aria-hidden>📨</span>
        <span className="font-cjk-serif">反馈这一篇</span>
      </button>

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
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg bg-paper border border-ink ink-shadow-static p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-mono-strip text-ink-muted">
                  Article feedback
                </div>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
                  <span className="font-cjk-serif">反馈这一篇</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-ink-muted transition-colors hover:text-ink"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            {done ? (
              <div className="mt-8 text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-marker text-paper text-2xl">
                  ✓
                </div>
                <p className="mt-4 font-cjk-serif text-lg text-ink">
                  收到，谢谢你！
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  我们会一条条看，重要的会回复你。
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex items-center bg-ink px-5 py-2 text-sm text-paper transition-colors hover:bg-marker"
                >
                  关闭
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <div className="font-mono text-[10px] uppercase tracking-mono-strip text-ink-muted mb-2">
                    类型
                  </div>
                  <div className="flex gap-2">
                    {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`flex-1 border px-3 py-2 text-sm transition-colors ${
                          category === c
                            ? "border-ink bg-ink text-paper"
                            : "border-ink/30 bg-paper text-ink-soft hover:border-ink/60"
                        }`}
                      >
                        <span className="font-cjk-serif">
                          {CATEGORY_LABELS[c]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="fb-body"
                    className="font-mono text-[10px] uppercase tracking-mono-strip text-ink-muted"
                  >
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
                    className="mt-2 w-full border border-ink/30 bg-paper px-3 py-2 text-sm font-mono text-ink outline-none focus:border-ink"
                  />
                  <div className="mt-1 text-right font-mono text-[10px] text-ink-faint">
                    {body.length} / 2000
                  </div>
                </div>

                {!user && (
                  <div className="mt-3">
                    <label
                      htmlFor="fb-email"
                      className="font-mono text-[10px] uppercase tracking-mono-strip text-ink-muted"
                    >
                      你的邮箱（可选，方便我们回复）
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-2 w-full border border-ink/30 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                    />
                  </div>
                )}

                {error && (
                  <div className="mt-4 border border-stamp-red bg-paper px-3 py-2 text-sm text-stamp-red">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    disabled={submitting}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="bg-ink px-5 py-2 text-sm text-paper transition-colors hover:bg-marker disabled:opacity-40"
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
