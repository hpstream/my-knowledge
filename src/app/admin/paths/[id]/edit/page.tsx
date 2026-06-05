import Link from "next/link";
import { notFound } from "next/navigation";
import { PathForm, type PathFormValues } from "@/components/admin/PathForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.learningPath.findUnique({ where: { id } });
  if (!row) notFound();

  let highlights: string[] = [];
  try {
    const parsed = JSON.parse(row.highlightsJson || "[]");
    if (Array.isArray(parsed)) highlights = parsed.filter((s) => typeof s === "string");
  } catch {
    highlights = [];
  }

  const initial: PathFormValues = {
    title: row.title,
    description: row.description,
    estimatedHours: row.estimatedHours,
    level: row.level,
    category: row.category,
    badge: row.badge ?? "",
    pricing: row.pricing === "paid" ? "paid" : "free",
    priceLabel: row.priceLabel ?? "",
    statusLabel: row.statusLabel ?? "",
    highlights,
    accent: row.accent ?? "",
    status: row.status === "published" ? "published" : "draft",
    sortOrder: row.sortOrder,
  };

  return (
    <div>
      <Link
        href="/admin/paths"
        className="text-sm text-slate-500 transition hover:text-slate-900"
      >
        ← 返回列表
      </Link>
      <div className="mt-6 mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Edit path
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
            编辑学习路径
          </h1>
          <p className="mt-2 font-mono text-sm text-slate-500">/paths/{row.slug}</p>
        </div>
        {row.status === "published" && (
          <Link
            href={`/paths/${row.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400"
          >
            在前台查看 ↗
          </Link>
        )}
      </div>
      <PathForm mode="edit" pathId={row.id} initial={initial} />
    </div>
  );
}
