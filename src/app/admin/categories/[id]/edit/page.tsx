import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.pathCategory.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <CategoryForm
      mode="edit"
      categoryId={row.id}
      initial={{
        name: row.name,
        slug: row.slug,
        sortOrder: row.sortOrder,
        status: row.status === "archived" ? "archived" : "active",
      }}
    />
  );
}
