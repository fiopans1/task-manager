import React from "react";
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
import { useDispatch } from "react-redux";
import { useState } from "react";
import { setServerUrl } from "../redux/slices/serverSlice";
const HomePage = () => {
  const navigateTo = useNavigate();
  const [url, setUrl] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    dispatch(setServerUrl(newUrl)); // Actualiza el estado global con el enlace
  };
  return (
    <Container
      fluid
      className="vh-100 d-flex justify-content-center align-items-center animated-background"
    >
      <Card className="p-4 shadow-sm rounded">
        <Col>
          <Row className="justify-content-center align-items-center text-center">
            <h1>Welcome to the Task Manager!</h1>
          </Row>
          <Row className="m-2" xs={12} sm={6} md={6} lg={6} xl={6}>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">Server Url</InputGroup.Text>
              <Form.Control
                placeholder="localhost"
                aria-label="localhost"
                value={url}
                onChange={handleChange}
              />
            </InputGroup>
          </Row>
          <Row className="justify-content-center align-items-center">
            <Col xs="auto">
              <Button size="lg" onClick={() => navigateTo("/login")}>
                Login
              </Button>
            </Col>
            <Col xs="auto">
              <Button size="lg" onClick={() => navigateTo("/register")}>
                Registrarse
              </Button>
            </Col>
          </Row>
        </Col>
      </Card>
    </Container>
  );
};

export default HomePage;
