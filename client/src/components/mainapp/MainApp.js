import { Col, Container, Row } from "react-bootstrap";
import SidebarMenu from "../Sidebar/SidebarMenu";
const MainApp = () => {
  return (
    <Container fluid style={{ margin: 0, padding: 0 }}>
      <Row style={{ margin: 0, padding: 0 }}>
        <SidebarMenu /> {/*This component have a column*/}
        <Col>
          <div>Content</div>
        </Col>
      </Row>
    </Container>
  );
};

export default MainApp;
