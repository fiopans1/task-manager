import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-2xs font-medium leading-4",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface-2 text-muted-foreground",
        brand: "border-brand/20 bg-brand-soft text-brand",
        success: "border-success/20 bg-success-soft text-success",
        warning: "border-warning/20 bg-warning-soft text-warning",
        danger: "border-danger/20 bg-danger-soft text-danger",
        info: "border-info/20 bg-info-soft text-info",
        outline: "border-border bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export function Badge({ tone = "neutral", className, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
