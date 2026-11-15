import { Skeleton } from "@/shared/ui/skeleton";

export function CollectionSkeleton({ rows = 4 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 border-b border-border px-4 py-4 last:border-0"
        >
          <Skeleton className="size-9 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}
