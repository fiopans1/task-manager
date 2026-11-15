import { useCallback } from "react";
import { Pencil, Trash2 } from "@/shared/lib/icons";
import adminService from "@/services/adminService";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
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

export function UserListsTab({ userId, refreshKey, onEditList, onDeleteList }) {
  const fetchPage = useCallback(
    async (page, size) => adminService.fetchUserListsPage(userId, page, size),
    [userId],
  );

  const { items: lists, initialLoading, loading, hasMore, sentinelRef } =
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
            <TableHead>Description</TableHead>
            <TableHead>Total Tasks</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lists.map((list) => (
            <TableRow key={list.id}>
              <TableCell>
                <span className="inline-flex items-center gap-2 font-medium">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: list.color || "var(--muted-foreground)" }}
                    aria-hidden="true"
                  />
                  {list.nameOfList}
                </span>
              </TableCell>
              <TableCell className="max-w-[220px] truncate text-muted-foreground">
                {list.descriptionOfList || "—"}
              </TableCell>
              <TableCell className="tabular-nums">{list.totalElements}</TableCell>
              <TableCell className="tabular-nums">{list.completedElements}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEditList(list)}
                    aria-label="Edit list"
                    title="Edit list"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDeleteList(list.id)}
                    aria-label="Delete list"
                    title="Delete list"
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {lists.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No lists
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <LoadMoreSentinel sentinelRef={sentinelRef} hasMore={hasMore} loading={loading} />
    </>
  );
}
