import { Button, Col, Container, Row } from "react-bootstrap";
import SidebarMenu from "../components/Sidebar/SidebarMenu";
import { useNavigate, Outlet } from "react-router-dom";
import Prueba1 from "../components/prueba1";
import Prueba2 from "../components/prueba2";
const MainApp = ({ onLogOut }) => {
  const navigateTo = useNavigate();
  return (
    <Container fluid style={{ margin: 0, padding: 0 }}>
      <Row style={{ margin: 0, padding: 0 }}>
        <SidebarMenu /> {/*This component have a column*/}
        <Col>
          {/* <div><Button onClick={onLogOut}>Cerrar Sesion</Button></div> */}
          <Button onClick={() => navigateTo("prueba1")}>Ir a Prueba 1</Button>
          <Button onClick={() => navigateTo("prueba2")}>Ir a Prueba 2</Button>
          <Button onClick={onLogOut}>Cerrar Sesion</Button>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default MainApp;
