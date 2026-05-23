# Getting started

## Quick overview

Task Manager is a web application for work management aimed at individual users and teams. It allows you to register tasks, group them into lists, plan them on a calendar, and share them within teams with differentiated permissions.

## Technical requirements

| Component | Recommended requirement | Why it matters |
| --- | --- | --- |
| Java | Java 23 | The backend compiles with `java.version=23` |
| Node.js | Node 20 or higher | Required for the frontend and the documentation portal |
| pnpm | Latest stable version through `corepack` | Dependency management for the frontend and docs |
| Python | Python 3.8 or higher | Packaging and deployment scripts |

## Local startup

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

By default, the backend listens on `http://localhost:8080`.

### Frontend

```bash
cd frontend
corepack pnpm install
corepack pnpm start
```

By default, the frontend is served at `http://localhost:3000`.

## Minimum configuration before using the application

### Backend configuration

Prepare `application.properties` with at least these settings:

- `server.port`
- `taskmanager.frontend.base-url`
- `spring.datasource.url`
- `spring.jpa.hibernate.ddl-auto`
- OAuth2 flags and credentials if you plan to use Google, GitHub, or Authentik

### Frontend configuration

The frontend reads its configuration from `public/config.js` through `window.APP_CONFIG`. Review at least:

- `api.baseUrl`
- `oauth2.enabled`
- `oauth2.google.enabled`
- `oauth2.github.enabled`
- `oauth2.authentik.enabled`
- `app.name`, `app.version`, `app.license`

## Recommended first walkthrough

1. Sign up for a local account or sign in.
2. Create a task with priority and status.
3. Group several tasks into a list.
4. Schedule an event in the calendar.
5. If you work in a team, create one or accept an invitation.

## If you are here to develop

1. Run backend and frontend in parallel.
2. Review the [developer guide](/en/developer-guide).
3. Use the [architecture](/en/architecture) page to locate services, controllers, and components.
4. Before publishing, review the [deployment](/en/deployment) guide.
