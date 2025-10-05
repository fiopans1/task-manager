import { Col, Container, Row } from "react-bootstrap";
import SidebarMenu from "../components/Sidebar/SidebarMenu";
import { Outlet } from "react-router-dom";
const MainApp = ({ onLogOut }) => {
  return (
    <Container
      fluid
      style={{ margin: 0, padding: 0, overflow: "hidden", height: "100vh" }}
    >
      <Row style={{ margin: 0, padding: 0 }}>
        <SidebarMenu onLogOut={onLogOut} /> {/*This component have a column*/}
        <Col className="p-0">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default MainApp;
