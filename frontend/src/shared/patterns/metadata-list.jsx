import { cn } from "@/shared/lib/utils";

export function MetadataList({ items, className }) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((item) => {
        const IconComponent = item.icon;

        return (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <dt className="flex items-center gap-2 text-xs text-muted-foreground">
              {IconComponent ? (
                <IconComponent size={14} aria-hidden="true" />
              ) : null}
              {item.label}
            </dt>
            <dd className="min-w-0 text-right text-sm font-medium text-foreground">
              {item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
