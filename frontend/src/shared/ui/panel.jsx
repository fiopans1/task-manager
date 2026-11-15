import { cn } from "@/shared/lib/utils";

export function Panel({ className, ...props }) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card", className)}
      {...props}
    />
  );
}

export function PanelHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

export function PanelTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-sm font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function PanelDescription({ className, ...props }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
}

export function PanelContent({ className, ...props }) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function PanelFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}
