# Guía de desarrollo

## Stack real del proyecto

| Capa | Tecnología principal |
| --- | --- |
| Backend | Spring Boot 3.4.1 |
| Lenguaje backend | Java 23 |
| Persistencia | JPA/Hibernate + SQLite |
| Frontend | React 18 |
| Build frontend | Vite |
| Estado cliente | Redux Toolkit + Redux Persist |
| Servidor de frontend en despliegue | Caddy |
| Contenedorización | Docker |

## Estructura de trabajo

```text
task-manager/
├── backend/
├── frontend/
├── scripts/
├── docker/
└── docs/
```

## Desarrollo local

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Tests del backend:

```bash
./mvnw test
```

> Necesitas una JVM con soporte para Java 23.

### Frontend

```bash
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm build
```

Para desarrollo interactivo:

```bash
corepack pnpm start
```

## Configuración del frontend en runtime

El frontend no toma su configuración principal desde variables de entorno del build. La carga se hace en runtime a través de `public/config.js`, disponible como `window.APP_CONFIG`.

Esto permite:

- cambiar la URL del backend sin recompilar,
- activar o desactivar OAuth2 por proveedor,
- ajustar metadatos y flags funcionales por entorno.

## Nuevo flujo de sesión y seguridad

El proyecto ha pasado de un modelo de token accesible desde cliente a un modelo basado en sesión con cookies y protección CSRF.

### Backend

Las piezas clave son:

- `WebSecurityConfig` para CORS con credenciales, CSRF con `CookieCsrfTokenRepository` y endpoints públicos de sesión,
- `SessionRestController` para `/api/session/me`, `/api/session/csrf`, `/api/session/refresh` y `/api/session/logout`,
- `SessionCookieService` para emitir y limpiar cookies `HttpOnly`,
- `JWTAuthorizationFilter` para validar la cookie de acceso y la sesión persistida,
- `TaskManagerSecurityProperties` para centralizar TTLs, nombres de cookies, `SameSite`, `domain` y orígenes permitidos.

### Frontend

Las piezas clave son:

- `frontend/src/services/apiClient.js` para `withCredentials`, carga del token CSRF y refresh automático,
- `authSlice` y `SessionManager` para reconstruir la sesión desde `/api/session/me`,
- los formularios y servicios siguen usando la misma API funcional, pero ya no gestionan manualmente un bearer token en cliente.

### Ajustes de configuración más importantes

En backend revisa especialmente:

- `taskmanager.security.cors.allowed-origins`
- `taskmanager.security.cookies.secure`
- `taskmanager.security.cookies.sameSite`
- `taskmanager.security.cookies.domain`
- `taskmanager.security.access-token.ttl`
- `taskmanager.security.refresh-token.ttl`
- `taskmanager.security.csrf.cookie-name`
- `taskmanager.security.csrf.header-name`

## Cuándo tocar cada parte del repositorio

- **`backend/`**: lógica de negocio, seguridad, persistencia, API REST.
- **`frontend/`**: experiencia de usuario, navegación, estado cliente, componentes.
- **`scripts/`**: empaquetado y despliegue clásico.
- **`docker/`**: build y ejecución en contenedores.
- **`docs/`**: documentación operativa y técnica.

## Build y empaquetado

El empaquetado clásico se orquesta desde `scripts/compile.py` y prepara un artefacto completo de despliegue con backend, frontend, plantillas de configuración y runtime.

```bash
cd scripts
python3 compile.py --action deploy
```

## Documentación

El portal de documentación también se mantiene dentro del repositorio:

```bash
cd docs
corepack pnpm install
corepack pnpm docs:build
```
