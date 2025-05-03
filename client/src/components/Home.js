import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
} from "react-bootstrap";
import {
  JournalBookmark,
  InfoCircle,
  StarFill,
  Diagram3,
  Tools,
  Lightning,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  // Datos para las funcionalidades destacadas
  const features = [
    {
      title: "Gestión de tareas intuitiva",
      description:
        "Organiza tus tareas con un sistema de prioridades, estados y asignaciones fácil de usar.",
      icon: <Diagram3 className="text-primary" size={24} />,
    },
    {
      title: "Calendario integrado",
      description:
        "Visualiza fechas límite, reuniones y eventos en un calendario completo.",
      icon: <JournalBookmark className="text-success" size={24} />,
    },
    {
      title: "Seguimiento de tiempo",
      description:
        "Registra el tiempo dedicado a cada tarea para mejorar la productividad.",
      icon: <Tools className="text-warning" size={24} />,
    },
  ];

  // Datos para las nuevas funcionalidades
  const newFeatures = [
    {
      title: "Crea tus tareas",
      description: "Crea tareas fácilmente y asígnales un estado y prioridad.",
      badge: "Nuevo",
    },
    {
      title: "Conecta las tareas con el caliendario",
      description:
        "Sincroniza tus tareas con el calendario para una mejor planificación.",
      badge: "Nuevo",
    },
    {
      title: "Crea tus propias listas",
      description:
        "Organiza tus actividades en listas personalizadas para una mejor gestión.",
      badge: "Nuevo",
    },
  ];

  // Enlaces a documentación
  const documentation = [
    { title: "Guía de inicio rápido", link: "#" },
    { title: "Manual del usuario", link: "#" },
    { title: "API para desarrolladores", link: "#" },
    { title: "Preguntas frecuentes", link: "#" },
  ];

  return (
    <Container
      fluid
      className="py-4 px- overflow-auto"
      style={{ height: "100vh" }}
    >
      {/* Banner de bienvenida */}
      <Row className="mb-4">
        <Col>
          <Card className="bg-primary text-white shadow">
            <Card.Body className="py-5">
              <Row>
                <Col>
                  <h1 className="display-5 fw-bold mb-2">
                    Bienvenido a TaskManager
                  </h1>
                  <p className="lead mb-4">
                    Tu plataforma integral para gestionar proyectos, tareas y
                    equipos de trabajo de manera eficiente.
                  </p>
                  <Button variant="light" size="lg" onClick={() => navigate("/home/tasks")}>
                    <Lightning className="me-2" />
                    Comenzar
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Características destacadas */}
      <Row className="mb-4">
        <Col xs={12}>
          <h2 className="border-bottom pb-2 mb-4">
            Características destacadas
          </h2>
        </Col>
        {features.map((feature, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 p-2 rounded-circle bg-light">
                    {feature.icon}
                  </div>
                  <h4 className="mb-0">{feature.title}</h4>
                </div>
                <p className="text-muted">{feature.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Novedades y documentación */}
      <Row className="mb-4">
        {/* Nuevas funcionalidades */}
        <Col md={6} className="mb-4 mb-md-0">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h3 className="h5 mb-0">
                <StarFill className="text-warning me-2" />
                Novedades versión 1.0
              </h3>
            </Card.Header>
            <ListGroup variant="flush">
              {newFeatures.map((feature, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5 className="mb-0">{feature.title}</h5>
                    <Badge bg="primary">{feature.badge}</Badge>
                  </div>
                  <p className="text-muted mb-0">{feature.description}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Footer className="bg-white">
              <Button variant="outline-primary" size="sm">
                Ver todas las novedades
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        {/* Documentación */}
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white">
              <h3 className="h5 mb-0">
                <JournalBookmark className="text-primary me-2" />
                Documentación
              </h3>
            </Card.Header>
            <ListGroup variant="flush">
              {documentation.map((doc, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center p-0 border-bottom"
                >
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-body w-100 d-flex justify-content-between align-items-center p-3"
                  >
                    {doc.title}
                    <i className="bi bi-chevron-right"></i>
                  </a>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Footer className="bg-white">
              <Button variant="outline-primary" size="sm">
                Centro de ayuda
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Información de la aplicación */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h3 className="h5 mb-0">
                <InfoCircle className="text-primary me-2" />
                Acerca de TaskManager
              </h3>
            </Card.Header>
            <Card.Body>
              <p>
                TaskManager es una aplicación de gestión de tareas y proyectos
                diseñada para equipos de todos los tamaños. Nuestra plataforma
                combina la potencia de un sistema de seguimiento de problemas
                como Redmine con una interfaz moderna y fácil de usar.
              </p>
              <p>
                Con TaskManager puedes organizar tareas, asignar
                responsabilidades, establecer plazos, hacer seguimiento del
                tiempo y colaborar efectivamente con tu equipo.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row className="mb-5">
        <Col xs={12} sm={4} className="mb-3 mb-sm-0">
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h1 fw-bold text-primary">2</h2>
              <p className="mb-0">Usuarios registrados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4} className="mb-3 mb-sm-0">
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h1 fw-bold text-success">100%</h2>
              <p className="mb-0">Satisfacción</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h1 fw-bold text-info">24/7</h2>
              <p className="mb-0">Soporte técnico</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Footer */}
      <footer className="border-top pt-4 mt-4">
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>TaskManager</h5>
            <p className="text-muted">
              Simplificando la gestión de tareas desde 2025. Conectando equipos
              y proyectos de manera eficiente.
            </p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Enlaces rápidos</h5>
            <ul className="list-unstyled">
              <li>
                <a
                  href="https://fiopans1.com/"
                  className="text-decoration-none"
                >
                  Website
                </a>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Conéctate con nosotros</h5>
            <div className="d-flex gap-2 mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://fiopans1.com",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Website
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://www.linkedin.com/in/fiopans1/",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                LinkedIn
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://github.com/fiopans1",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                GitHub
              </Button>
            </div>
            <p className="text-muted small">
              Suscríbete a nuestro newsletter para recibir actualizaciones.
            </p>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center">
            <p className="text-muted small mb-0">
              © 2025 TaskManager. Creado por{" "}
              <a
                href="https://github.com/fiopans1"
                target="_blank"
                rel="noopener noreferrer"
              >
                fiopans1
              </a>
              . Todos los derechos reservados.
            </p>
          </Col>
        </Row>
      </footer>
    </Container>
  );
};

export default Home;
