import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

export function StatStrip({ items, className, loading = false }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-4 sm:divide-y-0",
        className,
      )}
      aria-busy={loading || undefined}
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
            {loading ? (
              <Skeleton className="mt-2 h-7 w-16" />
            ) : (
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {item.value}
              </p>
            )}
            {loading && item.hint ? (
              <Skeleton className="mt-1.5 h-3 w-24" />
            ) : item.hint ? (
              <p className="mt-0.5 text-2xs text-muted-foreground">{item.hint}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function StatStripSkeleton({ items = 4, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-4 sm:divide-y-0",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="space-y-2 px-4 py-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
