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
} from "react-bootstrap";
import {
  ArrowLeft,
  PlusCircle,
  Trash,
  PencilSquare,
  CheckCircle,
  Circle,
  List,
  ClipboardCheck,
  FileText,
  Trophy,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import listService from "../../../services/listService";
import { successToast, errorToast } from "../../common/Noty";

const ListDetails = ({ listId }) => {
  const navigate = useNavigate();

  const [list, setList] = useState({
    id: 1,
    nameOfList: "<None>",
    descriptionOfList: "<None>",
    color: "<None>",
    user: "<None>",
    listElements: [],
  });
  const [showMore, setShowMore] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshList = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedList = await listService.getElementsList(listId);
        setList(fetchedList);
        setTodos(fetchedList.listElements);
      } catch (error) {
        errorToast("Error when try to load the List details: " + error.message);
      }
    };

    fetchData();
  }, [listId, refreshKey]);

  const handleBack = () => {
    navigate("..");
  };

  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const progressPercentage =
    totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // Agregar una nueva tarea. (llamada a endpoint)
  const handleSubmitAddTodo = async () => {
    try {
      if (newTodoTitle.trim() !== "") {
        await listService.createElementList(listId, {
          name: newTodoTitle,
          description: newTodoDescription,
          completed: false,
        });
        refreshList();
        setNewTodoTitle("");
        setNewTodoDescription("");
        setShowAddModal(false);
        successToast("Task added successfully");
      }
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  // Marcar como completada/pendiente
  const handleTodoStatus = async (todoToEdit) => {
    try {
      const updatedTodo = {
        ...todoToEdit,
        completed: !todoToEdit.completed,
      };
      await listService.updateElementList(updatedTodo.id, updatedTodo);
      refreshList();
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  // Eliminar una tarea
  const handleDeleteTodo = async (id) => {
    try {
      await listService.deleteElementList(id);
      refreshList();
      successToast("Task deleted successfully");
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  // Abrir modal de edición
  const openEditModal = (todo) => {
    setEditTodo(todo);
    setShowEditModal(true);
  };

  // Guardar cambios de edición
  const handleUpdateTodo = async () => {
    try {
      if (editTodo) {
        await listService.updateElementList(editTodo.id, editTodo);
        refreshList();
        setShowEditModal(false);
        successToast("Task updated successfully");
      }
      setEditTodo(null);
    } catch (error) {
      errorToast("Error: " + error.message);
    }
  };

  return (
    <Container fluid className="my-4">
      {/* Header Section */}
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
                color: "#6c757d",
              }}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1
                className="mb-1"
                style={{
                  fontWeight: "700",
                  color: "#2c3e50",
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
              {completedTodos}/{totalTodos} Done
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
                className="border-0 bg-light h-100"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center py-3">
                  <List size={24} className="text-primary mb-2" />
                  <h6 className="mb-1 text-muted">Total Tasks</h6>
                  <h4 style={{ fontWeight: "600", color: "#2c3e50" }}>
                    {totalTodos}
                  </h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card
                className="border-0 bg-light h-100"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center py-3">
                  <CheckCircle size={24} className="text-success mb-2" />
                  <h6 className="mb-1 text-muted">Completed</h6>
                  <h4 style={{ fontWeight: "600", color: "#2c3e50" }}>
                    {completedTodos}
                  </h4>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-3">
              <Card
                className="border-0 bg-light h-100"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center py-3">
                  <Trophy size={24} className="text-warning mb-2" />
                  <h6 className="mb-1 text-muted">Progress</h6>
                  <h4 style={{ fontWeight: "600", color: "#2c3e50" }}>
                    {Math.round(progressPercentage)}%
                  </h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Descripción mejorada */}
          <Card
            className="border-0 shadow-sm mb-4"
            style={{
              borderRadius: "15px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
            }}
          >
            <Card.Body className="p-4">
              <Stack direction="horizontal" gap={2} className="mb-3">
                <FileText size={20} className="text-primary" />
                <h5
                  className="mb-0"
                  style={{ fontWeight: "600", color: "#2c3e50" }}
                >
                  Description
                </h5>
              </Stack>

              {list.descriptionOfList && list.descriptionOfList !== "<None>" ? (
                list.descriptionOfList.length < 100 ? (
                  <p
                    className="mb-0"
                    style={{ lineHeight: "1.6", color: "#495057" }}
                  >
                    {list.descriptionOfList}
                  </p>
                ) : (
                  <>
                    <p
                      className="mb-2"
                      style={{ lineHeight: "1.6", color: "#495057" }}
                    >
                      {showMore
                        ? list.descriptionOfList
                        : `${list.descriptionOfList.substring(0, 100)}...`}
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

          {/* Add Task Section */}
          <Card
            className="border-0 shadow-sm mb-4"
            style={{
              borderRadius: "15px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
            }}
          >
            <Card.Body className="p-3">
              <Button
                variant="primary"
                className="w-100 d-flex align-items-center justify-content-center py-3"
                onClick={() => setShowAddModal(true)}
                style={{
                  borderRadius: "12px",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #007bff, #0056b3)",
                }}
              >
                <PlusCircle className="me-2" size={20} />
                Add New Task
              </Button>
            </Card.Body>
          </Card>

          {/* Tasks List */}
          <Card
            className="border-0 shadow-sm"
            style={{
              borderRadius: "15px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              maxHeight: "60vh",
              overflow: "auto",
            }}
          >
            <Card.Body className="p-4">
              <Stack direction="horizontal" gap={2} className="mb-3">
                <FileText size={20} className="text-primary" />
                <h5
                  className="mb-0"
                  style={{ fontWeight: "600", color: "#2c3e50" }}
                >
                  Task List
                </h5>
              </Stack>

              {!todos || todos.length === 0 ? (
                <div className="text-center py-5">
                  <List size={48} className="text-muted mb-3" />
                  <h5 className="text-muted mb-2">No tasks in this list</h5>
                  <p className="text-muted mb-3">
                    Create your first task to get started
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowAddModal(true)}
                    style={{ borderRadius: "10px", fontWeight: "600" }}
                  >
                    <PlusCircle className="me-2" size={16} />
                    Add the first task
                  </Button>
                </div>
              ) : (
                <div className="task-list">
                  {todos.map((todo, index) => (
                    <Card
                      key={todo.id}
                      className={`border-0 shadow-sm mb-3 ${
                        todo.completed ? "bg-light" : "bg-white"
                      }`}
                      style={{
                        borderRadius: "12px",
                        border: todo.completed
                          ? "1px solid #dee2e6"
                          : "1px solid #e9ecef",
                      }}
                    >
                      <Card.Body className="p-3">
                        <Stack
                          direction="horizontal"
                          className="justify-content-between align-items-start"
                        >
                          <Stack
                            direction="horizontal"
                            gap={3}
                            className="align-items-start"
                            style={{ width: "80%" }}
                          >
                            <Button
                              variant="link"
                              className="p-0"
                              onClick={() => handleTodoStatus(todo)}
                              style={{
                                color: todo.completed ? "#28a745" : "#6c757d",
                                minWidth: "24px",
                              }}
                            >
                              {todo.completed ? (
                                <CheckCircle size={24} />
                              ) : (
                                <Circle size={24} />
                              )}
                            </Button>
                            <div style={{ flex: 1 }}>
                              <h6
                                className={`mb-1 ${
                                  todo.completed
                                    ? "text-decoration-line-through text-muted"
                                    : ""
                                }`}
                                style={{
                                  fontWeight: todo.completed ? "400" : "600",
                                  color: todo.completed ? "#6c757d" : "#2c3e50",
                                }}
                              >
                                {todo.name}
                              </h6>
                              {todo.description && (
                                <p
                                  className={`mb-0 small ${
                                    todo.completed
                                      ? "text-muted"
                                      : "text-secondary"
                                  }`}
                                  style={{ lineHeight: "1.4" }}
                                >
                                  {todo.description}
                                </p>
                              )}
                            </div>
                          </Stack>
                          <Stack direction="horizontal" gap={1}>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => openEditModal(todo)}
                              disabled={todo.completed}
                              style={{ borderRadius: "8px" }}
                            >
                              <PencilSquare size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteTodo(todo.id)}
                              style={{ borderRadius: "8px" }}
                            >
                              <Trash size={14} />
                            </Button>
                          </Stack>
                        </Stack>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Modal para agregar tarea */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton style={{ borderRadius: "15px 15px 0 0" }}>
          <Modal.Title style={{ fontWeight: "600", color: "#2c3e50" }}>
            <PlusCircle className="me-2" size={20} />
            Add New Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                Title *
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                autoFocus
                style={{ borderRadius: "10px", border: "1px solid #ced4da" }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                Description (optional)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter task description"
                value={newTodoDescription}
                onChange={(e) => setNewTodoDescription(e.target.value)}
                style={{ borderRadius: "10px", border: "1px solid #ced4da" }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderRadius: "0 0 15px 15px" }}>
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(false)}
            style={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitAddTodo}
            style={{
              borderRadius: "8px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #007bff, #0056b3)",
            }}
          >
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar tarea */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ borderRadius: "15px 15px 0 0" }}>
          <Modal.Title style={{ fontWeight: "600", color: "#2c3e50" }}>
            <PencilSquare className="me-2" size={20} />
            Edit Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editTodo && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                  Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editTodo.name}
                  onChange={(e) =>
                    setEditTodo({ ...editTodo, name: e.target.value })
                  }
                  autoFocus
                  style={{ borderRadius: "10px", border: "1px solid #ced4da" }}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ fontWeight: "600", color: "#495057" }}>
                  Description (optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editTodo.description || ""}
                  onChange={(e) =>
                    setEditTodo({ ...editTodo, description: e.target.value })
                  }
                  style={{ borderRadius: "10px", border: "1px solid #ced4da" }}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderRadius: "0 0 15px 15px" }}>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            style={{ borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateTodo}
            style={{
              borderRadius: "8px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #007bff, #0056b3)",
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListDetails;
