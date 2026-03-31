import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Badge,
  ProgressBar,
  Stack,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import {
  ArrowLeft,
  PlusCircle,
  Trash,
  CheckCircleFill,
  Circle,
  List,
  ClipboardCheck,
  FileText,
  Trophy,
  BoxArrowUpRight,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import listService from "../../../services/listService";
import taskService from "../../../services/taskService";
import { successToast, errorToast } from "../../common/Noty";

const ListDetails = ({ listId }) => {
  const navigate = useNavigate();

  const [list, setList] = useState({
    id: null,
    nameOfList: "",
    descriptionOfList: "",
    color: "",
    user: "",
    tasks: [],
  });
  const [showMore, setShowMore] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [searchAvailable, setSearchAvailable] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshList = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedList = await listService.getListById(listId);
        setList(fetchedList);
        setTasks(fetchedList.tasks || []);
      } catch (error) {
        errorToast("Error when try to load the List details: " + error.message);
      }
    };

    fetchData();
  }, [listId, refreshKey]);

  const handleBack = () => {
    navigate("..");
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.state === "COMPLETED"
  ).length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleOpenAddModal = async () => {
    setShowAddModal(true);
    setSelectedTaskIds([]);
    setSearchAvailable("");
    setLoadingAvailable(true);
    try {
      const unassignedTasks = await taskService.getTasksWithoutList();
      setAvailableTasks(unassignedTasks);
    } catch (error) {
      errorToast("Error loading tasks: " + error.message);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleAddTasks = async () => {
    try {
      if (selectedTaskIds.length > 0) {
        await listService.addTasksToList(listId, selectedTaskIds);
        refreshList();
        setShowAddModal(false);
        successToast("Tasks added successfully");
      }
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  const handleRemoveTask = async (taskId) => {
    try {
      await listService.deleteTaskFromList(taskId);
      refreshList();
      successToast("Task removed from list");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  const handleGoToTask = (taskId) => {
    navigate("/home/tasks/" + taskId);
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStateVariant = (state) => {
    switch (state) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "primary";
      case "PENDING":
        return "warning";
      default:
        return "secondary";
    }
  };

  const filteredAvailableTasks = availableTasks.filter((t) =>
    t.nameOfTask.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  return (
    <Container fluid className="my-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Stack direction="horizontal" gap={3} className="align-items-center">
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={handleBack}
              className="rounded-circle p-2 shadow-sm"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1
                className="mb-1 fw-bold text-body"
                style={{
                  fontSize: "2rem",
                }}
              >
                List Management
              </h1>
              <p className="text-muted mb-0">
                Track and manage your tasks efficiently
              </p>
            </div>
          </Stack>
        </Col>
      </Row>

      {/* Main Card with Modern Design */}
      <Card
        className="border-0 shadow-lg"
        style={{ borderRadius: "20px", overflow: "hidden" }}
      >
        {/* Header del card con gradiente */}
        <Card.Header
          className="border-0 text-white p-4"
          style={{
            background: `linear-gradient(135deg, ${
              progressPercentage === 100
                ? "#28a745, #20c997"
                : progressPercentage > 60
                ? "#007bff, #6f42c1"
                : progressPercentage > 30
                ? "#ffc107, #fd7e14"
                : "#6c757d, #495057"
            })`,
          }}
        >
          <Stack
            direction="horizontal"
            className="justify-content-between align-items-center"
          >
            <div>
              <h3 className="mb-1" style={{ fontWeight: "600" }}>
                {list.nameOfList || "Untitled List"}
              </h3>
              <Stack direction="horizontal" gap={2}>
                <List size={16} />
                <small>List ID: #{list.id}</small>
              </Stack>
            </div>
            <Badge
              bg="light"
              text="dark"
              className="px-4 py-2 rounded-pill d-flex align-items-center gap-1"
              style={{ fontSize: "0.9rem", fontWeight: "600" }}
            >
              <ClipboardCheck size={16} />
              {completedTasks}/{totalTasks} Done
            </Badge>
          </Stack>

          {/* Progress Bar */}
          <div className="mt-3">
            <small className="text-white-50">Overall Progress</small>
            <ProgressBar
              now={progressPercentage}
              className="mt-1"
              style={{ height: "8px", borderRadius: "4px" }}
              variant={progressPercentage === 100 ? "light" : "warning"}
            />
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card
                className="border-0 bg-body-tertiary h-100"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center py-3">
                  <List size={24} className="text-primary mb-2" />
                  <h6 className="mb-1 text-muted">Total Tasks</h6>
                  <h4 className="fw-semibold text-body">
                    {totalTasks}
                  </h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card
                className="border-0 bg-body-tertiary h-100"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center py-3">
                  <CheckCircleFill size={24} className="text-success mb-2" />
                  <h6 className="mb-1 text-muted">Completed</h6>
                  <h4 className="fw-semibold text-body">
                    {completedTasks}
                  </h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card
                className="border-0 bg-body-tertiary h-100"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center py-3">
                  <Trophy size={24} className="text-warning mb-2" />
                  <h6 className="mb-1 text-muted">Progress</h6>
                  <h4 className="fw-semibold text-body">
                    {Math.round(progressPercentage)}%
                  </h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Description */}
          <Card
            className="border-0 shadow-sm mb-4 bg-body-tertiary"
            style={{
              borderRadius: "15px",
            }}
          >
            <Card.Body className="p-4">
              <Stack direction="horizontal" gap={2} className="mb-3">
                <FileText size={20} className="text-primary" />
                <h5
                  className="mb-0 fw-semibold text-body"
                >
                  Description
                </h5>
              </Stack>

              {list.descriptionOfList && list.descriptionOfList !== "<None>" ? (
                list.descriptionOfList.length < 100 ? (
                  <p
                    className="mb-0 text-body-secondary"
                    style={{ lineHeight: "1.6" }}
                  >
                    {list.descriptionOfList}
                  </p>
                ) : (
                  <>
                    <p
                      className="mb-2 text-body-secondary"
                      style={{ lineHeight: "1.6" }}
                    >
                      {showMore
                        ? list.descriptionOfList
                        : `${list.descriptionOfList.substring(0, 100)}...`}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none fw-semibold"
                      onClick={() => setShowMore(!showMore)}
                    >
                      {!showMore ? "Show More ↓" : "Show Less ↑"}
                    </Button>
                  </>
                )
              ) : (
                <div className="text-center py-4">
                  <FileText size={48} className="text-muted mb-2" />
                  <p className="text-muted mb-0">No description available</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Add Task Section */}
          <Card
            className="border-0 shadow-sm mb-4 bg-body-tertiary"
            style={{
              borderRadius: "15px",
            }}
          >
            <Card.Body className="p-3">
              <Button
                variant="primary"
                className="w-100 d-flex align-items-center justify-content-center py-3 fw-semibold"
                onClick={handleOpenAddModal}
                style={{
                  borderRadius: "12px",
                }}
              >
                <PlusCircle className="me-2" size={20} />
                Add Task
              </Button>
            </Card.Body>
          </Card>

          {/* Tasks List */}
          <Card
            className="border-0 shadow-sm bg-body-tertiary"
            style={{
              borderRadius: "15px",
            }}
          >
            <Card.Body className="p-4">
              <Stack direction="horizontal" gap={2} className="mb-3">
                <FileText size={20} className="text-primary" />
                <h5
                  className="mb-0 fw-semibold text-body"
                >
                  Task List
                </h5>
              </Stack>

              {!tasks || tasks.length === 0 ? (
                <div className="text-center py-5">
                  <List size={48} className="text-muted mb-3" />
                  <h5 className="text-muted mb-2">No tasks in this list</h5>
                  <p className="text-muted mb-3">
                    Add existing tasks to get started
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={handleOpenAddModal}
                    style={{ borderRadius: "10px", fontWeight: "600" }}
                  >
                    <PlusCircle className="me-2" size={16} />
                    Add the first task
                  </Button>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {tasks.map((task) => (
                    <ListGroup.Item
                      key={task.id}
                      className="d-flex justify-content-between align-items-center px-3 py-3 bg-transparent"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleGoToTask(task.id)}
                    >
                      <div className="d-flex align-items-center gap-3" style={{ minWidth: 0, flex: 1 }}>
                        {task.state === "COMPLETED" ? (
                          <CheckCircleFill size={20} className="text-success flex-shrink-0" />
                        ) : (
                          <Circle size={20} className="text-secondary flex-shrink-0" />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div
                            className={`fw-semibold text-truncate ${
                              task.state === "COMPLETED"
                                ? "text-decoration-line-through text-muted"
                                : "text-body"
                            }`}
                          >
                            {task.nameOfTask}
                          </div>
                          {task.descriptionOfTask && (
                            <small className="text-muted text-truncate d-block">
                              {task.descriptionOfTask}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                        <Badge bg={getStateVariant(task.state)} className="text-uppercase" style={{ fontSize: "0.7rem" }}>
                          {task.state}
                        </Badge>
                        <Badge bg={getPriorityVariant(task.priority)} className="text-uppercase" style={{ fontSize: "0.7rem" }}>
                          {task.priority}
                        </Badge>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToTask(task.id);
                          }}
                          style={{ borderRadius: "8px" }}
                          title="Open task details"
                        >
                          <BoxArrowUpRight size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTask(task.id);
                          }}
                          style={{ borderRadius: "8px" }}
                          title="Remove from list"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Modal to add existing tasks */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-semibold text-body">
            <PlusCircle className="me-2" size={20} />
            Add Tasks to List
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search tasks..."
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
          {loadingAvailable ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Loading available tasks...</p>
            </div>
          ) : filteredAvailableTasks.length === 0 ? (
            <div className="text-center py-4">
              <List size={48} className="text-muted mb-2" />
              <p className="text-muted mb-0">No unassigned tasks available</p>
              <small className="text-muted">All tasks already belong to a list</small>
            </div>
          ) : (
            <ListGroup style={{ maxHeight: "400px", overflow: "auto" }}>
              {filteredAvailableTasks.map((task) => (
                <ListGroup.Item
                  key={task.id}
                  action
                  active={selectedTaskIds.includes(task.id)}
                  onClick={() => toggleTaskSelection(task.id)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-truncate">
                        {task.nameOfTask}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          {selectedTaskIds.length > 0 && (
            <div className="mt-3 text-muted">
              {selectedTaskIds.length} task(s) selected
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddTasks}
            disabled={selectedTaskIds.length === 0}
            className="fw-semibold"
          >
            Add Selected Tasks
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListDetails;
