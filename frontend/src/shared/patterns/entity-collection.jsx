import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";
import { CollectionSkeleton } from "@/shared/patterns/collection-skeleton";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/utils";

export function EntityCollection({
  title,
  items = [],
  renderItem,
  emptyState,
  headerActions,
  skeleton,
  initialLoading = false,
  loading = false,
  hasMore = false,
  sentinelRef,
  error = null,
  onRetry,
  className,
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {!initialLoading ? (
            <Badge tone="neutral">
              {items.length}
              {hasMore ? "+" : ""}
            </Badge>
          ) : null}
        </div>
        {headerActions ? (
          <div className="flex items-center gap-2">{headerActions}</div>
        ) : null}
      </header>

      {initialLoading ? (
        skeleton ?? <CollectionSkeleton />
      ) : error && items.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="Could not load this data"
            description="Something went wrong while fetching. Check your connection and try again."
            action={
              onRetry ? (
                <Button variant="outline" onClick={onRetry}>
                  Try again
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : items.length === 0 ? (
        emptyState ?? null
      ) : (
        <>
          {error ? (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-2 border-b border-warning/30 bg-warning-soft px-4 py-2 text-xs text-warning"
            >
              <span>Some results could not be loaded.</span>
              {onRetry ? (
                <Button variant="ghost" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}
          {items.map((item) => renderItem(item))}
          <LoadMoreSentinel
            sentinelRef={sentinelRef}
            hasMore={hasMore}
            loading={loading}
          />
        </>
      )}
    </section>
  );
}

export { CollectionSkeleton };
