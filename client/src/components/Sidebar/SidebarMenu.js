import React from "react";
import { Container, Row, Col, Nav, Dropdown } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const SidebarMenu = () => {
  return (
    <Col
      className="bg-dark vh-100 d-flex justify-content-between flex-column"
      xs="auto"
      md={3}
    >
      <div>
        {/* Brand */}
        <Nav.Link
          href="#"
          className="text-decoration-none text-white d-none d-sm-inline d-flex align-items-center ms-3 mt-3"
        >
          <i className="fs-4 bi bi-speedometer"></i>
          <span className="ms-1 fs-4 d-none d-sm-inline">Brand</span>
        </Nav.Link>
        <hr className="text-secondary d-none d-sm-block" />

        {/* Sidebar Menu */}
        <Nav className="nav-pills flex-column mt-3 mt-sm-0">
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <Nav.Link href="#" className="text-white fs-5">
              <i className="bi bi-speedometer2"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Dashboard</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <Nav.Link href="#" className="text-white fs-5">
              <i className="bi bi-house"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Home</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <Nav.Link href="#" className="text-white fs-5">
              <i className="bi bi-table"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Orders</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <Nav.Link href="#" className="text-white fs-5">
              <i className="bi bi-grid"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Products</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <Nav.Link href="#" className="text-white fs-5">
              <i className="bi bi-table"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Customers</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Dropdown Menu */}
      <Dropdown className="p-3">
        <Dropdown.Toggle
          variant="dark"
          id="dropdown-basic"
          className="text-white text-decoration-none"
        >
          <i className="bi bi-person-circle"></i>
          <span className="ms-2 d-none d-sm-inline">dsuarezr</span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#">
            <span className="d-sm-inline">1</span>
            <span className="d-none d-sm-block">Profile</span>
          </Dropdown.Item>
          <Dropdown.Item href="#">
            <span className="d-sm-inline">2</span>
            <span className="d-none d-sm-block">Settings</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Col>
  );
};

export default SidebarMenu;
