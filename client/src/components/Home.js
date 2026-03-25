import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import homeService from "../services/homeService";

/* ── tiny helpers ─────────────────────────────────────────────── */
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const stateLabel = {
  NEW: "Nuevo",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  PAUSSED: "Pausada",
};

const stateStyle = {
  NEW: { background: "#e0f2fe", color: "#0369a1" },
  IN_PROGRESS: { background: "#fef9c3", color: "#854d0e" },
  COMPLETED: { background: "#dcfce7", color: "#166534" },
  CANCELLED: { background: "#fee2e2", color: "#991b1b" },
  PAUSSED: { background: "#f3e8ff", color: "#6b21a8" },
};

/* ── skeleton placeholders ───────────────────────────────────── */
const SkeletonLine = ({ width = "100%" }) => (
  <div
    className="home-skeleton"
    style={{ width, height: 14, borderRadius: 6, marginBottom: 10 }}
  />
);

const SkeletonRow = () => (
  <div style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--home-border)" }}>
    <SkeletonLine width="40%" />
    <SkeletonLine width="20%" />
    <SkeletonLine width="25%" />
  </div>
);

/* ── empty state ─────────────────────────────────────────────── */
const EmptyState = ({ message }) => (
  <div className="home-empty-state">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
    <p>{message}</p>
  </div>
);

/* ── main component ──────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    homeService
      .getHomeSummary()
      .then((data) => { if (!cancelled) setSummary(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="home-root">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home-hero">
        <h1 className="home-hero-title">Task Manager</h1>
        <p className="home-hero-text">
          Un espacio diseñado para volcar todas tus ideas, organizar el caos
          cotidiano y recuperar el enfoque que necesitas. Task Manager no
          pretende deslumbrarte con colores brillantes ni con decenas de
          funcionalidades que jamás usarás; en su lugar, te ofrece una
          superficie limpia donde cada tarea encuentra su sitio, cada fecha
          límite se visualiza de un vistazo y cada proyecto avanza sin
          distracciones.
        </p>
        <p className="home-hero-text">
          Creemos en la productividad silenciosa: esa que nace cuando la
          herramienta desaparece y solo queda tu trabajo. Sin ruido visual, sin
          notificaciones innecesarias, sin curvas de aprendizaje. Abre la
          aplicación, escribe lo que necesitas hacer, y déjala que haga el
          resto. Así de simple, así de claro.
        </p>
        <p className="home-hero-text">
          Ya sea que estés gestionando un proyecto personal, coordinando un
          equipo o simplemente intentando no olvidar lo importante, Task Manager
          se adapta a ti. Listas, calendarios, estados y prioridades conviven
          en armonía para que tú te centres en lo que de verdad importa:
          avanzar.
        </p>
        <button className="home-cta" onClick={() => navigate("/home/tasks")}>
          Comenzar →
        </button>
      </section>

      {/* ── Stats row ────────────────────────────────────────── */}
      <section className="home-stats">
        <div className="home-stat-card">
          <span className="home-stat-number">
            {loading ? "—" : summary?.totalTasks ?? 0}
          </span>
          <span className="home-stat-label">Tareas</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-number">
            {loading ? "—" : summary?.totalLists ?? 0}
          </span>
          <span className="home-stat-label">Listas</span>
        </div>
        <div className="home-stat-card">
          <span className="home-stat-number">
            {loading ? "—" : summary?.nextEvents?.length ?? 0}
          </span>
          <span className="home-stat-label">Próximos eventos</span>
        </div>
      </section>

      {/* ── Activity section ─────────────────────────────────── */}
      <section className="home-grid">
        {/* Recent Tasks */}
        <div className="home-panel">
          <h2 className="home-panel-title">Tareas recientes</h2>
          {loading ? (
            <div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error ? (
            <EmptyState message="Error al cargar las tareas." />
          ) : !summary?.recentTasks?.length ? (
            <EmptyState message="Aún no has creado ninguna tarea." />
          ) : (
            <div className="home-table">
              <div className="home-table-header">
                <span>Tarea</span>
                <span>Estado</span>
                <span>Fecha</span>
              </div>
              {summary.recentTasks.map((task) => (
                <div
                  className="home-table-row"
                  key={task.id}
                  onClick={() => navigate(`/home/tasks/${task.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/home/tasks/${task.id}`)}
                >
                  <span className="home-task-name">{task.nameOfTask}</span>
                  <span>
                    <span
                      className="home-badge"
                      style={stateStyle[task.state] || {}}
                    >
                      {stateLabel[task.state] || task.state}
                    </span>
                  </span>
                  <span className="home-date">
                    {formatDate(task.creationDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="home-panel">
          <h2 className="home-panel-title">Próximos eventos</h2>
          {loading ? (
            <div>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error ? (
            <EmptyState message="Error al cargar los eventos." />
          ) : !summary?.nextEvents?.length ? (
            <EmptyState message="No hay eventos próximos programados." />
          ) : (
            <div className="home-events-list">
              {summary.nextEvents.map((evt) => (
                <div className="home-event-card" key={evt.id}>
                  <div className="home-event-dot" />
                  <div>
                    <p className="home-event-name">{evt.nameOfTask}</p>
                    <p className="home-event-time">
                      {formatDateTime(evt.startTime)}
                      {evt.endTime ? ` — ${formatDateTime(evt.endTime)}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <span className="home-footer-logo">TaskManager</span>
            <p className="home-footer-copy">
              Simplificando la gestión de tareas desde 2025.
            </p>
          </div>
          <div className="home-footer-links">
            <a
              href="https://fiopans1.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
            <a
              href="https://www.linkedin.com/in/fiopans1/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/fiopans1"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="home-footer-bottom">
          © 2025 TaskManager · Creado por{" "}
          <a
            href="https://github.com/fiopans1"
            target="_blank"
            rel="noopener noreferrer"
          >
            fiopans1
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
