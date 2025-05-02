import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
const Lists = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Datos para las tarjetas (puedes adaptarlo según necesites)
  const cards = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    title: `Card ${index + 1}`,
    description: `Tareas relacionadas con el proyecto ${index + 1}`,
    color: "blue",
  }));

  const handleCardClick = (id) => {
    navigate(`${location.pathname}/${id}`);
  };

  return (
    <Container fluid className="overflow-auto" style={{ height: "100vh" }}>
      <div className="tittle-tab-container">
        <h2>Lists</h2>
      </div>
      <Row className="m-1 mb-4 mt-3">
        {/* Card especial */}
        <Card className="border-primary text-center">
          <Card.Body>
            <Card.Title>
              <i class="bi bi-plus-lg"></i> Create New Task
            </Card.Title>
          </Card.Body>
        </Card>
      </Row>

      {/* Cards dinámicos */}
      {cards.slice(1).map((card) => (
        <Row key={card.id} className="m-1">
          <Card style={{ borderTop: `6px solid ${card.color}` }}>
            <Card.Body>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <Card.Subtitle className="mt-0 mb-0">
                    {card.title}
                  </Card.Subtitle>
                </div>
                <div className="flex-shrink-0">
                  {" "}
                  {/* Reemplazar "hola" con botones de iconos */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se propague al Card
                      // Lógica para editar
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se propague al Card
                      // Lógica para eliminar
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
              <Row>
                <Card.Text className="mt-0 mb-0" style={{ fontSize: "13px" }}>
                  {card.description}
                </Card.Text>
                <Card.Text
                  className="mb-1"
                  style={{ fontSize: "0.7rem", color: "#6b7280" }}
                >
                  1 de 3 tareas completadas
                </Card.Text>
                <Button
                  variant="success"
                  className="m-2"
                  onClick={() => handleCardClick(card.id)}
                >
                  <i className="bi bi-card-checklist"></i>{" "}
                  {/* Icono de la tarjeta */}
                  See List
                </Button>
              </Row>
            </Card.Body>
          </Card>
        </Row>
      ))}
    </Container>
  );
};

export default Lists;
