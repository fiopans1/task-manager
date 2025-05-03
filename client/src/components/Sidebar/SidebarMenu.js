import React, { useState, useEffect } from "react";
import {
  Col,
  Nav,
  Dropdown,
  NavLink,
  Button,
  Badge,
  Offcanvas,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useLocation } from "react-router-dom";
import authService from "../../services/authService";

// Constante para las rutas de navegación
const NAVIGATION_ITEMS = [
  {
    path: "/home/tasks",
    icon: "bi bi-list-task",
    label: "My Tasks",
    // badge: "5" // Ejemplo de contador de tareas pendientes
  },
  {
    path: "/home/calendar",
    icon: "bi bi-calendar-date",
    label: "Calendar",
  },
  {
    path: "/home/lists",
    icon: "bi bi-card-checklist",
    label: "Lists",
  },
  {
    path: "/home/admin",
    icon: "bi bi-gear-wide-connected",
    label: "Admin Panel",
    adminOnly: true,
  },
];

function SidebarMenu({ onLogOut }) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Manejador para alternar el estado de colapso de la barra lateral
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Manejador para alternar el menú móvil
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Si pasamos de móvil a desktop, cerrar el menú móvil
      if (!mobile && showMobileMenu) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showMobileMenu]);

  useEffect(() => {
    // Verificar si el usuario es administrador
    const checkAdminStatus = async () => {
      try {
        const userRole = await authService.getRoles();
        setIsAdmin(userRole.includes("ROLE_ADMIN"));
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  // Filtrar elementos de navegación según el rol del usuario
  const filteredNavItems = NAVIGATION_ITEMS.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  // Contenido principal del sidebar
  const renderSidebarContent = () => (
    <>
      <div>
        {!isMobile && (
          <div className="d-flex align-items-center px-3 pt-3">
            <NavLink
              as={Link}
              to="/home"
              className="text-decoration-none text-white d-flex align-items-center"
            >
              <i className="fs-4 bi bi-speedometer"></i>
              {!collapsed && (
                <span className="ms-2 fs-4 d-none d-sm-inline">
                  Task Manager
                </span>
              )}
            </NavLink>
          </div>
        )}
        <hr className="text-secondary mt-3" />
        {/* Sidebar Menu */}
        <Nav className="nav-pills flex-column">
          {filteredNavItems.map((item, index) => (
            <Nav.Item key={index} className="my-1">
              <NavLink
                as={Link}
                to={item.path}
                className={`hover-custom text-white fs-5 py-2 d-flex align-items-center ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={isMobile ? toggleMobileMenu : undefined}
              >
                <div className="d-flex align-items-center position-relative w-100">
                  <i
                    className={`${item.icon} ${collapsed ? "fs-4 ps-2" : ""}`}
                  ></i>
                  {(!collapsed || isMobile) && (
                    <>
                      <span
                        className={`fs-5 ms-3 ${
                          isMobile ? "" : "d-none d-sm-inline"
                        }`}
                      >
                        {""}
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge
                          bg="danger"
                          pill
                          className="ms-auto position-absolute end-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>
      </div>

      {/* Dropdown Menu */}
      <div className={`${!collapsed ? "p-3" : ""}`}>
        <Dropdown drop="up" align="end">
          <Dropdown.Toggle
            variant="dark"
            id="dropdown-basic"
            className="text-white text-decoration-none d-flex align-items-center"
          >
            <i className={`${!collapsed ? "bi bi-person-circle fs-4" : "bi bi-person-circle"}`}></i>
            {!collapsed && (
              <span
                className="ms-2 d-none d-sm-inline text-truncate"
                style={{ maxWidth: "150px" }}
              >
                {authService.getUsername()}
              </span>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow">
            <Dropdown.Item as={Link} to="/profile" className="py-2">
              <i className="bi bi-person me-2"></i>
              Profile
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/settings" className="py-2">
              <i className="bi bi-gear me-2"></i>
              Settings
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={onLogOut} className="text-danger py-2">
              <i className="bi bi-box-arrow-right me-2"></i>
              Log Out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </>
  );

  // Renderizado condicional basado en si es móvil o no
  if (isMobile) {
    return (
      <>
        {/* Botón flotante en esquina para móvil */}
        <Button
          variant="dark"
          className="position-fixed d-flex align-items-center justify-content-center mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-controls="sidebar-menu"
          style={{
            width: "48px",
            height: "48px",
            left: "15px",
            top: "15px",
            zIndex: 1030,
            borderRadius: "50%",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          <i className="bi bi-list fs-4"></i>
        </Button>

        {/* Menú lateral como Offcanvas en móvil */}
        <Offcanvas
          id="sidebar-menu"
          show={showMobileMenu}
          onHide={toggleMobileMenu}
          placement="start"
          backdrop={true}
          className="bg-dark text-white w-75"
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title className="text-white">
              <i className="fs-4 bi bi-speedometer"></i> Task Manager
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column justify-content-between p-0">
            {renderSidebarContent()}
          </Offcanvas.Body>
        </Offcanvas>
      </>
    );
  }

  // Versión desktop con sidebar plegable
  return (
    <>
      <Col
        className={`bg-dark vh-100 d-flex justify-content-between flex-column sidebar-menu ${
          collapsed ? "collapsed" : ""
        }`}
        xs="auto"
        md={collapsed ? 1 : 3}
        style={{
          transition: "all 0.3s ease",
          minWidth: collapsed ? "60px" : "200px",
          position: "relative",
        }}
      >
        {/* Botón flotante para colapsar/expandir */}
        {!isMobile && (
          <Button
            variant="dark"
            size="sm"
            className="position-absolute toggle-button d-flex align-items-center justify-content-center"
            onClick={toggleSidebar}
            style={{
              width: "24px",
              height: "24px",
              right: "-12px",
              top: "50vh",
              zIndex: 100,
              borderRadius: "50%",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)",
              padding: 0,
              border: "1px solid #6c757d",
            }}
          >
            <i
              className={`bi ${
                collapsed ? "bi-chevron-right" : "bi-chevron-left"
              }`}
              style={{ fontSize: "12px" }}
            ></i>
          </Button>
        )}
        {renderSidebarContent()}
      </Col>
    </>
  );
}

export default SidebarMenu;
