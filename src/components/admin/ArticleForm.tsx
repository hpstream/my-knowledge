"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticleMarkdown } from "@/components/ArticleMarkdown";
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
  coverUrl: string | null;
  tags: string[];
  ribbon: RibbonValue;
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
  const [bodyTab, setBodyTab] = useState<"edit" | "preview">("edit");

  function setField<K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const isTopic = values.kind === "topic";

  async function save(targetStatus: "draft" | "published") {
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
    if (!values.title.trim()) {
      setError("请填写标题");
      return;
    }
    if (!values.body.trim()) {
      setError("正文不能为空");
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
        difficulty:
          values.difficulty === "" ? null : Number(values.difficulty),
        estimatedMinutes:
          values.estimatedMinutes === ""
            ? null
            : Number(values.estimatedMinutes),
        cost: values.cost.trim() || null,
        coverUrl: values.coverUrl ?? null,
        tags: values.tags,
        ribbon: values.ribbon ?? null,
        quiz,
        status: targetStatus,
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

      setField("status", targetStatus);
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
      body:
        prev.body +
        (prev.body.endsWith("\n") ? "\n" : "\n\n") +
        CALLOUT_SNIPPET,
    }));
  }

  const kindLabel = isTopic ? "专题" : "课时";
  const breadcrumb = useMemo(
    () => [
      { label: "文章", href: "/admin/articles" },
      { label: mode === "create" ? `新建${kindLabel}` : `编辑${kindLabel}` },
    ],
    [mode, kindLabel],
  );
  const publishLabel = values.status === "published" ? "保存修改" : "发布";

  return (
    <div className="-mt-8 lg:-mt-10">
      <EditorBar
        backHref="/admin/articles"
        crumbs={breadcrumb}
        onSaveDraft={() => save("draft")}
        onPublish={() => save("published")}
        onDelete={mode === "edit" ? handleDelete : undefined}
        deleteLabel="删除文章"
        publishLabel={publishLabel}
        submitting={submitting}
        rightMeta={values.slug ? <span className="font-mono">{values.slug}</span> : null}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT — main editor */}
        <div className="space-y-4">
          {/* Kind switcher inline */}
          <EditorPanel>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[12px] font-medium text-slate-700">
                类型
              </span>
              <StatusToggle
                name="内容类型"
                value={values.kind}
                onChange={(v) => setField("kind", v)}
                options={[
                  { value: "lesson", label: "基础课时" },
                  { value: "topic", label: "专题文章" },
                ]}
              />
            </div>
          </EditorPanel>

          <EditorPanel>
            <EditorField label="标题" htmlFor="title">
              <input
                id="title"
                type="text"
                required
                value={values.title}
                onChange={(e) => setField("title", e.target.value)}
                className={`${editorInputClass} text-[15px]`}
                placeholder={
                  isTopic ? "把你的第一个项目部署到 Vercel" : "课时标题"
                }
              />
            </EditorField>

            <div className="mt-4">
              <EditorField label="摘要" htmlFor="summary" hint="一句话简介（前台列表显示）">
                <input
                  id="summary"
                  type="text"
                  value={values.summary}
                  onChange={(e) => setField("summary", e.target.value)}
                  className={editorInputClass}
                  placeholder="给读者一句话的预览"
                />
              </EditorField>
            </div>
          </EditorPanel>

          {/* Body editor with edit/preview tabs */}
          <EditorPanel
            title="正文"
            hint="Markdown"
            action={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={appendCalloutSnippet}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  + 插入模块模板
                </button>
                <div className="inline-flex rounded-md bg-slate-100 p-0.5">
                  {(["edit", "preview"] as const).map((t) => {
                    const active = bodyTab === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBodyTab(t)}
                        className={
                          active
                            ? "inline-flex h-7 items-center rounded px-3 text-[11px] font-semibold text-slate-900 bg-white shadow-sm"
                            : "inline-flex h-7 items-center rounded px-3 text-[11px] font-medium text-slate-500 transition hover:text-slate-900"
                        }
                      >
                        {t === "edit" ? "编辑" : "预览"}
                      </button>
                    );
                  })}
                </div>
              </div>
            }
          >
            {bodyTab === "edit" ? (
              <textarea
                id="body"
                required
                rows={24}
                value={values.body}
                onChange={(e) => setField("body", e.target.value)}
                className={`${editorInputClass} font-mono text-[13px] leading-6`}
                placeholder={
                  "## 小标题\n\n这里是正文内容…\n\n```bash\nnpx create-next-app\n```"
                }
              />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
                {values.body.trim() ? (
                  <ArticleMarkdown source={values.body} />
                ) : (
                  <p className="text-sm text-slate-400">正文为空，无法预览</p>
                )}
              </div>
            )}

            <p className="mt-2 text-[11px] text-slate-400">
              支持 <code className="font-mono">:::prep</code> /{" "}
              <code className="font-mono">:::apply</code> /{" "}
              <code className="font-mono">:::prompt</code> /{" "}
              <code className="font-mono">:::verify</code> /{" "}
              <code className="font-mono">:::pitfall</code>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              图片：先用任意图床（GitHub Issues / SM.MS / 七牛等）拿到链接，再用{" "}
              <code className="font-mono">![描述](https://…)</code> 语法插入。
            </p>
          </EditorPanel>

          <EditorPanel
            title="小测题"
            hint="Quiz JSON"
          >
            <textarea
              id="quizJson"
              rows={8}
              value={values.quizJson}
              onChange={(e) => setField("quizJson", e.target.value)}
              className={`${editorInputClass} font-mono text-[12px] leading-5`}
              placeholder='[{"q":"题干","options":["A","B","C","D"],"answer":1,"explanation":"解释"}]'
            />
          </EditorPanel>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — sidebar panels */}
        <aside className="space-y-4">
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

          <EditorPanel title="封面" hint="可选">
            <CoverUpload
              value={values.coverUrl}
              onChange={(url) => setField("coverUrl", url)}
              folder="covers"
            />
          </EditorPanel>

          <EditorPanel title="标签" hint="搜索用">
            <TagsInput
              value={values.tags}
              onChange={(tags) => setField("tags", tags)}
              placeholder="如：Vercel、部署、AI 工具"
            />
          </EditorPanel>

          <EditorPanel title="推荐角标" hint="卡片右上角，只展示">
            <RibbonSelector
              value={values.ribbon}
              onChange={(v) => setField("ribbon", v)}
            />
          </EditorPanel>

          {!isTopic && (
            <EditorPanel title="所属路径">
              <div className="space-y-3">
                <EditorField label="路径" htmlFor="pathSlug">
                  <select
                    id="pathSlug"
                    required
                    value={values.pathSlug}
                    onChange={(e) => setField("pathSlug", e.target.value)}
                    className={editorInputClass}
                  >
                    <option value="" disabled>
                      — 选择路径 —
                    </option>
                    {pathOptions.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </EditorField>
                <EditorField label="顺序" htmlFor="order" hint="同路径下越小越靠前">
                  <input
                    id="order"
                    type="number"
                    min={1}
                    value={values.order}
                    onChange={(e) =>
                      setField("order", Number(e.target.value))
                    }
                    className={editorInputClass}
                  />
                </EditorField>
              </div>
            </EditorPanel>
          )}

          {isTopic ? (
            <EditorPanel title="难度与时长">
              <div className="space-y-3">
                <EditorField label="难度" htmlFor="difficulty" hint="1=最简单，5=最难">
                  <DifficultyPicker
                    value={values.difficulty}
                    onChange={(v) => setField("difficulty", v)}
                  />
                </EditorField>
                <EditorField label="预计时长（分钟）" htmlFor="estimatedMinutes">
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
                    className={editorInputClass}
                    placeholder="例：45"
                  />
                </EditorField>
                <EditorField label="阅读时长（分钟）" htmlFor="readMinutes-topic">
                  <input
                    id="readMinutes-topic"
                    type="number"
                    min={1}
                    value={values.readMinutes}
                    onChange={(e) =>
                      setField("readMinutes", Number(e.target.value))
                    }
                    className={editorInputClass}
                  />
                </EditorField>
                <EditorField label="预估成本" htmlFor="cost">
                  <input
                    id="cost"
                    type="text"
                    maxLength={80}
                    value={values.cost}
                    onChange={(e) => setField("cost", e.target.value)}
                    className={editorInputClass}
                    placeholder="例：免费 / ¥10 起 / $20/月"
                  />
                </EditorField>
              </div>
            </EditorPanel>
          ) : (
            <EditorPanel title="阅读时长">
              <EditorField label="分钟" htmlFor="readMinutes">
                <input
                  id="readMinutes"
                  type="number"
                  min={1}
                  value={values.readMinutes}
                  onChange={(e) =>
                    setField("readMinutes", Number(e.target.value))
                  }
                  className={editorInputClass}
                />
              </EditorField>
            </EditorPanel>
          )}
        </aside>
      </div>
    </div>
  );
}

function DifficultyPicker({
  value,
  onChange,
}: {
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = typeof value === "number" && n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? "" : n)}
            aria-label={`难度 ${n} 星`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100"
          >
            <span
              className={
                active ? "text-amber-500" : "text-slate-300"
              }
              aria-hidden="true"
            >
              <StarIcon />
            </span>
          </button>
        );
      })}
      {value !== "" && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="ml-2 text-[11px] text-slate-400 hover:text-slate-700"
        >
          清除
        </button>
      )}
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

