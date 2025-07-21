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
import { setServerUrl } from "../redux/slices/serverSlice";

const HomePage = ({ showServerUrl = true }) => {
  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  // Obtener el estado persistido de Redux
  const serverUrlFromRedux = useSelector((state) => state.server.serverUrl);

  // Controlar el estado local del componente
  const [url, setUrl] = useState(serverUrlFromRedux);

  // Sincronizar el estado local con el estado global persistido
  useEffect(() => {
    setUrl(serverUrlFromRedux);
  }, [serverUrlFromRedux]);

  // Manejar los cambios del input
  const handleChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    dispatch(setServerUrl(newUrl));
  };

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

            {/* Server URL Input - Controlable */}
            {showServerUrl && (
              <div className="mb-4">
                <Form.Group>
                  <Form.Label className="fw-semibold text-dark mb-2">
                    Server Configuration
                  </Form.Label>
                  <InputGroup className="modern-input-group">
                    <InputGroup.Text>🌐 Server URL</InputGroup.Text>
                    <Form.Control
                      className="modern-input rounded-end-3 border-2"
                      placeholder="localhost"
                      value={url}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="d-grid gap-3">
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
