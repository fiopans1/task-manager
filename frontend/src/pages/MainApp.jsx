import { Col, Container, Row } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";
import SidebarMenu from "../components/Sidebar/SidebarMenu";
import SessionManager from "../components/session/SessionManager";
import SystemMessageModal from "../components/common/SystemMessageModal";
import Seo from "../components/common/Seo";

const PATH_META = [
  { match: /^\/home\/tasks\/[^/]+/, title: "Task details", description: "View and update the details of a single task in Task Manager." },
  { match: /^\/home\/tasks/, title: "Tasks", description: "Browse, filter and manage your tasks in Task Manager." },
  { match: /^\/home\/calendar/, title: "Calendar", description: "Plan your work on the Task Manager calendar view." },
  { match: /^\/home\/lists\/[^/]+/, title: "List details", description: "Open a list and review its items in Task Manager." },
  { match: /^\/home\/lists/, title: "Lists", description: "Browse and manage your custom task lists in Task Manager." },
  { match: /^\/home\/teams\/[^/]+/, title: "Team dashboard", description: "Collaborate with your team in Task Manager." },
  { match: /^\/home\/teams/, title: "Teams", description: "Browse and manage your teams in Task Manager." },
  { match: /^\/home\/admin/, title: "Admin panel", description: "Administrative tools for Task Manager." },
  { match: /^\/home$/, title: "Dashboard", description: "Task Manager dashboard — your tasks, lists, calendar and time tracking." },
];

function getMetaForPath(pathname) {
  return (
    PATH_META.find((entry) => entry.match.test(pathname)) ?? {
      title: "Dashboard",
      description: "Task Manager dashboard — your tasks, lists, calendar and time tracking.",
    }
  );
}

const MainApp = ({ onLogOut }) => {
  const location = useLocation();
  const { title, description } = getMetaForPath(location.pathname);

  return (
    <Container fluid className="main-app-container bg-body">
      <Seo title={title} path={location.pathname} description={description} noindex />
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
