import { ChevronLeft, ChevronRight } from "@/shared/lib/icons";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const VIEWS = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
  { key: "agenda", label: "Schedule" },
];

export default function CalendarToolbar({
  view,
  label,
  viewLabel,
  onView,
  onPrev,
  onToday,
  onNext,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onPrev}
          aria-label="Prev"
          title="Prev"
        >
          <ChevronLeft size={15} />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onNext}
          aria-label="Next"
          title="Next"
        >
          <ChevronRight size={15} />
        </Button>
      </div>

      <div className="text-center lg:order-none">
        <p className="font-mono text-2xs text-muted-foreground">{viewLabel}</p>
        <p
          data-testid="calendar-label"
          className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          {label}
        </p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-sm border border-border bg-surface-2 p-1">
        {VIEWS.map((item) => (
          <Button
            key={item.key}
            type="button"
            variant={view === item.key ? "default" : "ghost"}
            size="sm"
            onClick={() => onView(item.key)}
            className={cn("shrink-0")}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
