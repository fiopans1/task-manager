import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import SidebarMenu from "../components/Sidebar/SidebarMenu";
import SessionManager from "../components/session/SessionManager";
import SystemMessageModal from "../components/common/SystemMessageModal";

const MainApp = ({ onLogOut }) => {
  return (
    <Container fluid className="main-app-container bg-body">
      <Row className="main-app-row g-0">
        <SidebarMenu onLogOut={onLogOut} />
        <Col
          className="outlet-col bg-body p-0"
        >
          <div className="mobile-topbar-spacer d-md-none" aria-hidden="true"></div>
          <Outlet />
        </Col>
      </Row>
      <SessionManager onLogOut={onLogOut} />
      <SystemMessageModal context="afterLogin" />
    </Container>
  );
};

export default MainApp;
