import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Container,
  Card,
  InputGroup,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import configService from "../services/configService";

const HomePage = () => {
  const navigateTo = useNavigate();

  return (
    <Container
      fluid
      className="task-manager-bg d-flex justify-content-center align-items-center py-4"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="modern-card p-4 p-md-5 rounded-4">
            {/* Header Principal */}
            <div className="text-center mb-5">
              <h1 className="brand-title display-4 mb-3">Task Manager</h1>
              <p className="welcome-subtitle mb-4">
                Organize your tasks, boost your productivity
              </p>

              {/* Mini features showcase */}
              <Row className="mb-4">
                <Col xs={4}>
                  <div className="feature-icon">📋</div>
                  <div className="feature-text">Organize</div>
                </Col>
                <Col xs={4}>
                  <div className="feature-icon">⚡</div>
                  <div className="feature-text">Fast</div>
                </Col>
                <Col xs={4}>
                  <div className="feature-icon">🎯</div>
                  <div className="feature-text">Focus</div>
                </Col>
              </Row>
            </div>

            {/* Botones de Acción Tradicionales */}
            <div className="d-grid gap-3">
              <div className="text-center mb-3">
                <small className="text-muted fw-semibold">
                  🚀 Quick Access
                </small>
              </div>
              <Button
                className="modern-btn-primary modern-btn py-3 rounded-3"
                size="lg"
                onClick={() => navigateTo("/login")}
              >
                <span className="me-2">🔐</span>
                Sign In to Your Account
              </Button>

              <Button
                className="modern-btn-outline modern-btn py-3 rounded-3"
                size="lg"
                onClick={() => navigateTo("/register")}
              >
                <span className="me-2">✨</span>
                Create New Account
              </Button>
            </div>
            {configService.isOAuth2Enabled() && (
              <div>
                {/* Separador */}
                <div className="text-center mb-4">
                  <hr className="my-3" />
                </div>

                <div className="mb-4">
                  <div className="text-center mb-3">
                    <small className="text-muted fw-semibold">
                      🚀 Quick Access
                    </small>
                  </div>

                  <Button
                    className="modern-btn-success modern-btn py-3 rounded-3 w-100 mb-3"
                    size="lg"
                    onClick={() => navigateTo("/oauth2-login")}
                  >
                    <span className="me-2">⚡</span>
                    Continue with SSO
                    <small className="d-block mt-1 opacity-75">
                      Fast & secure login
                    </small>
                  </Button>
                </div>
              </div>
            )}

            {/* Footer informativo */}
            <div className="text-center mt-4 pt-3 border-top">
              <small className="text-muted">
                Start managing your tasks efficiently today
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
