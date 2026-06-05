import Link from "next/link";
import { requireAdminUser } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
              admin
            </span>
            <span className="text-sm font-medium text-slate-900">
              内容管理后台
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline">·</span>
            <span className="hidden text-xs text-slate-500 sm:inline">
              {user.email}
            </span>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/admin"
              className="text-slate-700 transition hover:text-slate-950"
            >
              仪表盘
            </Link>
            <Link
              href="/admin/paths"
              className="text-slate-700 transition hover:text-slate-950"
            >
              路径
            </Link>
            <Link
              href="/admin/articles"
              className="text-slate-700 transition hover:text-slate-950"
            >
              文章
            </Link>
            <Link
              href="/admin/feedback"
              className="text-slate-700 transition hover:text-slate-950"
            >
              反馈
            </Link>
            <Link
              href="/"
              className="text-slate-500 transition hover:text-slate-900"
            >
              返回前台
            </Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">{children}</div>
    </div>
  );
}
