import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuContent = React.forwardRef(function DropdownMenuContent(
  { className, sideOffset = 8, align = "end", ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={8}
        className={cn(
          "z-50 min-w-[220px] overflow-hidden rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-overlay",
          "data-[state=open]:animate-[dropdown-in_120ms_ease-out]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(function DropdownMenuItem(
  { className, destructive = false, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex h-9 cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 text-sm outline-none transition-colors",
        "focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        destructive && "text-danger focus:bg-danger-soft focus:text-danger",
        className,
      )}
      {...props}
    />
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

function DropdownMenuLabel({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-2.5 py-1.5 text-2xs font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1.5 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
