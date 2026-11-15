import { cn } from "@/shared/lib/utils";

const TONES = [
  "bg-brand-soft text-brand",
  "bg-success-soft text-success",
  "bg-warning-soft text-warning",
  "bg-info-soft text-info",
  "bg-danger-soft text-danger",
  "bg-surface-3 text-muted-foreground",
];

const SIZES = {
  xs: "size-6 text-2xs",
  sm: "size-8 text-xs",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
};

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function toneFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return TONES[hash % TONES.length];
}

export function Avatar({ name, size = "md", className, label }) {
  return (
    <span
      title={name}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size] ?? SIZES.md,
        toneFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
