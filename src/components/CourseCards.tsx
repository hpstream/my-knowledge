import Link from "next/link";
import type { LearningPath, MarketingCourse } from "@/lib/types";

type FreeCourseCardProps = {
  path: LearningPath & { lessonCount: number };
};

function accentStyles(accent?: string) {
  switch (accent) {
    case "emerald":
      return {
        border: "border-emerald-200",
        badge: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };
    case "amber":
      return {
        border: "border-amber-200",
        badge: "bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };
    case "cyan":
      return {
        border: "border-cyan-200",
        badge: "bg-cyan-50 text-cyan-700",
        dot: "bg-cyan-500",
      };
    default:
      return {
        border: "border-slate-200",
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
      };
  }
}

export function FreeCourseCard({ path }: FreeCourseCardProps) {
  const accent = accentStyles(path.accent);

  return (
    <Link
      href={`/paths/${path.slug}`}
      className={`group block rounded-3xl border ${accent.border} bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${accent.badge}`}>
            {path.priceLabel ?? "免费"}
          </span>
          <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-900">
            {path.title}
          </h3>
        </div>
        <span className="text-sm text-slate-400 transition group-hover:translate-x-0.5">
          →
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
        {path.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{path.category}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
        <span>{path.lessonCount} 讲</span>
        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
        <span>约 {path.estimatedHours} 小时</span>
      </div>
    </Link>
  );
}

type PaidCourseCardProps = {
  course: MarketingCourse;
};

export function PaidCourseCard({ course }: PaidCourseCardProps) {
  const accent = accentStyles(course.accent);

  return (
    <div
      className={`rounded-3xl border ${accent.border} bg-[#f8fafc] p-5 transition hover:shadow-[0_18px_45px_rgba(15,23,42,0.06)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${accent.badge}`}>
            {course.priceLabel}
          </span>
          <h3 className="mt-3 text-lg font-semibold leading-7 text-slate-900">
            {course.title}
          </h3>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
          {course.statusLabel ?? "即将开放"}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
        {course.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{course.category}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
        <span>{course.lessonCount} 讲</span>
        <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
        <span>约 {course.estimatedHours} 小时</span>
      </div>
    </div>
  );
}
