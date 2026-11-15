import { PageContainer } from "@/shared/patterns/page-container";
import { cn } from "@/shared/lib/utils";

export function DetailLayout({
  header,
  stats,
  children,
  aside,
  className,
  contentClassName,
}) {
  return (
    <PageContainer className={className}>
      <div className="space-y-6">
        {header}
        {stats}
        <div
          className={cn(
            "grid gap-6",
            aside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : undefined,
          )}
        >
          <div className={cn("order-2 min-w-0 space-y-6 lg:order-1", contentClassName)}>
            {children}
          </div>
          {aside ? (
            <aside className="order-1 space-y-6 lg:order-2 lg:sticky lg:top-6 lg:self-start">
              {aside}
            </aside>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
