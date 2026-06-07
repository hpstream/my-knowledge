"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV_ITEMS = [
  { href: "/search?kind=topic", label: "专题" },
  { href: "/search?kind=path", label: "免费课程" },
  { href: "/about", label: "关于" },
];

export function SiteHeader() {
  const { user, openLoginModal, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="超级个体首页">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full p-[2px] ring-1 ring-slate-900">
            <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-[13px] font-bold leading-none text-white">
              超
            </span>
          </span>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">超级个体</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="搜索"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a.75.75 0 11-1.06 1.06l-3.08-3.08A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm transition hover:border-slate-300"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {(user.displayName || user.email).slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-slate-700 sm:inline">
                  {user.displayName || user.email.split("@")[0].slice(0, 12)}
                </span>
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="关闭菜单"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
                  >
                    <div className="px-3 py-2 text-xs text-slate-500">{user.email}</div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                        role="menuitem"
                      >
                        后台
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false);
                        await logout();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                      role="menuitem"
                    >
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLoginModal()}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              登录
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
