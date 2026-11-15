import * as React from "react";
import { cn } from "@/shared/lib/utils";

export const Textarea = React.forwardRef(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-base text-foreground transition-colors md:text-sm",
        "placeholder:text-ink-faint",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/40",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
