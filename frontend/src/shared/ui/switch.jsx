import * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * Native checkbox styled as a switch.
 *
 * Keeping the underlying input as a checkbox preserves form semantics, works
 * with keyboard users and keeps the existing `input#id` hooks used by the E2E
 * suite.
 */
export const Switch = React.forwardRef(function Switch(
  { className, label, description, id, ...props },
  ref,
) {
  const control = (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none block h-5 w-9 rounded-full bg-surface-3 transition-colors",
          "peer-checked:bg-brand",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          "peer-disabled:opacity-50",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0.5 top-0.5 block size-4 rounded-full bg-white shadow-sm transition-transform",
          "peer-checked:translate-x-4",
        )}
      />
    </span>
  );

  if (!label && !description) {
    return control;
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4"
    >
      <span className="min-w-0">
        {label ? (
          <span className="block text-sm font-medium text-foreground">{label}</span>
        ) : null}
        {description ? (
          <span className="block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      {control}
    </label>
  );
});

Switch.displayName = "Switch";
