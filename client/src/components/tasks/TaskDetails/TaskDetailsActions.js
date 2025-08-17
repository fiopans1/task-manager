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
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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





  
  //    Filtros

  useEffect(() => {
    let result = [...actions]; //TODO : Obtener los datos
    
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
  
  // Nueva accion
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
            Action History
          </h3>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            className="d-flex align-items-center"
            onClick={handleAddAction}
          >
            <i className="bi bi-plus-lg me-2"></i>
            New Action
          </Button>
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
            title={<><i className="bi bi-sort-down me-1"></i> {sortOrder === "newest" ? "Newest first" : "Oldest first"}</>}
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
                {searchTerm ? "No actions found with that search criteria." : "No actions have been recorded for this task yet."}
              </p>
              {searchTerm && (
                <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                  Clear search
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
                name="action"
                value={newAction.action}
                onChange={handleInputChange}
                placeholder="E.g: Priority update"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newAction.description}
                onChange={handleInputChange}
                placeholder="Describe the action performed in detail..."
                rows={4}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Action type</Form.Label>
              <Form.Select 
                name="type"
                value={newAction.type || "create"}
                onChange={handleInputChange}
              >
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="comment">Comment</option>
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
            disabled={!newAction.action.trim() || !newAction.description.trim()}
          >
            Save Action
          </Button>
        </Modal.Footer>
      </Modal>
      
    </Container>
  );
};

export default TaskDetailsActions;