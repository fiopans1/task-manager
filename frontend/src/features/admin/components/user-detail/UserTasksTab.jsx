import { useCallback } from "react";
import { Pencil, Trash2 } from "@/shared/lib/icons";
import adminService from "@/services/adminService";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { StatusBadge, PriorityBadge } from "@/shared/ui/status-badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Skeleton } from "@/shared/ui/skeleton";
import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";

export function UserTasksTab({ userId, refreshKey, onEditTask, onDeleteTask }) {
  const fetchPage = useCallback(
    async (page, size) => adminService.fetchUserTasksPage(userId, page, size),
    [userId],
  );

  const { items: tasks, initialLoading, loading, hasMore, sentinelRef } =
    useServerInfiniteScroll(fetchPage, 50, [userId, refreshKey]);

  if (initialLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>List</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.nameOfTask}</TableCell>
              <TableCell><StatusBadge status={task.state} /></TableCell>
              <TableCell><PriorityBadge priority={task.priority} /></TableCell>
              <TableCell className="text-muted-foreground">{task.listName || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{task.teamName || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEditTask(task)}
                    aria-label="Edit task"
                    title="Edit task"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label="Delete task"
                    title="Delete task"
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                No tasks
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <LoadMoreSentinel sentinelRef={sentinelRef} hasMore={hasMore} loading={loading} />
    </>
  );
}
