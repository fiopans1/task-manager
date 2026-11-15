import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(function DialogOverlay(
  { className, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]",
        "data-[state=open]:animate-[overlay-in_150ms_ease-out]",
        className,
      )}
      {...props}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef(function DialogContent(
  { className, children, showCloseButton = true, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "pointer-events-auto relative grid w-full max-w-lg gap-0",
            "max-h-[calc(100dvh-2rem)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-overlay outline-none sm:max-h-[calc(100dvh-3rem)]",
            "data-[state=open]:animate-[dialog-in_160ms_ease-out]",
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
                aria-label="Close"
              >
                <X size={16} />
              </Button>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
});

DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b border-border px-6 py-5 pr-14 text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }) {
  return (
    <div
      className={cn(
        "max-h-[calc(90dvh-10rem)] overflow-y-auto px-6 py-5",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border bg-surface-2/50 px-6 py-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef(function DialogTitle(
  { className, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-base font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
});

DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef(function DialogDescription(
  { className, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
});

DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
};
