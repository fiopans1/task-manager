import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "@/shared/lib/icons";
import taskService from "@/services/taskService";
import { promiseToast } from "@/shared/feedback/Noty";
import { DetailLayout } from "@/shared/patterns/detail-layout";
import { PageHeader } from "@/shared/patterns/page-header";
import { Panel } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import TaskFormDialog from "@/features/tasks/components/TaskFormDialog";
import { TaskSummaryPanel } from "@/features/tasks/components/details/TaskSummaryPanel";
import { TaskMetaPanel } from "@/features/tasks/components/details/TaskMetaPanel";
import TaskTimeTrackerPanel from "@/features/tasks/components/details/TaskTimeTrackerPanel";
import TaskActionsPanel from "@/features/tasks/components/details/TaskActionsPanel";
import { useTaskDetails } from "@/features/tasks/hooks/useTaskDetails";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { task, loading, error, reload } = useTaskDetails(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionsRefreshKey, setActionsRefreshKey] = useState(0);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await promiseToast(taskService.deleteTask(id), {
        loading: "Deleting task...",
        success: "Task deleted successfully",
        error: (requestError) => `Error: ${requestError?.message || requestError}`,
      });
      setDeleteOpen(false);
      navigate("/home/tasks");
    } catch {
      // Toast already shown by promiseToast.
    } finally {
      setDeleting(false);
    }
  };

  const header = (
    <PageHeader
      meta="Workspace / Tasks"
      title={task?.nameOfTask ?? "Task"}
      description={task ? `Task #${task.id}` : "Complete task information and status"}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate("/home/tasks")}
            aria-label="Back to tasks"
            title="Back to tasks"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            disabled={!task}
            aria-label="Edit task"
          >
            <Pencil size={15} aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            disabled={!task}
            aria-label="Delete task"
            className="text-danger hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete
          </Button>
        </div>
      }
    />
  );

  if (loading) {
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

  if (error || !task) {
    return (
      <DetailLayout header={header}>
        <Panel>
          <EmptyState
            title="Could not load this task"
            description={error || "The task may have been deleted."}
            action={<Button onClick={reload}>Try Again</Button>}
          />
        </Panel>
      </DetailLayout>
    );
  }

  return (
    <>
      <DetailLayout
        header={header}
        contentClassName="flex min-h-full flex-col gap-6 space-y-0"
      >
        <TaskSummaryPanel task={task} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-6 lg:col-start-2 lg:row-start-1">
            <TaskMetaPanel task={task} />
            <TaskTimeTrackerPanel
              taskId={id}
              onTimerChange={() => setActionsRefreshKey((key) => key + 1)}
            />
          </div>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <TaskActionsPanel
              taskId={id}
              teamId={task.teamId}
              externalRefreshKey={actionsRefreshKey}
              className="h-full"
            />
          </div>
        </div>
      </DetailLayout>

      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialData={task}
        onSaved={reload}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete task"
        description={
          task
            ? `Are you sure you want to delete "${task.nameOfTask}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete task"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
