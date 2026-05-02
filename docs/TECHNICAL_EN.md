# Task Manager — Technical Documentation

Comprehensive technical documentation for the Task Manager project. Includes the full file structure with detailed descriptions of every file, build instructions, deployment, and configuration.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Root Directory Structure](#2-root-directory-structure)
3. [Backend — Structure and Files](#3-backend--structure-and-files)
   - 3.1 [Entry Point](#31-entry-point)
   - 3.2 [Configuration (`config/`)](#32-configuration-config)
   - 3.3 [Context (`context/`)](#33-context-context)
   - 3.4 [REST Controllers (`controller/`)](#34-rest-controllers-controller)
   - 3.5 [Model — JPA Entities (`model/entities/`)](#35-model--jpa-entities-modelentities)
   - 3.6 [Model — DTOs (`model/dto/`)](#36-model--dtos-modeldto)
   - 3.7 [Model — Exceptions (`model/exceptions/`)](#37-model--exceptions-modelexceptions)
   - 3.8 [Model — Validations (`model/validations/`)](#38-model--validations-modelvalidations)
   - 3.9 [Repositories (`respository/`)](#39-repositories-respository)
   - 3.10 [Security (`security/`)](#310-security-security)
   - 3.11 [Services (`service/`)](#311-services-service)
   - 3.12 [Resources and Runtime Configuration](#312-resources-and-runtime-configuration)
   - 3.13 [Tests](#313-tests)
   - 3.14 [Maven Build File (`pom.xml`)](#314-maven-build-file-pomxml)
4. [Frontend — Structure and Files](#4-frontend--structure-and-files)
   - 4.1 [Entry Point and Root](#41-entry-point-and-root)
   - 4.2 [Redux Store and Authentication](#42-redux-store-and-authentication)
   - 4.3 [Context and Custom Hooks](#43-context-and-custom-hooks)
   - 4.4 [Services (API Clients)](#44-services-api-clients)
   - 4.5 [Components — Authentication (`auth/`)](#45-components--authentication-auth)
   - 4.6 [Components — Common (`common/`)](#46-components--common-common)
   - 4.7 [Components — Sidebar and Navigation](#47-components--sidebar-and-navigation)
   - 4.8 [Components — Session (`session/`)](#48-components--session-session)
   - 4.9 [Components — Home](#49-components--home)
   - 4.10 [Components — Tasks (`tasks/`)](#410-components--tasks-tasks)
   - 4.11 [Components — Lists (`lists/`)](#411-components--lists-lists)
   - 4.12 [Components — Teams (`teams/`)](#412-components--teams-teams)
   - 4.13 [Components — Calendar](#413-components--calendar)
   - 4.14 [Components — Admin Panel (`adminpanel/`)](#414-components--admin-panel-adminpanel)
   - 4.15 [Pages (`pages/`)](#415-pages-pages)
   - 4.16 [CSS Styles](#416-css-styles)
   - 4.17 [Public Files (`public/`)](#417-public-files-public)
   - 4.18 [Dependencies (`package.json`)](#418-dependencies-packagejson)
5. [Build and Deployment Scripts (`scripts/`)](#5-build-and-deployment-scripts-scripts)
   - 5.1 [Main Build Script](#51-main-build-script)
   - 5.2 [Executable Scripts (`bin_files/`)](#52-executable-scripts-bin_files)
   - 5.3 [Static Configuration Files (`config_files/`)](#53-static-configuration-files-config_files)
   - 5.4 [Configuration Templates (`config_templates/`)](#54-configuration-templates-config_templates)
6. [Docker — Images and Scripts](#6-docker--images-and-scripts)
   - 6.1 [Dockerfiles](#61-dockerfiles)
   - 6.2 [Docker Build Script](#62-docker-build-script)
   - 6.3 [Docker Compilation Scripts](#63-docker-compilation-scripts)
   - 6.4 [Docker Deployment Scripts](#64-docker-deployment-scripts)
7. [How to Build the Project](#7-how-to-build-the-project)
   - 7.1 [Prerequisites](#71-prerequisites)
   - 7.2 [Local Build](#72-local-build)
   - 7.3 [Docker Build](#73-docker-build)
8. [How to Deploy the Project](#8-how-to-deploy-the-project)
   - 8.1 [Local Deployment](#81-local-deployment)
   - 8.2 [Docker Deployment](#82-docker-deployment)
   - 8.3 [Docker Compose](#83-docker-compose)
9. [Local Development](#9-local-development)
10. [Root Project Files](#10-root-project-files)

---

## 1. Project Overview

Task Manager is a web-based task management application built with:

| Component | Technology | Version |
|---|---|---|
| **Backend** | Spring Boot | 3.4.1 |
| **Frontend** | React | 18.x |
| **Backend language** | Java | 23 |
| **Database** | SQLite | — |
| **Web server** | Caddy | v2.7.6 |
| **Backend build** | Maven | 3.9.9 |
| **Frontend build** | React Scripts (CRA) | 5.0.1 |
| **Frontend package manager** | pnpm | Latest |
| **Authentication** | JWT (RSA) + OAuth2 | — |

---

## 2. Root Directory Structure

```
task-manager/
├── backend/                    # Spring Boot REST API
│   ├── src/                    # Java source code
│   ├── pom.xml                 # Maven configuration
│   ├── mvnw / mvnw.cmd         # Maven Wrapper (Unix/Windows)
│   └── .mvn/                   # Wrapper configuration
├── frontend/                   # React SPA application
│   ├── src/                    # JavaScript source code
│   ├── public/                 # Static files
│   └── package.json            # Frontend dependencies
├── scripts/                    # Build and deployment scripts
│   ├── compile.py              # Main build orchestrator
│   ├── bin_files/              # Runtime executable scripts
│   ├── config_files/           # Static configuration files
│   └── config_templates/       # Configuration templates
├── docker/                     # Docker configuration
│   ├── Dockerfile.deployment   # Multi-stage Dockerfile (recommended)
│   ├── Dockerfile.build        # Legacy build-only Dockerfile
│   ├── build.sh                # Docker build helper script
│   ├── scripts_compilation/    # Compilation stage scripts
│   └── scripts_deployment/     # Deployment stage scripts
├── docs/                       # Project documentation
├── README.md                   # Main documentation
├── LICENSE                     # AGPL v3.0 License
├── .gitignore                  # Git exclusions
└── .dockerignore               # Docker context exclusions
```

---

## 3. Backend — Structure and Files

Base package: `com.taskmanager.application`

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

### 3.1 Entry Point

#### `Application.java`
Main Spring Boot application class. Annotated with `@SpringBootApplication`, it initializes the Spring context, registers all beans, and starts the embedded Tomcat server. Includes startup and failure event listeners for logging.

### 3.2 Configuration (`config/`)

#### `BeanConfiguration.java`
Defines Spring beans via `@Configuration`. Creates a `UserValidation` singleton bean for dependency injection in services that need to validate user data.

#### `CorsConfig.java`
Implements `WebMvcConfigurer` to configure CORS (Cross-Origin Resource Sharing). Allows requests from the frontend (default: `http://localhost:3000`). Permitted methods: GET, POST, PUT, DELETE, OPTIONS. Credentials and all headers are allowed.

#### `DataLoader.java`
`@Configuration` class with `CommandLineRunner` that executes on application startup. Creates default roles (`ADMIN`, `BASIC`) and authorities (`READ_PRIVILEGES`, `WRITE_PRIVILEGES`) in the database if they don't exist. Ensures the application always has the minimum required data.

#### `JacksonConfig.java`
Configures Jackson's `ObjectMapper` for JSON serialization/deserialization. Sets the timezone to UTC for consistent date handling between client and server.

#### `WebSecurityConfig.java`
Central Spring Security configuration. Defines:
- `SecurityFilterChain`: filter chain that protects routes.
- Public routes: `/auth/**`, `/health`, `/api/config`, `/oauth2/**`.
- JWT filter (`JWTAuthorizationFilter`) integration before `UsernamePasswordAuthenticationFilter`.
- OAuth2 Login configuration with custom success/failure handlers.
- `@EnableMethodSecurity` for method-level security (enables `@Secured` on controllers).
- `AuthenticationManager` and `PasswordEncoder` (BCrypt).

### 3.3 Context (`context/`)

#### `ApplicationContextProvider.java`
`@Component` implementing `ApplicationContextAware`. Stores a static reference to the Spring `ApplicationContext`, allowing the `AuthProvider` enum to dynamically resolve OAuth2 service implementations without direct dependency injection.

### 3.4 REST Controllers (`controller/`)

#### `AdminRestController.java`
Controller secured with `@Secured("ROLE_ADMIN")`. Exposes endpoints for:
- User management: search, get, block/unblock, delete.
- Feature flags: get and update.
- System messages: get and update.
- Public configuration: get config without authentication.

#### `AppConfigRestController.java`
Controller for the public endpoint `GET /api/config`. Returns application configuration (feature flags, system messages) without requiring authentication. Used by the frontend before login.

#### `AuthRestController.java`
Authentication controller. Exposes `POST /auth/login` accepting `LoginDTO` (username/password), validates credentials via `AuthService`, and returns a JWT token. Also exposes `POST /auth/register` for new user registration.

#### `GlobalExceptionHandler.java`
Annotated with `@RestControllerAdvice`. Catches exceptions globally:
- `MethodArgumentNotValidException` → 400 Bad Request with validation error list.
- `IllegalArgumentException` → 400 Bad Request with error message.
- Prevents stack traces from being exposed to clients.

#### `HealthCheckRestController.java`
Simple `GET /health` endpoint returning "OK". Used for Docker health checks, load balancers, and monitoring.

#### `HomeRestController.java`
Endpoint `GET /api/home-summary`. Returns a `HomeSummaryDTO` containing:
- User's recent tasks.
- Upcoming calendar events.
- Total counts (tasks, lists).
- Progress statistics.

#### `ListRestController.java`
Full CRUD for task lists (`/api/lists`):
- `GET /api/lists/paged` — paginated listing.
- `GET /api/lists/{id}` — list detail.
- `POST /api/lists` — create list.
- `PUT /api/lists/{id}` — update list.
- `DELETE /api/lists/{id}` — delete list.
- `GET /api/lists/user/{userId}` — lists by user (admin only).

#### `SessionRestController.java`
Endpoint `POST /api/session/refresh` for JWT token renewal. The frontend invokes it periodically to extend the user's session without forcing re-login.

#### `TaskRestController.java`
Main task controller (`/api/tasks`):
- CRUD: create, get, update, delete.
- `GET /api/tasks/paged` — paginated listing with optional filters (state, priority).
- `POST /api/tasks/{id}/actions` — add actions (comments, edits) to a task.
- `GET /api/tasks/{id}/actions/paged` — paginated actions.
- `GET /api/tasks/events` — tasks with events (for calendar).
- `GET /api/tasks/user/{userId}` — tasks by user (admin only).

#### `TeamRestController.java`
Team management (`/api/teams`):
- Team CRUD.
- `GET /api/teams/{id}/dashboard` — team statistics.
- `POST /api/teams/{id}/invite` — invite members by email/username.
- `POST /api/teams/invitations/{id}/accept|reject` — accept/reject invitations.
- `GET /api/teams/invitations/pending` — user's pending invitations.
- `PUT /api/teams/{id}/members/{memberId}/role` — change member role.
- `DELETE /api/teams/{id}/members/{memberId}` — remove member.
- `PUT /api/teams/{teamId}/tasks/{taskId}/assign` — assign task to member.
- `GET /api/teams/{id}/history/paged` — assignment history.

#### `UserRestController.java`
User profile operations (`/api/user/`). Endpoint for retrieving authenticated user's data.

### 3.5 Model — JPA Entities (`model/entities/`)

#### `User.java`
Main user entity. Fields:
- `id` (Long, auto-generated PK), `username` (String, unique), `email` (String, unique).
- `password` (String, BCrypt hash), `authProvider` (enum AuthProvider), `providerId` (String).
- `fullName` (FullName embeddable), `createdDate` (LocalDateTime).
- `blocked` (boolean), `roles` (ManyToMany → RoleOfUser).
- OneToMany relations: `lists` (ListTM), `tasks` (Task).
- Implements Spring Security's `UserDetails`, returning `ROLE_` + role name as authorities.

#### `Task.java`
Task entity. Fields:
- `id` (Long, PK), `nameOfTask` (String), `descriptionOfTask` (String, TEXT).
- `state` (enum StateTask), `priority` (enum PriorityTask).
- `creationDate`, `lastModifiedDate`, `limitDate` (LocalDateTime).
- Relations: `user` (ManyToOne → User), `list` (ManyToOne → ListTM), `team` (ManyToOne → Team).
- `actions` (OneToMany → ActionTask), `event` (OneToOne → EventTask).

#### `ListTM.java`
Task list entity. "TM" suffix avoids conflict with `java.util.List`. Fields:
- `id` (Long, PK), `nameOfList` (String), `descriptionOfList` (String), `color` (String).
- `user` (ManyToOne → User), `tasks` (OneToMany → Task).

#### `Team.java`
Team entity. Fields:
- `id` (Long, PK), `name` (String), `description` (String).
- `creationDate` (LocalDateTime), `createdBy` (ManyToOne → User).
- `members` (OneToMany → TeamMember).

#### `TeamMember.java`
Team membership entity. Unique constraint on (team, user). Fields:
- `id` (Long, PK), `team` (ManyToOne → Team), `user` (ManyToOne → User).
- `role` (enum TeamRole: ADMIN, MEMBER), `joinedDate` (LocalDateTime).

#### `TeamInvitation.java`
Team invitation entity. Fields:
- `id` (Long, PK), `team` (ManyToOne → Team).
- `invitedEmail` (String), `invitedUsername` (String).
- `status` (enum InvitationStatus: PENDING, ACCEPTED, REJECTED).
- `token` (String, unique), `createdDate`, `respondedDate` (LocalDateTime).

#### `TaskAssignmentHistory.java`
Task assignment history within teams. Fields:
- `id` (Long, PK), `task` (ManyToOne → Task).
- `fromUser`, `toUser`, `changedByUser` (ManyToOne → User).
- `changedDate` (LocalDateTime).

#### `ActionTask.java`
Task action (comment, edit). Fields:
- `id` (Long, PK), `actionName` (String), `actionDescription` (String).
- `actionType` (enum ActionType: COMMENT, EDIT_TASK, CREATE_TASK).
- `task` (ManyToOne → Task), `user` (ManyToOne → User).
- `createdDate` (LocalDateTime).

#### `EventTask.java`
Calendar event data associated with a task. OneToOne relationship with Task. Fields:
- `id` (Long, PK), `startTime`, `endTime` (LocalDateTime).
- `task` (OneToOne → Task).

#### `AppConfig.java`
Key-value store for application configuration. Fields:
- `id` (Long, PK), `configKey` (String, unique), `configValue` (String, @Lob, max 5000 chars).
- Stores feature flags, system messages, etc.

#### `FullName.java`
`@Embeddable` class for the user's full name. Fields:
- `name` (String), `surname1` (String), `surname2` (String).
- Embedded in the User entity.

#### `RoleOfUser.java`
User role entity. Fields:
- `id` (Long, PK), `name` (String, unique: "ADMIN", "BASIC").
- `authorities` (ManyToMany → AuthorityOfRole).

#### `AuthorityOfRole.java`
Individual permission/authority. Fields:
- `id` (Long, PK), `name` (String: "READ_PRIVILEGES", "WRITE_PRIVILEGES").

#### Enumerations

| Enum | Values | Usage |
|---|---|---|
| `StateTask` | `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `PAUSSED` | Task state |
| `PriorityTask` | `MIN`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Task priority |
| `ActionType` | `COMMENT`, `EDIT_TASK`, `CREATE_TASK` | Task action type |
| `AuthProvider` | `LOCAL`, `GOOGLE`, `GITHUB` | Authentication provider |
| `InvitationStatus` | `PENDING`, `ACCEPTED`, `REJECTED` | Team invitation status |
| `TeamRole` | `ADMIN`, `MEMBER` | Role within a team |

> **Note:** `PAUSSED` is intentional — it matches the source code in `StateTask.java`.

### 3.6 Model — DTOs (`model/dto/`)

| DTO | Purpose |
|---|---|
| `LoginDTO` | Username and password for local authentication. |
| `TaskDTO` | Full task representation with state, priority, dates, list reference. Uses `@JsonInclude(NON_NULL)`. |
| `TaskResumeDTO` | Minimal task DTO (id, name only) for list views. |
| `TaskSummaryDTO` | Lightweight DTO for admin tables: name, state, priority, list/team names. |
| `ListTMDTO` | List transfer object with name, description, color. Includes task list conversion. |
| `TeamDTO` | Team data: name, description, creation date, member list. |
| `TeamDashboardDTO` | Team analytics: members, total/completed/in-progress/pending task counts. |
| `TeamMemberDTO` | Member info: user, role, join date, pending task count. |
| `TeamInvitationDTO` | Invitation data: team, invitee, status, token, dates. |
| `TaskAssignmentHistoryDTO` | Assignment change record: from/to user, date. |
| `ActionTaskDTO` | Task action with type and validation. |
| `EventTaskDTO` | Lightweight DTO for calendar events with start/end time. |
| `HomeSummaryDTO` | Dashboard data: recent tasks, upcoming events, totals. Uses `@JsonInclude(NON_NULL)`. |
| `ResponseDTO` | Generic response wrapper with error/success message lists. |
| `UserDTO` | Placeholder (not currently implemented). |

### 3.7 Model — Exceptions (`model/exceptions/`)

#### `ResourceNotFoundException.java`
Annotated with `@ResponseStatus(HttpStatus.NOT_FOUND)`. Thrown when a requested resource does not exist. Spring automatically converts it to an HTTP 404 response.

#### `NotPermissionException.java`
Thrown when the authenticated user lacks permissions to perform the requested operation.

#### `OAuth2AuthenticationProcessingException.java`
Extends `AuthenticationException`. Thrown during OAuth2 authentication processing when there are errors (unsupported provider, incomplete data, etc.).

### 3.8 Model — Validations (`model/validations/`)

#### `UserValidation.java`
User registration validation class. Rules:
- **Username**: required, non-empty.
- **Email**: required, valid email format.
- **Password**: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character (`!@#$%^&*()`).

### 3.9 Repositories (`respository/`)

All extend `JpaRepository<Entity, Long>`, providing automatic CRUD and pagination.

> **Note:** The package is named `respository` (with typo) in the original source code.

| Repository | Notable Custom Methods |
|---|---|
| `UserRepository` | `findByUsername()`, `findByEmail()` |
| `TaskRepository` | Queries for filtering by user, team, state, priority. Pagination support. |
| `ListRepository` | `findAllByUser()`, `countByUser()`, pagination. |
| `TeamRepository` | `findAllByMemberUser()` — JPQL query for user's teams via TeamMember. |
| `TeamMemberRepository` | `findByTeamAndUser()`, `findAllByTeam()`, `findAllByUser()`. |
| `TeamInvitationRepository` | `findAllByTeam()`, search by email/username with status. |
| `TaskAssignmentHistoryRepository` | `findAllByTeamOrderByChangedDateDesc()` with pagination. |
| `ActionTaskRepository` | `findAllByTask()`, pagination by task. |
| `EventTaskRepository` | `findAllEventsByUserId()` — custom `@Query`. |
| `AppConfigRepository` | `findByConfigKey()`, `findByConfigKeyStartingWith()`. |
| `RoleRepository` | `findByName()`, `existsByName()`. |
| `AuthorityRepository` | `findByName()`. |

### 3.10 Security (`security/`)

#### `JWTAuthorizationFilter.java`
`OncePerRequestFilter` that executes on every HTTP request. Workflow:
1. Extracts the JWT token from the `Authorization: Bearer <token>` header.
2. Validates the token using `JWTUtilityService`.
3. Extracts claims (username, roles, userId).
4. **Checks if the user is blocked** — returns 403 if blocked.
5. Creates a `UsernamePasswordAuthenticationToken` and sets it in the `SecurityContext`.

#### `OAuth2LoginSuccessHandler.java`
Implements `AuthenticationSuccessHandler`. When OAuth2 login succeeds:
1. Gets the `UserPrincipal` from the authenticated user.
2. Generates a JWT token with the user's data.
3. Redirects to the frontend with the token as a query parameter: `{frontendUrl}/oauth2/callback?token={jwt}`.

#### `OAuth2LoginFailureHandler.java`
Implements `AuthenticationFailureHandler`. When OAuth2 login fails:
1. Extracts the error message.
2. Redirects to the frontend with the error: `{frontendUrl}/oauth2/callback?error={message}`.

#### `UserPrincipal.java`
Implements `OAuth2User`, `OidcUser`, and `UserDetails`. Acts as a bridge between Spring Security and OAuth2. Stores:
- `id`, `email`, `username`, `fullName`, `roles`.
- OAuth2 provider attributes and claims.
- Authorities derived from user roles.

### 3.11 Services (`service/`)

#### `AuthService.java`
Authentication logic:
- `login(LoginDTO)`: validates credentials, checks if user is blocked, generates JWT token.
- `register()`: validates data with `UserValidation`, hashes password with BCrypt, assigns BASIC role.
- `hasRole(String)`: checks if the authenticated user has a specific role.
- Utility methods for getting the authenticated user from `SecurityContext`.

#### `JWTUtilityService.java`
JWT token management with RSA keys:
- `generateToken(User)`: creates RSA-signed JWT. Claims: username, userId, roles, email.
- `validateToken(String)`: validates signature and expiration.
- `extractClaims(String)`: extracts claims from the token for building authentication.
- RSA keys are loaded from PEM files configured in `application.properties`.

#### `TaskService.java`
Task CRUD with permission verification:
- Verifies task ownership or ADMIN role before each operation.
- `createTask()`: creates a task assigned to the authenticated user.
- `updateTask()`: updates fields, recalculates list/team relationships.
- `deleteTask()`: deletion with permission verification.
- `addAction()`: adds a comment/edit to a task.
- `getEventTasks()`: gets tasks with events for the calendar.
- Pagination support with `Pageable`.

#### `ListService.java`
List CRUD with permission verification:
- Verifies list ownership or ADMIN role.
- Manages the bidirectional list ↔ tasks relationship.
- Pagination support.

#### `TeamService.java`
Complete team management:
- `createTeam()`: creates a team and assigns the creator as ADMIN.
- `inviteMembers()`: sends invitations by email/username, generates unique tokens.
- `acceptInvitation()` / `rejectInvitation()`: invitation management.
- `changeMemberRole()`: changes a member's role (team admin or global admin only).
- `removeMember()`: removes a member from the team.
- `getTeamDashboard()`: generates team statistics (members, tasks by state, workloads).
- `updateTaskAssignment()`: assigns/reassigns tasks between members, records history.
- `validateAdminRole()`: validates the user is a team admin or has the global ADMIN role.

#### `AdminService.java`
Administration operations:
- `getPublicConfig()`: returns feature flags and system messages (no authentication required).
- `getUsers()`: searches users with pagination.
- `blockUser()` / `unblockUser()`: blocks/unblocks users.
- `deleteUser()`: deletes user and associated data.
- `getFeatureFlags()` / `updateFeatureFlags()`: feature flag management via AppConfig.
- `getSystemMessage()` / `updateSystemMessage()`: system message management.

#### `HomeService.java`
Aggregates data for the user dashboard:
- Recent tasks.
- Upcoming calendar events.
- Counts (total tasks, lists, completed tasks).

#### `CustomOAuth2UserService.java`
OAuth2 user processing service (standard providers):
- `loadUser()`: automatically invoked by Spring Security after OAuth2 login.
- Extracts email, name, username from the provider.
- Creates or updates the user in the database.
- Links to the authentication provider.
- Generates automatic username if none exists.

#### `CustomOidcUserService.java`
Similar to `CustomOAuth2UserService` but for OIDC providers (Google):
- Handles OpenID Connect flows with ID tokens.
- Extracts standard OIDC claims.

#### `CustomUserDetailsService.java`
Implements Spring Security's `UserDetailsService`:
- `loadUserByUsername()`: loads user from the database for local authentication.

#### `RoleService.java`
Simple service for creating roles.

#### `UserService.java`
Partial/legacy implementation of user operations.

#### `oauth2providers/OAuth2ProviderService.java`
Interface defining the contract for OAuth2 providers:
- `extractEmail()`, `extractFullName()`, `extractUsername()`, `getProviderId()`.
- Each provider implements this interface.

#### `oauth2providers/GoogleOAuth2ProviderServiceImpl.java`
Google implementation. Extracts data from Google's OAuth2/OIDC attributes. Supports both standard OAuth2 and OIDC.

#### `oauth2providers/GithubOAuth2ProviderServiceImpl.java`
GitHub implementation. Extracts email, name, and username from the GitHub API.

### 3.12 Resources and Runtime Configuration

#### `src/main/resources/log-config.xml`
Logback configuration:
- **CONSOLE appender**: format `HH:mm:ss.SSS [thread] LEVEL logger - msg`.
- **FILE appender**: daily rolling file at `../logs/TaskManager.log`, 7-day retention.
- Levels: root=ERROR, Spring=WARN, Hibernate=WARN.

> **Note:** `application.properties` is not versioned (excluded in `.gitignore`). It is generated from the template at `scripts/config_templates/application-properties.template`.

### 3.13 Tests

#### `src/test/java/.../ApplicationTests.java`
Minimal `@SpringBootTest` test that verifies the Spring context loads correctly (`contextLoads()`).

### 3.14 Maven Build File (`pom.xml`)

- **Group**: `com.taskmanager`, **Artifact**: `taskmanager`, **Version**: `0.0.1-Alpha`.
- **Parent**: `spring-boot-starter-parent:3.4.1`.
- **Java**: 23.

**Main dependencies:**

| Dependency | Purpose |
|---|---|
| `spring-boot-starter-web` | REST API, embedded Tomcat server |
| `spring-boot-starter-data-jpa` | ORM with Hibernate, JPA repositories |
| `spring-boot-starter-security` | Authentication and authorization |
| `spring-boot-starter-validation` | Bean validation with Jakarta Validation |
| `spring-boot-starter-oauth2-client` | OAuth2 integration (Google, GitHub) |
| `spring-boot-starter-actuator` | Health checks and monitoring |
| `sqlite-jdbc` | JDBC driver for SQLite |
| `hibernate-community-dialects` | Hibernate dialect for SQLite |
| `nimbus-jose-jwt` (v9.48) | JWT token generation and validation |
| `lombok` | Automatic getter/setter/constructor generation |
| `spring-boot-starter-test` | Testing framework |
| `spring-security-test` | Security testing utilities |

**Maven Wrapper:**
- `mvnw` (Unix) / `mvnw.cmd` (Windows): allow building without globally installed Maven.
- `.mvn/wrapper/maven-wrapper.properties`: points to Maven 3.9.9.

---

## 4. Frontend — Structure and Files

```
frontend/src/
├── index.js                          # React bootstrap
├── App.js                            # Main router
├── App.css                           # CRA placeholder styles
├── index.css                         # Global styles
├── styles.css                        # Application styles
├── logo.svg                          # CRA placeholder logo
├── context/
│   └── ThemeContext.js                # Dark/light theme context
├── redux/
│   ├── store.js                      # Redux store configuration
│   └── slices/
│       └── authSlice.js              # Authentication slice
├── hooks/
│   └── useInfiniteScroll.js          # Infinite scroll hooks
├── services/
│   ├── authService.js                # Authentication API client
│   ├── configService.js              # Runtime config accessor
│   ├── taskService.js                # Tasks API client
│   ├── listService.js                # Lists API client
│   ├── teamService.js                # Teams API client
│   ├── adminService.js               # Admin API client
│   └── homeService.js                # Dashboard API client
├── pages/
│   ├── MainApp.js                    # Authenticated main layout
│   └── HomePage.js                   # Public landing page
├── components/
│   ├── Home.js                       # Main dashboard
│   ├── CalendarComponent.js          # Calendar view
│   ├── auth/
│   │   ├── LoginPage.js              # Login form
│   │   ├── RegisterPage.js           # Registration form
│   │   ├── OAuth2Login.js            # OAuth2 callback handler
│   │   └── ProtectedRoute.js         # Protected route guard
│   ├── common/
│   │   ├── Noty.js                   # Toast notification utilities
│   │   ├── FeatureGuard.js           # Feature flag guard
│   │   ├── SystemMessageModal.js     # System message modal
│   │   ├── ThemeToggleButton.js      # Theme toggle button
│   │   └── OutletUtil.js             # Outlet utility
│   ├── Sidebar/
│   │   ├── SidebarMenu.js            # Main sidebar menu
│   │   └── About.js                  # About modal
│   ├── session/
│   │   └── SessionManager.js         # Session expiry management
│   ├── tasks/
│   │   ├── Tasks.js                  # Tasks container
│   │   ├── TasksList.js              # Infinite scroll list
│   │   ├── NewEditTask.js            # Create/edit task modal
│   │   └── TaskDetails/
│   │       ├── TaskDetails.js        # Detail wrapper
│   │       ├── TaskDetailsTask.js    # Information panel
│   │       └── TaskDetailsActions.js # Task actions
│   ├── lists/
│   │   ├── Lists.js                  # Lists container
│   │   ├── ListsList.js              # Infinite scroll list
│   │   ├── ListsExample.js           # Example component
│   │   ├── NewEditLists.js           # Create/edit list modal
│   │   └── ListDetails/
│   │       ├── ListDetails.js        # List detail
│   │       └── ListDetailsGeneral.js # List general info
│   ├── teams/
│   │   ├── Teams.js                  # Teams container
│   │   ├── TeamsList.js              # Infinite scroll list
│   │   ├── NewEditTeam.js            # Create/edit team modal
│   │   ├── TeamDashboard.js          # Team dashboard (tabs)
│   │   ├── DashboardTab.js           # Statistics tab
│   │   ├── TasksTab.js               # Team tasks tab
│   │   ├── HistoryTab.js             # History tab
│   │   ├── InvitationsTab.js         # Invitations tab
│   │   └── MentionInput.js           # @mentions input
│   └── adminpanel/
│       ├── AdminPanel.js             # Main admin panel
│       ├── UserManagementTab.js      # User management
│       ├── UserSearchResults.js      # Search results
│       ├── UserDetailModal.js        # User detail modal
│       ├── FeatureFlagsTab.js        # Feature flags management
│       ├── SystemMessageTab.js       # System messages management
│       └── ConfirmModal.js           # Confirmation modal
```

### 4.1 Entry Point and Root

#### `index.js`
React application bootstrap. Wraps the `App` component with:
- `<Provider store={store}>` — Global Redux store.
- `<PersistGate>` — Redux Persist for localStorage persistence.
- `<ThemeProvider>` — Dark/light theme context.
- `<BrowserRouter>` — React Router v7.
- `<ToastContainer>` — React Toastify for notifications.
- Imports Bootstrap CSS and global styles.

#### `App.js`
Root component with React Router. Responsibilities:
- Checks for authentication token existence (Redux or OAuth2 callback).
- Defines all routes:
  - Public routes: `/` (HomePage), `/login`, `/register`, `/oauth2/callback`.
  - Protected routes (wrapped in `<ProtectedRoute>`): `/home`, `/tasks`, `/lists`, `/teams`, `/calendar`, `/admin`.
  - Routes additionally protected with `<FeatureGuard>` for disableable features.
- `useEffect` to check for OAuth2 token on mount.

### 4.2 Redux Store and Authentication

#### `redux/store.js`
Redux Toolkit configuration:
- `configureStore` with custom serializable middleware (ignores Redux Persist actions).
- `persistConfig`: storage in `localStorage`, whitelist only `auth`.
- Exports `store` and `persistor`.

#### `redux/slices/authSlice.js`
Authentication slice with Redux Toolkit:
- State: `{ token: null }`.
- Actions: `setToken(token)` and `clearToken()`.
- Token is automatically persisted in localStorage via Redux Persist.

### 4.3 Context and Custom Hooks

#### `context/ThemeContext.js`
React context for theme management:
- `darkMode` state persisted in `localStorage`.
- On change, updates `document.documentElement.setAttribute('data-bs-theme', ...)` for Bootstrap.
- Updates the `theme-color` meta tag for Safari.
- Exports `useTheme()` hook returning `{ darkMode, toggleTheme }`.

#### `hooks/useInfiniteScroll.js`
Contains two custom hooks:

**`useServerInfiniteScroll(fetchPage, pageSize, deps)`** — Server-side pagination:
- Tracks `page`, `hasMore`, `items`, `loading`, `initialLoading`.
- Uses `IntersectionObserver` on a sentinel element to detect scrolling to the bottom.
- Calls `fetchPage(page, size)` which must return `{ content, last }` (Spring Page format).
- Returns `{ items, loading, initialLoading, hasMore, LoadMoreSpinner, reset }`.
- Handles cancellation on unmount or dependency changes.

**`useInfiniteScroll(allItems, pageSize)`** — Client-side pagination:
- Takes all pre-loaded items.
- Progressively increases `displayCount` via IntersectionObserver.
- Returns `{ displayedItems, sentinelRef, hasMore, LoadMoreSpinner }`.

### 4.4 Services (API Clients)

All services use Axios with `Authorization: Bearer <token>` header obtained from the Redux store.

#### `authService.js`
- `login(username, password)` — `POST /auth/login`. Stores token in Redux.
- `register(formData)` — `POST /auth/register`.
- `checkForOAuth2Token()` — Checks URL params for OAuth2 callback tokens.
- `getToken()` — Gets token from Redux store.
- `logout()` — Clears Redux token.

#### `configService.js`
Singleton accessor for `window.APP_CONFIG` (loaded from `public/config.js` at runtime):
- `getApiBaseUrl()` — API base URL.
- `isOAuth2Enabled()` — Whether OAuth2 is globally enabled.
- `isFeatureEnabled(feature)` — Feature flag check.
- `getAppName()`, `getAppVersion()`, `isDebugMode()`.

#### `taskService.js`
- `createTask(taskData)` — `POST /api/tasks`. Invalidates cache.
- `editTask(id, taskData)` — `PUT /api/tasks/{id}`. Invalidates cache.
- `deleteTask(id)` — `DELETE /api/tasks/{id}`. Invalidates cache.
- `getTaskById(id)` — `GET /api/tasks/{id}`.
- `fetchTasksPage(page, size)` — `GET /api/tasks/paged?page={p}&size={s}`.
- `getEvents()` — `GET /api/tasks/events`.
- Suspense cache pattern with `getSuspender()` and `invalidateTasksCache()`.

#### `listService.js`
- CRUD: `createList()`, `updateList()`, `deleteList()`.
- `getListById(id)` — Detail fetch.
- `fetchListsPage(page, size)` — Paginated.
- `getTasksInList(listId)` — Tasks within a list.
- Same Suspense cache pattern.

#### `teamService.js`
- Team CRUD: `createTeam()`, `updateTeam()`, `deleteTeam()`.
- `getTeamById(id)`, `getTeamDashboard(id)`.
- `fetchTeamsPage(page, size)`.
- Invitations: `inviteMembers()`, `acceptInvitation()`, `rejectInvitation()`, `getTeamInvitations()`.
- Roles: `changeMemberRole()`, `removeMember()`.
- `getTeamHistory(id, page, size)`.
- Suspense cache.

#### `adminService.js`
- `getPublicConfig()` — `GET /api/config` (no auth).
- `searchUsers(query)` — User search.
- `getUser(id)`, `blockUser(id)`, `unblockUser(id)`, `deleteUser(id)`.
- `getFeatureFlags()`, `updateFeatureFlags(flags)`.
- `getSystemMessage()`, `updateSystemMessage(message)`.
- Suspense-based caching for admin features.

#### `homeService.js`
- `getHomeSummary()` — `GET /api/home-summary`.

### 4.5 Components — Authentication (`auth/`)

#### `LoginPage.js`
Login form with username and password fields. Dispatches token to Redux on success. Shows success/error toasts. Links to registration and OAuth2 buttons. Includes theme toggle and system message modal.

#### `RegisterPage.js`
Registration form with fields: email, username, password, confirm password, name, surname1, surname2. Password match validation. Redirects to login on success. Theme toggle and system message modal.

#### `OAuth2Login.js`
OAuth2 callback handler:
- Checks for OAuth2 token in URL parameters.
- Handles callback errors with error codes.
- Success/error notifications.
- Renders OAuth2 provider buttons (Google, GitHub, Authentik).

#### `ProtectedRoute.js`
Route guard component: checks `isAuthenticated` prop. If `false`, redirects to `/`. If `true`, renders `children`.

### 4.6 Components — Common (`common/`)

#### `Noty.js`
React Toastify wrappers:
- `successToast(msg)` — green toast, 3s.
- `errorToast(msg)` — red toast, 5s.
- `warningToast(msg)` — yellow toast.
- `infoToast(msg)` — blue toast.

#### `FeatureGuard.js`
Feature flag guard component:
- Fetches public config from `adminService.getPublicConfig()`.
- Checks if the feature is enabled (defaults to `true` unless explicitly `false`).
- If disabled, redirects to `/home`.
- Shows loading spinner while checking.

#### `SystemMessageModal.js`
Dynamic system announcement modal:
- Fetches from `adminService.getPublicConfig()`.
- Conditionally shows based on `showAfterLogin` or `showBeforeLogin` flags.
- `context` prop distinguishes "afterLogin" vs "beforeLogin" scenarios.
- Silently fails if config is unavailable.

#### `ThemeToggleButton.js`
Floating theme toggle button:
- Fixed position (bottom-left, z-index 1050).
- Uses `useTheme()` hook.
- Sun/moon icon toggle based on `darkMode` state.

#### `OutletUtil.js`
Utility component that renders `<Outlet>` from React Router for nested routing.

### 4.7 Components — Sidebar and Navigation

#### `Sidebar/SidebarMenu.js`
Responsive sidebar navigation:
- **Nav items**: My Tasks, Calendar, Lists, Teams (gated by feature flags).
- **Admin link** for privileged users.
- **Search** functionality for tasks/lists.
- **Badge** for pending invitations.
- **Dark/light mode toggle**.
- **About modal**.
- **Logout button**.
- **Responsive**: fixed column on desktop, offcanvas drawer on mobile with toggle button.
- `handleNavClick()` uses `navigate()` + cache invalidation to force reload.

#### `Sidebar/About.js`
About modal dialog:
- Shows app name, version, license from `configService`.
- Version badge styling.

### 4.8 Components — Session (`session/`)

#### `SessionManager.js`
JWT session expiry handler:
- Polls every 30 seconds for token expiry.
- Shows warning modal 5 minutes before expiry.
- 60-second countdown in the modal.
- Options: extend session (refresh token) or force logout.
- Uses refs to prevent memory leaks in intervals.

### 4.9 Components — Home

#### `Home.js`
Main authenticated user dashboard:
- Task statistics: total, completed, overdue, upcoming.
- Quick action cards for different task states.
- Progress indicators with charts (recharts).
- Uses `homeService.getHomeSummary()`.
- Loading placeholders.
- Responsive grid layout.

### 4.10 Components — Tasks (`tasks/`)

#### `Tasks.js`
Parent tasks section container:
- Search bar.
- "New Task" / "Edit Task" modal toggles.
- Mobile/desktop responsive detection.
- `refreshKey` for cache invalidation.
- Renders `TasksList` with callbacks.

#### `TasksList.js`
Task list with infinite scroll:
- Uses `useServerInfiniteScroll` with server pagination.
- Delete confirmation modal.
- Task cards with state badges.
- Open/edit task callbacks.
- Displays: name, priority, state, due date.
- Empty state with placeholder icon.

#### `NewEditTask.js`
Create/edit task modal:
- Fields: name, description, priority (MIN/LOW/MEDIUM/HIGH/CRITICAL), state.
- Toggle between event (calendar) or regular task.
- Date/time pickers for start/end times.
- Form validation with feedback.
- `editOrNew` prop controls create vs. edit mode.
- Optional `onSave` prop for admin panel usage.

#### `TaskDetails/TaskDetails.js`
Detail view wrapper (route `/tasks/:id`):
- Fetches task by ID.
- Detects if task belongs to a team.
- Renders `TaskDetailsTask` (info) + `TaskDetailsActions` (operations).

#### `TaskDetails/TaskDetailsTask.js`
Task information panel:
- Name, description, dates, priority, state.
- State/priority badges.
- Last updated timestamp.
- Edit button.

#### `TaskDetails/TaskDetailsActions.js`
Task action buttons:
- State transition buttons.
- Edit, delete.
- Add to team (if applicable).
- Archive/unarchive.

### 4.11 Components — Lists (`lists/`)

#### `Lists.js`
Parent lists section container:
- Search bar.
- Create/edit list modals.
- Responsive with offcanvas on mobile.
- Renders `ListsList` with pagination.

#### `ListsList.js`
Lists display with infinite scroll:
- Uses `useServerInfiniteScroll`.
- Delete confirmation modal.
- List cards with name, description, color indicator.
- Click to open list details.
- Edit/delete actions.

#### `NewEditLists.js`
Create/edit list modal:
- Fields: name, description, color picker.
- Form validation.
- Create or edit mode via `editOrNew` prop.
- Optional `onSave` prop for admin panel.

#### `ListsExample.js`
Example/placeholder component.

#### `ListDetails/ListDetails.js`
List detail page:
- List info (name, description, color).
- Tasks within the list with infinite scroll.
- Add task to list button.
- Task progress bar.
- Mark task complete/incomplete.
- Edit list button.

#### `ListDetails/ListDetailsGeneral.js`
List general info tab:
- Read-only display of list metadata.
- Color display.
- Task count summary.

### 4.12 Components — Teams (`teams/`)

#### `Teams.js`
Parent teams container:
- Create team modal.
- Search bar.
- Pending invitations section.
- Renders `TeamsList` with infinite scroll.
- Loads pending invitations on route navigation.

#### `TeamsList.js`
Teams display with infinite scroll:
- Paginated team cards.
- Click navigates to team dashboard.
- Shows member count.
- Empty state message.

#### `NewEditTeam.js`
Create/edit team modal:
- Fields: name, description.
- Optional member invite at creation time.
- Form validation.

#### `TeamDashboard.js`
Team detail view (route `/teams/:id`):
- Tab interface: Dashboard, Tasks, History, Invitations.
- Fetches team data + dashboard stats on load.
- Admin role detection.
- Edit team button.
- Leave/delete team options.

#### `DashboardTab.js`
Team statistics panel:
- Stats cards: Total Tasks, Completed, In Progress, Pending.
- Member list with roles.
- Member role change dropdown (admin only).
- Remove member button (admin only).

#### `TasksTab.js`
Team tasks view:
- Team-specific tasks.
- Add task to team button.
- Task state filtering.
- Task cards with actions.

#### `HistoryTab.js`
Team activity log:
- Team event timestamps.
- Member additions/removals.
- Task state changes.
- Pagination for large histories.

#### `InvitationsTab.js`
Pending team invitations:
- List of invited but unjoined users.
- Accept/reject buttons for invitees.
- Resend invitation (admin).
- Cancel invitation (admin).

#### `MentionInput.js`
Rich textarea with @mention support:
- Detects "@" character and suggests team members.
- Autocomplete on member selection.
- Dropdown of matching usernames.
- Keyboard navigation support.
- Props: `value`, `onChange`, `members`, `placeholder`.

### 4.13 Components — Calendar

#### `CalendarComponent.js`
Calendar view integrating tasks:
- Uses `react-big-calendar` with `dayjs` localizer.
- Converts tasks to calendar events based on startTime/endTime.
- Loading spinner while fetching events.
- Responsive container with Bootstrap Card.

### 4.14 Components — Admin Panel (`adminpanel/`)

#### `AdminPanel.js`
Admin dashboard with tabs:
- Tabs: Users, Feature Flags, System Messages.
- Styled header with shield icon.
- Tab navigation with icons.

#### `UserManagementTab.js`
User administration:
- User search form.
- Results with infinite scroll.
- Block/unblock user buttons.
- Delete confirmation.
- Click to open detail modal.

#### `UserSearchResults.js`
Search results list:
- Uses `useServerInfiniteScroll`.
- Shows username, email, role, status badges.
- Click to open detail modal.
- Block/delete buttons.

#### `UserDetailModal.js`
User detail modal:
- Shows: ID, username, email, full name.
- Account creation date.
- Status (active/blocked).
- Role information.
- Block/unblock button.
- Delete button with confirmation.
- Lazy-loads tabs for user's tasks/lists/teams.

#### `FeatureFlagsTab.js`
Feature flag management:
- Toggles for each feature (calendar, lists, tasks, etc.).
- Save button to persist changes.
- Loads current flags on mount.
- Updates via `adminService`.

#### `SystemMessageTab.js`
System message management:
- Enable/disable toggle.
- Message text textarea.
- Show on login / show after login checkboxes.
- Save button.
- Message preview.

#### `ConfirmModal.js`
Reusable confirmation dialog:
- Props: title, message, button text, styling.
- `onConfirm` callback.
- Used for destructive actions (delete, block).

### 4.15 Pages (`pages/`)

#### `MainApp.js`
Layout wrapper for authenticated users:
- Two-column layout: `SidebarMenu` + `<Outlet>`.
- Includes `SessionManager` (session management).
- Includes `SystemMessageModal` (post-login messages).
- Full viewport height container.

#### `HomePage.js`
Landing page for unauthenticated users:
- Marketing copy with Sign In / Register buttons.
- Injects app name from `configService`.

### 4.16 CSS Styles

#### `index.css`
Global styles:
- iOS Safari viewport fixes.
- Body/html height constraints.
- Input font sizing to prevent automatic zoom on iOS.

#### `styles.css`
Application-specific styles:
- Gradient animations.
- Text truncation utilities.
- Card overflow fixes.
- Sidebar styles.
- Mobile top bar transitions.
- Floating buttons.

#### `App.css`
Minimal Create React App template styles (logo animation, header).

### 4.17 Public Files (`public/`)

| File | Description |
|---|---|
| `index.html` | HTML entry point. Loads `config.js` before React. Mobile meta tags. |
| `config.js` | Runtime configuration (`window.APP_CONFIG`). API URL, OAuth2, features, app metadata. |
| `manifest.json` | PWA manifest with branding, icons, display mode. |
| `favicon.ico` | Browser icon. |
| `logo192.png` | PWA icon 192x192. |
| `logo512.png` | PWA icon 512x512. |
| `robots.txt` | SEO directives for crawlers. |

### 4.18 Dependencies (`package.json`)

| Category | Packages |
|---|---|
| **Core React** | `react` 18, `react-dom` 18, `vite` 8, `@vitejs/plugin-react` 6 |
| **Routing** | `react-router-dom` 7.1.5 |
| **State Management** | `@reduxjs/toolkit` 2.5.1, `react-redux` 9.2.0, `redux-persist` 6.0.0 |
| **UI Framework** | `bootstrap` 5.3.5, `react-bootstrap` 2.10.9 |
| **Icons** | `bootstrap-icons` 1.11.3, `react-bootstrap-icons` 1.11.5, `react-icons` 5.4.0, `lucide-react` 0.507.0, `@fortawesome/fontawesome-free` 6.7.2 |
| **HTTP** | `axios` 1.7.9 |
| **Notifications** | `react-toastify` 11.0.5 |
| **Calendar** | `react-big-calendar` 1.18.0, `dayjs` 1.11.13 |
| **Charts** | `recharts` 2.15.3 |
| **Auth** | `jose` 6.0.8 (JWT decoding) |
| **Error Handling** | `react-error-boundary` 5.0.0 |
| **Testing** | `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` |

---

## 5. Build and Deployment Scripts (`scripts/`)

### 5.1 Main Build Script

#### `compile.py`
Main build orchestrator. `BuildTaskManager` class that performs:

1. **Caddy download**: automatically detects platform/architecture or uses specified ones. Downloads the appropriate Caddy binary.
2. **Backend compilation**: runs `mvn clean package -DskipTests` to generate the JAR.
3. **Frontend compilation**: runs `pnpm install` + `pnpm build` (or equivalent) to generate the static SPA.
4. **Configuration generation**: applies templates from `config_templates/` to generate configuration files.
5. **Packaging**: creates the directory structure and packages everything into `TaskManager.zip`.

**Usage:**
```bash
cd scripts
python3 compile.py --action deploy
```

**Configuration parameters:**
- `project_root` — Project root directory.
- `name_final_file` — Final ZIP name (default: `TaskManager`).
- `caddy_version` — Caddy version (default: `v2.7.6`).
- `target_platform` — Platform: linux, mac, windows.
- `target_architecture` — Architecture: x86_64, arm64, armv7, etc.

**Generated ZIP structure:**
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
│   │   └── (React static files)
│   └── caddy (executable)
└── metadata/
    └── (SQLite database, created at runtime)
```

#### `requirements.txt`
Python dependency: `requests>=2.28.0`. Used by `compile.py` to download Caddy.

### 5.2 Executable Scripts (`bin_files/`)

#### `start.py`
Starts backend and/or frontend services.

**Classes:**
- `StartBackendTaskManager`: locates the JAR in `lib/backend/`, validates `config/application.properties` exists, starts the Java process with:
  ```bash
  java -jar backend.jar \
    --spring.config.location=file:config/application.properties \
    --spring.profiles.active=prod \
    --server.port=8080
  ```
- `StartFrontendTaskManager`: locates Caddy in `lib/caddy/`, validates `lib/frontend/` exists, starts Caddy with:
  ```bash
  ./caddy run --config ../config/Caddyfile --adapter caddyfile
  ```

**Usage:**
```bash
python3 start.py --start-all        # Backend + Frontend
python3 start.py --start-backend    # Backend only
python3 start.py --start-frontend   # Frontend only
```

#### `stop.py`
Stops services by killing processes by port.

**Functions:**
- `kill_ports_unix(ports)`: uses `lsof -ti:PORT` + `kill -9 PID`.
- `kill_ports_windows(ports)`: uses `netstat -ano` + `taskkill /F /PID`.
- Automatic OS detection.

**Usage:**
```bash
python3 stop.py --stop-backend          # Kills port 8080
python3 stop.py --stop-frontend         # Kills port 3000
python3 stop.py --ports 8080 3000       # Custom ports
```

#### `key_generator.py`
Generates RSA keys for JWT token signing.

**Process:**
1. Verifies OpenSSL is installed.
2. Creates `keys/` directory.
3. Generates private key: `openssl genrsa -out private_key.pem 2048`.
4. Generates public key: `openssl rsa -in private_key.pem -pubout -out public_key.pem`.
5. Verifies the keys are valid.

### 5.3 Static Configuration Files (`config_files/`)

#### `Caddyfile`
Caddy web server configuration for serving the SPA:
- Port: `:3000`.
- `root * /lib/frontend` — static files directory.
- `try_files {path} /index.html` — SPA routing (all routes to index.html).
- `file_server` — serve static files.
- `encode gzip` — gzip compression level 6.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
- Cache headers for static assets.

#### `log-backend-config.xml`
Logback configuration:
- CONSOLE appender: format `HH:mm:ss.SSS [thread] LEVEL logger - msg`.
- FILE appender: daily rotation, 7-day retention, `../logs/TaskManager.log`.
- Levels: root=ERROR, Spring=WARN, Hibernate=WARN.

### 5.4 Configuration Templates (`config_templates/`)

#### `application-properties.template`
Template for backend `application.properties` (129 lines):
- Server configuration (port 8080).
- SQLite database: `jdbc:sqlite:${DEPLOY_ROOT}/metadata/task-manager.db`.
- JPA/Hibernate: `ddl-auto=update`, `show-sql=false`, batch_size=20.
- JWT keys: paths to `private_key.pem` and `public_key.pem`.
- Logging: reference to `log-backend-config.xml`.
- Commented sections for OAuth2 (Google, GitHub, Authentik).
- Commented sections for Actuator and CORS.

#### `config.template.js`
Template for frontend `config.js` (78 lines):
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
Caddy template (146 lines) with additional commented sections:
- Local development (`:3000`).
- Access logging (commented).
- API reverse proxy (commented).
- Production HTTPS block with Let's Encrypt (commented).

---

## 6. Docker — Images and Scripts

### 6.1 Dockerfiles

#### `Dockerfile.deployment` (Recommended)
Modern multi-stage Dockerfile:

**Stage 1 — Builder:**
- Base: `eclipse-temurin:23-jdk` on Ubuntu.
- Installs: Python 3, Maven, Node.js, pnpm, git, build tools.
- Clones the repository from GitHub.
- Runs `compile.py` to generate `TaskManager.zip`.

**Stage 2 — Runtime:**
- Base: `eclipse-temurin:23-jdk` (runtime only, no build tools).
- Installs minimal dependencies: Python 3, bash, unzip, lsof, openssl.
- Copies `TaskManager.zip` from the builder stage.
- Creates `/app/metadata` volume for the database.
- ENTRYPOINT: `entrypoint.sh`.
- CMD: `["--start-all"]`.

**Build args:**
```dockerfile
ARG GIT_REPO=https://github.com/fiopans1/task-manager.git
ARG GIT_BRANCH=main
```

**Advantages:**
- Final image ~70% smaller (no build tools).
- Multi-architecture support (AMD64, ARM64, ARM/v7).
- Reproducible (always builds from source).
- Single command builds everything.

#### `Dockerfile.build` (Legacy/Deprecated)
Build-only Dockerfile. Generates the artifact but requires manual execution afterward.

### 6.2 Docker Build Script

#### `build.sh`
Helper script for building Docker images (223 lines):

**Options:**
```bash
-t, --tag TAG            # Image tag (default: fiopans1/taskmanager:latest)
-p, --platform PLAT      # Platform (default: linux/amd64)
-m, --multi              # Multi-platform build (amd64+arm64)
--push                   # Push to Docker Hub
--no-cache               # Build without cache
-v, --verbose            # Verbose mode
--git-repo URL           # Repository URL
--git-branch BRANCH      # Branch to clone
```

**Example:**
```bash
./build.sh --platform linux/amd64 --push --tag myuser/taskmanager:v1.0
```

### 6.3 Docker Compilation Scripts

#### `scripts_compilation/entrypoint.sh`
Compilation container entrypoint. Commands:
- `compile` — Clone repo, compile, generate ZIP.
- `copy_to_output [file]` — Copy file to `/output`.
- `run_python [script.py] [args]` — Run Python script.
- `check_output` — List files in `/output`.
- `bash` — Interactive shell.

#### `scripts_compilation/env-setup.sh`
Environment variables for compilation:
```bash
ACTION=deploy
NAME_FINAL_FILE=TaskManager
PLATFORM=mac
VERSION=1.0.0
ARCHITECTURE=arm64
CADDY_VERSION=v2.7.6
```

### 6.4 Docker Deployment Scripts

#### `scripts_deployment/entrypoint.sh`
Deployment container entrypoint (238 lines). Commands:
```bash
--start-all              # Backend + Frontend (default)
--start-backend          # Backend only
--start-frontend         # Frontend only
--stop                   # Stop all
--stop-backend           # Stop backend
--stop-frontend          # Stop frontend
--backend-port PORT      # Backend port (default: 8080)
--frontend-port PORT     # Frontend port (default: 3000)
bash                     # Interactive shell
```

#### `scripts_deployment/env-setup.sh`
Environment variables for deployment:
```bash
BACKEND_PORT=8080
FRONTEND_PORT=3000
PROJECT_ROOT=/app/task-manager
```

#### `scripts_deployment/prepare_environment.sh`
Prepares the runtime environment (247 lines):
1. `prepare_environment()` — Extracts `TaskManager.zip`, configures permissions.
2. `copy_config_files()` — Copies custom configurations from `/files_to_copy` if they exist.
3. `generate_jwt_keys()` — Generates JWT RSA keys if they don't exist.

---

## 7. How to Build the Project

### 7.1 Prerequisites

| Tool | Minimum Version | Purpose |
|---|---|---|
| Java JDK | 23 | Backend compilation and runtime |
| Maven | 3.6+ | Backend build (or use `mvnw`) |
| Node.js | 18+ | Frontend build |
| pnpm | Latest | Frontend package manager |
| Python | 3.8+ | Build and deployment scripts |
| OpenSSL | — | JWT key generation |

### 7.2 Local Build

#### Full build (recommended):
```bash
# 1. Install Python dependencies
cd scripts
pip install -r requirements.txt

# 2. Run compilation
python3 compile.py --action deploy
```

This generates `TaskManager.zip` at the project root with the complete deployment structure.

#### Manual backend build:
```bash
cd backend

# With Maven Wrapper (no global installation needed)
./mvnw clean package -DskipTests

# Or with installed Maven
mvn clean package -DskipTests
```

The JAR is generated at `backend/target/taskmanager-0.0.1-Alpha.jar`.

#### Manual frontend build:
```bash
cd frontend

# Install dependencies
pnpm install

# Build
pnpm build
```

Static files are generated in `frontend/build/`.

### 7.3 Docker Build

#### Integrated build (recommended):
```bash
cd docker

# Basic build
docker build -f Dockerfile.deployment -t taskmanager:latest .

# With helper script
./build.sh --tag myuser/taskmanager:v1.0

# Multi-platform
./build.sh --multi --push --tag myuser/taskmanager:v1.0
```

#### Build with specific branch:
```bash
docker build -f Dockerfile.deployment \
  --build-arg GIT_BRANCH=develop \
  -t taskmanager:dev .
```

---

## 8. How to Deploy the Project

### 8.1 Local Deployment

```bash
# 1. Extract the artifact
unzip TaskManager.zip
cd task-manager

# 2. Generate JWT keys (first time only)
cd bin
python3 key_generator.py
cd ..

# 3. Configure the application
# Edit config/application.properties to adjust:
#   - Database URL
#   - Frontend base URL
#   - OAuth2 providers (if used)

# Edit lib/frontend/config.js to adjust:
#   - API base URL
#   - OAuth2 settings
#   - Feature flags

# 4. Start the application
cd bin
python3 start.py --start-all

# Application will be available at:
#   Frontend: http://localhost:3000
#   Backend:  http://localhost:8080

# 5. To stop:
python3 stop.py --stop-backend
python3 stop.py --stop-frontend
```

### 8.2 Docker Deployment

```bash
# Run with default ports
docker run -d \
  -p 8080:8080 \
  -p 3000:3000 \
  -v taskmanager-data:/app/metadata \
  --name taskmanager \
  taskmanager:latest

# Run with custom ports
docker run -d \
  -p 9090:9090 \
  -p 4000:4000 \
  -v taskmanager-data:/app/metadata \
  --name taskmanager \
  taskmanager:latest \
  --start-all --backend-port 9090 --frontend-port 4000

# Backend only
docker run -d \
  -p 8080:8080 \
  -v taskmanager-data:/app/metadata \
  taskmanager:latest --start-backend

# With custom configuration
docker run -d \
  -p 8080:8080 \
  -p 3000:3000 \
  -v taskmanager-data:/app/metadata \
  -v /path/to/custom/configs:/files_to_copy \
  taskmanager:latest
```

**Volumes:**
- `/app/metadata` — SQLite database (always persist this).
- `/files_to_copy` — Custom configuration files (optional).

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
      - ./custom-config:/files_to_copy  # Optional
    restart: unless-stopped
    environment:
      - BACKEND_PORT=8080
      - FRONTEND_PORT=3000

volumes:
  taskmanager-data:
```

---

## 9. Local Development

### Backend (development mode):
```bash
cd backend

# 1. Create application.properties (based on template)
cp ../scripts/config_templates/application-properties.template \
   src/main/resources/application.properties
# Edit as needed

# 2. Generate JWT keys
mkdir -p src/main/resources/keys
openssl genrsa -out src/main/resources/keys/private_key.pem 2048
openssl rsa -in src/main/resources/keys/private_key.pem \
  -pubout -out src/main/resources/keys/public_key.pem

# 3. Start in development mode
./mvnw spring-boot:run
```

### Frontend (development mode):
```bash
cd frontend

# 1. Create config.js (based on template)
cp ../scripts/config_templates/config.template.js public/config.js
# Edit: set api.baseUrl to http://localhost:8080

# 2. Install dependencies
pnpm install

# 3. Start development server (hot reload)
pnpm start
```

The development frontend opens at `http://localhost:3000` with hot reload. API requests go to the backend at `http://localhost:8080`.

---

## 10. Root Project Files

| File | Description |
|---|---|
| `README.md` | Main project documentation: features, quick start, architecture, troubleshooting. |
| `LICENSE` | AGPL v3.0 license. Copyright Diego Suárez Ramos (@fiopans1). |
| `.gitignore` | Git exclusions: `node_modules`, `*.db`, `application.properties`, `.env`, `jwtKeys`, builds, IDE files. |
| `.dockerignore` | Docker context exclusions: `.git`, `node_modules`, `target`, builds, docs, IDE files. |
