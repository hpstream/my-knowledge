"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "open" | "triaged" | "resolved";

type Props = {
  id: string;
  initialStatus: Status;
};

const STATUS_LABEL: Record<Status, string> = {
  open: "待处理",
  triaged: "已分类",
  resolved: "已解决",
};

export function FeedbackRowActions({ id, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  async function patch(next: Status) {
    const prev = status;
    setStatus(next);
    setMenuOpen(false);
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setStatus(prev);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    setMenuOpen(false);
    if (!confirm("删除这条反馈？")) return;
    const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    startTransition(() => router.refresh());
  }

  const primaryLabel =
    status === "resolved" ? "重新开启" : "标记已解决";
  const primaryNext: Status = status === "resolved" ? "open" : "resolved";
  const primaryClass =
    status === "resolved"
      ? "inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50"
      : "inline-flex h-8 items-center rounded-lg bg-orange-500 px-3 text-[12px] font-semibold text-white transition hover:bg-orange-600";

  return (
    <div className="flex items-center gap-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => patch(primaryNext)}
        disabled={isPending}
        className={`${primaryClass} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {primaryLabel}
      </button>
      <div className="relative">
        <button
          type="button"
          aria-label="更多操作"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <span aria-hidden="true">⋯</span>
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            {(["open", "triaged", "resolved"] as Status[])
              .filter((s) => s !== status)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  role="menuitem"
                  onClick={() => patch(s)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-slate-700 transition hover:bg-slate-50"
                >
                  改为「{STATUS_LABEL[s]}」
                </button>
              ))}
            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              role="menuitem"
              onClick={remove}
              className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-rose-600 transition hover:bg-rose-50"
            >
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
