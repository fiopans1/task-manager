# Task Manager

A professional task management application with calendar integration, custom lists, and OAuth2 authentication support.

## Features

- ✅ Task creation and management with priorities and states
- 📅 Calendar integration for task scheduling
- 📋 Custom lists for organizing tasks
- ⏱️ Time tracking for tasks
- 🔐 OAuth2 authentication (Google, GitHub, Authentik)
- 🎨 Modern, responsive UI

## Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and pnpm
- Python 3.8+

### Building the Application

```bash
cd scripts
python3 compile.py --action deploy
```

This will create a `TaskManager.zip` file containing the complete deployment package.

### Running the Application

1. Extract the deployment package:

```bash
unzip TaskManager.zip
cd task-manager
```

2. Configure the application (see [Configuration Guide](docs/CONFIGURATION.md))

3. Start the application:

```bash
cd bin
python3 start.py --start-all
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Configuration

The application uses a professional configuration system with separate files for backend, frontend, and web server.

See the [Configuration Guide](docs/CONFIGURATION.md) for detailed information on:

- Application settings
- OAuth2 provider setup
- Frontend configuration
- Web server customization
- Deployment best practices

## Development

### Backend Development

```bash
cd backend
mvn spring-boot:run
```

### Frontend Development

```bash
cd frontend
pnpm install
pnpm start
```

Don't forget to create a `frontend/public/config.js` file for development (see template in `scripts/config_templates/config.template.js`).

## Security

### Generating JWT Keys

The application uses RSA keys for JWT token signing:

```bash
# Generate private key
openssl genrsa -out src/main/resources/keys/private_key.pem 2048

# Generate public key
openssl rsa -in src/main/resources/keys/private_key.pem -pubout -out src/main/resources/keys/public_key.pem
```

## Docker Build

Build the application using Docker:

```bash
./docker/build.sh --platform linux/amd64
```

See [docker/README.md](docker/README.md) for full options including multi-architecture builds and CI/CD examples.

## Project Structure

```
task-manager/
├── backend/             # Spring Boot backend
├── frontend/            # React frontend
├── scripts/             # Build and deployment scripts
│   ├── config_templates/  # Configuration templates
│   ├── config_files/      # Static configuration files
│   └── bin_files/         # Runtime scripts
├── docs/                # Documentation
│   ├── CONFIGURATION.md
│   ├── DEPLOYMENT.md
│   ├── DOCUMENTATION_EN.md   # English user & technical docs
│   ├── DOCUMENTATION_ES.md   # Spanish user & technical docs
│   ├── TECHNICAL_EN.md       # English technical reference
│   └── TECHNICAL_ES.md       # Spanish technical reference
└── docker/              # Docker configurations
```

## Architecture

- **Backend:** Spring Boot 3.x with Spring Security, JPA, and OAuth2
- **Frontend:** React 18 with Redux Toolkit, React Router, and Bootstrap
- **Database:** SQLite (can be configured for other databases)
- **Web Server:** Caddy server for serving frontend SPA

## Upgrading from Environment Variables

If you're upgrading from a version that used `REACT_APP_*` environment variables, the new configuration system provides better flexibility:

- **No rebuild required** for configuration changes
- **Single deployment artifact** works in multiple environments
- **Runtime configuration** loaded from `config.js`

See the [Configuration Guide](docs/CONFIGURATION.md) for migration details.

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8080 (backend)
kill -9 $(lsof -ti:8080)

# Kill process on port 3000 (frontend)
kill -9 $(lsof -ti:3000)
```

### Frontend Can't Connect to Backend

Check `lib/frontend/config.js` and ensure `api.baseUrl` matches your backend URL.

### OAuth2 Issues

Ensure both backend (`config/application.properties`) and frontend (`lib/frontend/config.js`) have matching OAuth2 settings enabled.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started, development setup, and the pull request process.

## License

Copyright (c) 2025 Diego Suárez Ramos (@fiopans1)

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU Affero General Public License v3.0** as published by the Free Software Foundation.

This means that if you use this software over a network, you must provide the source code of your modified version to the users of that service. For more details, see the full license text.

A copy of the license is included in the [LICENSE](LICENSE) file and is also available at [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html).
