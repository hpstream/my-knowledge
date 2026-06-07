import type { ReactNode } from "react";

type Preset = {
  label: string;
  tint: string;
  icon: ReactNode;
};

const PRESETS: Record<string, Preset> = {
  issue: {
    label: "跑不通",
    tint: "bg-rose-50 text-rose-500 ring-rose-100",
    icon: <BugIcon />,
  },
  improve: {
    label: "建议改进",
    tint: "bg-amber-50 text-amber-500 ring-amber-100",
    icon: <LightbulbIcon />,
  },
  praise: {
    label: "感谢",
    tint: "bg-emerald-50 text-emerald-500 ring-emerald-100",
    icon: <HeartIcon />,
  },
  question: {
    label: "提问",
    tint: "bg-sky-50 text-sky-500 ring-sky-100",
    icon: <QuestionIcon />,
  },
  outdated: {
    label: "过时",
    tint: "bg-amber-50 text-amber-500 ring-amber-100",
    icon: <ClockIcon />,
  },
};

function presetFor(category: string): Preset {
  return (
    PRESETS[category] ?? {
      label: category,
      tint: "bg-slate-100 text-slate-500 ring-slate-200",
      icon: <DotIcon />,
    }
  );
}

export function feedbackCategoryLabel(category: string): string {
  return presetFor(category).label;
}

export function FeedbackCategoryIcon({
  category,
  size = "md",
}: {
  category: string;
  size?: "sm" | "md" | "lg";
}) {
  const preset = presetFor(category);
  const dimension =
    size === "lg" ? "h-14 w-14" : size === "sm" ? "h-7 w-7" : "h-10 w-10";
  const iconScale = size === "lg" ? 28 : size === "sm" ? 14 : 18;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ring-1 ${preset.tint} ${dimension}`}
      aria-label={preset.label}
      title={preset.label}
    >
      <span
        aria-hidden="true"
        style={{ width: iconScale, height: iconScale }}
        className="inline-flex"
      >
        {preset.icon}
      </span>
    </span>
  );
}

function BugIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M12 6V3" />
      <path d="M2 13h4" />
      <path d="M18 13h4" />
      <path d="M3 6l3 2" />
      <path d="M21 6l-3 2" />
      <path d="M3 20l3-2" />
      <path d="M21 20l-3-2" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
      <path d="M12 2a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2zm-2 19a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1h-4v1z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
      <path d="M12 21s-7-4.5-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="currentColor" width="100%" height="100%">
      <circle cx="5" cy="5" r="3" />
    </svg>
  );
}
