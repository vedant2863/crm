# Folder Structure Guidelines

- `src/app/` — Next.js dynamic routes, layouts, and page controllers.
- `src/app/api/` — API handlers. All API handlers are written **inline** within `route.ts` files. There are no controllers or handlers inside features.
- `src/features/` — Domain modules. Each subfolder contains:
  - `components/` — React files.
  - `hooks/` — Custom fetching hooks.
  - `services/` — Database manipulation and service logic (no HTTP routing, session checks, or validation).
  - `types/` — Type files.
- `src/components/ui/` — Common layout UI wrappers (primitives).
- `src/lib/` — Shared infrastructure helpers (caching, error configurations, rate-limiting utilities).
