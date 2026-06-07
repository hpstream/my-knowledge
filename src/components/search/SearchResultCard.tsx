import Link from "next/link";
import type { SearchResult } from "@/lib/search";

const PASTEL_COVERS = [
  "bg-amber-100",
  "bg-sky-100",
  "bg-emerald-100",
  "bg-pink-100",
] as const;

const PASTEL_TEXT = [
  "text-amber-800",
  "text-sky-800",
  "text-emerald-800",
  "text-pink-800",
] as const;

const KIND_LABELS: Record<SearchResult["kind"], string> = {
  topic: "专题",
  path: "系列",
};

const RIBBON_COLORS: Record<NonNullable<SearchResult["ribbon"]>, string> = {
  精品: "bg-amber-500",
  推荐: "bg-orange-500",
  新品: "bg-emerald-500",
  热门: "bg-rose-500",
  付费: "bg-violet-500",
};

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit" });
}

function stars(d: number | null): string {
  const n = Math.max(0, Math.min(3, d ?? 0));
  return "★".repeat(n) + "☆".repeat(3 - n);
}

function isFree(cost: string | null): boolean {
  if (!cost) return true;
  const t = cost.trim().toLowerCase();
  return t === "" || t === "免费" || t === "free" || t === "¥0" || t === "0";
}

function hrefFor(r: SearchResult): string {
  if (r.kind === "path") return `/paths/${r.slug}`;
  return `/topics/${r.slug}`;
}

type Props = {
  result: SearchResult;
  index: number;
};

export function SearchResultCard({ result, index }: Props) {
  const colorIndex = index % PASTEL_COVERS.length;
  const coverClass = PASTEL_COVERS[colorIndex];
  const textClass = PASTEL_TEXT[colorIndex];
  const free = isFree(result.cost);

  return (
    <Link
      href={hrefFor(result)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="relative h-24 overflow-hidden bg-slate-100">
        {result.coverUrl ? (
          <img
            src={result.coverUrl}
            alt={result.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center px-4 ${coverClass}`}
          >
            <span
              className={`line-clamp-2 text-center text-sm font-semibold leading-snug ${textClass}`}
            >
              {result.title}
            </span>
          </div>
        )}
        {result.ribbon && (
          <span
            className={`absolute right-2 top-2 rounded-full ${RIBBON_COLORS[result.ribbon]} px-2 py-0.5 text-[10px] font-medium text-white shadow-sm`}
          >
            {result.ribbon}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
            {KIND_LABELS[result.kind]}
          </span>
          <span className="text-slate-400">
            {formatDate(result.publishedAt)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {result.title}
        </h3>
        {result.summary && (
          <p className="line-clamp-1 text-xs text-slate-500">
            {result.summary}
          </p>
        )}
        {result.tags && result.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {result.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-amber-500">{stars(result.difficulty)}</span>
          <span
            className={
              free
                ? "rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700"
                : "rounded-full bg-orange-50 px-2 py-0.5 font-medium text-orange-700"
            }
          >
            {free ? "免费" : result.cost}
          </span>
        </div>
      </div>
    </Link>
  );
}
