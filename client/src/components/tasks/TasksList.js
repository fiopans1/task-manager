import { Col, Row, Card, Button, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import taskService from "../../services/taskService";
import { successToast, errorToast } from "../common/Noty";

const TasksList = ({
  tasksResource,
  handleOpenTask,
  handleEditTask,
  refreshTasks,
}) => {
  const [data, setData] = useState(tasksResource.read());
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  useEffect(() => {
    setData(tasksResource.read());
  }, [tasksResource]);

  const deleteTask = async () => {
    try {
      if (idToDelete) {
        await taskService.deleteTask(idToDelete);
        taskService.invalidateTasksCache();
        setIdToDelete(null);
        refreshTasks();
        successToast("Task deleted succesfully");
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

  return !data || data.length === 0 ? (
    <Card.Body className="text-center py-5">
      <Card.Title>No tasks avaliable</Card.Title>
      <Card.Text>Please create a new task</Card.Text>
    </Card.Body>
  ) : (
    <Card.Body>
      {data?.map((card) => (
        <Card key={card.id}>
          <Card.Body>
            <Row>
              <Col md={8}>
                <Card.Title>{card.nameOfTask}</Card.Title>
                <Card.Text>
                  {card.descriptionOfTask.substring(0, 100)}{" "}
                  {card.descriptionOfTask.length > 100 && "....."}
                </Card.Text>
              </Col>
              <Col md={2}>
                <Row className="mb-2">
                  <Card.Subtitle>Priority:</Card.Subtitle>
                  <Card.Text className="text-truncate">
                    {card.priority}
                  </Card.Text>
                </Row>
                <Row className="mb-2">
                  {" "}
                  <Card.Subtitle>Status:</Card.Subtitle>
                  <Card.Text>{card.state}</Card.Text>
                </Row>
              </Col>
              <Col md={2}>
                <Row>
                  <Button
                    variant="success"
                    className="me-2 mt-1"
                    onClick={() => handleOpenTask(card.id)}
                  >
                    <i className="bi bi-eye"></i>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleEditTask(card)}
                    className="me-2 mt-1"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    onClick={() => {
                      confirmDeleteTask(card.id);
                    }}
                    variant="danger"
                    className="me-2 mt-1"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Body closeButton>
          Are you sure you want to delete this task?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
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
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Card.Body>
  );
};

export default TasksList;
