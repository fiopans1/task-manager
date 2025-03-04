import React from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  Spinner,
} from "react-bootstrap";
import { useState } from "react";
import authService from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../common/Noty";
function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname1: "",
    surname2: "",
    age: 0,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Validar que las contraseñas coincidan
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }
      const data = await authService.register(formData);
      setLoading(false);
      if (data.successCount > 0) {
        addNotification(data.successMessages.join(", "), "success");
        navigate("../login");
      }
    } catch (error) {
      setLoading(false);
      addNotification("Error al registrarse: " + error.message, "danger", 5000);
    }
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
            <h2 className="text-center mb-4" style={{ color: "#4c4c4c" }}>
              Registro
            </h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group controlId="formSurname1">
                    <Form.Label>Surname 1</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter surname"
                      name="surname1"
                      value={formData.surname1}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col>
                  <Form.Group controlId="formSurname2">
                    <Form.Label>Surname 2</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter surname"
                      name="surname2"
                      value={formData.surname2}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

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

              <Form.Group controlId="formAge">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
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

              <Button size="lg" variant="primary" type="submit">
                {loading ? (
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ) : (
                  "Registrarse"
                )}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
