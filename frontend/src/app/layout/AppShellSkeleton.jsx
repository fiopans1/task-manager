import { PageSkeleton } from "@/shared/patterns/page-skeleton";
import { Skeleton } from "@/shared/ui/skeleton";

export default function AppShellSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside
        className="hidden w-[268px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex"
        aria-hidden="true"
      >
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-sm" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>

          <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <PageSkeleton stats panels={2} rows={4} label="Verifying authentication" />
      </main>
    </div>
  );
}
