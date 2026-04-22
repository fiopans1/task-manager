# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1-Alpha]

### Added
- Task creation and management with priorities and states
- Calendar integration for task scheduling
- Custom lists for organizing tasks
- Time tracking for tasks
- Team management with role-based access (owner, admin, member)
- OAuth2 authentication (Google, GitHub, Authentik)
- Admin panel with user management, feature flags, and system messages
- Server-side pagination with infinite scroll
- Internationalization (English and Spanish)
- Dark/light theme toggle
- Runtime frontend configuration via `config.js` (no rebuild required)
- Deployment package generation with `scripts/compile.py`
- Docker multi-stage build support (AMD64, ARM64, ARMv7)
- Caddy web server integration for SPA routing and reverse proxy
