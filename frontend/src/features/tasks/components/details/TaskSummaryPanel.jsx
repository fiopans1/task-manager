import { useState } from "react";
import { FileText } from "@/shared/lib/icons";
import { Panel, PanelContent } from "@/shared/ui/panel";
import { StatusBadge, PriorityBadge } from "@/shared/ui/status-badge";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function TaskSummaryPanel({ task }) {
  const [showMore, setShowMore] = useState(false);
  const description = task.descriptionOfTask;
  const hasDescription = description && description !== "<None>";
  const isLong = hasDescription && description.length >= 100;

  return (
    <Panel>
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
        <p className="mt-1 font-mono text-2xs text-muted-foreground">
          Task #{task.id}
        </p>
      </div>

      <PanelContent>
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText size={14} aria-hidden="true" />
          Description
        </div>

        {hasDescription ? (
          <>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
              {showMore || !isLong
                ? description
                : `${description.substring(0, 100)}...`}
            </p>
            {isLong ? (
              <Button
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0"
                onClick={() => setShowMore((current) => !current)}
              >
                {showMore ? "Show Less ↑" : "Show More ↓"}
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
  );
}
