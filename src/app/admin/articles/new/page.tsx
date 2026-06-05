import Link from "next/link";
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
  quizJson: "[]",
  status: "draft",
};

export default async function NewArticlePage() {
  const paths = await prisma.learningPath.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { slug: true, title: true },
  });

  return (
    <div>
      <Link
        href="/admin/articles"
        className="text-sm text-slate-500 transition hover:text-slate-900"
      >
        ← 返回列表
      </Link>
      <div className="mt-6 mb-8">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          New article
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
          新建文章
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          选「基础课时」要挂到一条学习路径下；选「专题文章」是独立的，挂在
          <code className="ml-1 font-mono">/topics/</code>。
        </p>
      </div>
      <ArticleForm mode="create" initial={blank} pathOptions={paths} />
    </div>
  );
}
