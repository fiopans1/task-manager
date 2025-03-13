import { Container, Row, Col } from "react-bootstrap";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs);
  const events = [
    {
      id: 1,
      title: 'Reunión de equipo',
      start: new Date(2025, 2, 14, 10, 0),
      end: new Date(2025, 2, 14, 11, 0),
      category: 'work' // Usamos esta propiedad para determinar el color
    },
    {
      id: 2,
      title: 'Almuerzo',
      start: new Date(2025, 2, 14, 13, 0),
      end: new Date(2025, 2, 14, 14, 0),
      category: 'personal'
    }
  ];

  const eventPropGetter = (event) => {
    let style = {
      backgroundColor: '',
      borderRadius: '5px',
      border: 'none',
      color: 'white'
    };

    switch(event.category) {
      case 'work':
        style.backgroundColor = '#1976d2'; // Azul
        break;
      case 'personal':
        style.backgroundColor = '#43a047'; // Verde
        break;
      case 'urgent':
        style.backgroundColor = '#e53935'; // Rojo
        break;
      default:
        style.backgroundColor = '#7e57c2'; // Púrpura por defecto
    }

    return { style };
  };
  return (
    <Container fluid>
      <h1>Calendar</h1>
      <Row className="justify-content-center">
        <Col xs={12} md={8} style={{ height: "80vh" }}>
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
