import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPaths, getPathWithArticles } from "@/lib/content";
import { ArticleMarkdown } from "@/components/ArticleMarkdown";
import { QuizModalTrigger } from "@/components/QuizModalTrigger";
import { FeedbackTrigger } from "@/components/article/FeedbackTrigger";
import { PathLessonOutline } from "@/components/path/PathLessonOutline";
import { SiteFooter } from "@/components/SiteFooter";

export async function generateStaticParams() {
  const paths = await getAllPaths();
  const entries = await Promise.all(
    paths.map(async (p) => {
      const data = await getPathWithArticles(p.slug);
      if (!data) return [];
      return data.articles.map((a) => ({
        slug: p.slug,
        lesson: a.frontmatter.slug,
      }));
    }),
  );
  return entries.flat();
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lesson: string }>;
}) {
  const { slug, lesson } = await params;
  const data = await getPathWithArticles(slug);
  if (!data) notFound();

  const idx = data.articles.findIndex(
    (a) => a.frontmatter.slug === lesson,
  );
  if (idx < 0) notFound();

  const article = data.articles[idx];
  const next = data.articles[idx + 1] ?? null;
  const { frontmatter, body } = article;

  const outlineLessons = data.articles.map((a) => ({
    slug: a.frontmatter.slug,
    title: a.frontmatter.title,
    order: a.frontmatter.order,
  }));

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white text-slate-900">
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-12 lg:px-10">
          <Link
            href={`/paths/${slug}`}
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← 返回 {data.learningPath.title}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <PathLessonOutline
                  pathSlug={slug}
                  currentSlug={lesson}
                  lessons={outlineLessons}
                />
              </div>
            </aside>

            <article className="min-w-0">
              <div className="mb-6">
                <div className="text-xs font-medium text-orange-500">
                  第 {frontmatter.order} 讲 / {data.articles.length}
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                  {frontmatter.title}
                </h1>
                <div className="mt-3 text-sm text-slate-500">
                  约 {frontmatter.readMinutes} 分钟阅读
                  {frontmatter.quiz.length > 0 &&
                    ` · ${frontmatter.quiz.length} 道题`}
                </div>
                {frontmatter.summary && (
                  <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {frontmatter.summary}
                  </p>
                )}
              </div>

              <hr className="mb-8 border-slate-200" />

              <ArticleMarkdown source={body} />

              {frontmatter.quiz.length > 0 && (
                <QuizModalTrigger
                  articleSlug={frontmatter.slug}
                  pathSlug={slug}
                  lessonOrder={frontmatter.order}
                  lessonTitle={frontmatter.title}
                  questions={frontmatter.quiz}
                  nextLessonSlug={next ? next.frontmatter.slug : null}
                />
              )}

              <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-base font-semibold text-slate-900">
                      这节课有用吗？
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      哪一步跑不通告诉我们，我们会更新这篇内容。
                    </p>
                  </div>
                  <FeedbackTrigger articleSlug={frontmatter.slug} />
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
