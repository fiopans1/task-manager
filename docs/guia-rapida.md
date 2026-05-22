# Guía rápida

## Qué es Task Manager

Task Manager es una aplicación web para gestión de tareas y colaboración en equipos. Combina:

- tareas con prioridades y estados,
- listas personalizadas,
- calendario de eventos,
- equipos con roles,
- autenticación local y OAuth2,
- configuración runtime sin recompilar el frontend.

## Prerrequisitos

| Componente | Requisito recomendado |
| --- | --- |
| Java | Java 23 para backend |
| Node.js | Node 20+ |
| Gestor JS | `pnpm` |
| Python | Python 3.8+ para scripts de empaquetado |

## Arranque en desarrollo

### Backend

```bash
cd /home/runner/work/task-manager/task-manager/backend
./mvnw spring-boot:run
```

> El backend compila con `java.version=23`, así que el runtime debe soportar Java 23.

### Frontend

```bash
cd /home/runner/work/task-manager/task-manager/frontend
corepack pnpm install
corepack pnpm start
```

El frontend se sirve en `http://localhost:3000` y consume su configuración desde `public/config.js`.

## Configuración mínima

### Backend

Ajusta `application.properties` para:

- puerto del servidor,
- URL de frontend para CORS y OAuth2,
- ruta de base de datos SQLite,
- activación de OAuth2.

### Frontend

Ajusta `public/config.js` o la plantilla `scripts/config_templates/config.template.js` para:

- `api.baseUrl`,
- proveedores OAuth2 activos,
- metadatos de la app,
- feature flags.

## Flujo recomendado para nuevos lectores

1. **Producto y UX:** [Documentación funcional](/DOCUMENTATION)
2. **Estructura interna:** [Documentación técnica](/TECHNICAL)
3. **Configuración detallada:** [Guía de configuración](/CONFIGURATION)
4. **Docker y empaquetado:** [Guía de despliegue](/DEPLOYMENT)

## Comandos del portal de documentación

```bash
cd /home/runner/work/task-manager/task-manager/docs
corepack pnpm install
corepack pnpm docs:dev
```

Build estático:

```bash
corepack pnpm docs:build
```
