# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

To report a vulnerability, open a [GitHub Security Advisory](https://github.com/fiopans1/task-manager/security/advisories/new) (private disclosure). Alternatively, send an e-mail to the maintainer listed in the repository profile.

Please include as much of the following as possible:

- Type of vulnerability (e.g. SQL injection, XSS, CSRF, authentication bypass)
- Full paths of the affected source files
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if available)
- Impact of the vulnerability and how it could be exploited

You should receive an acknowledgement within **72 hours**. We will keep you informed of the progress toward a fix and a full announcement.

## Security Best Practices for Deployment

- Generate fresh RSA keys for JWT signing — never reuse sample or test keys.
- Store `application.properties` outside of version control (it is `.gitignore`d).
- Never commit `frontend/public/config.js` with real credentials.
- Use HTTPS in production; the bundled Caddy configuration supports automatic TLS.
- Restrict database file permissions so only the application user can read/write it.
