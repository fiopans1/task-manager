import React, { useEffect, useState } from "react";
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
import listService from "../../../services/listService";
import { successToast, errorToast } from "../../common/Noty";
const ListDetails = ({listId}) => {
  const navigate = useNavigate();

  const [list, setList] = useState({
    id: 1,
    nameOfList: "<None>",
    descriptionOfList: "<None>",
    color : "<None>",
    user : "<None>",
    listElements: [],
  });
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refreshList = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  }
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
    navigate('..')
  };

  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.isCompleted).length;
  const progressPercentage =
    totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // Agregar una nueva tarea. (llamada a endpoint)
  const handleSubmitAddTodo = async () => {
    if (newTodoTitle.trim() !== "") {
      await listService.createElementList(listId, {
        name: newTodoTitle,
        description: newTodoDescription,
        isCompleted: false,
      });
      refreshList();
      setNewTodoTitle("");
      setNewTodoDescription("");
      setShowAddModal(false);
      successToast("Task added successfully");
    }
  };

  // Marcar como completada/pendiente
  const toggleTodoStatus = (id) => { //llamada al endpoint
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.isCompleted } : todo
      )
    );
  };

  // Eliminar una tarea
  const handleDeleteTodo = async (id) => { //llamanda al endpoint
    await listService.deleteElementList(id);
    refreshList();
    successToast("Task deleted successfully");
  };

  // Abrir modal de edición
  const openEditModal = (todo) => {
    setEditTodo(todo);
    setShowEditModal(true);
  };

  // Guardar cambios de edición
  const handleUpdateTodo =async () => { //llamada al endpoint
    if (editTodo && editTodo.name.trim() !== "") {
      await listService.updateElementList(editTodo.id, editTodo);
      refreshList();
      setShowEditModal(false);
      successToast("Task updated successfully");
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
              <h2>{list.nameOfList}</h2>
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
            {!todos ||todos.length === 0 ? (
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
                          style={{ color: todo.isCompleted ? "green" : "gray" }}
                        >
                          {todo.isCompleted ? (
                            <CheckCircle size={22} />
                          ) : (
                            <Circle size={22} />
                          )}
                        </Button>
                        <div>
                          <h5
                            className={
                              todo.isCompleted
                                ? "text-decoration-line-through text-muted"
                                : ""
                            }
                          >
                            {todo.name}
                          </h5>
                          {todo.description && (
                            <p
                              className={`mb-0 small ${
                                todo.isCompleted ? "text-muted" : ""
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
                          disabled={todo.isCompleted}
                        >
                          <PencilSquare size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
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
          <Button variant="primary" onClick={handleSubmitAddTodo}>
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
                  value={editTodo.name}
                  onChange={(e) =>
                    setEditTodo({ ...editTodo, name: e.target.value })
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
