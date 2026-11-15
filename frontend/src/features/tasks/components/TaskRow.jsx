import {
  CheckCircle2,
  Circle,
  CircleDot,
  CirclePause,
  Clock,
  Eye,
  Pencil,
  Trash2,
  XCircle,
} from "@/shared/lib/icons";
import { StatusBadge, PriorityBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { EntityRow } from "@/shared/patterns/entity-row";
import { formatDuration } from "@/shared/lib/formatDuration";
import { cn } from "@/shared/lib/utils";

const STATE_STYLES = {
  NEW: { icon: Circle, className: "border-info/25 bg-info-soft text-info" },
  IN_PROGRESS: {
    icon: CircleDot,
    className: "border-brand/25 bg-brand-soft text-brand",
  },
  COMPLETED: {
    icon: CheckCircle2,
    className: "border-success/25 bg-success-soft text-success",
  },
  CANCELLED: {
    icon: XCircle,
    className: "border-danger/25 bg-danger-soft text-danger",
  },
  PAUSSED: {
    icon: CirclePause,
    className: "border-warning/25 bg-warning-soft text-warning",
  },
  PAUSED: {
    icon: CirclePause,
    className: "border-warning/25 bg-warning-soft text-warning",
  },
};

function stateStyle(state) {
  return (
    STATE_STYLES[String(state ?? "").toUpperCase()] ?? {
      icon: Circle,
      className: "border-border bg-surface-2 text-muted-foreground",
    }
  );
}

export function TaskRow({ task, onOpen, onEdit, onDelete, selected = false, onSelectChange }) {
  const meta = stateStyle(task.state);
  const IconComponent = meta.icon;

  return (
    <EntityRow
      data-testid="item-card"
      data-task-id={task.id}
      className={selected ? "bg-brand-soft/30" : undefined}
      leading={
        <div className="flex items-center gap-1">
          <label className="flex size-11 cursor-pointer items-center justify-center sm:size-8">
            <Checkbox
              checked={selected}
              onChange={() => onSelectChange?.(task)}
              aria-label={`Select ${task.nameOfTask}`}
            />
          </label>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-sm border",
              meta.className,
            )}
          >
            <IconComponent size={17} aria-hidden="true" />
          </span>
        </div>
      }
      title={
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className="text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="line-clamp-1">{task.nameOfTask}</span>
        </button>
      }
      badges={
        <>
          <StatusBadge status={task.state} />
          <PriorityBadge priority={task.priority} />
          {task.isRunning ? (
            <Badge tone="success">
              <span
                className="size-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none"
                aria-hidden="true"
              />
              Running
            </Badge>
          ) : null}
        </>
      }
      description={task.descriptionOfTask || "No description"}
      meta={
        <>
          <span className="font-mono text-2xs">#{task.id}</span>
          {task.totalTimeSeconds > 0 ? (
            <span className="inline-flex items-center gap-1 font-mono text-2xs tabular-nums">
              <Clock size={12} aria-hidden="true" />
              {formatDuration(task.totalTimeSeconds)}
            </span>
          ) : null}
        </>
      }
      actions={
        <>
          <Button
            variant="soft"
            size="sm"
            onClick={() => onOpen(task.id)}
            aria-label="Open task"
            className="hidden sm:inline-flex"
          >
            <Eye size={14} aria-hidden="true" />
            Open
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(task)}
            aria-label="Edit"
            title="Edit"
            className="size-11 sm:size-8"
          >
            <Pencil size={15} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(task)}
            aria-label="Delete"
            title="Delete"
            className="size-11 text-muted-foreground hover:bg-danger-soft hover:text-danger sm:size-8"
          >
            <Trash2 size={15} aria-hidden="true" />
          </Button>
        </>
      }
    />
  );
}
