# Arquitectura

## Visión general

Task Manager se apoya en una arquitectura de aplicación web clásica separada en backend, frontend y capa de despliegue:

- **Backend:** API REST con Spring Boot, seguridad con Spring Security, JPA/Hibernate y SQLite.
- **Frontend:** SPA en React 18 con Redux Toolkit, React Router y build actual con Vite.
- **Entrega:** scripts Python para empaquetado, Caddy para servir el frontend y Docker para despliegue multi-stage.

## Capas principales

### Backend

Responsabilidades principales:

- autenticación local con JWT firmado con RSA,
- login social con OAuth2,
- gestión de tareas, listas, eventos y equipos,
- panel de administración y mensajes del sistema,
- validación y control de permisos a nivel de endpoint y servicio.

Puntos de entrada y piezas importantes:

- `backend/src/main/java/com/taskmanager/application/Application.java`
- `controller/` para la API REST
- `service/` para la lógica de negocio
- `model/entities/` y `model/dto/` para persistencia y contratos
- `security/` para filtros JWT y flujo OAuth2

### Frontend

Responsabilidades principales:

- autenticación y persistencia de sesión,
- navegación por tareas, listas, equipos y paneles,
- configuración runtime desde `window.APP_CONFIG`,
- experiencia responsive con componentes reutilizables.

Elementos clave:

- `frontend/src/index.jsx` como bootstrap
- `frontend/src/store/` para Redux
- `frontend/src/components/` para módulos funcionales
- `frontend/public/config.js` para configuración sin rebuild
- `frontend/vite.config.js` para build, preview y tests

### Empaquetado y despliegue

- `scripts/compile.py` orquesta compilación, copia de plantillas y empaquetado final.
- `scripts/config_templates/` concentra los ficheros base de configuración.
- `docker/Dockerfile.deployment` y `docker/build.sh` cubren la estrategia de contenedorización.
- Caddy actúa como servidor del frontend SPA y reverse proxy según la configuración desplegada.

## Flujo de autenticación

1. El usuario inicia sesión local o con OAuth2.
2. El backend valida credenciales o resuelve el proveedor externo.
3. Se emite un JWT firmado con RSA.
4. El frontend guarda el token y lo reutiliza en llamadas API.
5. Las autoridades del usuario determinan acceso a administración, equipos y acciones sensibles.

## Configuración runtime

La aplicación mezcla dos niveles de configuración:

- **Backend:** `application.properties`
- **Frontend:** `public/config.js` / `window.APP_CONFIG`

Esto permite cambiar la URL del backend, activar OAuth2 o ajustar flags del frontend sin recompilar la SPA en todos los escenarios de despliegue.

## Estructura raíz

```text
task-manager/
├── backend/
├── frontend/
├── scripts/
├── docker/
└── docs/
```

## Documentos de apoyo

- Detalle técnico completo: [TECHNICAL.md](/TECHNICAL)
- Guía funcional completa: [DOCUMENTATION.md](/DOCUMENTATION)
- Configuración y despliegue: [CONFIGURATION.md](/CONFIGURATION), [DEPLOYMENT.md](/DEPLOYMENT)
