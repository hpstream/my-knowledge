import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleMarkdown } from "@/components/ArticleMarkdown";
import { QuizModalTrigger } from "@/components/QuizModalTrigger";
import { FeedbackTrigger } from "@/components/article/FeedbackTrigger";
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

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getPublishedTopicBySlug(slug);
  if (!topic) notFound();

  const stale = isStale(topic.lastVerifiedAt);
  const lastVerified = fmtDate(topic.lastVerifiedAt ?? topic.updatedAt);

  return (
    <div className="bg-paper text-ink">
      <article className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
        <Link
          href="/topics"
          className="font-cjk-serif text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← 返回专题列表
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="field-stamp text-ink-soft">
              <span className="font-cjk-serif">专题</span>
            </span>
            {topic.difficulty != null && (
              <span className="font-cjk-serif text-sm text-marker">
                难度 {"★".repeat(topic.difficulty)}
                <span className="text-ink-faint">
                  {"★".repeat(5 - topic.difficulty)}
                </span>
              </span>
            )}
            {(topic.estimatedMinutes ?? topic.readMinutes) && (
              <span className="font-cjk-serif text-sm text-ink-muted">
                约 {topic.estimatedMinutes ?? topic.readMinutes} 分钟
              </span>
            )}
            {topic.cost && (
              <span className="font-cjk-serif text-sm text-ink-muted">
                {topic.cost}
              </span>
            )}
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.15] tracking-display text-ink lg:text-5xl">
            <span className="font-cjk-serif">{topic.title}</span>
          </h1>

          {topic.summary && (
            <p className="mt-5 font-cjk-serif text-lg leading-relaxed text-ink-soft">
              {topic.summary}
            </p>
          )}

          {/* Freshness / verification stamp */}
          <div
            className={`mt-7 inline-flex items-center gap-3 border ${
              stale ? "border-stamp-red" : "border-ink/30"
            } bg-paper px-4 py-2`}
          >
            <span
              className={`font-cjk-serif text-sm font-semibold ${
                stale ? "text-stamp-red" : "text-ink-muted"
              }`}
            >
              {stale ? "可能过期" : "已验证"}
            </span>
            <span className="font-cjk-serif text-sm text-ink-muted">·</span>
            <span className="font-cjk-serif text-sm text-ink-soft">
              {lastVerified}
            </span>
            {stale && (
              <span className="font-cjk-serif text-[11px] text-stamp-red">
                超过 60 天未验证，可能存在过期内容
              </span>
            )}
          </div>
        </header>

        <hr className="rule-double my-10" />

        <ArticleMarkdown source={topic.body} />

        {topic.quiz.length > 0 && (
          <div className="mt-12">
            <QuizModalTrigger
              articleSlug={topic.slug}
              pathSlug=""
              lessonOrder={1}
              lessonTitle={topic.title}
              questions={topic.quiz}
              nextLessonSlug={null}
            />
          </div>
        )}

        <div className="mt-14 border-t border-ink/20 pt-8">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="font-cjk-serif text-sm text-ink-muted">
                有问题？卡住了？
              </div>
              <p className="mt-2 font-cjk-serif text-base text-ink">
                哪一步跑不通，告诉我们。我们会更新这篇文章 + 回复你。
              </p>
            </div>
            <FeedbackTrigger articleSlug={topic.slug} />
          </div>
        </div>

        <footer className="mt-10 border-t border-ink/20 pt-6 font-cjk-serif text-sm text-ink-muted">
          <div className="flex flex-wrap items-center gap-4">
            <span>发布于 {fmtDate(topic.publishedAt)}</span>
            <span>·</span>
            <span>最后更新 {fmtDate(topic.updatedAt)}</span>
            <span>·</span>
            <Link href="/topics" className="hover:text-ink">
              ← 全部专题
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
