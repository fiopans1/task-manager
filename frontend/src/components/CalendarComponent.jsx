import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Badge, Button, Card, Container, Spinner } from "react-bootstrap"
import { Calendar, dayjsLocalizer } from "react-big-calendar"
import dayjs from "dayjs"
import "react-big-calendar/lib/css/react-big-calendar.css"
import taskService from "../services/taskService"
import { errorToast } from "./common/Noty"
import {
  buildCalendarEvent,
  CALENDAR_FILTERS,
  CALENDAR_TIMING_META,
  EVENT_TIMING,
  formatEventDateRange,
  matchesCalendarFilter,
} from "./calendar/calendarUtils"

const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs)
  const navigate = useNavigate()
  const [rawEvents, setRawEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    let isMounted = true

    const fetchEvents = async () => {
      try {
        setLoading(true)
        const data = await taskService.getEvents()
        if (isMounted) {
          setRawEvents(data)
        }
      } catch (error) {
        if (isMounted) {
          errorToast("Error loading events: " + error.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchEvents()

    return () => {
      isMounted = false
    }
  }, [])

  const events = useMemo(() => {
    const now = new Date()
    return rawEvents.map((event) => buildCalendarEvent(event, now))
  }, [rawEvents])

  const filteredEvents = useMemo(() => {
    const now = new Date()
    return events.filter((event) => matchesCalendarFilter(event, activeFilter, now))
  }, [events, activeFilter])

  const timelineCounts = useMemo(() => {
    return events.reduce(
      (accumulator, event) => {
        accumulator[event.timing] = (accumulator[event.timing] || 0) + 1
        return accumulator
      },
      {
        [EVENT_TIMING.ONGOING]: 0,
        [EVENT_TIMING.TODAY]: 0,
        [EVENT_TIMING.UPCOMING]: 0,
        [EVENT_TIMING.PAST]: 0,
      }
    )
  }, [events])

  const nextEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((event) => event.end >= now)
      .sort((left, right) => left.start - right.start)
      .slice(0, 6)
  }, [events])

  const eventPropGetter = (event) => {
    const timingStyle = CALENDAR_TIMING_META[event.timing] || CALENDAR_TIMING_META[EVENT_TIMING.UPCOMING]
    return {
      style: {
        backgroundColor: timingStyle.color,
        color: "#fff",
        border: "none",
        borderRadius: "0.85rem",
        paddingInline: "0.35rem",
      },
    }
  }

  const CustomToolbar = (props) => (
    <div className="rbc-toolbar gap-3">
      <div className="rbc-btn-group d-flex flex-wrap">
        <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => props.onNavigate("PREV")}>
          Prev
        </Button>
        <Button variant="dark" size="sm" className="me-2" onClick={() => props.onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={() => props.onNavigate("NEXT")}>
          Next
        </Button>
      </div>
      <span className="rbc-toolbar-label">{props.label}</span>
      <div className="rbc-btn-group d-flex flex-wrap">
        {[
          { key: "month", label: "Month" },
          { key: "week", label: "Week" },
          { key: "day", label: "Day" },
          { key: "agenda", label: "Schedule" },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={props.view === key ? "primary" : "outline-secondary"}
            size="sm"
            className="me-2 mb-2 mb-sm-0 text-capitalize"
            onClick={() => props.onView(key)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )

  const formats = {
    dayFormat: (date, culture, localizerInstance) => localizerInstance.format(date, "ddd D", culture),
    dayHeaderFormat: (date, culture, localizerInstance) => localizerInstance.format(date, "dddd, MMMM D", culture),
    dayRangeHeaderFormat: ({ start, end }, culture, localizerInstance) =>
      `${localizerInstance.format(start, "MMMM D", culture)} - ${localizerInstance.format(end, "MMMM D", culture)}`,
  }

  return (
    <Container fluid className="px-3 px-lg-4 py-4 pb-5">
      <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3 mb-4">
        <div>
          <h2 className="fw-semibold mb-1">Calendar</h2>
          <p className="text-body-secondary mb-0">
            Follow your scheduled work, detect overdue items and open each task directly from the calendar.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {Object.entries(CALENDAR_TIMING_META).map(([key, { label, color }]) => (
            <Badge key={key} bg="light" text="dark" pill className="border d-inline-flex align-items-center gap-2 px-3 py-2">
              <span className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: color }}></span>
              {label}: {timelineCounts[key] ?? 0}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 p-lg-4 d-flex flex-column flex-lg-row gap-2">
          {CALENDAR_FILTERS.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "dark" : "outline-secondary"}
              className="rounded-pill px-4"
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </Card.Body>
      </Card>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <Card className="calendar-shell border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-3 p-lg-4">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-body-secondary mt-3 mb-0">Loading events...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-5">
                  <div className="display-6 mb-2">🗓️</div>
                  <h3 className="h5 mb-2">No events for this view</h3>
                  <p className="text-body-secondary mb-0">
                    Try another quick filter or create a task with a schedule to see it here.
                  </p>
                </div>
              ) : (
                <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  eventPropGetter={eventPropGetter}
                  components={{ toolbar: CustomToolbar }}
                  formats={formats}
                  popup
                  onSelectEvent={(event) => {
                    if (event.taskId) {
                      navigate(`/home/tasks/${event.taskId}`)
                    }
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="col-12 col-xl-4">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 mb-1">Next scheduled tasks</h3>
                  <p className="text-body-secondary small mb-0">Quick access to your nearest deadlines.</p>
                </div>
                <Badge bg="dark" pill>
                  {nextEvents.length}
                </Badge>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : nextEvents.length === 0 ? (
                <div className="text-center py-4 text-body-secondary">
                  No upcoming scheduled tasks.
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {nextEvents.map((event) => {
                    const timing = CALENDAR_TIMING_META[event.timing]

                    return (
                      <Card key={event.id} className="border rounded-4">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                            <div>
                              <h4 className="h6 mb-1">{event.title}</h4>
                              <p className="text-body-secondary small mb-0">
                                {formatEventDateRange(event)}
                              </p>
                            </div>
                            <Badge
                              bg="light"
                              text="dark"
                              className="border"
                              style={{ borderColor: timing.color }}
                            >
                              {timing.label}
                            </Badge>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-3"
                            onClick={() => navigate(`/home/tasks/${event.taskId}`)}
                          >
                            Open task
                          </Button>
                        </Card.Body>
                      </Card>
                    )
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  )
}

export default CalendarComponent
