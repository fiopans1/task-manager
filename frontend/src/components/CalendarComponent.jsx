import { useEffect, useState } from "react";
import { Badge, Button, Card, Container, Spinner } from "react-bootstrap";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import taskService from "../services/taskService";
import { errorToast } from "./common/Noty";

const CATEGORY_COLORS = {
  work: { label: "Work", color: "#4361ee" },
  personal: { label: "Personal", color: "#4cc9f0" },
  urgent: { label: "Urgent", color: "#f72585" },
  default: { label: "General", color: "#7209b7" },
};

const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await taskService.getEvents();
        if (isMounted) {
          setEvents(
            data.map((task) => ({
              id: task.id,
              title: task.nameOfTask,
              start: new Date(task.startTime),
              end: new Date(task.endTime),
              category: task.category || "default",
            }))
          );
        }
      } catch (error) {
        if (isMounted) {
          errorToast("Error loading events: " + error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const eventPropGetter = (event) => {
    const categoryStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default;
    return {
      style: {
        backgroundColor: categoryStyle.color,
        color: "#fff",
      },
    };
  };

  const CustomToolbar = (props) => (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group d-flex flex-wrap">
        <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => props.onNavigate("PREV")}>Prev</Button>
        <Button variant="dark" size="sm" className="me-2" onClick={() => props.onNavigate("TODAY")}>Today</Button>
        <Button variant="outline-secondary" size="sm" onClick={() => props.onNavigate("NEXT")}>Next</Button>
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
  );

  const formats = {
    dayFormat: (date, culture, localizerInstance) => localizerInstance.format(date, "ddd D", culture),
    dayHeaderFormat: (date, culture, localizerInstance) => localizerInstance.format(date, "dddd, MMMM D", culture),
    dayRangeHeaderFormat: ({ start, end }, culture, localizerInstance) =>
      `${localizerInstance.format(start, "MMMM D", culture)} - ${localizerInstance.format(end, "MMMM D", culture)}`,
  };

  return (
    <Container fluid className="px-3 px-lg-4 py-4 pb-5">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-semibold mb-1">Calendar</h2>
          <p className="text-body-secondary mb-0">See deadlines and events in a simpler, more readable calendar.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {Object.entries(CATEGORY_COLORS)
            .filter(([key]) => key !== "default")
            .map(([key, { label, color }]) => (
              <Badge key={key} bg="light" text="dark" pill className="border d-inline-flex align-items-center gap-2 px-3 py-2">
                <span className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: color }}></span>
                {label}
              </Badge>
            ))}
        </div>
      </div>

      <Card className="calendar-shell border-0 shadow-sm rounded-4">
        <Card.Body className="p-3 p-lg-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-body-secondary mt-3 mb-0">Loading events...</p>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventPropGetter}
              components={{ toolbar: CustomToolbar }}
              formats={formats}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CalendarComponent;
