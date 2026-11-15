import { useCallback, useMemo, useState } from "react";
import { ListChecks } from "@/shared/lib/icons";
import listService from "@/services/listService";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { EntityCollection } from "@/shared/patterns/entity-collection";
import { ListRow } from "@/features/lists/components/ListRow";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { errorToast, promiseToast } from "@/shared/feedback/Noty";

function listProgress(list) {
  const total = list.totalElements ?? 0;
  const completed = list.completedElements ?? 0;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function applyListFilters(lists, filters) {
  let result = lists;

  if (filters.progress === "EMPTY") {
    result = result.filter((list) => (list.totalElements ?? 0) === 0);
  } else if (filters.progress === "COMPLETE") {
    result = result.filter((list) => {
      const total = list.totalElements ?? 0;
      return total > 0 && (list.completedElements ?? 0) === total;
    });
  } else if (filters.progress === "ACTIVE") {
    result = result.filter((list) => {
      const total = list.totalElements ?? 0;
      return total > 0 && (list.completedElements ?? 0) < total;
    });
  }

  const sorted = [...result];
  if (filters.sort === "oldest") {
    sorted.sort((a, b) => a.id - b.id);
  } else if (filters.sort === "name") {
    sorted.sort((a, b) => a.nameOfList.localeCompare(b.nameOfList));
  } else if (filters.sort === "progress") {
    sorted.sort((a, b) => listProgress(b) - listProgress(a));
  } else {
    sorted.sort((a, b) => b.id - a.id);
  }

  return sorted;
}

export function ListCollection({
  searchTerm,
  refreshKey,
  filters = { progress: "ALL", sort: "newest" },
  onOpen,
  onEdit,
  onChanged,
  onCreate,
  onClearFilters,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPage = useCallback(
    async (page, size) => listService.fetchListsPage(page, size, searchTerm),
    [searchTerm],
  );

  const { items, initialLoading, loading, hasMore, sentinelRef, error } =
    useServerInfiniteScroll(fetchPage, 50, [searchTerm, refreshKey]);

  const visibleLists = useMemo(() => applyListFilters(items, filters), [items, filters]);
  const filtersActive = filters.progress !== "ALL";

  const handleDelete = async () => {
    if (!deleteTarget) {
      errorToast("Error: No lists selected");
      return;
    }

    setDeleting(true);
    try {
      await promiseToast(listService.deleteList(deleteTarget.id), {
        loading: "Deleting list...",
        success: "List deleted successfully",
        error: (requestError) => `Error: ${requestError?.message || requestError}`,
      });
      setDeleteTarget(null);
      onChanged();
    } catch (error) {
      errorToast(`Error: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <EntityCollection
        title="All lists"
        items={visibleLists}
        initialLoading={initialLoading}
        loading={loading}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
        error={error}
        onRetry={onChanged}
        renderItem={(list) => (
          <ListRow
            key={list.id}
            list={list}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={setDeleteTarget}
          />
        )}
        emptyState={
          filtersActive && items.length > 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No lists match these filters"
              description="Change the progress filter to see more lists."
              action={
                <Button variant="outline" onClick={onClearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No lists available"
              description={
                searchTerm
                  ? "No lists match this search. Try a different term."
                  : "Create a new list to organise your tasks."
              }
              action={<Button onClick={onCreate}>Create first list</Button>}
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
            ? `Are you sure you want to delete "${deleteTarget.nameOfList}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete list"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
