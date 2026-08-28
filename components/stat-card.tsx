import type { ReactNode } from "react";
import { formatNumber, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

const tones = {
  blue: "from-blue-500/15 to-blue-500/5 border-blue-500/30 text-blue-700 dark:text-blue-300",
  teal: "from-teal-500/15 to-teal-500/5 border-teal-500/30 text-teal-700 dark:text-teal-300",
  amber: "from-amber-500/15 to-amber-500/5 border-amber-500/30 text-amber-700 dark:text-amber-300",
  rose: "from-rose-500/15 to-rose-500/5 border-rose-500/30 text-rose-700 dark:text-rose-300",
  indigo: "from-indigo-500/15 to-indigo-500/5 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
  emerald: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  sky: "from-sky-500/15 to-sky-500/5 border-sky-500/30 text-sky-700 dark:text-sky-300",
  orange: "from-orange-500/15 to-orange-500/5 border-orange-500/30 text-orange-700 dark:text-orange-300",
} as const;

function displayValue(value: ReactNode): ReactNode {
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return toFaDigits(value);
  return value;
}

export function StatCard({
  title,
  value,
  tone = "blue",
  icon,
  loading,
}: {
  title: string;
  value: ReactNode;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm",
        tones[tone]
      )}
    >
      <div className="pointer-events-none absolute -end-6 -top-6 size-24 rounded-full bg-white/40 blur-2xl dark:bg-white/5" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{loading ? "…" : displayValue(value) ?? "۰"}</p>
        </div>
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/70 text-current shadow-sm dark:bg-black/20">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
