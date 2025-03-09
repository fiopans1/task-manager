import { Col, Row, Card, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
const TasksList = ({ tasksResource, handleOpenTask }) => {
    
  const [data, setData] = useState(tasksResource.read());

  useEffect(() => {
    setData(tasksResource.read());
  }, [tasksResource]);

  return !data || data.length === 0 ? (
    <Card fluid className="overflow-auto m-2 p-0" style={{ height: "88vh" }}>
      <Card.Body className="text-center py-5">
        <Card.Title>No tasks avaliable</Card.Title>
        <Card.Text>Please create a new task</Card.Text>
      </Card.Body>
    </Card>
  ) : (
    <Card fluid className="overflow-auto m-2 p-0" style={{ height: "88vh" }}>
      {data?.map((card) => (
        <Card key={card.id}>
          <Card.Body>
            <Row>
              <Col md={8}>
                <Card.Title>{card.nameOfTask}</Card.Title>
                <Card.Text>{card.descriptionOfTask}</Card.Text>
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
                  <Card.Text>{card.state}</Card.Text>
                </Row>
              </Col>
              <Col md={2}>
                <Row>
                  <Button
                    variant="success"
                    className="me-2"
                    onClick={() => handleOpenTask(card.id)}
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
  );
};

export default TasksList;
