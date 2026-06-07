"use client";

export type RibbonValue = "精品" | "推荐" | "新品" | "热门" | "付费" | null;

const OPTIONS: Array<{ value: RibbonValue; label: string; color: string }> = [
  { value: null, label: "无", color: "" },
  { value: "精品", label: "精品", color: "bg-amber-500" },
  { value: "推荐", label: "推荐", color: "bg-orange-500" },
  { value: "新品", label: "新品", color: "bg-emerald-500" },
  { value: "热门", label: "热门", color: "bg-rose-500" },
  { value: "付费", label: "付费", color: "bg-violet-500" },
];

type Props = {
  value: RibbonValue;
  onChange: (value: RibbonValue) => void;
};

export function RibbonSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              active
                ? "inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white transition"
                : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            }
          >
            {opt.color && (
              <span className={`h-2 w-2 rounded-full ${opt.color}`} />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
