# Architecture

## General picture

Task Manager is a web application with a clear separation between backend, frontend, and deployment layers. Each part owns a specific responsibility and can be configured consistently across environments.

## Backend

The backend is built with Spring Boot and centralizes:

- authentication and authorization,
- REST API endpoints,
- business rules,
- data access,
- OAuth2 integration,
- JWT issuance and validation,
- session delivery through `HttpOnly` cookies,
- CSRF protection for write operations.

Main layers:

- **controllers** expose endpoints,
- **services** implement business logic,
- **repositories** handle persistence,
- **models and DTOs** represent internal data and contracts,
- **security** handles JWT, OAuth2, and access control.

## Frontend

The frontend is a React SPA using Redux Toolkit. It is responsible for:

- navigation across functional areas,
- user session persistence,
- REST API consumption,
- rendering views for tasks, lists, teams, and administration,
- adapting the experience to desktop and mobile screens.

## Authentication flow

1. The user authenticates with local credentials or an OAuth2 provider.
2. The backend validates the identity and resolves permissions.
3. The backend generates signed tokens, persists the session, and returns `HttpOnly` access and refresh cookies.
4. The frontend rebuilds the authenticated state by calling `/api/session/me`.
5. Before write requests, the frontend obtains the CSRF token from `/api/session/csrf` and sends `X-XSRF-TOKEN`.
6. If the access token expires, the application can renew the session through `/api/session/refresh`.
7. The backend enforces authorization according to system role, team role, and persisted session validity.

## Configuration by layer

### Backend

Main configuration lives in `application.properties`, including CORS, cookie, and CSRF settings.

### Frontend

Main configuration lives in `public/config.js` and is loaded before the application starts.

### Web server

In packaged deployments, Caddy serves the SPA and acts as the frontend delivery layer.

## Persistence

The application uses SQLite as the default database. JPA/Hibernate handles the mapping between entities and storage.

## Functional model

The core entities revolve around:

- users,
- tasks,
- lists,
- calendar events,
- teams,
- invitations,
- roles and authorities.

## Practical result

This separation keeps the project easier to operate and maintain:

- the backend owns rules and security,
- the frontend prioritizes user experience and productivity,
- runtime configuration reduces coupling between builds and environments.
