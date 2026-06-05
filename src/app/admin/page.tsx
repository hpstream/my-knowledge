import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STALE_DAYS = 60;

function fmt(d: Date): string {
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysAgo(d: Date | null | undefined): string {
  if (!d) return "—";
  const diff = Math.floor(
    (Date.now() - d.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diff === 0) return "今天";
  if (diff === 1) return "昨天";
  return `${diff} 天前`;
}

export default async function AdminDashboard() {
  const staleThreshold = new Date(
    Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000,
  );

  const [
    userCount,
    adminCount,
    pathCount,
    articleCounts,
    topicCounts,
    staleTopics,
    feedbackOpen,
    feedbackTotal,
    recentFeedback,
    recentUsers,
    recentArticles,
    progressTotal,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.learningPath.count(),
    prisma.article.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.article.groupBy({
      by: ["kind"],
      _count: { _all: true },
    }),
    prisma.article.findMany({
      where: {
        kind: "topic",
        status: "published",
        OR: [
          { lastVerifiedAt: null },
          { lastVerifiedAt: { lt: staleThreshold } },
        ],
      },
      orderBy: { lastVerifiedAt: "asc" },
      select: { slug: true, title: true, lastVerifiedAt: true },
      take: 5,
    }),
    prisma.articleFeedback.count({ where: { status: "open" } }),
    prisma.articleFeedback.count(),
    prisma.articleFeedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        articleSlug: true,
        category: true,
        body: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, createdAt: true, role: true },
    }),
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        slug: true,
        title: true,
        kind: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.userLessonProgress.count({
      where: { completedAt: { not: null } },
    }),
  ]);

  const publishedArticles =
    articleCounts.find((c) => c.status === "published")?._count._all ?? 0;
  const draftArticles =
    articleCounts.find((c) => c.status === "draft")?._count._all ?? 0;
  const totalArticles = publishedArticles + draftArticles;

  const topicCount = topicCounts.find((c) => c.kind === "topic")?._count._all ?? 0;
  const lessonCount =
    topicCounts.find((c) => c.kind === "lesson")?._count._all ?? 0;

  return (
    <div>
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          Dashboard
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
          仪表盘
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {fmt(new Date())} · 全站健康一览
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="用户总数" value={userCount} sub={`${adminCount} admin`} />
        <Metric
          label="文章总数"
          value={totalArticles}
          sub={`${publishedArticles} 发布 · ${draftArticles} 草稿`}
        />
        <Metric
          label="专题 / 课时"
          value={`${topicCount} / ${lessonCount}`}
          sub={`${pathCount} 条路径`}
        />
        <Metric
          label="读者反馈"
          value={feedbackTotal}
          sub={`${feedbackOpen} 待处理`}
          highlight={feedbackOpen > 0}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Metric label="累计完成小测" value={progressTotal} />
        <Metric
          label="可能过期的专题"
          value={staleTopics.length}
          sub={`> ${STALE_DAYS} 天未验证`}
          highlight={staleTopics.length > 0}
        />
      </div>

      {/* Stale topics */}
      {staleTopics.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            ⚠️ 可能过期的专题（{staleTopics.length}）
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            超过 {STALE_DAYS} 天没标"已验证"。检查一遍，更新文章里有变化的部分。
          </p>
          <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {staleTopics.map((t) => (
              <li
                key={t.slug}
                className="flex items-center justify-between px-5 py-3"
              >
                <Link
                  href={`/topics/${t.slug}`}
                  target="_blank"
                  className="text-sm text-slate-800 hover:underline"
                >
                  {t.title}
                </Link>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-amber-700">
                    {t.lastVerifiedAt
                      ? `${daysAgo(t.lastVerifiedAt)}`
                      : "从未验证"}
                  </span>
                  <Link
                    href={`/admin/articles?slug=${t.slug}`}
                    className="font-mono text-slate-600 hover:text-slate-900"
                  >
                    去编辑 →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recent feedback */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">最近反馈</h2>
            <Link
              href="/admin/feedback"
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              全部 →
            </Link>
          </div>
          {recentFeedback.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              还没有用户反馈
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {recentFeedback.map((f) => (
                <li key={f.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 text-xs">
                    {f.status === "open" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                        待
                      </span>
                    )}
                    <Link
                      href={`/topics/${f.articleSlug}`}
                      target="_blank"
                      className="font-mono text-slate-600 hover:text-slate-900"
                    >
                      /{f.articleSlug}
                    </Link>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{daysAgo(f.createdAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-800">
                    {f.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">最近内容更新</h2>
            <Link
              href="/admin/articles"
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              全部 →
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              还没有文章
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {recentArticles.map((a) => (
                <li key={a.slug} className="px-5 py-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        a.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {a.status === "published" ? "已发布" : "草稿"}
                    </span>
                    <span className="font-mono text-slate-500">
                      {a.kind === "topic" ? "📄 专题" : "📚 课时"}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{daysAgo(a.updatedAt)}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-800">{a.title}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Recent users */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">最近注册</h2>
          <span className="text-xs text-slate-500">
            共 {userCount} 个账号
          </span>
        </div>
        {recentUsers.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            还没有用户注册
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                    {u.email.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-800">{u.email}</span>
                  {u.role === "admin" && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                      admin
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-slate-500">
                  {daysAgo(u.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-amber-300 bg-amber-50/50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-xs text-slate-500">{sub}</div>
      )}
    </div>
  );
}
