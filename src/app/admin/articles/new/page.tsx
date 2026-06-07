import { ArticleForm, type ArticleFormValues } from "@/components/admin/ArticleForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const blank: ArticleFormValues = {
  slug: "",
  kind: "lesson",
  pathSlug: "",
  title: "",
  summary: "",
  body: "",
  order: 1,
  readMinutes: 10,
  difficulty: "",
  estimatedMinutes: "",
  cost: "",
  coverUrl: null,
  tags: [],
  ribbon: null,
  quizJson: "[]",
  status: "draft",
};

export default async function NewArticlePage() {
  const paths = await prisma.learningPath.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { slug: true, title: true },
  });

  return <ArticleForm mode="create" initial={blank} pathOptions={paths} />;
}
