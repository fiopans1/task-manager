# Task Manager E2E tests

End-to-end tests for the React frontend driving the real Spring Boot backend and
SQLite database with **Playwright Java**. There are no API mocks, stubs or
in-memory databases: every test uses the application that is already running.

Chrome DevTools MCP was used while developing the tests to inspect the real UI
and validate selectors. It is **not** a test dependency, is not called from the
suite and is not used by CI.

## Prerequisites

Start the application before running the suite:

```bash
# terminal 1
cd backend
./mvnw spring-boot:run

# terminal 2
cd frontend
corepack pnpm start
```

The backend must create the real users used by the suite:

```properties
taskmanager.create-admin-user=true
taskmanager.create-basic-user=true
taskmanager.default-admin-username=admin
taskmanager.default-admin-password=admin
```

`basic/basic` is the collaborator used by teams, invitations, roles and the
block/unblock flow.

> The backend development profile uses `ddl-auto=create`. Prefer a dedicated
> SQLite database for E2E runs so test data never mixes with your working data.

## Install Chromium once

```bash
cd tests
mvn exec:java \
  -Dexec.classpathScope=test \
  -Dexec.mainClass=com.microsoft.playwright.CLI \
  -Dexec.args="install chromium"
```

On Linux CI use `install --with-deps chromium`.

## Configuration

`tests/e2e.properties` contains the defaults:

```properties
e2e.base-url=http://localhost:3000
e2e.username=admin
e2e.password=admin
e2e.collaborator.username=basic
e2e.collaborator.password=basic
e2e.browser=chromium
# false = visible Chromium window; true = headless
e2e.headless=false
e2e.timeout-seconds=30
e2e.assertion-timeout-seconds=15
e2e.slow-mo-ms=0
e2e.artifacts-dir=target/playwright-artifacts
e2e.trace=false
```

Values are resolved in this order:

1. System properties (`-De2e.username=...`)
2. Environment variables (`E2E_USERNAME`, `E2E_PASSWORD`, `E2E_BASE_URL`, ...)
3. `tests/e2e.properties`

Use environment variables in CI or when you do not want to edit the properties
file.

## Run

```bash
cd tests

mvn test                              # full suite, visible browser
mvn test -Dgroups=smoke               # smoke subset
mvn test -Dtest=TasksTest             # one class
mvn test -Dtest=TeamsTest#someMethod  # one method
mvn test -De2e.headless=true          # headless, no window
mvn test -De2e.headless=false         # force visible browser
mvn test -De2e.slow-mo-ms=500         # slow down visible actions
mvn test -De2e.trace=true             # record a trace for every test
```

The suite is sequential because it shares one backend and one database.

## What is covered

- Public landing page, SEO metadata, `/health`, theme persistence.
- Login, invalid credentials, logout, protected routes and session reload.
- Registration validation, duplicate users and successful registration/login.
- Sidebar navigation, collapse/expand, mobile offcanvas, About and admin visibility.
- Dashboard stats, recent tasks, upcoming events and quick links.
- Tasks CRUD, search, validation, events, details, long descriptions,
  comments/actions, timer and deletion.
- Calendar event rendering and month/week/day/schedule views.
- Lists CRUD, search, add/remove tasks and delete-without-deleting-tasks.
- Teams CRUD, invitations accept/reject/cancel, roles, reassignment, history,
  task filters, member removal, leave and delete.
- Admin user search/detail/block/unblock, editing/deleting another user's task,
  feature flags and system messages.
- Idle-session warning, extend session and automatic logout.
- OAuth2 UI and error callback. External Google/GitHub login is not automated
  because it needs real third-party accounts.

## Artifacts

Each test writes a screenshot to:

```text
tests/target/playwright-artifacts/
```

Browser console errors and page errors are written next to it when present.
With `-De2e.trace=true`, Playwright also writes `*-trace.zip`.

Open a trace with:

```bash
cd tests
mvn exec:java \
  -Dexec.classpathScope=test \
  -Dexec.mainClass=com.microsoft.playwright.CLI \
  -Dexec.args="show-trace target/playwright-artifacts/<name>-trace.zip"
```

Surefire reports are under `tests/target/surefire-reports/`.

## CI

`.github/workflows/e2e.yml` runs the full suite **only for pull requests whose
base branch is `main`**. The workflow starts:

- backend with a disposable SQLite database and temporary JWT keys,
- frontend with `tests/fixtures/config.e2e.js`,
- Chromium installed through Playwright.

It uploads screenshots, traces and logs when the job fails.

## Data and cleanup

Tests use `[E2E]` prefixes and unique UUIDs, and delete the tasks, lists and teams
they create. The registration test creates a real user; the backend has no delete
user endpoint, so that account remains. This is why a disposable E2E database is
recommended.

Feature flags and system messages are global settings. The tests snapshot and
restore them, but a hard failure can leave them changed. Running against a
dedicated database makes recovery trivial.
