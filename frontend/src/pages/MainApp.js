import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import SidebarMenu from "../components/Sidebar/SidebarMenu";
import SessionManager from "../components/session/SessionManager";
import SystemMessageModal from "../components/common/SystemMessageModal";

const MainApp = ({ onLogOut }) => {
  return (
    <Container fluid className="bg-body-tertiary px-0" style={{ minHeight: "100vh" }}>
      <Row className="g-0 flex-nowrap" style={{ minHeight: "100vh" }}>
        <SidebarMenu onLogOut={onLogOut} />
        <Col className="outlet-col bg-body-tertiary" style={{ minHeight: "100vh", overflowY: "auto" }}>
          <Outlet />
        </Col>
      </Row>
      <SessionManager onLogOut={onLogOut} />
      <SystemMessageModal context="afterLogin" />
    </Container>
  );
};

export default MainApp;
