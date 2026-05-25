# Developer guide

## Actual project stack

| Layer | Main technology |
| --- | --- |
| Backend | Spring Boot 3.4.1 |
| Backend language | Java 23 |
| Persistence | JPA/Hibernate + SQLite |
| Frontend | React 18 |
| Frontend build | Vite |
| Client state | Redux Toolkit + Redux Persist |
| Frontend web server in deployment | Caddy |
| Containerization | Docker |

## Working structure

```text
task-manager/
├── backend/
├── frontend/
├── scripts/
├── docker/
└── docs/
```

## Local development

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend tests:

```bash
./mvnw test
```

> You need a JVM with Java 23 support.

### Frontend

```bash
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm build
```

For interactive development:

```bash
corepack pnpm start
```

## Runtime frontend configuration

The frontend does not take its primary configuration from build-time environment variables. It loads runtime configuration through `public/config.js`, exposed as `window.APP_CONFIG`.

This makes it possible to:

- change the backend URL without rebuilding,
- enable or disable OAuth2 per provider,
- adjust metadata and feature flags per environment.

## New session and security flow

The project has moved from a client-readable token model to a cookie-based session model with CSRF protection.

### Backend

The key pieces are:

- `WebSecurityConfig` for credentialed CORS, CSRF through `CookieCsrfTokenRepository`, and public session endpoints,
- `SessionRestController` for `/api/session/me`, `/api/session/csrf`, `/api/session/refresh`, and `/api/session/logout`,
- `SessionCookieService` for issuing and clearing `HttpOnly` cookies,
- `JWTAuthorizationFilter` for validating the access cookie and the persisted session,
- `TaskManagerSecurityProperties` for centralizing TTLs, cookie names, `SameSite`, `domain`, and allowed origins.

### Frontend

The key pieces are:

- `frontend/src/services/apiClient.js` for `withCredentials`, CSRF token bootstrapping, and automatic refresh,
- `authSlice` and `SessionManager` for rebuilding the session from `/api/session/me`,
- forms and feature services still use the same functional API, but they no longer manage a bearer token manually in the browser.

### Most important configuration settings

On the backend, review these especially:

- `taskmanager.security.cors.allowed-origins`
- `taskmanager.security.cookies.secure`
- `taskmanager.security.cookies.sameSite`
- `taskmanager.security.cookies.domain`
- `taskmanager.security.access-token.ttl`
- `taskmanager.security.refresh-token.ttl`
- `taskmanager.security.csrf.cookie-name`
- `taskmanager.security.csrf.header-name`

## When to touch each repository area

- **`backend/`**: business logic, security, persistence, REST API.
- **`frontend/`**: user experience, navigation, client state, components.
- **`scripts/`**: classic packaging and deployment.
- **`docker/`**: container build and execution.
- **`docs/`**: operational and technical documentation.

## Build and packaging

Classic packaging is orchestrated through `scripts/compile.py` and prepares a complete deployment artifact with backend, frontend, configuration templates, and runtime assets.

```bash
cd scripts
python3 compile.py --action deploy
```

## Documentation

The documentation portal is also maintained inside the repository:

```bash
cd docs
corepack pnpm install
corepack pnpm docs:build
```
