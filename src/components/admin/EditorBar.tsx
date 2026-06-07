"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  backHref: string;
  crumbs: Crumb[];
  rightMeta?: ReactNode;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  saveDraftLabel?: string;
  publishLabel?: string;
  deleteLabel?: string;
  submitting?: boolean;
  disabled?: boolean;
};

export function EditorBar({
  backHref,
  crumbs,
  rightMeta,
  onSaveDraft,
  onPublish,
  onDelete,
  saveDraftLabel = "保存草稿",
  publishLabel = "发布",
  deleteLabel = "删除",
  submitting = false,
  disabled = false,
}: Props) {
  return (
    <div className="sticky top-16 z-20 -mx-6 mb-6 border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md lg:-mx-10 lg:px-10">
      <div className="flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 text-[13px]">
          <Link
            href={backHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <BackIcon />
            <span>返回</span>
          </Link>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <nav aria-label="面包屑" className="flex min-w-0 items-center gap-2">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              const node = c.href && !last ? (
                <Link
                  href={c.href}
                  className="truncate text-slate-500 hover:text-slate-900"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={
                    last
                      ? "truncate font-semibold text-slate-900"
                      : "truncate text-slate-500"
                  }
                >
                  {c.label}
                </span>
              );
              return (
                <span key={i} className="inline-flex min-w-0 items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-slate-300">
                      /
                    </span>
                  )}
                  {node}
                </span>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {rightMeta && (
            <div className="hidden text-[12px] text-slate-500 sm:block">
              {rightMeta}
            </div>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={submitting || disabled}
              className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-3.5 text-[13px] font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteLabel}
            </button>
          )}
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={submitting || disabled}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveDraftLabel}
            </button>
          )}
          {onPublish && (
            <button
              type="button"
              onClick={onPublish}
              disabled={submitting || disabled}
              className="inline-flex h-9 items-center rounded-lg bg-orange-500 px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {submitting ? "保存中…" : publishLabel}
            </button>
          )}
        </div>
      </div>
    </div>
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
