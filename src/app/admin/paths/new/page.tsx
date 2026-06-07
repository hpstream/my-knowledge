import { PathForm, type PathFormValues } from "@/components/admin/PathForm";

export const dynamic = "force-dynamic";

const blank: PathFormValues = {
  title: "",
  description: "",
  estimatedHours: 2,
  level: "入门",
  category: "AI Engineering",
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

export default function NewPathPage() {
  return <PathForm mode="create" initial={blank} />;
}
