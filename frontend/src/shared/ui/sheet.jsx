import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetContent = React.forwardRef(function SheetContent(
  { className, children, showCloseButton = true, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]",
          "data-[state=open]:animate-[overlay-in_150ms_ease-out]",
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col border-r border-border bg-sidebar p-0 text-sidebar-foreground shadow-overlay outline-none",
          "data-[state=open]:animate-[sheet-in_200ms_ease-out]",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X size={16} />
            </Button>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

SheetContent.displayName = "SheetContent";

function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-border px-4 pr-14",
        className,
      )}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef(function SheetTitle(
  { className, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-sm font-semibold text-foreground", className)}
      {...props}
    />
  );
});

SheetTitle.displayName = "SheetTitle";

const SheetDescription = DialogPrimitive.Description;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
