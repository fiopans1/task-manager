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
