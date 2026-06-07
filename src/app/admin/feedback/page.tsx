import Link from "next/link";
import { prisma } from "@/lib/db";
import { FeedbackRowActions } from "@/components/admin/FeedbackRow";
import {
  FeedbackCategoryIcon,
  feedbackCategoryLabel,
} from "@/components/admin/FeedbackCategoryIcon";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { value: "all", label: "全部" },
  { value: "open", label: "待处理" },
  { value: "triaged", label: "已分类" },
  { value: "resolved", label: "已解决" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

function isStatusFilter(v: string | undefined): v is StatusFilter {
  return !!v && STATUS_FILTERS.some((s) => s.value === v);
}

function daysAgo(d: Date | null | undefined): string {
  if (!d) return "—";
  const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "昨天";
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
}

function statusPill(status: string) {
  if (status === "resolved") {
    return (
      <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-emerald-100 px-2 text-[11px] font-semibold text-emerald-700">
        已解决
      </span>
    );
  }
  if (status === "triaged") {
    return (
      <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-sky-100 px-2 text-[11px] font-semibold text-sky-700">
        已分类
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-amber-100 px-2 text-[11px] font-semibold text-amber-700">
      待处理
    </span>
  );
}

type SearchParams = Promise<{
  status?: string;
  q?: string;
}>;

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const statusFilter: StatusFilter = isStatusFilter(params.status)
    ? params.status
    : "all";
  const q = (params.q ?? "").trim();

  const feedbacks = await prisma.articleFeedback.findMany({
    where: {
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(q
        ? {
            OR: [
              { body: { contains: q, mode: "insensitive" } },
              { articleSlug: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { email: true, displayName: true } },
    },
  });

  // Lookup article titles + their path titles for the slugs referenced by the
  // visible feedback. ArticleFeedback has no FK relation to Article, so we batch-fetch.
  const slugs = Array.from(new Set(feedbacks.map((f) => f.articleSlug)));
  const articles = slugs.length
    ? await prisma.article.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, title: true, pathSlug: true },
      })
    : [];
  const pathSlugs = Array.from(
    new Set(articles.map((a) => a.pathSlug).filter((s): s is string => !!s)),
  );
  const paths = pathSlugs.length
    ? await prisma.learningPath.findMany({
        where: { slug: { in: pathSlugs } },
        select: { slug: true, title: true },
      })
    : [];
  const articleBySlug = new Map(articles.map((a) => [a.slug, a]));
  const pathBySlug = new Map(paths.map((p) => [p.slug, p]));

  // Counts for tab badges (over the whole table, not filtered)
  const counts = await prisma.articleFeedback.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const totalCount = counts.reduce((sum, c) => sum + c._count._all, 0);
  const countByStatus = (s: string) =>
    counts.find((c) => c.status === s)?._count._all ?? 0;
  const openCount = countByStatus("open");

  const slugFor = (status: StatusFilter) =>
    status === "all" ? "/admin/feedback" : `/admin/feedback?status=${status}`;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-slate-900">
            反馈管理
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            共 {totalCount} 条 · {openCount} 条待处理
          </p>
        </div>

        <form
          method="get"
          action="/admin/feedback"
          className="flex items-center gap-2"
        >
          {statusFilter !== "all" && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <SearchIcon />
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="搜索反馈内容、slug 或邮箱"
              className="h-10 w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
            />
          </div>
        </form>
      </header>

      {/* Filter tabs */}
      <nav className="flex flex-wrap items-center gap-2" aria-label="状态筛选">
        {STATUS_FILTERS.map((tab) => {
          const active = tab.value === statusFilter;
          const n =
            tab.value === "all" ? totalCount : countByStatus(tab.value);
          return (
            <Link
              key={tab.value}
              href={slugFor(tab.value)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-flex h-8 items-center gap-2 rounded-full bg-slate-900 px-3.5 text-[12px] font-semibold text-white"
                  : "inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-[12px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              }
            >
              <span>{tab.label}</span>
              <span
                className={
                  active
                    ? "text-[11px] text-white/70"
                    : "text-[11px] text-slate-400"
                }
              >
                {n}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* List */}
      {feedbacks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          {q || statusFilter !== "all"
            ? "没有匹配的反馈"
            : "还没有用户反馈。等流量上来就有了。"}
        </div>
      ) : (
        <ul className="space-y-3">
          {feedbacks.map((f) => {
            const email = f.user?.email ?? f.email ?? null;
            const reporter = email ?? "anonymous";
            const article = articleBySlug.get(f.articleSlug);
            const articleTitle = article?.title ?? f.articleSlug;
            const articleMissing = !article;
            const pathTitle = article?.pathSlug
              ? pathBySlug.get(article.pathSlug)?.title
              : null;
            const subtitleParts: string[] = [];
            if (pathTitle) subtitleParts.push(`系列 · ${pathTitle}`);
            subtitleParts.push(feedbackCategoryLabel(f.category));
            return (
              <li
                key={f.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex gap-4">
                  <FeedbackCategoryIcon category={f.category} size="lg" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/topics/${f.articleSlug}`}
                      target="_blank"
                      className="block truncate text-[15px] font-semibold text-slate-900 hover:underline"
                      title={articleTitle}
                    >
                      {articleTitle}
                      {articleMissing && (
                        <span className="ml-2 text-[11px] font-normal text-slate-400">
                          (文章已删除)
                        </span>
                      )}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-slate-500">
                      {subtitleParts.map((part, i) => (
                        <span key={i} className="inline-flex items-center gap-2">
                          {i > 0 && (
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                          )}
                          <span>{part}</span>
                        </span>
                      ))}
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <Link
                        href={`/topics/${f.articleSlug}`}
                        target="_blank"
                        className="font-mono text-[11px] text-slate-400 hover:text-slate-700 hover:underline"
                      >
                        /topics/{f.articleSlug}
                      </Link>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-7 text-slate-700">
                      {f.body}
                    </p>
                  </div>

                  <div className="flex w-44 shrink-0 flex-col items-end gap-2 text-right">
                    {statusPill(f.status)}
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="max-w-full truncate text-[12px] text-slate-500 hover:text-slate-900 hover:underline"
                        title={email}
                      >
                        {reporter}
                      </a>
                    ) : (
                      <span className="text-[12px] text-slate-400">
                        anonymous
                      </span>
                    )}
                    <span className="text-[12px] text-slate-400">
                      {daysAgo(f.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">
                  <FeedbackRowActions
                    id={f.id}
                    initialStatus={f.status as "open" | "triaged" | "resolved"}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a.75.75 0 11-1.06 1.06l-3.08-3.08A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}
