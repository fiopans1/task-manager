import dayjs from "dayjs";
import { CalendarDays } from "@/shared/lib/icons";
import { EventCard } from "@/features/calendar/components/CalendarEvent";
import { EmptyState } from "@/shared/ui/empty-state";

function groupByDay(events) {
  const groups = new Map();

  [...events]
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .forEach((event) => {
      const key = dayjs(event.start).format("YYYY-MM-DD");
      if (!groups.has(key)) {
        groups.set(key, { day: dayjs(event.start).startOf("day"), events: [] });
      }
      groups.get(key).events.push(event);
    });

  return Array.from(groups.values());
}

export default function AgendaView({ cursor, events, onOpenEvent }) {
  const monthEvents = events.filter((event) => {
    const start = dayjs(event.start);
    return (
      start.isSame(cursor, "month") && start.isSame(cursor, "year")
    );
  });
  const groups = groupByDay(monthEvents);

  return (
    <div
      data-calendar-view="agenda"
      className="overflow-hidden rounded-md border border-border"
    >
      {groups.length > 0 ? (
        groups.map((group) => (
          <section key={group.day.format("YYYY-MM-DD")}>
            <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xs text-muted-foreground">
                  {group.day.format("ddd")}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {group.day.format("MMMM D")}
                </span>
              </div>
              <span className="text-2xs text-muted-foreground">
                {group.events.length} {group.events.length === 1 ? "event" : "events"}
              </span>
            </header>
            <div className="divide-y divide-border">
              {group.events.map((event) => (
                <div key={event.id} className="px-4 py-3">
                  <EventCard event={event} onOpen={onOpenEvent} />
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No events this month"
          description="Create a task with a date to see it here."
        />
      )}
    </div>
  );
}
