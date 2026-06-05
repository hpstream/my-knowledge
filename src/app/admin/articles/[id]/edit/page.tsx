import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm, type ArticleFormValues } from "@/components/admin/ArticleForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, paths] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.learningPath.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { slug: true, title: true },
    }),
  ]);

  if (!article) notFound();

  let quizPretty = "[]";
  try {
    const parsed = JSON.parse(article.quizJson || "[]");
    quizPretty = JSON.stringify(parsed, null, 2);
  } catch {
    quizPretty = article.quizJson;
  }

  const kind: "lesson" | "topic" = article.kind === "topic" ? "topic" : "lesson";
  const previewHref =
    kind === "topic"
      ? `/topics/${article.slug}`
      : `/paths/${article.pathSlug}/${article.slug}`;

  const initial: ArticleFormValues = {
    slug: article.slug,
    kind,
    pathSlug: article.pathSlug ?? "",
    title: article.title,
    summary: article.summary ?? "",
    body: article.body,
    order: article.order,
    readMinutes: article.readMinutes,
    difficulty: article.difficulty ?? "",
    estimatedMinutes: article.estimatedMinutes ?? "",
    cost: article.cost ?? "",
    quizJson: quizPretty,
    status: article.status === "published" ? "published" : "draft",
  };

  return (
    <div>
      <Link
        href="/admin/articles"
        className="text-sm text-slate-500 transition hover:text-slate-900"
      >
        ← 返回列表
      </Link>
      <div className="mt-6 mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Edit article · {kind}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
            编辑文章
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            <span className="font-mono">{previewHref}</span>
          </p>
        </div>
        {article.status === "published" && (
          <Link
            href={previewHref}
            target="_blank"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400"
          >
            在前台查看 ↗
          </Link>
        )}
      </div>
      <ArticleForm
        mode="edit"
        articleId={article.id}
        initial={initial}
        pathOptions={paths}
      />
    </div>
  );
}
