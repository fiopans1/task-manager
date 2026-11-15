import { CalendarDays } from "@/shared/lib/icons";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/shared/ui/panel";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { EntityRow } from "@/shared/patterns/entity-row";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function UpcomingEventsPanel({ events = [], loading, error, onOpen }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Upcoming events</PanelTitle>
        <span className="font-mono text-2xs text-muted-foreground">
          {events.length} scheduled
        </span>
      </PanelHeader>
      <PanelContent className="p-0">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={CalendarDays}
            title="Could not load events"
            description="Refresh the page to try again."
          />
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            description="Events with a date will appear here."
          />
        ) : (
          events.map((event) => (
            <EntityRow
              key={event.id}
              as="button"
              type="button"
              onClick={() => onOpen?.(event.id)}
              title={event.nameOfTask}
              className="w-full px-4"
              meta={
                <span className="font-mono text-2xs">
                  {formatDateTime(event.startTime)}
                  {event.endTime ? ` — ${formatDateTime(event.endTime)}` : ""}
                </span>
              }
            />
          ))
        )}
      </PanelContent>
    </Panel>
  );
}
