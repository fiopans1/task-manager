import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 w-full items-center gap-1 overflow-x-auto border-b border-border",
        className,
      )}
      {...props}
    />
  );
});

TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(function TabsTrigger(
  { className, ...props },
  ref,
) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors",
        "hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-[state=active]:border-brand data-[state=active]:text-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(function TabsContent(
  { className, ...props },
  ref,
) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  );
});

TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
