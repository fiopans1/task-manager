import dayjs from "dayjs";
import { CalendarDays } from "@/shared/lib/icons";
import { EventCard, EventChip } from "@/features/calendar/components/CalendarEvent";
import {
  categoryMeta,
  eventsForDay,
  isSameDay,
  startOfWeek,
} from "@/features/calendar/calendarMeta";
import { cn } from "@/shared/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildWeeks(cursor) {
  const gridStart = startOfWeek(cursor.startOf("month"));
  const lastWeekStart = startOfWeek(cursor.endOf("month"));
  const totalDays = lastWeekStart.diff(gridStart, "day") + 7;
  const days = Array.from({ length: totalDays }, (_, index) =>
    gridStart.add(index, "day"),
  );

  return Array.from({ length: days.length / 7 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );
}

export default function MonthView({
  cursor,
  events,
  selectedDay,
  onSelectDay,
  onOpenEvent,
}) {
  const weeks = buildWeeks(cursor);
  const activeDay = selectedDay ?? dayjs();
  const selectedEvents = eventsForDay(events, activeDay);

  return (
    <div
      data-calendar-view="month"
      className="overflow-hidden rounded-md border border-border"
    >
      <div className="grid grid-cols-7 border-b border-border bg-surface-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="border-r border-border px-1 py-2 text-center font-mono text-2xs text-muted-foreground last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div>
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 border-b border-border last:border-b-0"
          >
            {week.map((day) => {
              const dayEvents = eventsForDay(events, day);
              const isCurrentMonth = day.month() === cursor.month();
              const isToday = isSameDay(day, dayjs());
              const isSelected = isSameDay(day, activeDay);

              return (
                <div
                  key={day.format("YYYY-MM-DD")}
                  className={cn(
                    "min-h-14 border-r border-border p-1.5 last:border-r-0 md:min-h-[104px]",
                    !isCurrentMonth && "bg-surface-2/30",
                    isSelected && "bg-brand-soft/25",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectDay(day)}
                      aria-label={day.format("dddd, MMMM D")}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full font-mono text-2xs transition-colors",
                        isToday
                          ? "bg-brand text-white"
                          : isSelected
                            ? "bg-brand-soft text-brand"
                            : isCurrentMonth
                              ? "text-foreground hover:bg-accent"
                              : "text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {day.format("D")}
                    </button>
                    <div className="flex gap-0.5 md:hidden">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={cn(
                            "size-1.5 rounded-full",
                            categoryMeta(event.category).dot,
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  {dayEvents.length > 0 ? (
                    <span className="sr-only">
                      {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}:{" "}
                      {dayEvents.map((event) => event.title).join(", ")}
                    </span>
                  ) : null}

                  <div className="mt-1 hidden space-y-1 md:block">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventChip key={event.id} event={event} onOpen={onOpenEvent} />
                    ))}
                    {dayEvents.length > 3 ? (
                      <p className="px-1 text-2xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3 md:hidden">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-mono text-2xs text-muted-foreground">
            {activeDay.format("ddd, MMM D")}
          </p>
          <span className="text-2xs text-muted-foreground">
            {selectedEvents.length} events
          </span>
        </div>
        {selectedEvents.length > 0 ? (
          <div className="space-y-2">
            {selectedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onOpen={onOpenEvent}
                testId="calendar-event-mobile"
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays size={14} aria-hidden="true" />
            No events for this day.
          </div>
        )}
      </div>
    </div>
  );
}
