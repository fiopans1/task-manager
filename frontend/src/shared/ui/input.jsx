import * as React from "react";
import { cn } from "@/shared/lib/utils";

export const Input = React.forwardRef(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-sm border border-input bg-background px-3 py-2 text-base text-foreground shadow-none transition-colors md:h-10 md:text-sm",
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

Input.displayName = "Input";
