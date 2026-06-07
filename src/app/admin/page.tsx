import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STALE_DAYS = 60;

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

function daysSince(d: Date | null | undefined): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

const FEEDBACK_CATEGORY: Record<
  string,
  { label: string; icon: ReactNode; tint: string }
> = {
  bug: {
    label: "Bug",
    icon: <BugIcon />,
    tint: "bg-rose-100 text-rose-600",
  },
  outdated: {
    label: "过时",
    icon: <ClockAlertIcon />,
    tint: "bg-amber-100 text-amber-600",
  },
  suggestion: {
    label: "建议",
    icon: <LightbulbIcon />,
    tint: "bg-amber-100 text-amber-600",
  },
  praise: {
    label: "好评",
    icon: <HeartIcon />,
    tint: "bg-emerald-100 text-emerald-600",
  },
  question: {
    label: "提问",
    icon: <QuestionIcon />,
    tint: "bg-sky-100 text-sky-600",
  },
};

function feedbackPreset(category: string) {
  return (
    FEEDBACK_CATEGORY[category] ?? {
      label: category,
      icon: <DotIcon />,
      tint: "bg-slate-100 text-slate-500",
    }
  );
}

export default async function AdminDashboard() {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const staleThreshold = new Date(
    now - STALE_DAYS * 24 * 60 * 60 * 1000,
  );
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    articleCounts,
    feedbackOpen,
    feedbackTotal,
    feedbackLast7Days,
    recentArticles,
    openFeedbackItems,
    staleTopics,
  ] = await Promise.all([
    prisma.article.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.articleFeedback.count({ where: { status: "open" } }),
    prisma.articleFeedback.count(),
    prisma.articleFeedback.count({
      where: { createdAt: { gt: sevenDaysAgo } },
    }),
    prisma.article.findMany({
      where: { status: { in: ["published", "draft"] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        slug: true,
        title: true,
        status: true,
        kind: true,
        updatedAt: true,
      },
    }),
    prisma.articleFeedback.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        articleSlug: true,
        category: true,
        body: true,
        createdAt: true,
      },
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
      select: {
        slug: true,
        title: true,
        lastVerifiedAt: true,
      },
      take: 5,
    }),
  ]);

  const publishedArticles =
    articleCounts.find((c) => c.status === "published")?._count._all ?? 0;
  const draftArticles =
    articleCounts.find((c) => c.status === "draft")?._count._all ?? 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="已发布"
          value={publishedArticles}
          icon={<DocumentIcon />}
          tint="bg-orange-50 text-orange-600"
          delta="本周 +3"
          deltaTone="up"
        />
        <StatCard
          label="草稿"
          value={draftArticles}
          icon={<PencilIcon />}
          tint="bg-sky-50 text-sky-600"
        />
        <StatCard
          label="反馈"
          value={feedbackTotal}
          icon={<ChatIcon />}
          tint="bg-rose-50 text-rose-600"
          delta={feedbackLast7Days > 0 ? `7 天 +${feedbackLast7Days}` : "本周 0"}
          deltaTone={feedbackLast7Days > 0 ? "up" : "flat"}
        />
        <StatCard
          label="反馈待处理"
          value={feedbackOpen}
          icon={<AlertIcon />}
          tint="bg-amber-50 text-amber-600"
        />
      </section>

      {/* Two-column: recent articles + open feedback */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHead title="最近发布的文章" />
          <ul className="divide-y divide-slate-100">
            {recentArticles.length === 0 ? (
              <EmptyRow text="还没有文章" />
            ) : (
              recentArticles.map((a) => (
                <li
                  key={a.slug}
                  className="flex items-center gap-3 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1 truncate text-slate-800">
                    {a.title}
                  </div>
                  <StatusTag status={a.status} />
                  <span className="w-16 shrink-0 text-right text-[12px] text-slate-500">
                    {daysAgo(a.updatedAt)}
                  </span>
                </li>
              ))
            )}
          </ul>
          <CardFoot
            href="/admin/articles"
            label="查看全部文章"
          />
        </Card>

        <Card>
          <CardHead title="反馈待处理" />
          <ul className="divide-y divide-slate-100">
            {openFeedbackItems.length === 0 ? (
              <EmptyRow text="暂无待处理反馈" />
            ) : (
              openFeedbackItems.map((f) => {
                const preset = feedbackPreset(f.category);
                return (
                  <li
                    key={f.id}
                    className="flex items-start gap-3 py-3 text-sm"
                  >
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${preset.tint}`}
                      aria-label={preset.label}
                      title={preset.label}
                    >
                      {preset.icon}
                    </span>
                    <p className="min-w-0 flex-1 line-clamp-2 leading-6 text-slate-700">
                      {f.body}
                    </p>
                    <span className="w-16 shrink-0 text-right text-[12px] text-slate-500">
                      {daysAgo(f.createdAt)}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
          <CardFoot href="/admin/feedback" label="查看全部反馈" />
        </Card>
      </section>

      {/* Stale content alert */}
      <section>
        <Card>
          <CardHead title="内容过期预警" />
          {staleTopics.length === 0 ? (
            <EmptyRow text={`没有超过 ${STALE_DAYS} 天未验证的专题`} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {staleTopics.map((t) => {
                const days = daysSince(t.lastVerifiedAt);
                return (
                  <li
                    key={t.slug}
                    className="flex items-center gap-3 py-3 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate text-slate-800">
                      {t.title}
                    </span>
                    <StaleTag days={days} />
                    <Link
                      href={`/topics/${t.slug}`}
                      target="_blank"
                      className="hidden truncate text-[12px] text-slate-500 hover:text-slate-900 md:inline-block md:w-56 md:text-right"
                    >
                      /topics/{t.slug}
                    </Link>
                    <Link
                      href={`/admin/articles`}
                      className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 px-3 text-[12px] font-semibold text-white transition hover:bg-orange-600"
                    >
                      重新校验
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint,
  delta,
  deltaTone = "flat",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tint: string;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
}) {
  const deltaClass =
    deltaTone === "up"
      ? "text-emerald-600"
      : deltaTone === "down"
        ? "text-rose-600"
        : "text-slate-400";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(20,18,12,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-slate-500">{label}</span>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${tint}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
        {value}
      </div>
      {delta && (
        <div
          className={`mt-1 inline-flex items-center gap-1 text-[12px] font-medium ${deltaClass}`}
        >
          {deltaTone === "up" && <span aria-hidden>↑</span>}
          {deltaTone === "down" && <span aria-hidden>↓</span>}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 pb-2 pt-5 shadow-[0_1px_2px_rgba(20,18,12,0.04)]">
      {children}
    </div>
  );
}

function CardHead({ title }: { title: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

function CardFoot({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-2 flex justify-center border-t border-slate-100 pt-3 pb-2">
      <Link
        href={href}
        className="text-[12px] font-medium text-orange-600 transition hover:text-orange-700"
      >
        {label} →
      </Link>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <li className="py-8 text-center text-[13px] text-slate-400">{text}</li>
  );
}

function StatusTag({ status }: { status: string }) {
  if (status === "published") {
    return (
      <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-emerald-100 px-2 text-[11px] font-semibold text-emerald-700">
        已发布
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-amber-100 px-2 text-[11px] font-semibold text-amber-700">
      草稿
    </span>
  );
}

function StaleTag({ days }: { days: number | null }) {
  const text = days == null ? "从未验证" : `${days} 天未 verified`;
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-orange-100 px-2 text-[11px] font-semibold text-orange-700">
      {text}
    </span>
  );
}

/* ---------- icons ---------- */

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H14a1 1 0 0 1-1-1V3.5z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M12 6V3" />
      <path d="M2 13h4" />
      <path d="M18 13h4" />
      <path d="M3 6l3 2" />
      <path d="M21 6l-3 2" />
    </svg>
  );
}

function ClockAlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2zm-2 19a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h-4v1z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 21s-7-4.5-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <circle cx="5" cy="5" r="3" />
    </svg>
  );
}
