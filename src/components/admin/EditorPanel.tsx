import type { ReactNode } from "react";

type Props = {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function EditorPanel({ title, hint, action, children, className }: Props) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 ${
        className ?? ""
      }`}
    >
      {title && (
        <header className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-slate-900">
            {title}
            {hint && (
              <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                {hint}
              </span>
            )}
          </h3>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export const editorInputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15";

export const editorLabelClass =
  "block text-[12px] font-medium text-slate-700";

export function EditorField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={editorLabelClass}>
        {label}
      </label>
      {children}
      {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
    </div>
  );
}

export function StatusToggle<T extends string>({
  value,
  options,
  onChange,
  name,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className="inline-flex w-full rounded-lg bg-slate-100 p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={
              active
                ? "inline-flex h-8 flex-1 items-center justify-center rounded-md bg-white px-3 text-[12px] font-semibold text-slate-900 shadow-sm"
                : "inline-flex h-8 flex-1 items-center justify-center rounded-md px-3 text-[12px] font-medium text-slate-500 transition hover:text-slate-900"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
