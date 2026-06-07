import { notFound } from "next/navigation";
import { ArticleForm, type ArticleFormValues } from "@/components/admin/ArticleForm";
import type { RibbonValue } from "@/components/admin/RibbonSelector";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const RIBBON_VALUES = new Set(["精品", "推荐", "新品", "热门", "付费"]);

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

function normalizeRibbon(raw: string | null | undefined): RibbonValue {
  if (raw && RIBBON_VALUES.has(raw)) return raw as RibbonValue;
  return null;
}

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
    coverUrl: article.coverUrl ?? null,
    tags: parseTags(article.tagsJson),
    ribbon: normalizeRibbon(article.ribbon),
    quizJson: quizPretty,
    status: article.status === "published" ? "published" : "draft",
  };

  return (
    <ArticleForm
      mode="edit"
      articleId={article.id}
      initial={initial}
      pathOptions={paths}
    />
  );
}
