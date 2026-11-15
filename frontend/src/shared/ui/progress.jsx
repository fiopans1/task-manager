import { cn } from "@/shared/lib/utils";

const TONES = {
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

export function Progress({ value = 0, tone = "brand", className, label }) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-surface-3",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", TONES[tone] ?? TONES.brand)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
