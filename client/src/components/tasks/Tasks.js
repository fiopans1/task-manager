import {
  Container,
  Col,
  Row,
  Card,
  InputGroup,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import NewTask from "./NewTask";
const Tasks = () => {
  const navigateTo = useNavigate();
  const location = useLocation();

  const handleOpenTask = (id) => {
    navigateTo(`${location.pathname}/${id}`);
  };
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const cards = Array.from({ length: 30 }, (_, index) => ({
    key: `card${index + 1}`,
    title: `Card ${index + 1}`,
    content: `Este es el contenido de la tarjeta número ${
      index + 1
    }. Puedes personalizarlo según tus necesidades.`,
    status: "done",
    priority: "high",
  }));

  return (
    <Container fluid>
      <h1>My-Tasks</h1>
      <Col className="align-items-center mb-3">
        <Row>
          <Col md={10}>
            <Card>
              <InputGroup>
                <Form.Control className="no-focus-background" />
                <Button variant="primary">Search</Button>
              </InputGroup>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Button variant="primary" onClick={() => handleShow()}>
                New Task
              </Button>
            </Card>
          </Col>
        </Row>
        <Row>
          <Card
            fluid
            className="overflow-auto m-2 p-0"
            style={{ height: "88vh" }}
          >
            {cards.map((card) => (
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <Card.Title>{card.title}</Card.Title>
                      <Card.Text>{card.content}</Card.Text>
                    </Col>
                    <Col md={2}>
                      <Row className="mb-2">
                        <Card.Subtitle>Priority:</Card.Subtitle>
                        <Card.Text className="text-truncate">
                          {card.priority}
                        </Card.Text>
                      </Row>
                      <Row className="mb-2">
                        {" "}
                        <Card.Subtitle>Status:</Card.Subtitle>
                        <Card.Text>{card.status}</Card.Text>
                      </Row>
                    </Col>
                    <Col md={2}>
                      <Row>
                        <Button
                          variant="success"
                          className="me-2"
                          onClick={() => handleOpenTask(card.key)}
                        >
                          Open
                        </Button>
                        <Button variant="primary" className="me-2">
                          Edit
                        </Button>
                        <Button variant="danger" className="me-2">
                          Delete
                        </Button>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Card>
        </Row>
      </Col>
      <NewTask show={show} handleClose={handleClose} handleShow={handleShow} />
    </Container>
  );
};

export default Tasks;
