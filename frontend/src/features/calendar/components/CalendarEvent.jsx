import { ArrowRight } from "@/shared/lib/icons";
import { cn } from "@/shared/lib/utils";
import { categoryMeta, formatTime } from "@/features/calendar/calendarMeta";

export function CategoryDot({ category, className }) {
  const meta = categoryMeta(category);
  return (
    <span
      aria-hidden="true"
      className={cn("size-1.5 shrink-0 rounded-full", meta.dot, className)}
    />
  );
}

export function EventChip({ event, onOpen }) {
  const meta = categoryMeta(event.category);

  return (
    <button
      type="button"
      data-testid="calendar-event"
      onClick={() => onOpen(event)}
      title={`${event.title} · ${formatTime(event.start)}`}
      className={cn(
        "flex w-full items-center gap-1 rounded-sm px-1.5 py-1 text-left text-2xs transition-opacity hover:opacity-80",
        meta.chip,
      )}
    >
      <CategoryDot category={event.category} />
      <span className="font-mono tabular-nums">{formatTime(event.start)}</span>
      <span className="truncate">{event.title}</span>
    </button>
  );
}

export function EventCard({ event, onOpen, className, testId = "calendar-event" }) {
  const meta = categoryMeta(event.category);

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={() => onOpen(event)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("mt-0.5 h-8 w-0.5 shrink-0 rounded-full", meta.dot)}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
          <span className={cn("rounded-sm px-1.5 py-0.5 text-2xs font-medium", meta.chip)}>
            {meta.label}
          </span>
        </div>
        <p className="mt-1 font-mono text-2xs tabular-nums text-muted-foreground">
          {formatTime(event.start)} – {formatTime(event.end)}
        </p>
      </div>
      <ArrowRight
        size={14}
        className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
}

export function WeekEvent({ event, onOpen }) {
  return (
    <button
      type="button"
      data-testid="calendar-event"
      onClick={() => onOpen(event)}
      className="w-full rounded-sm border border-border bg-surface-2 px-2 py-1.5 text-left transition-colors hover:bg-accent"
    >
      <span className="flex items-center gap-1 font-mono text-2xs tabular-nums text-muted-foreground">
        <CategoryDot category={event.category} />
        {formatTime(event.start)}
      </span>
      <span className="block truncate text-xs font-medium text-foreground">
        {event.title}
      </span>
    </button>
  );
}
