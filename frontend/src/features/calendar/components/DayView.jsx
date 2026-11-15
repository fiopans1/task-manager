import { CalendarDays } from "@/shared/lib/icons";
import { EventCard } from "@/features/calendar/components/CalendarEvent";
import { eventsForDay, formatTime } from "@/features/calendar/calendarMeta";
import { EmptyState } from "@/shared/ui/empty-state";

export default function DayView({ cursor, events, onOpenEvent }) {
  const dayEvents = eventsForDay(events, cursor);

  return (
    <div
      data-calendar-view="day"
      className="overflow-hidden rounded-md border border-border"
    >
      <header className="border-b border-border bg-surface-2 px-4 py-3">
        <p className="font-mono text-2xs text-muted-foreground">
          {cursor.format("dddd")}
        </p>
        <p className="text-lg font-semibold tracking-tight text-foreground">
          {cursor.format("MMMM D, YYYY")}
        </p>
        <p className="mt-0.5 text-2xs text-muted-foreground">
          {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
        </p>
      </header>

      {dayEvents.length > 0 ? (
        <div className="divide-y divide-border">
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className="grid gap-3 px-4 py-3 sm:grid-cols-[72px_1fr] sm:items-start"
            >
              <div className="font-mono text-2xs tabular-nums text-muted-foreground">
                <p>{formatTime(event.start)}</p>
                <p>{formatTime(event.end)}</p>
              </div>
              <EventCard event={event} onOpen={onOpenEvent} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No events for this day"
          description="Time blocks created as events will appear here."
        />
      )}
    </div>
  );
}
