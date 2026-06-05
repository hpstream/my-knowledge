"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PathFormValues = {
  title: string;
  description: string;
  estimatedHours: number;
  level: string;
  category: string;
  badge: string;
  pricing: "free" | "paid";
  priceLabel: string;
  statusLabel: string;
  highlights: string[];
  accent: string;
  status: "draft" | "published";
  sortOrder: number;
};

type Props = {
  mode: "create" | "edit";
  pathId?: string;
  initial: PathFormValues;
};

const ACCENT_OPTIONS = [
  { value: "", label: "无" },
  { value: "emerald", label: "Emerald 绿" },
  { value: "amber", label: "Amber 琥珀" },
  { value: "cyan", label: "Cyan 青" },
];

export function PathForm({ mode, pathId, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<PathFormValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof PathFormValues>(
    key: K,
    value: PathFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateHighlight(idx: number, val: string) {
    setValues((prev) => {
      const next = [...prev.highlights];
      next[idx] = val;
      return { ...prev, highlights: next };
    });
  }

  function addHighlight() {
    setValues((prev) => ({ ...prev, highlights: [...prev.highlights, ""] }));
  }

  function removeHighlight(idx: number) {
    setValues((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: values.title.trim(),
        description: values.description.trim(),
        estimatedHours: Number(values.estimatedHours),
        level: values.level.trim() || "Beginner",
        category: values.category.trim() || "AI Engineering",
        badge: values.badge.trim() || null,
        pricing: values.pricing,
        priceLabel: values.priceLabel.trim() || null,
        statusLabel: values.statusLabel.trim() || null,
        highlights: values.highlights
          .map((h) => h.trim())
          .filter((h) => h.length > 0),
        accent: values.accent || null,
        status: values.status,
        sortOrder: Number(values.sortOrder),
      };

      const url =
        mode === "create"
          ? "/api/admin/paths"
          : `/api/admin/paths/${pathId}`;
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
        if (data.error === "VALIDATION_ERROR") {
          setError("字段校验失败，请检查所有必填项");
        } else if (data.error === "FORBIDDEN") {
          setError("权限不足");
        } else {
          setError("保存失败，请重试");
        }
        return;
      }

      router.push("/admin/paths");
      router.refresh();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !pathId) return;
    if (!confirm("确认删除这条学习路径？此操作不可恢复。")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/paths/${pathId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (data.error === "HAS_ARTICLES" && data.message) {
          setError(data.message);
        } else {
          setError("删除失败");
        }
        return;
      }
      router.push("/admin/paths");
      router.refresh();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Field label="描述" htmlFor="description">
        <textarea
          id="description"
          required
          rows={3}
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="分类 (category)" htmlFor="category">
          <input
            id="category"
            type="text"
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="难度 (level)" htmlFor="level">
          <input
            id="level"
            type="text"
            value={values.level}
            onChange={(e) => setField("level", e.target.value)}
            className={inputClass}
            placeholder="Beginner / Intermediate / Advanced"
          />
        </Field>
        <Field label="预计时长（小时）" htmlFor="estimatedHours">
          <input
            id="estimatedHours"
            type="number"
            min={0.5}
            step={0.5}
            required
            value={values.estimatedHours}
            onChange={(e) =>
              setField("estimatedHours", Number(e.target.value))
            }
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="徽章文案 (badge)" htmlFor="badge" hint="例：Free Starter">
          <input
            id="badge"
            type="text"
            value={values.badge}
            onChange={(e) => setField("badge", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="状态标签 (statusLabel)" htmlFor="statusLabel" hint="例：适合立即开始">
          <input
            id="statusLabel"
            type="text"
            value={values.statusLabel}
            onChange={(e) => setField("statusLabel", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="收费方式" htmlFor="pricing">
          <div className="flex gap-2">
            {(["free", "paid"] as const).map((p) => (
              <label
                key={p}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm transition ${
                  values.pricing === p
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="pricing"
                  value={p}
                  checked={values.pricing === p}
                  onChange={() => setField("pricing", p)}
                  className="sr-only"
                />
                {p === "free" ? "免费" : "付费"}
              </label>
            ))}
          </div>
        </Field>
        <Field label="价格文案 (priceLabel)" htmlFor="priceLabel" hint="例：免费 / ¥299">
          <input
            id="priceLabel"
            type="text"
            value={values.priceLabel}
            onChange={(e) => setField("priceLabel", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="强调色 (accent)" htmlFor="accent">
          <select
            id="accent"
            value={values.accent}
            onChange={(e) => setField("accent", e.target.value)}
            className={inputClass}
          >
            {ACCENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="亮点列表 (highlights)" htmlFor="highlights">
        <div className="space-y-2">
          {values.highlights.map((h, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={h}
                onChange={(e) => updateHighlight(idx, e.target.value)}
                className={inputClass}
                placeholder="例：5 篇真实文章 + 配套小测"
              />
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                className="rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                aria-label="删除这条亮点"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addHighlight}
            className="text-sm text-emerald-700 transition hover:text-emerald-800"
          >
            + 添加亮点
          </button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="状态" htmlFor="status">
          <div className="flex gap-2">
            {(["draft", "published"] as const).map((s) => (
              <label
                key={s}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm transition ${
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
        <Field label="排序 (sortOrder)" htmlFor="sortOrder" hint="数字小的优先展示">
          <input
            id="sortOrder"
            type="number"
            value={values.sortOrder}
            onChange={(e) => setField("sortOrder", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

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
              删除路径
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
            {submitting ? "保存中…" : mode === "create" ? "创建路径" : "保存修改"}
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
