import { Container, Button, Spinner, Card } from "react-bootstrap";
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

  // Componente personalizado para la barra de herramientas
  const CustomToolbar = (props) => {
    return (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group">
          <Button 
            variant="outline-secondary" 
            className="mx-1" 
            onClick={() => props.onNavigate('PREV')}
          >
            &#8249; {/* Símbolo de flecha izquierda HTML */}
          </Button>
          <Button 
            variant="primary" 
            className="mx-1" 
            onClick={() => props.onNavigate('TODAY')}
          >
            Hoy
          </Button>
          <Button 
            variant="outline-secondary" 
            className="mx-1" 
            onClick={() => props.onNavigate('NEXT')}
          >
            &#8250; {/* Símbolo de flecha derecha HTML */}
          </Button>
        </div>
        
        <span className="rbc-toolbar-label fw-bold fs-4">
          {props.label}
        </span>
        
        <div className="rbc-btn-group">
          {['month', 'week', 'day', 'agenda'].map(view => (
            <Button
              key={view}
              variant={props.view === view ? "primary" : "outline-secondary"}
              className="mx-1"
              onClick={() => props.onView(view)}
            >
              {view === 'month' && 'Mes'}
              {view === 'week' && 'Semana'}
              {view === 'day' && 'Día'}
              {view === 'agenda' && 'Agenda'}
            </Button>
          ))}
        </div>
      </div>
    );
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

  // Componentes personalizados
  const customComponents = {
    toolbar: CustomToolbar
  };

  return (
    <Container fluid className="py-4 overflow-auto" style={{ height: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Calendario</h2>
        <div className="d-flex gap-4">
          {Object.entries({
            work: { label: "Trabajo", color: "#4361ee" },
            personal: { label: "Personal", color: "#4cc9f0" },
            urgent: { label: "Urgente", color: "#f72585" }
          }).map(([key, { label, color }]) => (
            <div key={key} className="d-flex align-items-center">
              <div 
                style={{ 
                  backgroundColor: color, 
                  width: "16px", 
                  height: "16px", 
                  borderRadius: "4px",
                  marginRight: "8px" 
                }} 
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando eventos...</p>
            </div>
          ) : (
            <div style={{ height: "80vh" }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                eventPropGetter={eventPropGetter}
                components={customComponents}
                formats={formats}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CalendarComponent;