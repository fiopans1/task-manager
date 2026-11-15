import { Spinner } from "@/shared/ui/spinner";

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
      className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground"
    >
      {loading ? (
        <>
          <Spinner size={14} label="Loading more" />
          <span>{label}</span>
        </>
      ) : (
        <span className="sr-only">More results load automatically</span>
      )}
    </div>
  );
}
