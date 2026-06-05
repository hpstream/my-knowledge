"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { href: "/topics", label: "专题" },
  { href: "/#foundations", label: "基础认知" },
  { href: "/#about", label: "关于" },
];

export function SiteHeader() {
  const { user, openLoginModal, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-3 text-ink"
          aria-label="超级个体首页"
        >
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper font-display font-black text-[15px] leading-none shadow-[inset_0_0_0_2px_var(--paper),inset_0_0_0_3px_var(--ink)] tracking-tight">
            超
          </span>
          <span className="font-cjk-serif text-base font-bold tracking-tight text-ink">
            超级个体
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-cjk-serif text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 border border-ink/30 bg-paper px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink rounded-sm"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-marker text-[10px] font-bold text-paper">
                {(user.displayName || user.email).slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[140px] truncate font-cjk-serif text-sm">
                {user.displayName ||
                  user.email.split("@")[0].slice(0, 12)}
              </span>
              {user.role === "admin" && (
                <span className="bg-stamp-red px-2 py-0.5 font-cjk-serif text-[11px] font-semibold text-paper">
                  管理员
                </span>
              )}
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
                  className="absolute right-0 z-20 mt-2 w-60 border border-ink bg-paper py-1 ink-shadow-static"
                >
                  <div className="border-b border-ink/15 px-4 py-3">
                    <div className="font-cjk-serif text-xs text-ink-muted">
                      已登录
                    </div>
                    <div className="mt-1 truncate text-sm text-ink">
                      {user.email}
                    </div>
                  </div>
                  {user.role === "admin" && (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-ink hover:text-paper"
                        role="menuitem"
                      >
                        仪表盘
                      </Link>
                      <Link
                        href="/admin/paths"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-ink hover:text-paper"
                        role="menuitem"
                      >
                        路径管理
                      </Link>
                      <Link
                        href="/admin/articles"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-ink hover:text-paper"
                        role="menuitem"
                      >
                        文章管理
                      </Link>
                      <Link
                        href="/admin/feedback"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-ink hover:text-paper"
                        role="menuitem"
                      >
                        读者反馈
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-ink hover:text-paper"
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
            className="group inline-flex items-center gap-2 bg-ink px-4 py-2 font-cjk-serif text-sm font-medium text-paper transition-colors hover:bg-marker rounded-sm"
          >
            <span>登录 / 注册</span>
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
