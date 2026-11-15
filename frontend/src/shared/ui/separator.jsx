import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

const Separator = React.forwardRef(function Separator(
  { className, orientation = "horizontal", decorative = true, ...props },
  ref,
) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
});

Separator.displayName = "Separator";

export { Separator };
