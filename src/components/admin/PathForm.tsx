"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorBar } from "./EditorBar";
import { CoverUpload } from "./CoverUpload";
import { TagsInput } from "./TagsInput";
import { RibbonSelector, type RibbonValue } from "./RibbonSelector";
import {
  EditorField,
  EditorPanel,
  StatusToggle,
  editorInputClass,
} from "./EditorPanel";

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
  coverUrl: string | null;
  tags: string[];
  ribbon: RibbonValue;
  status: "draft" | "published";
  sortOrder: number;
};

export type RelatedArticle = {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: string;
};

export type PathStats = {
  published: number;
  draft: number;
  feedback: number;
};

type Props = {
  mode: "create" | "edit";
  pathId?: string;
  pathSlug?: string | null;
  initial: PathFormValues;
  relatedArticles?: RelatedArticle[];
  stats?: PathStats;
};

export function PathForm({
  mode,
  pathId,
  pathSlug,
  initial,
  relatedArticles = [],
  stats,
}: Props) {
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

  async function save(targetStatus: "draft" | "published") {
    setError(null);
    if (!values.title.trim()) {
      setError("请填写标题");
      return;
    }
    if (!values.description.trim()) {
      setError("请填写描述");
      return;
    }
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
        coverUrl: values.coverUrl ?? null,
        tags: values.tags,
        ribbon: values.ribbon ?? null,
        status: targetStatus,
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
      setField("status", targetStatus);
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

  const crumbs = useMemo(
    () => [
      { label: "路径", href: "/admin/paths" },
      { label: mode === "create" ? "新建路径" : "编辑路径" },
    ],
    [mode],
  );
  const publishLabel = values.status === "published" ? "保存修改" : "发布";

  return (
    <div className="-mt-8 lg:-mt-10">
      <EditorBar
        backHref="/admin/paths"
        crumbs={crumbs}
        onSaveDraft={() => save("draft")}
        onPublish={() => save("published")}
        onDelete={mode === "edit" ? handleDelete : undefined}
        deleteLabel="删除路径"
        publishLabel={publishLabel}
        submitting={submitting}
        rightMeta={pathSlug ? <span className="font-mono">/paths/{pathSlug}</span> : null}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT — form */}
        <div className="space-y-4">
          <EditorPanel>
            <EditorField label="标题" htmlFor="title">
              <input
                id="title"
                type="text"
                required
                value={values.title}
                onChange={(e) => setField("title", e.target.value)}
                className={`${editorInputClass} text-[15px]`}
                placeholder="把想法跑成网站"
              />
            </EditorField>

            <div className="mt-4">
              <EditorField label="描述" htmlFor="description" hint="一两句话讲清这条路径解决谁的什么问题">
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={values.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className={editorInputClass}
                  placeholder="从 0 到 1 搭建一个上线的网站，掌握 AI 编程与部署的完整流程。"
                />
              </EditorField>
            </div>
          </EditorPanel>

          <EditorPanel title="定价">
            <div className="grid gap-4 sm:grid-cols-2">
              <EditorField label="收费方式" htmlFor="pricing">
                <StatusToggle
                  name="收费"
                  value={values.pricing}
                  onChange={(v) => setField("pricing", v)}
                  options={[
                    { value: "free", label: "免费" },
                    { value: "paid", label: "付费" },
                  ]}
                />
              </EditorField>
              <EditorField label="价格文案" htmlFor="priceLabel" hint="例：免费 / ¥299">
                <input
                  id="priceLabel"
                  type="text"
                  value={values.priceLabel}
                  onChange={(e) => setField("priceLabel", e.target.value)}
                  className={editorInputClass}
                />
              </EditorField>
            </div>
          </EditorPanel>

          <EditorPanel
            title="课程亮点"
            action={
              <button
                type="button"
                onClick={addHighlight}
                className="text-[12px] font-medium text-orange-600 transition hover:text-orange-700"
              >
                + 添加亮点
              </button>
            }
          >
            {values.highlights.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[12px] text-slate-400">
                还没有亮点，点上方「+ 添加亮点」开始填写
              </p>
            ) : (
              <ul className="space-y-2">
                {values.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => updateHighlight(idx, e.target.value)}
                      className={editorInputClass}
                      placeholder="例：5 篇真实文章 + 配套小测"
                    />
                    <button
                      type="button"
                      onClick={() => removeHighlight(idx)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="删除这条亮点"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </EditorPanel>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — sidebar */}
        <aside className="space-y-4">
          <EditorPanel title="封面">
            <CoverUpload
              value={values.coverUrl}
              onChange={(url) => setField("coverUrl", url)}
              folder="paths"
            />
          </EditorPanel>

          <EditorPanel title="标签" hint="搜索用">
            <TagsInput
              value={values.tags}
              onChange={(tags) => setField("tags", tags)}
              placeholder="如：AI、入门、副业"
            />
          </EditorPanel>

          <EditorPanel title="推荐角标" hint="卡片右上角，只展示">
            <RibbonSelector
              value={values.ribbon}
              onChange={(v) => setField("ribbon", v)}
            />
          </EditorPanel>

          <EditorPanel title="状态">
            <StatusToggle
              name="发布状态"
              value={values.status}
              onChange={(v) => setField("status", v)}
              options={[
                { value: "draft", label: "草稿" },
                { value: "published", label: "已发布" },
              ]}
            />
          </EditorPanel>

          <EditorPanel
            title={`关联文章（${relatedArticles.length} 篇）`}
            action={
              <Link
                href="/admin/articles"
                className="text-[12px] font-medium text-orange-600 hover:text-orange-700"
              >
                管理 →
              </Link>
            }
          >
            {relatedArticles.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[12px] text-slate-400">
                还没有关联文章
              </p>
            ) : (
              <ul className="space-y-1.5">
                {relatedArticles.slice(0, 8).map((a, idx) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="w-6 shrink-0 font-mono text-[11px] text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/admin/articles`}
                      className="min-w-0 flex-1 truncate hover:text-slate-900"
                      title={a.title}
                    >
                      {a.title}
                    </Link>
                    {a.status !== "published" && (
                      <span className="shrink-0 rounded bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-700">
                        草稿
                      </span>
                    )}
                  </li>
                ))}
                {relatedArticles.length > 8 && (
                  <li className="text-center text-[11px] text-slate-400">
                    还有 {relatedArticles.length - 8} 篇…
                  </li>
                )}
              </ul>
            )}
          </EditorPanel>

          {stats && (
            <EditorPanel title="完成统计">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="已发布" value={stats.published} tone="emerald" />
                <Stat label="草稿" value={stats.draft} tone="amber" />
                <Stat label="反馈" value={stats.feedback} tone="orange" />
              </div>
            </EditorPanel>
          )}

        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "orange";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600"
      : tone === "amber"
        ? "text-amber-600"
        : "text-orange-600";
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-2.5">
      <div className={`text-lg font-bold tabular-nums ${toneClass}`}>
        {value}
      </div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

