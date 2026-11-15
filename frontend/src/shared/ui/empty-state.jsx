import { cn } from "@/shared/lib/utils";

export function EmptyState({ icon: IconComponent, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      {IconComponent ? (
        <span className="mb-4 flex size-12 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground">
          <IconComponent size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
      ) : null}
      {title ? (
        <p className="text-sm font-semibold text-foreground">{title}</p>
      ) : null}
      {description ? (
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
