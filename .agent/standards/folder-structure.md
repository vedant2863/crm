# Folder Structure Guidelines

Strict adherence to Feature-Sliced / Domain-Driven Architecture:

```
src/
├── app/                      # Next.js App Router (Routing layer ONLY)
│   ├── layout.tsx            # Global layout shell
│   ├── page.tsx              # Thin route shell: imports & renders <LandingPageView />
│   ├── (auth)/               # Auth route group (login, register) - thin route shells
│   ├── (main)/               # Authenticated main app route group - thin route shells
│   │   ├── dashboard/page.tsx   # Imports & renders <DashboardView />
│   │   ├── leads/page.tsx       # Imports & renders <LeadsView />
│   │   ├── pipeline/page.tsx    # Imports & renders <PipelineView />
│   │   ├── contacts/page.tsx    # Imports & renders <ContactsView />
│   │   ├── tasks/page.tsx       # Imports & renders <TasksView />
│   │   ├── follow-ups/page.tsx  # Imports & renders <FollowUpsView />
│   │   ├── notes/page.tsx       # Imports & renders <NotesView />
│   │   ├── settings/page.tsx    # Imports & renders <SettingsView />
│   │   └── search/page.tsx      # Imports & renders <SearchView />
│   ├── [tenant]/page.tsx     # Dynamic tenant route loader: imports & renders <TenantView />
│   └── api/                  # API route handlers (inline in route.ts)
│
├── features/                 # Core business logic & domain features
│   ├── auth/                 # Authentication domain (login, register, session)
│   ├── dashboard/            # Dashboard analytics, KPI metrics, status cards, state
│   ├── leads/                # Lead management, tables, cards, detail drawers, filters
│   ├── deals/                # Deals & sales pipeline Kanban board
│   ├── contacts/             # Contact management, tables, detail drawers, modals
│   ├── tasks/                # Tasks & follow-ups views and dialogs
│   ├── notes/                # Rich notes management view
│   ├── notifications/        # Real-time and background task notifications, bell dropdown
│   ├── settings/             # User settings & security audit log views
│   ├── search/               # Global search modal and results view
│   ├── enterprise/           # Multi-tenant custom workspace / tenant landing view
│   ├── marketing/            # Public marketing landing page view
│   └── [domain]/
│       ├── components/       # Domain-specific UI components & main <DomainView />
│       ├── hooks/            # Domain-specific hooks (data fetching, state, real-time)
│       ├── actions/          # Next.js Server Actions for this domain
│       ├── services/         # API clients / SDK callers
│       ├── types/            # TypeScript definitions specific to domain
│       └── index.ts          # Public barrel API exporting feature view and symbols
│
├── components/               # Global shared UI components (shadcn/ui, navbar, modals)
│   ├── ui/                   # Reusable atomic UI primitives (button, dialog, input, etc.)
│   └── common/               # Reusable compound UI components (PageHeader, EmptyState, MetricCard, StatusBadge, PriorityBadge, ConfirmDialog, SearchInput, ViewToggle, ErrorState, LoadingSkeleton, AuthRequired)
│
├── contexts/                 # Global React context providers (theme-context, etc.)
├── hooks/                    # Global reusable cross-cutting hooks (theme, debounce, etc.)
├── lib/                      # Global infrastructure & configurations (dbConnect, socket, auth, utils)
└── types/                    # Global / shared TypeScript interfaces
```

### Core Rules
1. **`src/app/` is Routing ONLY:** Route files (`page.tsx`) must never contain complex markup, state machines, or domain queries. They solely parse route params and delegate rendering to domain feature views from `@/features/<domain>`.
2. **Feature Encapsulation:** Every domain under `src/features/` encapsulates its components, hooks, services, and types, exposing a clean public API via `index.ts`.
3. **API Handlers:** API routes live in `src/app/api/.../route.ts` with business logic and validations inlined or calling domain services.
