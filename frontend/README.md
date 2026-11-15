# Task Manager Frontend

This package contains the React + Vite frontend for Task Manager.

It is responsible for the browser experience: authentication screens, task workflows, lists, calendar views, statistics and the user-facing session flow that works with the backend through secure cookies and CSRF protection.

## Stack

- React 18
- Vite
- Tailwind CSS 4
- shadcn/ui sources on Radix primitives
- Lucide icons
- Redux Toolkit
- React Router
- Vitest

## Architecture

The frontend is feature-first and enforces its dependency direction:

```
src/
├── app/          # routing, providers, guards, layout, sidebar
├── features/     # auth, dashboard, tasks, lists, teams, calendar, admin, settings...
│   └── <name>/   # pages, components, hooks, public index.js
├── shared/
│   ├── ui/       # shadcn/Radix sources + primitives (no domain logic)
│   ├── patterns/ # PageHeader, EntityCollection, SearchToolbar, dialogs...
│   ├── hooks/    # search, dialogs, infinite scroll, media query
│   ├── lib/      # cn, icons, dates, duration
│   ├── feedback/ # Noty + Toaster
│   ├── seo/      # per-route metadata
│   └── theme/    # ThemeProvider + toggle
├── services/     # API clients (infrastructure)
├── redux/        # auth store (infrastructure)
└── styles/       # Tailwind entry, theme tokens, calendar theme
```

Rules:

- `app` may import features; features may import shared, services and Redux.
- Features expose reusable pieces through their `index.js`; no deep cross-feature imports.
- `shared/ui` and `shared/patterns` stay presentational: no services, Redux, router or feature imports.
- `services` and `redux` never import UI code.
- Import with the `@/` alias.

Run the guard at any time:

```bash
corepack pnpm check:architecture
```

`pnpm build` runs it automatically through `prebuild`.

## Prerequisites

- Node.js 22.13+ (see `package.json` engines and `.nvmrc`)
- Corepack enabled

## Install dependencies

```bash
cd frontend
corepack pnpm install
```

## Runtime configuration

The frontend reads its runtime settings from `public/config.js`.

Create it from the provided template before starting local development:

```bash
cp ../scripts/config_templates/config.template.js public/config.js
```

Important points:

- `window.APP_CONFIG.api.baseUrl` controls which backend is used
- In development, an empty `baseUrl` works with the local proxy
- This file is loaded at runtime, so deployment environments can change values without rebuilding the app

Example:

```js
window.APP_CONFIG = {
  api: {
    baseUrl: ''
  },
  oauth2: {
    enabled: true
  }
}
```

## Available commands

### Start the development server

```bash
corepack pnpm dev
```

Runs Vite in development mode.

### Start the frontend on `0.0.0.0:3000`

```bash
corepack pnpm start
```

This is the command used by CI to verify that the frontend boots correctly and responds on port `3000`.

### Build for production

```bash
corepack pnpm build
```

Generates the production bundle in `build/`.

### Preview the production build

```bash
corepack pnpm preview
```

### Run tests

```bash
corepack pnpm test
```

### Check architecture

```bash
corepack pnpm check:architecture
```

## Development notes

- Use Tailwind semantic tokens and the `shared/ui` kit; do not reintroduce Bootstrap or raw one-off CSS.
- Keep user-facing strings aligned with the application translation system
- Do not commit environment-specific `public/config.js` values
- If you change authentication-related behaviour, verify the frontend still works with the backend session cookie + CSRF flow

## Related documentation

- Root project overview: [`../README.md`](../README.md)
- Contribution guide: [`../CONTRIBUTING.md`](../CONTRIBUTING.md)
- Design system (EN): [`../docs/en/design-system.md`](../docs/en/design-system.md)
- Sistema de diseño (ES): [`../docs/es/sistema-diseno.md`](../docs/es/sistema-diseno.md)
- User and developer portal: [`../docs`](../docs)
