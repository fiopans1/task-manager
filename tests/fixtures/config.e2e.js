/**
 * Runtime configuration used by the E2E workflow.
 * Copy it to frontend/public/config.js before starting Vite in CI.
 */
window.APP_CONFIG = {
  api: {
    baseUrl: "",
  },
  oauth2: {
    enabled: true,
    google: { enabled: true },
    github: { enabled: true },
    authentik: { enabled: false },
  },
  app: {
    name: "Task Manager",
    siteUrl: "",
    version: "0.6-beta",
    debug: false,
    license: "Community Edition",
  },
  session: {
    inactivityThresholdMinutes: 10,
  },
  features: {
    calendar: true,
    lists: true,
    timeTracking: true,
  },
};
