import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
const Lists = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Datos para las tarjetas (puedes adaptarlo según necesites)
  const cards = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    title: `Card ${index + 1}`,
    text: `Contenido del card ${index + 1}`,
  }));

  const handleCardClick = (id) => {
    navigate(`${location.pathname}/${id}`);
  };

  return (
    <Container fluid className="overflow-auto mt-4">
      <h1>Lists</h1>
      <Card className="overflow-auto m-3" style={{ height: "80vh" }}>
        <Row className="g-3">
          {/* Card especial */}
          <Col xs={12}>
            <Card className="p-3 border-primary text-center">
              <Card.Body>
                <Card.Title>Add New List+</Card.Title>
              </Card.Body>
            </Card>
          </Col>

          {/* Cards dinámicos */}
          {cards.slice(1).map((card) => (
            <Col xs={12} sm={6} md={4} lg={3} key={card.id}>
              <Card className="h-100" onClick={() => handleCardClick(card.id)}>
                <Card.Body>
                  <Card.Title>{card.title}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </Container>
  );
};

export default Lists;
