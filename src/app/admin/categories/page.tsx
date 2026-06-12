import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.pathCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Path categories
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
            分类管理
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            共 {categories.length} 条。这里的分类会出现在路径编辑页的分类下拉中。
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + 新建分类
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          还没有分类。点右上角“新建分类”开始。
        </div>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-slate-900">
                      {c.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-1 truncate font-mono text-xs text-slate-500">
                    {c.slug}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>排序 {c.sortOrder}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/categories/${c.id}/edit`}
                  className="flex-shrink-0 text-sm text-slate-600 transition hover:text-slate-900"
                >
                  编辑 →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
