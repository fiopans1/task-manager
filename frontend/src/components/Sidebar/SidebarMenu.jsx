import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Container,
  Dropdown,
  Form,
  Image,
  Nav,
  Navbar,
  NavLink,
  Offcanvas,
  Stack,
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

const appLogo = `${process.env.PUBLIC_URL}/favicon.png`;
const fallbackAppLogo = `${process.env.PUBLIC_URL}/favicon.ico`;

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

const sidebarLogoSize = 32;
const topbarLogoSize = 28;

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

  const handleHomeClick = () => {
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const handleLogoError = (event) => {
    if (event.currentTarget.src.endsWith(fallbackAppLogo)) {
      console.warn("Unable to load sidebar logo asset");
      return;
    }

    event.currentTarget.src = fallbackAppLogo;
  };

  const renderSidebarContent = () => {
    const effectiveCollapsed = isMobile ? false : collapsed;
    const collapsedDropdownPopperConfig = effectiveCollapsed
      ? {
          strategy: "fixed",
          modifiers: [
            {
              name: "offset",
              options: { offset: [0, 12] },
            },
          ],
        }
      : { strategy: "fixed" };
    const brandButtonClassName = `text-body-emphasis text-decoration-none d-flex align-items-center gap-2 px-0 border-0 ${
      effectiveCollapsed ? "w-100 justify-content-center" : ""
    }`;
    const helpToggleClassName = `sidebar-nav-link no-caret w-100 text-start text-body-emphasis text-decoration-none border-0 shadow-none d-flex align-items-center gap-3 ${
      effectiveCollapsed ? "justify-content-center" : ""
    }`;
    const userInfoStackClassName = effectiveCollapsed ? "" : "text-start";

    return (
        <div className="sidebar-content d-flex flex-column justify-content-between h-100">
          <div className="p-3 d-flex flex-column gap-3">
            <div
              className={`d-flex align-items-center ${
                effectiveCollapsed ? "justify-content-center" : ""
              }`}
            >
              <Button
                as={Link}
                to="/home"
                variant="link"
                onClick={handleHomeClick}
                className={brandButtonClassName}
              >
                <Image
                  src={appLogo}
                  alt={configService.getAppName()}
                  className="flex-shrink-0"
                  width={sidebarLogoSize}
                  height={sidebarLogoSize}
                  style={{ objectFit: "contain" }}
                  onError={handleLogoError}
                />
                {!effectiveCollapsed && (
                  <span className="fw-semibold lh-sm">{configService.getAppName()}</span>
                )}
            </Button>
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
              <Dropdown
                drop={effectiveCollapsed ? "end" : "down"}
                container="body"
                popperConfig={collapsedDropdownPopperConfig}
              >
                <Dropdown.Toggle
                  variant="link"
                  className={helpToggleClassName}
                >
                  <i className="bi bi-question-circle fs-5"></i>
                  {!effectiveCollapsed && (
                    <>
                      <span className="fw-medium">Help</span>
                      <i className="bi bi-chevron-down ms-auto small"></i>
                    </>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu className="sidebar-dropdown-menu shadow-sm z-index-high border-0 rounded-4">
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
          <Dropdown
            drop={effectiveCollapsed ? "end" : "up"}
            align={effectiveCollapsed ? "start" : "end"}
            container="body"
            popperConfig={collapsedDropdownPopperConfig}
          >
            <Dropdown.Toggle
              variant="light"
              id="user-menu"
              className={`sidebar-user-toggle no-caret w-100 rounded-4 d-flex align-items-center ${
                effectiveCollapsed ? "justify-content-center px-0" : "justify-content-between"
              }`}
            >
              <Stack
                direction="horizontal"
                gap={2}
                className={userInfoStackClassName}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-body-tertiary flex-shrink-0"
                  style={{ width: 36, height: 36 }}
                >
                  <i className="bi bi-person"></i>
                </span>
                {!effectiveCollapsed && (
                  <Stack gap={0}>
                    <span className="fw-medium text-truncate" style={{ maxWidth: 130 }}>
                      {authService.getUsername()}
                    </span>
                    <small className="text-body-secondary">Account</small>
                  </Stack>
                )}
              </Stack>
              {!effectiveCollapsed && <i className="bi bi-chevron-up small"></i>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="sidebar-dropdown-menu shadow-sm z-index-high border-0 rounded-4">
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
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        <Navbar fixed="top" className="topbar-shell border-bottom px-3">
          <Container fluid className="px-0">
            <Button
              variant="light"
              className="rounded-circle border-0 shadow-sm p-0 d-inline-flex align-items-center justify-content-center"
              style={{ width: 44, height: 44 }}
              onClick={() => setShowMobileMenu(true)}
              aria-controls="sidebar-menu"
            >
              <i className="bi bi-list fs-4"></i>
            </Button>
            <Navbar.Brand className="mx-0 text-body-emphasis fw-semibold">
              <Stack direction="horizontal" gap={2} className="align-items-center">
                <Image
                  src={appLogo}
                  alt={configService.getAppName()}
                  width={topbarLogoSize}
                  height={topbarLogoSize}
                  style={{ objectFit: "contain" }}
                  onError={handleLogoError}
                />
                <span>{configService.getAppName()}</span>
              </Stack>
            </Navbar.Brand>
            <span aria-hidden="true" className="d-block" style={{ width: 44 }}></span>
          </Container>
        </Navbar>
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
        id="desktop-sidebar"
        className={`sidebar-shell border-end d-flex flex-column justify-content-between position-sticky top-0 ${collapsed ? "collapsed" : ""}`}
        xs="auto"
      >
        <Button
          variant="dark"
          size="sm"
          className="sidebar-toggle d-flex align-items-center justify-content-center"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="desktop-sidebar"
        >
          <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
        </Button>
        {renderSidebarContent()}
      </Col>
      <About show={showAbout} handleClose={() => setShowAbout(false)} />
    </>
  );
}

export default SidebarMenu;
