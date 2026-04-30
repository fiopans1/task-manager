import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Dropdown,
  Form,
  Nav,
  NavLink,
  Offcanvas,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import About from "./About";
import { useTheme } from "../../context/ThemeContext";
import adminService from "../../services/adminService";
import authService from "../../services/authService";
import configService from "../../services/configService";
import listService from "../../services/listService";
import taskService from "../../services/taskService";
import teamService from "../../services/teamService";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [featureFlags, setFeatureFlags] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userRole = await authService.getRoles();
        setIsAdmin(userRole.includes("ROLE_ADMIN"));
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

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

  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.featureKey && featureFlags[item.featureKey] === false) return false;
    return true;
  });

  const handleNavClick = (item, e) => {
    e.preventDefault();

    if (item.featureKey === "tasks") {
      taskService.invalidateTasksCache();
    } else if (item.featureKey === "lists") {
      listService.invalidateListsCache();
    } else if (item.featureKey === "teams") {
      teamService.invalidateTeamsCache();
    }

    navigate(item.path);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const isItemActive = (itemPath) =>
    location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);

  const renderSidebarContent = () => {
    const effectiveCollapsed = isMobile ? false : collapsed;
    const headerLayoutClass = effectiveCollapsed
      ? "flex-column gap-2"
      : "justify-content-between gap-2";

    return (
      <>
        <div className="p-3 d-flex flex-column gap-3">
          <div className={`d-flex align-items-center ${headerLayoutClass}`}>
            <Button
              as={Link}
              to="/home"
              variant="link"
              className={`sidebar-brand-button text-decoration-none d-flex align-items-center gap-2 px-0 ${
                effectiveCollapsed ? "justify-content-center" : ""
              }`}
            >
              <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary" style={{ width: 40, height: 40 }}>
                <i className="bi bi-check2-square fs-5"></i>
              </span>
              {!effectiveCollapsed && (
                <div>
                  <div className="fw-semibold lh-sm">{configService.getAppName()}</div>
                  <small className="text-body-secondary">Focus on what matters</small>
                </div>
              )}
            </Button>
            {!isMobile && (
              <Button
                variant="light"
                size="sm"
                className="sidebar-toggle border shadow-sm flex-shrink-0"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!effectiveCollapsed}
              >
                <i className={`bi ${effectiveCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
              </Button>
            )}
          </div>

          <Nav className="flex-column gap-1">
            {filteredNavItems.map((item) => (
              <Nav.Item key={item.path}>
                <NavLink
                  as={Link}
                  to={item.path}
                  className={`sidebar-nav-link text-decoration-none d-flex align-items-center gap-3 ${
                    isItemActive(item.path) ? "active" : ""
                  }`}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  <i className={`${item.icon} fs-5`}></i>
                  {!effectiveCollapsed && (
                    <>
                      <span className="fw-medium">{item.label}</span>
                      {item.badge && (
                        <Badge bg="danger" pill className="ms-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              </Nav.Item>
            ))}

            <Nav.Item>
              <Dropdown drop={effectiveCollapsed ? "end" : "down"} container="body">
                <Dropdown.Toggle as="div" bsPrefix="custom-toggle" className="cursor-pointer">
                  <div className="sidebar-nav-link d-flex align-items-center gap-3">
                    <i className="bi bi-question-circle fs-5"></i>
                    {!effectiveCollapsed && (
                      <>
                        <span className="fw-medium">Help</span>
                        <i className="bi bi-chevron-down ms-auto small"></i>
                      </>
                    )}
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-sm z-index-high border-0 rounded-4">
                  <Dropdown.Item onClick={() => setShowAbout(true)}>
                    <i className="bi bi-box-info me-2"></i>
                    About
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>
          </Nav>
        </div>

        <div className={`p-3 pt-0 ${effectiveCollapsed ? "text-center" : ""}`}>
          <Dropdown drop={effectiveCollapsed ? "end" : "up"} align={effectiveCollapsed ? "start" : "end"} container="body">
            <Dropdown.Toggle
              variant="light"
              id="user-menu"
              className={`sidebar-user-toggle no-caret w-100 rounded-4 d-flex align-items-center ${
                effectiveCollapsed ? "justify-content-center px-0" : "justify-content-between"
              }`}
            >
              <div className="d-flex align-items-center gap-2 text-start">
                <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-body-tertiary" style={{ width: 36, height: 36 }}>
                  <i className="bi bi-person"></i>
                </span>
                {!effectiveCollapsed && (
                  <div className="d-flex flex-column">
                    <span className="fw-medium text-truncate" style={{ maxWidth: 130 }}>
                      {authService.getUsername()}
                    </span>
                    <small className="text-body-secondary">Account</small>
                  </div>
                )}
              </div>
              {!effectiveCollapsed && <i className="bi bi-chevron-up small"></i>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm z-index-high border-0 rounded-4">
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

  if (isMobile) {
    return (
      <>
        <div className="topbar-shell position-fixed top-0 start-0 end-0 border-bottom d-flex align-items-center justify-content-between px-3 py-2" style={{ zIndex: 1040, height: 64 }}>
          <Button variant="light" className="rounded-circle border-0 shadow-sm" style={{ width: 44, height: 44 }} onClick={() => setShowMobileMenu(true)} aria-controls="sidebar-menu">
            <i className="bi bi-list fs-4"></i>
          </Button>
          <div className="fw-semibold">{configService.getAppName()}</div>
          <div style={{ width: 44 }}></div>
        </div>
        <Offcanvas
          id="sidebar-menu"
          show={showMobileMenu}
          onHide={() => setShowMobileMenu(false)}
          placement="start"
          className="bg-body"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-semibold">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column justify-content-between p-0">
            {renderSidebarContent()}
          </Offcanvas.Body>
        </Offcanvas>
        <About show={showAbout} handleClose={() => setShowAbout(false)} />
      </>
    );
  }

  return (
    <>
      <Col
        className={`sidebar-shell border-end d-flex flex-column justify-content-between position-sticky top-0 ${collapsed ? "collapsed" : ""}`}
        xs="auto"
      >
        {renderSidebarContent()}
      </Col>
      <About show={showAbout} handleClose={() => setShowAbout(false)} />
    </>
  );
}

export default SidebarMenu;
