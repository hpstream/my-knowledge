import { notFound } from "next/navigation";
import { getPathWithArticles } from "@/lib/content";
import { PathSidebar } from "@/components/PathSidebar";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
          <aside className="border-b border-slate-200 py-4 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pr-6">
            <PathSidebar
              pathSlug={learningPath.slug}
              pathTitle={learningPath.title}
              lessons={lessons}
            />
          </aside>
          <main className="py-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
