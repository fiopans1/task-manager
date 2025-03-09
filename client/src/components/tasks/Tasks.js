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
import taskService from "../../services/taskService";
import { Suspense } from "react";
import TasksList from "./TasksList";

const Tasks = () => {
  const navigateTo = useNavigate();
  const location = useLocation();

  const handleOpenTask = (id) => {
    navigateTo(`${location.pathname}/${id}`);
  };
  const [show, setShow] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [tasksResource, setTasksResource] = useState(taskService.getTasks());

  const refreshTasks = () => {
    taskService.invalidateTasksCache();
    setTasksResource(taskService.getTasks());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <Container fluid>
      <h1>My-Tasks</h1>
      <Col className="align-items-center mb-3">
        <Row>
          <Col md={8}>
            <Card>
              <InputGroup>
                <Form.Control className="no-focus-background" />
                <Button variant="primary">Search</Button>
              </InputGroup>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Button variant="warning" onClick={() => refreshTasks()}>
                Refresh
              </Button>
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
          <Suspense fallback={<div>Loading...</div>}>
            <TasksList
              key={`tasks-list-${refreshKey}`}
              tasksResource={tasksResource}
              handleOpenTask={handleOpenTask}
            />
          </Suspense>
        </Row>
      </Col>
      <NewTask
        show={show}
        handleClose={handleClose}
        handleShow={handleShow}
        refreshTasks={refreshTasks}
      />
    </Container>
  );
};

export default Tasks;
