import {
  Container,
  Col,
  Row,
  Card,
  InputGroup,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import NewTask from "./NewTask";
import taskService from "../../services/taskService";
import { Suspense } from "react";
import TasksList from "./TasksList";
import { ErrorBoundary } from "react-error-boundary";
import { useNotification } from "../common/Noty";
const Tasks = () => {
  const navigateTo = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();
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

  const handleErrors = (error, info) => {
    addNotification("Error: " + error.message, "danger", 5000);
  }

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
        {/* //TO-DO Mejorar el mensaje de error por uno mejor */}
        <Card fluid className="overflow-auto m-2 p-0" style={{ height: "88vh" }}>
          <ErrorBoundary resetKeys={[refreshKey]} onError={handleErrors} fallback={<Container className="text-center mt-5"><h2 style={{ color: "red"}}>Something went wrong</h2></Container>}>
          <Suspense fallback={<Container className="text-center mt-5"><Spinner/></Container>}>
            <TasksList
              key={`tasks-list-${refreshKey}`}
              tasksResource={tasksResource}
              handleOpenTask={handleOpenTask}
            />
          </Suspense>
          </ErrorBoundary>
        </Card>
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
