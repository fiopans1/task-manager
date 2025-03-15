import React from "react";
import { Col, Nav, Dropdown, NavLink, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

function SidebarMenu({ onLogOut }) {
  return (
    <Col
      className="bg-dark vh-100 d-flex justify-content-between flex-column"
      xs="auto"
      md={3}
    >
      <div>
        {/* Brand */}
        <NavLink
          as={Link}
          to="/home"
          className="text-decoration-none text-white d-none d-sm-inline d-flex align-items-center ms-3 mt-3"
        >
          <i className="fs-4 bi bi-speedometer"></i>
          <span className="ms-1 fs-4 d-none d-sm-inline">Task Manager</span>
        </NavLink>
        <hr className="text-secondary d-none d-sm-block" />

        {/* Sidebar Menu */}
        <Nav className="nav-pills flex-column mt-3 mt-sm-0">
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <NavLink
              as={Link}
              to="/home/tasks" // Cambia a la ruta correspondiente
              className="hover-custom text-white fs-5"
            >
              <i className="bi bi-list-task"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">My-Tasks</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <NavLink
              as={Link}
              to="/home/calendar" // Cambia a la ruta correspondiente
              className="hover-custom text-white fs-5"
            >
              <i className="bi bi-calendar-date"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Calendar</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <NavLink
              as={Link}
              to="/home/lists" // Cambia a la ruta correspondiente
              className="hover-custom text-white fs-5"
            >
              <i className="bi bi-card-checklist"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Lists</span>
            </NavLink>
          </Nav.Item>
          <Nav.Item className="fs-4 my-1 py-2 py-sm-0">
            <NavLink
              to="/lists" // Cambia a la ruta correspondiente
              className="hover-custom text-white fs-5"
            >
              <i className="bi bi-gear-wide-connected"></i>
              <span className="fs-4 ms-3 d-none d-sm-inline">Admin-Panel</span>
            </NavLink>
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
          <span className="ms-2 d-none d-sm-inline">
            {authService.getUsername()}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#">
            <Button
              variant="link"
              className="w-100 d-sm-inline"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Settings
            </Button>
          </Dropdown.Item>
          <Dropdown.Item href="#">
            <Button
              variant="link"
              className="w-100 d-sm-inline"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={onLogOut}
            >
              Log Out
            </Button>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Col>
  );
}

export default SidebarMenu;
