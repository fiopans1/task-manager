# Arquitectura

## Panorama general

Task Manager es una aplicación web de arquitectura separada entre backend, frontend y capa de despliegue. Cada pieza tiene una responsabilidad clara y puede configurarse de forma coherente entre entornos.

## Backend

El backend está construido con Spring Boot y concentra:

- autenticación y autorización,
- API REST,
- reglas de negocio,
- acceso a datos,
- integración OAuth2,
- emisión y validación de JWT,
- gestión de sesión mediante cookies `HttpOnly`,
- protección CSRF para operaciones de escritura.

Capas principales:

- **controladores** para exponer endpoints,
- **servicios** para lógica de negocio,
- **repositorios** para persistencia,
- **modelos y DTOs** para representar datos internos y contratos,
- **seguridad** para JWT, OAuth2 y control de acceso.

## Frontend

El frontend es una SPA en React con Redux Toolkit. Se encarga de:

- navegación entre áreas funcionales,
- persistencia de la sesión del usuario,
- consumo de la API REST,
- renderizado de vistas de tareas, listas, equipos y administración,
- adaptación visual a escritorio y móvil.

## Flujo de autenticación

1. El usuario se autentica con credenciales locales o con un proveedor OAuth2.
2. El backend valida la identidad y resuelve permisos.
3. El backend genera tokens firmados, registra la sesión y devuelve cookies `HttpOnly` de acceso y refresh.
4. El frontend reconstruye el estado autenticado consultando `/api/session/me`.
5. Antes de peticiones de escritura, el frontend obtiene el token CSRF desde `/api/session/csrf` y envía `X-XSRF-TOKEN`.
6. Si el token de acceso caduca, la aplicación puede renovar la sesión a través de `/api/session/refresh`.
7. El backend aplica autorizaciones según rol del sistema, rol de equipo y validez de la sesión persistida.

## Configuración por capas

### Backend

La configuración principal vive en `application.properties`, incluyendo los ajustes de CORS, cookies y CSRF.

### Frontend

La configuración principal vive en `public/config.js` y se carga antes de arrancar la aplicación.

### Servidor web

En despliegues empaquetados, Caddy sirve la SPA y actúa como pieza de entrega del frontend.

## Persistencia

La aplicación usa SQLite como base por defecto. JPA/Hibernate se ocupa del mapeo entre entidades y almacenamiento.

## Modelo funcional

Las entidades principales del sistema giran en torno a:

- usuarios,
- tareas,
- listas,
- eventos de calendario,
- equipos,
- invitaciones,
- roles y autoridades.

## Resultado práctico

Esta separación hace que el proyecto sea fácil de operar y mantener:

- el backend controla reglas y seguridad,
- el frontend prioriza experiencia y productividad,
- la configuración runtime reduce acoplamiento entre build y entorno.
