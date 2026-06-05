import Link from "next/link";
import { PathForm, type PathFormValues } from "@/components/admin/PathForm";

export const dynamic = "force-dynamic";

const blank: PathFormValues = {
  title: "",
  description: "",
  estimatedHours: 2,
  level: "Beginner",
  category: "AI Engineering",
  badge: "",
  pricing: "free",
  priceLabel: "免费",
  statusLabel: "",
  highlights: [],
  accent: "emerald",
  status: "draft",
  sortOrder: 0,
};

export default function NewPathPage() {
  return (
    <div>
      <Link
        href="/admin/paths"
        className="text-sm text-slate-500 transition hover:text-slate-900"
      >
        ← 返回列表
      </Link>
      <div className="mt-6 mb-8">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          New path
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
          新建学习路径
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          路径 URL slug 会自动生成；保存后可以在文章管理里把文章归到这条路径下。
        </p>
      </div>
      <PathForm mode="create" initial={blank} />
    </div>
  );
}
