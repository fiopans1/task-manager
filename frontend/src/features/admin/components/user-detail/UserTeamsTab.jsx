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
import { formatDate } from "@/shared/lib/formatDate";

export function UserTeamsTab({ userId, refreshKey, onEditTeam, onDeleteTeam }) {
  const fetchPage = useCallback(
    async (page, size) => adminService.fetchUserTeamsPage(userId, page, size),
    [userId],
  );

  const { items: teams, initialLoading, loading, hasMore, sentinelRef } =
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
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell className="max-w-[220px] truncate text-muted-foreground">
                {team.description || "—"}
              </TableCell>
              <TableCell className="tabular-nums">{team.memberCount}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {team.creationDate ? formatDate(team.creationDate) : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEditTeam(team)}
                    aria-label="Edit team"
                    title="Edit team"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDeleteTeam(team.id)}
                    aria-label="Delete team"
                    title="Delete team"
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {teams.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No teams
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <LoadMoreSentinel sentinelRef={sentinelRef} hasMore={hasMore} loading={loading} />
    </>
  );
}
