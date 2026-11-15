import { Skeleton } from "@/shared/ui/skeleton";

export function LoadMoreSentinel({
  sentinelRef,
  hasMore,
  loading,
  label = "Loading more...",
}) {
  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="py-3"
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <span className="sr-only">{label}</span>
          <div aria-hidden="true" className="px-4">
            <Skeleton className="h-12 w-full" />
          </div>
        </>
      ) : (
        <span className="sr-only">More results load automatically</span>
      )}
    </div>
  );
}
