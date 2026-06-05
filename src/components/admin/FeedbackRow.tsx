"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "open" | "triaged" | "resolved";

type Props = {
  id: string;
  initialStatus: Status;
};

export function FeedbackRowActions({ id, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [isPending, startTransition] = useTransition();

  async function patch(next: Status) {
    setStatus(next);
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setStatus(initialStatus);
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (!confirm("删除这条反馈？")) return;
    const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => patch(e.target.value as Status)}
        disabled={isPending}
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
      >
        <option value="open">待处理</option>
        <option value="triaged">已分类</option>
        <option value="resolved">已解决</option>
      </select>
      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        className="text-xs text-rose-600 hover:text-rose-700"
      >
        删除
      </button>
    </div>
  );
}
