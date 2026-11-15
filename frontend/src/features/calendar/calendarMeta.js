import dayjs from "dayjs";

export const CATEGORY_META = {
  work: {
    label: "Work",
    dot: "bg-brand",
    chip: "bg-brand-soft text-brand",
    border: "border-brand",
  },
  personal: {
    label: "Personal",
    dot: "bg-info",
    chip: "bg-info-soft text-info",
    border: "border-info",
  },
  urgent: {
    label: "Urgent",
    dot: "bg-warning",
    chip: "bg-warning-soft text-warning",
    border: "border-warning",
  },
  default: {
    label: "General",
    dot: "bg-muted-foreground",
    chip: "bg-surface-3 text-muted-foreground",
    border: "border-muted-foreground",
  },
};

export function categoryMeta(category) {
  return CATEGORY_META[category] ?? CATEGORY_META.default;
}

export function formatTime(value) {
  return dayjs(value).format("HH:mm");
}

export function startOfWeek(value) {
  const day = dayjs(value).startOf("day");
  return day.subtract((day.day() + 6) % 7, "day");
}

export function eventsForDay(events, day) {
  return events
    .filter((event) => dayjs(event.start).isSame(day, "day"))
    .sort((a, b) => new Date(a.start) - new Date(b.start));
}

export function isSameDay(a, b) {
  return dayjs(a).isSame(dayjs(b), "day");
}
