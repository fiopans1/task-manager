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
    description: `Contenido del card ${index + 1}`,
    color: "red",
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
            <Card.Title>+ Create New Task</Card.Title>
          </Card.Body>
        </Card>
      </Row>

      {/* Cards dinámicos */}
      {cards.slice(1).map((card) => (
        <Row key={card.id} className="m-1">
          <Card>
            <Card.Body>
              <div className="d-flex">
                <div className="flex-grow-1">
                  <Card.Subtitle>{card.title}</Card.Subtitle>
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
                <Card.Text>{card.description}</Card.Text>
                <Button
                  variant="success"
                  className="m-2"
                  onClick={() => handleCardClick(card.id)}
                >
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
