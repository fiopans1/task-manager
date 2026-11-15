# Design system

Task Manager uses a deliberately utilitarian visual language called **Control Room**: a dense, dark-first workspace with cool graphite surfaces, a single signal blue and mint verification accents. It is a tool, not a landing page. The system is implemented with Tailwind CSS v4 and a local component kit adapted from shadcn/ui sources on Radix primitives.

## Principles

1. **The interface is a tool.** Content first, chrome second. No decorative hero inside the authenticated app.
2. **Structure with lines, not shadows.** Panels use a 1 px border and a flat surface. Shadows are reserved for overlays (dialogs, menus, sheets).
3. **Colour is signal.** Brand blue marks navigation and primary actions. Status colours appear only where they carry meaning (state, priority, validation).
4. **One type superfamily.** IBM Plex Sans for the interface, IBM Plex Mono for time, dates, counters and identifiers.
5. **Density with air.** 14 px body, 40 px controls, compact rows, generous page gutters.
6. **Motion answers actions.** No scroll reveals, no decorative loops. One subtle entrance for overlays and hover/press feedback.

## Tokens

All colours are semantic CSS variables in `frontend/src/styles/theme.css`, mapped into Tailwind with `@theme inline`. Components consume utilities such as `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-brand`, `bg-surface-2`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#F2F4F7` | `#080D12` | App canvas |
| `card` | `#FFFFFF` | `#0E151C` | Panels, rows, dialogs |
| `surface-2` | `#F7F9FA` | `#131D26` | Inputs, subtle blocks, hover |
| `surface-3` | `#EDF1F5` | `#192631` | Tracks, skeletons |
| `border` | `#DCE3EA` | `#22303C` | Hairlines |
| `foreground` | `#0F1A24` | `#E9F0F6` | Primary text |
| `muted-foreground` | `#5A6B7B` | `#93A4B4` | Secondary text |
| `brand` | `#2457F5` | `#4D8DFF` | Links, focus, active nav |
| `primary` | `#1B46CC` | `#1E5BFF` | Primary buttons |
| `success` | `#0E8A5F` | `#4ADE9B` | Completed, positive |
| `warning` | `#A85A00` | `#F5B759` | Paused, high priority |
| `danger` | `#C03221` | `#F87171` | Destructive, cancelled |
| `info` | `#0B6E8A` | `#67D4EE` | New, neutral information |

Radii: 6 px inputs/badges, 10 px buttons/menus, 14 px panels/dialogs, 18 px auth surfaces. Shadows: `shadow-overlay` only.

## Typography

- **UI:** IBM Plex Sans Variable, 400/500/600.
- **Data:** IBM Plex Mono, 400/500.
- Scale: 34 / 28 / 20 / 16 / 14 / 13 / 12 / 11 px.
- Page titles are 28 px semibold with tight tracking; section titles 14–16 px semibold; body 14 px; helper text 12 px; metadata 11 px.
- Use `font-mono` and `tabular-nums` for time, dates, counters and IDs.

## Component map

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
features/*/         Domain pages, components and hooks
```

Rules:

- `shared/ui` and `shared/patterns` have no domain logic and never import services, Redux, router or features.
- A feature exposes reusable pieces through its `index.js`. Cross-feature imports use that public entry point.
- A page composes patterns and feature components. Data loading and state live in feature hooks.
- Use `cn()` from `shared/lib/utils` and CVA variants instead of long conditional class strings.
- Icons come from Lucide via `shared/lib/icons.js`; icon-only buttons always receive an `aria-label`.
- Toasts go through `shared/feedback/Noty.js` only.

## Theming

`ThemeProvider` sets `data-theme="light|dark"` on `<html>`. If there is no saved preference it follows `prefers-color-scheme`; the inline script in `index.html` applies the theme before paint to avoid a flash.

Because the theme is expressed as CSS variables, components do not use `dark:` variants for colours. Use semantic utilities and the theme updates automatically. The calendar is built from the same primitives and tokens; there is no third-party calendar stylesheet.

## Accessibility and motion

- Visible focus rings on every interactive control; never remove them.
- Dialogs, dropdowns and tabs use Radix behaviour: focus trap, Escape, keyboard navigation, ARIA wiring.
- Touch targets are at least 44 px on mobile.
- Status is never conveyed by colour alone: badges include a label; the task row has a text status.
- `prefers-reduced-motion` removes animations globally; no content depends on motion.
- Form errors are rendered under the field with `role="alert"`; labels are always visible.

## Collection pages

Tasks, Lists and Teams share one screen recipe:

`CollectionPage` + `PageHeader` + `SearchToolbar` + `EntityCollection` + `EntityRow`

Each feature supplies only its row content (`TaskRow`, `ListRow`, `TeamRow`), its empty state and its form dialog. If you add a fourth collection, reuse this stack instead of building a new page shell. The shared `CollectionSkeleton` and `EmptyState` keep loading and empty screens identical too.

## Auth screens

`/`, `/login`, `/register` and `/oauth2-login` share `AuthLayout`. On desktop the left panel carries the brand, the promise and the mini task ledger. On mobile that panel collapses: the brand sits at the top over a fading blueprint grid, the form is vertically centred, and a mono rail with the copyright, version and privacy closes the screen above the safe area.

## Adding a component

1. Check whether `shared/ui` or `shared/patterns` already covers the case.
2. Create one component per file in the right layer. Use semantic tokens, `cn()` and CVA.
3. Keep it presentational: props in, markup out. Put data/state in a feature hook.
4. Add an accessible name to icon-only controls and a label to every field.
5. If it will be reused across features, add it to the appropriate pattern folder and document it here.
6. Add or update the Playwright coverage in `tests/` using roles, labels or `data-testid`.

## Verification

```bash
cd frontend
corepack pnpm check:architecture
corepack pnpm build
```

`check:architecture` fails if shared code imports features, if a feature reaches into another feature's internals, if infrastructure imports UI, or if a removed dependency (Bootstrap, `react-icons`, `recharts`) comes back. `build` runs the guard automatically.

Then run the E2E suite with the backend and frontend running:

```bash
cd tests
mvn test -De2e.headless=true
```
