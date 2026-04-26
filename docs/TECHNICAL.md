# Task Manager — Documentación Técnica

Documentación técnica completa del proyecto Task Manager. Incluye la estructura de archivos con descripción detallada de cada fichero, instrucciones de compilación, despliegue y configuración.

---

## Índice

1. [Visión general del proyecto](#1-visión-general-del-proyecto)
2. [Estructura de directorios raíz](#2-estructura-de-directorios-raíz)
3. [Backend — Estructura y archivos](#3-backend--estructura-y-archivos)
   - 3.1 [Punto de entrada](#31-punto-de-entrada)
   - 3.2 [Configuración (`config/`)](#32-configuración-config)
   - 3.3 [Contexto (`context/`)](#33-contexto-context)
   - 3.4 [Controladores REST (`controller/`)](#34-controladores-rest-controller)
   - 3.5 [Modelo — Entidades JPA (`model/entities/`)](#35-modelo--entidades-jpa-modelentities)
   - 3.6 [Modelo — DTOs (`model/dto/`)](#36-modelo--dtos-modeldto)
   - 3.7 [Modelo — Excepciones (`model/exceptions/`)](#37-modelo--excepciones-modelexceptions)
   - 3.8 [Modelo — Validaciones (`model/validations/`)](#38-modelo--validaciones-modelvalidations)
   - 3.9 [Repositorios (`respository/`)](#39-repositorios-respository)
   - 3.10 [Seguridad (`security/`)](#310-seguridad-security)
   - 3.11 [Servicios (`service/`)](#311-servicios-service)
   - 3.12 [Recursos y configuración de ejecución](#312-recursos-y-configuración-de-ejecución)
   - 3.13 [Tests](#313-tests)
   - 3.14 [Archivo de construcción Maven (`pom.xml`)](#314-archivo-de-construcción-maven-pomxml)
4. [Frontend — Estructura y archivos](#4-frontend--estructura-y-archivos)
   - 4.1 [Punto de entrada y raíz](#41-punto-de-entrada-y-raíz)
   - 4.2 [Redux Store y autenticación](#42-redux-store-y-autenticación)
   - 4.3 [Contexto y Hooks personalizados](#43-contexto-y-hooks-personalizados)
   - 4.4 [Servicios (clientes API)](#44-servicios-clientes-api)
   - 4.5 [Componentes — Autenticación (`auth/`)](#45-componentes--autenticación-auth)
   - 4.6 [Componentes — Comunes (`common/`)](#46-componentes--comunes-common)
   - 4.7 [Componentes — Sidebar y navegación](#47-componentes--sidebar-y-navegación)
   - 4.8 [Componentes — Sesión (`session/`)](#48-componentes--sesión-session)
   - 4.9 [Componentes — Home](#49-componentes--home)
   - 4.10 [Componentes — Tareas (`tasks/`)](#410-componentes--tareas-tasks)
   - 4.11 [Componentes — Listas (`lists/`)](#411-componentes--listas-lists)
   - 4.12 [Componentes — Equipos (`teams/`)](#412-componentes--equipos-teams)
   - 4.13 [Componentes — Calendario](#413-componentes--calendario)
   - 4.14 [Componentes — Panel de administración (`adminpanel/`)](#414-componentes--panel-de-administración-adminpanel)
   - 4.15 [Páginas (`pages/`)](#415-páginas-pages)
   - 4.16 [Estilos CSS](#416-estilos-css)
   - 4.17 [Archivos públicos (`public/`)](#417-archivos-públicos-public)
   - 4.18 [Dependencias (`package.json`)](#418-dependencias-packagejson)
5. [Scripts de compilación y despliegue (`scripts/`)](#5-scripts-de-compilación-y-despliegue-scripts)
   - 5.1 [Script principal de compilación](#51-script-principal-de-compilación)
   - 5.2 [Scripts ejecutables (`bin_files/`)](#52-scripts-ejecutables-bin_files)
   - 5.3 [Archivos de configuración estáticos (`config_files/`)](#53-archivos-de-configuración-estáticos-config_files)
   - 5.4 [Plantillas de configuración (`config_templates/`)](#54-plantillas-de-configuración-config_templates)
6. [Docker — Imágenes y scripts](#6-docker--imágenes-y-scripts)
   - 6.1 [Dockerfiles](#61-dockerfiles)
   - 6.2 [Script de construcción Docker](#62-script-de-construcción-docker)
   - 6.3 [Scripts de compilación Docker](#63-scripts-de-compilación-docker)
   - 6.4 [Scripts de despliegue Docker](#64-scripts-de-despliegue-docker)
7. [Cómo compilar el proyecto](#7-cómo-compilar-el-proyecto)
   - 7.1 [Requisitos previos](#71-requisitos-previos)
   - 7.2 [Compilación local](#72-compilación-local)
   - 7.3 [Compilación con Docker](#73-compilación-con-docker)
8. [Cómo desplegar el proyecto](#8-cómo-desplegar-el-proyecto)
   - 8.1 [Despliegue local](#81-despliegue-local)
   - 8.2 [Despliegue con Docker](#82-despliegue-con-docker)
   - 8.3 [Docker Compose](#83-docker-compose)
9. [Desarrollo local](#9-desarrollo-local)
10. [Archivos raíz del proyecto](#10-archivos-raíz-del-proyecto)

---

## 1. Visión general del proyecto

Task Manager es una aplicación web de gestión de tareas construida con:

| Componente | Tecnología | Versión |
|---|---|---|
| **Backend** | Spring Boot | 3.4.1 |
| **Frontend** | React | 18.x |
| **Lenguaje backend** | Java | 23 |
| **Base de datos** | SQLite | — |
| **Servidor web** | Caddy | v2.7.6 |
| **Build backend** | Maven | 3.9.9 |
| **Build frontend** | React Scripts (CRA) | 5.0.1 |
| **Gestor de paquetes frontend** | pnpm | Latest |
| **Autenticación** | JWT (RSA) + OAuth2 | — |

---

## 2. Estructura de directorios raíz

```
task-manager/
├── backend/                    # API REST con Spring Boot
│   ├── src/                    # Código fuente Java
│   ├── pom.xml                 # Configuración Maven
│   ├── mvnw / mvnw.cmd         # Maven Wrapper (Unix/Windows)
│   └── .mvn/                   # Configuración del wrapper
├── frontend/                   # Aplicación SPA con React
│   ├── src/                    # Código fuente JavaScript
│   ├── public/                 # Archivos estáticos
│   └── package.json            # Dependencias npm
├── scripts/                    # Scripts de compilación y despliegue
│   ├── compile.py              # Orquestador de build principal
│   ├── bin_files/              # Scripts ejecutables de runtime
│   ├── config_files/           # Archivos de configuración estáticos
│   └── config_templates/       # Plantillas de configuración
├── docker/                     # Configuración Docker
│   ├── Dockerfile.deployment   # Dockerfile multi-stage (recomendado)
│   ├── Dockerfile.build        # Dockerfile legacy de compilación
│   ├── build.sh                # Script auxiliar de build Docker
│   ├── scripts_compilation/    # Scripts para stage de compilación
│   └── scripts_deployment/     # Scripts para stage de despliegue
├── docs/                       # Documentación del proyecto
├── README.md                   # Documentación principal
├── LICENSE                     # Licencia AGPL v3.0
├── .gitignore                  # Exclusiones de Git
└── .dockerignore               # Exclusiones del contexto Docker
```

---

## 3. Backend — Estructura y archivos

Paquete base: `com.taskmanager.application`

```
backend/src/main/java/com/taskmanager/application/
├── Application.java
├── config/
│   ├── BeanConfiguration.java
│   ├── CorsConfig.java
│   ├── DataLoader.java
│   ├── JacksonConfig.java
│   └── WebSecurityConfig.java
├── context/
│   └── ApplicationContextProvider.java
├── controller/
│   ├── AdminRestController.java
│   ├── AppConfigRestController.java
│   ├── AuthRestController.java
│   ├── GlobalExceptionHandler.java
│   ├── HealthCheckRestController.java
│   ├── HomeRestController.java
│   ├── ListRestController.java
│   ├── SessionRestController.java
│   ├── TaskRestController.java
│   ├── TeamRestController.java
│   └── UserRestController.java
├── model/
│   ├── dto/
│   │   ├── ActionTaskDTO.java
│   │   ├── EventTaskDTO.java
│   │   ├── HomeSummaryDTO.java
│   │   ├── ListTMDTO.java
│   │   ├── LoginDTO.java
│   │   ├── ResponseDTO.java
│   │   ├── TaskAssignmentHistoryDTO.java
│   │   ├── TaskDTO.java
│   │   ├── TaskResumeDTO.java
│   │   ├── TaskSummaryDTO.java
│   │   ├── TeamDTO.java
│   │   ├── TeamDashboardDTO.java
│   │   ├── TeamInvitationDTO.java
│   │   ├── TeamMemberDTO.java
│   │   └── UserDTO.java
│   ├── entities/
│   │   ├── ActionTask.java
│   │   ├── ActionType.java          (enum)
│   │   ├── AppConfig.java
│   │   ├── AuthProvider.java         (enum)
│   │   ├── AuthorityOfRole.java
│   │   ├── EventTask.java
│   │   ├── FullName.java             (@Embeddable)
│   │   ├── InvitationStatus.java     (enum)
│   │   ├── ListTM.java
│   │   ├── PriorityTask.java         (enum)
│   │   ├── RoleOfUser.java
│   │   ├── StateTask.java            (enum)
│   │   ├── Task.java
│   │   ├── TaskAssignmentHistory.java
│   │   ├── Team.java
│   │   ├── TeamInvitation.java
│   │   ├── TeamMember.java
│   │   ├── TeamRole.java             (enum)
│   │   └── User.java
│   ├── exceptions/
│   │   ├── NotPermissionException.java
│   │   ├── OAuth2AuthenticationProcessingException.java
│   │   └── ResourceNotFoundException.java
│   └── validations/
│       └── UserValidation.java
├── respository/
│   ├── ActionTaskRepository.java
│   ├── AppConfigRepository.java
│   ├── AuthorityRepository.java
│   ├── EventTaskRepository.java
│   ├── ListRepository.java
│   ├── RoleRepository.java
│   ├── TaskAssignmentHistoryRepository.java
│   ├── TaskRepository.java
│   ├── TeamInvitationRepository.java
│   ├── TeamMemberRepository.java
│   ├── TeamRepository.java
│   └── UserRepository.java
├── security/
│   ├── JWTAuthorizationFilter.java
│   ├── OAuth2LoginFailureHandler.java
│   ├── OAuth2LoginSuccessHandler.java
│   └── UserPrincipal.java
└── service/
    ├── AdminService.java
    ├── AuthService.java
    ├── CustomOAuth2UserService.java
    ├── CustomOidcUserService.java
    ├── CustomUserDetailsService.java
    ├── HomeService.java
    ├── JWTUtilityService.java
    ├── ListService.java
    ├── RoleService.java
    ├── TaskService.java
    ├── TeamService.java
    ├── UserService.java
    └── oauth2providers/
        ├── GithubOAuth2ProviderServiceImpl.java
        ├── GoogleOAuth2ProviderServiceImpl.java
        └── OAuth2ProviderService.java
```

### 3.1 Punto de entrada

#### `Application.java`
Clase principal de la aplicación Spring Boot. Anotada con `@SpringBootApplication`, inicializa el contexto de Spring, registra todos los beans y arranca el servidor embebido Tomcat. Incluye listeners de inicio y fallo para logging.

### 3.2 Configuración (`config/`)

#### `BeanConfiguration.java`
Define beans de Spring mediante `@Configuration`. Crea una instancia de `UserValidation` como bean singleton para inyección de dependencias en los servicios que necesiten validar datos de usuario.

#### `CorsConfig.java`
Implementa `WebMvcConfigurer` para configurar CORS (Cross-Origin Resource Sharing). Permite peticiones desde el frontend (por defecto `http://localhost:3000`). Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS. Permite credenciales y todas las cabeceras.

#### `DataLoader.java`
Clase `@Configuration` con `CommandLineRunner` que se ejecuta al arrancar la aplicación. Crea los roles (`ADMIN`, `BASIC`) y autoridades (`READ_PRIVILEGES`, `WRITE_PRIVILEGES`) por defecto en la base de datos si no existen. Garantiza que la aplicación siempre tiene los datos mínimos necesarios.

#### `JacksonConfig.java`
Configura el `ObjectMapper` de Jackson para serialización/deserialización JSON. Establece la zona horaria a UTC para garantizar consistencia en las fechas entre cliente y servidor.

#### `WebSecurityConfig.java`
Configuración central de Spring Security. Define:
- `SecurityFilterChain`: cadena de filtros que protege las rutas.
- Rutas públicas: `/auth/**`, `/health`, `/api/config`, `/oauth2/**`.
- Integración del filtro JWT (`JWTAuthorizationFilter`) antes de `UsernamePasswordAuthenticationFilter`.
- Configuración de OAuth2 Login con handlers de éxito/fallo personalizados.
- `@EnableMethodSecurity` para seguridad a nivel de método (permite `@Secured` en controladores).
- `AuthenticationManager` y `PasswordEncoder` (BCrypt).

### 3.3 Contexto (`context/`)

#### `ApplicationContextProvider.java`
Componente `@Component` que implementa `ApplicationContextAware`. Almacena una referencia estática al `ApplicationContext` de Spring, permitiendo que el enum `AuthProvider` resuelva dinámicamente las implementaciones de servicio OAuth2 sin inyección de dependencias directa.

### 3.4 Controladores REST (`controller/`)

#### `AdminRestController.java`
Controlador protegido con `@Secured("ROLE_ADMIN")`. Expone endpoints para:
- Gestión de usuarios: buscar, obtener, bloquear/desbloquear, eliminar.
- Feature flags: obtener y actualizar.
- Mensajes de sistema: obtener y actualizar.
- Configuración pública: obtener config sin autenticación.

#### `AppConfigRestController.java`
Controlador para el endpoint público `GET /api/config`. Retorna la configuración de la aplicación (feature flags, mensajes de sistema) sin requerir autenticación. Usado por el frontend antes del login.

#### `AuthRestController.java`
Controlador de autenticación. Expone `POST /auth/login` que recibe `LoginDTO` (username/password), valida credenciales mediante `AuthService` y retorna un token JWT. También expone `POST /auth/register` para registro de nuevos usuarios.

#### `GlobalExceptionHandler.java`
Anotado con `@RestControllerAdvice`. Captura excepciones globalmente:
- `MethodArgumentNotValidException` → 400 Bad Request con lista de errores de validación.
- `IllegalArgumentException` → 400 Bad Request con mensaje de error.
- Evita que los stacktraces se expongan al cliente.

#### `HealthCheckRestController.java`
Endpoint simple `GET /health` que retorna "OK". Usado para health checks de Docker, balanceadores de carga y monitorización.

#### `HomeRestController.java`
Endpoint `GET /api/home-summary`. Retorna un `HomeSummaryDTO` con:
- Tareas recientes del usuario.
- Próximos eventos del calendario.
- Contadores totales (tareas, listas).
- Estadísticas de progreso.

#### `ListRestController.java`
CRUD completo para listas de tareas (`/api/lists`):
- `GET /api/lists/paged` — listado paginado.
- `GET /api/lists/{id}` — detalle de lista.
- `POST /api/lists` — crear lista.
- `PUT /api/lists/{id}` — actualizar lista.
- `DELETE /api/lists/{id}` — eliminar lista.
- `GET /api/lists/user/{userId}` — listas por usuario (solo admin).

#### `SessionRestController.java`
Endpoint `POST /api/session/refresh` para renovar tokens JWT. El frontend lo invoca periódicamente para extender la sesión del usuario sin forzar re-login.

#### `TaskRestController.java`
Controlador principal de tareas (`/api/tasks`):
- CRUD: crear, obtener, actualizar, eliminar.
- `GET /api/tasks/paged` — listado paginado con filtros opcionales (estado, prioridad).
- `POST /api/tasks/{id}/actions` — añadir acciones (comentarios, ediciones) a una tarea.
- `GET /api/tasks/{id}/actions/paged` — acciones paginadas.
- `GET /api/tasks/events` — tareas con evento (para calendario).
- `GET /api/tasks/user/{userId}` — tareas por usuario (solo admin).

#### `TeamRestController.java`
Gestión de equipos (`/api/teams`):
- CRUD de equipos.
- `GET /api/teams/{id}/dashboard` — estadísticas del equipo.
- `POST /api/teams/{id}/invite` — invitar miembros por email/username.
- `POST /api/teams/invitations/{id}/accept|reject` — aceptar/rechazar invitaciones.
- `GET /api/teams/invitations/pending` — invitaciones pendientes del usuario.
- `PUT /api/teams/{id}/members/{memberId}/role` — cambiar rol de miembro.
- `DELETE /api/teams/{id}/members/{memberId}` — eliminar miembro.
- `PUT /api/teams/{teamId}/tasks/{taskId}/assign` — asignar tarea a miembro.
- `GET /api/teams/{id}/history/paged` — historial de asignaciones.

#### `UserRestController.java`
Operaciones del perfil de usuario (`/api/user/`). Endpoint para obtener datos del usuario autenticado.

### 3.5 Modelo — Entidades JPA (`model/entities/`)

#### `User.java`
Entidad principal de usuario. Campos:
- `id` (Long, PK auto-generado), `username` (String, único), `email` (String, único).
- `password` (String, hash BCrypt), `authProvider` (enum AuthProvider), `providerId` (String).
- `fullName` (FullName embeddable), `createdDate` (LocalDateTime).
- `blocked` (boolean), `roles` (ManyToMany → RoleOfUser).
- Relaciones OneToMany: `lists` (ListTM), `tasks` (Task).
- Implementa `UserDetails` de Spring Security, retornando `ROLE_` + nombre del rol como authorities.

#### `Task.java`
Entidad de tarea. Campos:
- `id` (Long, PK), `nameOfTask` (String), `descriptionOfTask` (String, TEXT).
- `state` (enum StateTask), `priority` (enum PriorityTask).
- `creationDate`, `lastModifiedDate`, `limitDate` (LocalDateTime).
- Relaciones: `user` (ManyToOne → User), `list` (ManyToOne → ListTM), `team` (ManyToOne → Team).
- `actions` (OneToMany → ActionTask), `event` (OneToOne → EventTask).

#### `ListTM.java`
Entidad de lista de tareas. Sufijo "TM" para evitar conflicto con `java.util.List`. Campos:
- `id` (Long, PK), `nameOfList` (String), `descriptionOfList` (String), `color` (String).
- `user` (ManyToOne → User), `tasks` (OneToMany → Task).

#### `Team.java`
Entidad de equipo. Campos:
- `id` (Long, PK), `name` (String), `description` (String).
- `creationDate` (LocalDateTime), `createdBy` (ManyToOne → User).
- `members` (OneToMany → TeamMember).

#### `TeamMember.java`
Entidad de pertenencia a equipo. Restricción única en (team, user). Campos:
- `id` (Long, PK), `team` (ManyToOne → Team), `user` (ManyToOne → User).
- `role` (enum TeamRole: ADMIN, MEMBER), `joinedDate` (LocalDateTime).

#### `TeamInvitation.java`
Invitación a equipo. Campos:
- `id` (Long, PK), `team` (ManyToOne → Team).
- `invitedEmail` (String), `invitedUsername` (String).
- `status` (enum InvitationStatus: PENDING, ACCEPTED, REJECTED).
- `token` (String, único), `createdDate`, `respondedDate` (LocalDateTime).

#### `TaskAssignmentHistory.java`
Historial de asignaciones de tareas dentro de equipos. Campos:
- `id` (Long, PK), `task` (ManyToOne → Task).
- `fromUser`, `toUser`, `changedByUser` (ManyToOne → User).
- `changedDate` (LocalDateTime).

#### `ActionTask.java`
Acción sobre una tarea (comentario, edición). Campos:
- `id` (Long, PK), `actionName` (String), `actionDescription` (String).
- `actionType` (enum ActionType: COMMENT, EDIT_TASK, CREATE_TASK).
- `task` (ManyToOne → Task), `user` (ManyToOne → User).
- `createdDate` (LocalDateTime).

#### `EventTask.java`
Datos de evento/calendario asociado a una tarea. Relación OneToOne con Task. Campos:
- `id` (Long, PK), `startTime`, `endTime` (LocalDateTime).
- `task` (OneToOne → Task).

#### `AppConfig.java`
Almacén clave-valor para configuración de la aplicación. Campos:
- `id` (Long, PK), `configKey` (String, único), `configValue` (String, @Lob, max 5000 chars).
- Almacena feature flags, mensajes de sistema, etc.

#### `FullName.java`
Clase `@Embeddable` para el nombre completo del usuario. Campos:
- `name` (String), `surname1` (String), `surname2` (String).
- Se embebe en la entidad User.

#### `RoleOfUser.java`
Rol de usuario. Campos:
- `id` (Long, PK), `name` (String, único: "ADMIN", "BASIC").
- `authorities` (ManyToMany → AuthorityOfRole).

#### `AuthorityOfRole.java`
Permiso/autoridad individual. Campos:
- `id` (Long, PK), `name` (String: "READ_PRIVILEGES", "WRITE_PRIVILEGES").

#### Enumeraciones

| Enum | Valores | Uso |
|---|---|---|
| `StateTask` | `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `PAUSSED` | Estado de una tarea |
| `PriorityTask` | `MIN`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Prioridad de tarea |
| `ActionType` | `COMMENT`, `EDIT_TASK`, `CREATE_TASK` | Tipo de acción sobre tarea |
| `AuthProvider` | `LOCAL`, `GOOGLE`, `GITHUB` | Proveedor de autenticación |
| `InvitationStatus` | `PENDING`, `ACCEPTED`, `REJECTED` | Estado de invitación a equipo |
| `TeamRole` | `ADMIN`, `MEMBER` | Rol dentro de un equipo |

> **Nota:** `PAUSSED` es intencional — coincide con el código fuente en `StateTask.java`.

### 3.6 Modelo — DTOs (`model/dto/`)

| DTO | Propósito |
|---|---|
| `LoginDTO` | Username y password para autenticación local. |
| `TaskDTO` | Representación completa de tarea con estado, prioridad, fechas, referencia a lista. Usa `@JsonInclude(NON_NULL)`. |
| `TaskResumeDTO` | DTO mínimo de tarea (id, nombre) para vistas de lista. |
| `TaskSummaryDTO` | DTO ligero para tablas de admin: nombre, estado, prioridad, nombre de lista/equipo. |
| `ListTMDTO` | Transferencia de lista con nombre, descripción, color. Incluye conversión de lista de tareas. |
| `TeamDTO` | Datos de equipo: nombre, descripción, fecha creación, lista de miembros. |
| `TeamDashboardDTO` | Analíticas de equipo: miembros, tareas totales/completadas/en progreso/pendientes. |
| `TeamMemberDTO` | Info de miembro: usuario, rol, fecha de ingreso, conteo de tareas pendientes. |
| `TeamInvitationDTO` | Datos de invitación: equipo, invitado, estado, token, fechas. |
| `TaskAssignmentHistoryDTO` | Registro de cambio de asignación: usuario origen/destino, fecha. |
| `ActionTaskDTO` | Acción sobre tarea con tipo y validación. |
| `EventTaskDTO` | DTO ligero para eventos de calendario con hora inicio/fin. |
| `HomeSummaryDTO` | Datos del dashboard: tareas recientes, próximos eventos, totales. Usa `@JsonInclude(NON_NULL)`. |
| `ResponseDTO` | Wrapper de respuesta genérico con listas de errores/mensajes de éxito. |
| `UserDTO` | Placeholder (no implementado actualmente). |

### 3.7 Modelo — Excepciones (`model/exceptions/`)

#### `ResourceNotFoundException.java`
Anotada con `@ResponseStatus(HttpStatus.NOT_FOUND)`. Se lanza cuando un recurso solicitado no existe. Spring la convierte automáticamente en respuesta HTTP 404.

#### `NotPermissionException.java`
Se lanza cuando el usuario autenticado no tiene permisos para realizar la operación solicitada.

#### `OAuth2AuthenticationProcessingException.java`
Extiende `AuthenticationException`. Se lanza durante el procesamiento de autenticación OAuth2 cuando hay errores (proveedor no soportado, datos incompletos, etc.).

### 3.8 Modelo — Validaciones (`model/validations/`)

#### `UserValidation.java`
Clase de validación para registro de usuario. Reglas:
- **Username**: obligatorio, no vacío.
- **Email**: obligatorio, formato de email válido.
- **Password**: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 dígito, 1 carácter especial (`!@#$%^&*()`).

### 3.9 Repositorios (`respository/`)

Todos extienden `JpaRepository<Entidad, Long>`, proporcionando CRUD automático y paginación.

> **Nota:** El paquete se llama `respository` (con typo) en el código fuente original.

| Repositorio | Métodos personalizados destacados |
|---|---|
| `UserRepository` | `findByUsername()`, `findByEmail()` |
| `TaskRepository` | Queries para filtrar por usuario, equipo, estado, prioridad. Soporte de paginación. |
| `ListRepository` | `findAllByUser()`, `countByUser()`, paginación. |
| `TeamRepository` | `findAllByMemberUser()` — query JPQL para equipos del usuario vía TeamMember. |
| `TeamMemberRepository` | `findByTeamAndUser()`, `findAllByTeam()`, `findAllByUser()`. |
| `TeamInvitationRepository` | `findAllByTeam()`, búsqueda por email/username con estado. |
| `TaskAssignmentHistoryRepository` | `findAllByTeamOrderByChangedDateDesc()` con paginación. |
| `ActionTaskRepository` | `findAllByTask()`, paginación por tarea. |
| `EventTaskRepository` | `findAllEventsByUserId()` — query personalizada con `@Query`. |
| `AppConfigRepository` | `findByConfigKey()`, `findByConfigKeyStartingWith()`. |
| `RoleRepository` | `findByName()`, `existsByName()`. |
| `AuthorityRepository` | `findByName()`. |

### 3.10 Seguridad (`security/`)

#### `JWTAuthorizationFilter.java`
Filtro `OncePerRequestFilter` que se ejecuta en cada petición HTTP. Funcionamiento:
1. Extrae el token JWT de la cabecera `Authorization: Bearer <token>`.
2. Valida el token usando `JWTUtilityService`.
3. Extrae claims (username, roles, userId).
4. **Verifica si el usuario está bloqueado** — retorna 403 si lo está.
5. Crea un `UsernamePasswordAuthenticationToken` y lo establece en el `SecurityContext`.

#### `OAuth2LoginSuccessHandler.java`
Implementa `AuthenticationSuccessHandler`. Cuando el login OAuth2 es exitoso:
1. Obtiene el `UserPrincipal` del usuario autenticado.
2. Genera un token JWT con los datos del usuario.
3. Redirige al frontend con el token como parámetro de query: `{frontendUrl}/oauth2/callback?token={jwt}`.

#### `OAuth2LoginFailureHandler.java`
Implementa `AuthenticationFailureHandler`. Cuando el login OAuth2 falla:
1. Extrae el mensaje de error.
2. Redirige al frontend con el error: `{frontendUrl}/oauth2/callback?error={mensaje}`.

#### `UserPrincipal.java`
Implementa `OAuth2User`, `OidcUser` y `UserDetails`. Actúa como puente entre Spring Security y OAuth2. Almacena:
- `id`, `email`, `username`, `fullName`, `roles`.
- Atributos y claims del proveedor OAuth2.
- Authorities derivadas de los roles del usuario.

### 3.11 Servicios (`service/`)

#### `AuthService.java`
Lógica de autenticación:
- `login(LoginDTO)`: valida credenciales, comprueba si el usuario está bloqueado, genera token JWT.
- `register()`: valida datos con `UserValidation`, hashea password con BCrypt, asigna rol BASIC.
- `hasRole(String)`: comprueba si el usuario autenticado tiene un rol específico.
- Métodos de utilidad para obtener el usuario autenticado del `SecurityContext`.

#### `JWTUtilityService.java`
Gestión de tokens JWT con claves RSA:
- `generateToken(User)`: crea JWT firmado con clave privada RSA. Claims: username, userId, roles, email.
- `validateToken(String)`: valida firma y expiración del token.
- `extractClaims(String)`: extrae claims del token para construir el authentication.
- Las claves RSA se cargan desde archivos PEM configurados en `application.properties`.

#### `TaskService.java`
CRUD de tareas con verificación de permisos:
- Verifica propiedad de la tarea o rol ADMIN antes de cada operación.
- `createTask()`: crea tarea asignada al usuario autenticado.
- `updateTask()`: actualiza campos, recalcula relaciones con lista/equipo.
- `deleteTask()`: eliminación con verificación de permisos.
- `addAction()`: añade comentario/edición a una tarea.
- `getEventTasks()`: obtiene tareas con eventos para calendario.
- Soporte de paginación con `Pageable`.

#### `ListService.java`
CRUD de listas con verificación de permisos:
- Verifica propiedad de la lista o rol ADMIN.
- Gestión de la relación bidireccional lista ↔ tareas.
- Soporte de paginación.

#### `TeamService.java`
Gestión completa de equipos:
- `createTeam()`: crea equipo y asigna al creador como ADMIN.
- `inviteMembers()`: envía invitaciones por email/username, genera tokens únicos.
- `acceptInvitation()` / `rejectInvitation()`: gestión de invitaciones.
- `changeMemberRole()`: cambia rol de miembro (solo admin del equipo o admin global).
- `removeMember()`: elimina miembro del equipo.
- `getTeamDashboard()`: genera estadísticas del equipo (miembros, tareas por estado, cargas de trabajo).
- `updateTaskAssignment()`: asigna/reasigna tareas entre miembros, registra historial.
- `validateAdminRole()`: valida que el usuario es admin del equipo o tiene rol global ADMIN.

#### `AdminService.java`
Operaciones de administración:
- `getPublicConfig()`: retorna feature flags y mensajes de sistema (sin autenticación).
- `getUsers()`: busca usuarios con paginación.
- `blockUser()` / `unblockUser()`: bloquea/desbloquea usuarios.
- `deleteUser()`: elimina usuario y sus datos asociados.
- `getFeatureFlags()` / `updateFeatureFlags()`: gestión de feature flags vía AppConfig.
- `getSystemMessage()` / `updateSystemMessage()`: gestión de mensajes de sistema.

#### `HomeService.java`
Agrega datos para el dashboard del usuario:
- Tareas recientes.
- Próximos eventos del calendario.
- Contadores (total tareas, listas, tareas completadas).

#### `CustomOAuth2UserService.java`
Servicio para procesamiento de usuarios OAuth2 (proveedores estándar):
- `loadUser()`: invocado automáticamente por Spring Security tras login OAuth2.
- Extrae email, nombre, username del proveedor.
- Crea o actualiza el usuario en la base de datos.
- Vincula al proveedor de autenticación.
- Genera username automático si no existe.

#### `CustomOidcUserService.java`
Similar a `CustomOAuth2UserService` pero para proveedores OIDC (Google):
- Maneja el flujo OpenID Connect con tokens ID.
- Extrae claims estándar de OIDC.

#### `CustomUserDetailsService.java`
Implementa `UserDetailsService` de Spring Security:
- `loadUserByUsername()`: carga usuario desde la base de datos para autenticación local.

#### `RoleService.java`
Servicio simple para crear roles.

#### `UserService.java`
Implementación parcial/legacy de operaciones de usuario.

#### `oauth2providers/OAuth2ProviderService.java`
Interfaz que define el contrato para proveedores OAuth2:
- `extractEmail()`, `extractFullName()`, `extractUsername()`, `getProviderId()`.
- Cada proveedor implementa esta interfaz.

#### `oauth2providers/GoogleOAuth2ProviderServiceImpl.java`
Implementación para Google. Extrae datos de los atributos OAuth2/OIDC de Google. Soporta tanto OAuth2 estándar como OIDC.

#### `oauth2providers/GithubOAuth2ProviderServiceImpl.java`
Implementación para GitHub. Extrae email, nombre y username de la API de GitHub.

### 3.12 Recursos y configuración de ejecución

#### `src/main/resources/log-config.xml`
Configuración de Logback:
- **Appender CONSOLE**: formato `HH:mm:ss.SSS [thread] LEVEL logger - msg`.
- **Appender FILE**: archivo rotativo diario en `../logs/TaskManager.log`, retención de 7 días.
- Niveles: root=ERROR, Spring=WARN, Hibernate=WARN.

> **Nota:** `application.properties` no está versionado (excluido en `.gitignore`). Se genera a partir de la plantilla en `scripts/config_templates/application-properties.template`.

### 3.13 Tests

#### `src/test/java/.../ApplicationTests.java`
Test mínimo con `@SpringBootTest` que verifica que el contexto de Spring carga correctamente (`contextLoads()`).

### 3.14 Archivo de construcción Maven (`pom.xml`)

- **Group**: `com.taskmanager`, **Artifact**: `taskmanager`, **Version**: `0.0.1-Alpha`.
- **Parent**: `spring-boot-starter-parent:3.4.1`.
- **Java**: 23.

**Dependencias principales:**

| Dependencia | Propósito |
|---|---|
| `spring-boot-starter-web` | API REST, servidor embebido Tomcat |
| `spring-boot-starter-data-jpa` | ORM con Hibernate, repositorios JPA |
| `spring-boot-starter-security` | Autenticación y autorización |
| `spring-boot-starter-validation` | Validación de beans con Jakarta Validation |
| `spring-boot-starter-oauth2-client` | Integración OAuth2 (Google, GitHub) |
| `spring-boot-starter-actuator` | Health checks y monitorización |
| `sqlite-jdbc` | Driver JDBC para SQLite |
| `hibernate-community-dialects` | Dialecto Hibernate para SQLite |
| `nimbus-jose-jwt` (v9.48) | Generación y validación de tokens JWT |
| `lombok` | Generación automática de getters/setters/constructores |
| `spring-boot-starter-test` | Framework de testing |
| `spring-security-test` | Utilidades de testing para seguridad |

**Maven Wrapper:**
- `mvnw` (Unix) / `mvnw.cmd` (Windows): permiten compilar sin Maven instalado globalmente.
- `.mvn/wrapper/maven-wrapper.properties`: apunta a Maven 3.9.9.

---

## 4. Frontend — Estructura y archivos

```
frontend/src/
├── index.js                          # Bootstrap de React
├── App.js                            # Router principal
├── App.css                           # Estilos placeholder CRA
├── index.css                         # Estilos globales
├── styles.css                        # Estilos de aplicación
├── logo.svg                          # Logo placeholder CRA
├── context/
│   └── ThemeContext.js                # Contexto de tema dark/light
├── redux/
│   ├── store.js                      # Configuración Redux store
│   └── slices/
│       └── authSlice.js              # Slice de autenticación
├── hooks/
│   └── useInfiniteScroll.js          # Hooks de scroll infinito
├── services/
│   ├── authService.js                # Cliente API de autenticación
│   ├── configService.js              # Acceso a configuración runtime
│   ├── taskService.js                # Cliente API de tareas
│   ├── listService.js                # Cliente API de listas
│   ├── teamService.js                # Cliente API de equipos
│   ├── adminService.js               # Cliente API de admin
│   └── homeService.js                # Cliente API de dashboard
├── pages/
│   ├── MainApp.js                    # Layout principal autenticado
│   └── HomePage.js                   # Landing page pública
├── components/
│   ├── Home.js                       # Dashboard principal
│   ├── CalendarComponent.js          # Vista de calendario
│   ├── auth/
│   │   ├── LoginPage.js              # Formulario de login
│   │   ├── RegisterPage.js           # Formulario de registro
│   │   ├── OAuth2Login.js            # Handler callback OAuth2
│   │   └── ProtectedRoute.js         # Guard de ruta protegida
│   ├── common/
│   │   ├── Noty.js                   # Utilidades de notificación toast
│   │   ├── FeatureGuard.js           # Guard de feature flags
│   │   ├── SystemMessageModal.js     # Modal de mensaje de sistema
│   │   ├── ThemeToggleButton.js      # Botón toggle tema
│   │   └── OutletUtil.js             # Utilidad de Outlet
│   ├── Sidebar/
│   │   ├── SidebarMenu.js            # Menú lateral principal
│   │   └── About.js                  # Modal "Acerca de"
│   ├── session/
│   │   └── SessionManager.js         # Gestión de expiración de sesión
│   ├── tasks/
│   │   ├── Tasks.js                  # Contenedor de tareas
│   │   ├── TasksList.js              # Lista con scroll infinito
│   │   ├── NewEditTask.js            # Modal crear/editar tarea
│   │   └── TaskDetails/
│   │       ├── TaskDetails.js        # Wrapper de detalle
│   │       ├── TaskDetailsTask.js    # Panel de información
│   │       └── TaskDetailsActions.js # Acciones sobre tarea
│   ├── lists/
│   │   ├── Lists.js                  # Contenedor de listas
│   │   ├── ListsList.js              # Lista con scroll infinito
│   │   ├── ListsExample.js           # Componente de ejemplo
│   │   ├── NewEditLists.js           # Modal crear/editar lista
│   │   └── ListDetails/
│   │       ├── ListDetails.js        # Detalle de lista
│   │       └── ListDetailsGeneral.js # Info general de lista
│   ├── teams/
│   │   ├── Teams.js                  # Contenedor de equipos
│   │   ├── TeamsList.js              # Lista con scroll infinito
│   │   ├── NewEditTeam.js            # Modal crear/editar equipo
│   │   ├── TeamDashboard.js          # Dashboard de equipo (tabs)
│   │   ├── DashboardTab.js           # Tab de estadísticas
│   │   ├── TasksTab.js               # Tab de tareas del equipo
│   │   ├── HistoryTab.js             # Tab de historial
│   │   ├── InvitationsTab.js         # Tab de invitaciones
│   │   └── MentionInput.js           # Input con @menciones
│   └── adminpanel/
│       ├── AdminPanel.js             # Panel de admin principal
│       ├── UserManagementTab.js      # Gestión de usuarios
│       ├── UserSearchResults.js      # Resultados de búsqueda
│       ├── UserDetailModal.js        # Modal detalle de usuario
│       ├── FeatureFlagsTab.js        # Gestión de feature flags
│       ├── SystemMessageTab.js       # Gestión de mensajes
│       └── ConfirmModal.js           # Modal de confirmación
```

### 4.1 Punto de entrada y raíz

#### `index.js`
Bootstrap de la aplicación React. Envuelve el componente `App` con:
- `<Provider store={store}>` — Redux store global.
- `<PersistGate>` — Redux Persist para persistencia en localStorage.
- `<ThemeProvider>` — Contexto de tema dark/light.
- `<BrowserRouter>` — React Router v7.
- `<ToastContainer>` — React Toastify para notificaciones.
- Importa Bootstrap CSS y estilos globales.

#### `App.js`
Componente raíz con React Router. Responsabilidades:
- Comprueba la existencia de token de autenticación (Redux o callback OAuth2).
- Define todas las rutas:
  - Rutas públicas: `/` (HomePage), `/login`, `/register`, `/oauth2/callback`.
  - Rutas protegidas (envueltas en `<ProtectedRoute>`): `/home`, `/tasks`, `/lists`, `/teams`, `/calendar`, `/admin`.
  - Rutas protegidas adicionalmente con `<FeatureGuard>` para features desactivables.
- `useEffect` para verificar token OAuth2 al montar.

### 4.2 Redux Store y autenticación

#### `redux/store.js`
Configuración de Redux Toolkit:
- `configureStore` con middleware serializable personalizado (ignora acciones de Redux Persist).
- `persistConfig`: almacenamiento en `localStorage`, whitelist solo `auth`.
- Exporta `store` y `persistor`.

#### `redux/slices/authSlice.js`
Slice de autenticación con Redux Toolkit:
- Estado: `{ token: null }`.
- Acciones: `setToken(token)` y `clearToken()`.
- El token se persiste automáticamente en localStorage vía Redux Persist.

### 4.3 Contexto y Hooks personalizados

#### `context/ThemeContext.js`
Contexto React para gestión de tema:
- Estado `darkMode` persistido en `localStorage`.
- Al cambiar, actualiza `document.documentElement.setAttribute('data-bs-theme', ...)` para Bootstrap.
- Actualiza el meta tag `theme-color` para Safari.
- Exporta hook `useTheme()` que retorna `{ darkMode, toggleTheme }`.

#### `hooks/useInfiniteScroll.js`
Contiene dos hooks personalizados:

**`useServerInfiniteScroll(fetchPage, pageSize, deps)`** — Paginación del servidor:
- Mantiene `page`, `hasMore`, `items`, `loading`, `initialLoading`.
- Usa `IntersectionObserver` en un elemento sentinel para detectar scroll al final.
- Llama a `fetchPage(page, size)` que debe retornar `{ content, last }` (formato Spring Page).
- Retorna `{ items, loading, initialLoading, hasMore, LoadMoreSpinner, reset }`.
- Maneja cancelación al desmontar o cambio de dependencias.

**`useInfiniteScroll(allItems, pageSize)`** — Paginación del cliente:
- Recibe todos los items pre-cargados.
- Incrementa `displayCount` progresivamente mediante IntersectionObserver.
- Retorna `{ displayedItems, sentinelRef, hasMore, LoadMoreSpinner }`.

### 4.4 Servicios (clientes API)

Todos los servicios usan Axios con header `Authorization: Bearer <token>` obtenido del store Redux.

#### `authService.js`
- `login(username, password)` — `POST /auth/login`. Almacena token en Redux.
- `register(formData)` — `POST /auth/register`.
- `checkForOAuth2Token()` — Comprueba parámetros URL del callback OAuth2.
- `getToken()` — Obtiene token del store Redux.
- `logout()` — Limpia token de Redux.

#### `configService.js`
Singleton que accede a `window.APP_CONFIG` (cargado desde `public/config.js` en runtime):
- `getApiBaseUrl()` — URL base del API.
- `isOAuth2Enabled()` — Si OAuth2 está habilitado globalmente.
- `isFeatureEnabled(feature)` — Comprobación de feature flags.
- `getAppName()`, `getAppVersion()`, `isDebugMode()`.

#### `taskService.js`
- `createTask(taskData)` — `POST /api/tasks`. Invalida caché.
- `editTask(id, taskData)` — `PUT /api/tasks/{id}`. Invalida caché.
- `deleteTask(id)` — `DELETE /api/tasks/{id}`. Invalida caché.
- `getTaskById(id)` — `GET /api/tasks/{id}`.
- `fetchTasksPage(page, size)` — `GET /api/tasks/paged?page={p}&size={s}`.
- `getEvents()` — `GET /api/tasks/events`.
- Patrón de caché Suspense con `getSuspender()` e `invalidateTasksCache()`.

#### `listService.js`
- CRUD: `createList()`, `updateList()`, `deleteList()`.
- `getListById(id)` — Detalle.
- `fetchListsPage(page, size)` — Paginado.
- `getTasksInList(listId)` — Tareas de una lista.
- Mismo patrón de caché Suspense.

#### `teamService.js`
- CRUD de equipos: `createTeam()`, `updateTeam()`, `deleteTeam()`.
- `getTeamById(id)`, `getTeamDashboard(id)`.
- `fetchTeamsPage(page, size)`.
- Invitaciones: `inviteMembers()`, `acceptInvitation()`, `rejectInvitation()`, `getTeamInvitations()`.
- Roles: `changeMemberRole()`, `removeMember()`.
- `getTeamHistory(id, page, size)`.
- Caché Suspense.

#### `adminService.js`
- `getPublicConfig()` — `GET /api/config` (sin auth).
- `searchUsers(query)` — Búsqueda de usuarios.
- `getUser(id)`, `blockUser(id)`, `unblockUser(id)`, `deleteUser(id)`.
- `getFeatureFlags()`, `updateFeatureFlags(flags)`.
- `getSystemMessage()`, `updateSystemMessage(message)`.
- Caché Suspense para admin features.

#### `homeService.js`
- `getHomeSummary()` — `GET /api/home-summary`.

### 4.5 Componentes — Autenticación (`auth/`)

#### `LoginPage.js`
Formulario de login con campos username y password. Despacha token a Redux en caso de éxito. Muestra toasts de éxito/error. Enlace a registro y botones OAuth2. Incluye toggle de tema y modal de mensaje de sistema.

#### `RegisterPage.js`
Formulario de registro con campos: email, username, password, confirmar password, nombre, apellido1, apellido2. Validación de coincidencia de passwords. Redirige a login tras éxito. Toggle de tema y modal de mensaje de sistema.

#### `OAuth2Login.js`
Handler del callback OAuth2:
- Comprueba si hay token en los parámetros de URL.
- Maneja errores de callback con códigos de error.
- Notificaciones de éxito/error.
- Renderiza botones de proveedores OAuth2 (Google, GitHub, Authentik).

#### `ProtectedRoute.js`
Componente guard: comprueba prop `isAuthenticated`. Si es `false`, redirige a `/`. Si es `true`, renderiza `children`.

### 4.6 Componentes — Comunes (`common/`)

#### `Noty.js`
Wrappers de React Toastify:
- `successToast(msg)` — toast verde, 3s.
- `errorToast(msg)` — toast rojo, 5s.
- `warningToast(msg)` — toast amarillo.
- `infoToast(msg)` — toast azul.

#### `FeatureGuard.js`
Guard de feature flags:
- Obtiene config pública de `adminService.getPublicConfig()`.
- Comprueba si la feature está habilitada (por defecto `true` si no está definida).
- Si está deshabilitada, redirige a `/home`.
- Muestra spinner de carga mientras consulta.

#### `SystemMessageModal.js`
Modal de anuncios del sistema:
- Obtiene config de `adminService.getPublicConfig()`.
- Muestra condicionalmente según flags `showAfterLogin` / `showBeforeLogin`.
- Prop `context` distingue "afterLogin" vs "beforeLogin".
- Falla silenciosamente si la config no está disponible.

#### `ThemeToggleButton.js`
Botón flotante para cambiar tema:
- Posición fija (abajo-izquierda, z-index 1050).
- Usa hook `useTheme()`.
- Icono sol/luna según estado de `darkMode`.

#### `OutletUtil.js`
Componente utilitario que renderiza `<Outlet>` de React Router para anidación de rutas.

### 4.7 Componentes — Sidebar y navegación

#### `Sidebar/SidebarMenu.js`
Menú de navegación lateral responsivo:
- **Items de navegación**: Mis Tareas, Calendario, Listas, Equipos (condicionados por feature flags).
- **Enlace Admin** para usuarios con rol ADMIN.
- **Búsqueda** de tareas/listas.
- **Badge** de invitaciones pendientes.
- **Toggle** de tema dark/light.
- **Modal "Acerca de"**.
- **Botón de logout**.
- **Responsivo**: columna fija en desktop, offcanvas en mobile con botón toggle.
- `handleNavClick()` usa `navigate()` + invalidación de caché para forzar recarga.

#### `Sidebar/About.js`
Modal "Acerca de":
- Muestra nombre de app, versión, licencia desde `configService`.
- Badge de versión estilizado.

### 4.8 Componentes — Sesión (`session/`)

#### `SessionManager.js`
Gestión de expiración de sesión JWT:
- Polling cada 30 segundos para comprobar expiración del token.
- Muestra modal de aviso 5 minutos antes de la expiración.
- Countdown de 60 segundos en el modal.
- Opciones: extender sesión (refresh token) o forzar logout.
- Usa refs para prevenir memory leaks en los intervalos.

### 4.9 Componentes — Home

#### `Home.js`
Dashboard principal del usuario autenticado:
- Estadísticas de tareas: total, completadas, vencidas, próximas.
- Tarjetas de acción rápida por estado de tarea.
- Indicadores de progreso con gráficos (recharts).
- Usa `homeService.getHomeSummary()`.
- Placeholders de carga.
- Layout de grid responsivo.

### 4.10 Componentes — Tareas (`tasks/`)

#### `Tasks.js`
Contenedor padre de la sección de tareas:
- Barra de búsqueda.
- Toggle de modal "Nueva Tarea" / "Editar Tarea".
- Detección responsiva mobile/desktop.
- `refreshKey` para invalidación de caché.
- Renderiza `TasksList` con callbacks.

#### `TasksList.js`
Lista de tareas con scroll infinito:
- Usa `useServerInfiniteScroll` con paginación del servidor.
- Modal de confirmación de eliminación.
- Tarjetas de tarea con badges de estado.
- Callbacks de apertura/edición.
- Muestra: nombre, prioridad, estado, fecha límite.
- Estado vacío con icono placeholder.

#### `NewEditTask.js`
Modal para crear/editar tareas:
- Campos: nombre, descripción, prioridad (MIN/LOW/MEDIUM/HIGH/CRITICAL), estado.
- Toggle entre evento (calendario) o tarea regular.
- Selectores de fecha/hora para inicio/fin.
- Validación con feedback.
- Prop `editOrNew` controla modo crear vs. editar.
- Prop opcional `onSave` para uso desde el panel de admin.

#### `TaskDetails/TaskDetails.js`
Wrapper de vista de detalle (ruta `/tasks/:id`):
- Obtiene tarea por ID.
- Detecta si la tarea pertenece a un equipo.
- Renderiza `TaskDetailsTask` (info) + `TaskDetailsActions` (operaciones).

#### `TaskDetails/TaskDetailsTask.js`
Panel de información de tarea:
- Nombre, descripción, fechas, prioridad, estado.
- Badges de estado/prioridad.
- Timestamp de última actualización.
- Botón de edición.

#### `TaskDetails/TaskDetailsActions.js`
Acciones sobre una tarea:
- Botones de transición de estado.
- Editar, eliminar.
- Añadir a equipo (si aplica).
- Archivar/desarchivar.

### 4.11 Componentes — Listas (`lists/`)

#### `Lists.js`
Contenedor padre de la sección de listas:
- Barra de búsqueda.
- Modales de crear/editar lista.
- Responsivo con offcanvas en mobile.
- Renderiza `ListsList` con paginación.

#### `ListsList.js`
Lista de listas con scroll infinito:
- Usa `useServerInfiniteScroll`.
- Modal de confirmación de eliminación.
- Tarjetas con nombre, descripción, indicador de color.
- Click para abrir detalle.
- Acciones de editar/eliminar.

#### `NewEditLists.js`
Modal para crear/editar listas:
- Campos: nombre, descripción, selector de color.
- Validación de formulario.
- Modo crear o editar via prop `editOrNew`.
- Prop `onSave` opcional para admin panel.

#### `ListsExample.js`
Componente de ejemplo/placeholder.

#### `ListDetails/ListDetails.js`
Página de detalle de lista:
- Info de la lista (nombre, descripción, color).
- Tareas dentro de la lista con scroll infinito.
- Botón para añadir tarea a la lista.
- Barra de progreso de tareas.
- Marcar tarea como completada/incompleta.
- Botón de editar lista.

#### `ListDetails/ListDetailsGeneral.js`
Tab de información general de la lista:
- Visualización read-only de metadatos.
- Indicador de color.
- Resumen de conteo de tareas.

### 4.12 Componentes — Equipos (`teams/`)

#### `Teams.js`
Contenedor padre de equipos:
- Modal de crear equipo.
- Barra de búsqueda.
- Sección de invitaciones pendientes.
- Renderiza `TeamsList` con scroll infinito.
- Carga invitaciones pendientes al navegar.

#### `TeamsList.js`
Lista de equipos con scroll infinito:
- Tarjetas de equipo paginadas.
- Click navega al dashboard del equipo.
- Muestra conteo de miembros.
- Mensaje de estado vacío.

#### `NewEditTeam.js`
Modal para crear/editar equipo:
- Campos: nombre, descripción.
- Invitación opcional de miembros en la creación.
- Validación de formulario.

#### `TeamDashboard.js`
Vista de detalle de equipo (ruta `/teams/:id`):
- Interfaz de tabs: Dashboard, Tareas, Historial, Invitaciones.
- Carga datos del equipo + estadísticas del dashboard.
- Detección de rol admin.
- Botones: editar equipo, salir/eliminar equipo.

#### `DashboardTab.js`
Tab de estadísticas del equipo:
- Tarjetas de estadísticas: tareas totales, completadas, en progreso, pendientes.
- Lista de miembros con roles.
- Dropdown de cambio de rol (solo admin).
- Botón de eliminar miembro (solo admin).

#### `TasksTab.js`
Tab de tareas del equipo:
- Tareas específicas del equipo.
- Botón de añadir tarea al equipo.
- Filtro por estado de tarea.
- Tarjetas con acciones.

#### `HistoryTab.js`
Tab de historial de actividad:
- Timestamps de eventos del equipo.
- Adiciones/eliminaciones de miembros.
- Cambios de estado de tareas.
- Paginación para historiales largos.

#### `InvitationsTab.js`
Tab de invitaciones pendientes:
- Lista de usuarios invitados no aceptados.
- Botones aceptar/rechazar para invitados.
- Reenviar invitación (admin).
- Cancelar invitación (admin).

#### `MentionInput.js`
Textarea con soporte de @menciones:
- Detecta carácter "@" y sugiere miembros del equipo.
- Autocompletado al seleccionar miembro.
- Dropdown de usernames coincidentes.
- Navegación por teclado.
- Props: `value`, `onChange`, `members`, `placeholder`.

### 4.13 Componentes — Calendario

#### `CalendarComponent.js`
Vista de calendario integrando tareas:
- Usa `react-big-calendar` con localizador `dayjs`.
- Convierte tareas a eventos de calendario (startTime/endTime).
- Spinner de carga mientras obtiene eventos.
- Contenedor responsivo con Bootstrap Card.

### 4.14 Componentes — Panel de administración (`adminpanel/`)

#### `AdminPanel.js`
Dashboard de administración con tabs:
- Tabs: Usuarios, Feature Flags, Mensajes de Sistema.
- Header estilizado con icono de escudo.
- Navegación por tabs con iconos.

#### `UserManagementTab.js`
Administración de usuarios:
- Formulario de búsqueda de usuarios.
- Resultados con scroll infinito.
- Botones de bloquear/desbloquear.
- Confirmación de eliminación.
- Click para abrir modal de detalle.

#### `UserSearchResults.js`
Lista de resultados de búsqueda:
- Usa `useServerInfiniteScroll`.
- Muestra username, email, rol, badges de estado.
- Click para abrir modal de detalle.
- Botones de bloquear/eliminar.

#### `UserDetailModal.js`
Modal de detalle de usuario:
- Muestra: ID, username, email, nombre completo.
- Fecha de creación de cuenta.
- Estado (activo/bloqueado).
- Información de roles.
- Botón de bloquear/desbloquear.
- Botón de eliminar con confirmación.
- Carga lazy de tabs de tareas/listas/equipos del usuario.

#### `FeatureFlagsTab.js`
Gestión de feature flags:
- Toggles para cada feature (calendario, listas, tareas, etc.).
- Botón de guardar para persistir cambios.
- Carga flags actuales al montar.
- Actualiza vía `adminService`.

#### `SystemMessageTab.js`
Gestión de mensajes de sistema:
- Toggle habilitar/deshabilitar.
- Textarea de texto del mensaje.
- Checkboxes: mostrar en login / mostrar después de login.
- Botón de guardar.
- Preview del mensaje.

#### `ConfirmModal.js`
Modal reutilizable de confirmación:
- Props: título, mensaje, texto de botones, estilo.
- Callback `onConfirm`.
- Usado para acciones destructivas (eliminar, bloquear).

### 4.15 Páginas (`pages/`)

#### `MainApp.js`
Layout wrapper para usuarios autenticados:
- Layout de dos columnas: `SidebarMenu` + `<Outlet>`.
- Incluye `SessionManager` (gestión de sesión).
- Incluye `SystemMessageModal` (mensajes post-login).
- Contenedor full viewport height.

#### `HomePage.js`
Landing page para usuarios no autenticados:
- Copy de marketing con botones de Sign In / Register.
- Inyecta nombre de la app desde `configService`.

### 4.16 Estilos CSS

> Guías ampliadas: [React Bootstrap](./REACT_BOOTSTRAP_GUIDE.md) · [CSS](./CSS_GUIDE.md)

#### `index.css`
Estilos globales y fundacionales:
- Fixes para viewport en Safari iOS con `-webkit-fill-available`.
- Restricciones de altura y estructura base para `html`, `body` y `#root`.
- Prevención de scroll horizontal accidental en mobile.
- Tamaño mínimo de fuente en `input`, `select` y `textarea` para evitar zoom automático en iOS.

#### `styles.css`
Estilos específicos de la aplicación y overrides controlados sobre Bootstrap:
- Animaciones de gradiente para pantallas de autenticación/landing.
- Utilidades de truncado de texto y fixes de overflow para cards de tareas y listas.
- Reglas del sidebar (`.sidebar-menu`, `nav-pills`, modo colapsado, hover y activo).
- Ajustes del layout principal (`.main-app-row`, `.outlet-col`) para escritorio y móvil.
- Mejoras de interacción para top bar y botones móviles.
- Media queries orientadas a responsive real del layout principal.

#### Uso recomendado
- Priorizar utilidades Bootstrap (`d-flex`, `gap-*`, `px-*`, `text-*`, `rounded-*`, `shadow-*`) para layout y spacing.
- Añadir CSS propio cuando el estilo represente una pieza estable de la app o requiera reglas complejas.
- Reutilizar tokens compatibles con `data-bs-theme` siempre que sea posible para no romper el tema oscuro.

#### `App.css`
Estilos mínimos heredados del template Create React App (animación del logo y header). Actualmente tiene relevancia baja frente a `index.css` y `styles.css`.

### 4.17 Archivos públicos (`public/`)

| Archivo | Descripción |
|---|---|
| `index.html` | HTML entry point. Carga `config.js` antes de React. Meta tags para mobile. |
| `config.js` | Configuración runtime (`window.APP_CONFIG`). API URL, OAuth2, features, app metadata. |
| `manifest.json` | Manifiesto PWA con branding, iconos, modo de display. |
| `favicon.ico` | Icono del navegador. |
| `logo192.png` | Icono PWA 192x192. |
| `logo512.png` | Icono PWA 512x512. |
| `robots.txt` | Directivas SEO para crawlers. |

### 4.18 Dependencias (`package.json`)

| Categoría | Paquetes |
|---|---|
| **Core React** | `react` 18, `react-dom` 18, `react-scripts` 5.0.1 |
| **Routing** | `react-router-dom` 7.1.5 |
| **State Management** | `@reduxjs/toolkit` 2.5.1, `react-redux` 9.2.0, `redux-persist` 6.0.0 |
| **UI Framework** | `bootstrap` 5.3.5, `react-bootstrap` 2.10.9 |
| **Iconos** | `bootstrap-icons` 1.11.3, `react-bootstrap-icons` 1.11.5, `react-icons` 5.4.0, `lucide-react` 0.507.0, `@fortawesome/fontawesome-free` 6.7.2 |
| **HTTP** | `axios` 1.7.9 |
| **Notificaciones** | `react-toastify` 11.0.5 |
| **Calendario** | `react-big-calendar` 1.18.0, `dayjs` 1.11.13 |
| **Gráficos** | `recharts` 2.15.3 |
| **Auth** | `jose` 6.0.8 (decodificación JWT) |
| **Error Handling** | `react-error-boundary` 5.0.0 |
| **Testing** | `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` |

---

## 5. Scripts de compilación y despliegue (`scripts/`)

### 5.1 Script principal de compilación

#### `compile.py`
Orquestador de build principal. Clase `BuildTaskManager` que realiza:

1. **Descarga de Caddy**: detecta plataforma/arquitectura automáticamente o usa las especificadas. Descarga el binario de Caddy apropiado.
2. **Compilación del backend**: ejecuta `mvn clean package -DskipTests` para generar el JAR.
3. **Compilación del frontend**: ejecuta `pnpm install` + `pnpm build` (o equivalente) para generar el SPA estático.
4. **Generación de configuración**: aplica las plantillas de `config_templates/` para generar archivos de configuración.
5. **Empaquetado**: crea la estructura de directorios y empaqueta todo en `TaskManager.zip`.

**Uso:**
```bash
cd scripts
python3 compile.py --action deploy
```

**Parámetros de configuración:**
- `project_root` — Directorio raíz del proyecto.
- `name_final_file` — Nombre del ZIP final (default: `TaskManager`).
- `caddy_version` — Versión de Caddy (default: `v2.7.6`).
- `target_platform` — Plataforma: linux, mac, windows.
- `target_architecture` — Arquitectura: x86_64, arm64, armv7, etc.

**Estructura del ZIP generado:**
```
TaskManager/
├── bin/
│   ├── start.py
│   ├── stop.py
│   └── key_generator.py
├── config/
│   ├── application.properties
│   ├── Caddyfile
│   └── log-backend-config.xml
├── lib/
│   ├── backend/
│   │   └── taskmanager-0.0.1-Alpha.jar
│   ├── frontend/
│   │   └── (archivos estáticos React)
│   └── caddy (ejecutable)
└── metadata/
    └── (base de datos SQLite, creada en runtime)
```

#### `requirements.txt`
Dependencia de Python: `requests>=2.28.0`. Usada por `compile.py` para descargar Caddy.

### 5.2 Scripts ejecutables (`bin_files/`)

#### `start.py`
Inicia los servicios backend y/o frontend.

**Clases:**
- `StartBackendTaskManager`: localiza el JAR en `lib/backend/`, valida la existencia de `config/application.properties`, arranca el proceso Java con:
  ```bash
  java -jar backend.jar \
    --spring.config.location=file:config/application.properties \
    --spring.profiles.active=prod \
    --server.port=8080
  ```
- `StartFrontendTaskManager`: localiza Caddy en `lib/caddy/`, valida la existencia de `lib/frontend/`, arranca Caddy con:
  ```bash
  ./caddy run --config ../config/Caddyfile --adapter caddyfile
  ```

**Uso:**
```bash
python3 start.py --start-all        # Backend + Frontend
python3 start.py --start-backend    # Solo backend
python3 start.py --start-frontend   # Solo frontend
```

#### `stop.py`
Detiene servicios matando procesos por puerto.

**Funciones:**
- `kill_ports_unix(ports)`: usa `lsof -ti:PORT` + `kill -9 PID`.
- `kill_ports_windows(ports)`: usa `netstat -ano` + `taskkill /F /PID`.
- Detección automática de OS.

**Uso:**
```bash
python3 stop.py --stop-backend          # Mata puerto 8080
python3 stop.py --stop-frontend         # Mata puerto 3000
python3 stop.py --ports 8080 3000       # Puertos personalizados
```

#### `key_generator.py`
Genera claves RSA para firma de tokens JWT.

**Proceso:**
1. Verifica que OpenSSL está instalado.
2. Crea directorio `keys/`.
3. Genera clave privada: `openssl genrsa -out private_key.pem 2048`.
4. Genera clave pública: `openssl rsa -in private_key.pem -pubout -out public_key.pem`.
5. Verifica que las claves son válidas.

### 5.3 Archivos de configuración estáticos (`config_files/`)

#### `Caddyfile`
Configuración del servidor web Caddy para servir el SPA:
- Puerto: `:3000`.
- `root * /lib/frontend` — directorio de archivos estáticos.
- `try_files {path} /index.html` — SPA routing (todas las rutas al index.html).
- `file_server` — servir archivos estáticos.
- `encode gzip` — compresión gzip nivel 6.
- Headers de seguridad: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
- Headers de caché para assets estáticos.

#### `log-backend-config.xml`
Configuración de Logback:
- Appender CONSOLE: formato `HH:mm:ss.SSS [thread] LEVEL logger - msg`.
- Appender FILE: rotación diaria, retención 7 días, `../logs/TaskManager.log`.
- Niveles: root=ERROR, Spring=WARN, Hibernate=WARN.

### 5.4 Plantillas de configuración (`config_templates/`)

#### `application-properties.template`
Plantilla para `application.properties` del backend (129 líneas):
- Configuración del servidor (puerto 8080).
- Base de datos SQLite: `jdbc:sqlite:${DEPLOY_ROOT}/metadata/task-manager.db`.
- JPA/Hibernate: `ddl-auto=update`, `show-sql=false`, batch_size=20.
- Claves JWT: rutas a `private_key.pem` y `public_key.pem`.
- Logging: referencia a `log-backend-config.xml`.
- Secciones comentadas para OAuth2 (Google, GitHub, Authentik).
- Secciones comentadas para Actuator y CORS.

#### `config.template.js`
Plantilla para `config.js` del frontend (78 líneas):
```javascript
window.APP_CONFIG = {
  api: { baseUrl: "http://localhost:8080" },
  oauth2: {
    enabled: false,
    google: { enabled: false },
    github: { enabled: false },
    authentik: { enabled: false }
  },
  app: { name: "Task Manager", version: "0.0.1", debug: false, license: "Community Edition" },
  features: { calendar: true, lists: true, timeTracking: true }
}
```

#### `Caddyfile.template`
Plantilla de Caddy (146 líneas) con secciones adicionales comentadas:
- Desarrollo local (`:3000`).
- Logging de acceso (comentado).
- Reverse proxy para API (comentado).
- Bloque HTTPS para producción con Let's Encrypt (comentado).

---

## 6. Docker — Imágenes y scripts

### 6.1 Dockerfiles

#### `Dockerfile.deployment` (Recomendado)
Dockerfile multi-stage moderno:

**Stage 1 — Builder:**
- Base: `eclipse-temurin:23-jdk` sobre Ubuntu.
- Instala: Python 3, Maven, Node.js, pnpm, git, herramientas de build.
- Clona el repositorio desde GitHub.
- Ejecuta `compile.py` para generar `TaskManager.zip`.

**Stage 2 — Runtime:**
- Base: `eclipse-temurin:23-jdk` (solo runtime, sin herramientas de build).
- Instala dependencias mínimas: Python 3, bash, unzip, lsof, openssl.
- Copia `TaskManager.zip` del stage builder.
- Crea volumen `/app/metadata` para base de datos.
- ENTRYPOINT: `entrypoint.sh`.
- CMD: `["--start-all"]`.

**Build args:**
```dockerfile
ARG GIT_REPO=https://github.com/fiopans1/task-manager.git
ARG GIT_BRANCH=main
```

**Ventajas:**
- Imagen final ~70% más pequeña (sin herramientas de build).
- Soporte multi-arquitectura (AMD64, ARM64, ARM/v7).
- Reproducible (siempre compila desde fuente).
- Un solo comando construye todo.

#### `Dockerfile.build` (Legacy/Deprecated)
Dockerfile de compilación solamente. Genera el artefacto pero requiere ejecución manual posterior.

### 6.2 Script de construcción Docker

#### `build.sh`
Script auxiliar para construir imágenes Docker (223 líneas):

**Opciones:**
```bash
-t, --tag TAG            # Tag de imagen (default: fiopans1/taskmanager:latest)
-p, --platform PLAT      # Plataforma (default: linux/amd64)
-m, --multi              # Build multi-plataforma (amd64+arm64)
--push                   # Push a Docker Hub
--no-cache               # Sin caché
-v, --verbose            # Modo verbose
--git-repo URL           # URL del repositorio
--git-branch BRANCH      # Branch a clonar
```

**Ejemplo:**
```bash
./build.sh --platform linux/amd64 --push --tag myuser/taskmanager:v1.0
```

### 6.3 Scripts de compilación Docker

#### `scripts_compilation/entrypoint.sh`
Entrypoint del container de compilación. Comandos:
- `compile` — Clona repo, compila y genera ZIP.
- `copy_to_output [file]` — Copia archivo a `/output`.
- `run_python [script.py] [args]` — Ejecuta script Python.
- `check_output` — Lista archivos en `/output`.
- `bash` — Shell interactiva.

#### `scripts_compilation/env-setup.sh`
Variables de entorno para compilación:
```bash
ACTION=deploy
NAME_FINAL_FILE=TaskManager
PLATFORM=mac
VERSION=1.0.0
ARCHITECTURE=arm64
CADDY_VERSION=v2.7.6
```

### 6.4 Scripts de despliegue Docker

#### `scripts_deployment/entrypoint.sh`
Entrypoint del container de despliegue (238 líneas). Comandos:
```bash
--start-all              # Backend + Frontend (default)
--start-backend          # Solo backend
--start-frontend         # Solo frontend
--stop                   # Detener todo
--stop-backend           # Detener backend
--stop-frontend          # Detener frontend
--backend-port PORT      # Puerto backend (default: 8080)
--frontend-port PORT     # Puerto frontend (default: 3000)
bash                     # Shell interactiva
```

#### `scripts_deployment/env-setup.sh`
Variables de entorno para despliegue:
```bash
BACKEND_PORT=8080
FRONTEND_PORT=3000
PROJECT_ROOT=/app/task-manager
```

#### `scripts_deployment/prepare_environment.sh`
Prepara el entorno de ejecución (247 líneas):
1. `prepare_environment()` — Extrae `TaskManager.zip`, configura permisos.
2. `copy_config_files()` — Copia configuraciones personalizadas desde `/files_to_copy` si existen.
3. `generate_jwt_keys()` — Genera claves JWT RSA si no existen.

---

## 7. Cómo compilar el proyecto

### 7.1 Requisitos previos

| Herramienta | Versión mínima | Propósito |
|---|---|---|
| Java JDK | 23 | Compilación y ejecución del backend |
| Maven | 3.6+ | Build del backend (o usar `mvnw`) |
| Node.js | 18+ | Build del frontend |
| pnpm | Latest | Gestor de paquetes frontend |
| Python | 3.8+ | Scripts de compilación y despliegue |
| OpenSSL | — | Generación de claves JWT |

### 7.2 Compilación local

#### Compilación completa (recomendado):
```bash
# 1. Instalar dependencias de Python
cd scripts
pip install -r requirements.txt

# 2. Ejecutar compilación
python3 compile.py --action deploy
```

Esto genera `TaskManager.zip` en el directorio raíz con toda la estructura de despliegue.

#### Compilación manual del backend:
```bash
cd backend

# Con Maven Wrapper (sin instalación global)
./mvnw clean package -DskipTests

# O con Maven instalado
mvn clean package -DskipTests
```

El JAR se genera en `backend/target/taskmanager-0.0.1-Alpha.jar`.

#### Compilación manual del frontend:
```bash
cd frontend

# Instalar dependencias
pnpm install
# O con npm:
npm install --legacy-peer-deps

# Compilar
pnpm build
# O con npm:
CI=false npx react-scripts build
```

Los archivos estáticos se generan en `frontend/build/`.

> **Nota:** `CI=false` es necesario con npm para que los warnings no se traten como errores.

### 7.3 Compilación con Docker

#### Build integrado (recomendado):
```bash
cd docker

# Build básico
docker build -f Dockerfile.deployment -t taskmanager:latest .

# Con script auxiliar
./build.sh --tag myuser/taskmanager:v1.0

# Multi-plataforma
./build.sh --multi --push --tag myuser/taskmanager:v1.0
```

#### Build con branch específico:
```bash
docker build -f Dockerfile.deployment \
  --build-arg GIT_BRANCH=develop \
  -t taskmanager:dev .
```

---

## 8. Cómo desplegar el proyecto

### 8.1 Despliegue local

```bash
# 1. Descomprimir el artefacto
unzip TaskManager.zip
cd task-manager

# 2. Generar claves JWT (primera vez)
cd bin
python3 key_generator.py
cd ..

# 3. Configurar la aplicación
# Editar config/application.properties para ajustar:
#   - URL de la base de datos
#   - Frontend base URL
#   - OAuth2 providers (si se usan)

# Editar lib/frontend/config.js para ajustar:
#   - API base URL
#   - OAuth2 settings
#   - Feature flags

# 4. Iniciar la aplicación
cd bin
python3 start.py --start-all

# La aplicación estará disponible en:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:8080

# 5. Para detener:
python3 stop.py --stop-backend
python3 stop.py --stop-frontend
```

### 8.2 Despliegue con Docker

```bash
# Ejecutar con puertos por defecto
docker run -d \
  -p 8080:8080 \
  -p 3000:3000 \
  -v taskmanager-data:/app/metadata \
  --name taskmanager \
  taskmanager:latest

# Ejecutar con puertos personalizados
docker run -d \
  -p 9090:9090 \
  -p 4000:4000 \
  -v taskmanager-data:/app/metadata \
  --name taskmanager \
  taskmanager:latest \
  --start-all --backend-port 9090 --frontend-port 4000

# Solo backend
docker run -d \
  -p 8080:8080 \
  -v taskmanager-data:/app/metadata \
  taskmanager:latest --start-backend

# Con configuración personalizada
docker run -d \
  -p 8080:8080 \
  -p 3000:3000 \
  -v taskmanager-data:/app/metadata \
  -v /path/to/custom/configs:/files_to_copy \
  taskmanager:latest
```

**Volúmenes:**
- `/app/metadata` — Base de datos SQLite (persistir siempre).
- `/files_to_copy` — Archivos de configuración personalizados (opcional).

### 8.3 Docker Compose

```yaml
version: '3.8'
services:
  taskmanager:
    image: taskmanager:latest
    ports:
      - "8080:8080"   # Backend API
      - "3000:3000"   # Frontend
    volumes:
      - taskmanager-data:/app/metadata
      - ./custom-config:/files_to_copy  # Opcional
    restart: unless-stopped
    environment:
      - BACKEND_PORT=8080
      - FRONTEND_PORT=3000

volumes:
  taskmanager-data:
```

---

## 9. Desarrollo local

### Backend (modo desarrollo):
```bash
cd backend

# 1. Crear application.properties (basado en la plantilla)
cp ../scripts/config_templates/application-properties.template \
   src/main/resources/application.properties
# Editar según necesidades

# 2. Generar claves JWT
mkdir -p src/main/resources/keys
openssl genrsa -out src/main/resources/keys/private_key.pem 2048
openssl rsa -in src/main/resources/keys/private_key.pem \
  -pubout -out src/main/resources/keys/public_key.pem

# 3. Arrancar en modo desarrollo
./mvnw spring-boot:run
```

### Frontend (modo desarrollo):
```bash
cd frontend

# 1. Crear config.js (basado en la plantilla)
cp ../scripts/config_templates/config.template.js public/config.js
# Editar: ajustar api.baseUrl a http://localhost:8080

# 2. Instalar dependencias
pnpm install

# 3. Arrancar servidor de desarrollo (hot reload)
pnpm start
```

El frontend de desarrollo se abre en `http://localhost:3000` con hot reload. Las peticiones API van contra el backend en `http://localhost:8080`.

---

## 10. Archivos raíz del proyecto

| Archivo | Descripción |
|---|---|
| `README.md` | Documentación principal del proyecto: features, quick start, arquitectura, troubleshooting. |
| `LICENSE` | Licencia AGPL v3.0. Copyright Diego Suárez Ramos (@fiopans1). |
| `.gitignore` | Exclusiones de Git: `node_modules`, `*.db`, `application.properties`, `.env`, `jwtKeys`, builds, IDE files. |
| `.dockerignore` | Exclusiones del contexto Docker: `.git`, `node_modules`, `target`, builds, docs, IDE files. |
