import { notFound } from "next/navigation";
import {
  PathForm,
  type PathFormValues,
  type RelatedArticle,
} from "@/components/admin/PathForm";
import type { RibbonValue } from "@/components/admin/RibbonSelector";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const RIBBON_VALUES = new Set(["精品", "推荐", "新品", "热门", "付费"]);

function parseStringArray(raw: string | null | undefined): string[] {
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

export default async function EditPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.learningPath.findUnique({ where: { id } });
  if (!row) notFound();

  const [articles, articleCounts, feedbackCount, categoryOptions] = await Promise.all([
    prisma.article.findMany({
      where: { pathSlug: row.slug },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { id: true, slug: true, title: true, order: true, status: true },
    }),
    prisma.article.groupBy({
      by: ["status"],
      where: { pathSlug: row.slug },
      _count: { _all: true },
    }),
    prisma.articleFeedback.count({
      where: {
        articleSlug: {
          in: (
            await prisma.article.findMany({
              where: { pathSlug: row.slug },
              select: { slug: true },
            })
          ).map((a) => a.slug),
        },
      },
    }),
    prisma.pathCategory.findMany({
      where: { status: "active" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const stats = {
    published:
      articleCounts.find((c) => c.status === "published")?._count._all ?? 0,
    draft: articleCounts.find((c) => c.status === "draft")?._count._all ?? 0,
    feedback: feedbackCount,
  };

  const highlights = parseStringArray(row.highlightsJson);

  const initial: PathFormValues = {
    title: row.title,
    description: row.description,
    estimatedHours: row.estimatedHours,
    level: row.level,
    category: row.category,
    categoryId: row.categoryId ?? categoryOptions.find((option) => option.name === row.category)?.id ?? "",
    badge: row.badge ?? "",
    pricing: row.pricing === "paid" ? "paid" : "free",
    priceLabel: row.priceLabel ?? "",
    statusLabel: row.statusLabel ?? "",
    highlights,
    accent: row.accent ?? "",
    coverUrl: row.coverUrl ?? null,
    tags: parseStringArray(row.tagsJson),
    ribbon: normalizeRibbon(row.ribbon),
    status: row.status === "published" ? "published" : "draft",
    sortOrder: row.sortOrder,
  };

  const relatedArticles: RelatedArticle[] = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    order: a.order,
    status: a.status,
  }));

  return (
    <PathForm
      mode="edit"
      pathId={row.id}
      pathSlug={row.slug}
      initial={initial}
      categoryOptions={categoryOptions}
      relatedArticles={relatedArticles}
      stats={stats}
    />
  );
}
