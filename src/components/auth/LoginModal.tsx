"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import type { CurrentUser } from "./AuthProvider";

type Step = "email" | "code";

type Props = {
  onClose: () => void;
  onSuccess: (user: CurrentUser) => void;
};

type LoginError =
  | { kind: "rate-limited" }
  | { kind: "message"; text: string }
  | null;

const CODE_LENGTH = 6;

export function LoginModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LoginError>(null);
  const [resendIn, setResendIn] = useState(0);

  const errorText = useMemo(() => {
    if (!error) return null;
    if (error.kind === "rate-limited") {
      return resendIn > 0 ? `太频繁了，请 ${resendIn} 秒后再试` : null;
    }
    return error.text;
  }, [error, resendIn]);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);
  const verifyInFlight = useRef(false);

  const code = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey as EventListener);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey as EventListener);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
    if (step === "code") digitRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const verifyCode = useCallback(
    async (codeToVerify: string) => {
      if (codeToVerify.length !== CODE_LENGTH) {
        setError({ kind: "message", text: "请输入 6 位验证码" });
        return;
      }
      if (verifyInFlight.current) return;
      verifyInFlight.current = true;
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch("/api/auth/email/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            code: codeToVerify,
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
            setError({
              kind: "message",
              text:
                data.attemptsLeft != null
                  ? `验证码不对，还可以尝试 ${data.attemptsLeft} 次`
                  : "验证码不对",
            });
          } else if (data.error === "CODE_EXPIRED") {
            setError({ kind: "message", text: "验证码已过期，请重新获取" });
          } else if (data.error === "TOO_MANY_ATTEMPTS") {
            setError({
              kind: "message",
              text: "尝试次数过多，请重新获取验证码",
            });
          } else if (data.error === "NO_PENDING_CODE") {
            setError({ kind: "message", text: "请先获取验证码" });
          } else {
            setError({ kind: "message", text: "登录失败，请稍后重试" });
          }
          setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
          digitRefs.current[0]?.focus();
          return;
        }
        onSuccess(data.user);
      } catch {
        setError({ kind: "message", text: "网络异常，请重试" });
      } finally {
        verifyInFlight.current = false;
        setSubmitting(false);
      }
    },
    [email, onSuccess],
  );

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
          setError({ kind: "rate-limited" });
        } else if (data.error === "INVALID_EMAIL") {
          setError({ kind: "message", text: "邮箱格式不正确" });
        } else {
          setError({ kind: "message", text: "发送失败，请稍后重试" });
        }
        return;
      }
      setStep("code");
      setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
      setResendIn(60);
    } catch {
      setError({ kind: "message", text: "网络异常，请重试" });
    } finally {
      setSubmitting(false);
    }
  }

  function backToEmail() {
    setStep("email");
    setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
    setError(null);
  }

  function handleDigitChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");

    const next = [...digits];
    let focusTarget = index;

    if (cleaned.length === 0) {
      next[index] = "";
    } else {
      let cursor = index;
      for (const ch of cleaned) {
        if (cursor >= CODE_LENGTH) break;
        next[cursor] = ch;
        cursor += 1;
      }
      focusTarget = Math.min(cursor, CODE_LENGTH - 1);
    }

    setDigits(next);
    requestAnimationFrame(() => digitRefs.current[focusTarget]?.focus());

    const joined = next.join("");
    if (
      joined.length === CODE_LENGTH &&
      next.every((d) => d.length === 1) &&
      !verifyInFlight.current
    ) {
      void verifyCode(joined);
    }
  }

  function handleDigitKeyDown(
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        return;
      }
      if (index > 0) {
        e.preventDefault();
        digitRefs.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      digitRefs.current[index - 1]?.focus();
      return;
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      e.preventDefault();
      digitRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitPaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    handleDigitChange(index, text.slice(0, CODE_LENGTH - index));
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-[#2a261d]/45 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-[380px]">
        <div className="relative rounded-[24px] border border-[#ece4d0] bg-white px-6 pb-6 pt-7 shadow-[0_24px_60px_rgba(20,18,12,0.18)]">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#b8b2a0] transition hover:bg-black/5 hover:text-[#1a1812]"
          >
            <CloseIcon />
          </button>

          <div className="mb-3 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[15px] font-bold text-orange-600 ring-1 ring-orange-200">
              超
            </div>
          </div>

          {step === "email" ? (
            <EmailStep
              email={email}
              emailRef={emailRef}
              emailValid={emailValid}
              error={errorText}
              submitting={submitting}
              onChangeEmail={setEmail}
              onSubmit={() => {
                if (!submitting && emailValid) void requestCode();
              }}
            />
          ) : (
            <CodeStep
              email={email}
              digits={digits}
              digitRefs={digitRefs}
              error={errorText}
              submitting={submitting}
              resendIn={resendIn}
              onDigitChange={handleDigitChange}
              onDigitKeyDown={handleDigitKeyDown}
              onDigitPaste={handleDigitPaste}
              onSubmit={() => {
                if (!submitting) void verifyCode(code);
              }}
              onResend={() => {
                if (resendIn > 0 || submitting) return;
                void requestCode();
              }}
              onBack={backToEmail}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type EmailStepProps = {
  email: string;
  emailRef: React.RefObject<HTMLInputElement | null>;
  emailValid: boolean;
  error: string | null;
  submitting: boolean;
  onChangeEmail: (value: string) => void;
  onSubmit: () => void;
};

function EmailStep({
  email,
  emailRef,
  emailValid,
  error,
  submitting,
  onChangeEmail,
  onSubmit,
}: EmailStepProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="text-center">
        <h2
          id="login-modal-title"
          className="text-[22px] font-bold tracking-[-0.01em] text-[#1a1812]"
        >
          登录超级个体
        </h2>
        <p className="mt-1.5 text-[13px] text-[#9c9685]">
          用邮箱继续，1 分钟搞定
        </p>
      </div>

      <StepIndicator active="email" />

      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-[13px] font-medium text-[#3d3a30]"
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
          onChange={(e) => onChangeEmail(e.target.value)}
          placeholder="你的邮箱地址"
          className="h-11 w-full rounded-xl border border-[#e6dec7] bg-white px-3.5 text-[14px] text-[#1a1812] placeholder:text-[#b8b2a0] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
        />
      </div>

      {error && <FormError text={error} />}

      <button
        type="submit"
        disabled={submitting || !emailValid}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-[14px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-[#f3c8a8]"
      >
        <span>{submitting ? "发送中…" : "发送验证码"}</span>
        {!submitting && <PaperPlaneIcon />}
      </button>

      <p className="pt-1 text-center text-[12px] leading-5 text-[#a6a08f]">
        登录即同意
        <a
          href="/about"
          className="mx-0.5 text-orange-600 underline-offset-2 hover:underline"
        >
          《服务条款》
        </a>
        和
        <a
          href="/about"
          className="mx-0.5 text-orange-600 underline-offset-2 hover:underline"
        >
          《隐私协议》
        </a>
      </p>
    </form>
  );
}

type CodeStepProps = {
  email: string;
  digits: string[];
  digitRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  error: string | null;
  submitting: boolean;
  resendIn: number;
  onDigitChange: (index: number, raw: string) => void;
  onDigitKeyDown: (index: number, e: KeyboardEvent<HTMLInputElement>) => void;
  onDigitPaste: (index: number, e: ClipboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
};

function CodeStep({
  email,
  digits,
  digitRefs,
  error,
  submitting,
  resendIn,
  onDigitChange,
  onDigitKeyDown,
  onDigitPaste,
  onSubmit,
  onResend,
  onBack,
}: CodeStepProps) {
  const codeFilled = digits.every((d) => d.length === 1);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="text-center">
        <h2
          id="login-modal-title"
          className="text-[22px] font-bold tracking-[-0.01em] text-[#1a1812]"
        >
          输入验证码
        </h2>
        <p className="mt-1.5 truncate text-[13px] text-[#9c9685]">
          已发送至 <span className="text-[#3d3a30]">{email}</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-1.5">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              digitRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={d}
            onChange={(e) => onDigitChange(i, e.target.value)}
            onKeyDown={(e) => onDigitKeyDown(i, e)}
            onPaste={(e) => onDigitPaste(i, e)}
            aria-label={`验证码第 ${i + 1} 位`}
            className="h-11 w-11 rounded-lg border border-[#e6dec7] bg-white text-center text-lg font-semibold text-[#1a1812] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
          />
        ))}
      </div>

      <p className="text-center text-[12px] text-[#a6a08f]">
        {resendIn > 0 ? (
          <>{resendIn} 秒后可重发</>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={submitting}
            className="text-orange-600 hover:underline disabled:cursor-not-allowed disabled:text-[#c8c2af]"
          >
            重新发送验证码
          </button>
        )}
      </p>

      {error && <FormError text={error} />}

      <button
        type="submit"
        disabled={submitting || !codeFilled}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-orange-500 px-5 text-[14px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-[#f3c8a8]"
      >
        {submitting ? "登录中…" : "验证并登录"}
      </button>

      <p className="pt-1 text-center text-[12px] text-[#a6a08f]">
        <button
          type="button"
          onClick={onBack}
          className="text-[#6b6655] hover:text-orange-600"
        >
          换个邮箱
        </button>
      </p>
    </form>
  );
}

function StepIndicator({ active }: { active: Step }) {
  return (
    <div className="flex items-center justify-center gap-2 text-[12px]">
      <span
        className={
          active === "email"
            ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white"
            : "inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d4cba7] text-[10px] font-bold text-[#b8b2a0]"
        }
      >
        1
      </span>
      <span
        className={
          active === "email" ? "font-medium text-[#1a1812]" : "text-[#9c9685]"
        }
      >
        输入邮箱
      </span>
      <span
        aria-hidden="true"
        className="mx-1 h-px w-8 bg-[#e6dec7]"
      />
      <span
        className={
          active === "code"
            ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white"
            : "inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d4cba7] text-[10px] font-bold text-[#b8b2a0]"
        }
      >
        2
      </span>
      <span
        className={
          active === "code" ? "font-medium text-[#1a1812]" : "text-[#9c9685]"
        }
      >
        验证码
      </span>
    </div>
  );
}

function FormError({ text }: { text: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[#f4a4a0]/40 bg-[#fff1ef] px-4 py-3 text-sm text-[#9f2f2a]"
    >
      {text}
    </div>
  );
}

function PaperPlaneIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2.5 11.3 21 3.2c.7-.3 1.4.4 1.1 1.1l-8.1 18.5c-.3.7-1.3.8-1.6.1l-3.2-7.1-7.1-3.2c-.7-.3-.7-1.3 0-1.6Z" />
    </svg>
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
