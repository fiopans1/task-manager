import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import authService from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { successToast, errorToast } from "../common/Noty";
import configService from "../../services/configService";
import ThemeToggleButton from "../common/ThemeToggleButton";

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname1: "",
    surname2: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const data = await authService.register(formData);
      setLoading(false);
      if (data.successCount > 0) {
        successToast(data.successMessages.join(", "));
        navigate("../login");
      }
    } catch (error) {
      setLoading(false);
      errorToast("Registration error: " + error.message);
    }
  };

  return (
    <Container
      fluid
      className="task-manager-bg d-flex flex-column justify-content-center align-items-center px-3 py-4"
    >
      <div style={{ maxWidth: 480, width: "100%" }}>
        <p className="brand-title text-center mb-4">
          {configService.getAppName()}
        </p>

        <h1 className="auth-heading text-center mb-2">Create your account</h1>
        <p className="auth-subtext text-center mb-5">
          Start organizing your tasks in seconds
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label
              className="fw-medium mb-2"
              style={{ fontSize: "0.875rem" }}
            >
              First Name
            </Form.Label>
            <Form.Control
              className="auth-input"
              type="text"
              placeholder="John"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formSurname1">
                <Form.Label
                  className="fw-medium mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Surname 1
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="text"
                  placeholder="Doe"
                  name="surname1"
                  value={formData.surname1}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mt-3 mt-md-0">
              <Form.Group controlId="formSurname2">
                <Form.Label
                  className="fw-medium mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Surname 2
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="text"
                  placeholder="Optional"
                  name="surname2"
                  value={formData.surname2}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formUsername">
                <Form.Label
                  className="fw-medium mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Username
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="text"
                  placeholder="johndoe"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mt-3 mt-md-0">
              <Form.Group controlId="formEmail">
                <Form.Label
                  className="fw-medium mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Email
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="email"
                  placeholder="john@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group controlId="formPassword">
                <Form.Label
                  className="fw-medium mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Password
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="mt-3 mt-md-0">
              <Form.Group controlId="formConfirmPassword">
                <Form.Label
                  className="fw-medium mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  Confirm Password
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Button
            className="auth-btn-primary w-100 py-3 rounded-3"
            size="lg"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </Form>

        <p
          className="text-center mt-4 mb-0"
          style={{ fontSize: "0.875rem", color: "#64748b" }}
        >
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
      <ThemeToggleButton />
    </Container>
  );
}

export default RegisterPage;
