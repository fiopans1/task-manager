import { LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function Spinner({ size = 16, className, label = "Loading" }) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)}>
      <LoaderCircle
        size={size}
        className="animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
