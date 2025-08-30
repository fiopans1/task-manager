import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Badge,
  InputGroup,
  FormControl,
  Dropdown,
  DropdownButton,
  Spinner,
  Alert,
} from "react-bootstrap";
import taskService from "../../../services/taskService";
import { successToast, errorToast } from "../../common/Noty";

const TaskDetailsActions = ({ taskId }) => {
  // Estados para el manejo de acciones
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [newAction, setNewAction] = useState({
    actionName: "",
    actionDescription: "",
    user: "CurrentUser",
    actionDate: new Date(),
    actionType: "COMMENT", // Valor por defecto
  });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filteredActions, setFilteredActions] = useState([]);

  // Función para cargar datos (SIN useCallback para evitar dependencia circular)
  const fetchData = async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);
    try {
      const initialActions = await taskService.getActionsTask(taskId);
      setActions(initialActions);
    } catch (error) {
      errorToast("Error loading actions: " + (error.message || error));
      setError(error.message || "Error loading actions");
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función pública para refrescar (esta sí puede usar useCallback)
  const refreshActions = useCallback(() => {
    fetchData();
  }, [taskId]);

  // Efecto para cargar datos iniciales - SOLO depende de taskId
  useEffect(() => {
    if (taskId) {
      fetchData();
    }
  }, [taskId]); // Solo taskId como dependencia

  // Efecto separado para filtros (sin llamadas al backend)
  useEffect(() => {
    let result = [...actions];

    // Aplicar búsqueda
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.actionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.actionDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.user?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      const dateA = new Date(a.actionDate);
      const dateB = new Date(b.actionDate);

      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredActions(result);
  }, [actions, searchTerm, sortOrder]); // Solo depende de actions, searchTerm y sortOrder

  // Abrir modal para nueva acción
  const handleAddAction = () => {
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewAction({
      actionName: "",
      actionDescription: "",
      user: "CurrentUser",
      actionDate: new Date(),
      actionType: "COMMENT",
    });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAction((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar nueva acción
  const handleSaveAction = async () => {
    try {
      if (!newAction.actionName || !newAction.actionDescription) {
        errorToast("Please fill in all required fields");
        return;
      }

      const actionToAdd = {
        ...newAction,
        actionDate: new Date().toISOString(),
      };

      await taskService.createActionTask(taskId, actionToAdd);

      // Refrescar los datos después de crear
      await fetchData();

      successToast("Action saved successfully");
      handleCloseModal();
    } catch (error) {
      console.error("Error saving action:", error);
      errorToast("Error saving action: " + (error.message || error));
    }
  };

  // Función para formatear fechas
  const formatDate = (actionDate) => {
    if (!actionDate) return "Date not available";

    try {
      return new Date(actionDate).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Obtener estilo según el tipo de acción
  const getActionStyle = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case "create":
        return {
          badge: "success",
          icon: "bi bi-plus-circle-fill",
        };
      case "update":
        return {
          badge: "primary",
          icon: "bi bi-pencil-fill",
        };
      case "COMMENT":
        return {
          badge: "info",
          icon: "bi bi-chat-left-text-fill",
        };
      default:
        return {
          badge: "secondary",
          icon: "bi bi-clipboard-data",
        };
    }
  };

  if (loading) {
    return (
      <Container fluid className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading action history...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Error loading history
          </Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchData}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="align-items-center my-4">
        <Col>
          <h3 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Action History
          </h3>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center px-3"
              onClick={fetchData}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center px-3"
              onClick={handleAddAction}
            >
              <i className="bi bi-plus-lg me-1"></i>
              New Action
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters and search */}
      <Row className="mb-3 align-items-center">
        <Col md={6} className="mb-2 mb-md-0">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <FormControl
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm("")}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex justify-content-md-end">
          <DropdownButton
            id="dropdown-sort"
            title={
              <>
                <i className="bi bi-sort-down me-1"></i>{" "}
                {sortOrder === "newest" ? "Newest first" : "Oldest first"}
              </>
            }
            variant="outline-secondary"
          >
            <Dropdown.Item
              active={sortOrder === "newest"}
              onClick={() => setSortOrder("newest")}
            >
              <i className="bi bi-sort-down me-2"></i>
              Newest first
            </Dropdown.Item>
            <Dropdown.Item
              active={sortOrder === "oldest"}
              onClick={() => setSortOrder("oldest")}
            >
              <i className="bi bi-sort-up me-2"></i>
              Oldest first
            </Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>

      {/* Action list */}
      <div>
        {filteredActions.length === 0 ? (
          <Card className="text-center py-5 my-3">
            <Card.Body>
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <h5 className="mt-3">No actions for this task</h5>
              <p className="text-muted">
                {searchTerm
                  ? "No actions found with that search criteria."
                  : "No actions have been recorded for this task yet."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          filteredActions.map((item) => {
            const style = getActionStyle(item.actionType);
            return (
              <Card key={item.id} className="mb-3 shadow-sm border-0">
                <Card.Header className="bg-white">
                  <Row className="align-items-center">
                    <Col>
                      <div className="d-flex align-items-center">
                        <Badge bg={style.badge} className="me-2 p-2">
                          <i className={style.icon}></i>
                        </Badge>
                        <Card.Title className="mb-0 fs-5">
                          {item.actionName}
                        </Card.Title>
                      </div>
                    </Col>
                    <Col xs="auto">
                      <div className="d-flex align-items-center">
                        <div className="me-3 text-nowrap">
                          <Badge bg="light" text="dark" className="border">
                            <i className="bi bi-person-fill me-1"></i>
                            {item.user}
                          </Badge>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-calendar-event me-1"></i>
                          {formatDate(item.actionDate)}
                        </small>
                      </div>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <Card.Text>{item.actionDescription}</Card.Text>
                </Card.Body>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal for adding new action */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            New Action
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Action title</Form.Label>
              <Form.Control
                type="text"
                name="actionName"
                value={newAction.actionName}
                onChange={handleInputChange}
                placeholder="E.g: Priority update"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="actionDescription"
                value={newAction.actionDescription}
                onChange={handleInputChange}
                placeholder="Describe the action performed in detail..."
                rows={4}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Action type</Form.Label>
              <Form.Select
                name="actionType"
                value={newAction.actionType}
                onChange={handleInputChange}
              >
                {/* <option value="create">Create</option>
                <option value="update">Update</option> */}
                <option value="COMMENT">COMMENT</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAction}
            disabled={!newAction.actionName || !newAction.actionDescription}
          >
            Save Action
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Exportar también la función de refresh si necesitas acceso externo
export default TaskDetailsActions;
