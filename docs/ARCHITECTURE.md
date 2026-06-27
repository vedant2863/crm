# Architecture Documentation

## System Overview

CRM OS is a full-stack, multi-tenant Customer Relationship Management application built on the **Next.js 15** platform with **MongoDB** for persistence and **Google Gemini / Groq** for AI-powered insights.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│           React 19 + Tailwind CSS v4 + shadcn/ui               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App Router                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  (auth)      │  │  (main)      │  │  api/                │ │
│  │  /login      │  │  /dashboard  │  │  /auth/[...nextauth]  │ │
│  │  /register   │  │  /leads      │  │  /leads              │ │
│  │              │  │  /pipeline   │  │  /tasks              │ │
│  │              │  │  /contacts   │  │  /notes              │ │
│  │              │  │  /notes      │  │  /ai/                │ │
│  │              │  │  /settings   │  │  /seed               │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Feature Layer                              │
│  src/features/                                                  │
│  ├── dashboard/          ├── tasks/                            │
│  │   ├── components/     │   ├── components/                   │
│  │   ├── hooks/          │   ├── hooks/                        │
│  │   └── services/       │   ├── services/                     │
│  ├── enterprise/         │   └── types/                        │
│  │   ├── components/     ├── deals/                            │
│  │   └── services/       │   ├── components/                   │
│  └── search/             │   ├── hooks/                        │
│      └── services/       │   ├── services/                     │
│                           │   └── types/                        │
│                           └── notes/                            │
│                               ├── components/                   │
│                               └── services/                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Services                          │
│  lib/                                                          │
│  ├── ai/               AI Provider abstraction                  │
│  │   ├── provider.ts   AIProvider interface                     │
│  │   ├── service.ts    AIService (DI wrapper)                   │
│  │   ├── fallback.ts   Provider fallback chain                  │
│  │   ├── rate-limit.ts Per-user rate limiting                  │
│  │   └── schemas.ts    Zod validation schemas                   │
│  ├── dbConnect.ts      Cached Mongoose connection               │
│  ├── seedData.ts       Database seeding                         │
│  └── config/                                                    │
│      └── envconfig.ts  Centralized environment variables        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  models/            MongoDB via Mongoose ODM                    │
│  ├── user.ts        NextAuth user data                          │
│  ├── contact.ts     Contacts/leads                              │
│  ├── deal.ts        Pipeline opportunities                      │
│  ├── task.ts        Follow-up tasks                             │
│  ├── note.ts        Masonry notes                               │
│  ├── comment.ts     Collaborative comments                      │
│  ├── activity.ts    Activity timeline                           │
│  ├── notification.ts Push notifications                         │
│  └── auditLog.ts    Audit trail                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  MongoDB Atlas / Local MongoDB                                  │
│  Google GenAI API (Gemini 2.5 Flash)                           │
│  Groq API (Llama 3.3 70B)                                     │
│  Resend (Transactional Email)                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Multi-Tenant Isolation
- Every core entity (`Contact`, `Deal`, `Task`, `Note`) carries a `userId` field (String).
- Queries are scoped to the requesting user or their organization (via `company` field match).
- Enterprise collections (`Comment`, `Activity`, `Notification`, `AuditLog`) use `ObjectId` for `userId`.

### 2. Feature-First Module Organization
Domain logic is grouped by business capability under `src/features/`:
- `components/` — React components
- `hooks/` — Custom data-fetching hooks
- `services/` — Server-side business logic
- `types/` — Domain-specific TypeScript interfaces

### 3. Provider Abstraction for AI
- `AIProvider` interface defines the contract (`isAvailable`, `getLeadSummary`, `generateEmail`, `getSalesInsights`).
- Implementations: `GeminiProvider`, `GroqProvider`.
- Fallback chain in `fallback.ts` — primary fails → secondary → mock data.
- `AIService` wraps any provider via dependency injection.

### 4. Caching Strategy
- In-memory TTL cache (10 minutes) for AI responses.
- Deterministic cache keys: `${userId}:${leadId}:summary`.
- Only safe-to-stale data cached; personalized emails are never cached.

### 5. Authentication & Authorization
- **NextAuth.js v4** with Credentials provider (email/password).
- JWT session strategy (not database sessions).
- bcrypt password hashing (10 rounds).
- `proxy.ts` middleware protects all non-public routes.

## Design System

- **Glassmorphism**: `backdrop-blur-md`, `bg-white/70`, `rounded-2xl`, `border-white/20`.
- **Color tokens**: `oklch` color space for consistent theming (Indigo primary).
- **Responsive**: Mobile-first approach; navbar collapses to icon-only on mobile.
- **Typography**: System font stack, `tracking-tight` for headings.

## Data Flow: Example (Lead Summary AI Feature)

```
1. User opens Lead Detail Drawer
2. React component calls useLeadSummary(leadId)
3. Hook posts to /api/ai/lead-summary with leadId
4. Route handler:
   a. Validates session via getServerSession()
   b. Calls dbConnect()
   c. Fetches lead + associated notes from DB
   d. Constructs LeadInput
   e. Calls AIService.getLeadSummary()
   f. Provider checks in-memory cache (10 min TTL)
   g. If miss → calls Gemini API with JSON schema constraint
   h. If fail → returns { noApiKey: true, ...mockData }
5. Response returned to client
6. Hook updates state, component renders AI summary card
```
