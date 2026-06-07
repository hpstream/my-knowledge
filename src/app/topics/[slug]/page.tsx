import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleMarkdown } from "@/components/ArticleMarkdown";
import { QuizModalTrigger } from "@/components/QuizModalTrigger";
import { FeedbackTrigger } from "@/components/article/FeedbackTrigger";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublishedTopicBySlug, isStale } from "@/lib/articles";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function stars(d: number | null | undefined): string {
  const n = Math.max(0, Math.min(5, d ?? 0));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function isFreeCost(cost: string | null | undefined): boolean {
  if (!cost) return true;
  const t = cost.trim().toLowerCase();
  return t === "" || t === "免费" || t === "free" || t === "¥0" || t === "0";
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getPublishedTopicBySlug(slug);
  if (!topic) notFound();

  const stale = isStale(topic.lastVerifiedAt);
  const free = isFreeCost(topic.cost);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white text-slate-900">
      <div className="flex-1">
        <article className="mx-auto max-w-3xl px-6 pt-10 pb-12 lg:px-10">
          <Link
            href="/search?kind=topic"
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← 返回专题
          </Link>

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                专题
              </span>
              {topic.difficulty != null && (
                <span className="text-xs text-amber-500">
                  {stars(topic.difficulty)}
                </span>
              )}
              <span
                className={
                  free
                    ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                    : "rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
                }
              >
                {free ? "免费" : topic.cost}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              {topic.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>{fmtDate(topic.publishedAt)}</span>
              <span>·</span>
              <span>
                约 {topic.estimatedMinutes ?? topic.readMinutes} 分钟阅读
              </span>
              {topic.quiz.length > 0 && (
                <>
                  <span>·</span>
                  <span>{topic.quiz.length} 道题</span>
                </>
              )}
            </div>

            {topic.summary && (
              <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {topic.summary}
              </p>
            )}

            {stale && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                <span aria-hidden>⚠</span>
                <span>可能过期 · 超过 60 天未校验</span>
              </div>
            )}
          </header>

          <hr className="my-8 border-slate-200" />

          <ArticleMarkdown source={topic.body} />

          {topic.quiz.length > 0 && (
            <QuizModalTrigger
              articleSlug={topic.slug}
              pathSlug=""
              lessonOrder={1}
              lessonTitle={topic.title}
              questions={topic.quiz}
              nextLessonSlug={null}
            />
          )}

          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  这篇有用吗？
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  告诉我们哪里跑不通，我们会更新这篇文章。
                </p>
              </div>
              <FeedbackTrigger articleSlug={topic.slug} />
            </div>
          </div>
        </article>
      </div>

      <SiteFooter />
    </div>
  );
}
