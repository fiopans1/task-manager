import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

const CollapsibleContent = React.forwardRef(function CollapsibleContent(
  { className, ...props },
  ref,
) {
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className={cn("overflow-hidden data-[state=closed]:hidden", className)}
      {...props}
    />
  );
});

CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
