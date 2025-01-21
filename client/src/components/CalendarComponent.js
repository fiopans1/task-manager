import { Container, Row, Col } from "react-bootstrap";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
const CalendarComponent = () => {
  const localizer = dayjsLocalizer(dayjs);
  const events = [];
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
          />
        </Col>
      </Row>
    </Container>
  );
};
export default CalendarComponent;
