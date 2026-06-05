import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPaths, getPathWithArticles } from "@/lib/content";
import { PathLessonList } from "@/components/PathLessonList";

export async function generateStaticParams() {
  const paths = await getAllPaths();
  return paths.map((p) => ({ slug: p.slug }));
}

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPathWithArticles(slug);
  if (!data) notFound();

  const { learningPath, articles } = data;

  const lessons = articles.map((a) => ({
    slug: a.frontmatter.slug,
    title: a.frontmatter.title,
    order: a.frontmatter.order,
    readMinutes: a.frontmatter.readMinutes,
    quizCount: a.frontmatter.quiz.length,
  }));

  const firstLessonSlug = lessons[0]?.slug;

  const metaInline = [
    learningPath.category,
    learningPath.level,
    `${lessons.length} 讲 · 约 ${learningPath.estimatedHours} 小时`,
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:py-14">
        <Link
          href="/"
          className="text-sm text-slate-500 transition hover:text-slate-900"
        >
          ← 返回首页
        </Link>

        <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-7 lg:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.28em] text-emerald-700">
            {learningPath.badge ?? "Free Course"}
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-slate-950 md:text-4xl">
            {learningPath.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            {learningPath.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
            {metaInline.map((item, idx) => (
              <span key={item} className="flex items-center gap-3">
                <span>{item}</span>
                {idx < metaInline.length - 1 && (
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                )}
              </span>
            ))}
          </div>

          {learningPath.highlights.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {learningPath.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
                  <span className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {firstLessonSlug && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/paths/${learningPath.slug}/${firstLessonSlug}`}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                开始学习 ›
              </Link>
              <Link
                href="#course-outline"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                查看大纲
              </Link>
            </div>
          )}
        </section>

        <section id="course-outline" className="mt-10 scroll-mt-24">
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              Course outline
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
              按顺序学习，完成一讲解锁下一讲
            </h2>
          </div>

          <PathLessonList pathSlug={learningPath.slug} lessons={lessons} />
        </section>
      </div>
    </div>
  );
}
