import dayjs from "dayjs";
import { WeekEvent } from "@/features/calendar/components/CalendarEvent";
import {
  eventsForDay,
  isSameDay,
  startOfWeek,
} from "@/features/calendar/calendarMeta";
import { cn } from "@/shared/lib/utils";

export default function WeekView({ cursor, events, onOpenEvent }) {
  const weekStart = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, index) => weekStart.add(index, "day"));

  return (
    <div data-calendar-view="week" className="grid gap-3 md:grid-cols-7">
      {days.map((day) => {
        const dayEvents = eventsForDay(events, day);
        const isToday = isSameDay(day, dayjs());

        return (
          <section
            key={day.format("YYYY-MM-DD")}
            className="min-w-0 overflow-hidden rounded-md border border-border bg-card"
          >
            <header
              className={cn(
                "border-b border-border px-3 py-2",
                isToday && "bg-brand-soft/40",
              )}
            >
              <p className="font-mono text-2xs text-muted-foreground">
                {day.format("ddd")}
              </p>
              <p
                className={cn(
                  "text-lg font-semibold tracking-tight",
                  isToday ? "text-brand" : "text-foreground",
                )}
              >
                {day.format("D")}
              </p>
            </header>
            <div className="space-y-1.5 p-2">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                  <WeekEvent key={event.id} event={event} onOpen={onOpenEvent} />
                ))
              ) : (
                <p className="px-1 py-2 text-2xs text-muted-foreground">No events</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
