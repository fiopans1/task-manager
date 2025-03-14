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
import EditTask from "./EditTask";
const Tasks = () => {
  const navigateTo = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();
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
    setshowEditTask(true)
  };

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
              <Button variant="primary" onClick={() => handleshowNewTask()}>
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
              handleEditTask={handleshowEditTask}
              refreshTasks={refreshTasks}
            />
          </Suspense>
          </ErrorBoundary>
        </Card>
        </Row>
      </Col>
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
