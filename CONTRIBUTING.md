# Contributing to Task Manager

Thank you for your interest in contributing! Contributions are welcome and appreciated.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold its terms.

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/task-manager.git
   cd task-manager
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/fiopans1/task-manager.git
   ```

## How to Contribute

- **Bug reports** – Open an issue using the bug report template.
- **Feature requests** – Open an issue using the feature request template.
- **Code contributions** – Fork → branch → commit → pull request.
- **Documentation** – Improvements to docs are always welcome.

## Development Setup

### Prerequisites

- Java 23
- Maven 3.6+
- Node.js 18+ and pnpm
- Python 3.8+

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
pnpm install
pnpm start
```

> **Note:** Copy `scripts/config_templates/config.template.js` to `frontend/public/config.js` and adjust the values for your local environment before starting the frontend.

### JWT Keys

Generate RSA keys before running the backend:

```bash
mkdir -p backend/src/main/resources/keys
openssl genrsa -out backend/src/main/resources/keys/private_key.pem 2048
openssl rsa -in backend/src/main/resources/keys/private_key.pem -pubout \
  -out backend/src/main/resources/keys/public_key.pem
```

## Pull Request Process

1. Create a branch from `main` with a descriptive name:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Make your changes, keeping commits focused and atomic.
3. Ensure existing tests pass.
4. Update documentation if your changes affect public behaviour.
5. Push to your fork and open a Pull Request against `main`.
6. Fill in the PR template completely.
7. Wait for review. Address any requested changes.

PRs are merged after at least one maintainer approval.

## Coding Standards

### Backend (Java / Spring Boot)

- Follow standard Java naming conventions.
- Use `messageService.getMessage()` for all user-facing strings.
- Wrap service errors in meaningful messages; do not expose stack traces to the API.
- Add Javadoc to public methods.

### Frontend (React / JavaScript)

- Use `useTranslation` hook for all user-facing strings (i18n keys in `en.json` / `es.json`).
- Keep components small and focused; extract reusable logic into hooks (`src/hooks/`).
- Use pnpm, not npm.
- Do not commit `frontend/public/config.js` (it is git-ignored).

### General

- No secrets or credentials in source code.
- Keep PRs small and focused on a single concern.

## Reporting Bugs

Please open an issue using the **Bug Report** template. Include:

- A clear description of the problem.
- Steps to reproduce.
- Expected vs. actual behaviour.
- Environment details (OS, Java version, Node version, browser).

## Suggesting Features

Please open an issue using the **Feature Request** template. Describe:

- The problem the feature would solve.
- Your proposed solution and any alternatives you considered.
- Any relevant context or screenshots.
