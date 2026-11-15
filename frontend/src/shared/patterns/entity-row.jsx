import { cn } from "@/shared/lib/utils";

/**
 * Shared row shell for all collection types (tasks, lists, teams).
 *
 * It is presentational: the feature supplies the leading visual, title,
 * badges, description, metadata and actions. Keeping one shell is what makes
 * the three collections feel like the same workspace.
 */
export function EntityRow({
  leading,
  title,
  badges,
  description,
  meta,
  actions,
  className,
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={cn(
        "group flex flex-col gap-2 border-b border-border px-3 py-3 text-left transition-colors last:border-0 hover:bg-surface-2/50 sm:flex-row sm:items-start sm:gap-3 sm:px-4 sm:py-4",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {leading ? <div className="shrink-0 pt-0.5">{leading}</div> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 text-sm font-medium text-foreground">
              {title}
            </div>
            {badges}
          </div>
          {description ? (
            <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {description}
            </div>
          ) : null}
          {meta ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {meta}
            </div>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {actions}
        </div>
      ) : null}
    </Component>
  );
}
