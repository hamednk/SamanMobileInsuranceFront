import type { ReactNode } from "react";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DetailHero({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
  tone = "blue",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  tone?: "blue" | "amber" | "emerald" | "sky";
}) {
  const tones = {
    blue: "from-primary/20 via-sky-500/10 to-transparent border-primary/20",
    amber: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/25",
    emerald: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/25",
    sky: "from-sky-500/20 via-primary/10 to-transparent border-sky-500/25",
  };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm", tones[tone])}>
      <div className="pointer-events-none absolute -start-10 -top-10 size-40 rounded-full bg-white/50 blur-3xl dark:bg-white/5" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          {eyebrow ? <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold sm:text-2xl">
              {typeof title === "string" ? toFaDigits(title) : title}
            </h1>
            {badge}
          </div>
          {subtitle ? (
            <p className="max-w-xl text-sm text-muted-foreground">
              {typeof subtitle === "string" ? toFaDigits(subtitle) : subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function DetailSection({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-primary/10 bg-card/80 p-4 shadow-sm backdrop-blur", className)}>
      <div className="mb-3 flex items-center gap-2">
        {icon ? (
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        ) : null}
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function DetailField({
  label,
  value,
  icon,
  mono,
  full,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-border/70 bg-muted/30 p-3",
        full && "sm:col-span-2"
      )}
    >
      {icon ? (
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-medium break-words", mono && "font-mono tracking-wide")}>
          {typeof value === "string" || typeof value === "number" ? toFaDigits(value) : value}
        </span>
      </div>
    </div>
  );
}
