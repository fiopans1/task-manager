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

const HomePage = () => {
  const navigateTo = useNavigate();
  const dispatch = useDispatch();

  // Obtener el estado persistido de Redux
  const serverUrlFromRedux = useSelector((state) => state.server.serverUrl);

  // Controlar el estado local del componente
  const [url, setUrl] = useState(serverUrlFromRedux);

  // Sincronizar el estado local con el estado global persistido
  useEffect(() => {
    setUrl(serverUrlFromRedux);
  }, [serverUrlFromRedux]); // Solo actualizar si el serverUrl en Redux cambia

  // Manejar los cambios del input
  const handleChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl); // Actualizar el estado local
    dispatch(setServerUrl(newUrl)); // Actualizar el estado global en Redux
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
