import { useCallback } from "react";
import { ArrowLeftRight, ListTodo, UserRound } from "@/shared/lib/icons";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import teamService from "@/services/teamService";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { StatusBadge, PriorityBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";
import { Avatar } from "@/shared/ui/avatar";

const STATE_OPTIONS = [
  ["NEW", "New"],
  ["IN_PROGRESS", "In Progress"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
  ["PAUSSED", "Paused"],
];

const PRIORITY_OPTIONS = [
  ["CRITICAL", "Critical"],
  ["HIGH", "High"],
  ["MEDIUM", "Medium"],
  ["LOW", "Low"],
  ["MIN", "Min"],
];

export default function TasksTab({
  teamId,
  team,
  isAdmin,
  filterMember,
  filterState,
  filterPriority,
  onFilterMemberChange,
  onFilterStateChange,
  onFilterPriorityChange,
  onClearFilters,
  onReassign,
  onNavigateToTask,
  refreshKey,
}) {
  const fetchPage = useCallback(
    async (page, size) => {
      const filters = {};
      if (filterMember) filters.member = filterMember;
      if (filterState) filters.state = filterState;
      if (filterPriority) filters.priority = filterPriority;
      return teamService.fetchTeamTasksPage(teamId, filters, page, size);
    },
    [teamId, filterMember, filterState, filterPriority],
  );

  const { items: tasks, initialLoading, loading, hasMore, sentinelRef } =
    useServerInfiniteScroll(fetchPage, 50, [
      teamId,
      filterMember,
      filterState,
      filterPriority,
      refreshKey,
    ]);

  return (
    <div className="space-y-4">
      <Panel>
        <PanelContent className="grid gap-3 py-3 sm:grid-cols-2 lg:grid-cols-4">
          {isAdmin ? (
            <div className="space-y-1">
              <label className="text-2xs font-medium text-muted-foreground" htmlFor="team-filter-member">
                Member
              </label>
              <Select
                id="team-filter-member"
                value={filterMember}
                onChange={(event) => onFilterMemberChange(event.target.value)}
              >
                <option value="">All Members</option>
                {team.members?.map((member) => (
                  <option key={member.id} value={member.username}>
                    {member.username}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="text-2xs font-medium text-muted-foreground" htmlFor="team-filter-state">
              State
            </label>
            <Select
              id="team-filter-state"
              value={filterState}
              onChange={(event) => onFilterStateChange(event.target.value)}
            >
              <option value="">All States</option>
              {STATE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-2xs font-medium text-muted-foreground" htmlFor="team-filter-priority">
              Priority
            </label>
            <Select
              id="team-filter-priority"
              value={filterPriority}
              onChange={(event) => onFilterPriorityChange(event.target.value)}
            >
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" size="sm" className="w-full" onClick={onClearFilters}>
              Clear
            </Button>
          </div>
        </PanelContent>
      </Panel>

      <Panel>
        <PanelHeader>
          <PanelTitle>Team tasks</PanelTitle>
          <Badge tone="neutral">{tasks.length}</Badge>
        </PanelHeader>
        <PanelContent className="p-0">
          {initialLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title={
                isAdmin
                  ? "No tasks found with selected filters"
                  : "No tasks found assigned to you"
              }
              description="Adjust the filters or add a task to this team."
            />
          ) : (
            <>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  data-testid="team-task-row"
                  className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <button
                    type="button"
                    onClick={() => onNavigateToTask(task.id)}
                    className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block truncate text-sm font-medium text-foreground hover:text-brand">
                      {task.nameOfTask}
                    </span>
                    {task.descriptionOfTask ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {task.descriptionOfTask}
                      </span>
                    ) : null}
                  </button>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {task.user ? (
                      <span className="inline-flex items-center gap-1 text-2xs text-muted-foreground">
                        <Avatar name={task.user} size="xs" />
                        {task.user}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs text-muted-foreground">
                        <UserRound size={12} aria-hidden="true" />
                        Unassigned
                      </span>
                    )}
                    <StatusBadge status={task.state} />
                    <PriorityBadge priority={task.priority} />
                    {isAdmin ? (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => onReassign(task)}
                        title="Reassign task"
                        aria-label="Reassign task"
                      >
                        <ArrowLeftRight size={14} aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
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
    </div>
  );
}
