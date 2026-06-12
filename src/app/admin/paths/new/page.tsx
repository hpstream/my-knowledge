import { PathForm, type PathFormValues } from "@/components/admin/PathForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const blank: PathFormValues = {
  title: "",
  description: "",
  estimatedHours: 2,
  level: "入门",
  category: "",
  categoryId: "",
  badge: "",
  pricing: "free",
  priceLabel: "免费",
  statusLabel: "",
  highlights: [],
  accent: "emerald",
  coverUrl: null,
  tags: [],
  ribbon: null,
  status: "draft",
  sortOrder: 0,
};

export default async function NewPathPage() {
  const categoryOptions = await prisma.pathCategory.findMany({
    where: { status: "active" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, slug: true },
  });

  const initial = {
    ...blank,
    categoryId: categoryOptions[0]?.id ?? "",
    category: categoryOptions[0]?.name ?? "",
  };

  return <PathForm mode="create" initial={initial} categoryOptions={categoryOptions} />;
}
