import { useNavigate } from "react-router-dom";
import { ArrowRight, ListTodo } from "@/shared/lib/icons";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { Button } from "@/shared/ui/button";
import { EntityRow } from "@/shared/patterns/entity-row";
import { StatusBadge } from "@/shared/ui/status-badge";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function RecentTasksPanel({ tasks = [], loading, error, completed, total, progress }) {
  const navigate = useNavigate();

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Recent tasks</PanelTitle>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={() => navigate("/home/tasks")}
        >
          View all <ArrowRight size={12} aria-hidden="true" />
        </Button>
      </PanelHeader>
      <PanelContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={ListTodo}
            title="Could not load tasks"
            description="Refresh the page to try again."
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Create your first task to start planning your work."
          />
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => navigate(`/home/tasks/${task.id}`)}
              className="block w-full text-left transition-colors hover:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <EntityRow
                title={task.nameOfTask}
                className="border-b-border px-4"
                badges={<StatusBadge status={task.state} />}
                meta={<span className="font-mono text-2xs">{formatDate(task.creationDate)}</span>}
              />
            </button>
          ))
        )}
      </PanelContent>
      {!loading && !error && total > 0 ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <span className="text-2xs text-muted-foreground">
            {completed}/{total} recent tasks completed
          </span>
          <span className="font-mono text-2xs tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
      ) : null}
    </Panel>
  );
}
