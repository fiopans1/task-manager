import { useState, useEffect, useMemo } from "react";
import { Container, Card, ButtonGroup, ToggleButton } from "react-bootstrap";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styled from "styled-components";

import { errorToast } from "./common/Noty";
import taskService from "../services/taskService";

/***************************
 *  Styled‑Components UI   *
 **************************/
const CalendarWrapper = styled.div`
  .rbc-calendar {
    height: 70vh; /* keep it responsive */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    border-radius: 1rem;
    overflow: hidden;
  }

  /* toolbar */
  .rbc-toolbar {
    background: #ffffff;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
  }

  /* week + month headers */
  .rbc-header {
    background: #f9fafb;
    padding: 0.75rem;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
  }

  /* events */
  .rbc-event {
    border: none;
    border-radius: 0.5rem;
    padding: 2px 4px;
    font-size: 0.8rem;
    color: #ffffff;
    cursor: pointer;
    transition: filter 0.15s ease;
  }

  .rbc-event:hover {
    filter: brightness(0.9);
  }

  /* today indicator */
  .rbc-today {
    background: rgba(59, 130, 246, 0.05);
  }
`;

const VIEW_OPTIONS = [
  { value: "month", label: "Mes" },
  { value: "week", label: "Semana" },
  { value: "day", label: "Día" },
];

const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs);
  const [rawTasks, setRawTasks] = useState([]);
  const [view, setView] = useState("month");

  /*
   * Task → Event conversion memoized so we only run
   * when tasks actually change.
   */
  const events = useMemo(() => {
    return rawTasks.map((task) => ({
      id: task.id,
      title: task.nameOfTask,
      start: new Date(task.startTime),
      end: new Date(task.endTime),
      category: task.category || "work",
    }));
  }, [rawTasks]);

  // Fetch tasks on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await taskService.getEvents();
        if (isMounted) setRawTasks(data);
      } catch (error) {
        if (isMounted) errorToast("Error: " + error.message);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  /* prettier calendar event colors */
  const eventPropGetter = (event) => {
    const palette = {
      work: "#2563eb", // blue-600
      personal: "#059669", // emerald-600
      urgent: "#dc2626", // red-600
      default: "#7c3aed", // violet-600
    };

    const backgroundColor = palette[event.category] || palette.default;

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        border: "none",
        padding: "2px 4px",
        color: "#ffffff",
      },
    };
  };

  const handleViewChange = (next) => {
    setView(next);
  };

  return (
    <Container fluid>
      <Card className="border-0 bg-transparent">
        <Card.Body>
          <h2 className="mb-4 fw-semibold">Mi Calendario</h2>

          {/* View Switcher */}
          <ButtonGroup className="mb-3">
            {VIEW_OPTIONS.map((opt, idx) => (
              <ToggleButton
                key={opt.value}
                id={`view-${opt.value}`}
                type="radio"
                variant="outline-primary"
                value={opt.value}
                checked={view === opt.value}
                onChange={(e) => setView(e.currentTarget.value)}
              >
                {opt.label}
              </ToggleButton>
            ))}
          </ButtonGroup>

          <CalendarWrapper>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventPropGetter}
              view={view}
              onView={handleViewChange}
            />
          </CalendarWrapper>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CalendarComponent;
