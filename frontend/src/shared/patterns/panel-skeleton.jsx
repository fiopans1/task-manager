import { Panel, PanelContent, PanelHeader } from "@/shared/ui/panel";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function ListRowsSkeleton({ rows = 4, className }) {
  return (
    <div className={cn("divide-y divide-border", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-9 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ rows = 4, className, bodyClassName }) {
  return (
    <Panel className={className} aria-busy="true">
      <PanelHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-10" />
      </PanelHeader>
      <PanelContent className={cn("p-0", bodyClassName)}>
        <ListRowsSkeleton rows={rows} />
      </PanelContent>
    </Panel>
  );
}
