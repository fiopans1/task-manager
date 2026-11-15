import { cn } from "@/shared/lib/utils";
import { EmptyState } from "@/shared/ui/empty-state";
import { History } from "lucide-react";

const TONES = {
  brand: "border-brand/25 bg-brand-soft text-brand",
  success: "border-success/25 bg-success-soft text-success",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/25 bg-danger-soft text-danger",
  info: "border-info/25 bg-info-soft text-info",
  neutral: "border-border bg-surface-2 text-muted-foreground",
};

export function ActivityTimeline({ items = [], emptyTitle, emptyDescription, className }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={emptyTitle ?? "No activity yet"}
        description={emptyDescription}
      />
    );
  }

  return (
    <ol className={cn("relative", className)}>
      {items.map((item, index) => {
        const IconComponent = item.icon;
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden="true"
                className="absolute left-4 top-9 h-[calc(100%-1.5rem)] w-px bg-border"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                TONES[item.tone] ?? TONES.neutral,
              )}
            >
              {IconComponent ? (
                <IconComponent size={14} aria-hidden="true" />
              ) : null}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.meta ? (
                  <div className="flex flex-wrap items-center gap-2 text-2xs text-muted-foreground">
                    {item.meta}
                  </div>
                ) : null}
              </div>
              {item.description ? (
                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
