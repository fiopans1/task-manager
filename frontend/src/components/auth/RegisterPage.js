import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import authService from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { successToast, errorToast } from "../common/Noty";
import configService from "../../services/configService";
import ThemeToggleButton from "../common/ThemeToggleButton";
import { useTranslation } from 'react-i18next';

function RegisterPage() {
  const { t } = useTranslation();
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
        <h1 className="brand-title text-center mb-3">
          {configService.getAppName()}
        </h1>

        <p className="auth-heading text-center mb-5">
          {t('auth.createAccount')}
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label
              className="fw-medium mb-2"
              style={{ fontSize: "0.875rem" }}
            >
              {t('auth.firstName')}
            </Form.Label>
            <Form.Control
              className="auth-input"
              type="text"
              placeholder={t('auth.firstNamePlaceholder')}
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
                  {t('auth.surname1')}
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="text"
                  placeholder={t('auth.surname1Placeholder')}
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
                  {t('auth.surname2')}
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="text"
                  placeholder={t('auth.surname2Placeholder')}
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
                  {t('auth.username')}
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
                  {t('auth.email')}
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
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
                  {t('auth.password')}
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
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
                  {t('auth.confirmPassword')}
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
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
                {t('auth.creatingAccount')}
              </>
            ) : (
              t('auth.createAccountBtn')
            )}
          </Button>
        </Form>

        <p
          className="text-center mt-4 mb-0"
          style={{ fontSize: "0.875rem", color: "#64748b" }}
        >
          {t('auth.alreadyHaveAccount')}{" "}
          <Link to="/login" className="auth-link">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
      <ThemeToggleButton />
    </Container>
  );
}

export default RegisterPage;
