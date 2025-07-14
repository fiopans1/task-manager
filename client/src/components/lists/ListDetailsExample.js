import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Badge,
  Modal,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import {
  ArrowLeft,
  PlusCircle,
  Trash,
  PencilSquare,
  CheckCircle,
  Circle,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const ListDetails = () => {
  const navigate = useNavigate();
  // Datos de ejemplo incluidos en el componente
  const exampleList = {
    id: 1,
    title: "Proyecto App Móvil",
    description: "Tareas para el desarrollo de la aplicación móvil",
    color: "primary",
  };

  const exampleTodos = [
    {
      id: 101,
      title: "Diseñar wireframes",
      description: "Crear wireframes para todas las pantallas principales",
      completed: true,
    },
    {
      id: 102,
      title: "Reunión con el cliente",
      description: "Discutir los requisitos y alcance del proyecto a las 15:00",
      completed: false,
    },
    {
      id: 103,
      title: "Configurar entorno de desarrollo",
      description: "Instalar dependencias y configurar el proyecto base",
      completed: false,
    },
    {
      id: 104,
      title: "Investigar APIs necesarias",
      description: "Buscar documentación sobre las APIs que se integrarán",
      completed: false,
    },
    {
      id: 105,
      title: "Reunión con el cliente",
      description: "Discutir los requisitos y alcance del proyecto a las 15:00",
      completed: false,
    },
    {
      id: 106,
      title: "Reunión con el cliente",
      description: "Discutir los requisitos y alcance del proyecto a las 15:00",
      completed: false,
    },
    {
      id: 107,
      title: "Reunión con el cliente",
      description: "Discutir los requisitos y alcance del proyecto a las 15:00",
      completed: false,
    },
  ];

  const [list, setList] = useState(exampleList);
  const [todos, setTodos] = useState(exampleTodos);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Simulación de función para volver atrás (en una app real, esto sería una navegación)
  const handleBack = () => {
    navigate('..')
  };

  // Contadores para la barra de progreso
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const progressPercentage =
    totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // Agregar una nueva tarea
  const handleAddTodo = () => {
    if (newTodoTitle.trim() !== "") {
      const newTodo = {
        id: Date.now(),
        title: newTodoTitle,
        description: newTodoDescription,
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setNewTodoTitle("");
      setNewTodoDescription("");
      setShowAddModal(false);
    }
  };

  // Marcar como completada/pendiente
  const toggleTodoStatus = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Eliminar una tarea
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Abrir modal de edición
  const openEditModal = (todo) => {
    setEditTodo(todo);
    setShowEditModal(true);
  };

  // Guardar cambios de edición
  const handleUpdateTodo = () => {
    if (editTodo && editTodo.title.trim() !== "") {
      setTodos(
        todos.map((todo) => (todo.id === editTodo.id ? editTodo : todo))
      );
      setShowEditModal(false);
    }
  };

  return (
    <Container fluid className="py-3">
      {/* Cabecera */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={handleBack}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2>{list.title}</h2>
              <div className="text-muted small">
                {completedTodos} de {totalTodos} tareas completadas
              </div>

              {/* Barra de progreso */}
              <div className="progress mt-2" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${progressPercentage}%` }}
                  aria-valuenow={progressPercentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Botón para agregar nueva tarea */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Button
                variant="primary"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={() => setShowAddModal(true)}
              >
                <PlusCircle className="me-2" size={20} />
                Agregar Nueva Tarea
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lista de tareas */}
      <Row className="overflow-auto" style={{ maxHeight: "70vh" }}>
        <Col>
          <ListGroup className="todo-list">
            {todos.length === 0 ? (
              <Card className="text-center py-5 text-muted">
                <Card.Body>
                  <p>No hay tareas en esta lista</p>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <PlusCircle className="me-2" size={16} />
                    Agregar la primera tarea
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              todos.map((todo) => (
                <Card key={todo.id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div
                        className="d-flex align-items-start"
                        style={{ width: "80%" }}
                      >
                        <Button
                          variant="link"
                          className="p-0 me-2"
                          onClick={() => toggleTodoStatus(todo.id)}
                          style={{ color: todo.completed ? "green" : "gray" }}
                        >
                          {todo.completed ? (
                            <CheckCircle size={22} />
                          ) : (
                            <Circle size={22} />
                          )}
                        </Button>
                        <div>
                          <h5
                            className={
                              todo.completed
                                ? "text-decoration-line-through text-muted"
                                : ""
                            }
                          >
                            {todo.title}
                          </h5>
                          {todo.description && (
                            <p
                              className={`mb-0 small ${
                                todo.completed ? "text-muted" : ""
                              }`}
                            >
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(todo)}
                          disabled={todo.completed}
                        >
                          <PencilSquare size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </ListGroup>
        </Col>
      </Row>

      {/* Modal para agregar tarea */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nueva Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Escribe el título de la tarea"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descripción (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Escribe una descripción"
                value={newTodoDescription}
                onChange={(e) => setNewTodoDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddTodo}>
            Agregar Tarea
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar tarea */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editTodo && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  value={editTodo.title}
                  onChange={(e) =>
                    setEditTodo({ ...editTodo, title: e.target.value })
                  }
                  autoFocus
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Descripción (opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editTodo.description || ""}
                  onChange={(e) =>
                    setEditTodo({ ...editTodo, description: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateTodo}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListDetails;
