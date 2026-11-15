# Sistema de diseño

Task Manager usa un lenguaje visual deliberadamente utilitario llamado **Control Room**: un workspace denso, dark-first, con superficies grafito frías, un único azul de señal y acentos menta para verificación. Es una herramienta, no una landing page. El sistema está implementado con Tailwind CSS v4 y un kit local adaptado de las fuentes de shadcn/ui sobre primitivas Radix.

## Principios

1. **La interfaz es una herramienta.** Primero el contenido, después el chrome. Sin hero decorativo dentro de la app autenticada.
2. **Estructura con líneas, no con sombras.** Los paneles usan borde de 1 px y superficie plana. Las sombras se reservan para overlays (diálogos, menús, sheets).
3. **El color es señal.** El azul de marca marca navegación y acciones principales. Los colores de estado aparecen solo cuando comunican algo (estado, prioridad, validación).
4. **Una superfamilia tipográfica.** IBM Plex Sans para la interfaz, IBM Plex Mono para tiempos, fechas, contadores e identificadores.
5. **Densidad con aire.** Cuerpo 14 px, controles 40 px, filas compactas, márgenes de página generosos.
6. **El movimiento responde a acciones.** Sin reveals por scroll ni bucles decorativos. Una entrada sutil para overlays y feedback de hover/press.

## Tokens

Todos los colores son variables CSS semánticas en `frontend/src/styles/theme.css`, mapeadas a Tailwind con `@theme inline`. Los componentes consumen utilidades como `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-brand`, `bg-surface-2`.

| Token | Light | Dark | Uso |
|---|---|---|---|
| `background` | `#F2F4F7` | `#080D12` | Lienzo de la app |
| `card` | `#FFFFFF` | `#0E151C` | Paneles, filas, diálogos |
| `surface-2` | `#F7F9FA` | `#131D26` | Inputs, bloques sutiles, hover |
| `surface-3` | `#EDF1F5` | `#192631` | Tracks, skeletons |
| `border` | `#DCE3EA` | `#22303C` | Hairlines |
| `foreground` | `#0F1A24` | `#E9F0F6` | Texto principal |
| `muted-foreground` | `#5A6B7B` | `#93A4B4` | Texto secundario |
| `brand` | `#2457F5` | `#4D8DFF` | Enlaces, foco, nav activa |
| `primary` | `#1B46CC` | `#1E5BFF` | Botones primarios |
| `success` | `#0E8A5F` | `#4ADE9B` | Completado, positivo |
| `warning` | `#A85A00` | `#F5B759` | Pausado, prioridad alta |
| `danger` | `#C03221` | `#F87171` | Destructivo, cancelado |
| `info` | `#0B6E8A` | `#67D4EE` | Nuevo, información neutra |

Radios: 6 px inputs/badges, 10 px botones/menús, 14 px paneles/diálogos, 18 px superficies de auth. Sombras: solo `shadow-overlay`.

## Tipografía

- **UI:** IBM Plex Sans Variable, 400/500/600.
- **Datos:** IBM Plex Mono, 400/500.
- Escala: 34 / 28 / 20 / 16 / 14 / 13 / 12 / 11 px.
- Títulos de página 28 px semibold con tracking cerrado; títulos de sección 14–16 px semibold; cuerpo 14 px; texto de ayuda 12 px; metadatos 11 px.
- Usa `font-mono` y `tabular-nums` para tiempos, fechas, contadores e IDs.

## Mapa de componentes

```
shared/ui/          Button, Badge, StatusBadge, PriorityBadge, Panel, Field,
                    Input, Textarea, Select, Checkbox, Switch, Dialog, Sheet,
                    DropdownMenu, Tabs, Tooltip, Collapsible, Table, Progress,
                    Skeleton, Avatar, Separator, Alert, Spinner, EmptyState,
                    SearchInput, MentionTextarea
shared/patterns/    PageContainer, PageHeader, CollectionPage, SearchToolbar,
                    EntityCollection, LoadMoreSentinel, EntityRow, DetailLayout,
                    StatStrip, MetadataList, ActivityTimeline
app/layout/         AppLayout, AppSidebar, SidebarContent, SidebarNavItem,
                    SidebarUserMenu, MobileHeader, MobileNav, AboutDialog
features/*/         Páginas, componentes y hooks del dominio
```

Reglas:

- `shared/ui` y `shared/patterns` no tienen lógica de dominio y nunca importan servicios, Redux, router ni features.
- Cada feature expone lo reutilizable por su `index.js`. Los imports entre features usan esa entrada pública.
- Una página compone patrones y componentes de feature. La carga de datos y el estado viven en hooks de feature.
- Usa `cn()` de `shared/lib/utils` y variantes CVA en vez de cadenas largas de clases condicionales.
- Los iconos vienen de Lucide vía `shared/lib/icons.js`; los botones solo-icono siempre llevan `aria-label`.
- Los toasts pasan únicamente por `shared/feedback/Noty.js`.

## Tema

`ThemeProvider` escribe `data-theme="light|dark"` en `<html>`. Si no hay preferencia guardada, sigue `prefers-color-scheme`; el script inline de `index.html` aplica el tema antes del primer paint para evitar el flash.

Como el tema se expresa con variables CSS, los componentes no usan variantes `dark:` para colores. Usa utilidades semánticas y el tema cambia solo. El calendario se construye con las mismas primitivas y tokens; no hay hoja de estilos de un calendario de terceros.

## Accesibilidad y movimiento

- Anillo de foco visible en todo control interactivo; no lo elimines.
- Diálogos, dropdowns y tabs usan el comportamiento de Radix: focus trap, Escape, navegación por teclado, ARIA.
- Los objetivos táctiles son de al menos 44 px en móvil.
- El estado nunca se comunica solo por color: los badges llevan texto; la fila de tarea muestra el estado con etiqueta.
- `prefers-reduced-motion` elimina las animaciones globalmente; ningún contenido depende del movimiento.
- Los errores de formulario se muestran bajo el campo con `role="alert"`; las labels siempre son visibles.

## Pantallas de colección

Tasks, Lists y Teams comparten una única receta de pantalla:

`CollectionPage` + `PageHeader` + `SearchToolbar` + `EntityCollection` + `EntityRow`

Cada feature aporta solo el contenido de su fila (`TaskRow`, `ListRow`, `TeamRow`), su estado vacío y su diálogo de formulario. Si añades una cuarta colección, reutiliza esta pila en vez de construir otra pantalla desde cero. `CollectionSkeleton` y `EmptyState` mantienen también idénticos los estados de carga y vacío.

## Pantallas de autenticación

`/`, `/login`, `/register` y `/oauth2-login` comparten `AuthLayout`. En escritorio, el panel izquierdo lleva la marca, la promesa y el mini ledger de tareas. En móvil ese panel se colapsa: la marca queda arriba sobre un grid de blueprint que se desvanece, el formulario se centra en vertical y una línea mono con copyright, versión y privacidad cierra la pantalla sobre el safe area.

## Añadir un componente

1. Comprueba si `shared/ui` o `shared/patterns` ya cubren el caso.
2. Crea un componente por archivo en la capa correcta. Usa tokens semánticos, `cn()` y CVA.
3. Mantenlo presentacional: props de entrada, markup de salida. Los datos y el estado van en un hook de feature.
4. Añade nombre accesible a los controles solo-icono y label a cada campo.
5. Si se va a reutilizar entre features, muévelo al patrón correspondiente y documéntalo aquí.
6. Añade o actualiza la cobertura de Playwright en `tests/` usando roles, labels o `data-testid`.

## Verificación

```bash
cd frontend
corepack pnpm check:architecture
corepack pnpm build
```

`check:architecture` falla si el código compartido importa features, si una feature entra en las tripas de otra, si la infraestructura importa UI o si vuelve una dependencia eliminada (Bootstrap, `react-icons`, `recharts`). `build` ejecuta el guard automáticamente.

Después ejecuta la suite E2E con backend y frontend levantados:

```bash
cd tests
mvn test -De2e.headless=true
```
