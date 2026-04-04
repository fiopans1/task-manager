import React, { useState, useEffect } from "react";
import {
  Col,
  Nav,
  Dropdown,
  NavLink,
  Button,
  Badge,
  Offcanvas,
  Form,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import About from "./About";
import configService from "../../services/configService";
import { useTheme } from "../../context/ThemeContext";
import adminService from "../../services/adminService";
import taskService from "../../services/taskService";
import listService from "../../services/listService";
import teamService from "../../services/teamService";

// Constant for navigation routes
const NAVIGATION_ITEMS = [
  {
    path: "/home/tasks",
    icon: "bi bi-list-task",
    label: "My Tasks",
    featureKey: "tasks",
  },
  {
    path: "/home/calendar",
    icon: "bi bi-calendar-date",
    label: "Calendar",
    featureKey: "calendar",
  },
  {
    path: "/home/lists",
    icon: "bi bi-card-checklist",
    label: "Lists",
    featureKey: "lists",
  },
  {
    path: "/home/teams",
    icon: "bi bi-people",
    label: "Teams",
    featureKey: "teams",
  },
  {
    path: "/home/admin",
    icon: "bi bi-shield-lock",
    label: "Admin Panel",
    adminOnly: true,
  },
];

function SidebarMenu({ onLogOut }) {
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { darkMode, toggleDarkMode } = useTheme();
  const [featureFlags, setFeatureFlags] = useState({});

  // Manejador para alternar el estado de colapso de la barra lateral
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Handler to toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Detect window size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // If switching from mobile to desktop, close mobile menu
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

    // Load feature flags from backend
    const loadFeatureFlags = async () => {
      try {
        const config = await adminService.getPublicConfig();
        if (config.features) {
          setFeatureFlags(config.features);
        }
      } catch (error) {
        console.debug("Could not load feature flags:", error);
      }
    };

    checkAdminStatus();
    loadFeatureFlags();
  }, []);

  // Filter navigation items based on user role and feature flags
  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => {
    // Admin-only items: only show to admins
    if (item.adminOnly) return isAdmin;
    // Feature-gated items: hide if feature is explicitly disabled
    if (item.featureKey && featureFlags[item.featureKey] === false) return false;
    return true;
  });

  // Invalidate cache for the feature being navigated to
  const handleNavClick = (item) => {
    if (item.featureKey === "tasks") {
      taskService.invalidateTasksCache();
    } else if (item.featureKey === "lists") {
      listService.invalidateListsCache();
    } else if (item.featureKey === "teams") {
      teamService.invalidateTeamsCache();
    }
    if (isMobile) {
      toggleMobileMenu();
    }
  };

  // Main sidebar content
  const renderSidebarContent = () => {
    // On mobile, always show expanded, regardless of collapsed state
    const effectiveCollapsed = isMobile ? false : collapsed;

    return (
      <>
        <div>
          {!isMobile && (
            <div
              className={`d-flex align-items-center pt-3 ${
                effectiveCollapsed ? "justify-content-center px-0" : "px-3"
              }`}
            >
              <NavLink
                as={Link}
                to="/home"
                className={`text-decoration-none text-white d-flex align-items-center ${
                  effectiveCollapsed ? "justify-content-center w-100" : ""
                }`}
              >
                <i className="fs-4 bi bi-speedometer"></i>
                {!effectiveCollapsed && (
                  <span className="ms-2 fs-4 d-none d-sm-inline">
                    {configService.getAppName()}
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
                  onClick={() => handleNavClick(item)}
                >
                  <div className="d-flex align-items-center position-relative w-100">
                    <i
                      className={`${item.icon} ${
                        effectiveCollapsed ? "fs-4 ps-2" : ""
                      }`}
                    ></i>
                    {!effectiveCollapsed && (
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
            <Nav.Item className="my-1">
              <Dropdown
                drop={effectiveCollapsed ? "end" : "down"}
                container="body"
              >
                <Dropdown.Toggle
                  as="div"
                  bsPrefix="custom-toggle"
                  id="dropdown-basic"
                  className="cursor-pointer"
                  style={{ cursor: "pointer" }}
                >
                  <div className="nav-link hover-custom text-white fs-5 py-2 d-flex align-items-center">
                    <div className="d-flex align-items-center position-relative w-100">
                      <i
                        className={`bi bi-question-circle ${
                          effectiveCollapsed ? "fs-4 ps-2" : ""
                        }`}
                      ></i>
                      {!effectiveCollapsed && (
                        <>
                          <span
                            className={`fs-5 ms-3 ${
                              isMobile ? "" : "d-none d-sm-inline"
                            }`}
                          >
                            Help
                          </span>
                          <i className="bi bi-chevron-down ms-auto fs-6"></i>
                        </>
                      )}
                    </div>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow z-index-high">
                  <Dropdown.Item onClick={() => setShowAbout(true)}>
                    <i className="bi bi-box-info me-2"></i>
                    About
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>
          </Nav>
        </div>

        {/* Dropdown Menu */}
        <div className={`${!effectiveCollapsed ? "px-3 py-2" : ""}`}>
          <Dropdown
            drop={effectiveCollapsed ? "end" : "up"}
            align={effectiveCollapsed ? "start" : "end"}
            container="body"
          >
            <Dropdown.Toggle
              variant="dark"
              id="dropdown-basic"
              className={`no-caret text-white text-decoration-none d-flex align-items-center ${
                effectiveCollapsed ? "justify-content-center w-100 px-0" : ""
              }`}
            >
              <i
                className={`${
                  !effectiveCollapsed
                    ? "bi bi-person-circle fs-4"
                    : "bi bi-person-circle fs-4"
                }`}
              ></i>
              {!effectiveCollapsed && (
                <>
                  <span
                    className={`ms-2 text-truncate ${
                      isMobile ? "" : "d-none d-sm-inline"
                    }`}
                    style={{ maxWidth: "150px" }}
                  >
                    {authService.getUsername()}
                  </span>
                  <i className="bi bi-chevron-up ms-2 fs-6"></i>
                </>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow z-index-high">
              {/* <Dropdown.Item as={Link} to="/profile" className="py-2">
              <i className="bi bi-person me-2"></i>
              Profile
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/settings" className="py-2">
              <i className="bi bi-gear me-2"></i>
              Settings
            </Dropdown.Item>
            <Dropdown.Divider /> */}
              <Dropdown.ItemText className="py-2">
                <Form.Check
                  type="switch"
                  id="dark-mode-switch"
                  label={
                    <span>
                      <i className={`bi ${darkMode ? "bi-moon-fill" : "bi-sun-fill"} me-2`}></i>
                      Dark Mode
                    </span>
                  }
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
              </Dropdown.ItemText>
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
  };

  // Conditional rendering based on mobile or desktop
  if (isMobile) {
    return (
      <>
        {/* Botón flotante en esquina para móvil - Top bar layout */}
        <div
          className="mobile-top-bar bg-dark position-fixed w-100 d-flex align-items-center justify-content-between px-3 py-2"
          onClick={toggleMobileMenu}
          aria-controls="sidebar-menu"
          style={{
            top: 0,
            left: 0,
            zIndex: 1000,
            height: "60px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          <Button
            variant="dark"
            className="d-flex align-items-center justify-content-center mobile-menu-button p-0"
            onClick={toggleMobileMenu}
            aria-controls="sidebar-menu"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <i className="bi bi-list fs-4"></i>
          </Button>

          <span className="text-white fw-bold">{configService.getAppName()}</span>

          {/* Spacer for balance */}
          <div style={{ width: "44px" }}></div>
        </div>

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
            <Offcanvas.Title
              as={Link}
              to="/home"
              className="text-white text-decoration-none"
            >
              <i className="fs-4 bi bi-speedometer"></i>{" "}
              <span
                className={`fs-5 ms-3 ${isMobile ? "" : "d-none d-sm-inline"}`}
              >
                {configService.getAppName()}
              </span>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column justify-content-between p-0">
            {renderSidebarContent()}
          </Offcanvas.Body>
        </Offcanvas>
        <About show={showAbout} handleClose={() => setShowAbout(false)} />
      </>
    );
  }

  // Desktop version with collapsible sidebar
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
          maxWidth: collapsed ? "60px" : "250px",
          position: "relative",
          flexShrink: 0,
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
      <About show={showAbout} handleClose={() => setShowAbout(false)} />
    </>
  );
}

export default SidebarMenu;
