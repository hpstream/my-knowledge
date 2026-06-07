"use client";

import { useRef, useState } from "react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
};

export function CoverUpload({ value, onChange, folder = "covers" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openPicker() {
    if (uploading) return;
    inputRef.current?.click();
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          maxBytes?: number;
        };
        if (data.error === "FILE_TOO_LARGE") {
          setError("文件太大（最大 5 MB）");
        } else if (data.error === "UNSUPPORTED_TYPE") {
          setError("仅支持 JPG / PNG / WebP / GIF");
        } else if (data.error === "FORBIDDEN") {
          setError("权限不足，请重新登录");
        } else {
          setError("上传失败，请重试");
        }
        return;
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
    } catch {
      setError("网络异常，请重试");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) handleFile(file);
  }

  function clear() {
    onChange(null);
    setError(null);
  }

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt="封面预览"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 disabled:opacity-50"
          >
            {uploading ? "上传中…" : "更换封面"}
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={uploading}
            className="rounded-full px-3 py-1.5 text-xs text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
          >
            删除
          </button>
        </div>
        {error && (
          <p className="text-xs text-rose-600">{error}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-slate-300 disabled:opacity-50"
      >
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="mt-2 text-[13px] font-medium text-slate-700">
          {uploading ? "上传中…" : "点击上传封面"}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          JPG / PNG / WebP · 最大 5 MB
        </p>
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  );
}
