# Task Manager

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Java 23](https://img.shields.io/badge/Java-23-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/23/)
[![Spring Boot 3.4](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![pnpm](https://img.shields.io/badge/pnpm-required-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![VitePress](https://img.shields.io/badge/Docs-VitePress-5C73BF?logo=vitepress&logoColor=white)](https://vitepress.dev)

A self-hosted task management platform for teams and individuals who need a real workflow — tasks with states and priorities, custom lists, calendar planning, team collaboration, time tracking, OAuth2 login, and a deployment model that runs entirely on your own infrastructure.

Designed to be a modern open-source alternative to commercial task tools, with no vendor lock-in: your data stays in a SQLite database on your server, and the entire stack ships as a single Caddy-served bundle.

---

## What you get

### For end users

- **Tasks** with name, description, state, priority, optional start/end dates (events)
- **Custom lists** to group tasks by project, area, or context, with progress tracking
- **Calendar** view of all events with month, week and day layouts
- **Teams** with members, roles, invitations, task assignment and a per-team dashboard
- **Comments / actions** on tasks for traceability
- **Search** across tasks and lists with infinite scroll pagination
- **Dark mode** and a responsive layout for desktop and mobile
- **Idle session** modal that warns you before the session expires

### For administrators

- **User management** (search, view per-user tasks/lists/teams, block or unblock)
- **Feature flags** to enable or disable sections (`My Tasks`, `Calendar`, `Lists`, `Teams`) for everyone
- **System message** that can be shown before login, after login, or both
- **Local credentials** plus **OAuth2** with Google, GitHub and Authentik

### For operators

- **Single binary** deployment via Caddy + packaged JAR + static frontend
- **Docker** multi-arch build script (`linux/amd64`, `linux/arm64`, `linux/arm/v7`)
- **Runtime configuration** without rebuilding: `application.properties` on the backend, `config.js` on the frontend
- **AGPL-3.0** licensed — your modifications stay open if you redistribute

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | Java 23 · Spring Boot 3.4 · Spring Security · Spring Data JPA · Hibernate · nimbus-jose-jwt |
| Persistence | SQLite by default (any JPA-compatible database works) |
| Auth | Session cookies (`HttpOnly`) + JWT signed with RSA + CSRF + OAuth2 (Google, GitHub, Authentik) |
| Frontend | React 18 · Vite · Redux Toolkit · React Router 7 · React Bootstrap 2 · Bootstrap 5 |
| Toasts | Sonner |
| HTTP client | Axios with CSRF + 401 refresh interceptors |
| Docs | VitePress (bilingual `/es` and `/en`) |
| Reverse proxy | Caddy |
| Container | Multi-arch Docker (`Dockerfile.deployment`) |

---

## Screenshots

> Drop screenshots in `docs/.vuepress/public/` and link them here. Suggested shots:
> the landing page, the tasks list, the calendar, a team dashboard, the admin panel,
> and the dark-mode variant.

| Section | Light | Dark |
| --- | --- | --- |
| Dashboard | _todo_ | _todo_ |
| Tasks | _todo_ | _todo_ |
| Calendar | _todo_ | _todo_ |
| Teams | _todo_ | _todo_ |
| Admin | _todo_ | _todo_ |

---

## Quick start

### Prerequisites

- **Java 23** with the toolchain auto-downloaded by the Maven wrapper
- **Node.js 20+** with **Corepack** enabled (Node 20+ ships Corepack)
- **Python 3.8+** for the packaging script
- **OpenSSL** to generate the RSA key pair on first run

### 1. Clone and generate the RSA key pair

The backend signs its JWTs with an RSA key. The shipped `application.properties` references an absolute path from the original author's machine, so on a fresh clone you need to generate your own pair:

```bash
git clone https://github.com/fiopans1/task-manager.git
cd task-manager
mkdir -p backend/src/main/resources/jwtKeys
openssl genrsa -out backend/src/main/resources/jwtKeys/private_key.pem 2048
openssl rsa -in backend/src/main/resources/jwtKeys/private_key.pem -pubout \
  -out backend/src/main/resources/jwtKeys/public_key.pem
```

Or use the helper:

```bash
python3 scripts/bin_files/key_generator.py
```

> **Heads up:** the dev profile has `spring.jpa.hibernate.ddl-auto=create`, which **wipes the database on every restart**. Change it to `update` in `application.properties` (or copy the production template) if you need persistent data while iterating.

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

API on `http://localhost:8080` · health probe at `GET /health`.

### 3. Start the frontend

```bash
cd frontend
corepack pnpm install --frozen-lockfile
cp ../scripts/config_templates/config.template.js public/config.js
corepack pnpm start
```

App on `http://localhost:3000`. Vite proxies `/api`, `/auth` and `/oauth2/` to the backend.

### 4. (Optional) Run the docs site

```bash
cd docs
corepack pnpm install
corepack pnpm docs:dev
```

Bilingual portal on `http://localhost:4173` (`/es/` and `/en/`).

### First-time user

1. Open the app and click **Create account**.
2. Register with a username, email and password.
3. You land in the dashboard. From the sidebar, **My Tasks → New Task** to create your first task.
4. To enable Google/GitHub/Authentik login, edit `application.properties` and `frontend/public/config.js` — see [Configuration](#configuration).

---

## Configuration

Task Manager splits configuration across three files so you can change behaviour without rebuilding.

| File | What it controls | When it loads |
| --- | --- | --- |
| `backend/src/main/resources/application.properties` | Server port, database URL, CORS, cookie/CSRF settings, OAuth2 client IDs, default user creation | At backend startup |
| `frontend/public/config.js` | `api.baseUrl`, OAuth2 provider flags, app name/version/siteUrl, session inactivity threshold, feature flags | At frontend startup, before React mounts |
| `task-manager/config/Caddyfile` (packaged) | TLS, reverse proxy, static asset cache, security headers | At Caddy startup |

Templates live under `scripts/config_templates/`. `scripts/compile.py --action deploy` ships them as part of the distributable ZIP.

Example `config.js`:

```js
window.APP_CONFIG = {
  api: {
    // Empty for dev (Vite proxy); set to the backend URL in production.
    baseUrl: ""
  },
  oauth2: {
    enabled: true,
    google:   { enabled: true },
    github:   { enabled: true },
    authentik: { enabled: false }
  },
  app: {
    name: "Task Manager",
    siteUrl: "https://tasks.example.com",
    version: "0.6-beta"
  },
  session: { inactivityThresholdMinutes: 10 },
  features: { calendar: true, lists: true, timeTracking: true }
}
```

Full reference: [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

---

## Security

The authentication model is **session cookies with CSRF**, not bearer tokens.

- **`HttpOnly` access cookie** (`TM-ACCESS`, path `/api`) and refresh cookie (`TM-REFRESH`, path `/api/session`) — the frontend cannot read them.
- **Readable `XSRF-TOKEN` cookie** + `X-XSRF-TOKEN` header for state-changing requests. The frontend primes the token via `GET /api/session/csrf` before the first write.
- **JWT signed with RSA** inside the cookie. The backend validates the signature, expiration, and that the session is still active in the DB.
- **OAuth2** through Spring Security OAuth2 Client. Toggle providers per environment via `taskmanager.oauth2.<provider>.enabled`.
- **CORS with credentials** limited to `taskmanager.security.cors.allowed-origins`.
- **SameSite=None** requires `cookies.secure=true`; the `SessionCookieService` fails to start otherwise.
- **Idle timeout modal** warns the user 60 seconds before the session expires.

When integrating against the API, treat it as a browser-session backend, not a bearer-token API.

For vulnerability reports see [SECURITY.md](SECURITY.md).

---

## Deployment

### Docker (recommended)

Multi-arch image built from `docker/Dockerfile.deployment`:

```bash
./docker/build.sh --platform linux/amd64
./docker/build.sh --multi                              # amd64 + arm64
./docker/build.sh --platform linux/amd64 --push \
  --tag ghcr.io/your-org/taskmanager:1.0
```

See [docker/README.md](docker/README.md) for the full flag list.

### Classic package (no Docker)

`scripts/compile.py` produces a self-contained `TaskManager.zip` with backend, frontend, Caddy binary and configuration templates:

```bash
cd scripts
python3 compile.py --action deploy
```

Unzip, edit `config/application.properties` and `config/Caddyfile`, then start with `python3 bin_files/start.py --start-all`. End-to-end walkthrough in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Repository layout

```text
task-manager/
├── backend/                 # Spring Boot API, security, persistence
│   └── src/main/java/com/taskmanager/application/
│       ├── controller/      # REST endpoints (/api/*, /auth/*)
│       ├── service/         # Business logic
│       ├── service/oauth2providers/  # Google, GitHub, Authentik
│       ├── security/        # JWT, CSRF, OAuth2, cookie filters
│       ├── config/          # WebSecurityConfig, CsrfConfig, properties
│       ├── model/entities/  # JPA entities
│       ├── model/dto/       # API contracts
│       └── respository/     # Spring Data repositories
├── frontend/                # React + Vite SPA
│   ├── public/              # config.js, sitemap.xml, manifest.json
│   ├── src/components/      # auth/, common/, tasks/, lists/, teams/, adminpanel/
│   ├── src/services/        # apiClient, authService, taskService, …
│   ├── src/redux/           # store.js + slices/authSlice.js
│   └── src/hooks/           # useInfiniteScroll (client + server)
├── docs/                    # VitePress bilingual portal (es/, en/)
├── docker/                  # Dockerfile.deployment, build.sh
├── scripts/                 # compile.py, key_generator.py, templates
└── application/             # Legacy Spring Boot skeleton — ignore
```

`application/` is a historical skeleton, not the active backend.

---

## Documentation

The full documentation portal is maintained inside the repo as a VitePress site, mirrored in Spanish and English:

- 🇪🇸 **[docs/es/](docs/es/)** — Primeros pasos, Guía de usuario, Guía de desarrollo, Arquitectura, Despliegue
- 🇬🇧 **[docs/en/](docs/en/)** — Getting started, User guide, Developer guide, Architecture, Deployment

Standalone references:

- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) — every config key
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — production deploy walkthrough
- [docs/TECHNICAL_EN.md](docs/TECHNICAL_EN.md) / [TECHNICAL_ES.md](docs/TECHNICAL_ES.md) — deep technical docs
- [AGENTS.md](AGENTS.md) — internal conventions for AI/agent sessions

---

## Contributing

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Check [SECURITY.md](SECURITY.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
3. Keep pull requests focused on a single change. Update both `docs/en` and `docs/es` when behaviour changes.
4. Use Corepack for pnpm. Use react-bootstrap, not raw CSS. Go through `frontend/src/components/common/Noty.js` for toasts. See [AGENTS.md](AGENTS.md) for the full conventions list.

---

## License

Task Manager is licensed under the **GNU Affero General Public License v3.0**.

That means you can use it, modify it, and self-host it freely. If you distribute a modified version over a network, you must also publish your modifications under the same license.

See [LICENSE](LICENSE) for the full text.
