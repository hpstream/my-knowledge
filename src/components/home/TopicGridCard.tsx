import Link from "next/link";

type Topic = {
  slug: string;
  title: string;
  summary: string | null;
  difficulty: number | null;
  cost: string | null;
  coverUrl: string | null;
  tags: string[];
  ribbon: string | null;
  publishedAt: Date | null;
  readMinutes: number;
};

const RIBBON_COLORS: Record<string, string> = {
  精品: "bg-amber-500",
  推荐: "bg-orange-500",
  新品: "bg-emerald-500",
  热门: "bg-rose-500",
  付费: "bg-violet-500",
};

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

type Props = {
  topic: Topic;
  index: number;
};

export function TopicGridCard({ topic, index }: Props) {
  const free = isFree(topic.cost);
  const colorIndex = index % PASTEL_COVERS.length;
  const coverClass = PASTEL_COVERS[colorIndex];
  const textClass = PASTEL_TEXT[colorIndex];
  const ribbonColor = topic.ribbon ? RIBBON_COLORS[topic.ribbon] : null;
  const visibleTags = (topic.tags ?? []).slice(0, 3);

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative">
        {topic.coverUrl ? (
          <div className="h-24 overflow-hidden bg-slate-100">
            <img
              src={topic.coverUrl}
              alt={topic.title}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className={`flex h-24 items-center justify-center px-4 ${coverClass}`}
          >
            <span
              className={`line-clamp-2 text-center text-sm font-semibold leading-snug ${textClass}`}
            >
              {topic.title}
            </span>
          </div>
        )}
        {topic.ribbon && ribbonColor && (
          <span
            className={`absolute right-2 top-2 rounded-full ${ribbonColor} px-2 py-0.5 text-[10px] font-medium text-white shadow-sm`}
          >
            {topic.ribbon}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs text-slate-400">
          {formatDate(topic.publishedAt)}
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold text-slate-900">
          {topic.title}
        </h3>
        {topic.summary && (
          <p className="mt-2 line-clamp-1 text-sm text-slate-500">
            {topic.summary}
          </p>
        )}
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
        <div className="mt-auto flex items-center justify-between pt-4 text-xs">
          <span className="text-amber-500">{stars(topic.difficulty)}</span>
          <span
            className={
              free
                ? "rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700"
                : "rounded-full bg-orange-50 px-2.5 py-0.5 font-medium text-orange-700"
            }
          >
            {free ? "免费" : topic.cost}
          </span>
        </div>
      </div>
    </Link>
  );
}
