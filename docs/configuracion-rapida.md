# Configuración rápida

## Principio general

Task Manager separa la configuración entre backend, frontend y servidor web para poder adaptar la instalación a cada entorno.

## 1. Backend: `application.properties`

Archivo de referencia: [CONFIGURATION.md](/CONFIGURATION)

Ajustes que conviene revisar siempre:

- `server.port`
- `taskmanager.frontend.base-url`
- `spring.datasource.url`
- `spring.jpa.hibernate.ddl-auto`
- flags de OAuth2 y credenciales de proveedor

## 2. Frontend: `public/config.js`

La SPA lee la configuración desde `window.APP_CONFIG` antes de iniciar la aplicación.

Parámetros más relevantes:

- `api.baseUrl`
- `oauth2.enabled`
- `oauth2.google/github/authentik.enabled`
- `app.name`, `app.version`, `app.license`
- `features.calendar`, `features.lists`, `features.timeTracking`

## 3. Plantillas de despliegue

Para empaquetados reproducibles, usa:

- `scripts/config_templates/application-properties.template`
- `scripts/config_templates/config.template.js`
- `scripts/config_templates/Caddyfile.template`

## 4. Servidor web

Caddy es la pieza encargada de servir la SPA y aplicar el comportamiento de fallback de rutas. La guía completa también documenta headers de seguridad, compresión y ajustes HTTPS.

## OAuth2

El proyecto soporta:

- Google
- GitHub
- Authentik

Para habilitar cualquiera de ellos necesitas coordinar:

1. propiedades del backend,
2. flags del frontend,
3. URLs públicas correctas para redirecciones.

## Checklist mínimo por entorno

### Desarrollo local

- Backend apuntando a SQLite local.
- `taskmanager.frontend.base-url=http://localhost:3000`.
- `public/config.js` con `api.baseUrl=http://localhost:8080`.
- OAuth2 desactivado o configurado con callbacks locales.

### Producción

- Base de datos persistente.
- URLs públicas definitivas.
- JWT keys gestionadas fuera del repositorio.
- `config.js` y `application.properties` alineados con el dominio real.

## Dónde ampliar

- Configuración completa: [CONFIGURATION.md](/CONFIGURATION)
- Arquitectura general: [Arquitectura](/arquitectura)
- Despliegue con contenedores: [Despliegue](/despliegue)
