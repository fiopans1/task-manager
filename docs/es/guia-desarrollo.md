# Guía de desarrollo

Esta página cubre el flujo del día a día: cómo se levanta el proyecto, qué comandos se usan, qué convenciones respetar y dónde tocar según lo que quieras cambiar. Para entender el *por qué* de la estructura mira la [página de arquitectura](/es/arquitectura).

## Prerrequisitos

- **Java 23** con toolchain de Maven.
- **Node.js 20+** con Corepack habilitado (pnpm se gestiona desde Corepack para coincidir con la CI).
- **Python 3.8+** para los scripts de empaquetado.
- **OpenSSL** para regenerar el par de claves RSA en la primera ejecución.

## Preparación inicial (una vez por clon)

Hay tres pasos que la primera vez no son obvios y que el README general no detalla:

1. **Generar las claves JWT.** El `application.properties` que viene en el repo apunta a una ruta absoluta del equipo original. Genera tu propio par y ajusta las rutas:

   ```bash
   mkdir -p backend/src/main/resources/jwtKeys
   openssl genrsa -out backend/src/main/resources/jwtKeys/private_key.pem 2048
   openssl rsa -in backend/src/main/resources/jwtKeys/private_key.pem -pubout \
     -out backend/src/main/resources/jwtKeys/public_key.pem
   ```

   También puedes exportar `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH` con la ruta que prefieras, o usar el helper `python3 scripts/bin_files/key_generator.py`.

2. **Copiar la configuración de frontend.** `frontend/public/config.js` está gitignorado. Cópialo de la plantilla antes de arrancar Vite:

   ```bash
   cp scripts/config_templates/config.template.js frontend/public/config.js
   ```

   Para desarrollo basta con `api.baseUrl = ''` (el proxy de Vite redirige a `localhost:8080`). Para producción ajusta el `baseUrl`, los `oauth2.<provider>.enabled` y `app.siteUrl` a tu despliegue.

3. **Saber que el backend recrea la BD en cada arranque** (`ddl-auto=create`). Si necesitas datos persistentes durante el desarrollo, cambia esa propiedad a `update` o haz copia de `task-manager.db` antes de cada reinicio.

## Estructura de carpetas (resumen)

```text
task-manager/
├── backend/         # Spring Boot (Java 23, JPA, Spring Security, OAuth2)
├── frontend/        # React 18 + Vite + Redux Toolkit + react-bootstrap
├── docs/            # VitePress bilingüe (es/, en/)
├── docker/          # Dockerfile.deployment + build.sh
├── scripts/         # compile.py, plantillas, helpers Python
└── application/     # Esqueleto viejo, ignorar
```

Detalles del layout en [Arquitectura](/es/arquitectura#layout-del-repositorio).

## Backend

### Arrancar en local

```bash
cd backend
./mvnw spring-boot:run
```

Arranca en `http://localhost:8080`. La primera vez tarda unos segundos mientras Hibernate genera el esquema. Endpoint de health: `GET /health`.

### Compilar y empaquetar JAR

```bash
./mvnw clean package -DskipTests
```

El JAR queda en `backend/target/taskmanager-<version>.jar` y se ejecuta con `java -jar`.

### Tests

```bash
./mvnw test
```

Hoy solo hay un test de carga de contexto (`ApplicationTests#contextLoads`). Cuando añadas lógica de negocio, sube tests de servicio con JUnit y Mockito siguiendo el mismo paquete.

### Convenciones Java

- **Paquete raíz** `com.taskmanager.application.*`. La capa está en el sufijo (`controller`, `service`, `model.entities`, `model.dto`, `security`, `config`, `respository` — con la errata).
- **Lombok** está activo: usa `@Slf4j`, `@Data`, `@Builder` en lugar de escribir getters/setters/loggers a mano. No abuses de `@AllArgsConstructor` en entidades JPA; el orden de los campos afecta a la serialización.
- **Strings visibles al usuario** van por `messageService.getMessage(...)` (abstracción de i18n). No metas literales en los controladores.
- **DTOs** son la API pública; nunca devuelvas entidades JPA directamente. Cada DTO tiene métodos `fromEntity` / `toEntity` cuando tiene sentido.
- **Validación** con `jakarta.validation` (`@NotBlank`, `@NotNull`, etc.) sobre los DTOs de entrada. Los `*Exception` dedicados viven en `model/exceptions`.
- **No introduzcas un framework nuevo** (MapStruct, Reactor, etc.) sin justificarlo; el proyecto va con Spring Boot estándar y Lombok.

## Frontend

### Instalar y arrancar

```bash
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm start
```

`pnpm start` ejecuta Vite en `0.0.0.0:3000` con HMR. Los hooks `predev` y `prestart` ejecutan `scripts/ensureViteInstalled.mjs`, que vuelve a correr `pnpm install` si `node_modules/vite` no está.

### Build de producción

```bash
corepack pnpm build
```

Deja el bundle estático en `frontend/build/`. Lo que termine en esa carpeta es lo que se sirve desde Caddy en el paquete.

### Tests

```bash
corepack pnpm test
```

Vitest corre en entorno `jsdom` y usa `src/test/setup.js` para `@testing-library/jest-dom`. Está pensado para añadir tests de componentes y servicios; hoy la suite está vacía.

### Linter / typecheck

No hay ESLint ni TypeScript en el proyecto todavía. La barrera de calidad es el build de Vite y la revisión humana. Si quieres añadir ESLint, hazlo de forma incremental y respetando `react-bootstrap` + `pnpm`.

### Convenciones de código

- **React 18 con JSX** (sin TypeScript). Nombra los componentes en `PascalCase` y los hooks en `useCamelCase`.
- **`react-bootstrap` para todo** lo que tenga equivalente (`Modal`, `Form`, `Button`, `Tabs`, `ProgressBar`, `Toast`, ...). Si necesitas un control que no exista, plantéate añadirlo en `common/` antes que importar otra librería.
- **CSS mínimo**: usa clases utility de Bootstrap (`d-flex`, `gap-3`, `text-body-secondary`, `rounded-pill`, ...). Solo recurre a `src/styles.css` o a `*.module.css` cuando Bootstrap no llegue. No crees ficheros `.css` sueltos para componentes concretos.
- **Iconos**: `react-bootstrap-icons` para iconos del core y `bootstrap-icons` (con clases `bi bi-...`) para el resto. No mezcles con `react-icons` si no hace falta.
- **Fechas**: `dayjs`. Evita `Date` nativa salvo para serializar.
- **Estado global**: Redux Toolkit solo para cosas que cruzan pantallas (`authSlice` por ahora). Para estado local de UI usa `useState`. `redux-persist` está en `package.json` pero **no está cableado** en el store, no des por hecho que el estado sobrevive recargas.
- **Servicios**: cada dominio tiene su servicio (`taskService.js`, `listService.js`, `teamService.js`, `adminService.js`, `homeService.js`, `authService.js`). Toda llamada a la API pasa por `apiClient.js` (axios con CSRF + refresh). No importes axios directamente en componentes.
- **i18n**: la app **no tiene** i18n real hoy. `CONTRIBUTING.md` menciona `useTranslation` y `en.json`/`es.json` pero no existen. Mantén los textos en inglés inline; si añades i18n, hazlo bien (una librería, no un patch a medias).
- **SEO**: las rutas públicas usan `<Seo />` de `components/common/`. Las autenticadas y la callback de OAuth2 pasan `noindex`. URLs absolutas vía `app.siteUrl` en `config.js` (cae a `window.location.origin` si está vacío).
- **Firma de los métodos de servicio**: devuelven promesas de DTOs, no `axios.Response`. Mantén la abstracción para no acoplar componentes a axios.

## Documentación (VitePress)

```bash
cd docs
corepack pnpm install
corepack pnpm docs:dev      # http://localhost:4173
corepack pnpm docs:build    # genera el sitio estático
```

Estructura:

- `docs/.vitepress/config.mts` — configuración con `locales.es` y `locales.en`, sidebar y nav por idioma.
- `docs/es/...` y `docs/en/...` — el contenido propiamente dicho. Cada cambio visible al usuario se refleja en ambos idiomas.
- `docs/CONFIGURATION.md`, `docs/DEPLOYMENT.md`, etc. — páginas comunes que no son por idioma.

## Docker

El entrypoint de producción es `docker/Dockerfile.deployment` y el script que lo construye es `docker/build.sh`:

```bash
./docker/build.sh --platform linux/amd64
./docker/build.sh --multi                       # amd64 + arm64
./docker/build.sh --platform linux/amd64 --push --tag miusuario/taskmanager:1.0
```

El build clona el repo, compila backend, compila frontend, empaqueta con `compile.py`, y produce la imagen final. Más opciones en `docker/README.md`.

`Dockerfile.build` es una versión antigua que se quedó en el repo. No lo uses salvo que estés editando esa línea base.

## Empaquetado clásico (sin Docker)

Para producir un `.zip` listo para subir a un VPS sin contenedor:

```bash
cd scripts
python3 compile.py --action deploy
```

Genera `../TaskManager.zip` con:

- `bin/` — backend JAR + frontend + binarios de Caddy.
- `config/` — plantillas de configuración listas para editar.
- `lib/frontend/` — bundle estático.
- `logs/`, `metadata/` — directorios de runtime.

`scripts/bin_files/start.py` y `stop.py` son los helpers para arrancar y parar el paquete en un servidor tradicional. `scripts/bin_files/key_generator.py` regenera el par RSA si lo necesitas en producción.

## CI

El workflow en `.github/workflows/ci.yml` corre dos jobs independientes en cada push o PR a `main`:

- **Backend** — escribe un `application.properties` mínimo, genera claves RSA en una carpeta temporal, compila con Maven y verifica que `/health` responda.
- **Frontend** — `pnpm install --frozen-lockfile`, `pnpm approve-builds --all`, arranca `pnpm start` y comprueba que responda en `:3000`.

No hay lint ni typecheck todavía. Si rompes el lockfile, el job de frontend falla; mantenlo actualizado cuando añadas dependencias.

## Dónde tocar según lo que cambies

| Quieres... | Mira en... |
| --- | --- |
| Cambiar un endpoint o un DTO | `backend/src/main/java/.../controller/` y `model/dto/`. |
| Cambiar una regla de negocio | `backend/src/main/java/.../service/`. |
| Cambiar el modelo de datos | `backend/src/main/java/.../model/entities/`. Cuidado con la migración: `ddl-auto=update` solo añade columnas, no las borra ni cambia tipos. |
| Cambiar la seguridad, CORS, cookies | `backend/src/main/java/.../config/WebSecurityConfig.java`, `TaskManagerSecurityProperties.java`, `CsrfConfig.java`, `security/SessionCookieService.java`. |
| Añadir un proveedor OAuth2 | `backend/src/main/java/.../service/oauth2providers/`, propiedades `spring.security.oauth2.client.registration.<provider>.*` y `taskmanager.oauth2.<provider>.enabled`. |
| Cambiar una pantalla | `frontend/src/components/<dominio>/`. |
| Añadir un nuevo servicio HTTP | Crea `frontend/src/services/<dominio>Service.js` siguiendo el patrón de los existentes y úsalo desde el componente. |
| Cambiar el cliente HTTP, CSRF, refresh | `frontend/src/services/apiClient.js`. |
| Cambiar el estado global | `frontend/src/redux/store.js` y `slices/`. |
| Cambiar la barra lateral / rutas | `frontend/src/components/Sidebar/SidebarMenu.jsx`, `frontend/src/App.jsx`. |
| Cambiar títulos y SEO | `frontend/src/components/common/Seo.jsx`, `frontend/index.html`, `frontend/public/sitemap.xml`. |
| Cambiar textos para el usuario final | `docs/en` y `docs/es`. |

## Atajos y comandos útiles

| Necesitas... | Ejecuta |
| --- | --- |
| Limpiar build de frontend | `cd frontend && rm -rf build node_modules/.vite && pnpm install --frozen-lockfile` |
| Resetear la BD local | `rm backend/task-manager.db` (se regenera al arrancar). |
| Ver logs del backend en vivo | `tail -f backend/logs/task-manager.log` (si `log-config.xml` los escribe ahí). |
| Probar el backend sin frontend | `curl http://localhost:8080/health` |
| Probar el frontend sin backend | Inicia Vite y abre `http://localhost:3000`; sin backend no podrás iniciar sesión, pero la página pública carga. |
| Inspeccionar las cookies de sesión | DevTools → Application → Cookies. Verás `TM-ACCESS`, `TM-REFRESH` y `XSRF-TOKEN`. |
