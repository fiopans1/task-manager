# Task Manager Frontend

This package contains the React + Vite frontend for Task Manager.

It is responsible for the browser experience: authentication screens, task workflows, lists, calendar views, statistics and the user-facing session flow that works with the backend through secure cookies and CSRF protection.

## Stack

- React 18
- Vite
- Redux Toolkit
- React Router
- Bootstrap
- Vitest

## Prerequisites

- Node.js 20+ recommended
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

## Development notes

- Keep user-facing strings aligned with the application translation system
- Do not commit environment-specific `public/config.js` values
- If you change authentication-related behaviour, verify the frontend still works with the backend session cookie + CSRF flow

## Related documentation

- Root project overview: [`../README.md`](../README.md)
- Contribution guide: [`../CONTRIBUTING.md`](../CONTRIBUTING.md)
- User and developer portal: [`../docs`](../docs)
