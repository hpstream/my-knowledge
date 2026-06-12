import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPathsPage() {
  const paths = await prisma.learningPath.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const articleCounts = new Map<string, number>();
  for (const p of paths) {
    const n = await prisma.article.count({
      where: { pathSlug: p.slug, status: "published" },
    });
    articleCounts.set(p.slug, n);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Learning paths
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
            学习路径管理
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            共 {paths.length} 条。已发布的路径会出现在首页"免费课程"区。
          </p>
        </div>
        <Link
          href="/admin/paths/new"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + 新建路径
        </Link>
      </div>

      {paths.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          还没有路径。点右上角"新建路径"开始。
        </div>
      ) : (
        <ul className="space-y-3">
          {paths.map((p) => {
            const isDraft = p.status !== "published";
            const articleN = articleCounts.get(p.slug) ?? 0;
            return (
              <li
                key={p.id}
                className={`rounded-3xl border p-5 transition ${
                  isDraft
                    ? "border-amber-300 bg-amber-50/40 hover:bg-amber-50/70"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-slate-900">
                        {p.title}
                      </span>
                      <StatusBadge status={p.status} />
                      {p.pricing === "paid" && (
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-700">
                          付费
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate font-mono text-xs text-slate-500">
                      /paths/{p.slug}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>排序 {p.sortOrder}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{p.category}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{p.level}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{articleN} 篇文章</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>约 {p.estimatedHours} 小时</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/paths/${p.id}/edit`}
                    className="flex-shrink-0 text-sm text-slate-600 transition hover:text-slate-900"
                  >
                    编辑 →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  if (isPublished) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        已发布
      </span>
    );
  }
  return (
    <span
      className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800"
      title="草稿状态：首页不显示这条路径"
    >
      草稿 · 仅 admin 可见
    </span>
  );
}
