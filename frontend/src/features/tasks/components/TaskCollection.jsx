import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Check, Trash2 } from "@/shared/lib/icons";
import taskService from "@/services/taskService";
import { useServerInfiniteScroll } from "@/shared/hooks/useInfiniteScroll";
import { EntityCollection } from "@/shared/patterns/entity-collection";
import { TaskRow } from "@/features/tasks/components/TaskRow";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { errorToast, successToast } from "@/shared/feedback/Noty";

const PRIORITY_RANK = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  MIN: 1,
};

function applyFilters(tasks, filters) {
  let result = tasks;

  if (filters.status !== "ALL") {
    result = result.filter((task) => task.state === filters.status);
  }
  if (filters.priority !== "ALL") {
    result = result.filter((task) => task.priority === filters.priority);
  }

  const sorted = [...result];
  if (filters.sort === "oldest") {
    sorted.sort((a, b) => a.id - b.id);
  } else if (filters.sort === "priority") {
    sorted.sort(
      (a, b) =>
        (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0),
    );
  } else if (filters.sort === "name") {
    sorted.sort((a, b) => a.nameOfTask.localeCompare(b.nameOfTask));
  } else {
    sorted.sort((a, b) => b.id - a.id);
  }

  return sorted;
}

export function TaskCollection({
  searchTerm,
  refreshKey,
  filters = { status: "ALL", priority: "ALL", sort: "newest" },
  onOpen,
  onEdit,
  onChanged,
  onCreate,
  onClearFilters,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchPage = useCallback(
    async (page, size) => taskService.fetchTasksPage(page, size, searchTerm),
    [searchTerm],
  );

  const { items, initialLoading, loading, hasMore, sentinelRef, error } =
    useServerInfiniteScroll(fetchPage, 50, [searchTerm, refreshKey]);

  const visibleTasks = useMemo(() => applyFilters(items, filters), [items, filters]);
  const filtersActive =
    filters.status !== "ALL" || filters.priority !== "ALL";

  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchTerm, refreshKey, filters.status, filters.priority, filters.sort]);

  const selectedTasks = visibleTasks.filter((task) => selectedIds.has(task.id));

  const toggleTask = (task) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(task.id)) next.delete(task.id);
      else next.add(task.id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(visibleTasks.map((task) => task.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkComplete = async () => {
    if (selectedTasks.length === 0) return;
    setBulkBusy(true);
    let updated = 0;
    try {
      // SQLite serialises writes; concurrent updates can hit SQLITE_BUSY.
      for (const task of selectedTasks) {
        await taskService.editTask({ ...task, state: "COMPLETED" });
        updated += 1;
      }
      successToast(
        selectedTasks.length === 1
          ? "Task marked as completed"
          : `${selectedTasks.length} tasks marked as completed`,
      );
      clearSelection();
      onChanged();
    } catch (error) {
      errorToast(
        `Updated ${updated} of ${selectedTasks.length} tasks. ${error.message}`,
      );
      onChanged();
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    setBulkBusy(true);
    let deleted = 0;
    try {
      for (const task of selectedTasks) {
        await taskService.deleteTask(task.id);
        deleted += 1;
      }
      successToast(
        selectedTasks.length === 1
          ? "Task deleted"
          : `${selectedTasks.length} tasks deleted`,
      );
      setBulkDeleteOpen(false);
      clearSelection();
      onChanged();
    } catch (error) {
      errorToast(
        `Deleted ${deleted} of ${selectedTasks.length} tasks. ${error.message}`,
      );
      onChanged();
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      errorToast("Error: No task selected");
      return;
    }

    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget.id);
      successToast("Task deleted successfully");
      setDeleteTarget(null);
      onChanged();
    } catch (error) {
      errorToast(`Error: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  let emptyState;
  if (filtersActive && items.length > 0) {
    emptyState = (
      <EmptyState
        icon={ClipboardList}
        title="No tasks match these filters"
        description="Adjust the status or priority filter to see more tasks."
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    );
  } else {
    emptyState = (
      <EmptyState
        icon={ClipboardList}
        title={searchTerm ? "No tasks found" : "No tasks yet"}
        description={
          searchTerm
            ? "No tasks match this search. Try a different term."
            : "Add your first task to start tracking work."
        }
        action={<Button onClick={onCreate}>Create first task</Button>}
      />
    );
  }

  const selectedCount = selectedTasks.length;

  return (
    <>
      {selectedCount > 0 ? (
        <div
          role="region"
          aria-label="Bulk actions"
          className="sticky top-2 z-10 flex flex-col gap-2 rounded-lg border border-brand/30 bg-brand-soft px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-brand">
              {selectedCount} selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection} disabled={bulkBusy}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllVisible}
              disabled={selectedCount === visibleTasks.length || bulkBusy}
            >
              Select all
            </Button>
            <Button size="sm" onClick={bulkComplete} disabled={bulkBusy}>
              <Check size={14} aria-hidden="true" />
              Mark complete
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkBusy}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}

      <EntityCollection
        title="All tasks"
        items={visibleTasks}
        initialLoading={initialLoading}
        loading={loading}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
        error={error}
        onRetry={onChanged}
        renderItem={(task) => (
          <TaskRow
            key={task.id}
            task={task}
            selected={selectedIds.has(task.id)}
            onSelectChange={toggleTask}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={setDeleteTarget}
          />
        )}
        emptyState={emptyState}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected tasks"
        description={
          selectedCount === 1
            ? "Delete the selected task? This action cannot be undone."
            : `Delete ${selectedCount} selected tasks? This action cannot be undone.`
        }
        confirmLabel={selectedCount === 1 ? "Delete task" : `Delete ${selectedCount} tasks`}
        onConfirm={bulkDelete}
        loading={bulkBusy}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Confirm deletion"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.nameOfTask}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete task"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
