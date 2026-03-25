import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Placeholder,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import homeService from "../services/homeService";

/* ── helpers ─────────────────────────────────────────────────── */
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATE_MAP = {
  NEW: { label: "Nuevo", bg: "info" },
  IN_PROGRESS: { label: "En progreso", bg: "warning" },
  COMPLETED: { label: "Completada", bg: "success" },
  CANCELLED: { label: "Cancelada", bg: "danger" },
  PAUSSED: { label: "Pausada", bg: "secondary" },
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

  return (
    <Container
      fluid
      className="py-4 px-4 overflow-auto"
      style={{ height: "100vh" }}
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      <Row className="justify-content-center mb-5">
        <Col lg={8} xl={7} className="text-center py-5">
          <h1 className="fw-bold mb-4" style={{ letterSpacing: "-0.025em" }}>
            Task Manager
          </h1>
          <p className="text-muted mb-3" style={{ lineHeight: 1.75 }}>
            Un espacio diseñado para volcar todas tus ideas, organizar el caos
            cotidiano y recuperar el enfoque que necesitas. Task Manager no
            pretende deslumbrarte con colores brillantes ni con decenas de
            funcionalidades que jamás usarás; en su lugar, te ofrece una
            superficie limpia donde cada tarea encuentra su sitio, cada fecha
            límite se visualiza de un vistazo y cada proyecto avanza sin
            distracciones.
          </p>
          <p className="text-muted mb-3" style={{ lineHeight: 1.75 }}>
            Creemos en la productividad silenciosa: esa que nace cuando la
            herramienta desaparece y solo queda tu trabajo. Sin ruido visual,
            sin notificaciones innecesarias, sin curvas de aprendizaje. Abre la
            aplicación, escribe lo que necesitas hacer, y déjala que haga el
            resto. Así de simple, así de claro.
          </p>
          <p className="text-muted mb-4" style={{ lineHeight: 1.75 }}>
            Ya sea que estés gestionando un proyecto personal, coordinando un
            equipo o simplemente intentando no olvidar lo importante, Task
            Manager se adapta a ti. Listas, calendarios, estados y prioridades
            conviven en armonía para que tú te centres en lo que de verdad
            importa: avanzar.
          </p>
          <Button
            variant="dark"
            className="rounded-3 px-4"
            onClick={() => navigate("/home/tasks")}
          >
            Comenzar →
          </Button>
        </Col>
      </Row>

      {/* ── Stats ──────────────────────────────────────────── */}
      <Row className="justify-content-center mb-5 g-3">
        {[
          {
            value: loading ? "—" : summary?.totalTasks ?? 0,
            label: "Tareas",
          },
          {
            value: loading ? "—" : summary?.totalLists ?? 0,
            label: "Listas",
          },
          {
            value: loading ? "—" : summary?.nextEvents?.length ?? 0,
            label: "Próximos eventos",
          },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={4} lg={3}>
            <Card className="text-center border rounded-3">
              <Card.Body className="py-4">
                <h2
                  className="fw-bold mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {s.value}
                </h2>
                <small className="text-muted" style={{ letterSpacing: "0.03em" }}>
                  {s.label}
                </small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Activity ───────────────────────────────────────── */}
      <Row className="justify-content-center mb-5 g-4">
        {/* Recent Tasks */}
        <Col md={6} lg={5}>
          <Card className="border rounded-3 h-100">
            <Card.Body>
              <h6
                className="text-uppercase text-muted fw-semibold mb-3"
                style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}
              >
                Tareas recientes
              </h6>

              {loading ? (
                <SkeletonRows />
              ) : error ? (
                <Empty text="Error al cargar las tareas." />
              ) : !summary?.recentTasks?.length ? (
                <Empty text="Aún no has creado ninguna tarea." />
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
                        {STATE_MAP[task.state]?.label || task.state}
                      </Badge>
                      <small className="text-muted" style={{ fontSize: "0.8125rem" }}>
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
              <h6
                className="text-uppercase text-muted fw-semibold mb-3"
                style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}
              >
                Próximos eventos
              </h6>

              {loading ? (
                <SkeletonRows />
              ) : error ? (
                <Empty text="Error al cargar los eventos." />
              ) : !summary?.nextEvents?.length ? (
                <Empty text="No hay eventos próximos programados." />
              ) : (
                summary.nextEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="d-flex align-items-start gap-2 border-bottom py-2"
                  >
                    <span
                      className="rounded-circle bg-secondary mt-1 flex-shrink-0"
                      style={{ width: 8, height: 8 }}
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
      <footer className="border-top pt-4 mt-4 pb-3">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Row>
              <Col md={4} className="mb-3 mb-md-0">
                <h6 className="fw-semibold">TaskManager</h6>
                <p className="text-muted small mb-0">
                  Simplificando la gestión de tareas desde 2025.
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
                  © 2025 TaskManager · Creado por{" "}
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
