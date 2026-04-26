# Guía completa de CSS en Task Manager

## 1. Objetivo de esta guía

Esta guía documenta cómo se organiza y cómo conviene escribir CSS en este proyecto. También amplía la documentación técnica existente sobre estilos, que hasta ahora resumía únicamente los archivos principales.

El objetivo es que cualquier cambio visual mantenga:

- consistencia con Bootstrap 5.3
- compatibilidad con el tema claro/oscuro
- buen comportamiento responsive
- CSS fácil de mantener

## 2. Mapa actual de estilos

## 2.1 `frontend/src/index.css`

Contiene estilos globales y fundacionales:

- normalización básica del `body`
- fuente base
- fixes para Safari iOS
- control de altura mínima en `html`, `body` y `#root`
- prevención del zoom automático en inputs iOS

Úsalo para reglas globales de verdad, no para estilos de componentes concretos.

## 2.2 `frontend/src/styles.css`

Contiene estilos de aplicación y overrides controlados:

- fondos animados
- utilidades como truncado de texto
- fixes de overflow en cards
- estilos del sidebar
- ajustes mobile/desktop del layout principal
- botones flotantes
- reglas responsive más específicas

Úsalo cuando Bootstrap no cubra el caso o cuando la clase represente una pieza estable de la UI.

## 2.3 CSS de Bootstrap

Se importa en `frontend/src/index.js` y aporta:

- sistema de grid
- utilidades de spacing, flex, display, tipografía y color
- componentes base visuales
- variables y tokens visuales listos para claro/oscuro

## 3. Mejora sobre la documentación existente

La documentación técnica previa describía correctamente qué archivos CSS existen, pero era demasiado breve para orientar cambios reales. Esta guía la mejora porque añade:

- criterios de cuándo usar utilidades de Bootstrap o CSS propio
- estructura recomendada para nuevas reglas
- relación con el sistema de tema `data-bs-theme`
- enfoque responsive y mobile-first
- recomendaciones de mantenimiento y legibilidad

## 4. Principios CSS recomendados para este repositorio

## 4.1 Primero Bootstrap, después CSS propio

Orden recomendado al diseñar una pieza nueva:

1. Resolver estructura con componentes React Bootstrap.
2. Ajustar layout con utilidades Bootstrap (`d-flex`, `gap-*`, `px-*`, `text-*`, etc.).
3. Crear clase CSS propia solo si el patrón se repite o si la regla no encaja bien en utilidades.

Esto evita CSS duplicado y mantiene la interfaz alineada con el resto de la app.

## 4.2 Clases semánticas y pequeñas

Prefiere clases que describan piezas reales de la interfaz:

- `.task-card`
- `.sidebar-menu`
- `.mobile-top-bar`
- `.outlet-col`

Evita clases demasiado genéricas o acopladas a un solo parche visual si el ajuste puede resolverse con Bootstrap.

## 4.3 Mobile-first realista

El proyecto ya tiene varios ajustes específicos para móvil, así que conviene seguir este patrón:

- regla base pensada para móviles
- mejora progresiva con `@media (min-width: ...)`
- uso de `d-md-*`, `mt-md-*`, `flex-md-*` cuando baste una utilidad

## 4.4 Tema claro/oscuro compatible

El tema depende de:

- `data-bs-theme` en `document.documentElement`
- tokens y colores de Bootstrap 5.3

Por eso conviene priorizar:

- `text-body`
- `text-body-secondary`
- `bg-body-tertiary`
- `border-light-subtle`

Y conviene evitar, salvo necesidad real:

- colores hardcodeados para texto principal
- fondos fijos que rompan en modo oscuro
- bordes con poco contraste

## 4.5 CSS específico solo cuando aporte valor

Tiene sentido escribir CSS propio para:

- animaciones (`@keyframes`)
- layout complejo del sidebar
- fixes de overflow
- ajustes de altura/anchura que no existen en utilidades
- comportamiento complejo por breakpoint

No tiene sentido para cosas que ya resuelve Bootstrap, por ejemplo:

- centrar con flex
- separar con márgenes/paddings simples
- ocultar/mostrar por breakpoint
- tipografía estándar

## 5. Patrones actuales del proyecto

## 5.1 Fixes globales de iOS y viewport

`index.css` ya resuelve problemas reales de Safari iOS:

- `height: -webkit-fill-available`
- `min-height` en `body` y `#root`
- `overflow-x: hidden`
- `overscroll-behavior-y: none`
- `font-size: 16px` en inputs para evitar zoom

Estos estilos son fundacionales y no deberían moverse a CSS de componente.

## 5.2 Utilidades de dominio en `styles.css`

Ejemplos útiles ya existentes:

- `.animated-background`
- `.task-card`
- `.sidebar-menu`
- `.mobile-menu-button`
- `.main-app-row`
- `.outlet-col`

Son buenos candidatos para seguir creciendo porque representan zonas funcionales de la app.

## 5.3 Overrides dirigidos a Bootstrap

Hay reglas que modifican componentes Bootstrap concretos, por ejemplo:

- `.nav-pills .nav-link`
- `.offcanvas-header .btn-close`
- `.list-list .card-body`

Esto es correcto cuando el ajuste está acotado y el selector sigue siendo entendible.

## 6. Organización recomendada dentro de `styles.css`

Cuando añadas reglas nuevas, intenta mantener bloques como estos:

1. utilidades de aplicación
2. layout principal
3. sidebar y navegación
4. cards/listados
5. componentes móviles
6. media queries
7. animaciones

Si una sección empieza a crecer demasiado, entonces sí merece extraerse a un archivo CSS específico del dominio.

## 7. Convenciones prácticas

## 7.1 Nombres

Recomendado:
- nombres semánticos
- minúsculas
- kebab-case
- relación clara con la UI

Ejemplos recomendables:
- `.task-card-actions`
- `.team-dashboard-header`
- `.admin-panel-toolbar`

## 7.2 Especificidad

Mantén la especificidad baja.

Prefiere:
- `.sidebar-menu`
- `.task-card .card-body`

Evita, salvo necesidad:
- selectores muy profundos
- abuso de `!important`
- selectores por etiqueta si el estilo pertenece a un componente

## 7.3 Reutilización

Antes de crear una clase nueva, revisa:

- si Bootstrap ya tiene utilidad equivalente
- si existe una clase del proyecto que puedas reaprovechar
- si el estilo debería vivir en el componente mediante composición de utilidades

## 7.4 Inline styles

Úsalos solo cuando:

- el valor es dinámico
- depende de datos del componente
- no merece crear una clase reutilizable

Si el mismo estilo inline aparece varias veces, pásalo a CSS o a una utilidad Bootstrap.

## 8. Responsive: cómo decidir

## 8.1 Usa utilidades Bootstrap cuando:

- solo necesitas ocultar/mostrar
- solo necesitas cambiar márgenes o display por breakpoint
- el cambio es simple y local

Ejemplos:
- `d-none d-md-block`
- `d-flex d-md-none`
- `mt-3 mt-md-0`
- `w-100`

## 8.2 Usa media queries cuando:

- afecta a varias reglas a la vez
- el layout necesita coordinación entre clases
- hay fixes de overflow, ancho o altura
- el comportamiento no se expresa bien con utilidades sueltas

Ejemplos del repo:
- `.main-app-row`
- `.outlet-col`
- ajustes del sidebar y del top bar móvil

## 9. Tema visual y colores

Como la app soporta claro/oscuro, el CSS nuevo debería comprobar siempre:

- contraste del texto
- legibilidad de badges y bordes
- fondos de cards y contenedores
- iconos y estados hover

Buenas decisiones:
- usar tokens Bootstrap cuando existan
- dejar a Bootstrap gestionar la mayor parte del color
- reservar colores fijos para branding o acentos controlados

## 10. Riesgos comunes a evitar

1. **Duplicar Bootstrap en CSS propio.**
2. **Usar demasiados colores fijos.**
3. **Crear clases utilitarias caseras innecesarias.**
4. **Acumular reglas sin agruparlas por dominio.**
5. **Resolver responsive solo con parches tardíos.**
6. **Romper modo oscuro por usar texto/fondos absolutos.**
7. **Meter demasiada lógica visual en estilos inline.**

## 11. Checklist para cualquier cambio CSS

Antes de cerrar un cambio visual, valida:

- ¿Bootstrap ya resolvía esto?
- ¿La clase nueva tiene nombre semántico?
- ¿Se comporta bien en móvil?
- ¿Se ve bien en `data-bs-theme="dark"` y `light`?
- ¿La especificidad es razonable?
- ¿La regla pertenece a `index.css`, `styles.css` o no hace falta escribir CSS?
- ¿Hay un selector ya existente que podría reutilizarse?

## 12. Recomendación de mejora continua

La base actual es válida y funcional, pero puede mejorar si los próximos cambios siguen estas pautas:

- consolidar patrones repetidos en clases semánticas claras
- apoyar más decisiones visuales en utilidades Bootstrap y tokens de tema
- evitar nuevas reglas globales salvo necesidad real
- mantener `styles.css` ordenado por bloques funcionales

## 13. Resumen

La mejor estrategia CSS para este proyecto es híbrida:

- Bootstrap para sistema visual y utilidades
- `index.css` para base global y compatibilidad móvil
- `styles.css` para reglas propias de la aplicación

Esa combinación ya funciona en el repositorio. La mejora no pasa por reemplazarla, sino por hacerla más consistente, más predecible y mejor documentada.
