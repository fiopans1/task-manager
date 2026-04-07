import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Placeholder,
  ProgressBar,
} from "react-bootstrap";
import {
  CheckCircleFill,
  ListTask,
  CalendarEvent,
  ArrowRight,
  ClockHistory,
  Kanban,
  CalendarCheck,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import homeService from "../services/homeService";

/* ── helpers ─────────────────────────────────────────────────── */
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATE_MAP = {
  NEW: { label: "New", bg: "info" },
  IN_PROGRESS: { label: "In Progress", bg: "warning" },
  COMPLETED: { label: "Completed", bg: "success" },
  CANCELLED: { label: "Cancelled", bg: "danger" },
  PAUSSED: { label: "Paused", bg: "secondary" },
};

/* ── skeleton rows (Bootstrap Placeholder) ───────────────────── */
const SkeletonRows = ({ count = 3 }) =>
  Array.from({ length: count }).map((_, i) => (
    <div key={i} className="border-bottom py-3">
      <Placeholder animation="glow">
        <Placeholder xs={5} className="me-2" />
        <Placeholder xs={2} className="me-2" />
        <Placeholder xs={3} />
      </Placeholder>
    </div>
  ));

/* ── empty state ─────────────────────────────────────────────── */
const Empty = ({ text }) => (
  <div className="text-center text-muted py-5">
    <p className="mb-0" style={{ fontSize: "0.875rem" }}>
      {text}
    </p>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════ */
const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    homeService
      .getHomeSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* derived stats */
  const completedCount =
    summary?.recentTasks?.filter((t) => t.state === "COMPLETED").length ?? 0;
  const totalRecent = summary?.recentTasks?.length ?? 0;
  const completionPct =
    totalRecent > 0 ? Math.round((completedCount / totalRecent) * 100) : 0;

  return (
    <Container
      fluid
      className="py-4 px-4 overflow-auto d-flex flex-column"
      style={{ minHeight: "100%" }}
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      <Row className="justify-content-center mb-4">
        <Col lg={8} xl={7} className="text-center py-4">
          <h1 className="fw-bold mb-3" style={{ letterSpacing: "-0.025em" }}>
            {t('home.title')}
          </h1>
          <p className="text-muted mb-4" style={{ lineHeight: 1.75 }}>
            {t('home.subtitle')}
          </p>
          <Button
            variant="dark"
            className="rounded-3 px-4"
            onClick={() => navigate("/home/tasks")}
          >
            {t('home.getStarted')} <ArrowRight className="ms-1" size={14} />
          </Button>
        </Col>
      </Row>

      {/* ── Quick access ───────────────────────────────────── */}
      <Row className="justify-content-center mb-4 g-3">
        {[
          {
            icon: <ListTask size={22} className="text-primary" />,
            title: t('home.myTasks'),
            desc: t('home.myTasksDesc'),
            path: "/home/tasks",
          },
          {
            icon: <CalendarEvent size={22} className="text-success" />,
            title: t('home.calendar'),
            desc: t('home.calendarDesc'),
            path: "/home/calendar",
          },
          {
            icon: <Kanban size={22} className="text-info" />,
            title: t('home.lists'),
            desc: t('home.listsDesc'),
            path: "/home/lists",
          },
          {
            icon: <ListTask size={22} className="text-warning" />,
            title: t('home.teams'),
            desc: t('home.teamsDesc'),
            path: "/home/teams",
          },
        ].map((item, i) => (
          <Col key={i} xs={12} sm={4} lg={3}>
            <Card
              className="border rounded-3 h-100"
              role="button"
              tabIndex={0}
              onClick={() => navigate(item.path)}
              onKeyDown={(e) => e.key === "Enter" && navigate(item.path)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="d-flex flex-column align-items-center text-center py-4">
                <div className="mb-3 p-2 rounded-circle bg-body-tertiary">
                  {item.icon}
                </div>
                <h6 className="fw-semibold mb-1">{item.title}</h6>
                <small className="text-muted">{item.desc}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Stats ──────────────────────────────────────────── */}
      <Row className="justify-content-center mb-4 g-3">
        {[
          {
            icon: <CheckCircleFill size={18} className="text-primary mb-1" />,
            value: loading ? "—" : (summary?.totalTasks ?? 0),
            label: t('home.totalTasks'),
          },
          {
            icon: <ClockHistory size={18} className="text-success mb-1" />,
            value: loading ? "—" : (summary?.totalLists ?? 0),
            label: t('home.listsCreated'),
          },
          {
            icon: <CalendarCheck size={18} className="text-info mb-1" />,
            value: loading ? "—" : (summary?.nextEvents?.length ?? 0),
            label: t('home.upcomingEvents'),
          },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={4} lg={3}>
            <Card className="text-center border rounded-3">
              <Card.Body className="py-4">
                {s.icon}
                <h2
                  className="fw-bold mb-0 mt-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {s.value}
                </h2>
                <small className="text-muted">{s.label}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Completion progress ────────────────────────────── */}
      {!loading && totalRecent > 0 && (
        <Row className="justify-content-center mb-4">
          <Col lg={10} xl={9}>
            <Card className="border rounded-3">
              <Card.Body className="py-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted fw-semibold">
                    {t('home.recentTasksProgress')}
                  </small>
                  <Badge
                    bg={completionPct === 100 ? "success" : "primary"}
                    pill
                  >
                    {completedCount}/{totalRecent} {t('home.completed')}
                  </Badge>
                </div>
                <ProgressBar
                  now={completionPct}
                  variant={completionPct === 100 ? "success" : "primary"}
                  style={{ height: 6 }}
                  className="rounded-pill"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* ── Activity ───────────────────────────────────────── */}
      <Row className="justify-content-center mb-5 g-4">
        {/* Recent Tasks */}
        <Col md={6} lg={5}>
          <Card className="border rounded-3 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6
                  className="text-uppercase text-muted fw-semibold mb-0"
                  style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}
                >
                  {t('home.recentTasks')}
                </h6>
                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none p-0"
                  onClick={() => navigate("/home/tasks")}
                >
                  {t('home.viewAll')} <ArrowRight size={12} />
                </Button>
              </div>

              {loading ? (
                <SkeletonRows />
              ) : error ? (
                <Empty text={t('home.errorLoadingTasks')} />
              ) : !summary?.recentTasks?.length ? (
                <Empty text={t('home.noTasksYet')} />
              ) : (
                summary.recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="d-flex justify-content-between align-items-center border-bottom py-2"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/home/tasks/${task.id}`)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && navigate(`/home/tasks/${task.id}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className="fw-medium text-truncate me-2"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {task.nameOfTask}
                    </span>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <Badge
                        pill
                        bg={STATE_MAP[task.state]?.bg || "secondary"}
                        style={{ fontSize: "0.6875rem" }}
                      >
                        {t('states.' + task.state)}
                      </Badge>
                      <small
                        className="text-muted"
                        style={{ fontSize: "0.8125rem" }}
                      >
                        {formatDate(task.creationDate)}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Events */}
        <Col md={6} lg={5}>
          <Card className="border rounded-3 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6
                  className="text-uppercase text-muted fw-semibold mb-0"
                  style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}
                >
                  {t('home.upcomingEventsTitle')}
                </h6>
                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none p-0"
                  onClick={() => navigate("/home/calendar")}
                >
                  {t('home.viewCalendar')} <ArrowRight size={12} />
                </Button>
              </div>

              {loading ? (
                <SkeletonRows />
              ) : error ? (
                <Empty text={t('home.errorLoadingEvents')} />
              ) : !summary?.nextEvents?.length ? (
                <Empty text={t('home.noUpcomingEvents')} />
              ) : (
                summary.nextEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="d-flex align-items-start gap-2 border-bottom py-2"
                  >
                    <CalendarEvent
                      size={14}
                      className="text-primary mt-1 flex-shrink-0"
                    />
                    <div>
                      <p
                        className="mb-0 fw-medium"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {evt.nameOfTask}
                      </p>
                      <small className="text-muted">
                        {formatDateTime(evt.startTime)}
                        {evt.endTime ? ` — ${formatDateTime(evt.endTime)}` : ""}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-top pt-4 mt-auto pb-3">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Row>
              <Col md={4} className="mb-3 mb-md-0">
                <h6 className="fw-semibold">{t('app.name')}</h6>
                <p className="text-muted small mb-0">
                  {t('home.simplifyingTaskMgmt')}
                </p>
              </Col>
              <Col md={4} className="mb-3 mb-md-0">
                <div className="d-flex gap-3">
                  <a
                    href="https://fiopans1.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted text-decoration-none small"
                  >
                    Website
                  </a>
                  <a
                    href="https://www.linkedin.com/in/fiopans1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted text-decoration-none small"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://github.com/fiopans1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted text-decoration-none small"
                  >
                    GitHub
                  </a>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <p className="text-muted small mb-0">
                  {t('home.footer')} · {t('home.createdBy')}{" "}
                  <a
                    href="https://github.com/fiopans1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    fiopans1
                  </a>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
      </footer>
    </Container>
  );
};

export default Home;
