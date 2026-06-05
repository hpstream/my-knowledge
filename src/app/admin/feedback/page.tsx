import Link from "next/link";
import { prisma } from "@/lib/db";
import { FeedbackRowActions } from "@/components/admin/FeedbackRow";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  issue: "🐛 跑不通",
  improve: "💡 建议改进",
  praise: "💚 感谢",
};

function fmt(d: Date): string {
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  if (status === "resolved") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        已解决
      </span>
    );
  }
  if (status === "triaged") {
    return (
      <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-700">
        已分类
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
      待处理
    </span>
  );
}

export default async function AdminFeedbackPage() {
  const feedbacks = await prisma.articleFeedback.findMany({
    orderBy: [
      { status: "asc" }, // open first
      { createdAt: "desc" },
    ],
    include: {
      user: { select: { email: true, displayName: true } },
    },
  });

  const openCount = feedbacks.filter((f) => f.status === "open").length;

  return (
    <div>
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          Reader Feedback
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
          读者反馈收件箱
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          共 {feedbacks.length} 条 · {openCount} 条待处理
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          还没有用户反馈。等流量上来就有了。
        </div>
      ) : (
        <ul className="space-y-3">
          {feedbacks.map((f) => (
            <li
              key={f.id}
              className={`rounded-2xl border p-5 ${
                f.status === "open"
                  ? "border-amber-300 bg-amber-50/30"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono">
                  {CATEGORY_LABELS[f.category] ?? f.category}
                </span>
                {statusBadge(f.status)}
                <span className="text-slate-400">·</span>
                <Link
                  href={`/topics/${f.articleSlug}`}
                  target="_blank"
                  className="font-mono text-slate-600 hover:text-slate-900 hover:underline"
                >
                  /topics/{f.articleSlug}
                </Link>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-slate-500">
                  {fmt(f.createdAt)}
                </span>
                {(f.user?.email || f.email) && (
                  <>
                    <span className="text-slate-400">·</span>
                    <a
                      href={`mailto:${f.user?.email ?? f.email}`}
                      className="font-mono text-slate-600 hover:underline"
                    >
                      {f.user?.email ?? f.email}
                    </a>
                  </>
                )}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {f.body}
              </p>

              <div className="mt-4 flex items-center justify-end">
                <FeedbackRowActions
                  id={f.id}
                  initialStatus={f.status as "open" | "triaged" | "resolved"}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
