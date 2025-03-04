import React, { useState } from "react";
import authService from "../../services/authService";
import { Container, Form, Button, Card, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
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
      onLogin(token); // Notificar al padre
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };
  return (
    <Container
      fluid
      className="vh-100 d-flex justify-content-center align-items-center animated-background p-5"
    >
      <Card className="p-5 shadow-sm rounded">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label className="fs-3">Username</Form.Label>
            <Form.Control
              className="form-control-lg"
              type="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label className="fs-3">Password</Form.Label>
            <Form.Control
              className="form-control-lg"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button size="lg" variant="primary" type="submit">
            {loading ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              "Login"
            )}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default LoginPage;
