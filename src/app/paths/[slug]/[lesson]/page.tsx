import { notFound } from "next/navigation";
import { getAllPaths, getPathWithArticles } from "@/lib/content";
import { ArticleMarkdown } from "@/components/ArticleMarkdown";
import { QuizModalTrigger } from "@/components/QuizModalTrigger";

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

  return (
    <article className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          第 {frontmatter.order} 讲
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-[1.2] tracking-[-0.02em] text-slate-950 md:text-4xl">
          {frontmatter.title}
        </h1>
        <div className="mt-3 text-sm text-slate-500">
          阅读约 {frontmatter.readMinutes} 分钟 · {frontmatter.quiz.length} 道题
        </div>
        {frontmatter.summary && (
          <p className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm leading-7 text-slate-700">
            {frontmatter.summary}
          </p>
        )}
      </div>

      <hr className="mb-8 border-slate-200" />

      <ArticleMarkdown source={body} />

      <QuizModalTrigger
        articleSlug={frontmatter.slug}
        pathSlug={slug}
        lessonOrder={frontmatter.order}
        lessonTitle={frontmatter.title}
        questions={frontmatter.quiz}
        nextLessonSlug={next ? next.frontmatter.slug : null}
      />
    </article>
  );
}
