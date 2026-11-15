import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(function TooltipContent(
  { className, sideOffset = 6, ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-sm bg-foreground px-2 py-1 text-2xs font-medium text-background shadow-overlay",
          "data-[state=delayed-open]:animate-[tooltip-in_100ms_ease-out]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});

TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
