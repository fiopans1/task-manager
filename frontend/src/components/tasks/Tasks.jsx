import { Suspense, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { ErrorBoundary } from "react-error-boundary";
import { useLocation, useNavigate } from "react-router-dom";
import taskService from "../../services/taskService";
import { errorToast } from "../common/Noty";
import NewEditTask from "./NewEditTask";
import TasksList from "./TasksList";

const Tasks = () => {
  const navigateTo = useNavigate();
  const location = useLocation();
  const [showNewTask, setshowNewTask] = useState(false);
  const [showEditTask, setshowEditTask] = useState(false);
  const [formEditData, setFormEditData] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [tasksResource, setTasksResource] = useState(() => taskService.getTasks());

  useEffect(() => {
    setTasksResource(taskService.getTasks());
    setRefreshKey((prevKey) => prevKey + 1);
  }, [location.key]);

  const refreshTasks = () => {
    taskService.invalidateTasksCache();
    setTasksResource(taskService.getTasks());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearchTerm(searchTerm.trim());
    taskService.invalidateTasksCache();
    setTasksResource(taskService.getTasks());
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handleErrors = (error) => {
    errorToast("Error: " + error.message);
  };

  return (
    <Container fluid className="px-3 px-lg-4 py-4 pb-5">
      <Row className="align-items-center g-3 mb-4">
        <Col>
          <h2 className="fw-semibold mb-1">My Tasks</h2>
          <p className="text-body-secondary mb-0">A cleaner view for your work, events and daily priorities.</p>
        </Col>
        <Col xs={12} md="auto">
          <Button variant="primary" className="rounded-pill px-4" onClick={() => setshowNewTask(true)}>
            <i className="bi bi-plus-lg me-2"></i>
            New Task
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 p-lg-4">
          <Form onSubmit={handleSearch}>
            <Row className="g-3 align-items-center">
              <Col lg={7}>
                <InputGroup>
                  <InputGroup.Text className="bg-body border-end-0 rounded-start-pill">
                    <i className="bi bi-search text-body-secondary"></i>
                  </InputGroup.Text>
                  <Form.Control
                    className="border-start-0 rounded-end-pill"
                    placeholder="Search tasks"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col lg={5}>
                <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                  <Button type="submit" variant="dark" className="rounded-pill px-4">
                    Search
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="rounded-pill px-4"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveSearchTerm("");
                      refreshTasks();
                    }}
                  >
                    Clear
                  </Button>
                  <Button variant="outline-primary" className="rounded-pill px-4" onClick={refreshTasks}>
                    Refresh
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <ErrorBoundary
        resetKeys={[refreshKey]}
        onError={handleErrors}
        fallback={
          <Card className="border-0 shadow-sm rounded-4 text-center py-5">
            <Card.Body>
              <h3 className="h5 text-danger mb-2">Something went wrong</h3>
              <p className="text-body-secondary mb-4">There was an error loading your tasks.</p>
              <Button variant="primary" className="rounded-pill px-4" onClick={refreshTasks}>
                Try Again
              </Button>
            </Card.Body>
          </Card>
        }
      >
        <Suspense
          fallback={
            <Card className="border-0 shadow-sm rounded-4 text-center py-5">
              <Card.Body>
                <Spinner animation="border" />
                <p className="text-body-secondary mt-3 mb-0">Loading tasks...</p>
              </Card.Body>
            </Card>
          }
        >
          <TasksList
            key={`tasks-list-${refreshKey}`}
            tasksResource={tasksResource}
            handleOpenTask={(id) => navigateTo(`${location.pathname}/${id}`)}
            handleEditTask={(task) => {
              setFormEditData(task);
              setshowEditTask(true);
            }}
            refreshTasks={refreshTasks}
            searchTerm={activeSearchTerm}
          />
        </Suspense>
      </ErrorBoundary>

      <NewEditTask
        show={showNewTask}
        handleClose={() => setshowNewTask(false)}
        refreshTasks={refreshTasks}
        editOrNew={false}
        initialData={{}}
      />
      <NewEditTask
        show={showEditTask}
        handleClose={() => setshowEditTask(false)}
        refreshTasks={refreshTasks}
        editOrNew={true}
        initialData={formEditData}
      />
    </Container>
  );
};

export default Tasks;
