import { ArrowRight, CheckCircle2, Circle, Trash2 } from "@/shared/lib/icons";
import { Button } from "@/shared/ui/button";
import { StatusBadge, PriorityBadge } from "@/shared/ui/status-badge";
import { cn } from "@/shared/lib/utils";

export function ListTaskRow({ task, onOpen, onRemove }) {
  const completed = task.state === "COMPLETED";

  return (
    <div
      data-testid="list-task-row"
      className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
    >
      {completed ? (
        <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden="true" />
      ) : (
        <Circle size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      )}

      <button
        type="button"
        data-testid="list-task-title"
        onClick={() => onOpen(task.id)}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={cn(
            "block truncate text-sm font-medium",
            completed ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {task.nameOfTask}
        </span>
        {task.descriptionOfTask ? (
          <span className="block truncate text-xs text-muted-foreground">
            {task.descriptionOfTask}
          </span>
        ) : null}
      </button>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <StatusBadge status={task.state} />
        <span className="hidden sm:inline-flex">
          <PriorityBadge priority={task.priority} />
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onOpen(task.id)}
        title="Open task details"
        aria-label="Open task details"
        className="size-11 sm:size-8"
      >
        <ArrowRight size={15} aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(task)}
        title="Remove from list"
        aria-label="Remove from list"
        className="size-11 text-muted-foreground hover:bg-danger-soft hover:text-danger sm:size-8"
      >
        <Trash2 size={15} aria-hidden="true" />
      </Button>
    </div>
  );
}
