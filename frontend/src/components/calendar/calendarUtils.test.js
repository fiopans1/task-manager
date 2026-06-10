import { describe, expect, it } from "vitest"
import {
  EVENT_TIMING,
  buildCalendarEvent,
  formatEventDateRange,
  getEventTiming,
  matchesCalendarFilter,
} from "./calendarUtils"

describe("calendarUtils", () => {
  const now = new Date("2026-05-22T12:00:00.000Z")

  it("classifies past, ongoing, today and upcoming events", () => {
    expect(
      getEventTiming(
        { start: "2026-05-21T08:00:00.000Z", end: "2026-05-21T09:00:00.000Z" },
        now
      )
    ).toBe(EVENT_TIMING.PAST)

    expect(
      getEventTiming(
        { start: "2026-05-22T11:00:00.000Z", end: "2026-05-22T13:00:00.000Z" },
        now
      )
    ).toBe(EVENT_TIMING.ONGOING)

    expect(
      getEventTiming(
        { start: "2026-05-22T16:00:00.000Z", end: "2026-05-22T17:00:00.000Z" },
        now
      )
    ).toBe(EVENT_TIMING.TODAY)

    expect(
      getEventTiming(
        { start: "2026-05-25T09:00:00.000Z", end: "2026-05-25T10:00:00.000Z" },
        now
      )
    ).toBe(EVENT_TIMING.UPCOMING)
  })

  it("matches quick filters consistently", () => {
    const todayEvent = {
      start: "2026-05-22T16:00:00.000Z",
      end: "2026-05-22T17:00:00.000Z",
    }
    const nextWeekEvent = {
      start: "2026-05-27T16:00:00.000Z",
      end: "2026-05-27T17:00:00.000Z",
    }
    const nextMonthEvent = {
      start: "2026-06-10T16:00:00.000Z",
      end: "2026-06-10T17:00:00.000Z",
    }

    expect(matchesCalendarFilter(todayEvent, "today", now)).toBe(true)
    expect(matchesCalendarFilter(nextWeekEvent, "week", now)).toBe(true)
    expect(matchesCalendarFilter(nextMonthEvent, "week", now)).toBe(false)
    expect(matchesCalendarFilter(nextMonthEvent, "month", now)).toBe(true)
    expect(
      matchesCalendarFilter(
        { start: "2026-05-20T16:00:00.000Z", end: "2026-05-20T17:00:00.000Z" },
        "past",
        now
      )
    ).toBe(true)
  })

  it("builds normalized calendar events and formats their range", () => {
    const event = buildCalendarEvent(
      {
        id: 3,
        taskId: 9,
        nameOfTask: "Review roadmap",
        startTime: "2026-05-22T16:00:00.000Z",
        endTime: "2026-05-22T17:30:00.000Z",
      },
      now
    )

    expect(event.title).toBe("Review roadmap")
    expect(event.taskId).toBe(9)
    expect(event.start).toBeInstanceOf(Date)
    expect(event.timing).toBe(EVENT_TIMING.TODAY)
    expect(formatEventDateRange(event)).toContain("May")
  })
})
