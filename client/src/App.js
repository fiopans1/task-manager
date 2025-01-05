import { Col, Container, Row } from "react-bootstrap";
import SidebarMenu from "./components/Sidebar/SidebarMenu";

function App() {
  return (
    <div style={{ display: "flex" }}>
      <SidebarMenu />
      <div style={{ flex: 1 }}>
        <h1>hola</h1>
      </div>
    </div>
  );
}

export default App;
