import { cn } from "@/lib/utils";

const steps = ["اطلاعات بیمه", "تصاویر موبایل", "پرداخت", "صدور بیمه‌نامه"];

export function WizardStepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="grid grid-cols-4 gap-2 rounded-2xl border border-primary/15 bg-gradient-to-l from-primary/5 via-background to-brand/5 p-3">
      {steps.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        const done = step < current;
        return (
          <li key={label} className="flex flex-col gap-1 text-center text-xs">
            <span
              className={cn(
                "mx-auto flex size-8 items-center justify-center rounded-full border text-sm font-medium transition",
                active && "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30",
                done && "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                !active && !done && "border-border text-muted-foreground"
              )}
            >
              {step}
            </span>
            <span className={cn(active ? "font-medium text-primary" : "text-muted-foreground")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
