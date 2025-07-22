import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Button,
  ProgressBar,
  Stack,
} from "react-bootstrap";
import taskService from "../../../services/taskService";
import { errorToast } from "../../common/Noty";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar3,
  Clock,
  Person,
  Flag,
  FileText,
  CheckCircle
} from "react-bootstrap-icons";

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
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate("..");
  };
  
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

  // Función para determinar el color de la prioridad
  const getPriorityBadgeVariant = (priority) => {
    if (!priority || priority === "<None>") return "secondary";
    switch (priority.toLowerCase()) {
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

  // Función para obtener el progreso basado en el estado
  const getProgressPercentage = (status) => {
    if (!status || status === "<None>") return 0;
    switch (status.toLowerCase()) {
      case "completed":
        return 100;
      case "in_progress":
        return 50;
      case "new":
        return 0;
      default:
        return 0;
    }
  };

  // Formatear fechas para mostrar
  const formatDate = (dateString) => {
    if (!dateString || dateString === "<None>") return "<None>";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const progress = getProgressPercentage(task.state);

  return (
    <Container fluid className="my-4">
      <Row className="mb-4">
        <Col>
          <Stack direction="horizontal" gap={3} className="align-items-center">
            <Button
              variant="outline-light"
              size="lg"
              onClick={handleBack}
              className="rounded-circle p-2 shadow-sm"
              style={{ 
                backgroundColor: "#f8f9fa", 
                border: "2px solid #e9ecef",
                color: "#6c757d"
              }}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="mb-1" style={{ 
                fontWeight: "700", 
                color: "#2c3e50",
                fontSize: "2rem"
              }}>
                Task Overview
              </h1>
              <p className="text-muted mb-0">Complete task information and status</p>
            </div>
          </Stack>
        </Col>
      </Row>

      {/* Card principal con diseño moderno */}
      <Card className="border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
        {/* Header del card con gradiente */}
        <Card.Header 
          className="border-0 text-white p-4"
          style={{
            background: `linear-gradient(135deg, ${
              task.state?.toLowerCase() === 'completed' ? '#28a745, #20c997' :
              task.state?.toLowerCase() === 'in_progress' ? '#007bff, #6f42c1' :
              task.state?.toLowerCase() === 'new' ? '#ffc107, #fd7e14' :
              //task.state?.toLowerCase() === 'cancelled' ? '#dc3545, #e83e8c' :
              '#6c757d, #495057'
            })`,
          }}
        >
          <Stack direction="horizontal" className="justify-content-between align-items-center">
            <div>
              <h3 className="mb-1" style={{ fontWeight: "600" }}>
                {task.nameOfTask || "Untitled Task"}
              </h3>
              <Stack direction="horizontal" gap={2}>
                <CheckCircle size={16} />
                <small>Task ID: #{task.id}</small>
              </Stack>
            </div>
            <Badge 
              bg="light" 
              text="dark"
              className="px-4 py-2 rounded-pill"
              style={{ fontSize: "0.9rem", fontWeight: "600" }}
            >
              {task.state || "No Status"}
            </Badge>
          </Stack>
          
          {/* Barra de progreso */}
          <div className="mt-3">
            <small className="text-white-50">Progress</small>
            <ProgressBar 
              now={progress} 
              className="mt-1"
              style={{ height: "8px", borderRadius: "4px" }}
              variant={progress === 100 ? "light" : "warning"}
            />
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Badges informativos mejorados */}
          <Row className="mb-4">
            <Col>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                <Badge 
                  bg={getPriorityBadgeVariant(task.priority)}
                  className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  <Flag size={14} />
                  {task.priority || "None"}
                </Badge>

                <Badge
                  bg={task.isEvent ? "info" : "secondary"}
                  className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  <Calendar3 size={14} />
                  {task.isEvent ? "Event" : "Task"}
                </Badge>

                {task.user && task.user !== "<None>" && (
                  <Badge 
                    bg="dark" 
                    className="px-3 py-2 rounded-pill d-flex align-items-center gap-1"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <Person size={14} />
                    {task.user}
                  </Badge>
                )}
              </Stack>
            </Col>
          </Row>

          {/* Información de fechas con cards */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="border-0 bg-light h-100" style={{ borderRadius: "15px" }}>
                <Card.Body className="text-center py-3">
                  <Calendar3 size={24} className="text-primary mb-2" />
                  <h6 className="mb-1 text-muted">Created</h6>
                  <small style={{ fontWeight: "600" }}>
                    {formatDate(task.creationDate)}
                  </small>
                </Card.Body>
              </Card>
            </Col>

            {task.isEvent && (
              <>
                <Col md={4} className="mb-3">
                  <Card className="border-0 bg-light h-100" style={{ borderRadius: "15px" }}>
                    <Card.Body className="text-center py-3">
                      <Clock size={24} className="text-success mb-2" />
                      <h6 className="mb-1 text-muted">Start Date</h6>
                      <small style={{ fontWeight: "600" }}>
                        {formatDate(task.startDate)}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card className="border-0 bg-light h-100" style={{ borderRadius: "15px" }}>
                    <Card.Body className="text-center py-3">
                      <Clock size={24} className="text-danger mb-2" />
                      <h6 className="mb-1 text-muted">End Date</h6>
                      <small style={{ fontWeight: "600" }}>
                        {formatDate(task.endDate)}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              </>
            )}
          </Row>

          {/* Descripción mejorada */}
          <Card 
            className="border-0 shadow-sm" 
            style={{ 
              borderRadius: "15px", 
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef"
            }}
          >
            <Card.Body className="p-4">
              <Stack direction="horizontal" gap={2} className="mb-3">
                <FileText size={20} className="text-primary" />
                <h5 className="mb-0" style={{ fontWeight: "600", color: "#2c3e50" }}>
                  Description
                </h5>
              </Stack>
              
              {task.descriptionOfTask && task.descriptionOfTask !== "<None>" ? (
                task.descriptionOfTask.length < 100 ? (
                  <p className="mb-0" style={{ lineHeight: "1.6", color: "#495057" }}>
                    {task.descriptionOfTask}
                  </p>
                ) : (
                  <>
                    <p className="mb-2" style={{ lineHeight: "1.6", color: "#495057" }}>
                      {showMore
                        ? task.descriptionOfTask
                        : `${task.descriptionOfTask.substring(0, 100)}...`}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none fw-semibold"
                      onClick={() => setShowMore(!showMore)}
                      style={{ color: "#007bff" }}
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TaskDetailsTask;