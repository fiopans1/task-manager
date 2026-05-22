const DAY_IN_MS = 24 * 60 * 60 * 1000

const startOfDay = (date) => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

const endOfDay = (date) => {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

export const EVENT_TIMING = {
  ONGOING: "ongoing",
  TODAY: "today",
  UPCOMING: "upcoming",
  PAST: "past",
}

export const CALENDAR_FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "Next 7 days" },
  { key: "month", label: "Next 30 days" },
  { key: "past", label: "Past due" },
]

export const CALENDAR_TIMING_META = {
  [EVENT_TIMING.ONGOING]: { label: "Ongoing", color: "#0d6efd" },
  [EVENT_TIMING.TODAY]: { label: "Today", color: "#198754" },
  [EVENT_TIMING.UPCOMING]: { label: "Upcoming", color: "#6f42c1" },
  [EVENT_TIMING.PAST]: { label: "Past due", color: "#dc3545" },
}

export const getEventTiming = (event, now = new Date()) => {
  const start = new Date(event.start)
  const end = new Date(event.end)

  if (end < now) {
    return EVENT_TIMING.PAST
  }

  if (start <= now && end >= now) {
    return EVENT_TIMING.ONGOING
  }

  if (startOfDay(start).getTime() === startOfDay(now).getTime()) {
    return EVENT_TIMING.TODAY
  }

  return EVENT_TIMING.UPCOMING
}

export const matchesCalendarFilter = (event, filterKey, now = new Date()) => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const dayStart = startOfDay(now)
  const dayEnd = endOfDay(now)
  const weekEnd = new Date(dayEnd.getTime() + 6 * DAY_IN_MS)
  const monthEnd = new Date(dayEnd.getTime() + 29 * DAY_IN_MS)

  switch (filterKey) {
    case "today":
      return end >= dayStart && start <= dayEnd
    case "week":
      return end >= dayStart && start <= weekEnd
    case "month":
      return end >= dayStart && start <= monthEnd
    case "past":
      return getEventTiming(event, now) === EVENT_TIMING.PAST
    case "all":
    default:
      return true
  }
}

export const formatEventDateRange = (event, locale = "en-US") => {
  const start = new Date(event.start)
  const end = new Date(event.end)

  const sameDay = startOfDay(start).getTime() === startOfDay(end).getTime()

  if (sameDay) {
    return `${start.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    })} · ${start.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  return `${start.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })} → ${end.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

export const buildCalendarEvent = (event, now = new Date()) => {
  const normalizedEvent = {
    ...event,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    title: event.nameOfTask,
  }

  return {
    ...normalizedEvent,
    timing: getEventTiming(normalizedEvent, now),
  }
}
