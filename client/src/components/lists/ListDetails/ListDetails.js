import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Modal,
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
                {completedTodos} of {totalTodos} completed Tasks
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
                Add New Task
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lista de tareas */}
      <Row className="overflow-auto" style={{ maxHeight: "70vh" }}>
        <Col>
          <ListGroup className="todo-list">
            {!todos || todos.length === 0 ? (
              <Card className="text-center py-5 text-muted">
                <Card.Body>
                  <p>No tasks in this list</p>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <PlusCircle className="me-2" size={16} />
                    Add the first task
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
                          onClick={() => handleTodoStatus(todo)}
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
                            {todo.name}
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
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Escribe el título de la tarea"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description (optional)</Form.Label>
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
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAddTodo}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar tarea */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editTodo && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
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
                <Form.Label>Description (optional)</Form.Label>
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
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateTodo}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListDetails;
