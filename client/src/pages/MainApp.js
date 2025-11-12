import { Col, Container, Row } from "react-bootstrap";
import SidebarMenu from "../components/Sidebar/SidebarMenu";
import { Outlet } from "react-router-dom";
const MainApp = ({ onLogOut }) => {
  return (
    <Container
      fluid
      style={{ margin: 0, padding: 0, overflow: "hidden", minHeight: "100vh" }}
    >
      <Row style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
        <SidebarMenu onLogOut={onLogOut} /> {/*This component have a column*/}
        <Col className="p-0" style={{ minHeight: "100vh", overflow: "auto" }}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default MainApp;
