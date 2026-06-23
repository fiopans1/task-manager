# Developer guide

This page covers the day-to-day workflow: how to bring the project up, which commands to run, which conventions to follow and where to look for what. To understand the *why* of the layout see the [architecture page](/en/architecture).

## Prerequisites

- **Java 23** with a Maven toolchain.
- **Node.js 20+** with Corepack enabled (pnpm is managed through Corepack to match CI).
- **Python 3.8+** for the packaging scripts.
- **OpenSSL** to regenerate the RSA key pair on first run.

## First-time setup (once per clone)

There are three steps that the top-level README does not spell out:

1. **Generate the JWT keys.** The `application.properties` shipped in the repo points to an absolute path from the original author's machine. Generate your own pair and adjust the paths:

   ```bash
   mkdir -p backend/src/main/resources/jwtKeys
   openssl genrsa -out backend/src/main/resources/jwtKeys/private_key.pem 2048
   openssl rsa -in backend/src/main/resources/jwtKeys/private_key.pem -pubout \
     -out backend/src/main/resources/jwtKeys/public_key.pem
   ```

   Alternatively, export `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH` with your preferred paths, or use the helper `python3 scripts/bin_files/key_generator.py`.

2. **Copy the frontend configuration.** `frontend/public/config.js` is gitignored. Copy it from the template before starting Vite:

   ```bash
   cp scripts/config_templates/config.template.js frontend/public/config.js
   ```

   For development, `api.baseUrl = ''` is enough (Vite's proxy forwards to `localhost:8080`). For production, set the `baseUrl`, the `oauth2.<provider>.enabled` flags and `app.siteUrl` to your deployment.

3. **Know that the backend recreates the database on every start** (`ddl-auto=create`). If you need persistent data during development, change that property to `update` or back up `task-manager.db` before each restart.

## Folder layout (summary)

```text
task-manager/
├── backend/         # Spring Boot (Java 23, JPA, Spring Security, OAuth2)
├── frontend/        # React 18 + Vite + Redux Toolkit + react-bootstrap
├── docs/            # Bilingual VitePress (es/, en/)
├── docker/          # Dockerfile.deployment + build.sh
├── scripts/         # compile.py, templates, Python helpers
└── application/     # Old skeleton, ignore
```

Layout details on the [Architecture](/en/architecture#repository-layout) page.

## Backend

### Running locally

```bash
cd backend
./mvnw spring-boot:run
```

Starts on `http://localhost:8080`. The first start takes a few seconds while Hibernate generates the schema. Health endpoint: `GET /health`.

### Building and packaging the JAR

```bash
./mvnw clean package -DskipTests
```

The JAR ends up in `backend/target/taskmanager-<version>.jar` and runs with `java -jar`.

### Tests

```bash
./mvnw test
```

Today there is only the context-load test (`ApplicationTests#contextLoads`). When you add business logic, add JUnit + Mockito service tests in the same package.

### Java conventions

- **Root package** `com.taskmanager.application.*`. The layer is in the suffix (`controller`, `service`, `model.entities`, `model.dto`, `security`, `config`, `respository` — typo and all).
- **Lombok** is on: use `@Slf4j`, `@Data`, `@Builder` instead of writing getters/setters/loggers by hand. Don't over-rely on `@AllArgsConstructor` on JPA entities; field order affects serialization.
- **User-facing strings** go through `messageService.getMessage(...)` (the i18n abstraction). Don't hard-code literals in controllers.
- **DTOs** are the public API; never return JPA entities directly. Each DTO has `fromEntity` / `toEntity` methods when it makes sense.
- **Validation** with `jakarta.validation` (`@NotBlank`, `@NotNull`, etc.) on incoming DTOs. Dedicated `*Exception` types live in `model/exceptions`.
- **Don't introduce a new framework** (MapStruct, Reactor, ...) without a strong reason; the project runs on plain Spring Boot plus Lombok.

## Frontend

### Install and run

```bash
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm start
```

`pnpm start` runs Vite on `0.0.0.0:3000` with HMR. The `predev` and `prestart` hooks run `scripts/ensureViteInstalled.mjs`, which re-runs `pnpm install` if `node_modules/vite` is missing.

### Production build

```bash
corepack pnpm build
```

Leaves the static bundle in `frontend/build/`. Whatever ends up in that folder is what Caddy will serve from the package.

### Tests

```bash
corepack pnpm test
```

Vitest runs in a `jsdom` environment and uses `src/test/setup.js` for `@testing-library/jest-dom`. It is ready to add component and service tests; today the suite is empty.

### Linter / typecheck

There is no ESLint or TypeScript in the project yet. The quality bar is the Vite build plus human review. If you add ESLint, do it incrementally and keep `react-bootstrap` + `pnpm` as the baseline.

### Code conventions

- **React 18 with JSX** (no TypeScript). Name components in `PascalCase` and hooks in `useCamelCase`.
- **`react-bootstrap` for everything** that has an equivalent (`Modal`, `Form`, `Button`, `Tabs`, `ProgressBar`, `Toast`, ...). If a control is missing, consider adding it to `common/` before importing another library.
- **Minimal CSS**: lean on Bootstrap utility classes (`d-flex`, `gap-3`, `text-body-secondary`, `rounded-pill`, ...). Fall back to `src/styles.css` or `*.module.css` only when Bootstrap does not cover it. Don't add one-off `.css` files per component.
- **Icons**: `react-bootstrap-icons` for the core set, `bootstrap-icons` (with `bi bi-...` classes) for the rest. Don't mix in `react-icons` unless there's a real reason.
- **Dates**: `dayjs`. Avoid the native `Date` except for serialisation.
- **Global state**: Redux Toolkit only for cross-screen state (`authSlice` for now). For local UI state, use `useState`. `redux-persist` is in `package.json` but **not wired up** in the store, so don't assume state survives a reload.
- **Services**: each domain has its service (`taskService.js`, `listService.js`, `teamService.js`, `adminService.js`, `homeService.js`, `authService.js`). All API calls go through `apiClient.js` (axios with CSRF + refresh). Don't import axios directly from components.
- **i18n**: the app has **no real i18n today**. `CONTRIBUTING.md` mentions `useTranslation` and `en.json`/`es.json` but they don't exist. Keep strings inline in English; if you add i18n, do it properly (one library, not a half-baked patch).
- **SEO**: public routes use `<Seo />` from `components/common/`. Authenticated routes and the OAuth2 callback pass `noindex`. Absolute URLs come from `app.siteUrl` in `config.js` (falls back to `window.location.origin` if empty).
- **Service method signature**: return promises of DTOs, not `axios.Response`. Keep the abstraction so components don't couple to axios.

## Documentation (VitePress)

```bash
cd docs
corepack pnpm install
corepack pnpm docs:dev      # http://localhost:4173
corepack pnpm docs:build    # static site output
```

Structure:

- `docs/.vitepress/config.mts` — config with `locales.es` and `locales.en`, sidebar and nav per language.
- `docs/es/...` and `docs/en/...` — the actual content. Every user-visible change is reflected in both languages.
- `docs/CONFIGURATION.md`, `docs/DEPLOYMENT.md`, etc. — language-agnostic pages.

## Docker

The production entrypoint is `docker/Dockerfile.deployment` and the build script is `docker/build.sh`:

```bash
./docker/build.sh --platform linux/amd64
./docker/build.sh --multi                       # amd64 + arm64
./docker/build.sh --platform linux/amd64 --push --tag myuser/taskmanager:1.0
```

The build clones the repo, compiles the backend, compiles the frontend, packages with `compile.py`, and produces the final image. More options in `docker/README.md`.

`Dockerfile.build` is an older base that stayed in the repo. Don't use it unless you are editing that base.

## Classic packaging (no Docker)

To produce a `.zip` ready to upload to a VPS without containers:

```bash
cd scripts
python3 compile.py --action deploy
```

It generates `../TaskManager.zip` with:

- `bin/` — backend JAR + frontend + Caddy binaries.
- `config/` — configuration templates ready to edit.
- `lib/frontend/` — static bundle.
- `logs/`, `metadata/` — runtime directories.

`scripts/bin_files/start.py` and `stop.py` are the helpers to start and stop the package on a traditional server. `scripts/bin_files/key_generator.py` regenerates the RSA pair if you need to do so in production.

## CI

The workflow in `.github/workflows/ci.yml` runs two independent jobs on each push or PR to `main`:

- **Backend** — writes a minimal `application.properties`, generates RSA keys in a temp directory, compiles with Maven, and verifies that `/health` responds.
- **Frontend** — `pnpm install --frozen-lockfile`, `pnpm approve-builds --all`, starts `pnpm start` and checks that it responds on `:3000`.

There is no lint or typecheck yet. If you break the lockfile, the frontend job fails; keep it up to date when you add dependencies.

## Where to touch based on the change

| You want to... | Look in... |
| --- | --- |
| Change an endpoint or DTO | `backend/src/main/java/.../controller/` and `model/dto/`. |
| Change a business rule | `backend/src/main/java/.../service/`. |
| Change the data model | `backend/src/main/java/.../model/entities/`. Be careful with the migration: `ddl-auto=update` only adds columns, it doesn't drop or change types. |
| Change security, CORS, cookies | `backend/src/main/java/.../config/WebSecurityConfig.java`, `TaskManagerSecurityProperties.java`, `CsrfConfig.java`, `security/SessionCookieService.java`. |
| Add an OAuth2 provider | `backend/src/main/java/.../service/oauth2providers/`, properties `spring.security.oauth2.client.registration.<provider>.*` and `taskmanager.oauth2.<provider>.enabled`. |
| Change a screen | `frontend/src/components/<domain>/`. |
| Add a new HTTP service | Create `frontend/src/services/<domain>Service.js` following the existing pattern and use it from the component. |
| Change the HTTP client, CSRF, refresh | `frontend/src/services/apiClient.js`. |
| Change global state | `frontend/src/redux/store.js` and `slices/`. |
| Change the sidebar / routes | `frontend/src/components/Sidebar/SidebarMenu.jsx`, `frontend/src/App.jsx`. |
| Change titles and SEO | `frontend/src/components/common/Seo.jsx`, `frontend/index.html`, `frontend/public/sitemap.xml`. |
| Change user-facing copy | `docs/en` and `docs/es`. |

## Handy commands

| You need to... | Run |
| --- | --- |
| Clean the frontend build | `cd frontend && rm -rf build node_modules/.vite && pnpm install --frozen-lockfile` |
| Reset the local DB | `rm backend/task-manager.db` (regenerated on next start). |
| Tail backend logs | `tail -f backend/logs/task-manager.log` (if `log-config.xml` writes there). |
| Smoke-test the backend alone | `curl http://localhost:8080/health` |
| Smoke-test the frontend alone | Start Vite and open `http://localhost:3000`; you can't sign in without the backend, but the public page loads. |
| Inspect session cookies | DevTools → Application → Cookies. You'll see `TM-ACCESS`, `TM-REFRESH` and `XSRF-TOKEN`. |
