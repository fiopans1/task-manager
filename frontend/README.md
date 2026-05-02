# Frontend Task Manager

El frontend usa Vite con React y pnpm.

## Primer arranque

Desde `frontend/` instala primero las dependencias:

```bash
corepack pnpm install
```

Si `vite` todavía no está instalado, `pnpm run dev` y `pnpm start` ejecutan automáticamente `pnpm install --frozen-lockfile` antes de arrancar.

## Scripts disponibles

Desde `frontend/` puedes ejecutar:

### `pnpm run dev`

Inicia el servidor de desarrollo de Vite en [http://localhost:3000](http://localhost:3000).

### `pnpm start`

Inicia el servidor de desarrollo de Vite escuchando en `0.0.0.0:3000`.

### `pnpm run build`

Genera la versión de producción en `build/`.

### `pnpm test`

Ejecuta los tests con Vitest y finaliza correctamente aunque todavía no existan tests.

### `pnpm run test:watch`

Lanza Vitest en modo watch.

### `pnpm run preview`

Sirve localmente la build generada en el puerto 3000.
