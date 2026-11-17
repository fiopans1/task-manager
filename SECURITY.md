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
- Keep the API same-origin through Caddy (`/api`, `/auth`, `/oauth2` are proxied). If you deploy the frontend and backend on different origins, set `taskmanager.security.cors.allowed-origins`, use HTTPS and configure `SameSite=None; Secure` cookies explicitly.
- Run the container as the bundled non-root `app` user; do not override it with `--user root`.

## JWT Key Rotation After Exposure

If a JWT private key was ever committed, pasted into an issue, included in a build artifact or otherwise shared:

1. Generate a new RSA pair with `python3 scripts/bin_files/key_generator.py` (or `openssl genpkey`).
2. Replace the files referenced by `jwtKeys.privateKeyPath` / `jwtKeys.publicKeyPath` on every running instance and restart the backend. Tokens signed with the old key become invalid immediately.
3. Treat the old key as compromised even after removing it from the current branch; rewrite history only with a coordinated, backed-up repository migration, and assume any clone or CI cache still has it.
4. Revoke active sessions if the old key may have been used to forge tokens: delete rows from `auth_session` / `refresh_token` or change the affected users' passwords, which revokes all sessions.

## OAuth2 Account Linking

The backend does not silently link an OAuth2 identity to an existing local account by email. A login is accepted only when the existing account is already linked to that provider (`user_auth_providers`). This prevents an attacker from pre-registering a victim's email and retaining the local password. An explicit, authenticated linking flow should be added before re-enabling automatic email linking.
