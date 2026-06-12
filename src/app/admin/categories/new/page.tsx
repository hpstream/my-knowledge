import { CategoryForm } from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <CategoryForm
      mode="create"
      initial={{
        name: "",
        slug: "",
        sortOrder: 0,
        status: "active",
      }}
    />
  );
}
