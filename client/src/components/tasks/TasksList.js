import { Col, Row, Card, Button, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import taskService from "../../services/taskService";
import { useNotification } from "../common/Noty";
const TasksList = ({ tasksResource, handleOpenTask,refreshTasks }) => {
    
  const [data, setData] = useState(tasksResource.read());
  const [showDelete, setShowDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const { addNotification } = useNotification();
  useEffect(() => {
    setData(tasksResource.read());
  }, [tasksResource]);

  const deleteTask = async () => {
    try {
      if(idToDelete){
      await taskService.deleteTask(idToDelete);
      taskService.invalidateTasksCache();
      setIdToDelete(null);
      refreshTasks();
      addNotification("Task deleted succesfully", "success");
      }else{
        addNotification("Error: No task selected", "danger", 5000);
      }
    } catch (error) {
      addNotification("Error: " + error.message, "danger", 5000);
    }
  };
  const confirmDeleteTask = (id) => {
    setIdToDelete(id);
    setShowDelete(true);
  }

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
                <Card.Text>{card.descriptionOfTask}</Card.Text>
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
                    className="me-2"
                    onClick={() => handleOpenTask(card.id)}
                  >
                    Open
                  </Button>
                  <Button variant="primary" className="me-2">
                    Edit
                  </Button>
                  <Button onClick={() => {confirmDeleteTask(card.id);}}variant="danger" className="me-2">
                    Delete
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
          <Button variant="secondary" onClick={() => {setShowDelete(false); setIdToDelete(null);}}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {setShowDelete(false); deleteTask(); }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Card.Body>
  );
};

export default TasksList;
