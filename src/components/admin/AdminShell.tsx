"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminUserSummary = {
  email: string;
  displayName: string | null;
};

type Props = {
  user: AdminUserSummary;
  children: ReactNode;
};

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  match: (path: string) => boolean;
  icon: ReactNode;
}> = [
  {
    href: "/admin",
    label: "仪表盘",
    match: (p) => p === "/admin",
    icon: <DashboardIcon />,
  },
  {
    href: "/admin/articles",
    label: "文章",
    match: (p) => p.startsWith("/admin/articles"),
    icon: <ArticleIcon />,
  },
  {
    href: "/admin/paths",
    label: "路径",
    match: (p) => p.startsWith("/admin/paths"),
    icon: <PathIcon />,
  },
  {
    href: "/admin/feedback",
    label: "反馈",
    match: (p) => p.startsWith("/admin/feedback"),
    icon: <FeedbackIcon />,
  },
];

export function AdminShell({ user, children }: Props) {
  const pathname = usePathname() || "/admin";
  const activeLabel =
    NAV_ITEMS.find((item) => item.match(pathname))?.label ?? "仪表盘";
  const initial = (user.displayName || user.email).slice(0, 1).toUpperCase();
  const displayName = user.displayName || user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="px-5 py-6">
            <Link
              href="/admin"
              className="flex items-center gap-2.5"
              aria-label="超级个体 Admin 后台首页"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                超
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-slate-900">
                  超级个体
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                  Admin
                </span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3" aria-label="后台导航">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <span className="text-slate-400" aria-hidden="true">
                    <BackIcon />
                  </span>
                  <span>返回前台</span>
                </Link>
              </li>
            </ul>

            <div className="my-3 border-t border-slate-100" />

            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = item.match(pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        active
                          ? "flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-700"
                          : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                      }
                    >
                      <span
                        className={
                          active ? "text-orange-600" : "text-slate-400"
                        }
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-slate-200 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {initial}
              </span>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-slate-900">
                  {displayName}
                </span>
                <span className="truncate text-[11px] text-slate-500">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6 lg:px-10">
              <div className="flex items-center gap-3 md:hidden">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  超
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {activeLabel}
                </span>
              </div>
              <h1 className="hidden text-lg font-semibold tracking-[-0.01em] text-slate-900 md:block">
                {activeLabel}
              </h1>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/feedback"
                  aria-label="反馈通知"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <BellIcon />
                </Link>
                <div
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                  aria-label={user.email}
                  title={user.email}
                >
                  {initial}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M16 4v3h3" />
      <path d="M8 12h8" />
      <path d="M8 16h6" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M6 7v3a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v1" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4l-5 1 1-4.5A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 5 5v6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
