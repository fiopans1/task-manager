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
import { useState, useEffect } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if viewport is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar la búsqueda si el servicio lo soporta
    // Por ahora, simplemente actualiza las tareas
    refreshTasks();
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
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className={isMobile ? "gy-2" : "align-items-center"}>
              <Col md={8}>
                <InputGroup>
                  <Form.Control
                    className="border-end-0"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-primary" type="submit">
                    Search
                  </Button>
                </InputGroup>
              </Col>
              <Col md={4} className={`d-flex ${isMobile ? "mt-2" : "justify-content-end"}`}>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    refreshTasks();
                  }}
                  className="me-2"
                  size={isMobile ? "sm" : ""}
                >
                  Clear Filter
                </Button>
                <Button
                  variant="outline-info"
                  className="me-2"
                  onClick={refreshTasks}
                  size={isMobile ? "sm" : ""}
                >
                  Refresh
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={handleshowNewTask}
                  className="me-2"
                  size={isMobile ? "sm" : ""}
                >
                  <span className="me-1">+</span> New Task
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Segunda fila con la lista de tareas */}
      <Row>
        <Col>
          <Container
            fluid
            className="overflow-auto tasks-container"
            style={{ 
              height: isMobile ? "calc(100vh - 230px)" : "80vh", 
              width: "100%",
              paddingBottom: isMobile ? "80px" : "20px" 
            }}
          >
            <ErrorBoundary
              resetKeys={[refreshKey]}
              onError={handleErrors}
              fallback={
                <Container className="text-center mt-5">
                  <h2 style={{ color: "red" }}>Something went wrong</h2>
                  <p>There was an error loading your tasks.</p>
                  <Button variant="primary" onClick={refreshTasks}>
                    Try Again
                  </Button>
                </Container>
              }
            >
              <Suspense
                fallback={
                  <Container className="text-center mt-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Loading tasks...</p>
                  </Container>
                }
              >
                <TasksList
                  key={`tasks-list-${refreshKey}`}
                  tasksResource={tasksResource}
                  handleOpenTask={handleOpenTask}
                  handleEditTask={handleshowEditTask}
                  refreshTasks={refreshTasks}
                  searchTerm={searchTerm}
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