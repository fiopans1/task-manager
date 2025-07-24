import { Col, Row, Card, Button, Modal, Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";

const TasksList = ({
  tasksResource,
  handleOpenTask,
  handleEditTask,
  refreshTasks,
  searchTerm,
}) => {
  const [data, setData] = useState(tasksResource.read());
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        var data = tasksResource.read();
        if (searchTerm) {
          data = data.filter((task) =>
            task.nameOfTask.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setData(data);
      } catch (error) {
        errorToast("Error fetching lists: " + error.message);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksResource]);

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

  // Función para obtener el color de la insignia de prioridad
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

  // Función para obtener el color de la insignia de estado
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

  // Componente para estado vacío
  const EmptyState = () => (
    <Card className="text-center shadow-sm py-5">
      <Card.Body>
        <div className="mb-4">
          <i
            className="bi bi-clipboard text-muted"
            style={{ fontSize: "2.5rem" }}
          ></i>
        </div>
        <Card.Title>No tasks available</Card.Title>
        <Card.Text className="text-muted">Please create a new task</Card.Text>
      </Card.Body>
    </Card>
  );

  return !data || data.length === 0 ? (
    <EmptyState />
  ) : (
    <div className="task-list">
      {data?.map((task) => (
        <Card key={task.id} className="mb-3 shadow-sm task-card">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-center mb-2">
                  <h5 className="mb-0 me-2">{task.nameOfTask}</h5>
                  <Badge
                    bg={getStatusBadgeVariant(task.state)}
                    className="ms-auto ms-md-2"
                    pill
                  >
                    {task.state}
                  </Badge>
                </div>
                <Card.Text className="text-muted mb-3">
                  {task.descriptionOfTask ? (
                    <>
                      {task.descriptionOfTask.substring(0, 100)}
                      {task.descriptionOfTask.length > 100 && "..."}
                    </>
                  ) : (
                    <span className="text-muted fst-italic">
                      No description
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
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditTask(task)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => confirmDeleteTask(task.id)}
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
                    View
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleEditTask(task)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => confirmDeleteTask(task.id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      {/* Modal de confirmación para eliminar */}
      <Modal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowDelete(false);
              setIdToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
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
