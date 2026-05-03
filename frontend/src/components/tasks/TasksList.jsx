import { useCallback, useState } from "react";
import { Badge, Button, Card, Col, Modal, Row } from "react-bootstrap";
import taskService from "../../services/taskService";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { errorToast, successToast } from "../common/Noty";

const TasksList = ({
  tasksResource,
  handleOpenTask,
  handleEditTask,
  refreshTasks,
  searchTerm,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const fetchPage = useCallback(
    async (page, size) => taskService.fetchTasksPage(page, size, searchTerm),
    [searchTerm]
  );

  const { items: data, LoadMoreSpinner } = useServerInfiniteScroll(fetchPage, 50, [
    tasksResource,
    searchTerm,
  ]);

  const deleteTask = async () => {
    try {
      if (!idToDelete) {
        errorToast("Error: No task selected");
        return;
      }

      await taskService.deleteTask(idToDelete);
      taskService.invalidateTasksCache();
      setIdToDelete(null);
      refreshTasks();
      successToast("Task deleted successfully");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    if (!priority || priority === "<None>") return "secondary";
    switch (priority.toLowerCase()) {
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "primary";
      case "min":
        return "success";
      case "low":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (!status) return "secondary";
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      case "in_progress":
        return "primary";
      case "new":
        return "info";
      case "paussed":
        return "warning";
      default:
        return "secondary";
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-4 text-center py-5">
        <Card.Body>
          <div className="mb-3 text-body-secondary">
            <i className="bi bi-clipboard fs-1"></i>
          </div>
          <Card.Title>No tasks available</Card.Title>
          <Card.Text className="text-body-secondary">Create your first task to get started.</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="d-grid gap-3">
      {data.map((task) => (
        <Card key={task.id} className="item-card border-0 shadow-sm rounded-4">
          <Card.Body className="p-3 p-lg-4">
            <Row className="g-3 align-items-start">
              <Col lg={8}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <h5 className="mb-0 fw-semibold me-1 text-break">{task.nameOfTask}</h5>
                  <Badge bg={getStatusBadgeVariant(task.state)} pill>
                    {task.state}
                  </Badge>
                  <Badge bg={getPriorityBadgeVariant(task.priority)} pill>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-body-secondary mb-0">
                  {task.descriptionOfTask || <span className="fst-italic">No description</span>}
                </p>
              </Col>
              <Col lg={4}>
                <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                  <Button variant="light" className="rounded-pill px-3 border" onClick={() => handleOpenTask(task.id)}>
                    <i className="bi bi-eye me-2"></i>
                    View
                  </Button>
                  <Button variant="outline-primary" className="rounded-pill px-3" onClick={() => handleEditTask(task)}>
                    <i className="bi bi-pencil me-2"></i>
                    Edit
                  </Button>
                  <Button variant="outline-danger" className="rounded-pill px-3" onClick={() => {
                    setIdToDelete(task.id);
                    setShowDelete(true);
                  }}>
                    <i className="bi bi-trash me-2"></i>
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      <LoadMoreSpinner />

      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered backdrop="static" contentClassName="border-0 shadow-sm rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Confirm deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 text-body-secondary">
          Are you sure you want to delete this task? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            className="rounded-pill px-4"
            onClick={() => {
              setShowDelete(false);
              setIdToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="rounded-pill px-4"
            onClick={() => {
              setShowDelete(false);
              deleteTask();
            }}
          >
            Delete Task
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TasksList;
