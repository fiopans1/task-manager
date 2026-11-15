import { PageContainer } from "@/shared/patterns/page-container";
import { PanelSkeleton } from "@/shared/patterns/panel-skeleton";
import { StatStripSkeleton } from "@/shared/patterns/stat-strip";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function PageSkeleton({
  stats = false,
  panels = 2,
  rows = 4,
  withActions = true,
  className,
  label = "Loading content",
}) {
  return (
    <PageContainer className={className}>
      <div role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <div aria-hidden="true" className="space-y-6">
          <header className="border-b border-border pb-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 w-full">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-8 w-64 max-w-full" />
                <Skeleton className="mt-3 h-4 w-full max-w-xl" />
              </div>
              {withActions ? (
                <div className="flex w-full gap-2 sm:w-auto">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              ) : null}
            </div>
          </header>

          {stats ? <StatStripSkeleton /> : null}

          <div className={cn("grid gap-6", panels > 1 && "lg:grid-cols-2")}>
            {Array.from({ length: panels }).map((_, index) => (
              <PanelSkeleton key={index} rows={rows} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
