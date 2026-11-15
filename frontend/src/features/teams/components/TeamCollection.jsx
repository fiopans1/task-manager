import { useCallback, useMemo, useState } from "react";
import { Users } from "@/shared/lib/icons";
import teamService from "@/services/teamService";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { EntityCollection } from "@/shared/patterns/entity-collection";
import { TeamRow } from "@/features/teams/components/TeamRow";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";

function applyTeamFilters(teams, filters) {
  let result = teams;

  if (filters.size === "SOLO") {
    result = result.filter((team) => (team.memberCount ?? 0) <= 1);
  } else if (filters.size === "SMALL") {
    result = result.filter((team) => {
      const members = team.memberCount ?? 0;
      return members >= 2 && members <= 4;
    });
  } else if (filters.size === "LARGE") {
    result = result.filter((team) => (team.memberCount ?? 0) >= 5);
  }

  const sorted = [...result];
  if (filters.sort === "oldest") {
    sorted.sort((a, b) => a.id - b.id);
  } else if (filters.sort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (filters.sort === "members") {
    sorted.sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0));
  } else {
    sorted.sort((a, b) => b.id - a.id);
  }

  return sorted;
}

export function TeamCollection({
  searchTerm,
  refreshKey,
  filters = { size: "ALL", sort: "newest" },
  onOpen,
  onEdit,
  onChanged,
  onCreate,
  onClearFilters,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(
    async (page, size) => teamService.fetchTeamsPage(page, size, searchTerm),
    [searchTerm],
  );

  const { items, initialLoading, loading, hasMore, sentinelRef, error } =
    useServerInfiniteScroll(fetchPage, 50, [searchTerm, refreshKey]);

  const visibleTeams = useMemo(() => applyTeamFilters(items, filters), [items, filters]);
  const filtersActive = filters.size !== "ALL";

  const handleDelete = async () => {
    if (!deleteTarget) {
      errorToast("Error: No team selected");
      return;
    }

    setDeleting(true);
    try {
      await promiseToast(teamService.deleteTeam(deleteTarget.id), {
        loading: "Deleting team...",
        success: "Team deleted successfully",
        error: (requestError) => `Error: ${requestError?.message || requestError}`,
      });
      setDeleteTarget(null);
      onChanged();
    } catch {
      // Toast already shown.
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <EntityCollection
        title="All teams"
        items={visibleTeams}
        initialLoading={initialLoading}
        loading={loading}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
        error={error}
        onRetry={onChanged}
        renderItem={(team) => (
          <TeamRow
            key={team.id}
            team={team}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={setDeleteTarget}
          />
        )}
        emptyState={
          filtersActive && items.length > 0 ? (
            <EmptyState
              icon={Users}
              title="No teams match these filters"
              description="Change the size filter to see more teams."
              action={
                <Button variant="outline" onClick={onClearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title={searchTerm ? "No teams found" : "No teams yet"}
              description={
                searchTerm
                  ? "Try another search to find the team you need."
                  : "Create a team to start collaborating with other users."
              }
            />
          )
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Confirm deletion"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete team"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
