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
- JWT issuance and validation.

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
3. A RSA-signed JWT is generated.
4. The frontend stores the session and attaches the token where needed.
5. The backend enforces authorizations according to system role and team role.

## Configuration by layer

### Backend

Main configuration lives in `application.properties`.

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
