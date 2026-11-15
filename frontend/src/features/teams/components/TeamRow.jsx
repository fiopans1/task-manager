import { Eye, Pencil, Trash2, Users } from "@/shared/lib/icons";
import { EntityRow } from "@/shared/patterns/entity-row";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function TeamRow({ team, onOpen, onEdit, onDelete }) {
  return (
    <EntityRow
      data-testid="item-card"
      data-team-id={team.id}
      leading={
        <span className="flex size-9 items-center justify-center rounded-sm border border-border bg-surface-2 text-brand">
          <Users size={17} aria-hidden="true" />
        </span>
      }
      title={
        <button
          type="button"
          onClick={() => onOpen(team.id)}
          className="text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="line-clamp-1">{team.name}</span>
        </button>
      }
      badges={
        <Badge tone="neutral">
          {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
        </Badge>
      }
      description={team.description || "No description"}
      meta={<span className="font-mono text-2xs">Team #{team.id}</span>}
      actions={
        <>
          <Button
            variant="soft"
            size="sm"
            onClick={() => onOpen(team.id)}
            aria-label="Open"
          >
            <Eye size={14} aria-hidden="true" />
            Open
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(team)}
            aria-label="Edit"
            title="Edit"
          >
            <Pencil size={15} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(team)}
            aria-label="Delete"
            title="Delete"
            className="text-muted-foreground hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 size={15} aria-hidden="true" />
          </Button>
        </>
      }
    />
  );
}
