import { Container, Row, Col } from "react-bootstrap";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";

import { errorToast } from "./common/Noty";
import taskService from "../services/taskService";
const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs);
  const convertTasksToEvents = (tasks) => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.nameOfTask,
      start: new Date(task.startTime),
      end: new Date(task.endTime),
      category: "work",
    }));
  };

  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Bandera para evitar actualizar estado en componente desmontado
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const data = await taskService.getEvents();

        // Solo actualizar estado si el componente sigue montado
        if (isMounted) {
          setEvents(convertTasksToEvents(data));
        }
      } catch (error) {
        if (isMounted) {
          errorToast("Error: " + error.message);
        }
      }
    };

    fetchEvents();

    // Función de limpieza para evitar actualizaciones de estado
    // en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, []);

  const eventPropGetter = (event) => {
    let style = {
      backgroundColor: "",
      borderRadius: "5px",
      border: "none",
      color: "white",
    };

    switch (event.category) {
      case "work":
        style.backgroundColor = "#1976d2"; // Azul
        break;
      case "personal":
        style.backgroundColor = "#43a047"; // Verde
        break;
      case "urgent":
        style.backgroundColor = "#e53935"; // Rojo
        break;
      default:
        style.backgroundColor = "#7e57c2"; // Púrpura por defecto
    }

    return { style };
  };
  return (
    <Container fluid>
      <div className="tittle-tab-container-calendar">
        <h2>Calendar</h2>
      </div>
      <Row className="justify-content-center">
        <Col style={{ height: "80vh" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventPropGetter}
          />
        </Col>
      </Row>
    </Container>
  );
};
export default CalendarComponent;
