import { useCallback } from "react";
import { History } from "@/shared/lib/icons";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import teamService from "@/services/teamService";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";
import { formatDateTime } from "@/shared/lib/formatDate";

export default function HistoryTab({ teamId, refreshKey }) {
  const fetchPage = useCallback(
    async (page, size) => teamService.fetchAssignmentHistoryPage(teamId, page, size),
    [teamId],
  );

  const { items: history, initialLoading, loading, hasMore, sentinelRef } =
    useServerInfiniteScroll(fetchPage, 50, [teamId, refreshKey]);

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Assignment history</PanelTitle>
        <Badge tone="neutral">{history.length}</Badge>
      </PanelHeader>
      <PanelContent className="p-0">
        {initialLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={History}
            title="No assignment history yet"
            description="Assignments and reassignments will appear here."
          />
        ) : (
          <>
            {history.map((entry) => (
              <div
                key={entry.id}
                data-testid="history-row"
                className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {entry.taskName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {entry.fromUsername ? (
                      <>
                        <Badge tone="outline">{entry.fromUsername}</Badge>
                        <span aria-hidden="true">→</span>
                      </>
                    ) : (
                      <span>Assigned to</span>
                    )}
                    <Badge tone="brand">{entry.toUsername}</Badge>
                    <span>by {entry.changedByUsername}</span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-2xs text-muted-foreground">
                  {formatDateTime(entry.changedDate)}
                </span>
              </div>
            ))}
            <LoadMoreSentinel
              sentinelRef={sentinelRef}
              hasMore={hasMore}
              loading={loading}
            />
          </>
        )}
      </PanelContent>
    </Panel>
  );
}
