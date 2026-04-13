# Task Manager — Documentación Técnica y de Usuario

> **Versión:** 1.0.0  
> **Licencia:** GNU Affero General Public License v3.0  
> **Autor:** Diego Suárez Ramos (@fiopans1)

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Guía de Usuario por Funcionalidades](#2-guía-de-usuario-por-funcionalidades)
   - 2.1 [Autenticación y Registro](#21-autenticación-y-registro)
   - 2.2 [Panel Principal (Home)](#22-panel-principal-home)
   - 2.3 [Gestión de Tareas](#23-gestión-de-tareas)
   - 2.4 [Acciones y Comentarios en Tareas](#24-acciones-y-comentarios-en-tareas)
   - 2.5 [Calendario de Eventos](#25-calendario-de-eventos)
   - 2.6 [Gestión de Listas](#26-gestión-de-listas)
   - 2.7 [Gestión de Equipos](#27-gestión-de-equipos)
   - 2.8 [Invitaciones a Equipos](#28-invitaciones-a-equipos)
   - 2.9 [Panel de Administración](#29-panel-de-administración)
   - 2.10 [Gestión de Sesión](#210-gestión-de-sesión)
3. [Roles y Permisos](#3-roles-y-permisos)
4. [Especificaciones Técnicas (Diccionario de Propiedades)](#4-especificaciones-técnicas-diccionario-de-propiedades)
   - 4.1 [Backend — Entidades y Endpoints](#41-backend--entidades-y-endpoints)
   - 4.2 [Frontend — Estados y Componentes](#42-frontend--estados-y-componentes)
5. [Guía de Estilos y Formato](#5-guía-de-estilos-y-formato)
6. [Arquitectura del Sistema](#6-arquitectura-del-sistema)

---

## 1. Introducción

**Task Manager** es una aplicación web profesional de gestión de tareas diseñada para individuos y equipos de trabajo. Permite crear, organizar y hacer seguimiento de tareas, agruparlas en listas personalizadas, programar eventos en un calendario integrado y colaborar en equipos con roles diferenciados.

### Características principales

| Característica | Descripción |
|---|---|
| **Gestión de Tareas** | Creación, edición, eliminación y seguimiento de tareas con estados y prioridades |
| **Calendario** | Vista de calendario con eventos programados (día, semana, mes) |
| **Listas** | Organización de tareas en listas personalizadas con colores |
| **Equipos** | Colaboración en equipos con roles (Administrador / Miembro), asignación de tareas e invitaciones |
| **Panel de Administración** | Gestión de usuarios, feature flags y mensajes del sistema (solo ADMIN) |
| **Autenticación** | Inicio de sesión local con JWT y soporte OAuth2 (Google, GitHub, Authentik) |
| **Tema oscuro/claro** | Cambio de tema persistente en el navegador |
| **Diseño responsivo** | Interfaz adaptable a escritorio y dispositivos móviles |

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3.x, Spring Security, JPA/Hibernate, SQLite |
| Frontend | React 18, Redux Toolkit, React Router 7, React Bootstrap |
| Autenticación | JWT (RS256) + OAuth2 |
| Servidor web | Caddy |
| Contenedores | Docker (multi-arquitectura) |

---

## 2. Guía de Usuario por Funcionalidades

### 2.1 Autenticación y Registro

#### Propósito

Permite a los usuarios crear una cuenta, iniciar sesión con credenciales locales o proveedores OAuth2, y gestionar su sesión de forma segura.

#### Campos de registro

| Campo | Tipo de dato | Requerido | Descripción |
|---|---|---|---|
| Nombre | Texto | Sí | Nombre del usuario |
| Primer apellido | Texto | Sí | Primer apellido |
| Segundo apellido | Texto | No | Segundo apellido (opcional) |
| Nombre de usuario | Texto | Sí | Identificador único del usuario |
| Correo electrónico | Email | Sí | Dirección de correo electrónico única |
| Contraseña | Contraseña | Sí | Contraseña de acceso |
| Confirmar contraseña | Contraseña | Sí | Debe coincidir con la contraseña |

#### Flujo paso a paso — Registro

1. Acceda a la página de inicio y haga clic en **Crear cuenta**.
2. Complete todos los campos obligatorios del formulario.
3. Verifique que la contraseña y su confirmación coincidan.
4. Haga clic en **Registrarse**.
5. Si el registro es exitoso, será redirigido a la página de inicio de sesión.

#### Flujo paso a paso — Inicio de sesión local

1. Acceda a la página de inicio y haga clic en **Iniciar sesión**.
2. Introduzca su **nombre de usuario** y **contraseña**.
3. Haga clic en **Iniciar sesión**.
4. Si las credenciales son válidas, será redirigido al panel principal.

#### Flujo paso a paso — Inicio de sesión con OAuth2

1. En la página de inicio de sesión, haga clic en el botón del proveedor deseado (**Google**, **GitHub** o **Authentik**).
2. Será redirigido al proveedor externo para autenticarse.
3. Una vez autenticado, será redirigido automáticamente a la aplicación con la sesión iniciada.

> **Nota:** Los proveedores OAuth2 solo aparecen si están habilitados en la configuración del sistema.

#### Opciones adicionales

- **Cambio de tema:** Utilice el botón flotante en la esquina inferior izquierda (icono de sol/luna) para alternar entre tema claro y oscuro.
- **Mensaje del sistema:** Si el administrador ha configurado un mensaje del sistema, se mostrará antes o después del inicio de sesión.

---

### 2.2 Panel Principal (Home)

#### Propósito

Proporciona una vista general del estado de las tareas del usuario: tareas recientes, próximos eventos, estadísticas y accesos rápidos a las funcionalidades principales.

#### Contenido del panel

| Sección | Descripción |
|---|---|
| Sección héroe | Bienvenida con nombre de usuario y resumen |
| Tarjetas de acceso rápido | Mis Tareas, Calendario, Listas, Equipos |
| Estadísticas | Total de tareas, total de listas, barra de progreso de tareas completadas |
| Tareas recientes | Las 5 tareas más recientes ordenadas por fecha de creación |
| Próximos eventos | Los 5 próximos eventos programados |

#### Flujo paso a paso

1. Tras iniciar sesión, será redirigido automáticamente al panel principal.
2. Visualice sus estadísticas en la parte superior.
3. Utilice las **tarjetas de acceso rápido** para navegar a cada sección.
4. Consulte las **tareas recientes** y los **próximos eventos** en la parte inferior.

---

### 2.3 Gestión de Tareas

#### Propósito

Permite crear, editar, eliminar y hacer seguimiento de tareas individuales con diferentes estados, prioridades y opciones de programación.

#### Campos de la tarea

| Campo | Tipo de dato | Requerido | Descripción |
|---|---|---|---|
| Nombre de la tarea | Texto | Sí | Título descriptivo de la tarea |
| Descripción | Texto largo (hasta 10 000 caracteres) | No | Descripción detallada de la tarea |
| Estado | Enumerado | Sí | Estado actual de la tarea |
| Prioridad | Enumerado | Sí | Nivel de prioridad de la tarea |
| ¿Es evento? | Booleano | No | Indica si la tarea tiene programación horaria |
| Fecha de inicio | Fecha y hora | Condicional | Requerido si la tarea es un evento |
| Fecha de fin | Fecha y hora | Condicional | Requerido si la tarea es un evento |

#### Valores de Estado

| Estado | Descripción | Color del badge |
|---|---|---|
| `NEW` | Tarea nueva, sin iniciar | Azul (Info) |
| `IN_PROGRESS` | Tarea en curso | Azul (Primary) |
| `COMPLETED` | Tarea finalizada | Verde (Success) |
| `CANCELLED` | Tarea cancelada | Rojo (Danger) |
| `PAUSSED` | Tarea pausada temporalmente | Amarillo (Warning) |

#### Valores de Prioridad

| Prioridad | Descripción | Color del badge |
|---|---|---|
| `CRITICAL` | Prioridad crítica | Rojo (Danger) |
| `HIGH` | Prioridad alta | Naranja (Warning) |
| `MEDIUM` | Prioridad media | Azul (Info) |
| `LOW` | Prioridad baja | Gris (Secondary) |
| `MIN` | Prioridad mínima | Verde (Success) |

#### Flujo paso a paso — Crear tarea

1. Navegue a **Mis Tareas** desde la barra lateral o la tarjeta de acceso rápido.
2. Haga clic en el botón **Nueva tarea** (icono `+`).
3. Complete los campos del formulario modal:
   - Introduzca el **nombre** de la tarea.
   - Opcionalmente añada una **descripción**.
   - Seleccione el **estado** (`NEW` por defecto).
   - Seleccione la **prioridad**.
   - Si desea programarla, active el interruptor **¿Es evento?** e introduzca las fechas.
4. Haga clic en **Crear**.
5. La tarea aparecerá en la lista principal.

#### Flujo paso a paso — Editar tarea

1. En la lista de tareas, haga clic en el botón de edición (icono lápiz) de la tarea deseada.
2. Modifique los campos necesarios en el formulario modal.
3. Haga clic en **Guardar cambios**.

#### Flujo paso a paso — Eliminar tarea

1. En la lista de tareas, haga clic en el botón de eliminación (icono papelera) de la tarea deseada.
2. Confirme la eliminación en el diálogo de confirmación haciendo clic en **Eliminar**.

#### Opciones adicionales

- **Búsqueda:** Utilice el campo de búsqueda en la parte superior para filtrar tareas por nombre.
- **Detalle de tarea:** Haga clic sobre el nombre de una tarea para acceder a su vista detallada, donde podrá ver la información completa, el historial de acciones y añadir comentarios.
- **Scroll infinito:** La lista de tareas carga automáticamente más resultados al desplazarse hacia abajo (50 tareas por página).

---

### 2.4 Acciones y Comentarios en Tareas

#### Propósito

Permite registrar acciones, comentarios y ediciones sobre una tarea para mantener un historial completo de actividad.

#### Campos de acción

| Campo | Tipo de dato | Requerido | Descripción |
|---|---|---|---|
| Nombre de la acción | Texto | Sí | Título breve de la acción |
| Descripción | Texto | No | Descripción detallada de la acción |
| Tipo de acción | Enumerado | Sí | Tipo: `COMMENT`, `EDIT_TASK` o `CREATE_TASK` |

#### Flujo paso a paso — Añadir comentario

1. Acceda al detalle de una tarea haciendo clic sobre su nombre.
2. Desplácese a la sección de **Acciones**.
3. Escriba el contenido del comentario.
4. Haga clic en **Añadir**.
5. El comentario aparecerá en el historial de acciones con la fecha y el usuario.

#### Opciones adicionales

- **Editar acción:** Haga clic en el icono de edición junto a una acción existente.
- **Eliminar acción:** Haga clic en el icono de eliminación y confirme.
- **Menciones (@):** En equipos, utilice `@nombre_usuario` para mencionar a miembros del equipo en los comentarios.

---

### 2.5 Calendario de Eventos

#### Propósito

Visualiza las tareas programadas como eventos en un calendario interactivo con vistas de mes, semana y día.

#### Flujo paso a paso

1. Navegue a **Calendario** desde la barra lateral.
2. El calendario muestra todos los eventos asociados a sus tareas.
3. Utilice los controles superiores para cambiar entre vistas: **Mes**, **Semana** o **Día**.
4. Haga clic en un evento para ver sus detalles.

#### Opciones adicionales

- **Categorías de color:** Los eventos se muestran con colores según su categoría (trabajo, personal, urgente).
- **Navegación temporal:** Utilice las flechas para avanzar o retroceder entre periodos.
- **Vista actual:** Haga clic en **Hoy** para volver a la fecha actual.

> **Nota:** Para que una tarea aparezca en el calendario, debe estar marcada como evento con fecha de inicio y fin.

---

### 2.6 Gestión de Listas

#### Propósito

Permite crear listas personalizadas para organizar y agrupar tareas relacionadas. Cada lista muestra una barra de progreso con las tareas completadas.

#### Campos de la lista

| Campo | Tipo de dato | Requerido | Descripción |
|---|---|---|---|
| Nombre de la lista | Texto | Sí | Título identificativo de la lista |
| Descripción | Texto largo (hasta 10 000 caracteres) | No | Descripción del propósito de la lista |
| Color | Selector de color | Sí | Color identificativo de la lista |

#### Flujo paso a paso — Crear lista

1. Navegue a **Listas** desde la barra lateral.
2. Haga clic en el botón **Nueva lista** (icono `+`).
3. Complete los campos del formulario modal:
   - Introduzca el **nombre** de la lista.
   - Opcionalmente añada una **descripción**.
   - Seleccione un **color** para la lista.
4. Haga clic en **Crear**.

#### Flujo paso a paso — Editar lista

1. En la vista de listas, haga clic en el botón de edición de la lista deseada.
2. Modifique los campos necesarios.
3. Haga clic en **Guardar cambios**.

#### Flujo paso a paso — Añadir tareas a una lista

1. Haga clic sobre el nombre de la lista para acceder a su detalle.
2. Haga clic en el botón **Añadir tareas**.
3. Seleccione las tareas que desee incluir de la lista de tareas disponibles (solo tareas sin lista asignada).
4. Confirme la selección.

#### Flujo paso a paso — Eliminar tarea de una lista

1. En el detalle de la lista, localice la tarea que desea retirar.
2. Haga clic en el botón de eliminación junto a la tarea.
3. La tarea se desvincula de la lista pero no se elimina.

#### Opciones adicionales

- **Barra de progreso:** En el detalle de la lista se muestra una barra de progreso indicando el ratio de tareas completadas sobre el total.
- **Eliminar lista:** Al eliminar una lista, las tareas que contenía no se eliminan; simplemente pierden la asociación con la lista.

---

### 2.7 Gestión de Equipos

#### Propósito

Permite crear equipos de trabajo, gestionar miembros con roles diferenciados, asignar tareas y ver estadísticas del equipo.

#### Campos del equipo

| Campo | Tipo de dato | Requerido | Descripción |
|---|---|---|---|
| Nombre del equipo | Texto | Sí | Nombre identificativo del equipo |
| Descripción | Texto largo (hasta 5 000 caracteres) | No | Descripción del equipo |

#### Roles dentro del equipo

| Rol | Descripción |
|---|---|
| **ADMIN** | Administrador del equipo. Puede editar el equipo, gestionar miembros, asignar tareas y enviar invitaciones |
| **MEMBER** | Miembro estándar. Puede ver las tareas del equipo y acceder al panel del equipo |

> **Nota:** El creador del equipo se asigna automáticamente como ADMIN.

#### Flujo paso a paso — Crear equipo

1. Navegue a **Equipos** desde la barra lateral.
2. Haga clic en el botón **Nuevo equipo** (icono `+`).
3. Introduzca el **nombre** y opcionalmente la **descripción** del equipo.
4. Haga clic en **Crear**.
5. Será asignado automáticamente como administrador del equipo.

#### Flujo paso a paso — Panel del equipo (Dashboard)

1. Haga clic en el nombre de un equipo para acceder a su panel.
2. El panel presenta cuatro pestañas:

| Pestaña | Contenido |
|---|---|
| **Dashboard** | Estadísticas del equipo (total, completadas, en progreso, pendientes), barra de progreso, carga de trabajo por miembro |
| **Tareas** | Lista de tareas del equipo con filtros por miembro, estado y prioridad. Permite reasignación |
| **Historial** | Registro de asignaciones de tareas con fechas y usuarios implicados |
| **Invitaciones** | Gestión de invitaciones pendientes (solo visible para ADMIN del equipo) |

#### Flujo paso a paso — Gestionar miembros (ADMIN del equipo)

1. En el panel del equipo, pestaña **Dashboard**.
2. En la sección de miembros:
   - **Promover a ADMIN:** Haga clic en el botón de promoción del miembro deseado.
   - **Degradar a MEMBER:** Haga clic en el botón de degradación (no permitido para el último ADMIN).
   - **Eliminar miembro:** Haga clic en el botón de eliminación del miembro.

#### Flujo paso a paso — Asignar tarea a un miembro (ADMIN del equipo)

1. En la pestaña **Tareas** del panel del equipo.
2. Localice la tarea que desea reasignar.
3. Haga clic en el botón de asignación.
4. Seleccione el miembro al que desea asignar la tarea.
5. Confirme la asignación.

#### Flujo paso a paso — Abandonar equipo

1. En el panel del equipo, haga clic en **Abandonar equipo**.
2. Confirme en el diálogo de confirmación.

> **Nota:** El último ADMIN del equipo no puede abandonarlo. Debe promover a otro miembro antes de salir.

---

### 2.8 Invitaciones a Equipos

#### Propósito

Sistema de invitaciones con tokens únicos para añadir nuevos miembros a un equipo de forma segura.

#### Campos de invitación

| Campo | Tipo de dato | Requerido | Descripción |
|---|---|---|---|
| Nombre de usuario | Texto | Sí | Nombre de usuario del invitado |

#### Flujo paso a paso — Enviar invitación (ADMIN del equipo)

1. En el panel del equipo, acceda a la pestaña **Invitaciones**.
2. Introduzca el **nombre de usuario** del usuario que desea invitar.
3. Haga clic en **Enviar invitación**.
4. Se generará un token único y la invitación quedará en estado `PENDING`.

#### Flujo paso a paso — Responder a una invitación

1. Navegue a la sección **Equipos**.
2. Las invitaciones pendientes se muestran en la parte superior de la vista.
3. Para cada invitación, haga clic en **Aceptar** o **Rechazar**.
4. Al aceptar, será añadido como MEMBER del equipo y podrá acceder a su panel.

#### Opciones adicionales

- **Cancelar invitación (ADMIN):** En la pestaña de invitaciones, haga clic en **Cancelar** junto a una invitación pendiente.

#### Estados de la invitación

| Estado | Descripción |
|---|---|
| `PENDING` | Invitación enviada, pendiente de respuesta |
| `ACCEPTED` | Invitación aceptada, el usuario ya es miembro |
| `REJECTED` | Invitación rechazada por el usuario |

---

### 2.9 Panel de Administración

#### Propósito

Permite a los administradores del sistema gestionar usuarios, configurar feature flags y enviar mensajes del sistema. Solo accesible con el rol `ADMIN`.

#### Pestañas del panel

##### 2.9.1 Gestión de Usuarios

| Acción | Descripción |
|---|---|
| **Buscar usuarios** | Busque por nombre de usuario o correo electrónico |
| **Ver detalle** | Visualice las tareas, listas y equipos de un usuario |
| **Bloquear/Desbloquear** | Bloquee un usuario para impedir su acceso al sistema |
| **Editar recursos** | Edite las tareas, listas o equipos de cualquier usuario |

##### Flujo paso a paso — Bloquear un usuario

1. Navegue al **Panel de Administración** desde la barra lateral.
2. En la pestaña **Usuarios**, busque al usuario por nombre de usuario.
3. Haga clic en el botón **Bloquear** del usuario deseado.
4. Confirme la acción en el diálogo de confirmación.
5. El usuario no podrá acceder al sistema hasta que sea desbloqueado.

> **Nota:** Los usuarios bloqueados son rechazados a nivel del filtro JWT (código HTTP 403), incluso si poseen un token válido.

##### 2.9.2 Feature Flags (Funcionalidades)

Permite habilitar o deshabilitar funcionalidades completas de la aplicación.

| Feature Flag | Funcionalidad asociada | Descripción |
|---|---|---|
| `tasks` | Tareas | Habilita/deshabilita la sección de tareas |
| `calendar` | Calendario | Habilita/deshabilita la vista de calendario |
| `lists` | Listas | Habilita/deshabilita la gestión de listas |
| `teams` | Equipos | Habilita/deshabilita la gestión de equipos |

##### Flujo paso a paso — Gestionar feature flags

1. En el **Panel de Administración**, acceda a la pestaña **Funcionalidades**.
2. Active o desactive el interruptor junto a cada funcionalidad.
3. Los cambios se aplican inmediatamente a todos los usuarios.
4. Las rutas y elementos de navegación de las funcionalidades deshabilitadas quedan ocultos y protegidos.

##### 2.9.3 Mensaje del Sistema

Permite configurar un mensaje que se mostrará a todos los usuarios.

| Campo | Tipo de dato | Descripción |
|---|---|---|
| Mensaje | Texto | Contenido del mensaje del sistema |
| Habilitado | Booleano | Activa/desactiva el mensaje |
| Mostrar antes del login | Booleano | Muestra el mensaje en la página de inicio de sesión |
| Mostrar después del login | Booleano | Muestra el mensaje tras iniciar sesión |

##### Flujo paso a paso — Configurar mensaje del sistema

1. En el **Panel de Administración**, acceda a la pestaña **Mensaje del Sistema**.
2. Escriba el contenido del mensaje.
3. Active el interruptor **Habilitado**.
4. Seleccione si desea mostrarlo antes del login, después del login, o ambos.
5. Haga clic en **Guardar**.

---

### 2.10 Gestión de Sesión

#### Propósito

La sesión del usuario se gestiona mediante tokens JWT con una duración de 4 horas. El sistema notifica al usuario antes de que expire la sesión.

#### Comportamiento

| Evento | Descripción |
|---|---|
| **Verificación periódica** | El sistema comprueba el estado del token cada 30 segundos |
| **Aviso de expiración** | Cuando quedan menos de 5 minutos, se muestra un modal con cuenta regresiva de 60 segundos |
| **Extender sesión** | El usuario puede hacer clic en **Extender sesión** para renovar el token |
| **Cierre automático** | Si no se extiende la sesión, el usuario será desconectado automáticamente al agotarse la cuenta regresiva |

---

## 3. Roles y Permisos

### Roles del sistema

La aplicación define dos roles principales a nivel del sistema:

| Rol | Descripción |
|---|---|
| **ADMIN** | Administrador del sistema con acceso completo |
| **BASIC** | Usuario estándar registrado (asignado por defecto al registrarse) |

### Matriz de permisos — Administrador (ADMIN) vs. Usuario Estándar (BASIC)

| Funcionalidad | ADMIN | BASIC |
|---|---|---|
| **Tareas propias** | ✅ Crear, leer, editar, eliminar | ✅ Crear, leer, editar, eliminar |
| **Tareas de otros usuarios** | ✅ Leer, editar, eliminar | ❌ Sin acceso |
| **Crear tareas para otros** | ✅ Permitido | ❌ No permitido |
| **Listas propias** | ✅ Crear, leer, editar, eliminar | ✅ Crear, leer, editar, eliminar |
| **Listas de otros usuarios** | ✅ Leer, editar, eliminar | ❌ Sin acceso |
| **Crear listas para otros** | ✅ Permitido | ❌ No permitido |
| **Crear equipos** | ✅ Permitido | ✅ Permitido |
| **Acceder a cualquier equipo** | ✅ Sin restricción de membresía | ❌ Solo equipos donde es miembro |
| **Panel de Administración** | ✅ Acceso completo | ❌ Sin acceso |
| **Buscar/ver usuarios** | ✅ Todos los usuarios | ❌ No disponible |
| **Bloquear/desbloquear usuarios** | ✅ Permitido | ❌ No disponible |
| **Gestionar feature flags** | ✅ Permitido | ❌ No disponible |
| **Configurar mensaje del sistema** | ✅ Permitido | ❌ No disponible |

### Roles dentro de un equipo

Además de los roles del sistema, cada miembro de un equipo tiene un rol dentro del contexto del equipo:

| Rol de equipo | Permisos dentro del equipo |
|---|---|
| **ADMIN** | Editar equipo, eliminar equipo, añadir/eliminar miembros, promover/degradar roles, asignar tareas, enviar/cancelar invitaciones, ver historial |
| **MEMBER** | Ver panel del equipo, ver tareas del equipo, ver historial, abandonar equipo |

### Restricciones de seguridad del equipo

| Restricción | Descripción |
|---|---|
| Último ADMIN no puede abandonar | El último administrador debe promover a otro miembro antes de salir |
| Último ADMIN no puede ser degradado | No se puede degradar al último ADMIN a MEMBER |
| Último ADMIN no puede ser eliminado | No se puede eliminar al último ADMIN del equipo |

### Verificación de permisos en el Backend

El control de acceso se realiza en cada servicio mediante la siguiente lógica:

```java
// Patrón de verificación utilizado en TaskService, ListService, TeamService
if (authService.hasRole("ADMIN") || resource.getUser().getUsername().equals(currentUsername)) {
    // Operación permitida
} else {
    throw new NotPermissionException("No tiene permisos para acceder a este recurso");
}
```

Los endpoints del Panel de Administración están protegidos adicionalmente con la anotación `@Secured("ROLE_ADMIN")`.

### Seguridad de usuarios bloqueados

Los usuarios bloqueados por un administrador son rechazados a nivel del filtro JWT (`JWTAuthorizationFilter`). Incluso con un token JWT válido, un usuario bloqueado recibirá un **HTTP 403 Forbidden** en cualquier petición autenticada.

---

## 4. Especificaciones Técnicas (Diccionario de Propiedades)

### 4.1 Backend — Entidades y Endpoints

#### 4.1.1 Entidad `User` (`app_user`)

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | `GET /api/admin/users/{userId}` |
| `username` | `String` (único) | Nombre de usuario | `POST /auth/login`, `POST /auth/register` |
| `email` | `String` (único) | Correo electrónico | `POST /auth/register` |
| `password` | `String` | Contraseña cifrada (BCrypt 12) | `POST /auth/login`, `POST /auth/register` |
| `creationDate` | `Date` | Fecha de creación de la cuenta | `GET /api/admin/users/{userId}` |
| `blocked` | `boolean` | Estado de bloqueo | `POST /api/admin/users/{userId}/toggle-block` |
| `name` | `FullName` (Embedded) | Nombre completo (name, surname1, surname2) | `POST /auth/register` |
| `roles` | `Set<RoleOfUser>` | Roles asignados (ManyToMany) | Interno — asignados en registro |
| `authProviders` | `Set<AuthProvider>` | Proveedores de autenticación (`LOCAL`, `GITHUB`, `GOOGLE`) | Interno — asignados en registro/OAuth2 |

#### 4.1.2 Entidad `Task`

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | `GET /api/tasks/{id}` |
| `nameOfTask` | `String` (obligatorio) | Nombre de la tarea | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `descriptionOfTask` | `String` (Lob, max 10 000) | Descripción detallada | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `state` | `StateTask` (enum) | Estado: `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `PAUSSED` | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `priority` | `PriorityTask` (enum) | Prioridad: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `MIN` | `POST /api/tasks/create`, `POST /api/tasks/update/{id}` |
| `creationDate` | `Date` | Fecha de creación | Automática |
| `user` | `User` (ManyToOne) | Usuario propietario | Asignado automáticamente |
| `list` | `ListTM` (ManyToOne, opcional) | Lista a la que pertenece | `POST /api/lists/{listId}/tasks/{taskId}` |
| `team` | `Team` (ManyToOne, opcional) | Equipo al que pertenece | `POST /api/teams/{teamId}/tasks/{taskId}/add` |
| `eventTask` | `EventTask` (OneToOne) | Datos de evento (inicio/fin) | `POST /api/tasks/create` |
| `actions` | `List<ActionTask>` (OneToMany) | Historial de acciones | `POST /api/tasks/{taskId}/actions` |

#### 4.1.3 Entidad `ListTM` (`list_tm`)

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | `GET /api/lists/getList/{id}` |
| `nameOfList` | `String` (obligatorio) | Nombre de la lista | `POST /api/lists/create`, `PUT /api/lists/update/{id}` |
| `descriptionOfList` | `String` (Lob, max 10 000) | Descripción de la lista | `POST /api/lists/create`, `PUT /api/lists/update/{id}` |
| `color` | `String` (obligatorio) | Color hexadecimal de la lista | `POST /api/lists/create`, `PUT /api/lists/update/{id}` |
| `user` | `User` (ManyToOne) | Usuario propietario | Asignado automáticamente |
| `listTasks` | `List<Task>` (OneToMany) | Tareas asociadas a la lista | `POST /api/lists/{listId}/tasks/{taskId}` |

#### 4.1.4 Entidad `Team`

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | `GET /api/teams/{teamId}` |
| `name` | `String` (obligatorio) | Nombre del equipo | `POST /api/teams/create`, `PUT /api/teams/{teamId}` |
| `description` | `String` (Lob, max 5 000) | Descripción del equipo | `POST /api/teams/create`, `PUT /api/teams/{teamId}` |
| `creationDate` | `Date` | Fecha de creación | Automática |
| `members` | `List<TeamMember>` (OneToMany) | Miembros del equipo | `GET /api/teams/{teamId}` |

#### 4.1.5 Entidad `TeamMember`

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | `DELETE /api/teams/{teamId}/members/{memberId}` |
| `team` | `Team` (ManyToOne) | Equipo al que pertenece | Interno |
| `user` | `User` (ManyToOne) | Usuario miembro | Interno |
| `role` | `TeamRole` (enum) | Rol: `ADMIN` o `MEMBER` | `PUT /api/teams/{teamId}/members/{memberId}/role` |
| `joinedDate` | `Date` | Fecha de incorporación | Automática |

#### 4.1.6 Entidad `TeamInvitation`

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | `DELETE /api/teams/{teamId}/invitations/{invitationId}` |
| `team` | `Team` (ManyToOne) | Equipo que invita | `POST /api/teams/{teamId}/invitations` |
| `invitedEmail` | `String` (opcional) | Email del invitado | `POST /api/teams/{teamId}/invitations` |
| `invitedUsername` | `String` (opcional) | Username del invitado | `POST /api/teams/{teamId}/invitations` |
| `invitedBy` | `User` (ManyToOne) | Usuario que envía la invitación | Asignado automáticamente |
| `status` | `InvitationStatus` (enum) | Estado: `PENDING`, `ACCEPTED`, `REJECTED` | `POST /api/teams/invitations/{token}/respond` |
| `token` | `String` (único) | Token de invitación | `POST /api/teams/invitations/{token}/respond` |
| `createdDate` | `Date` | Fecha de creación | Automática |
| `respondedDate` | `Date` | Fecha de respuesta | Automática al responder |

#### 4.1.7 Entidad `ActionTask`

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | `PUT /api/tasks/{taskId}/actions/{actionId}` |
| `actionName` | `String` | Nombre/título de la acción | `POST /api/tasks/{taskId}/actions` |
| `actionDescription` | `String` | Descripción de la acción | `POST /api/tasks/{taskId}/actions` |
| `actionType` | `ActionType` (enum) | Tipo: `COMMENT`, `EDIT_TASK`, `CREATE_TASK` | `POST /api/tasks/{taskId}/actions` |
| `user` | `String` | Nombre de usuario que realizó la acción | Asignado automáticamente |
| `task` | `Task` (ManyToOne) | Tarea asociada | Interno |
| `actionDate` | `Date` | Fecha de la acción | Automática |

#### 4.1.8 Entidad `EventTask`

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | Interno |
| `startTime` | `Date` | Fecha y hora de inicio del evento | `POST /api/tasks/create` (campo `startDate` en DTO) |
| `endTime` | `Date` | Fecha y hora de fin del evento | `POST /api/tasks/create` (campo `endDate` en DTO) |
| `task` | `Task` (OneToOne) | Tarea asociada | `GET /api/tasks/events/get` |

#### 4.1.9 Entidad `TaskAssignmentHistory`

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | Interno |
| `task` | `Task` (ManyToOne) | Tarea reasignada | `GET /api/teams/{teamId}/assignment-history` |
| `fromUser` | `User` (ManyToOne, opcional) | Usuario anterior | `GET /api/teams/{teamId}/assignment-history` |
| `toUser` | `User` (ManyToOne) | Nuevo usuario asignado | `GET /api/teams/{teamId}/assignment-history` |
| `changedBy` | `User` (ManyToOne) | Usuario que realizó el cambio | `GET /api/teams/{teamId}/assignment-history` |
| `team` | `Team` (ManyToOne) | Equipo donde ocurrió el cambio | `GET /api/teams/{teamId}/assignment-history` |
| `changedDate` | `Date` | Fecha del cambio | Automática |

#### 4.1.10 Entidad `AppConfig` (`app_config`)

| Propiedad | Tipo | Descripción | Endpoint asociado |
|---|---|---|---|
| `id` | `Long` | Identificador único autogenerado | Interno |
| `configKey` | `String` (único) | Clave de configuración | `GET /api/admin/features`, `PUT /api/admin/features/{featureName}` |
| `configValue` | `String` (Lob, max 5 000) | Valor de configuración | `PUT /api/admin/system-message` |

#### 4.1.11 Catálogo completo de Endpoints

##### Autenticación (`/auth`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `POST` | `/auth/login` | `LoginDTO {username, password}` | `{token: "jwt_token"}` | Inicio de sesión |
| `POST` | `/auth/register` | `User {username, email, password, name}` | `ResponseDTO` | Registro de nuevo usuario |

##### Tareas (`/api/tasks`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `POST` | `/tasks/create` | `TaskDTO` | `TaskDTO` | Crear nueva tarea |
| `GET` | `/tasks/tasks` | — | `List<TaskDTO>` | Obtener todas las tareas del usuario |
| `GET` | `/tasks/tasks/paged` | `?page=0&size=50` | `Page<TaskDTO>` | Obtener tareas paginadas |
| `GET` | `/tasks/{id}` | `id` (Path) | `TaskDTO` | Obtener tarea por ID |
| `POST` | `/tasks/update/{id}` | `id` (Path), `TaskDTO` | `TaskDTO` | Actualizar tarea |
| `DELETE` | `/tasks/delete/{id}` | `id` (Path) | `String` | Eliminar tarea |
| `GET` | `/tasks/events/get` | — | `List<EventTaskDTO>` | Obtener eventos del calendario |
| `POST` | `/tasks/{taskId}/actions` | `taskId` (Path), `ActionTaskDTO` | `ActionTaskDTO` | Añadir acción a tarea |
| `GET` | `/tasks/{taskId}/actions` | `taskId` (Path) | `List<ActionTaskDTO>` | Obtener acciones de tarea |
| `GET` | `/tasks/{taskId}/actions/paged` | `taskId` (Path), `?page&size` | `Page<ActionTaskDTO>` | Obtener acciones paginadas |
| `PUT` | `/tasks/{taskId}/actions/{actionId}` | `taskId`, `actionId` (Path), `ActionTaskDTO` | `ActionTaskDTO` | Actualizar acción |
| `DELETE` | `/tasks/{taskId}/actions/{actionId}` | `taskId`, `actionId` (Path) | `String` | Eliminar acción |
| `GET` | `/tasks/getTasksResumeWithoutList` | — | `List<TaskResumeDTO>` | Obtener tareas sin lista |
| `GET` | `/tasks/user/{userId}` | `userId` (Path) | `List<TaskSummaryDTO>` | Obtener resumen de tareas de un usuario (ADMIN) |

##### Listas (`/api/lists`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `POST` | `/lists/create` | `ListTMDTO` | `ListTMDTO` | Crear nueva lista |
| `GET` | `/lists/lists` | — | `List<ListTMDTO>` | Obtener todas las listas |
| `GET` | `/lists/lists/paged` | `?page=0&size=50` | `Page<ListTMDTO>` | Obtener listas paginadas |
| `GET` | `/lists/getList/{id}` | `id` (Path) | `ListTMDTO` | Obtener detalle de lista con tareas |
| `PUT` | `/lists/update/{id}` | `id` (Path), `ListTMDTO` | `ListTMDTO` | Actualizar lista |
| `DELETE` | `/lists/delete/{id}` | `id` (Path) | `String` | Eliminar lista |
| `POST` | `/lists/{listId}/tasks/{taskId}` | `listId`, `taskId` (Path) | `TaskDTO` | Añadir tarea a lista |
| `DELETE` | `/lists/{listId}/tasks/{taskId}` | `listId`, `taskId` (Path) | `String` | Eliminar tarea de lista |

##### Equipos (`/api/teams`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `POST` | `/teams/create` | `TeamDTO` | `TeamDTO` | Crear nuevo equipo |
| `GET` | `/teams/my-teams` | — | `List<TeamDTO>` | Obtener equipos del usuario |
| `GET` | `/teams/my-teams/paged` | `?page&size` | `Page<TeamDTO>` | Obtener equipos paginados |
| `GET` | `/teams/{teamId}` | `teamId` (Path) | `TeamDTO` | Obtener detalle de equipo |
| `PUT` | `/teams/{teamId}` | `teamId` (Path), `TeamDTO` | `TeamDTO` | Actualizar equipo (ADMIN del equipo) |
| `DELETE` | `/teams/{teamId}` | `teamId` (Path) | `String` | Eliminar equipo (ADMIN del equipo) |
| `DELETE` | `/teams/{teamId}/members/{memberId}` | `teamId`, `memberId` (Path) | `String` | Eliminar miembro (ADMIN del equipo) |
| `POST` | `/teams/{teamId}/leave` | `teamId` (Path) | `String` | Abandonar equipo |
| `PUT` | `/teams/{teamId}/members/{memberId}/role` | `teamId`, `memberId` (Path), `{role}` | `TeamMemberDTO` | Cambiar rol de miembro (ADMIN del equipo) |
| `POST` | `/teams/{teamId}/tasks/{taskId}/assign` | `teamId`, `taskId` (Path), `{username}` | `TaskDTO` | Asignar tarea a miembro (ADMIN del equipo) |
| `POST` | `/teams/{teamId}/tasks/{taskId}/add` | `teamId`, `taskId` (Path) | `TaskDTO` | Añadir tarea al equipo (ADMIN del equipo) |
| `GET` | `/teams/{teamId}/dashboard` | `teamId` (Path) | `TeamDashboardDTO` | Obtener estadísticas del equipo |
| `GET` | `/teams/{teamId}/tasks` | `teamId` (Path), `?member&state&priority` | `List<TaskDTO>` | Obtener tareas filtradas del equipo |
| `GET` | `/teams/{teamId}/tasks/paged` | `teamId` (Path), `?page&size&member&state&priority` | `Page<TaskDTO>` | Obtener tareas paginadas filtradas |
| `GET` | `/teams/{teamId}/assignment-history` | `teamId` (Path) | `List<TaskAssignmentHistoryDTO>` | Historial de asignaciones |
| `GET` | `/teams/{teamId}/assignment-history/paged` | `teamId` (Path), `?page&size` | `Page<TaskAssignmentHistoryDTO>` | Historial paginado |
| `POST` | `/teams/{teamId}/invitations` | `teamId` (Path), `{username}` | `TeamInvitationDTO` | Crear invitación |
| `GET` | `/teams/{teamId}/invitations` | `teamId` (Path) | `List<TeamInvitationDTO>` | Listar invitaciones del equipo |
| `DELETE` | `/teams/{teamId}/invitations/{invitationId}` | `teamId`, `invitationId` (Path) | `String` | Cancelar invitación |
| `GET` | `/teams/invitations/pending` | — | `List<TeamInvitationDTO>` | Invitaciones pendientes del usuario |
| `POST` | `/teams/invitations/{token}/respond` | `token` (Path), `{accept}` | `TeamDTO` | Aceptar/rechazar invitación |

##### Home (`/api/home-summary`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `GET` | `/home-summary` | — | `HomeSummaryDTO` | Resumen del panel principal |

##### Administración (`/api/admin`) — Solo ADMIN

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `GET` | `/admin/users` | `?query` | `List<Map>` | Buscar usuarios |
| `GET` | `/admin/users/paged` | `?query&page&size` | `Page<Map>` | Buscar usuarios paginado |
| `GET` | `/admin/users/{userId}` | `userId` (Path) | `Map` | Obtener detalle de usuario |
| `POST` | `/admin/users/{userId}/toggle-block` | `userId` (Path) | `Map` | Bloquear/desbloquear usuario |
| `GET` | `/admin/features` | — | `Map<String,Boolean>` | Obtener feature flags |
| `PUT` | `/admin/features/{featureName}` | `featureName` (Path), `{enabled}` | `Map` | Actualizar feature flag |
| `GET` | `/admin/system-message` | — | `Map` | Obtener mensaje del sistema |
| `PUT` | `/admin/system-message` | `{message, enabled, showBeforeLogin, showAfterLogin}` | `Map` | Actualizar mensaje del sistema |

##### Sesión (`/api/session`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `POST` | `/session/refresh` | — | `{token: "jwt_token"}` | Renovar token JWT |

##### Configuración pública (`/api/config`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `GET` | `/config` | — | `Map` | Obtener configuración pública (sin autenticación) |

##### Health Check (`/health`)

| Método | Ruta | Cuerpo / Parámetros | Respuesta | Descripción |
|---|---|---|---|---|
| `GET` | `/health` | — | `"OK"` | Verificación de estado del servidor |

---

### 4.2 Frontend — Estados y Componentes

#### 4.2.1 Gestión de Estado Global

| Estado / Variable | Componente donde se usa | Función |
|---|---|---|
| `auth.token` | Redux Store (`authSlice`) | Almacena el token JWT del usuario autenticado. Persistido en `localStorage` |
| `darkMode` | `ThemeContext` | Controla el tema claro/oscuro. Persistido en `localStorage` con clave `app-theme` |
| `isAuthenticated` | `App.js` | Estado booleano que determina si el usuario tiene sesión activa |

#### 4.2.2 Servicios del Frontend

| Servicio | Estado / Variable | Componente donde se usa | Función |
|---|---|---|---|
| `authService` | Token JWT (Redux) | `LoginPage`, `RegisterPage`, `OAuth2Login`, `App` | Login, registro, validación de token, roles, refresh |
| `taskService` | Cache Suspense (`tasksCache`) | `Tasks`, `TasksList`, `TaskDetails`, `CalendarComponent` | CRUD de tareas, acciones, eventos, paginación |
| `listService` | Cache Suspense (`listsCache`) | `Lists`, `ListsList`, `ListDetails` | CRUD de listas, gestión de tareas en listas |
| `teamService` | Cache Suspense (`teamsCache`) | `Teams`, `TeamsList`, `TeamDashboard` | CRUD de equipos, miembros, invitaciones, historial |
| `adminService` | Cache Suspense (`userSearchCache`) | `AdminPanel`, `UserManagementTab`, `FeatureFlagsTab`, `SystemMessageTab` | Gestión de usuarios, feature flags, mensajes |
| `homeService` | — | `Home` | Resumen del panel principal |
| `configService` | `window.APP_CONFIG` | `SidebarMenu`, `FeatureGuard`, `OAuth2Login`, `About` | Configuración de la aplicación, feature flags, OAuth2 |

#### 4.2.3 Componentes Principales

| Componente | Estado / Variable interna | Función |
|---|---|---|
| `App.js` | `isAuthenticated`, `loading` | Router principal, inicialización de autenticación |
| `MainApp.js` | — | Layout con sidebar, outlet y gestión de sesión |
| `SidebarMenu.js` | `collapsed`, `showOffcanvas`, `isMobile` | Navegación principal con sidebar colapsable y menú móvil |
| `Home.js` | `summary` (HomeSummaryDTO) | Panel principal con estadísticas y accesos rápidos |
| `Tasks.js` | `showNewTask`, `showEditTask`, `searchTerm`, `refreshKey` | Vista principal de tareas con búsqueda y CRUD |
| `TasksList.js` | `items` (useServerInfiniteScroll) | Lista paginada de tareas con scroll infinito |
| `NewEditTask.js` | `formData`, `validated`, `isEvent` | Modal de creación/edición de tareas |
| `TaskDetails.js` | `task`, `teamContext` | Vista detallada de una tarea con acciones |
| `Lists.js` | `showNewList`, `showEditList`, `searchTerm`, `refreshKey` | Vista principal de listas con búsqueda y CRUD |
| `ListsList.js` | `items` (useServerInfiniteScroll) | Lista paginada de listas con scroll infinito |
| `NewEditLists.js` | `formData`, `validated` | Modal de creación/edición de listas |
| `ListDetails.js` | `list`, `showAddTask` | Detalle de lista con barra de progreso y gestión de tareas |
| `Teams.js` | `showCreateModal`, `pendingInvitations`, `searchTerm` | Vista principal de equipos con invitaciones pendientes |
| `TeamsList.js` | `items` (useServerInfiniteScroll) | Lista paginada de equipos |
| `TeamDashboard.js` | `team`, `activeTab`, `filters`, `dashboardData` | Panel completo del equipo con pestañas |
| `DashboardTab.js` | `dashboardData`, `memberItems` | Estadísticas del equipo y carga de trabajo por miembro |
| `TasksTab.js` | `items`, `filterMember`, `filterState`, `filterPriority` | Tareas del equipo con filtros y paginación |
| `HistoryTab.js` | `items` (useServerInfiniteScroll) | Historial de asignaciones paginado |
| `InvitationsTab.js` | `invitations`, `newUsername` | Gestión de invitaciones (solo ADMIN del equipo) |
| `CalendarComponent.js` | `events`, `view` | Calendario con eventos, vistas mes/semana/día |
| `AdminPanel.js` | `activeTab` | Panel de administración con pestañas |
| `UserManagementTab.js` | `searchQuery`, `users` | Búsqueda y gestión de usuarios |
| `UserDetailModal.js` | `activeTab`, `tasks`, `lists`, `teams` | Detalle de usuario con recursos paginados |
| `FeatureFlagsTab.js` | `flags` | Gestión de feature flags con interruptores |
| `SystemMessageTab.js` | `message`, `enabled`, `showBeforeLogin`, `showAfterLogin` | Configuración de mensajes del sistema |
| `SessionManager.js` | `showWarning`, `countdown` | Monitoreo de expiración de sesión con cuenta regresiva |
| `FeatureGuard.js` | `loading`, `featureEnabled` | Protección de rutas por feature flag |
| `ProtectedRoute.js` | — | Protección de rutas por autenticación |
| `ThemeToggleButton.js` | `darkMode` (ThemeContext) | Botón flotante de cambio de tema |
| `SystemMessageModal.js` | `message`, `show` | Modal de mensaje del sistema |

#### 4.2.4 Hooks Personalizados

| Hook | Parámetros | Retorna | Función |
|---|---|---|---|
| `useServerInfiniteScroll` | `fetchPage(page, size)`, `pageSize`, `deps[]` | `{items, loading, initialLoading, hasMore, LoadMoreSpinner, reset}` | Paginación del servidor con scroll infinito mediante IntersectionObserver |
| `useInfiniteScroll` | `allItems[]`, `pageSize` | `{displayedItems, sentinelRef, hasMore, LoadMoreSpinner}` | Paginación del lado del cliente con scroll infinito |
| `useTheme` | — | `{darkMode, toggleDarkMode}` | Acceso al contexto de tema claro/oscuro |

---

## 5. Guía de Estilos y Formato

### Convenciones de interfaz

| Elemento | Convención | Ejemplo |
|---|---|---|
| Botones de acción principal | Color azul (`primary`) | **Crear**, **Guardar cambios** |
| Botones de eliminación | Color rojo (`danger`) | **Eliminar** |
| Botones de cancelación | Color gris (`secondary`) | **Cancelar** |
| Botones de advertencia | Color amarillo (`warning`) | **Bloquear** |
| Badges de prioridad | Colores según nivel | `CRITICAL` → rojo, `HIGH` → naranja, `MEDIUM` → azul |
| Badges de estado | Colores según progreso | `COMPLETED` → verde, `IN_PROGRESS` → azul, `CANCELLED` → rojo |

### Notificaciones (Toasts)

| Tipo | Uso | Duración |
|---|---|---|
| `successToast()` | Operación completada con éxito | 3 segundos |
| `errorToast()` | Error en la operación | 3 segundos |
| `warningToast()` | Advertencia al usuario | 3 segundos |
| `infoToast()` | Información general | 3 segundos |

### Diseño responsivo

| Dispositivo | Comportamiento de navegación |
|---|---|
| **Escritorio** (≥768 px) | Barra lateral colapsable (60 px – 250 px de ancho) con transición suave |
| **Móvil** (<768 px) | Barra superior fija con menú Offcanvas deslizable desde la izquierda (75 % del ancho) |

### Rutas de la aplicación

```
/                     → Página de bienvenida (público)
/login                → Página de inicio de sesión (público)
/register             → Página de registro (público)
/oauth2-login         → Inicio de sesión OAuth2 (público)
/health               → Health check (público)

/home                 → Panel principal (autenticado)
/home/tasks           → Gestión de tareas (autenticado + feature flag)
/home/tasks/:id       → Detalle de tarea (autenticado + feature flag)
/home/calendar        → Calendario (autenticado + feature flag)
/home/lists           → Gestión de listas (autenticado + feature flag)
/home/lists/:id       → Detalle de lista (autenticado + feature flag)
/home/teams           → Gestión de equipos (autenticado + feature flag)
/home/teams/:id       → Panel de equipo (autenticado + feature flag)
/home/admin           → Panel de administración (autenticado + ADMIN)
```

### Patrones de caché

| Patrón | Implementación | Invalidación |
|---|---|---|
| Suspense Cache | Mapa en memoria (`Map`) con funciones `getSuspender()` | `invalidateXxxCache()` en operaciones de escritura |
| Redux Persist | Token JWT en `localStorage` con clave `root` | `clearToken()` al cerrar sesión |
| Theme Persist | Preferencia de tema en `localStorage` con clave `app-theme` | `toggleDarkMode()` |

---

## 6. Arquitectura del Sistema

### Estructura del proyecto

```
task-manager/
├── backend/                          # API Spring Boot
│   └── src/main/java/com/taskmanager/application/
│       ├── config/                   # Configuración (CORS, mensajes, web security)
│       ├── context/                  # Data loader (roles iniciales, usuarios por defecto)
│       ├── controller/               # Controladores REST
│       ├── model/
│       │   ├── dto/                  # Objetos de transferencia de datos
│       │   ├── entities/             # Entidades JPA
│       │   └── enums/                # Enumerados (estado, prioridad, roles)
│       ├── respository/              # Repositorios JPA
│       ├── security/                 # Filtro JWT, OAuth2 handlers
│       └── service/                  # Lógica de negocio
├── frontend/                         # Aplicación React
│   └── src/
│       ├── components/               # Componentes React
│       │   ├── adminpanel/           # Panel de administración
│       │   ├── auth/                 # Autenticación
│       │   ├── common/               # Componentes comunes
│       │   ├── lists/                # Gestión de listas
│       │   ├── session/              # Gestión de sesión
│       │   ├── Sidebar/              # Navegación lateral
│       │   ├── tasks/                # Gestión de tareas
│       │   └── teams/                # Gestión de equipos
│       ├── context/                  # Contextos React (tema)
│       ├── hooks/                    # Hooks personalizados
│       ├── pages/                    # Páginas principales
│       ├── redux/                    # Estado global (auth)
│       └── services/                 # Servicios API
├── docs/                             # Documentación
├── docker/                           # Configuración Docker
└── scripts/                          # Scripts de compilación y despliegue
```

### Flujo de autenticación

```
┌─────────────┐     POST /auth/login     ┌─────────────────┐
│   Cliente    │ ──────────────────────── │  AuthController  │
│  (React)     │                          │                  │
│              │ ◄───── JWT Token ─────── │  AuthService     │
└──────┬───────┘                          └────────┬─────────┘
       │                                           │
       │  Authorization: Bearer <token>            │ BCrypt verify
       │                                           │ JWT RS256 sign
       ▼                                           ▼
┌──────────────┐                          ┌─────────────────┐
│   API Request │ ──── JWT Filter ──────  │  JWTUtility     │
│   (cualquier) │                          │  Service        │
└──────────────┘                          └─────────────────┘
       │
       ▼ Validación exitosa
┌──────────────────┐
│  SecurityContext  │ ← UsernamePasswordAuthenticationToken
│  (autenticado)   │   con roles del usuario
└──────────────────┘
```

### Seguridad JWT

| Parámetro | Valor |
|---|---|
| Algoritmo de firma | RS256 (RSA con SHA-256) |
| Duración del token | 4 horas |
| Almacenamiento de claves | Archivos PEM (ruta configurable) |
| Cifrado de contraseñas | BCrypt con factor de coste 12 |
| Biblioteca | Nimbus JOSE + JWT |

### Configuración de CORS

| Parámetro | Valor |
|---|---|
| Orígenes permitidos | Configurado en `taskmanager.frontend.base-url` (por defecto `http://localhost:3000`) |
| Métodos permitidos | `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` |
| Cabeceras permitidas | `Origin`, `Content-Type`, `Accept`, `Authorization` |
| Credenciales | Habilitadas |
| Tiempo de caché | 3 600 segundos |

### Base de datos

| Aspecto | Detalle |
|---|---|
| Motor | SQLite |
| ORM | Hibernate (JPA) |
| Estrategia DDL | `update` (auto-migración) |
| Tablas principales | `app_user`, `task`, `list_tm`, `team`, `team_member`, `team_invitation`, `action_task`, `event_task`, `task_assignment_history`, `app_config` |

---

> **Documento generado para Task Manager v1.0.0**  
> **Última actualización:** Abril 2026
