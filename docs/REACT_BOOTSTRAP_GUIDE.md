# Guía completa de React Bootstrap en Task Manager

## 1. Qué es React Bootstrap

React Bootstrap es la capa de componentes de Bootstrap para React. En lugar de construir la interfaz con HTML plano y atributos `data-*`, se trabaja con componentes como `Container`, `Row`, `Col`, `Card`, `Button`, `Modal` o `Form`, y se combinan con utilidades CSS de Bootstrap mediante `className`.

En este proyecto se usa junto con:

- `bootstrap/dist/css/bootstrap.min.css`
- `bootstrap-icons/font/bootstrap-icons.css`
- clases utilitarias de Bootstrap
- estilos propios en `frontend/src/styles.css` e `frontend/src/index.css`
- tema dinámico con `data-bs-theme="light" | "dark"`

## 2. Cómo está integrado en este repositorio

La carga base ocurre en `frontend/src/index.js`:

- se importa el CSS de Bootstrap
- se importan Bootstrap Icons
- se cargan los estilos globales del proyecto

El tema se controla en `frontend/src/context/ThemeContext.js`:

- `document.documentElement.setAttribute("data-bs-theme", theme)`
- Bootstrap adapta colores, fondos, bordes y textos automáticamente

### Regla práctica en este proyecto

- Usa **props de React Bootstrap** para comportamiento del componente (`variant`, `bg`, `pill`, `size`, `fluid`, `centered`)
- Usa **`className`** para layout, spacing, responsive y microajustes visuales
- Usa **CSS propio** solo cuando Bootstrap no cubre el caso o cuando el estilo pertenece claramente al dominio de la app

## 3. Componentes de React Bootstrap más usados aquí

## 3.1 Layout

### `Container`
Se usa para envolver páginas o bloques responsivos.

Casos típicos del proyecto:
- `Container fluid` para pantallas completas
- `Container` normal para formularios y pantallas centradas

### `Row` y `Col`
Se usan para rejillas responsivas.

Patrones habituales:
- `Row className="align-items-center"`
- `Col md={8}` / `Col md={4}`
- ocultar o mostrar columnas según breakpoint con utilidades como `d-none d-md-block`

## 3.2 Superficie y contenido

### `Card`
Muy usada para listas, estados vacíos, widgets y paneles.

Buenas combinaciones:
- `Card className="shadow-sm border-0 rounded-3"`
- `Card.Body`
- `Card.Title`, `Card.Text`, `Card.Subtitle`

### `Badge`
Se usa para estados, prioridad y contadores.

Props comunes:
- `bg="success" | "danger" | "warning" | "primary" | "secondary"`
- `pill`

## 3.3 Acciones

### `Button`
Se usa en toda la aplicación.

Props más útiles:
- `variant="primary" | "secondary" | "outline-primary" | "danger"`
- `size="sm" | "lg"`

Patrones frecuentes:
- botones con icono: `className="me-2"` en el icono
- botones full width: `className="w-100"`
- botones móviles con alto mínimo usando estilo inline o clase propia

## 3.4 Formularios

### `Form`
Se usa para login, registro, edición de tareas, listas, equipos y panel admin.

Subcomponentes habituales:
- `Form.Group`
- `Form.Label`
- `Form.Control`
- `Form.Select`
- `Form.Check`

Consejos:
- usa spacing con `mb-3`
- aprovecha `type`, `placeholder`, `value`, `onChange`
- deja la lógica de validación en React y backend; el layout en Bootstrap

## 3.5 Overlays y navegación

### `Modal`
Patrón muy repetido para crear, editar, confirmar y mostrar detalles.

Props útiles:
- `show`
- `onHide`
- `centered`
- `backdrop="static"`

Estructura típica:
- `Modal.Header closeButton`
- `Modal.Title`
- `Modal.Body`
- `Modal.Footer`

### `Offcanvas`
Ideal para navegación móvil.

En este proyecto se usa para el menú lateral en móvil.

### `Nav`, `NavLink`, `Dropdown`, `Tabs`
Se usan para navegación lateral, menús contextuales y paneles por pestañas.

## 3.6 Feedback

### `Spinner`
Se usa en cargas asíncronas y estados de espera.

### `Alert` y `Placeholder`
Aunque no son el patrón principal del repo, siguen siendo útiles para futuros estados vacíos, errores o skeletons.

## 4. Classnames de Bootstrap más útiles

Estas son las utilidades que más valor aportan en este proyecto.

## 4.1 Layout con Flex

| Clase | Uso |
|---|---|
| `d-flex` | Activa flexbox |
| `flex-column` | Apila elementos en vertical |
| `flex-wrap` | Permite salto de línea |
| `flex-grow-1` | Hace que el elemento ocupe el espacio restante |
| `flex-shrink-0` | Evita que el elemento se encoja |
| `justify-content-center` | Centra horizontalmente |
| `justify-content-between` | Separa extremos |
| `align-items-center` | Centra verticalmente |
| `align-items-start` | Alinea al inicio |
| `gap-1`, `gap-2`, `gap-3` | Espaciado entre hijos |

Útiles para:
- headers de cards
- toolbars
- listas de acciones
- modales
- sidebar y top bars

## 4.2 Spacing

| Clase | Uso |
|---|---|
| `p-0`, `p-2`, `p-3`, `p-4` | padding general |
| `px-3`, `px-4` | padding horizontal |
| `py-2`, `py-3`, `py-4`, `py-5` | padding vertical |
| `m-0` | elimina margen |
| `mb-0`, `mb-1`, `mb-2`, `mb-3`, `mb-4`, `mb-5` | margen inferior |
| `mt-1`, `mt-2`, `mt-3`, `mt-5` | margen superior |
| `me-1`, `me-2` | margen a la derecha lógica |
| `ms-1`, `ms-2`, `ms-3`, `ms-auto` | margen a la izquierda lógica |
| `mx-1` | margen horizontal |

Regla útil:
- primero intenta resolver el espaciado con utilidades
- crea CSS propio solo si el patrón se repite y ya tiene significado funcional

## 4.3 Responsive

| Clase | Uso |
|---|---|
| `d-none` | oculta el elemento |
| `d-block` | fuerza bloque |
| `d-sm-inline` | visible desde `sm` |
| `d-md-none` | oculto desde `md` |
| `d-md-block` | visible desde `md` |
| `flex-md-grow-0` | cambia comportamiento flex desde `md` |
| `mt-md-0` | elimina margen superior a partir de `md` |
| `w-100` | ancho completo |
| `h-100` | alto completo |

Muy usadas para:
- separar layouts desktop/móvil
- mostrar botones compactos en móvil y completos en escritorio
- controlar sidebars y menús

## 4.4 Texto y tipografía

| Clase | Uso |
|---|---|
| `text-center` | centra texto |
| `text-muted` | texto secundario clásico |
| `text-body` | color base del tema activo |
| `text-body-secondary` | secundario adaptado al tema |
| `text-primary`, `text-success`, `text-danger` | resaltar semánticamente |
| `text-white` | texto blanco |
| `text-decoration-none` | elimina subrayado |
| `fw-medium`, `fw-semibold`, `fw-bold` | peso tipográfico |
| `small` | texto auxiliar |
| `fs-1`, `fs-4`, `fs-5` | tamaño tipográfico |
| `text-truncate` | truncado en una línea |

## 4.5 Fondos, bordes, sombras y forma

| Clase | Uso |
|---|---|
| `bg-body-tertiary` | fondo neutro compatible con tema |
| `border` | borde base |
| `border-0` | elimina borde |
| `border-bottom` | solo borde inferior |
| `border-light-subtle` | borde suave en tema Bootstrap 5.3 |
| `rounded-3` | radio generoso |
| `rounded-pill` | forma de píldora |
| `rounded-circle` | círculo |
| `shadow-sm` | sombra ligera |

## 4.6 Posicionamiento

| Clase | Uso |
|---|---|
| `position-relative` | contexto de posicionamiento |
| `position-absolute` | posicionamiento absoluto |
| `end-0` | pegado al extremo final |
| `top-0`, `bottom-0` | pegado vertical |
| `w-100` | ancho completo |

Muy útil para badges, overlays y acciones flotantes.

## 4.7 Iconos Bootstrap

No son utilidades CSS puras, pero forman parte del flujo del proyecto.

Patrones frecuentes:
- `bi bi-pencil`
- `bi bi-trash`
- `bi bi-eye`
- `bi bi-people`
- `bi bi-shield-lock`
- `bi bi-calendar-date`

Normalmente se combinan con:
- `me-1` o `me-2`
- `fs-4` o `fs-5`
- `text-muted`, `text-primary`, etc.

## 5. Patrones reales del proyecto

## 5.1 Pantallas centradas

Patrón usado en la landing y autenticación:
- `Container fluid`
- `d-flex flex-column justify-content-center align-items-center`
- `px-3`

Sirve para pantallas full-height, centradas y responsivas.

## 5.2 Cards de listado

Patrón usado en tareas/listas:
- `Card className="mb-3 shadow-sm task-card"`
- títulos con `text-truncate`
- filas con `d-flex align-items-center`
- badges con `pill`

## 5.3 Desktop y móvil en paralelo

Patrón común:
- bloque móvil: `d-flex d-md-none`
- bloque escritorio: `d-none d-md-block`

Esto permite mantener una UX adaptada sin duplicar pantallas enteras.

## 5.4 Sidebar y navegación

Combinación típica:
- `Nav className="nav-pills flex-column"`
- enlaces con `d-flex align-items-center`
- iconos con `fs-4`
- separación con `ms-2`, `ms-3`, `me-2`

## 6. Cuándo usar props y cuándo usar className

### Prefiere props de componente para:
- `variant`
- `bg`
- `pill`
- `size`
- `fluid`
- `centered`
- `backdrop`
- breakpoints del grid (`md={4}`, `lg={6}`)

### Prefiere `className` para:
- espaciado
- alineación
- display
- responsive helpers
- sombras, radios y utilidades de texto
- composición rápida entre varios componentes

### Prefiere CSS propio para:
- animaciones
- reglas complejas de responsive
- overrides repetidos del sidebar, cards o layout principal
- estilos de dominio como `.task-card`, `.sidebar-menu`, `.mobile-top-bar`

## 7. Buenas prácticas recomendadas

1. **No sobreescribas Bootstrap sin necesidad.** Primero prueba utilidades y props.
2. **Mantén las clases semánticas del proyecto pequeñas.** Que representen piezas reales de la app.
3. **Apóyate en el tema de Bootstrap 5.3.** Usa `text-body`, `bg-body-tertiary`, `border-light-subtle` antes de fijar colores duros.
4. **Combina utilidades con moderación.** Si una cadena `className` empieza a ser difícil de leer, extrae una clase propia.
5. **Cuida móvil primero.** El repo tiene varios ajustes específicos para móvil y iOS.
6. **Usa iconos con spacing lógico.** `me-*` y `ms-*` ayudan a mantener consistencia.
7. **Evita estilos inline salvo para excepciones.** Úsalos solo si el valor depende claramente del contexto local.

## 8. Checklist rápido para nuevos componentes

Antes de dar por bueno un componente nuevo, revisa:

- ¿Se puede resolver con un componente de React Bootstrap ya existente?
- ¿El layout usa `Container`, `Row`, `Col` o `d-flex` de forma simple?
- ¿El spacing se resolvió con utilidades en vez de CSS extra?
- ¿La UI se adapta bien a móvil con `d-*`, `w-100`, `mt-md-*`, etc.?
- ¿Los colores respetan `data-bs-theme`?
- ¿Los iconos y badges mantienen consistencia visual con el resto del proyecto?

## 9. Resumen

En este repositorio, React Bootstrap no se usa solo como librería de componentes: es la base del sistema visual. La combinación correcta es:

- componentes de React Bootstrap
- utilidades `className` de Bootstrap
- un pequeño conjunto de clases propias del proyecto
- theming con `data-bs-theme`

Si se sigue esa combinación, la UI queda más consistente, más rápida de construir y más fácil de mantener.
