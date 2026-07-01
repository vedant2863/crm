# Architecture Documentation

## System Overview

CRM OS is a full-stack, multi-tenant Customer Relationship Management application built on the **Next.js 16** platform (using Turbopack) with **MongoDB** for persistence and **Google Gemini / Groq** for AI-powered insights. It is optimized to handle 1000 concurrent users under a zero-external-dependency constraint.

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
│  │  (auth)      │  │  (main)      │  │  api/ (Inline)       │ │
│  │  /login      │  │  /dashboard  │  │  /auth/[...nextauth]  │ │
│  │  /register   │  │  /leads      │  │  /contacts           │ │
│  │              │  │  /pipeline   │  │  /deals              │ │
│  │              │  │  /contacts   │  │  /tasks              │ │
│  │              │  │  /notes      │  │  /ai/                │ │
│  │              │  │  /settings   │  │  /tenant             │ │
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
│  src/lib/                                                       │
│  ├── ai/               AI Provider & Rate Limit manager         │
│  ├── cache.ts          Generic in-memory TTLCache               │
│  ├── org-cache.ts      Cached multi-tenant org lookup           │
│  ├── errors.ts         Structured AppError & handleApiError     │
│  ├── validation.ts     Sanitization & parameter validation      │
│  ├── rate-limiter.ts   In-memory sliding window rate limiter    │
│  ├── dbConnect.ts      Tuned MongoDB Mongoose connection pool   │
│  └── config/                                                    │
│      └── envconfig.ts  Centralized environment variables        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  models/            MongoDB via Mongoose ODM                    │
│  ├── user.ts        NextAuth user data                          │
│  ├── contact.ts     Contacts/leads (with compound indexes)      │
│  ├── deal.ts        Opportunities (with compound indexes)       │
│  ├── task.ts        Follow-up tasks (with compound indexes)     │
│  ├── note.ts        Masonry notes                               │
│  ├── comment.ts     Collaborative comments                      │
│  ├── activity.ts    Activity timeline (with TTL index)          │
│  ├── notification.ts Push notifications (with TTL index)        │
│  └── auditLog.ts    Security Audit trail (with compound index)  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  MongoDB Atlas / Local MongoDB                                  │
│  Google GenAI API (Gemini 2.5 Flash / Gemini 1.5 Pro)           │
│  Groq API (Llama 3.3 70B)                                     │
│  Resend (Transactional Email)                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Multi-Tenant Isolation
- Core entities (`Contact`, `Deal`, `Task`, `Note`) store `userId` as `String`.
- Queries are scoped to the requesting user or their organization.
- Active organization user IDs are retrieved via `getOrganizationUserIds(userId)` (defined in [org-cache.ts](file:///c:/data/project/crm/src/lib/org-cache.ts)) which caches database lookups for 60 seconds using `TTLCache`.
- Collaborative entities (`Comment`, `Activity`, `Notification`) store `userId` as `ObjectId` mapping to the user document.

### 2. Request & Response in API Routes (Strictly Inline)
- Under the Next.js dynamic routing conventions, all request validation, session evaluation, parameter sanitization, and structured response parsing are written **inline** within the `src/app/api/.../route.ts` files.
- Feature directories (`src/features/*/`) do **not** contain HTTP handling or translation layers. They contain database services (`src/features/*/services/*`) that interact with Mongoose models directly.

### 3. Caching Architecture (Zero Dependencies)
A custom generic `TTLCache` in [cache.ts](file:///c:/data/project/crm/src/lib/cache.ts) prevents database/API query overload:
- **Organization cache:** 60-second TTL. Reduces redundant queries to verify organization members.
- **Dashboard widgets/KPIs:** 30-second TTL. Caches heavy database aggregations and pipeline analytics.
- **Notification scan:** 5-minute TTL. Avoids scanning all tasks due tomorrow on every notification poll.

### 4. Sliding Window Rate Limiting & Account Lockout
In-memory sliding window limiter in [rate-limiter.ts](file:///c:/data/project/crm/src/lib/rate-limiter.ts) and [proxy.ts](file:///c:/data/project/crm/src/proxy.ts):
- **API endpoints:** 120 requests/minute per authenticated user.
- **Auth endpoints:** 30 requests/minute per IP address.
- **Brute force prevention:** 5 failed login attempts lock the user account for 15 minutes.

### 5. High-Concurrancy Database Tuning
To support 1000 concurrent active users:
- **Connection Pooling:** Mongoose configured with `maxPoolSize: 50` and `minPoolSize: 5` inside [dbConnect.ts](file:///c:/data/project/crm/src/lib/dbConnect.ts).
- **Projections and Lean Reads:** Read queries use `.lean()` and `.select(...)` to minimize object memory allocation.
- **Query Timeouts:** Every database read is clamped with a `.maxTimeMS(10000)` timeout to prevent blocking thread execution.
- **Indexes:** Added compound indexes for fast query resolution and text indexes for search filters.

### 6. AI Features and Global Quotas
- Supported via `AIService` provider interface wrapper.
- **Global limit:** Rolling 24-hour limit of 5 requests shared globally across all AI features (Email Generator, Lead Summary, and Sales Insights).
- **No Mock Fallback:** If the AI provider key is missing or calls fail, standard HTTP error codes (e.g. 429 quota, 500 service unavailable, 400 missing key) are returned directly instead of fallback mock data.

---

## Design System

- **Glassmorphism**: `backdrop-blur-md`, `bg-card/45`, `border-border/50` for card structures.
- **Theming**: Dark mode default using CSS custom properties (`oklch` tailored palettes) and theme context toggling.
- **Layouts**: Custom `(auth)` group layouts for onboarding, and `(main)` layout wrapper for dashboard pages.

---

## Data Flow: Example (Sales Insights AI Feature)

```
1. User clicks "Generate Insights" button in Dashboard
2. React component posts/gets /api/ai/sales-insights
3. Route handler:
   a. Evaluates session via getServerSession()
   b. Checks global AI quota via hasAiQuota(session.user.id) -> throws 429 if exceeded
   c. Checks in-memory MongoDB cache (AiCallLog) -> returns cached text if present
   d. Calls dbConnect() to initialize connection pool
   e. Fetches deals using .lean() and passes them to AIService
   f. Calls Gemini/Groq APIs and logs the operation to AiCallLog
4. Structured JSON response returned to the client
5. Component parses results and displays AI insights card
```
