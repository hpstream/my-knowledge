import Link from "next/link";
import type { LearningPath } from "@/lib/types";

type Props = {
  path: LearningPath & { lessonCount: number };
  index: number;
};

const HIGHLIGHT_DOTS = ["bg-marker", "bg-stamp-red", "bg-highlight"];

export function FoundationCard({ path, index }: Props) {
  const dotClass = HIGHLIGHT_DOTS[index % HIGHLIGHT_DOTS.length];

  return (
    <Link
      href={`/paths/${path.slug}`}
      className="group block field-card ink-shadow p-0 overflow-hidden"
    >
      {/* Top label strip */}
      <div className="flex items-center justify-between border-b border-ink px-5 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
          <span className="font-cjk-serif text-xs text-ink-soft">
            基础认知
          </span>
        </div>
        <span className="font-cjk-serif text-xs text-ink-muted">
          第 {String(index + 1).padStart(2, "0")} 课
        </span>
      </div>

      <div className="px-5 py-5">
        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-ink">
          {path.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">
          {path.description}
        </p>

        {/* Highlights as a checklist */}
        {path.highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {path.highlights.slice(0, 3).map((h) => (
              <li
                key={h}
                className="flex items-start gap-2 text-[13px] text-ink-soft"
              >
                <span className="mt-1 inline-block h-1 w-1 rounded-full bg-ink" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom meta row */}
      <div className="flex items-center justify-between border-t border-ink/15 bg-paper-deep/40 px-5 py-3 font-cjk-serif text-sm text-ink-muted">
        <span className="flex items-center gap-3">
          <span>{path.lessonCount} 讲</span>
          <span className="inline-block h-1 w-1 rounded-full bg-ink-faint" />
          <span>约 {path.estimatedHours} 小时</span>
        </span>
        <span className="font-cjk-serif text-base font-medium text-ink transition-transform group-hover:translate-x-1">
          阅读 →
        </span>
      </div>
    </Link>
  );
}
