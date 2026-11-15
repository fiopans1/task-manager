import { FileText, Users } from "@/shared/lib/icons";
import { Panel, PanelContent } from "@/shared/ui/panel";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Button } from "@/shared/ui/button";

export function TeamSummaryPanel({
  team,
  memberCount,
  isAdmin,
  totalTasks,
  completionPercent,
  showMore,
  onToggleShowMore,
}) {
  const description = team.description;
  const isLongDescription = description && description.length >= 100;

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            data-testid="team-title"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            {team.name}
          </h2>
          <Badge tone="neutral">
            <Users size={12} aria-hidden="true" />
            {memberCount} {memberCount === 1 ? "Member" : "Members"}
          </Badge>
          <Badge tone={isAdmin ? "warning" : "neutral"}>
            {isAdmin ? "Admin" : "Member"}
          </Badge>
          <Badge tone="brand">{totalTasks} tasks</Badge>
        </div>
        <p className="mt-1 font-mono text-2xs text-muted-foreground">
          Team #{team.id}
          {team.createdDate
            ? ` · created ${new Date(team.createdDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}`
            : ""}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <Progress
            value={completionPercent}
            tone={completionPercent === 100 ? "success" : "brand"}
            label="Team progress"
            className="flex-1"
          />
          <span className="font-mono text-2xs tabular-nums text-muted-foreground">
            {completionPercent}%
          </span>
        </div>
      </div>

      <PanelContent>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText size={14} aria-hidden="true" />
          Description
        </div>
        {description ? (
          <>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
              {showMore || !isLongDescription
                ? description
                : `${description.substring(0, 100)}...`}
            </p>
            {isLongDescription ? (
              <Button
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0"
                onClick={onToggleShowMore}
              >
                {showMore ? "Show Less ↑" : "Show More ↓"}
              </Button>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No description available.</p>
        )}
      </PanelContent>
    </Panel>
  );
}
