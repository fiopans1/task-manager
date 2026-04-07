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
import { useTranslation } from "react-i18next";
import NewEditTask from "./NewEditTask";
import taskService from "../../services/taskService";
import { Suspense } from "react";
import TasksList from "./TasksList";
import { ErrorBoundary } from "react-error-boundary";
import { errorToast } from "../common/Noty";

const Tasks = () => {
  const { t } = useTranslation();
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

  const [tasksResource, setTasksResource] = useState(() => taskService.getTasks());

  // Reload data when navigating back to this page (cache was invalidated by sidebar)
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
    // Implement search if the service supports it
    // For now, simply refresh the tasks
    refreshTasks();
  };

  const handleErrors = (error, info) => {
    errorToast("Error: " + error.message);
  };

  return (
    <Container fluid className="px-3">
      <div className="tittle-tab-container">
        <h2>{t('tasks.title')}</h2>
      </div>

      {/* First row with controls */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-2">
              <Col xs={12} md={8}>
                <InputGroup>
                  <Form.Control
                    className="border-end-0"
                    placeholder={t('tasks.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-primary" type="submit">
                    {t('tasks.search')}
                  </Button>
                </InputGroup>
              </Col>
              <Col xs={12} md={4} className="d-flex justify-content-md-end flex-wrap gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    refreshTasks();
                  }}
                  className="flex-fill flex-md-grow-0"
                  size={isMobile ? "sm" : ""}
                >
                  {t('tasks.clearFilter')}
                </Button>
                <Button
                  variant="outline-info"
                  className="flex-fill flex-md-grow-0"
                  onClick={refreshTasks}
                  size={isMobile ? "sm" : ""}
                >
                  {t('tasks.refresh')}
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={handleshowNewTask}
                  className="flex-fill flex-md-grow-0"
                  size={isMobile ? "sm" : ""}
                >
                  <span className="me-1">+</span> {t('tasks.newTask')}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Second row with task list */}
      <Row>
        <Col>
          <Container
            fluid
            className="tasks-container"
            style={{ 
              width: "100%",
              paddingBottom: "20px" 
            }}
          >
            <ErrorBoundary
              resetKeys={[refreshKey]}
              onError={handleErrors}
              fallback={
                <Container className="text-center mt-5">
                  <h2 style={{ color: "red" }}>{t('tasks.somethingWentWrong')}</h2>
                  <p>{t('tasks.errorLoadingTasks')}</p>
                  <Button variant="primary" onClick={refreshTasks}>
                    {t('tasks.tryAgain')}
                  </Button>
                </Container>
              }
            >
              <Suspense
                fallback={
                  <Container className="text-center mt-5">
                    <Spinner animation="border" />
                    <p className="mt-2">{t('tasks.loadingTasks')}</p>
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

      {/* Modals */}
      <NewEditTask
        show={showNewTask}
        handleClose={handleClose}
        refreshTasks={refreshTasks}
        editOrNew={false}
        initialData={{}}
      />
      <NewEditTask
        show={showEditTask}
        handleClose={handleCloseEdit}
        refreshTasks={refreshTasks}
        editOrNew={true}
        initialData={formEditData}
      />
    </Container>
  );
};

export default Tasks;