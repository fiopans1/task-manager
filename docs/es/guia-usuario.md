# Guía de usuario

Task Manager reúne en un mismo sitio tus tareas, tus listas, tu calendario y tus equipos. Esta guía explica qué hace cada apartado y cómo sacarle partido sin entrar en tecnicismos.

## Antes de empezar: tu cuenta

### Crear una cuenta

Si todavía no tienes cuenta, pulsa **Create account** en la pantalla inicial. Te pedirá:

- Nombre y dos apellidos (el segundo apellido es opcional).
- Un **nombre de usuario** único, que usarás para iniciar sesión y que tu equipo verá cuando te invite a algo.
- Un **correo electrónico** válido.
- Una **contraseña** que escribes dos veces para confirmarla.

Cuando completes el formulario, la cuenta queda lista y entras directamente al panel.

### Iniciar sesión

En la pantalla de inicio pulsa **Sign in** y escribe tu nombre de usuario y contraseña. Si tu organización tiene activado el acceso con Google, GitHub o Authentik, verás un botón **Continue with SSO** que te lleva al proveedor para autenticarte con tu cuenta de allí.

### ¿Cuándo se cierra la sesión?

Tu sesión caduca automáticamente cuando pasan unos minutos sin actividad (por defecto, 10). Cuando eso ocurre, aparece una ventana con cuenta atrás de 60 segundos: si tocas algo, la sesión se reactiva; si no, se cierra y vuelves a la pantalla de inicio. También puedes cerrarla manualmente desde el menú de tu avatar, abajo a la izquierda, con **Log Out**.

### Cambiar entre tema claro y oscuro

En el mismo menú del avatar, arriba del todo, hay un interruptor **Dark Mode**. La elección se queda guardada en tu navegador.

## El panel principal

Al iniciar sesión aterrizas en **Dashboard** (`/home`). Es la vista de conjunto y tiene cinco bloques:

1. **Accesos rápidos** — cuatro tarjetas grandes (My Tasks, Calendar, Lists, Teams) que te llevan a la sección correspondiente con un clic. Si una sección está desactivada por la administración, su tarjeta no aparece.
2. **Tus números** — total de tareas creadas, listas que tienes y eventos próximos en el calendario.
3. **Progreso reciente** — una barra con cuántas de tus últimas tareas están completadas frente al total.
4. **Tareas recientes** — las últimas tareas que has creado, con su estado y la fecha. Pulsa cualquiera para abrirla, o **View all** para ir a la sección completa.
5. **Próximos eventos** — tareas que son eventos del calendario, ordenadas por fecha de inicio. Te lleva al calendario si pulsas **View calendar**.

## Tareas

Una tarea es la unidad mínima de trabajo. Tiene nombre, descripción, estado, prioridad y, opcionalmente, fechas de inicio y fin, además de poder asociarse a una lista y a un equipo.

### Estados y prioridades

Cada tarea tiene un **estado** que indica en qué punto del trabajo está:

- **New** — recién creada, todavía sin empezar.
- **In Progress** — la estás haciendo.
- **Paused** — la dejaste a medias temporalmente.
- **Completed** — terminada.
- **Cancelled** — descartada.

Y una **prioridad** que marca la urgencia:

- **Critical** — requiere atención inmediata.
- **High** — importante, hazla pronto.
- **Medium** — ritmo normal.
- **Low** — cuando puedas.
- **Min** — sin prisa.

### Crear una tarea

1. En la barra lateral pulsa **My Tasks** y luego **New Task** arriba a la derecha.
2. Escribe un nombre (obligatorio) y, si quieres, una descripción más larga.
3. Elige estado y prioridad.
4. Si la tarea tiene día y hora concretos (una reunión, una entrega, un bloque de trabajo), marca **This task is an event** y rellena fecha y hora de inicio y fin. La tarea aparecerá entonces en el calendario.
5. Guarda.

Si la tarea no es un evento pero quieres ver su progreso, deja la casilla desactivada: solo mostrará su estado.

### Buscar, refrescar y limpiar

En la parte de arriba de la lista tienes una caja de búsqueda. Escribe parte del nombre y pulsa **Search** para filtrar; **Clear** borra el filtro y **Refresh** recarga desde el servidor. La lista se carga en bloques de 50 y, al hacer scroll, va pidiendo más sin que tengas que cambiar de página.

### Abrir, editar y borrar

- Pulsa una tarea para abrir su **detalle** (vista completa con su información y sus comentarios).
- En la lista, usa el botón de editar para modificar nombre, descripción, estado, prioridad o fechas. Lo que cambies se guarda al pulsar **Save**.
- Para borrarla, usa el botón de papelera. Te pedirá confirmación porque no se puede deshacer.

### Comentarios e historial de acciones

Dentro del detalle de una tarea puedes añadir **acciones** (comentarios o anotaciones). Cada acción guarda quién la escribió, cuándo y el tipo. Si la tarea es de equipo, las acciones se ven también por el resto del equipo. Desde la propia tarea puedes:

- Añadir un comentario con título, descripción y tipo.
- Editar o borrar comentarios propios.
- Reordenar o consultar la cronología completa.

### Convertir una tarea en evento (o al revés)

Una tarea normal no tiene fechas; si la editas y marcas **This task is an event**, le pones fecha de inicio y fin y pasa a aparecer en el calendario. Si desmarcas la casilla en la edición, las fechas se quitan y vuelve a ser una tarea sin horario.

## Listas

Las listas agrupan tareas que comparten un tema, un proyecto o un área. Cada lista tiene un nombre, una descripción y un color que la identifica visualmente. La barra de progreso de la lista te dice cuántas tareas tiene y cuántas están completadas.

### Crear y editar listas

Desde **Lists** en la barra lateral, pulsa **New List**. Solo el nombre y el color son obligatorios. La descripción es opcional pero útil cuando la lista la ven varias personas. Una vez creada, puedes cambiar cualquier campo con el botón de edición.

### El detalle de una lista

Al abrir una lista ves, en la parte de arriba, su cabecera con nombre, descripción, color y totales; debajo, las tareas que contiene. Desde el detalle puedes:

- **Añadir tareas existentes** con el botón de añadir. Aparece un selector con las tareas que tienes pero todavía no están en ninguna lista, así que no se duplican.
- **Quitar una tarea de la lista** con el botón de papelera junto a la tarea. La tarea no se borra, solo deja de pertenecer a esa lista.
- **Buscar** dentro de las tareas de la lista con la caja de búsqueda superior.
- **Volver** a la vista general con la flecha de atrás.

El progreso (tareas completadas frente al total) se actualiza automáticamente y se muestra como una barra.

### Una tarea puede estar en una sola lista

Si añades una tarea a otra lista, la primera se desvincula. Si prefieres que la tarea esté solo en tu backlog sin lista, no la asignes a ninguna.

## Calendario

El calendario muestra todas las tareas que son eventos (es decir, que tienen fecha de inicio y de fin). Está dentro de **Calendar** en la barra lateral.

### Vistas disponibles

Tienes tres vistas: **Month**, **Week** y **Day**. Cambias con los botones de la esquina superior derecha. Los botones **Prev / Today / Next** se mueven por la fecha actual.

### Qué significa cada color

El calendario pinta los eventos según una categoría que la tarea lleva asociada:

- **Work** (azul) — trabajo habitual.
- **Personal** (cian) — cosas personales.
- **Urgent** (rosa) — para lo que no puede esperar.
- **General** (morado) — el resto.

Pulsa un evento para abrir la tarea y editarla (cambiar la categoría, moverla de hora, etc.).

## Equipos

Los equipos sirven para trabajar con otras personas: asignarles tareas, ver el progreso del grupo, dejar comentarios cruzados y tener un historial de quién hizo qué.

### Crear un equipo

Pulsa **Teams** en la barra lateral y luego **New Team**. Solo el nombre es obligatorio; la descripción es opcional. La persona que crea el equipo queda como **Admin** automáticamente.

### Roles dentro de un equipo

Hay dos roles posibles:

- **Admin** — puede invitar gente, expulsar miembros, cambiar el rol de otros, asignar tareas, aceptar o cancelar invitaciones y borrar el equipo.
- **Member** — ve las tareas del equipo, puede reasignar solo sus tareas y comentar.

### Invitar a alguien

Si eres admin, dentro del equipo pulsa **Invite**, escribe el nombre de usuario de la persona y envía. La persona recibe la invitación en su panel de **Teams** (arriba aparece como pendiente). Puede aceptarla o rechazarla; si la acepta, pasa a ser **Member** y puede ser ascendida a **Admin** después.

Si te arrepientes o invitaste a la persona equivocada, en la pestaña **Invitations** del propio equipo puedes cancelar la invitación antes de que se responda.

### Aceptar o rechazar una invitación

Cuando alguien te invite, ve a **Teams**. Verás la invitación pendiente con el nombre del equipo y de quien te invitó. Pulsa **Accept** para entrar al equipo o **Reject** para descartarla. Si la aceptas, el equipo aparece en tu lista y el equipo lo ve como nuevo miembro.

### El panel del equipo

Al abrir un equipo tienes cuatro pestañas:

- **Dashboard** — los números globales (total de tareas, completadas, en curso, pendientes), el porcentaje de progreso del equipo, la carga de trabajo por miembro (una barra por persona según las tareas pendientes que tiene) y la lista de miembros con sus roles.
- **Tasks** — todas las tareas del equipo. Puedes filtrar por miembro, por estado y por prioridad; los filtros se combinan. Si eres admin, junto a cada tarea hay un botón para reasignarla a otro miembro. Pulsa el nombre de la tarea para abrir su detalle.
- **History** — solo admins. Es el registro cronológico de reasignaciones: qué tarea cambió de responsable, quién la tenía, quién la recibe, quién hizo el cambio y cuándo.
- **Invitations** — solo admins. Las invitaciones pendientes con su fecha y quien las envió. Puedes cancelarlas.

### Tareas dentro de un equipo

Una tarea de equipo se distingue porque en su detalle aparece a qué equipo pertenece. Desde el panel del equipo puedes:

- **Añadir tareas** que ya tengas creadas (las que no estén en otro equipo) con el botón **Add Task**.
- **Reasignar** cualquier tarea a otro miembro, indicando a quién.
- **Dejar el equipo** con **Leave** (si no eres admin). Tus tareas personales se quedan contigo, pero dejan de contar para el equipo.

### Comportamientos importantes

- Al **borrar un equipo**, las tareas que estaban asignadas al equipo se mantienen en la cuenta de sus dueños; lo que desaparece es la pertenencia al equipo.
- Al **salir de un equipo**, tus tareas asignadas se desvinculan del equipo pero no se borran.
- Al **expulsar a un miembro**, las tareas que tenía asignadas quedan sin dueño dentro del equipo.

## Administración (solo ADMIN)

Si tu cuenta tiene el rol **ADMIN**, en la barra lateral aparece **Admin Panel**. Tiene tres pestañas:

### Users

Aquí ves el listado de todos los usuarios de la aplicación. Puedes:

- **Buscar** por nombre de usuario, nombre, apellido o correo.
- **Abrir la ficha** de cualquier usuario para ver sus tareas, listas y equipos en pestañas separadas. Desde la ficha también puedes editar o borrar cualquiera de sus elementos.
- **Bloquear o desbloquear** a un usuario. Un usuario bloqueado no puede iniciar sesión hasta que lo desbloquees.

### Features

Permite activar o desactivar las cuatro secciones de la barra lateral — **My Tasks**, **Calendar**, **Lists** y **Teams** — para todos los usuarios a la vez. Los cambios se aplican la próxima vez que cada usuario recargue. Útil para desplegar el producto por etapas o durante un mantenimiento.

### System Message

Configura un mensaje institucional que se muestra a los usuarios. Puedes:

- Escribir el texto (admite varias líneas).
- Activarlo o desactivarlo.
- Elegir si se muestra **antes de iniciar sesión** (en la página pública), **después de iniciar sesión** (dentro de la app), o ambos.

Sirve para anunciar mantenimientos, novedades o políticas de uso.

## Buenas prácticas

- **Nombra las tareas por la acción**, no por el tema: *"Migrar la base de datos a PostgreSQL"* en vez de *"Base de datos"*. Te ahorra abrir la tarea para saber qué es.
- **Usa la prioridad con cabeza.** Si todo es Critical, nada lo es. Reserva Critical para lo que de verdad bloquea a alguien.
- **Convierte en evento solo lo que tiene hora.** Una tarea de fondo no necesita aparecer en el calendario; ahí solo deberías ver cosas con fecha y hora concretas.
- **Empieza por listas, no por tareas sueltas.** Crear la lista con nombre y descripción cuesta un minuto y luego todo lo que añades a ella queda organizado.
- **Asigna pronto en los equipos.** Una tarea sin dueño dentro de un equipo se queda sin hacer. Reasigna en cuanto veas que alguien tiene hueco.
- **Revisa el historial de reasignaciones** cuando algo no se haya hecho: te dice exactamente cuándo cambió de responsable.
