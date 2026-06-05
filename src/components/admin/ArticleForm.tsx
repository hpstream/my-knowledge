"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ArticleKind = "lesson" | "topic";

export type ArticleFormValues = {
  slug: string;
  kind: ArticleKind;
  pathSlug: string;
  title: string;
  summary: string;
  body: string;
  order: number;
  readMinutes: number;
  difficulty: number | "";
  estimatedMinutes: number | "";
  cost: string;
  quizJson: string;
  status: "draft" | "published";
};

export type PathOption = {
  slug: string;
  title: string;
};

type Props = {
  mode: "create" | "edit";
  articleId?: string;
  initial: ArticleFormValues;
  pathOptions: PathOption[];
};

const CALLOUT_SNIPPET = `:::prep 准备清单
- 你的网站项目
- 信用卡（开 API 账号用）
:::

:::apply 申请 DeepSeek API Key
1. 访问 platform.deepseek.com
2. 注册并实名认证
3. 充值 ¥10
4. 创建 API Key
:::

:::prompt 给 AI 的提示词
我要在我的 Next.js 项目里加 AI 聊天，要求：
- 后端代理路由
- 流式响应
- 不要在前端暴露 API Key
:::

:::verify 验证步骤
- 浏览器打开 /chat，能看到输入框
- 输入"你好"，字符流式出现
- 网络面板 /api/chat 返回 200 + text/event-stream
:::

:::pitfall AI 翻车点
**症状**：401 unauthorized
**原因**：AI 用了 OpenAI SDK 但没指定 baseURL
**修复 prompt**：你刚生成的代码使用 OpenAI SDK 没有指定 baseURL，
请用 baseURL: 'https://api.deepseek.com/v1' 重写整个 route。
:::`;

export function ArticleForm({
  mode,
  articleId,
  initial,
  pathOptions,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleFormValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const isTopic = values.kind === "topic";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let quiz: unknown;
    try {
      quiz = JSON.parse(values.quizJson || "[]");
    } catch {
      setError("Quiz JSON 解析失败：不是合法的 JSON");
      return;
    }
    if (!Array.isArray(quiz)) {
      setError("Quiz JSON 必须是数组");
      return;
    }

    if (!isTopic && !values.pathSlug.trim()) {
      setError("基础课时必须选择所属路径");
      return;
    }

    setSubmitting(true);
    try {
      const trimmedSlug = values.slug.trim();
      const payload: Record<string, unknown> = {
        kind: values.kind,
        pathSlug: isTopic ? null : values.pathSlug.trim(),
        title: values.title.trim(),
        summary: values.summary.trim() || null,
        body: values.body,
        order: Number(values.order) || 1,
        readMinutes: Number(values.readMinutes),
        difficulty: values.difficulty === "" ? null : Number(values.difficulty),
        estimatedMinutes:
          values.estimatedMinutes === ""
            ? null
            : Number(values.estimatedMinutes),
        cost: values.cost.trim() || null,
        quiz,
        status: values.status,
      };
      if (trimmedSlug) payload.slug = trimmedSlug;

      const url =
        mode === "create"
          ? "/api/admin/articles"
          : `/api/admin/articles/${articleId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (data.error === "SLUG_TAKEN") {
          setError("该 slug 已存在，请换一个");
        } else if (data.error === "VALIDATION_ERROR") {
          setError("字段校验失败，请检查所有必填项");
        } else if (data.error === "FORBIDDEN") {
          setError("权限不足");
        } else {
          setError("保存失败，请重试");
        }
        return;
      }

      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !articleId) return;
    if (!confirm("确认删除这篇文章？此操作不可恢复。")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("删除失败");
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  function appendCalloutSnippet() {
    setValues((prev) => ({
      ...prev,
      body: prev.body + (prev.body.endsWith("\n") ? "\n" : "\n\n") + CALLOUT_SNIPPET,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kind switcher */}
      <Field label="内容类型 (Kind)" htmlFor="kind">
        <div className="flex gap-3">
          {(
            [
              {
                value: "lesson" as const,
                label: "基础课时 (Lesson)",
                hint: "属于某条学习路径的一讲，按顺序学",
              },
              {
                value: "topic" as const,
                label: "专题文章 (Topic)",
                hint: "独立成篇，专门解决一个卡点",
              },
            ]
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex flex-1 cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition ${
                values.kind === opt.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={opt.value}
                checked={values.kind === opt.value}
                onChange={() => setField("kind", opt.value)}
                className="sr-only"
              />
              <span className="font-medium">{opt.label}</span>
              <span
                className={`text-xs ${
                  values.kind === opt.value
                    ? "text-white/70"
                    : "text-slate-500"
                }`}
              >
                {opt.hint}
              </span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="标题" htmlFor="title">
        <input
          id="title"
          type="text"
          required
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Lesson-only: pathSlug + order */}
      {!isTopic && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="所属路径" htmlFor="pathSlug">
            <select
              id="pathSlug"
              required
              value={values.pathSlug}
              onChange={(e) => setField("pathSlug", e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                -- 选择路径 --
              </option>
              {pathOptions.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}（{p.slug}）
                </option>
              ))}
            </select>
          </Field>
          <Field label="顺序 (order)" htmlFor="order">
            <input
              id="order"
              type="number"
              required
              min={1}
              value={values.order}
              onChange={(e) => setField("order", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="预计阅读（分钟）" htmlFor="readMinutes">
            <input
              id="readMinutes"
              type="number"
              required
              min={1}
              value={values.readMinutes}
              onChange={(e) =>
                setField("readMinutes", Number(e.target.value))
              }
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {/* Topic-only: difficulty / time / cost */}
      {isTopic && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="难度 (1-5)"
            htmlFor="difficulty"
            hint="可选，1=最简单，5=最难"
          >
            <input
              id="difficulty"
              type="number"
              min={1}
              max={5}
              value={values.difficulty}
              onChange={(e) =>
                setField(
                  "difficulty",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className={inputClass}
              placeholder="例：3"
            />
          </Field>
          <Field
            label="预计时长（分钟）"
            htmlFor="estimatedMinutes"
            hint="可选，包含阅读 + 实操"
          >
            <input
              id="estimatedMinutes"
              type="number"
              min={1}
              value={values.estimatedMinutes}
              onChange={(e) =>
                setField(
                  "estimatedMinutes",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className={inputClass}
              placeholder="例：45"
            />
          </Field>
          <Field
            label="预估成本 (cost)"
            htmlFor="cost"
            hint="可选，例：免费 / ¥10 起 / $20/月"
          >
            <input
              id="cost"
              type="text"
              maxLength={80}
              value={values.cost}
              onChange={(e) => setField("cost", e.target.value)}
              className={inputClass}
              placeholder="例：免费 / ¥10 起"
            />
          </Field>
        </div>
      )}

      {/* Hidden readMinutes for topics (still required by schema) */}
      {isTopic && (
        <Field
          label="阅读时长备用 (readMinutes)"
          htmlFor="readMinutes-topic"
          hint="兼容字段，默认 = 预计时长"
        >
          <input
            id="readMinutes-topic"
            type="number"
            required
            min={1}
            value={values.readMinutes}
            onChange={(e) => setField("readMinutes", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      )}

      <Field label="摘要 (summary)" htmlFor="summary">
        <input
          id="summary"
          type="text"
          value={values.summary}
          onChange={(e) => setField("summary", e.target.value)}
          className={inputClass}
          placeholder="一句话简介（前台列表显示）"
        />
      </Field>

      <Field label="正文 (Markdown)" htmlFor="body">
        <div className="mb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={appendCalloutSnippet}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 transition hover:border-slate-500"
          >
            + 插入 5 个内嵌模块模板
          </button>
          <span className="text-xs text-slate-500">
            支持 <code className="font-mono">:::prep</code> /{" "}
            <code className="font-mono">:::apply</code> /{" "}
            <code className="font-mono">:::prompt</code> /{" "}
            <code className="font-mono">:::verify</code> /{" "}
            <code className="font-mono">:::pitfall</code>
          </span>
        </div>
        <textarea
          id="body"
          required
          rows={24}
          value={values.body}
          onChange={(e) => setField("body", e.target.value)}
          className={`${inputClass} font-mono text-[13px] leading-6`}
        />
      </Field>

      <Field
        label="小测题 (Quiz JSON)"
        htmlFor="quizJson"
        hint='格式：[{"q":"题干","options":["A","B","C","D"],"answer":1,"explanation":"解释"}]'
      >
        <textarea
          id="quizJson"
          rows={10}
          value={values.quizJson}
          onChange={(e) => setField("quizJson", e.target.value)}
          className={`${inputClass} font-mono text-[12px] leading-5`}
        />
      </Field>

      <Field label="状态" htmlFor="status">
        <div className="flex gap-3">
          {(["draft", "published"] as const).map((s) => (
            <label
              key={s}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                values.status === s
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={values.status === s}
                onChange={() => setField("status", s)}
                className="sr-only"
              />
              {s === "draft" ? "草稿" : "立即发布"}
            </label>
          ))}
        </div>
      </Field>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="text-sm text-rose-600 transition hover:text-rose-700 disabled:opacity-40"
            >
              删除文章
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:opacity-40"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
          >
            {submitting ? "保存中…" : mode === "create" ? "创建文章" : "保存修改"}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium uppercase tracking-[0.16em] text-slate-500"
      >
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
