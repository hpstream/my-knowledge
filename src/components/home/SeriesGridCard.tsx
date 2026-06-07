import Link from "next/link";
import type { PathWithCount } from "@/lib/paths";

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

const RIBBON_COLORS: Record<string, string> = {
  精品: "bg-amber-500",
  推荐: "bg-orange-500",
  新品: "bg-emerald-500",
  热门: "bg-rose-500",
  付费: "bg-violet-500",
};

type Props = {
  path: PathWithCount;
  index: number;
};

export function SeriesGridCard({ path, index }: Props) {
  const colorIndex = index % PASTEL_COVERS.length;
  const coverClass = PASTEL_COVERS[colorIndex];
  const textClass = PASTEL_TEXT[colorIndex];
  const ribbonColor = path.ribbon ? RIBBON_COLORS[path.ribbon] : null;
  const visibleTags = (path.tags ?? []).slice(0, 3);

  return (
    <Link
      href={`/paths/${path.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative">
        {path.coverUrl ? (
          <div className="h-28 overflow-hidden bg-slate-100">
            <img
              src={path.coverUrl}
              alt={path.title}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className={`flex h-28 items-center justify-center px-4 ${coverClass}`}
          >
            <span
              className={`line-clamp-2 text-center text-sm font-semibold leading-snug ${textClass}`}
            >
              {path.title}
            </span>
          </div>
        )}
        {path.ribbon && ribbonColor && (
          <span
            className={`absolute right-2 top-2 rounded-full ${ribbonColor} px-2 py-0.5 text-[10px] font-medium text-white shadow-sm`}
          >
            {path.ribbon}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
          {path.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {path.description}
        </p>
        {visibleTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {visibleTags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-4 text-xs text-slate-400">
          {path.lessonCount} 讲 · 约 {path.estimatedHours} 小时
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-0 rounded-full bg-orange-500 transition-all group-hover:w-2" />
        </div>
      </div>
    </Link>
  );
}
