"use client";

import { useEffect, useRef, useState } from "react";
import type { CurrentUser } from "./AuthProvider";

type Step = "email" | "code";

type Props = {
  onClose: () => void;
  onSuccess: (user: CurrentUser) => void;
};

export function LoginModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const codeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function requestCode() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/email/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          retryAfter?: number;
        };
        if (data.error === "TOO_FREQUENT" && data.retryAfter) {
          setResendIn(data.retryAfter);
          setError(`太频繁了，请 ${data.retryAfter} 秒后再试`);
        } else if (data.error === "INVALID_EMAIL") {
          setError("邮箱格式不正确");
        } else {
          setError("发送失败，请稍后重试");
        }
        return;
      }
      setStep("code");
      setResendIn(60);
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode() {
    if (code.length !== 6) {
      setError("请输入 6 位验证码");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        user?: CurrentUser;
        error?: string;
        attemptsLeft?: number;
      };
      if (!res.ok || !data.ok || !data.user) {
        if (data.error === "WRONG_CODE") {
          setError(
            data.attemptsLeft != null
              ? `验证码不对，还可以尝试 ${data.attemptsLeft} 次`
              : "验证码不对",
          );
        } else if (data.error === "CODE_EXPIRED") {
          setError("验证码已过期，请重新获取");
        } else if (data.error === "TOO_MANY_ATTEMPTS") {
          setError("尝试次数过多，请重新获取验证码");
        } else if (data.error === "NO_PENDING_CODE") {
          setError("请先获取验证码");
        } else {
          setError("登录失败，请稍后重试");
        }
        return;
      }
      onSuccess(data.user);
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  function backToEmail() {
    setStep("email");
    setCode("");
    setError(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <CloseIcon />
        </button>

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            登录 my-knowledge
          </div>
          <h2
            id="login-modal-title"
            className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950"
          >
            {step === "email" ? "用邮箱继续" : "输入验证码"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {step === "email"
              ? "无需注册，输入邮箱即可。首次登录会自动创建账号。"
              : `验证码已发送到 ${email}，15 分钟内有效`}
          </p>
        </div>

        {step === "email" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!submitting) requestCode();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
              >
                邮箱
              </label>
              <input
                id="login-email"
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            {error && <FormError text={error} />}
            <button
              type="submit"
              disabled={submitting || email.length === 0}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "发送中…" : "发送验证码"}
            </button>
            <p className="text-center text-xs leading-relaxed text-slate-500">
              本地开发模式下，验证码会直接打印到运行 <code>pnpm dev</code> 的终端窗口。
            </p>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!submitting) verifyCode();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="login-code"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500"
              >
                6 位验证码
              </label>
              <input
                id="login-code"
                ref={codeRef}
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            {error && <FormError text={error} />}
            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "登录中…" : "登录"}
            </button>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={backToEmail}
                className="text-slate-500 hover:text-slate-900"
              >
                ← 换个邮箱
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resendIn > 0 || submitting) return;
                  requestCode();
                }}
                disabled={resendIn > 0 || submitting}
                className="text-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {resendIn > 0 ? `重新发送 (${resendIn}s)` : "重新发送验证码"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FormError({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
      {text}
    </div>
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
