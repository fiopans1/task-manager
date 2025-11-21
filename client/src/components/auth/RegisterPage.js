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
import { useNavigate, Link } from "react-router-dom";
import { successToast, errorToast } from "../common/Noty";
import configService from "../../services/configService";

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
      // Validate that passwords match
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
      className="task-manager-bg d-flex justify-content-center align-items-center p-3"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="modern-card p-4 p-md-5 rounded-4">
            {/* Header del Task Manager */}
            <div className="text-center mb-4">
              <h2 className="brand-title display-6">Join {configService.getAppName()}</h2>
              <p className="text-muted mb-0">
                Create your account to get started
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              {/* Nombre completo */}
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="formName">
                    <Form.Label className="fw-semibold text-dark">
                      First Name
                    </Form.Label>
                    <Form.Control
                      className="modern-input rounded-3 border-2"
                      type="text"
                      placeholder="Enter first name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="formSurname1">
                    <Form.Label className="fw-semibold text-dark">
                      Surname 1
                    </Form.Label>
                    <Form.Control
                      className="modern-input rounded-3 border-2"
                      type="text"
                      placeholder="Enter surname"
                      name="surname1"
                      value={formData.surname1}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formSurname2">
                    <Form.Label className="fw-semibold text-dark">
                      Surname 2
                    </Form.Label>
                    <Form.Control
                      className="modern-input rounded-3 border-2"
                      type="text"
                      placeholder="Enter surname"
                      name="surname2"
                      value={formData.surname2}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Username y Email */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="formUsername">
                    <Form.Label className="fw-semibold text-dark">
                      Username
                    </Form.Label>
                    <Form.Control
                      className="modern-input rounded-3 border-2"
                      type="text"
                      placeholder="Choose username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formEmail">
                    <Form.Label className="fw-semibold text-dark">
                      Email Address
                    </Form.Label>
                    <Form.Control
                      className="modern-input rounded-3 border-2"
                      type="email"
                      placeholder="Enter your email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Contraseñas */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="formPassword">
                    <Form.Label className="fw-semibold text-dark">
                      Password
                    </Form.Label>
                    <Form.Control
                      className="modern-input rounded-3 border-2"
                      type="password"
                      placeholder="Create password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formConfirmPassword">
                    <Form.Label className="fw-semibold text-dark">
                      Confirm Password
                    </Form.Label>
                    <Form.Control
                      className="modern-input rounded-3 border-2"
                      type="password"
                      placeholder="Confirm password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                className="modern-btn w-100 py-3 fw-semibold rounded-3 mb-4"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </Form>

            {/* Footer */}
            <hr className="mb-3" />
            <div className="text-center">
              <small className="text-muted">
                Already have an account?{" "}
                <Link to="/login" className="modern-link">
                  Sign in here
                </Link>
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
