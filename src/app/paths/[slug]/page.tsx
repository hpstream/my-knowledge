import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPaths, getPathWithArticles } from "@/lib/content";
import { PathLessonList } from "@/components/PathLessonList";
import { PathHeroCta } from "@/components/path/PathHeroCta";
import { SiteFooter } from "@/components/SiteFooter";

export async function generateStaticParams() {
  const paths = await getAllPaths();
  return paths.map((p) => ({ slug: p.slug }));
}

function levelLabel(level: string): string {
  const v = level.toLowerCase();
  if (v.startsWith("begin")) return "入门";
  if (v.startsWith("inter")) return "进阶";
  if (v.startsWith("adv")) return "高级";
  return level || "入门";
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

  const isFree = learningPath.pricing === "free";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white text-slate-900">
      <div className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-10 pb-6 lg:px-10">
          <Link
            href="/search?kind=path"
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← 返回免费课程
          </Link>

          <div className="mt-6 grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 lg:grid-cols-2 lg:items-center lg:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {learningPath.badge && (
                  <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    {learningPath.badge}
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {levelLabel(learningPath.level)}
                </span>
                {isFree && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    免费
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                {learningPath.title}
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-500">
                {learningPath.description}
              </p>
              <div className="mt-4 text-sm text-slate-500">
                {lessons.length} 讲 · 约 {learningPath.estimatedHours} 小时
              </div>

              {lessons.length > 0 && (
                <div className="mt-6">
                  <PathHeroCta
                    pathSlug={learningPath.slug}
                    lessons={lessons.map((l) => ({
                      slug: l.slug,
                      title: l.title,
                      order: l.order,
                    }))}
                  />
                </div>
              )}
            </div>

            <div className="hidden aspect-[4/3] items-center justify-center rounded-2xl bg-amber-100 lg:flex">
              <span className="text-7xl opacity-60" aria-hidden>
                📒
              </span>
            </div>
          </div>

          {learningPath.highlights.length > 0 && (
            <ul className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {learningPath.highlights.map((item) => {
                const { title, description } = splitHighlight(item);
                return (
                  <li
                    key={item}
                    className="flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <CheckBadge />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-sm leading-snug text-slate-900">
                        {title}
                      </div>
                      {description && (
                        <div className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
                          {description}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          id="course-outline"
          className="mx-auto max-w-5xl scroll-mt-20 px-6 pb-12 lg:px-10"
        >
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 lg:text-2xl">
              课程大纲
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              完成一讲解锁下一讲
            </p>
          </div>

          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              这条系列还没有课时，敬请期待。
            </div>
          ) : (
            <PathLessonList
              pathSlug={learningPath.slug}
              lessons={lessons}
            />
          )}
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}

function CheckBadge() {
  return (
    <span
      className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white"
      aria-hidden
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="5 10.5 8.5 14 15 7" />
      </svg>
    </span>
  );
}

function splitHighlight(raw: string): { title: string; description: string | null } {
  const sep = /[｜|]/;
  const idx = raw.search(sep);
  if (idx === -1) return { title: raw.trim(), description: null };
  return {
    title: raw.slice(0, idx).trim(),
    description: raw.slice(idx + 1).trim() || null,
  };
}
