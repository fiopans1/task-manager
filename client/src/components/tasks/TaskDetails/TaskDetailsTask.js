import React, { useEffect, useState } from "react";
import { 
  Container, 
  Card, 
  Row, 
  Col, 
  Badge, 
  Button, 
  ListGroup 
} from "react-bootstrap";
import taskService from "../../../services/taskService";
import { errorToast } from "../../common/Noty";

const TaskDetailsTask = ({ taskId }) => {
  const [showMore, setShowMore] = useState(false);
  const [task, setTask] = useState({
    id: 1,
    nameOfTask: "<None>",
    descriptionOfTask: "<None>",
    state: "<None>",
    user: "<None>",
    priority: "<None>",
    startDate: "<None>",
    endDate: "<None>",
    creationDate: "<None>",
    isEvent: false,
  });

  useEffect(() => {
    async function fetchTask() {
      try {
        const task = await taskService.getTaskById(taskId);
        setTask(task);
        console.log("get task");
      } catch (error) {
        errorToast("Error fetching data: " + error.message);
      }
    }
    fetchTask();
  }, [taskId]);

  // Función para determinar el color del estado
  const getStatusBadgeVariant = (status) => {
    if (!status || status === "<None>") return "secondary";
    
    switch(status.toLowerCase()) {
      case "completed":
        return "success";
      case "in progress":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "info";
    }
  };

  // Función para determinar el color de la prioridad
  const getPriorityBadgeVariant = (priority) => {
    if (!priority || priority === "<None>") return "secondary";
    
    switch(priority.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "info";
    }
  };

  // Formatear fechas para mostrar
  const formatDate = (dateString) => {
    if (!dateString || dateString === "<None>") return "<None>";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container fluid className="my-3">
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <Card.Title className="m-0 text-primary">Task Details</Card.Title>
          <Badge 
            bg={getStatusBadgeVariant(task.state)} 
            className="px-3 py-2"
          >
            {task.state || "No Status"}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-4">
            <Col md={12} lg={8}>
              <h3 className="h4 mb-3">{task.nameOfTask || "<No Name>"}</h3>
              
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <Badge bg={getPriorityBadgeVariant(task.priority)} className="px-3 py-2">
                  Priority: {task.priority || "None"}
                </Badge>
                
                <Badge bg={task.isEvent ? "info" : "secondary"} className="px-3 py-2">
                  Type of Task: {task.isEvent ? "Event" : "Single Task"}
                </Badge>
                
                {task.user && task.user !== "<None>" && (
                  <Badge bg="dark" className="px-3 py-2">
                    Assigned to: {task.user}
                  </Badge>
                )}
              </div>
            </Col>
          </Row>

          <ListGroup variant="flush" className="mb-4">
            <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
              <span className="fw-bold text-secondary">Creation Date:</span>
              <span>{formatDate(task.creationDate)}</span>
            </ListGroup.Item>
            
            {task.isEvent && (
              <>
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold text-secondary">Start Date:</span>
                  <span>{formatDate(task.startDate)}</span>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold text-secondary">End Date:</span>
                  <span>{formatDate(task.endDate)}</span>
                </ListGroup.Item>
              </>
            )}
          </ListGroup>

          <Card className="bg-light border-0 p-3">
            <h5 className="mb-3">Description</h5>
            {task.descriptionOfTask && task.descriptionOfTask !== "<None>" ? (
              task.descriptionOfTask.length < 100 ? (
                <p className="mb-0">{task.descriptionOfTask}</p>
              ) : (
                <>
                  <p className="mb-1">
                    {showMore
                      ? task.descriptionOfTask
                      : `${task.descriptionOfTask.substring(0, 100)}...`}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={() => setShowMore(!showMore)}
                  >
                    {!showMore ? "Read More..." : "Read Less..."}
                  </Button>
                </>
              )
            ) : (
              <p className="text-muted mb-0">No description available</p>
            )}
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TaskDetailsTask;