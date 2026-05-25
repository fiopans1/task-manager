# Deployment

## Publication options

Task Manager can be deployed in two main ways:

1. **classic packaging**, generating a deployment artifact with repository scripts,
2. **Docker containers**, using the multi-stage deployment image.

## Classic packaging

```bash
cd scripts
python3 compile.py --action deploy
```

The process generates a package with:

- compiled backend,
- built frontend,
- configuration templates,
- runtime assets required to run the application.

After the build:

1. extract the artifact,
2. adjust configuration,
3. start the services with the included scripts.

## Docker

### Build

```bash
docker build -f docker/Dockerfile.deployment -t fiopans1/taskmanager:latest .
```

### Run

```bash
docker run -d \
  --name taskmanager \
  -p 8080:8080 \
  -p 3000:3000 \
  fiopans1/taskmanager:latest
```

## Production checklist

Before publishing to a real environment, verify:

- correct public URLs for frontend and backend,
- JWT keys kept outside version control,
- OAuth2 configuration aligned with real callback URLs,
- `taskmanager.security.cors.allowed-origins` adjusted to the real frontend domains,
- `taskmanager.security.cookies.secure`, `sameSite`, and `domain` aligned with HTTP/HTTPS and subdomain usage,
- data persistence and backups,
- proper ports and reverse proxy strategy,
- available logs and monitoring.

## What changes with HttpOnly cookies and CSRF

The deployment must assume that authentication now depends on browser credentials rather than on a token managed by JavaScript.

- The frontend must call the backend with credentials enabled.
- The backend must allow credentialed CORS from authorized origins.
- Access and refresh cookies must be sent and cleared correctly according to `path`, `domain`, `secure`, and `SameSite`.
- Write operations require the CSRF token issued through `/api/session/csrf`.

## Minimum post-deployment checks

- The frontend answers on the expected port.
- The backend answers on the expected port.
- Local authentication works.
- OAuth2 works when enabled.
- Session refresh works without exposing tokens in the browser.
- An authenticated `POST` fails without CSRF and succeeds through the normal frontend flow.
- Tasks, lists, and teams can be created and queried.

## When to choose each option

- **Classic packaging** if you need a self-contained distribution driven by repository scripts.
- **Docker** if you want consistency across environments and an easier-to-automate operational model.
