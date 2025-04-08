import React, { useEffect } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import { useState } from "react";
import taskService from "../../../services/taskService";
import { errorToast } from "../../common/Noty";
const TaskDetailsTask = ({ taskId }) => {
  const [showMore, setShowMore] = useState(false);
  const [task, setTask] = useState({
    id: 1,
    nameOfTask: "<None>",
    descriptionOfTask: "<None>",
    state: "<None>",
    user: "<None>",
    priority: "<None>",
    startDate: "<None>",
    endDate: "<None>",
    creationDate: "<None>",
    isEvent: false,
  });
  useEffect(() => {
    async function fetchTask() {
      try {
        const task = await taskService.getTaskById(taskId);
        setTask(task);
        console.log("get task");
      } catch (error) {
        errorToast("Error fetching data: " + error.message);
      }
    }
    fetchTask();
  }, []);
  return (
    <Container fluid>
      <Card className="m-1">
        <Card.Header>
          <Card.Title>Task Details</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col>
              <Row className="mb-2">
                <Card.Subtitle>Name:</Card.Subtitle>
                <Card.Text>
                  {" "}
                  {task.nameOfTask ? task.nameOfTask : "<None>"}
                </Card.Text>
              </Row>
              <Row className="mb-2">
                <Card.Subtitle>User:</Card.Subtitle>
                <Card.Text>
                  {task.user ? task.user : "No user assigned"}
                </Card.Text>
              </Row>
              <Row className="mb-2">
                <Card.Subtitle>Creation Date:</Card.Subtitle>
                <Card.Text>
                  {task.creationDate ? task.creationDate : "<None>"}
                </Card.Text>
              </Row>
            </Col>
            <Col>
              <Row className="mb-2">
                <Card.Subtitle>Status:</Card.Subtitle>
                <Card.Text>{task.state ? task.state : "<None>"}</Card.Text>
              </Row>
              <Row className="mb-2">
                <Card.Subtitle>Priority:</Card.Subtitle>
                <Card.Text>
                  {task.priority ? task.priority : "<None>"}
                </Card.Text>
              </Row>
              <Row className="mb-2">
                <Card.Subtitle>Is Event:</Card.Subtitle>
                <Card.Text>{task.isEvent ? "True" : "False"}</Card.Text>
              </Row>
            </Col>
            <Col>
              <Row className="mb-2">
                <Card.Subtitle>Start Event Date:</Card.Subtitle>
                <Card.Text>
                  {task.startDate ? task.startDate : "<None>"}
                </Card.Text>
              </Row>
              <Row className="mb-2">
                <Card.Subtitle>End Event Date:</Card.Subtitle>
                <Card.Text>{task.endDate ? task.endDate : "<None>"}</Card.Text>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Container fluid>
        <Col>
          <h3 className="mt-4">Description:</h3>
          {task.descriptionOfTask && task.descriptionOfTask.length < 100 ? (
            <p> {task.descriptionOfTask}</p>
          ) : (
            <>
              <p>
                {showMore
                  ? task.descriptionOfTask
                  : `${task.descriptionOfTask.substring(0, 100)}...`}
              </p>
              <span
                className="text-primary"
                onClick={() => setShowMore(!showMore)}
                style={{ cursor: "pointer" }}
              >
                {!showMore ? "Read More...." : "Read Less..."}
              </span>
            </>
          )}
        </Col>
      </Container>
    </Container>
  );
};

export default TaskDetailsTask;
