# Task Manager

Task Manager is a self-hosted task management platform for teams and individuals who need tasks, lists, calendar planning, session-based authentication, and a deployment model that can run on their own infrastructure.

It is designed as a full-stack application:

- **Backend:** Spring Boot 3, Spring Security, JPA and SQLite-ready persistence
- **Frontend:** React 18, Vite, Redux Toolkit and Bootstrap
- **Docs portal:** VitePress documentation mirrored in **Spanish** (`/es`) and **English** (`/en`)
- **Authentication model:** OAuth2 login support with **HttpOnly session cookies** and **CSRF protection**

## Why this project

Task Manager aims to provide an open source alternative for teams that want to keep control of their data without giving up a modern product experience.

Typical use cases:

- Organising personal or team workloads with states and priorities
- Planning work on a calendar
- Grouping work into custom lists
- Running the stack on your own server or VPS
- Extending the product with your own integrations and deployment pipeline

## Key capabilities

- Task creation, editing and lifecycle tracking
- Calendar-based planning
- Custom lists and team-oriented organisation
- Time tracking support
- OAuth2 providers such as Google, GitHub and Authentik
- Runtime frontend configuration through `frontend/public/config.js`
- Bilingual documentation for end users, administrators and developers

## Repository layout

```text
task-manager/
├── backend/      # Spring Boot API and authentication/session layer
├── frontend/     # React + Vite web application
├── docs/         # VitePress portal available at /es and /en
├── docker/       # Docker build assets and container documentation
├── scripts/      # Packaging, deployment and configuration templates
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

## Prerequisites

Use these versions if you want to work with the repository locally:

- **Java 23** for the backend
- **Node.js 20+** recommended
- **pnpm** via Corepack for the frontend and docs
- **Python 3.8+** for packaging scripts

## Quick start for local development

### 1. Backend

Create the RSA keys used by the session/JWT layer:

```bash
mkdir -p backend/src/main/resources/keys
openssl genrsa -out backend/src/main/resources/keys/private_key.pem 2048
openssl rsa -in backend/src/main/resources/keys/private_key.pem -pubout \
  -out backend/src/main/resources/keys/public_key.pem
```

Then start the API:

```bash
cd backend
./mvnw spring-boot:run
```

By default the backend serves the API on `http://localhost:8080`.

### 2. Frontend

Install dependencies and prepare runtime configuration:

```bash
cd frontend
corepack pnpm install
cp ../scripts/config_templates/config.template.js public/config.js
```

Start the frontend:

```bash
corepack pnpm start
```

The frontend is available on `http://localhost:3000`.

### 3. Documentation portal

Run the docs site locally:

```bash
cd docs
corepack pnpm install
corepack pnpm docs:dev
```

The site exposes mirrored content in:

- `http://localhost:4173/es/`
- `http://localhost:4173/en/`

## Build and packaging

### Frontend production build

```bash
cd frontend
corepack pnpm build
```

### Documentation build

```bash
cd docs
corepack pnpm docs:build
```

### Full distributable package

To create the deployable archive:

```bash
cd scripts
python3 compile.py --action deploy
```

This generates `TaskManager.zip` with the packaged application and deployment files.

## Configuration

Task Manager uses runtime configuration instead of baking every value into the frontend bundle.

The main files are:

- `frontend/public/config.js` for frontend runtime behaviour
- `backend/src/main/resources/application.properties` for backend setup
- `task-manager/config/Caddyfile` in packaged deployments

Example frontend configuration:

```js
window.APP_CONFIG = {
  api: {
    baseUrl: ''
  },
  oauth2: {
    enabled: true
  }
}
```

This allows the frontend to point to the same origin in development or to a dedicated backend URL in production.

## Security model

The current authentication flow uses:

- **HttpOnly cookies** for session/access handling
- **CSRF protection** for state-changing requests
- OAuth2 login for supported identity providers

If you are integrating against the backend, assume browser-session authentication rather than storing bearer tokens in frontend code.

## Documentation

The project documentation is written for both end users and developers and is maintained as a mirrored bilingual portal:

- **Spanish:** `/es/`
- **English:** `/en/`

Available sections include getting started, user guide, developer guide, architecture and deployment.

## Docker

If you want to build and distribute the project as a container image:

```bash
./docker/build.sh --platform linux/amd64
```

See [docker/README.md](docker/README.md) for supported flags, multi-platform builds and publishing examples.

## Contributing

If you want to contribute:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check the expected behaviour in [SECURITY.md](SECURITY.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
3. Keep pull requests focused and update docs when behaviour changes

## License

Task Manager is licensed under the **GNU Affero General Public License v3.0**.

See [LICENSE](LICENSE) for the full text.
