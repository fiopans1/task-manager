import { Col, Container, Row } from "react-bootstrap";
import SidebarMenu from "../components/Sidebar/SidebarMenu";
import { Outlet } from "react-router-dom";
import SessionManager from "../components/session/SessionManager";
const MainApp = ({ onLogOut }) => {
  return (
    <Container
      fluid
      className="main-app-container"
      style={{ margin: 0, padding: 0, overflow: "hidden", height: "100vh" }}
    >
      <Row
        className="main-app-row"
        style={{ margin: 0, padding: 0, height: "100vh" }}
      >
        <SidebarMenu onLogOut={onLogOut} /> {/*This component have a column*/}
        <Col
          className="p-0 outlet-col"
          style={{ height: "100vh", overflow: "auto" }}
        >
          <Outlet />
        </Col>
      </Row>
      <SessionManager onLogOut={onLogOut} />
    </Container>
  );
};

export default MainApp;
