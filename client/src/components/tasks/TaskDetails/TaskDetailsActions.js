import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  DropdownButton
} from "react-bootstrap";

const TaskDetailsActions = () => {
  const { taskId } = useParams();
  
  // Estados para el manejo de acciones
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [newAction, setNewAction] = useState({
    action: "",
    description: "",
    user: "CurrentUser", // Normalmente vendría de un contexto de autenticación
    timestamp: new Date()
  });
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" o "oldest"
  const [filteredActions, setFilteredActions] = useState([]);
  
  // Cargar datos iniciales
  useEffect(() => {
    // Simulamos una carga de datos
    setTimeout(() => {
      const initialActions = Array.from({ length: 15 }, (_, index) => ({
        id: index + 1,
        user: `user${index % 5 + 1}`,
        action: `Action ${index + 1}`,
        description: `This is a detailed description of action ${index + 1} related to task ${taskId}. It explains what was done and why.`,
        timestamp: new Date(Date.now() - index * 86400000), // Cada acción es un día anterior
        type: index % 3 === 0 ? "create" : index % 3 === 1 ? "update" : "comment"
      }));
      
      setActions(initialActions);
      setFilteredActions(initialActions);
      setLoading(false);
    }, 500);
  }, [taskId]);
  
  // Actualizar acciones filtradas cuando cambien los filtros o búsquedas
  useEffect(() => {
    let result = [...actions];
    
    // Aplicar búsqueda
    if (searchTerm) {
      result = result.filter(item => 
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar ordenamiento
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return b.timestamp - a.timestamp;
      } else {
        return a.timestamp - b.timestamp;
      }
    });
    
    setFilteredActions(result);
  }, [actions, searchTerm, sortOrder]);
  
  // Abrir modal para nueva acción
  const handleAddAction = () => {
    setShowModal(true);
  };
  
  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewAction({
      action: "",
      description: "",
      user: "CurrentUser",
      timestamp: new Date()
    });
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAction(prev => ({ ...prev, [name]: value }));
  };
  
  // Guardar nueva acción
  const handleSaveAction = () => {
    if (!newAction.action.trim() || !newAction.description.trim()) {
      return; // Validación básica
    }
    
    const actionToAdd = {
      id: actions.length > 0 ? Math.max(...actions.map(a => a.id)) + 1 : 1,
      ...newAction,
      timestamp: new Date(),
      type: "create" // Por defecto es una creación
    };
    
    setActions(prev => [actionToAdd, ...prev]);
    handleCloseModal();
  };
  
  // Función para formatear fechas
  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obtener estilo según el tipo de acción
  const getActionStyle = (type) => {
    switch(type) {
      case "create":
        return {
          badge: "success",
          icon: "bi bi-plus-circle-fill"
        };
      case "update":
        return {
          badge: "primary",
          icon: "bi bi-pencil-fill"
        };
      case "comment":
        return {
          badge: "info",
          icon: "bi bi-chat-left-text-fill"
        };
      default:
        return {
          badge: "secondary",
          icon: "bi bi-clipboard-data"
        };
    }
  };
  
  if (loading) {
    return (
      <Container fluid className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando historial de acciones...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container fluid>
        <Card className="border-danger mt-4">
          <Card.Body className="text-center text-danger">
            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
            <h5 className="mt-2">Error al cargar el historial</h5>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container fluid>
      <Row className="align-items-center my-4">
        <Col>
          <h3 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Historial de Acciones
          </h3>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            className="d-flex align-items-center"
            onClick={handleAddAction}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nueva Acción
          </Button>
        </Col>
      </Row>
      
      {/* Filtros y búsqueda */}
      <Row className="mb-3 align-items-center">
        <Col md={6} className="mb-2 mb-md-0">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <FormControl
              placeholder="Buscar acciones..."
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
            title={<><i className="bi bi-sort-down me-1"></i> {sortOrder === "newest" ? "Más recientes primero" : "Más antiguos primero"}</>}
            variant="outline-secondary"
          >
            <Dropdown.Item 
              active={sortOrder === "newest"}
              onClick={() => setSortOrder("newest")}
            >
              <i className="bi bi-sort-down me-2"></i>
              Más recientes primero
            </Dropdown.Item>
            <Dropdown.Item 
              active={sortOrder === "oldest"}
              onClick={() => setSortOrder("oldest")}
            >
              <i className="bi bi-sort-up me-2"></i>
              Más antiguos primero
            </Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>
      
      {/* Lista de acciones */}
      <div>
        {filteredActions.length === 0 ? (
          <Card className="text-center py-5 my-3">
            <Card.Body>
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <h5 className="mt-3">No hay acciones para mostrar</h5>
              <p className="text-muted">
                {searchTerm ? "No se encontraron acciones con ese criterio de búsqueda." : "Todavía no hay acciones registradas para esta tarea."}
              </p>
              {searchTerm && (
                <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                  Limpiar búsqueda
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          filteredActions.map((item) => {
            const style = getActionStyle(item.type);
            return (
              <Card key={item.id} className="mb-3 shadow-sm border-0">
                <Card.Header className="bg-white">
                  <Row className="align-items-center">
                    <Col>
                      <div className="d-flex align-items-center">
                        <Badge bg={style.badge} className="me-2 p-2">
                          <i className={style.icon}></i>
                        </Badge>
                        <Card.Title className="mb-0 fs-5">{item.action}</Card.Title>
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
                          {formatDate(item.timestamp)}
                        </small>
                      </div>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <Card.Text>{item.description}</Card.Text>
                </Card.Body>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Paginación (opcional) */}
      {filteredActions.length > 10 && (
        <div className="d-flex justify-content-center mt-4">
          <Button variant="outline-primary" size="sm">
            Cargar más acciones
          </Button>
        </div>
      )}
      
      {/* Modal para agregar nueva acción */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Acción
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título de la acción</Form.Label>
              <Form.Control
                type="text"
                name="action"
                value={newAction.action}
                onChange={handleInputChange}
                placeholder="Ej: Actualización de prioridad"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newAction.description}
                onChange={handleInputChange}
                placeholder="Describa detalladamente la acción realizada..."
                rows={4}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de acción</Form.Label>
              <Form.Select 
                name="type"
                value={newAction.type || "create"}
                onChange={handleInputChange}
              >
                <option value="create">Creación</option>
                <option value="update">Actualización</option>
                <option value="comment">Comentario</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveAction}
            disabled={!newAction.action.trim() || !newAction.description.trim()}
          >
            Guardar Acción
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* CSS adicional */}
      <style jsx>{`
        .action-history-list {
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 5px;
        }
        .action-history-list::-webkit-scrollbar {
          width: 6px;
        }
        .action-history-list::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 3px;
        }
      `}</style>
    </Container>
  );
};

export default TaskDetailsActions;