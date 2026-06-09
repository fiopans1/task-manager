# Guía de usuario

## Autenticación y acceso

Task Manager permite dos formas principales de acceso:

- **autenticación local** con nombre de usuario y contraseña,
- **autenticación OAuth2** mediante Google, GitHub o Authentik cuando el sistema lo tenga habilitado.

Al iniciar sesión correctamente, el backend crea una sesión segura basada en cookies:

- una cookie `HttpOnly` para el acceso,
- una cookie `HttpOnly` para el refresh,
- una cookie CSRF legible por el navegador para proteger operaciones de escritura.

El frontend no necesita leer el token de acceso desde JavaScript. En su lugar, consulta la sesión actual y adjunta automáticamente la protección CSRF cuando crea, edita o elimina datos.

### Qué cambia para el usuario

- La sesión puede renovarse automáticamente mientras la cookie de refresh siga siendo válida.
- Si la sesión expira, la aplicación te pedirá volver a autenticarte.
- Al cerrar sesión, el sistema invalida la sesión activa y limpia las cookies de autenticación.

## Qué puedes hacer como usuario

### Panel principal

El panel principal resume el estado general de tu actividad. Es el mejor punto de entrada para revisar tareas pendientes, actividad reciente y accesos rápidos a las secciones clave.

### Gestión de tareas

Las tareas son el núcleo de la aplicación. Cada tarea puede incluir:

- nombre o título,
- prioridad,
- estado,
- fechas de inicio y fin,
- comentarios y trazabilidad de acciones,
- relación con una lista o un equipo.

Flujo recomendado:

1. Crea la tarea.
2. Define prioridad y estado.
3. Añade contexto suficiente para quien vaya a ejecutarla.
4. Actualiza su estado a medida que avance.

### Listas

Las listas ayudan a organizar grupos de tareas por proyecto, área o contexto. Son especialmente útiles cuando necesitas ver trabajo relacionado sin mezclarlo con el resto del backlog personal o del equipo.

### Calendario

La vista de calendario permite planificar trabajo con fechas concretas. Es útil para seguimiento semanal, revisiones, entregas o cualquier tarea que deba verse en contexto temporal.

### Equipos

Los equipos permiten colaboración estructurada:

- invitar usuarios,
- compartir visibilidad de tareas,
- asignar responsabilidades,
- separar permisos entre administración y participación ordinaria.

## Roles y permisos

### Rol del sistema

- **BASIC**: usuario estándar con uso normal de la aplicación.
- **ADMIN**: acceso a funciones de administración global.

### Rol dentro del equipo

Los equipos disponen de roles propios para separar la administración del equipo del trabajo operativo diario.

## Funciones de administración

Si tu cuenta tiene permisos de administrador, podrás trabajar con:

- gestión de usuarios,
- mensajes del sistema,
- ajustes administrativos y feature flags.

Estas funciones están pensadas para operación y soporte, no para el flujo diario de trabajo de un usuario estándar.

## Buenas prácticas de uso

- Mantén estados y prioridades actualizados.
- Usa listas cuando un conjunto de tareas comparta propósito.
- Programa eventos cuando la fecha sea tan importante como el contenido.
- Separa el trabajo personal del trabajo de equipo para mantener visibilidad.
- Si usas OAuth2, verifica que el navegador permita las redirecciones y cookies del entorno donde trabajas.
