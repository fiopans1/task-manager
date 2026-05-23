# Primeros pasos

## Visión rápida

Task Manager es una aplicación web de gestión de trabajo orientada a usuarios individuales y equipos. Permite registrar tareas, agruparlas en listas, planificarlas en un calendario y compartirlas dentro de equipos con permisos diferenciados.

## Requisitos técnicos

| Componente | Requisito recomendado | Motivo |
| --- | --- | --- |
| Java | Java 23 | El backend compila con `java.version=23` |
| Node.js | Node 20 o superior | Ejecución del frontend y del portal de documentación |
| pnpm | Última versión estable vía `corepack` | Gestión de dependencias del frontend y de la documentación |
| Python | Python 3.8 o superior | Scripts de empaquetado y despliegue |

## Arranque local

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Por defecto el backend escucha en `http://localhost:8080`.

### Frontend

```bash
cd frontend
corepack pnpm install
corepack pnpm start
```

Por defecto el frontend se sirve en `http://localhost:3000`.

## Configuración mínima antes de usar la aplicación

### Configuración del backend

Prepara `application.properties` con estos puntos como mínimo:

- `server.port`
- `taskmanager.frontend.base-url`
- `spring.datasource.url`
- `spring.jpa.hibernate.ddl-auto`
- flags y credenciales de OAuth2 si vas a usar Google, GitHub o Authentik

### Configuración del frontend

El frontend lee su configuración desde `public/config.js` mediante `window.APP_CONFIG`. Revisa al menos:

- `api.baseUrl`
- `oauth2.enabled`
- `oauth2.google.enabled`
- `oauth2.github.enabled`
- `oauth2.authentik.enabled`
- `app.name`, `app.version`, `app.license`

## Primer recorrido recomendado

1. Registra una cuenta local o inicia sesión.
2. Crea una tarea con prioridad y estado.
3. Agrupa varias tareas en una lista.
4. Programa un evento en el calendario.
5. Si trabajas en equipo, crea un equipo o acepta una invitación.

## Si vienes a desarrollar

1. Levanta backend y frontend en paralelo.
2. Revisa la [guía de desarrollo](/es/guia-desarrollo).
3. Usa la [arquitectura](/es/arquitectura) para ubicar servicios, controladores y componentes.
4. Antes de desplegar, repasa la guía de [despliegue](/es/despliegue).
