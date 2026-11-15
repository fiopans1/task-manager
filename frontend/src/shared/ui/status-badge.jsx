import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

export const STATE_META = {
  NEW: { label: "New", tone: "info" },
  IN_PROGRESS: { label: "In progress", tone: "brand" },
  COMPLETED: { label: "Completed", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  PAUSSED: { label: "Paused", tone: "warning" },
  PAUSED: { label: "Paused", tone: "warning" },
};

export const PRIORITY_META = {
  MIN: { label: "Minimal", tone: "neutral" },
  LOW: { label: "Low", tone: "info" },
  MEDIUM: { label: "Medium", tone: "brand" },
  HIGH: { label: "High", tone: "warning" },
  CRITICAL: { label: "Critical", tone: "danger" },
  "<NONE>": { label: "No priority", tone: "neutral" },
};

function normalize(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function StatusBadge({ status, className }) {
  const key = normalize(status);
  const meta = STATE_META[key] ?? { label: status || "Unknown", tone: "neutral" };

  return (
    <Badge tone={meta.tone} className={cn("gap-1.5", className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }) {
  const key = normalize(priority);
  const meta = PRIORITY_META[key] ?? {
    label: priority || "No priority",
    tone: "neutral",
  };

  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}
