import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { RefreshCw } from "@/shared/lib/icons";
import { PageContainer } from "@/shared/patterns/page-container";
import { PageHeader } from "@/shared/patterns/page-header";
import { Button } from "@/shared/ui/button";
import { Alert } from "@/shared/ui/alert";
import { Skeleton } from "@/shared/ui/skeleton";
import { useCalendarEvents } from "@/features/calendar/hooks/useCalendarEvents";
import CalendarToolbar from "@/features/calendar/components/CalendarToolbar";
import MonthView from "@/features/calendar/components/MonthView";
import WeekView from "@/features/calendar/components/WeekView";
import DayView from "@/features/calendar/components/DayView";
import AgendaView from "@/features/calendar/components/AgendaView";
import { startOfWeek } from "@/features/calendar/calendarMeta";

const VIEW_LABELS = {
  month: "Monthly view",
  week: "Weekly view",
  day: "Daily view",
  agenda: "Agenda",
};

function CalendarSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-sm md:h-24" />
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { events, loading, error, reload } = useCalendarEvents();
  const navigate = useNavigate();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => dayjs());
  const [selectedDay, setSelectedDay] = useState(() => dayjs());

  const label = useMemo(() => {
    if (view === "month" || view === "agenda") {
      return cursor.format("MMMM YYYY");
    }
    if (view === "week") {
      const start = startOfWeek(cursor);
      const end = start.add(6, "day");
      return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
    }
    return cursor.format("dddd, MMMM D, YYYY");
  }, [view, cursor]);

  const handleView = (nextView) => {
    setView(nextView);
    setSelectedDay(cursor);
  };

  const navigateBy = (direction) => {
    if (view === "month" || view === "agenda") {
      const next = cursor.add(direction, "month");
      setCursor(next);
      setSelectedDay(next.startOf("month"));
      return;
    }

    if (view === "week") {
      const next = cursor.add(direction * 7, "day");
      setCursor(next);
      setSelectedDay(next);
      return;
    }

    const next = cursor.add(direction, "day");
    setCursor(next);
    setSelectedDay(next);
  };

  const goToday = () => {
    const now = dayjs();
    setCursor(now);
    setSelectedDay(now);
  };

  const openEvent = (event) => navigate(`/home/tasks/${event.id}`);

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageHeader
          meta="Planning / Calendar"
          title="Calendar"
          description="Time blocks and deadlines in one readable surface."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={reload}
                aria-label="Refresh calendar"
                title="Refresh calendar"
              >
                <RefreshCw size={15} aria-hidden="true" />
              </Button>
            </div>
          }
        />

        <section
          data-testid="calendar"
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="border-b border-border p-3 sm:p-4">
            <CalendarToolbar
              view={view}
              label={label}
              viewLabel={VIEW_LABELS[view]}
              onView={handleView}
              onPrev={() => navigateBy(-1)}
              onToday={goToday}
              onNext={() => navigateBy(1)}
            />
          </div>

          <div className="p-2 sm:p-4">
            {loading ? (
              <CalendarSkeleton />
            ) : error ? (
              <Alert tone="danger" title="Could not load the calendar">
                {error}
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={reload}>
                    Try Again
                  </Button>
                </div>
              </Alert>
            ) : view === "month" ? (
              <MonthView
                cursor={cursor}
                events={events}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                onOpenEvent={openEvent}
              />
            ) : view === "week" ? (
              <WeekView cursor={cursor} events={events} onOpenEvent={openEvent} />
            ) : view === "day" ? (
              <DayView cursor={cursor} events={events} onOpenEvent={openEvent} />
            ) : (
              <AgendaView cursor={cursor} events={events} onOpenEvent={openEvent} />
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
