import React, { useState } from "react";
import authService from "../../services/authService";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { successToast, errorToast } from "../common/Noty";
import configService from "../../services/configService";
import ThemeToggleButton from "../common/ThemeToggleButton";
import SystemMessageModal from "../common/SystemMessageModal";
import { useTranslation } from 'react-i18next';

function LoginPage({ onLogin }) {
  const { t } = useTranslation();
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = await authService.login(username, password);
      setLoading(false);
      successToast("Logged in");
      onLogin(token);
    } catch (error) {
      setLoading(false);
      errorToast("Login Error: " + error.message);
    }
  };

  return (
    <Container
      fluid
      className="task-manager-bg d-flex flex-column justify-content-center align-items-center px-3"
    >
      <div style={{ maxWidth: 400, width: "100%" }}>
        <h1 className="brand-title text-center mb-3">
          {configService.getAppName()}
        </h1>

        <p className="auth-heading text-center mb-5">
          {t('auth.welcomeBack')}
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4" controlId="formBasicUsername">
            <Form.Label
              className="fw-medium mb-2"
              style={{ fontSize: "0.875rem" }}
            >
              {t('auth.username')}
            </Form.Label>
            <Form.Control
              size="lg"
              className="auth-input"
              type="text"
              placeholder={t('auth.usernamePlaceholder')}
              value={username}
              onChange={(e) => setusername(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formBasicPassword">
            <Form.Label
              className="fw-medium mb-2"
              style={{ fontSize: "0.875rem" }}
            >
              {t('auth.password')}
            </Form.Label>
            <Form.Control
              size="lg"
              className="auth-input"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            size="lg"
            className="auth-btn-primary w-100 py-3 rounded-3"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('auth.signingIn')}
              </>
            ) : (
              t('auth.signIn')
            )}
          </Button>
        </Form>

        <p
          className="text-center mt-4 mb-0"
          style={{ fontSize: "0.875rem", color: "#64748b" }}
        >
          {t('auth.noAccount')}{" "}
          <Link to="/register" className="auth-link">
            {t('auth.createOne')}
          </Link>
        </p>
      </div>
      <ThemeToggleButton />
      <SystemMessageModal context="beforeLogin" />
    </Container>
  );
}

export default LoginPage;
