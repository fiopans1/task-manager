import { Button, Col, Container, Row } from "react-bootstrap";
import SidebarMenu from "../Sidebar/SidebarMenu";
const MainApp = ({ onLogOut }) => {
  return (
    <Container fluid style={{ margin: 0, padding: 0 }}>
      <Row style={{ margin: 0, padding: 0 }}>
        <SidebarMenu /> {/*This component have a column*/}
        <Col>
          <div><Button onClick={onLogOut}>Cerrar Sesion</Button></div>
        </Col>
      </Row>
    </Container>
  );
};

export default MainApp;
