import * as React from "react";
import { cn } from "@/shared/lib/utils";

export const Checkbox = React.forwardRef(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer rounded-xs border border-input accent-brand",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";
