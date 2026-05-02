# Frontend Task Manager

El frontend usa Vite con React y pnpm.

## Primer arranque

En `/home/runner/work/task-manager/task-manager/frontend` instala primero las dependencias:

```bash
corepack pnpm install
```

Si ejecutas `pnpm run dev` o `pnpm start` sin haber instalado antes, verás `sh: vite: not found` porque `vite` se instala desde las `devDependencies`.

## Scripts disponibles

En `/home/runner/work/task-manager/task-manager/frontend` puedes ejecutar:

### `pnpm run dev`

Inicia el servidor de desarrollo de Vite en [http://localhost:3000](http://localhost:3000).

### `pnpm start`

Alias de `pnpm run dev`.

### `pnpm run build`

Genera la versión de producción en `build/`.

### `pnpm test`

Ejecuta los tests con Vitest y finaliza correctamente aunque todavía no existan tests.

### `pnpm run test:watch`

Lanza Vitest en modo watch.

### `pnpm run preview`

Sirve localmente la build generada en el puerto 3000.
