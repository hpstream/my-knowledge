import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ pathSlug: "asc" }, { order: "asc" }],
    include: { author: { select: { email: true, displayName: true } } },
  });

  const byPath = new Map<string, typeof articles>();
  for (const a of articles) {
    const key = a.pathSlug ?? "(无路径 · 专题)";
    const list = byPath.get(key) ?? [];
    list.push(a);
    byPath.set(key, list);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Articles
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
            文章管理
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            共 {articles.length} 篇。已发布的文章会立即出现在前台学习路径中。
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + 新建文章
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          还没有文章。点右上角"新建文章"开始录入。
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(byPath.entries()).map(([pathSlug, list]) => (
            <section
              key={pathSlug}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-100 px-5 py-3">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Path
                </div>
                <div className="mt-1 font-mono text-sm text-slate-800">
                  {pathSlug}
                </div>
              </div>
              <ul className="divide-y divide-slate-100">
                {list.map((a) => {
                  const isDraft = a.status !== "published";
                  return (
                    <li
                      key={a.id}
                      className={`flex items-center gap-4 px-5 py-4 transition ${
                        isDraft
                          ? "border-l-2 border-amber-400 bg-amber-50/40 hover:bg-amber-50/70"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`w-8 flex-shrink-0 text-center text-sm font-medium tabular-nums ${
                          isDraft ? "text-amber-600" : "text-slate-400"
                        }`}
                      >
                        {a.order}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-sm font-medium ${
                            isDraft ? "text-slate-700" : "text-slate-900"
                          }`}
                        >
                          {a.title}
                        </div>
                        <div className="mt-0.5 truncate font-mono text-xs text-slate-500">
                          /paths/{a.pathSlug}/{a.slug}
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="flex-shrink-0 text-sm text-slate-600 transition hover:text-slate-900"
                      >
                        编辑 →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";
  if (isPublished) {
    return (
      <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        已发布
      </span>
    );
  }
  return (
    <span
      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800"
      title="草稿状态：未登录访客和普通用户都看不见这篇文章"
    >
      <DraftIcon />
      草稿 · 仅 admin 可见
    </span>
  );
}

function DraftIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
