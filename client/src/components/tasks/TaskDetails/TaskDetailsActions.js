import { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Row, Col } from "react-bootstrap";
const TaskDetailsActions = () => {
  const action = Array.from({ length: 30 }, (_, index) => ({
    user: `user${index + 1}`,
    action: `Action ${index + 1}`,
    description: `Description of action ${index + 1}`,
  }));
  return (
    <Container fluid>
      <h3 className="mt-4">Action History</h3>
      <Container fluid>
        <Col className="g-4">
          {action.map((item, index) => (
            <Col key={index}>
              <Card className="m-1">
                <Card.Header>
                  <Row>
                    <Col>
                      <Card.Title>{item.action}</Card.Title>
                    </Col>
                    <Col>
                      <Card.Subtitle className="mb-2 text-muted text-end">
                        By: {item.user}
                      </Card.Subtitle>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <Card.Text>{item.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Col>
      </Container>
    </Container>
  );
};

export default TaskDetailsActions;
