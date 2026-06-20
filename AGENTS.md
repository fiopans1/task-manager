# AGENTS.md

Repository: `task-manager` — a self-hosted full-stack task management app.
Layout: `backend/` (Spring Boot), `frontend/` (React + Vite), `docs/` (VitePress bilingual), `docker/` (build + deploy), `scripts/` (Python packaging + bin helpers), `application/` (legacy Spring Boot skeleton, not the active backend — ignore unless asked).

## Hard rules

- **Frontend: always use `react-bootstrap`** (already a dep). Use Bootstrap utility classes for layout. Keep custom CSS minimal; reach for `frontend/src/styles.css` or component-level `*.module.css` only when no Bootstrap class exists. Do not add new CSS files for things Bootstrap already covers.
- **Frontend package manager: `pnpm` only**, invoked through Corepack (`corepack pnpm ...`). Never use `npm install` / `yarn`.
- Never commit secrets: OAuth2 client secrets, JWT keys (`*.pem`, `*.p12`, `**/keys/`), generated SQLite DBs, or `frontend/public/config.js` are all git-ignored for a reason. See `.gitignore`.

## Commands

Always use Corepack for pnpm (matches CI):

```bash
corepack pnpm install --frozen-lockfile   # in frontend/ or docs/
corepack pnpm start                       # frontend dev on 0.0.0.0:3000
corepack pnpm dev                         # same as vite, no host binding
corepack pnpm build                       # frontend production bundle in build/
corepack pnpm test                        # vitest, jsdom env, passWithNoTests
```

Backend:

```bash
cd backend
./mvnw spring-boot:run                    # local dev, listens on :8080
./mvnw clean package -DskipTests          # build runnable JAR in target/
./mvnw test                               # only ApplicationTests#contextLoads today
```

`predev` / `prestart` in `frontend/package.json` auto-runs `node scripts/ensureViteInstalled.mjs`, which re-runs `pnpm install --frozen-lockfile` if `node_modules/vite` is missing — useful, but you can also pre-run it manually.

Full distributable package (frontend build + Caddy download + zip):

```bash
cd scripts && python3 compile.py --action deploy    # produces ../TaskManager.zip
```

Docker image: `./docker/build.sh --platform linux/amd64` (see `docker/README.md` for multi-arch / push flags). CI lives in `.github/workflows/ci.yml`.

## First-run setup the README skips the gotchas on

1. The shipped `application.properties` references a hard-coded absolute path for the JWT keys (`jwtKeys.privateKeyPath=file:/Users/fiopans1/git/task-manager/backend/...`). On a fresh clone / different machine, regenerate the RSA pair and either:
   - export `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH` env vars, or
   - edit `backend/src/main/resources/application.properties` to point at your `keys/` dir.
   Helper: `python3 scripts/bin_files/key_generator.py`.
2. `frontend/public/config.js` is git-ignored. Copy it from the template before starting Vite, otherwise `configService.init()` will throw:
   ```bash
   cp scripts/config_templates/config.template.js frontend/public/config.js
   ```
   `index.html` loads `/config.js` at startup; `api.baseUrl` empty string + Vite's `/api`, `/auth`, `/oauth2/` proxy is the dev default.
3. Backend uses SQLite at the working directory (`jdbc:sqlite:task-manager.db?foreign_keys=on`). `spring.jpa.hibernate.ddl-auto=create` will wipe it on each start in dev — back up anything you want to keep.

## Architecture notes (non-obvious)

- **Auth is cookie + CSRF, not bearer tokens.** `frontend/src/services/apiClient.js` is the only sanctioned HTTP entry point. It has three axios instances: `apiClient` (auth required), `publicClient` (no auth), and an internal `csrfClient` that primes `XSRF-TOKEN`. Mutations auto-call `GET /api/session/csrf` first. Use `SKIP_AUTH_REFRESH` / `SKIP_CSRF_PROTECTION` axios config flags only for the bootstrap CSRF call and the auth endpoints themselves (login, register, refresh, logout, me) — see `isAuthEndpoint` for the exact list.
- **Frontend state is Redux Toolkit only.** Store is `frontend/src/redux/store.js`; the only slice today is `authSlice.js`. `redux-persist` is a dep but not yet wired up — don't assume persisted state.
- **Routing is nested.** All authenticated screens live under `/home` (see `App.jsx:100-151`); `FeatureGuard` reads `window.APP_CONFIG.features[featureKey]` to gate `tasks`, `calendar`, `lists`, `teams`. New top-level sections belong there.
- **Backend security props are externalised** via `taskmanager.security.*` (see `TaskManagerSecurityProperties.java`). Cookie names are `TM-ACCESS` / `TM-REFRESH`; CSRF is `XSRF-TOKEN` / `X-XSRF-TOKEN`. SameSite=None requires `cookies.secure=true` — the `SessionCookieService` throws at startup if you misconfigure this.
- **i18n is in docs, not the app.** Despite what `CONTRIBUTING.md` says about `useTranslation` + `en.json` / `es.json`, the React app currently has no i18n library; user-facing strings are hard-coded English. Don't import a translation hook that doesn't exist — either add the library properly or keep strings inline.
- **User-facing backend strings go through a `messageService.getMessage()`** abstraction (per `CONTRIBUTING.md`); follow that pattern in new Java code.

## Conventions

- Java package root is `com.taskmanager.application.*` (not `com.taskmanager.*`). Sub-packages: `controller`, `service`, `service.oauth2providers`, `model.entities` / `dto` / `exceptions` / `validations`, `security`, `config`, `respository` (yes, misspelled in the source — keep using the existing name), `context`, `utils`.
- Lombok is enabled; backend code uses `@Slf4j` / `@Data` / `@Builder`. Keep annotations consistent.
- Bilingual docs portal lives in `docs/en` and `docs/es`; `docs/.vitepress/config.mts` wires both locales. Docs dev server is `:4173`.
- `Dockerfile.deployment` is the end-to-end build (clone → maven → pnpm → `compile.py --action deploy` → image). `Dockerfile.build` is the older intermediate base — only relevant if you're explicitly editing it.

## CI / verification order

`.github/workflows/ci.yml` runs two independent jobs: `backend` (writes its own minimal `application.properties`, mvn package, smoke-tests `/health`) and `frontend` (`pnpm install --frozen-lockfile` + `pnpm approve-builds --all`, then boot on `:3000`). Both must be green before merge. There is no separate lint or typecheck step — Spring Boot compile + ESLint-equivalent validation (none configured) is the bar. Keep the lockfile (`frontend/pnpm-lock.yaml`, `docs/pnpm-lock.yaml`) in sync with `package.json` changes.

## When you change behaviour

- New backend config keys: add to `scripts/config_templates/application-properties.template` and document in `docs/CONFIGURATION.md` so packaged deployments pick them up.
- New runtime frontend setting: add to `scripts/config_templates/config.template.js`, expose via `configService` in `frontend/src/services/configService.js`, and read `window.APP_CONFIG` — do not hard-code environment-specific values in source.
- New OAuth2 provider: follow the pattern in `backend/src/main/java/com/taskmanager/application/service/oauth2providers/` and the `github` / `google` blocks in `application.properties`. Wire a flag into `taskmanager.oauth2.<provider>.enabled` and `frontend/public/config.js` `oauth2.<provider>.enabled`.
- Update both `docs/en` and `docs/es` for any user-visible change.
