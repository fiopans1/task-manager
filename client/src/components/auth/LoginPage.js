import React, { useState } from "react";
import authService from "../../services/authService";
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { successToast, errorToast } from "../common/Noty";
import configService from "../../services/configService";

function LoginPage({ onLogin }) {
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
      onLogin(token); // Notificar al padre
    } catch (error) {
      setLoading(false);
      errorToast("Login Error: " + error.message);
    }
  };

  return (
    <Container
      fluid
      className="task-manager-bg d-flex vh-100 justify-content-center align-items-center p-3"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="modern-card p-4 p-md-5 rounded-4">
            {/* Header del Task Manager */}
            <div className="text-center mb-4">
              <h2 className="brand-title display-6">{configService.getAppName()}</h2>
              <p className="text-muted mb-0">Manage your tasks efficiently</p>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4" controlId="formBasicUsername">
                <Form.Label className="fw-semibold text-dark mb-2">
                  Username
                </Form.Label>
                <Form.Control
                  size="lg"
                  className="modern-input rounded-3 border-2"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setusername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formBasicPassword">
                <Form.Label className="fw-semibold text-dark mb-2">
                  Password
                </Form.Label>
                <Form.Control
                  size="lg"
                  className="modern-input rounded-3 border-2"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                size="lg"
                className="modern-btn w-100 py-3 fw-semibold rounded-3 mb-4"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Form>

            {/* Footer */}
            <hr className="mb-3" />
            <div className="text-center">
              <small className="text-muted">
                New to {configService.getAppName()}?{" "}
                <Link to="/register" className="modern-link">
                  Create account
                </Link>
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
