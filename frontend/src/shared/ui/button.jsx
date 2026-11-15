import * as React from "react";
import { Slot } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md font-medium transition-colors outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:not-aria-[haspopup]:translate-y-px",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-accent",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent",
        ghost:
          "bg-transparent text-foreground hover:bg-accent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        soft:
          "bg-brand-soft text-brand hover:bg-brand-soft/80",
        link:
          "text-brand underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-sm px-2 text-2xs",
        sm: "h-8 gap-1.5 rounded-sm px-3 text-xs",
        default: "h-9 px-3.5 text-sm",
        lg: "h-10 px-4 text-sm",
        icon: "size-9",
        "icon-sm": "size-8 rounded-sm",
        "icon-xs": "size-7 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
