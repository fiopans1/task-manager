# Arquitectura

Task Manager se entrega como un único producto que combina un backend, un frontend y una capa de empaquetado. Esta página explica cómo encajan las piezas, qué hace cada una y por qué están separadas así.

## Visión general

Hay tres procesos en producción:

- **El backend**, una aplicación Spring Boot que expone una API REST, gestiona la seguridad, persiste los datos y emite las sesiones.
- **El frontend**, una SPA React servida como archivos estáticos. Toda la interacción del usuario pasa por él.
- **El reverse proxy** (Caddy en los paquetes generados), que termina TLS, sirve los estáticos del frontend y proxifica las llamadas que empiecen por `/api`, `/auth` u `/oauth2` hacia el backend.

En desarrollo se sustituye el proxy por el propio servidor de Vite, que ya viene configurado para redirigir esas mismas rutas a `http://localhost:8080`.

## Layout del repositorio

```text
task-manager/
├── backend/                # Spring Boot
│   ├── src/main/java/com/taskmanager/application/
│   │   ├── controller/     # Endpoints REST
│   │   ├── service/        # Lógica de negocio
│   │   ├── service/oauth2providers/   # Adaptadores por proveedor OAuth2
│   │   ├── security/       # Filtros JWT, CSRF, OAuth2, cookies
│   │   ├── config/         # Beans de Spring, propiedades externas
│   │   ├── model/entities/ # Modelo JPA
│   │   ├── model/dto/      # Contratos de la API
│   │   ├── model/exceptions/, validations/
│   │   ├── respository/    # Repositorios JPA (nota: nombre con errata histórica)
│   │   ├── context/, utils/
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── log-config.xml
│   │   └── jwtKeys/        # Par RSA usado para firmar los JWT (gitignored)
│   ├── pom.xml
│   └── mvnw
│
├── frontend/               # React + Vite
│   ├── public/             # config.js, sitemap.xml, robots.txt, manifest.json, logos
│   ├── scripts/            # Hooks de pnpm (predev/prestart)
│   ├── src/
│   │   ├── components/     # Componentes de UI, agrupados por dominio
│   │   │   ├── auth/       # Login, registro, OAuth2 callback, ruta protegida
│   │   │   ├── common/     # Seo, FeatureGuard, modales, sistema de toasts
│   │   │   ├── tasks/, lists/, teams/, calendar/
│   │   │   ├── adminpanel/
│   │   │   ├── session/    # Modal de inactividad y refresh
│   │   │   └── Sidebar/
│   │   ├── pages/          # HomePage, MainApp (layout autenticado)
│   │   ├── services/       # apiClient, authService, taskService, ...
│   │   ├── redux/          # store.js + slices/ (única: authSlice)
│   │   ├── hooks/          # useInfiniteScroll
│   │   └── context/        # ThemeContext
│   ├── vite.config.js
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── docs/                   # Portal VitePress bilingüe (es/, en/)
├── docker/                 # Dockerfile.deployment + build.sh
├── scripts/                # compile.py y plantillas de configuración
└── application/            # Esqueleto Spring Boot antiguo, ya no se usa
```

`application/` es un esqueleto previo que se quedó en el repositorio. No es el backend activo: si vas a tocar Java, trabaja en `backend/`. Se mantiene por motivos de historia del proyecto y para no romper referencias externas.

## El backend

### Responsabilidades

- Validar credenciales (locales y OAuth2).
- Emitir y validar los tokens firmados con RSA.
- Persistir y servir el modelo de datos.
- Aplicar las reglas de autorización (rol del sistema, rol de equipo, pertenencia a la lista, etc.).
- Exponer endpoints REST bajo `/api/*` y `/auth/*`.

### Capas y paquetes

Dentro de `com.taskmanager.application.*` la separación es:

| Capa | Paquete | Función |
| --- | --- | --- |
| Controladores | `controller/` | Reciben HTTP, validan entrada, delegan en servicios y devuelven DTOs. |
| Servicios | `service/` | Reglas de negocio, transacciones, composición entre repositorios. |
| Servicios OAuth2 | `service/oauth2providers/` | Adaptadores por proveedor (Google, GitHub). |
| Seguridad | `security/` | Filtros, manejo de cookies, handlers de éxito y fallo de OAuth2. |
| Configuración | `config/` | `WebSecurityConfig`, `CsrfConfig`, propiedades externas. |
| Modelo de datos | `model/entities/` | Entidades JPA. |
| Contratos | `model/dto/` | Lo que viaja por la API; convierte a/desde entidades. |
| Repositorios | `respository/` | Interfaces Spring Data. (Errata histórica: `respository` sin segunda `o`.) |
| Utilidades | `utils/`, `context/` | Helpers y beans auxiliares. |

### Entidades principales

- `User` — cuenta local o vinculada a un `AuthProvider` (Google, GitHub, Authentik). Tiene `FullName` con nombre y dos apellidos.
- `AuthSession` y `RefreshToken` — sesiones activas y refresh tokens persistidos.
- `RoleOfUser` y `AuthorityOfRole` — roles del sistema (`BASIC`, `ADMIN`) y sus authorities.
- `Task` — núcleo funcional. Tiene `EventTask` opcional para fechas, `ListTM` opcional, `Team` opcional, y un histórico de `ActionTask` (comentarios, ediciones, creación).
- `TaskAssignmentHistory` — quién reasignó qué tarea a quién, cuándo y desde qué equipo.
- `ListTM` — agrupación de tareas con un color. (Nombre con la sigla TM para no chocar con `java.util.List`.)
- `Team` — agrupa usuarios vía `TeamMember` con su `TeamRole` (`ADMIN` o `MEMBER`).
- `TeamInvitation` — invitaciones pendientes, aceptadas o rechazadas, con su token.
- `AppConfig` — clave/valor para flags y mensajes del sistema.

### Ciclo de vida de una petición autenticada

1. El frontend hace una petición con `withCredentials: true`, así que el navegador envía las cookies.
2. `JWTAuthorizationFilter` lee la cookie de acceso, valida la firma RSA, la expiración y que la sesión esté vigente.
3. Si todo va bien, la petición llega al controlador. Si no, devuelve 401.
4. El controlador delega en un servicio. Los servicios aplican reglas (por ejemplo, "solo el admin del equipo puede invitar").
5. Si la operación es de escritura, el filtro de CSRF ha exigido antes una cookie `XSRF-TOKEN` y un header `X-XSRF-TOKEN`. Si falta, devuelve 403.
6. La respuesta vuelve al frontend en formato DTO (no se exponen las entidades JPA).

### Endpoints por dominio

| Prefijo | Controlador | Uso |
| --- | --- | --- |
| `/auth/login`, `/auth/register` | `AuthRestController` | Login local y alta de cuenta. |
| `/api/session/me`, `/csrf`, `/refresh`, `/logout` | `SessionRestController` | Estado de sesión y tokens. |
| `/api/tasks/...` | `TaskRestController` | CRUD de tareas, acciones, eventos. |
| `/api/lists/...` | `ListRestController` | CRUD de listas, añadir/quitar tareas. |
| `/api/teams/...` | `TeamRestController` | Equipos, miembros, invitaciones, asignaciones, dashboard. |
| `/api/admin/...` | `AdminRestController` | Usuarios, flags, mensajes. Solo ADMIN. |
| `/api/home-summary` | `HomeRestController` | Datos agregados para el dashboard principal. |
| `/api/user/...` | `UserRestController` | (Reservado para el perfil del usuario.) |
| `/api/config` | `AppConfigRestController` | Configuración pública consumida por el frontend. |
| `/oauth2/authorization/{provider}`, `/oauth2/callback/{provider}` | `WebSecurityConfig` | Inicio y cierre del login social. |
| `/health` | `HealthCheckRestController` | Liveness probe. |

## El frontend

### Responsabilidades

- Renderizar la SPA.
- Mantener el estado de autenticación (Redux Toolkit) y el tema visual (Context).
- Llamar a la API a través de un único cliente HTTP con CSRF y refresh automático.
- Adaptar la experiencia a escritorio y móvil con Bootstrap y `react-bootstrap`.

### Capas y paquetes

- `services/` — el único punto por el que la app habla con el backend. Cada dominio (tareas, listas, equipos, admin, auth, home) tiene su servicio.
- `redux/` — solo `authSlice` por ahora. El store no usa `redux-persist` pese a estar como dependencia.
- `hooks/` — solo `useInfiniteScroll` (cliente y servidor) compartido por listas largas.
- `components/` — organizado por dominio funcional (`tasks/`, `lists/`, `teams/`, `adminpanel/`, etc.) y con `common/` para lo transversal.
- `pages/` — `HomePage` (público) y `MainApp` (layout autenticado con `<Outlet />`).
- `context/` — `ThemeContext` para modo claro/oscuro.

### Routing

- Las rutas públicas son `/`, `/login`, `/register` y `/oauth2-login`.
- Las autenticadas viven bajo `/home` con un layout común (`MainApp`) que monta `SidebarMenu`, el modal de sesión y el modal de mensaje del sistema. Hijos: `/home`, `/home/tasks`, `/home/tasks/:id`, `/home/calendar`, `/home/lists`, `/home/lists/:id`, `/home/teams`, `/home/teams/:id`, `/home/admin`.
- `<ProtectedRoute>` redirige a `/login` si no hay sesión.
- `<FeatureGuard>` oculta rutas cuya feature flag esté desactivada.

### SEO

`<Seo>` (`components/common/Seo.jsx`) envuelve cada vista con `react-helmet-async` y define el título, la descripción, la URL canónica y los meta Open Graph / Twitter. Las URLs absolutas se construyen con `app.siteUrl` de `config.js`, que cae a `window.location.origin` si está vacío. Rutas autenticadas y la callback de OAuth2 usan `noindex` para no ser indexadas.

## Configuración por capas

Hay tres archivos de configuración que se generan en despliegue desde sus plantillas y se montan sin recompilar:

| Capa | Archivo | Plantilla |
| --- | --- | --- |
| Backend | `config/application.properties` | `scripts/config_templates/application-properties.template` |
| Frontend | `lib/frontend/config.js` | `scripts/config_templates/config.template.js` |
| Reverse proxy | `config/Caddyfile` | `scripts/config_templates/Caddyfile.template` |

El frontend no lee variables de entorno del build; carga `config.js` en `<head>` antes de montar React. Eso permite cambiar la URL del backend, los proveedores OAuth2 activos, los feature flags y los textos del sistema en caliente, sin rebuild.

El backend, en cambio, sí lee sus propiedades en arranque. Todo lo sensible (TTLs de tokens, CORS, cookies, CSRF, OAuth2) está agrupado bajo el prefijo `taskmanager.security.*` y se mapea con `TaskManagerSecurityProperties`. Cambiar la cookie a `SameSite=None` requiere `cookies.secure=true`; el servicio de cookies falla al arrancar si esa combinación no se respeta.

## Persistencia

- Por defecto se usa **SQLite** en el directorio de trabajo (`jdbc:sqlite:task-manager.db?foreign_keys=on`). Es lo bastante para uso personal o equipos pequeños.
- El modelo va con **JPA/Hibernate** sobre el dialecto de comunidad de SQLite. En desarrollo `ddl-auto=create` regenera el esquema en cada arranque; en producción se cambia a `update` desde la plantilla.
- La capa de repositorios está en `respository/` (sin segunda `o`); es una errata que arrastra el proyecto, no la corrijas a mitad de camino porque rompe imports externos.
- Para entornos grandes hay que cambiar el driver, el dialecto y `ddl-auto` en `application.properties`. La estructura de paquetes no asume SQLite más allá del driver.

## Seguridad

El modelo es **sesión con cookies + CSRF**, no bearer tokens:

- **Cookies `HttpOnly`** para el access token (`TM-ACCESS`, ruta `/api`) y el refresh (`TM-REFRESH`, ruta `/api/session`). El frontend no las lee.
- **Cookie legible `XSRF-TOKEN`** y header `X-XSRF-TOKEN` para autorizar operaciones de escritura. El frontend obtiene el token con un `GET /api/session/csrf` antes de la primera escritura y `axios` lo adjunta automáticamente.
- **JWT firmado con RSA** dentro de la cookie; el backend valida firma, expiración y que la sesión siga activa en BD.
- **OAuth2** soportado vía Spring Security OAuth2 Client: `google`, `github` y `authentik` activables por propiedad.
- **CORS** con credenciales solo para los orígenes listados en `taskmanager.security.cors.allowed-origins`.

## Operaciones empaquetadas

`scripts/compile.py --action deploy` produce un ZIP con todo lo necesario:

1. Compila el backend con Maven y deja el JAR ejecutable.
2. Construye el frontend con pnpm y deja el bundle en `build/`.
3. Descarga Caddy y copia el binario.
4. Copia las plantillas de configuración al directorio `config/` del paquete.
5. Genera `TaskManager.zip` listo para subir a un servidor.

Los detalles operativos están en la guía de despliegue.

## Cuando algo cambia

- Nueva clave de backend: añadirla a `scripts/config_templates/application-properties.template` y documentarla.
- Nueva opción de frontend: plantilla `config.template.js` + `configService` + `window.APP_CONFIG`.
- Nuevo proveedor OAuth2: implementar el adaptador en `service/oauth2providers/`, añadir los registros en `application.properties` y un flag en `oauth2.<provider>.enabled` de `config.js`.
- Nueva ruta pública: importar `<Seo />`, añadir al `sitemap.xml` si debe indexarse; si es callback o autenticada, usar `noindex`.
- Cambio visible para el usuario: actualizar `docs/en` y `docs/es`.
