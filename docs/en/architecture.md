# Architecture

Task Manager ships as a single product combining a backend, a frontend and a packaging layer. This page explains how the pieces fit together, what each one does and why they are split the way they are.

## Overview

There are three processes in production:

- **The backend**, a Spring Boot application that exposes a REST API, owns the security, persists the data and issues the sessions.
- **The frontend**, a React SPA served as static files. All user interaction goes through it.
- **The reverse proxy** (Caddy in the generated packages), which terminates TLS, serves the frontend's static assets and forwards calls that begin with `/api`, `/auth` or `/oauth2` to the backend.

In development the proxy is replaced by Vite's own server, which already forwards those same routes to `http://localhost:8080`.

## Repository layout

```text
task-manager/
├── backend/                # Spring Boot
│   ├── src/main/java/com/taskmanager/application/
│   │   ├── controller/     # REST endpoints
│   │   ├── service/        # Business logic
│   │   ├── service/oauth2providers/   # Per-provider OAuth2 adapters
│   │   ├── security/       # JWT, CSRF, OAuth2, cookie filters
│   │   ├── config/         # Spring beans, external properties
│   │   ├── model/entities/ # JPA model
│   │   ├── model/dto/      # API contracts
│   │   ├── model/exceptions/, validations/
│   │   ├── respository/    # JPA repositories (note: historical typo)
│   │   ├── context/, utils/
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── log-config.xml
│   │   └── jwtKeys/        # RSA pair used to sign JWTs (gitignored)
│   ├── pom.xml
│   └── mvnw
│
├── frontend/               # React + Vite
│   ├── public/             # config.js, sitemap.xml, robots.txt, manifest.json, logos
│   ├── scripts/            # pnpm hooks (predev/prestart)
│   ├── src/
│   │   ├── components/     # UI components, grouped by domain
│   │   │   ├── auth/       # Login, register, OAuth2 callback, protected route
│   │   │   ├── common/     # Seo, FeatureGuard, modals, toast system
│   │   │   ├── tasks/, lists/, teams/, calendar/
│   │   │   ├── adminpanel/
│   │   │   ├── session/    # Inactivity modal and refresh
│   │   │   └── Sidebar/
│   │   ├── pages/          # HomePage, MainApp (authenticated layout)
│   │   ├── services/       # apiClient, authService, taskService, ...
│   │   ├── redux/          # store.js + slices/ (only authSlice today)
│   │   ├── hooks/          # useInfiniteScroll
│   │   └── context/        # ThemeContext
│   ├── vite.config.js
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── docs/                   # Bilingual VitePress portal (es/, en/)
├── docker/                 # Dockerfile.deployment + build.sh
├── scripts/                # compile.py and configuration templates
└── application/            # Old Spring Boot skeleton, no longer used
```

`application/` is a leftover skeleton from the project history. It is not the active backend: if you are touching Java, work in `backend/`. It is kept for historical context and to avoid breaking external references.

## The backend

### Responsibilities

- Validating credentials (local and OAuth2).
- Issuing and validating RSA-signed tokens.
- Persisting and serving the data model.
- Enforcing authorization rules (system role, team role, list membership, etc.).
- Exposing REST endpoints under `/api/*` and `/auth/*`.

### Layers and packages

Inside `com.taskmanager.application.*` the split is:

| Layer | Package | Function |
| --- | --- | --- |
| Controllers | `controller/` | Receive HTTP, validate input, delegate to services and return DTOs. |
| Services | `service/` | Business rules, transactions, composition between repositories. |
| OAuth2 services | `service/oauth2providers/` | Per-provider adapters (Google, GitHub). |
| Security | `security/` | Filters, cookie handling, OAuth2 success/failure handlers. |
| Configuration | `config/` | `WebSecurityConfig`, `CsrfConfig`, external properties. |
| Data model | `model/entities/` | JPA entities. |
| Contracts | `model/dto/` | What travels over the API; converts to/from entities. |
| Repositories | `respository/` | Spring Data interfaces. (Historical typo: `respository`, missing second `o`.) |
| Utilities | `utils/`, `context/` | Helpers and auxiliary beans. |

### Main entities

- `User` — local account or linked to an `AuthProvider` (Google, GitHub, Authentik). Has `FullName` with first name and two surnames.
- `AuthSession` and `RefreshToken` — active sessions and persisted refresh tokens.
- `RoleOfUser` and `AuthorityOfRole` — system roles (`BASIC`, `ADMIN`) and their authorities.
- `Task` — the functional core. Optional `EventTask` for dates, optional `ListTM`, optional `Team`, and a history of `ActionTask` (comments, edits, creation).
- `TaskAssignmentHistory` — who reassigned which task to whom, when, and from which team.
- `ListTM` — grouping of tasks with a colour. (Name uses the `TM` suffix to avoid clashing with `java.util.List`.)
- `Team` — groups users via `TeamMember` with a `TeamRole` (`ADMIN` or `MEMBER`).
- `TeamInvitation` — pending, accepted or rejected invitations, with their token.
- `AppConfig` — key/value for flags and system messages.

### Lifecycle of an authenticated request

1. The frontend makes a request with `withCredentials: true`, so the browser sends the cookies.
2. `JWTAuthorizationFilter` reads the access cookie, validates the RSA signature, expiration and that the session is still active.
3. If everything checks out, the request reaches the controller. Otherwise it returns 401.
4. The controller delegates to a service. Services apply rules (for example, "only the team admin can invite").
5. For write operations, the CSRF filter has already required a `XSRF-TOKEN` cookie and a matching `X-XSRF-TOKEN` header. If missing, the request returns 403.
6. The response goes back to the frontend as a DTO (JPA entities are never exposed directly).

### Endpoints by domain

| Prefix | Controller | Use |
| --- | --- | --- |
| `/auth/login`, `/auth/register` | `AuthRestController` | Local login and account creation. |
| `/api/session/me`, `/csrf`, `/refresh`, `/logout` | `SessionRestController` | Session state and tokens. |
| `/api/tasks/...` | `TaskRestController` | Task CRUD, actions, events. |
| `/api/lists/...` | `ListRestController` | List CRUD, add/remove tasks. |
| `/api/teams/...` | `TeamRestController` | Teams, members, invitations, assignments, dashboard. |
| `/api/admin/...` | `AdminRestController` | Users, flags, messages. ADMIN only. |
| `/api/home-summary` | `HomeRestController` | Aggregated data for the main dashboard. |
| `/api/user/...` | `UserRestController` | (Reserved for the user profile.) |
| `/api/config` | `AppConfigRestController` | Public configuration consumed by the frontend. |
| `/oauth2/authorization/{provider}`, `/oauth2/callback/{provider}` | `WebSecurityConfig` | Social login start and finish. |
| `/health` | `HealthCheckRestController` | Liveness probe. |

## The frontend

### Responsibilities

- Render the SPA.
- Hold the authentication state (Redux Toolkit) and the visual theme (Context).
- Talk to the API through a single HTTP client with CSRF and automatic refresh.
- Adapt the experience to desktop and mobile with Bootstrap and `react-bootstrap`.

### Layers and packages

- `services/` — the only place the app talks to the backend. Each domain (tasks, lists, teams, admin, auth, home) has its own service.
- `redux/` — only `authSlice` for now. The store does not use `redux-persist` even though it is a dependency.
- `hooks/` — only `useInfiniteScroll` (client and server side) shared by long lists.
- `components/` — organised by functional domain (`tasks/`, `lists/`, `teams/`, `adminpanel/`, etc.) with `common/` for cross-cutting concerns.
- `pages/` — `HomePage` (public) and `MainApp` (authenticated layout with `<Outlet />`).
- `context/` — `ThemeContext` for light/dark mode.

### Routing

- Public routes: `/`, `/login`, `/register` and `/oauth2-login`.
- Authenticated routes live under `/home` with a common layout (`MainApp`) that mounts `SidebarMenu`, the session modal and the system message modal. Children: `/home`, `/home/tasks`, `/home/tasks/:id`, `/home/calendar`, `/home/lists`, `/home/lists/:id`, `/home/teams`, `/home/teams/:id`, `/home/admin`.
- `<ProtectedRoute>` redirects to `/login` if there is no session.
- `<FeatureGuard>` hides routes whose feature flag is disabled.

### SEO

`<Seo>` (`components/common/Seo.jsx`) wraps each view with `react-helmet-async` and sets the title, description, canonical URL and Open Graph / Twitter meta. Absolute URLs are built from `app.siteUrl` in `config.js`, falling back to `window.location.origin` if empty. Authenticated routes and the OAuth2 callback use `noindex` so they aren't indexed.

## Configuration by layer

There are three configuration files generated at deploy time from templates and mounted without recompiling:

| Layer | File | Template |
| --- | --- | --- |
| Backend | `config/application.properties` | `scripts/config_templates/application-properties.template` |
| Frontend | `lib/frontend/config.js` | `scripts/config_templates/config.template.js` |
| Reverse proxy | `config/Caddyfile` | `scripts/config_templates/Caddyfile.template` |

The frontend does not read build-time environment variables; it loads `config.js` in `<head>` before mounting React. That makes it possible to change the backend URL, the active OAuth2 providers, the feature flags and the system messages at runtime, without a rebuild.

The backend, in contrast, reads its properties at startup. Everything sensitive (token TTLs, CORS, cookies, CSRF, OAuth2) is grouped under the `taskmanager.security.*` prefix and mapped with `TaskManagerSecurityProperties`. Switching the cookie to `SameSite=None` requires `cookies.secure=true`; the cookie service fails to start if that combination is not respected.

## Persistence

- **SQLite** is the default, in the working directory (`jdbc:sqlite:task-manager.db?foreign_keys=on`). It is enough for personal use or small teams.
- The model uses **JPA/Hibernate** on top of SQLite's community dialect. In development `ddl-auto=create` regenerates the schema on every start; in production it is changed to `update` from the template.
- The repository layer lives in `respository/` (no second `o`); it is a typo that has stuck. Don't fix it halfway, it would break external imports.
- For larger environments change the driver, the dialect and `ddl-auto` in `application.properties`. The package structure doesn't assume SQLite beyond the driver.

## Security

The model is **session with cookies + CSRF**, not bearer tokens:

- **`HttpOnly` cookies** for the access token (`TM-ACCESS`, path `/api`) and the refresh (`TM-REFRESH`, path `/api/session`). The frontend cannot read them.
- **Readable `XSRF-TOKEN` cookie** and `X-XSRF-TOKEN` header to authorise write operations. The frontend obtains the token with a `GET /api/session/csrf` before the first write and `axios` attaches it automatically.
- **JWT signed with RSA** inside the cookie; the backend validates the signature, expiration and that the session is still active in the database.
- **OAuth2** supported through Spring Security OAuth2 Client: `google`, `github` and `authentik`, switchable per property.
- **CORS** with credentials only for the origins listed in `taskmanager.security.cors.allowed-origins`.

## Packaged operations

`scripts/compile.py --action deploy` produces a ZIP with everything needed:

1. Compiles the backend with Maven and leaves the executable JAR.
2. Builds the frontend with pnpm and leaves the bundle in `build/`.
3. Downloads Caddy and copies the binary.
4. Copies the configuration templates into the package's `config/` directory.
5. Generates `TaskManager.zip`, ready to upload to a server.

Operational details are in the deployment guide.

## When something changes

- New backend key: add it to `scripts/config_templates/application-properties.template` and document it.
- New frontend option: `config.template.js` + `configService` + `window.APP_CONFIG`.
- New OAuth2 provider: implement the adapter in `service/oauth2providers/`, add the registrations in `application.properties` and a flag in `oauth2.<provider>.enabled` in `config.js`.
- New public route: import `<Seo />` and add it to `sitemap.xml` if it should be indexed; if it is a callback or authenticated route, use `noindex`.
- User-visible change: update `docs/en` and `docs/es`.
