import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "@/shared/lib/icons";
import { DetailLayout } from "@/shared/patterns/detail-layout";
import { PageHeader } from "@/shared/patterns/page-header";
import { StatStrip } from "@/shared/patterns/stat-strip";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Spinner } from "@/shared/ui/spinner";
import { Checkbox } from "@/shared/ui/checkbox";
import { SearchInput } from "@/shared/ui/search-input";
import { LoadMoreSentinel } from "@/shared/patterns/load-more-sentinel";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import ListFormDialog from "@/features/lists/components/ListFormDialog";
import { ListTaskRow } from "@/features/lists/components/details/ListTaskRow";
import { useListDetails } from "@/features/lists/hooks/useListDetails";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export default function ListDetailsPage() {
  const { id } = useParams();
  const details = useListDetails(id);
  const [removeTarget, setRemoveTarget] = useState(null);

  const header = (
    <PageHeader
      meta="Workspace / Lists"
      title={details.list?.nameOfList ?? "List"}
      description="Track and manage the tasks in this list."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={details.goBack}
            aria-label="Back to lists"
            title="Back to lists"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            onClick={() => details.setEditOpen(true)}
            disabled={!details.list}
            aria-label="Edit list"
          >
            <Pencil size={15} aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => details.setDeleteOpen(true)}
            disabled={!details.list}
            aria-label="Delete list"
            className="text-danger hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete
          </Button>
        </div>
      }
    />
  );

  if (details.loading) {
    return (
      <DetailLayout header={header}>
        <Panel className="space-y-3 p-5">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </Panel>
      </DetailLayout>
    );
  }

  if (details.error || !details.list) {
    return (
      <DetailLayout header={header}>
        <Panel>
          <EmptyState
            icon={ListChecks}
            title="Could not load this list"
            description={details.error || "The list may have been deleted."}
            action={<Button onClick={details.refresh}>Try Again</Button>}
          />
        </Panel>
      </DetailLayout>
    );
  }

  const { list } = details;
  const description = list.descriptionOfList;
  const hasDescription = description && description !== "<None>";
  const isLongDescription = hasDescription && description.length >= 100;

  return (
    <>
      <DetailLayout
        header={header}
        stats={
          <StatStrip
            items={[
              { label: "Total Tasks", value: details.totalTasks, icon: ListChecks },
              { label: "Completed", value: details.completedTasks, icon: FileText },
              { label: "Progress", value: `${details.progressPercentage}%` },
            ]}
          />
        }
      >
        <Panel className="overflow-hidden">
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: list.color || "var(--brand)" }}
            aria-hidden="true"
          />
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-2xs text-muted-foreground">
                List #{list.id}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Progress
                value={details.progressPercentage}
                tone={details.progressPercentage === 100 ? "success" : "brand"}
                label="Overall progress"
                className="flex-1"
              />
              <span className="font-mono text-2xs tabular-nums text-muted-foreground">
                {details.completedTasks}/{details.totalTasks} done
              </span>
            </div>
          </div>
          <PanelContent>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText size={14} aria-hidden="true" />
              Description
            </div>
            {hasDescription ? (
              <>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                  {details.showMore || !isLongDescription
                    ? description
                    : `${description.substring(0, 100)}...`}
                </p>
                {isLongDescription ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 h-auto p-0"
                    onClick={() => details.setShowMore((current) => !current)}
                  >
                    {details.showMore ? "Show Less ↑" : "Show More ↓"}
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No description available.
              </p>
            )}
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader className="gap-3">
            <PanelTitle>Task List</PanelTitle>
            <Button size="sm" onClick={details.openAddModal}>
              <Plus size={14} aria-hidden="true" />
              Add Task
            </Button>
          </PanelHeader>

          <PanelContent className="p-0">
            {details.tasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No tasks in this list"
                description="Add existing tasks to get started."
                action={
                  <Button variant="outline" onClick={details.openAddModal}>
                    <Plus size={14} aria-hidden="true" />
                    Add the first task
                  </Button>
                }
              />
            ) : (
              <>
                {details.paginatedTasks.map((task) => (
                  <ListTaskRow
                    key={task.id}
                    task={task}
                    onOpen={details.goToTask}
                    onRemove={setRemoveTarget}
                  />
                ))}
                <LoadMoreSentinel
                  sentinelRef={details.sentinelRef}
                  hasMore={details.hasMore}
                  loading={false}
                />
              </>
            )}
          </PanelContent>
        </Panel>
      </DetailLayout>

      <Dialog open={details.addOpen} onOpenChange={details.setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Tasks to List</DialogTitle>
            <DialogDescription>
              Select tasks that do not belong to another list yet.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <SearchInput
              value={details.searchAvailable}
              onChange={(event) => details.setSearchAvailable(event.target.value)}
              onClear={() => details.setSearchAvailable("")}
              placeholder="Search tasks..."
            />

            {details.loadingAvailable ? (
              <div role="status" aria-live="polite">
                <span className="sr-only">Loading available tasks</span>
                <div aria-hidden="true" className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-sm border border-border px-3 py-2.5"
                    >
                      <Skeleton className="size-4 shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ) : details.filteredAvailableTasks.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No unassigned tasks available"
                description="All tasks already belong to a list."
                className="py-8"
              />
            ) : (
              <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                {details.filteredAvailableTasks.map((task) => {
                  const selected = details.selectedTaskIds.includes(task.id);

                  return (
                    <button
                      key={task.id}
                      type="button"
                      data-testid="available-task-row"
                      onClick={() => details.toggleTaskSelection(task.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "border-brand bg-brand-soft"
                          : "border-border hover:bg-surface-2",
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        onChange={() => details.toggleTaskSelection(task.id)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Select ${task.nameOfTask}`}
                      />
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">
                        {task.nameOfTask}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => details.setAddOpen(false)}
              disabled={details.pending}
            >
              Cancel
            </Button>
            <Button
              onClick={details.addTasks}
              disabled={details.selectedTaskIds.length === 0 || details.pending}
            >
              {details.pending ? <Spinner size={14} label="Adding tasks" /> : null}
              Add Selected Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ListFormDialog
        open={details.editOpen}
        onOpenChange={details.setEditOpen}
        mode="edit"
        initialData={list}
        onSaved={details.refresh}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="Remove task from list"
        description={
          removeTarget
            ? `Remove "${removeTarget.nameOfTask}" from this list? The task itself will not be deleted.`
            : "The task itself will not be deleted."
        }
        confirmLabel="Remove task"
        onConfirm={async () => {
          if (!removeTarget) return;
          await details.removeTask(removeTarget.id);
          setRemoveTarget(null);
        }}
        loading={details.pending}
      />

      <ConfirmDialog
        open={details.deleteOpen}
        onOpenChange={details.setDeleteOpen}
        title="Delete list"
        description={
          list
            ? `Are you sure you want to delete "${list.nameOfList}"? The tasks inside will not be deleted, but they will be unlinked from the list. This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete list"
        onConfirm={details.deleteList}
        loading={details.pending}
      />
    </>
  );
}
