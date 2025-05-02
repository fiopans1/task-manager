import { Container } from "react-bootstrap";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { errorToast } from "./common/Noty";
import taskService from "../services/taskService";



const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const convertTasksToEvents = (tasks) => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.nameOfTask,
      start: new Date(task.startTime),
      end: new Date(task.endTime),
      category: task.category || "work", // Valor por defecto "work" si no tiene categoría
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await taskService.getEvents();

        if (isMounted) {
          setEvents(convertTasksToEvents(data));
        }
      } catch (error) {
        if (isMounted) {
          errorToast("Error al cargar eventos: " + error.message);
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
    const categoryColors = {
      work: {
        backgroundColor: "#4361ee",
        boxShadow: "0 2px 6px rgba(67, 97, 238, 0.3)",
      },
      personal: {
        backgroundColor: "#4cc9f0",
        boxShadow: "0 2px 6px rgba(76, 201, 240, 0.3)",
      },
      urgent: {
        backgroundColor: "#f72585",
        boxShadow: "0 2px 6px rgba(247, 37, 133, 0.3)",
      },
      default: {
        backgroundColor: "#7209b7",
        boxShadow: "0 2px 6px rgba(114, 9, 183, 0.3)",
      }
    };

    const categoryStyle = categoryColors[event.category] || categoryColors.default;

    return {
      style: {
        backgroundColor: categoryStyle.backgroundColor,
        borderRadius: "8px",
        border: "none",
        color: "white",
        boxShadow: categoryStyle.boxShadow,
        padding: "4px 8px",
        fontWeight: "500",
        transition: "transform 0.2s ease",
        cursor: "pointer",
      }
    };
  };

  const customComponents = {
    toolbar: (props) => (
      <div className="custom-toolbar">
        <div className="toolbar-left">
          <button onClick={() => props.onNavigate('PREV')} className="nav-button">
            <i className="fa fa-chevron-left"></i>
          </button>
          <button onClick={() => props.onNavigate('TODAY')} className="today-button">
            Hoy
          </button>
          <button onClick={() => props.onNavigate('NEXT')} className="nav-button">
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
        <div className="toolbar-title">
          <h3>{props.label}</h3>
        </div>
        <div className="toolbar-right">
          <button onClick={() => props.onView('month')} className={`view-button ${props.view === 'month' ? 'active' : ''}`}>
            Mes
          </button>
          <button onClick={() => props.onView('week')} className={`view-button ${props.view === 'week' ? 'active' : ''}`}>
            Semana
          </button>
          <button onClick={() => props.onView('day')} className={`view-button ${props.view === 'day' ? 'active' : ''}`}>
            Día
          </button>
          <button onClick={() => props.onView('agenda')} className={`view-button ${props.view === 'agenda' ? 'active' : ''}`}>
            Agenda
          </button>
        </div>
      </div>
    )
  };

  // Formateador de fechas personalizado
  const formats = {
    dayFormat: (date, culture, localizer) =>
      localizer.format(date, 'ddd D', culture),
    
    dayHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, 'dddd, D [de] MMMM', culture),
    
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, 'D MMMM', culture) + ' - ' + 
      localizer.format(end, 'D MMMM', culture)
  };

  return (
    <Container fluid className="calendar-container">
      <div className="calendar-header">
        <h2>Calendario</h2>
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#4361ee" }}></span>
            <span>Trabajo</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#4cc9f0" }}></span>
            <span>Personal</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#f72585" }}></span>
            <span>Urgente</span>
          </div>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        {loading ? (
          <div className="calendar-loading">
            <div className="spinner"></div>
            <p>Cargando eventos...</p>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventPropGetter}
            components={customComponents}
            formats={formats}
            className="modern-calendar"
          />
        )}
      </div>
    </Container>
  );
};

export default CalendarComponent;