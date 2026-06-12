"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorBar } from "./EditorBar";
import {
  EditorField,
  EditorPanel,
  StatusToggle,
  editorInputClass,
} from "./EditorPanel";

export type CategoryFormValues = {
  name: string;
  slug: string;
  sortOrder: number;
  status: "active" | "archived";
};

type Props = {
  mode: "create" | "edit";
  categoryId?: string;
  initial: CategoryFormValues;
};

export function CategoryForm({ mode, categoryId, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<CategoryFormValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof CategoryFormValues>(
    key: K,
    value: CategoryFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setError(null);
    if (!values.name.trim()) {
      setError("请填写分类名称");
      return;
    }
    if (!values.slug.trim()) {
      setError("请填写 slug");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        sortOrder: Number.isFinite(Number(values.sortOrder))
          ? Number(values.sortOrder)
          : 0,
        status: values.status,
      };

      const url =
        mode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${categoryId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (data.error === "DUPLICATE") {
          setError("分类名称或 slug 已存在");
        } else if (data.error === "FORBIDDEN") {
          setError("权限不足");
        } else if (data.error === "VALIDATION_ERROR") {
          setError("字段校验失败，请检查名称和 slug");
        } else {
          setError(data.message ?? "保存失败");
        }
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !categoryId) return;
    if (!confirm("确定要删除这个分类？")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        if (data.error === "HAS_PATHS" && data.message) {
          setError(data.message);
        } else {
          setError("删除失败");
        }
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  const crumbs = useMemo(
    () => [
      { label: "分类", href: "/admin/categories" },
      { label: mode === "create" ? "新建分类" : "编辑分类" },
    ],
    [mode],
  );

  return (
    <div className="-mt-8 lg:-mt-10">
      <EditorBar
        backHref="/admin/categories"
        crumbs={crumbs}
        onPublish={save}
        onDelete={mode === "edit" ? handleDelete : undefined}
        deleteLabel="删除分类"
        publishLabel="保存"
        submitting={submitting}
      />
      <div className="max-w-2xl space-y-4">
        <EditorPanel title="基础信息">
          <EditorField label="名称" htmlFor="name">
            <input
              id="name"
              type="text"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              className={editorInputClass}
              placeholder="例如：AI / 开发 / 产品"
            />
          </EditorField>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <EditorField label="slug" htmlFor="slug" hint="只允许字母、数字、短横线">
              <input
                id="slug"
                type="text"
                value={values.slug}
                onChange={(e) => setField("slug", e.target.value)}
                className={editorInputClass}
                placeholder="ai / development"
              />
            </EditorField>
            <EditorField
              label="排序"
              htmlFor="sortOrder"
              hint="越小越靠前"
            >
              <input
                id="sortOrder"
                type="number"
                value={values.sortOrder}
                onChange={(e) => setField("sortOrder", Number(e.target.value))}
                className={editorInputClass}
              />
            </EditorField>
          </div>
          <div className="mt-4">
            <EditorField label="状态" htmlFor="status">
              <StatusToggle
                name="启用状态"
                value={values.status}
                onChange={(v) => setField("status", v)}
                options={[
                  { value: "active", label: "启用" },
                  { value: "archived", label: "停用" },
                ]}
              />
            </EditorField>
          </div>
        </EditorPanel>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
