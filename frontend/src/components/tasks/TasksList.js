import { Col, Row, Card, Button, Modal, Badge } from "react-bootstrap";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";
import { useServerInfiniteScroll } from "../../hooks/useInfiniteScroll";

const TasksList = ({
  tasksResource,
  handleOpenTask,
  handleEditTask,
  refreshTasks,
  searchTerm,
}) => {
  const { t } = useTranslation();
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const fetchPage = useCallback(async (page, size) => {
    return taskService.fetchTasksPage(page, size);
  }, []);

  const { items: data, LoadMoreSpinner } = useServerInfiniteScroll(fetchPage, 50, [tasksResource]);

  const deleteTask = async () => {
    try {
      if (idToDelete) {
        await taskService.deleteTask(idToDelete);
        taskService.invalidateTasksCache();
        setIdToDelete(null);
        refreshTasks();
        successToast("Task deleted successfully");
      } else {
        errorToast("Error: No task selected");
      }
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  const confirmDeleteTask = (id) => {
    setIdToDelete(id);
    setShowDelete(true);
  };

  // Function to get the priority badge color
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

  // Function to get the status badge color
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

  // Component for empty state
  const EmptyState = () => (
    <Card className="text-center shadow-sm py-5">
      <Card.Body>
        <div className="mb-4">
          <i
            className="bi bi-clipboard text-muted"
            style={{ fontSize: "2.5rem" }}
          ></i>
        </div>
        <Card.Title>{t('tasks.noTasks')}</Card.Title>
        <Card.Text className="text-muted">{t('tasks.createNewTask')}</Card.Text>
      </Card.Body>
    </Card>
  );

  // Filter data client-side for search
  const filteredData = searchTerm
    ? data.filter((task) =>
        task.nameOfTask.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  return !filteredData || filteredData.length === 0 ? (
    <EmptyState />
  ) : (
    <div className="task-list">
      {filteredData.map((task) => (
        <Card key={task.id} className="mb-3 shadow-sm task-card">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-center mb-2">
                  <h5
                    className="mb-0 me-2 text-truncate"
                    style={{ maxWidth: "calc(100% - 100px)" }}
                  >
                    {task.nameOfTask}
                  </h5>
                  <Badge
                    bg={getStatusBadgeVariant(task.state)}
                    className="ms-auto ms-md-2 flex-shrink-0"
                    pill
                  >
                    {task.state}
                  </Badge>
                </div>
                <Card.Text className="text-muted mb-3 text-truncate">
                  {task.descriptionOfTask ? (
                    task.descriptionOfTask
                  ) : (
                    <span className="text-muted fst-italic">
                      {t('tasks.noDescription')}
                    </span>
                  )}
                </Card.Text>
                <div className="d-flex align-items-center">
                  <Badge
                    bg={getPriorityBadgeVariant(task.priority)}
                    className="me-2 px-3 py-2"
                  >
                    {task.priority}
                  </Badge>
                  <div className="d-flex d-md-none mt-2 ms-auto">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenTask(task.id)}
                      style={{ minWidth: "44px", minHeight: "44px" }}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditTask(task)}
                      style={{ minWidth: "44px", minHeight: "44px" }}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => confirmDeleteTask(task.id)}
                      style={{ minWidth: "44px", minHeight: "44px" }}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </Col>
              <Col md={4} className="d-none d-md-block">
                <div className="d-flex justify-content-end">
                  <Button
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() => handleOpenTask(task.id)}
                  >
                    <i className="bi bi-eye me-1"></i>
                    {t('tasks.view')}
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleEditTask(task)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    {t('tasks.edit')}
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => confirmDeleteTask(task.id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    {t('tasks.delete')}
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      <LoadMoreSpinner />

      {/* Modal de confirmación para eliminar */}
      <Modal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('tasks.confirmDeletion')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('tasks.deleteTaskConfirm')}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowDelete(false);
              setIdToDelete(null);
            }}
          >
            {t('tasks.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setShowDelete(false);
              deleteTask();
            }}
          >
            {t('tasks.deleteTask')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TasksList;
