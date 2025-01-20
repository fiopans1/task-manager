import { Container, Card } from "react-bootstrap";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs);
  // const events = [
  //   {
  //     title: "Evento 1",
  //     start: new Date(2023, 10, 1, 10, 0), // 1 de noviembre de 2023, 10:00 AM
  //     end: new Date(2025, 10, 1, 12, 0), // 1 de noviembre de 2023, 12:00 PM
  //   },

  // ];
  return (
    <Container fluid>
      <h1>Calendar</h1>
      <Container
        fluid
        className="m-2"
        style={{ height: "90vh", width: "70vw" }}
      >
        <Calendar
          localizer={localizer}
          // events={events}
          startAccessor="start"
          endAccessor="end"
        />
      </Container>
    </Container>
  );
};

export default CalendarComponent;
