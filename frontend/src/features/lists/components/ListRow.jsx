import { Eye, ListChecks, Pencil, Trash2 } from "@/shared/lib/icons";
import { EntityRow } from "@/shared/patterns/entity-row";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";

export function ListRow({ list, onOpen, onEdit, onDelete }) {
  const total = list.totalElements ?? 0;
  const completed = list.completedElements ?? 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const color = list.color || "var(--brand)";

  return (
    <EntityRow
      data-testid="item-card"
      data-list-id={list.id}
      leading={
        <span
          className="flex size-9 items-center justify-center rounded-sm border"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            color,
          }}
        >
          <ListChecks size={17} aria-hidden="true" />
        </span>
      }
      title={
        <button
          type="button"
          onClick={() => onOpen(list.id)}
          className="text-left transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="line-clamp-1">{list.nameOfList}</span>
        </button>
      }
      badges={
        <Badge tone="neutral">
          {completed}/{total} done
        </Badge>
      }
      description={list.descriptionOfList || "No description"}
      meta={
        <div className="flex min-w-[160px] max-w-xs flex-1 items-center gap-2">
          <Progress value={progress} tone={progress === 100 ? "success" : "brand"} label={`${list.nameOfList} progress`} className="max-w-40" />
          <span className="font-mono text-2xs tabular-nums">{progress}%</span>
        </div>
      }
      actions={
        <>
          <Button
            variant="soft"
            size="sm"
            onClick={() => onOpen(list.id)}
            aria-label="Open"
          >
            <Eye size={14} aria-hidden="true" />
            Open
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(list)}
            aria-label="Edit"
            title="Edit"
          >
            <Pencil size={15} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(list)}
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
