import {
  Container,
  Col,
  Row,
  Card,
  ListGroup,
  InputGroup,
  Button,
  Form,
} from "react-bootstrap";

const Tasks = () => {
  const listtasks = [
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
    "Task 7",
    "Task 8",
    "Task 9",
    "Task 10",
    "Task 11",
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
    "Task 7",
    "Task 8",
    "Task 9",
    "Task 10",
    "Task 11",
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
    "Task 7",
    "Task 8",
    "Task 9",
    "Task 10",
    "Task 11",
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
    "Task 7",
    "Task 8",
    "Task 9",
    "Task 10",
    "Task 11",
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
    "Task 7",
    "Task 8",
    "Task 9",
    "Task 10",
    "Task 11",
  ];

  return (
    <Container fluid>
      <h1>Tasks</h1>
      <Col className="align-items-center mb-3">
        <Row>
          <Col md={10}>
            <Card>
              <InputGroup>
                <Form.Control className="no-focus-background"/>
                <Button variant="primary">Add</Button>
              </InputGroup>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Button variant="primary">New Task</Button>
            </Card>
          </Col>
        </Row>
        <Row>
          <Card className="overflow-auto m-2 p-0" style={{ height: "80vh" }}>
            <ListGroup>
              {listtasks.map((task, index) => (
                <ListGroup.Item key={index}>{task}</ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Row>
      </Col>
    </Container>
  );
};

export default Tasks;
