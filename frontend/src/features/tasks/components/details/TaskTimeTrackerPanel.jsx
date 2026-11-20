import { useCallback, useState } from "react";
import { CirclePlay, CircleStop, Clock } from "@/shared/lib/icons";
import useTaskTimer from "@/features/tasks/hooks/useTaskTimer";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import taskService from "@/services/taskService";
import { formatDuration } from "@/shared/lib/formatDuration";
import { promiseToast } from "@/shared/feedback/Noty";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Alert } from "@/shared/ui/alert";
import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { formatDateTime } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/utils";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unknown error";

export default function TaskTimeTrackerPanel({ taskId, onTimerChange, className }) {
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const {
    status,
    loading,
    error,
    action,
    activeElapsedSeconds,
    liveTotalSeconds,
    start,
    stop,
    reload,
  } = useTaskTimer(taskId);

  const fetchPage = useCallback(
    async (page, size) => {
      if (!taskId) return { content: [], last: true };
      return taskService.fetchTimeEntriesPage(taskId, page, size);
    },
    [taskId],
  );

  const {
    items: entries,
    initialLoading: entriesLoading,
    hasMore: entriesHasMore,
    loading: entriesFetching,
    sentinelRef,
  } = useServerInfiniteScroll(fetchPage, 20, [taskId, historyRefreshKey]);

  const running = Boolean(status?.running);
  const actionInProgress = action !== null;
  const sessionsCount = status?.sessionsCount ?? 0;

  const handleStart = async () => {
    try {
      await promiseToast(start(), {
        loading: "Starting timer...",
        success: "Timer started",
        error: (requestError) => `Error: ${getErrorMessage(requestError)}`,
      });
      setHistoryRefreshKey((key) => key + 1);
      onTimerChange?.();
    } catch {
      // promiseToast already surfaced the error.
    }
  };

  const handleStop = async () => {
    try {
      await promiseToast(stop(), {
        loading: "Stopping timer...",
        success: "Timer stopped",
        error: (requestError) => `Error: ${getErrorMessage(requestError)}`,
      });
      setHistoryRefreshKey((key) => key + 1);
      onTimerChange?.();
    } catch {
      // promiseToast already surfaced the error.
    }
  };

  if (loading && !status) {
    return (
      <Panel
        className={cn("flex flex-col", className)}
        data-testid="time-tracking-panel"
      >
        <PanelHeader>
          <PanelTitle>Time Tracking</PanelTitle>
        </PanelHeader>
        <PanelContent className="flex-1 space-y-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-9 w-full" />
        </PanelContent>
      </Panel>
    );
  }

  if (error && !status) {
    return (
      <Panel
        className={cn("flex flex-col", className)}
        data-testid="time-tracking-panel"
      >
        <PanelHeader>
          <PanelTitle>Time Tracking</PanelTitle>
        </PanelHeader>
        <PanelContent className="flex-1">
          <Alert tone="danger" title="Time tracking unavailable">
            {getErrorMessage(error)}
          </Alert>
          <Button variant="outline" className="mt-3" onClick={reload}>
            Retry
          </Button>
        </PanelContent>
      </Panel>
    );
  }

  const mainTime = running ? activeElapsedSeconds : liveTotalSeconds;

  return (
    <Panel
      className={cn("flex flex-col", className)}
      data-testid="time-tracking-panel"
    >
      <PanelHeader>
        <PanelTitle>Time Tracking</PanelTitle>
        <Badge tone={running ? "success" : "neutral"}>
          {running ? (
            <span
              className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : null}
          {running ? "Tracking" : "Idle"}
        </Badge>
      </PanelHeader>

      <PanelContent className="flex flex-1 flex-col space-y-4">
        <div className="rounded-md border border-border bg-surface-2 px-4 py-4">
          <p className="text-2xs font-medium text-muted-foreground">
            {running ? "Current session" : "Total tracked"}
          </p>
          <p
            role="timer"
            aria-label={running ? "Current session duration" : "Total tracked time"}
            className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground"
          >
            {formatDuration(mainTime)}
          </p>
          <p className="mt-1 text-2xs text-muted-foreground">
            {running ? (
              <>
                Total{" "}
                <span className="font-mono tabular-nums">
                  {formatDuration(liveTotalSeconds)}
                </span>
                {status?.activeEntry?.startTime
                  ? ` · started ${formatDateTime(status.activeEntry.startTime)}`
                  : ""}
              </>
            ) : sessionsCount === 0 ? (
              "No sessions recorded yet"
            ) : (
              `${sessionsCount} session${sessionsCount === 1 ? "" : "s"} recorded`
            )}
          </p>
        </div>

        <Button
          variant={running ? "destructive" : "default"}
          size="lg"
          className="w-full"
          onClick={running ? handleStop : handleStart}
          disabled={actionInProgress}
        >
          {actionInProgress ? (
            <Spinner size={16} label="Updating timer" />
          ) : running ? (
            <CircleStop size={17} aria-hidden="true" />
          ) : (
            <CirclePlay size={17} aria-hidden="true" />
          )}
          {action === "start"
            ? "Starting..."
            : action === "stop"
              ? "Stopping..."
              : running
                ? "Stop timer"
                : "Start timer"}
        </Button>

        <p className="text-center text-2xs leading-5 text-muted-foreground">
          {running
            ? "The timer keeps running even if you leave this page."
            : "You can start it again as many times as you need."}
        </p>

        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">Sessions</h3>
            <span className="font-mono text-2xs tabular-nums text-muted-foreground">
              {sessionsCount}
            </span>
          </div>

          {entriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No time tracked yet"
              description="Start the timer to create the first session."
              className="py-8"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const duration = entry.active
                      ? activeElapsedSeconds
                      : entry.durationSeconds;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {formatDateTime(entry.startTime)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {entry.active ? (
                            <Badge tone="success">
                              <span
                                className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
                                aria-hidden="true"
                              />
                              Running
                            </Badge>
                          ) : (
                            formatDateTime(entry.endTime)
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums">
                          {formatDuration(duration)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {entry.user || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <LoadMoreSentinel
                sentinelRef={sentinelRef}
                hasMore={entriesHasMore}
                loading={entriesFetching}
              />
            </>
          )}
        </div>
      </PanelContent>
    </Panel>
  );
}
