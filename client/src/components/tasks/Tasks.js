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
import { errorToast } from "../common/Noty";

import EditTask from "./EditTask";
const Tasks = () => {
  const navigateTo = useNavigate();
  const location = useLocation();
  const handleOpenTask = (id) => {
    navigateTo(`${location.pathname}/${id}`);
  };
  const [showNewTask, setshowNewTask] = useState(false);
  const [showEditTask, setshowEditTask] = useState(false);
  const [formEditData, setFormEditData] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClose = () => setshowNewTask(false);
  const handleshowNewTask = () => setshowNewTask(true);
  const handleCloseEdit = () => setshowEditTask(false);
  const handleshowEditTask = (task) => {
    setFormEditData(task);
    setshowEditTask(true);
  };

  const [tasksResource, setTasksResource] = useState(taskService.getTasks());

  const refreshTasks = () => {
    taskService.invalidateTasksCache();
    setTasksResource(taskService.getTasks());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleErrors = (error, info) => {
    errorToast("Error: " + error.message);
  };

  return (
    <Container fluid className="px-3">
      <div className="tittle-tab-container">
        <h2>My Tasks</h2>
      </div>

      {/* Primera fila con controles */}
      <Row
        className="mb-3"
        style={{
          borderBottom: "1px solid #ccc",
          boxShadow: "0px 4px 6px -6px rgba(0, 0, 0, 0.2)",
          borderRadius: "0 0 8px 8px",
          padding: "10px",
          marginBottom: "15px",
        }}
      >
        <Col md={8}>
          <Card>
            <InputGroup>
              <Form.Control className="no-focus-background" />
              <Button variant="primary">Search</Button>
            </InputGroup>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="h-100">
            <Button
              variant="warning"
              onClick={() => refreshTasks()}
              className="h-100 w-100"
            >
              Refresh
            </Button>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="h-100">
            <Button
              variant="primary"
              onClick={() => handleshowNewTask()}
              className="h-100 w-100"
            >
              New Task
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila con la lista de tareas */}
      <Row>
        <Col className="px-0">
          <Container fluid className="overflow-auto" style={{ height: "80vh", width: "100%" }}>
            <ErrorBoundary
              resetKeys={[refreshKey]}
              onError={handleErrors}
              fallback={
                <Container className="text-center mt-5">
                  <h2 style={{ color: "red" }}>Something went wrong</h2>
                </Container>
              }
            >
              <Suspense
                fallback={
                  <Container className="text-center mt-5">
                    <Spinner animation="border" />
                  </Container>
                }
              >
                <TasksList
                  key={`tasks-list-${refreshKey}`}
                  tasksResource={tasksResource}
                  handleOpenTask={handleOpenTask}
                  handleEditTask={handleshowEditTask}
                  refreshTasks={refreshTasks}
                />
              </Suspense>
            </ErrorBoundary>
          </Container>
        </Col>
      </Row>

      {/* Modales */}
      <NewTask
        show={showNewTask}
        handleClose={handleClose}
        refreshTasks={refreshTasks}
      />
      <EditTask
        show={showEditTask}
        handleClose={handleCloseEdit}
        refreshTasks={refreshTasks}
        initialData={formEditData}
      />
    </Container>
  );
};

export default Tasks;
