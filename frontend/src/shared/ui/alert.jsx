import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const TONES = {
  info: {
    icon: Info,
    className: "border-info/25 bg-info-soft text-info",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/25 bg-success-soft text-success",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/25 bg-warning-soft text-warning",
  },
  danger: {
    icon: CircleAlert,
    className: "border-danger/25 bg-danger-soft text-danger",
  },
};

export function Alert({ tone = "info", title, children, className, icon, ...props }) {
  const meta = TONES[tone] ?? TONES.info;
  const IconComponent = icon ?? meta.icon;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3",
        meta.className,
        className,
      )}
      {...props}
    >
      <IconComponent size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        {title ? <p className="text-sm font-medium">{title}</p> : null}
        {children ? <div className="text-xs leading-5 opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}
