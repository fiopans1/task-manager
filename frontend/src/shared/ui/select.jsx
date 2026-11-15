import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const Select = React.forwardRef(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-9 text-base text-foreground transition-colors md:h-10 md:text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/40",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
});

Select.displayName = "Select";
