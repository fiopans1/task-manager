import React from "react";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { useState } from "react";
function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para manejar el registro, como validación y envío a la API
    console.log("register");
  };
  return (
    <Container
      fluid
      className="animated-background d-flex justify-content-center align-items-center"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card
            className="p-4 shadow-sm rounded"
            style={{ backgroundColor: "#ffffff" }}
          >
            <Card.Body>
              <h2 className="text-center mb-4" style={{ color: "#4c4c4c" }}>
                Registro
              </h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>

                <Form.Group controlId="formUsername" className="mb-3">
                  <Form.Label>Nombre de Usuario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre de usuario"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Crea tu contraseña"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mb-4">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirma tu contraseña"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  block
                  style={{
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "16px",
                  }}
                >
                  Registrarse
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
