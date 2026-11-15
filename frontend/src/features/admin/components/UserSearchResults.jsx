import { useCallback } from "react";
import { Eye, Lock, Unlock, UserX } from "@/shared/lib/icons";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import adminService from "@/services/adminService";
import { Panel, PanelContent } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Avatar } from "@/shared/ui/avatar";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";

export default function UserSearchResults({ query, refreshKey, onViewUser, onToggleBlock }) {
  const fetchPage = useCallback(
    async (page, size) => adminService.fetchUserSearchPage(query, page, size),
    [query],
  );

  const { items: users, initialLoading, loading, hasMore, sentinelRef, error, reset } =
    useServerInfiniteScroll(fetchPage, 50, [query, refreshKey]);

  if (initialLoading) {
    return (
      <Panel className="space-y-3 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </Panel>
    );
  }

  if (error && users.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={UserX}
          title="Could not search users"
          description="Something went wrong while searching. Check your connection and try again."
          action={
            <Button variant="outline" onClick={reset}>
              Try again
            </Button>
          }
        />
      </Panel>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={UserX}
          title="No users found"
          description="Try a different username or clear the search."
        />
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelContent className="p-0">
        {users.map((user) => (
          <div
            key={user.id}
            data-testid="user-card"
            className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={user.username} size="md" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.username}
                  </span>
                  {user.blocked ? <Badge tone="danger">Blocked</Badge> : null}
                  {user.roles?.map((role) => (
                    <Badge key={role} tone={role.includes("ADMIN") ? "danger" : "brand"}>
                      {role}
                    </Badge>
                  ))}
                </div>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <p className="text-2xs text-muted-foreground">
                  {user.taskCount} tasks · {user.listCount} lists · {user.teamCount} teams
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onViewUser(user)}
                title="View details"
                aria-label="View details"
              >
                <Eye size={15} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onToggleBlock(user)}
                title={user.blocked ? "Unblock" : "Block"}
                aria-label={user.blocked ? "Unblock" : "Block"}
                className={
                  user.blocked
                    ? "text-success hover:bg-success-soft hover:text-success"
                    : "text-danger hover:bg-danger-soft hover:text-danger"
                }
              >
                {user.blocked ? <Unlock size={15} aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
              </Button>
            </div>
          </div>
        ))}
        <LoadMoreSentinel sentinelRef={sentinelRef} hasMore={hasMore} loading={loading} />
      </PanelContent>
    </Panel>
  );
}
