import { cn } from "@/shared/lib/utils";

export function StatStrip({ items, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-4 sm:divide-y-0",
        className,
      )}
    >
      {items.map((item) => {
        const IconComponent = item.icon;

        return (
          <div key={item.label} className="px-4 py-4">
            <p className="flex items-center gap-1.5 text-2xs font-medium text-muted-foreground">
              {IconComponent ? (
                <IconComponent size={13} aria-hidden="true" />
              ) : null}
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {item.value}
            </p>
            {item.hint ? (
              <p className="mt-0.5 text-2xs text-muted-foreground">{item.hint}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
