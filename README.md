<div align="center">

# 🚀 CRM OS — Full-Stack Real-Time AI CRM Platform

**An enterprise-grade Customer Relationship Management (CRM) platform built with Next.js 16 (Turbopack), React 19, TypeScript, MongoDB, Socket.io real-time collaboration, and multi-model AI intelligence (Google Gemini `@google/genai` & Groq Cloud).**

[![Next.js](https://img.shields.io/badge/Next.js_16_(Turbopack)-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io_Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js_JWT-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://next-auth.js.org/)

</div>

---

## 📸 Overview & Live Demo

> **Local Server URL** → [http://localhost:3000](http://localhost:3000)
>
> **Demo Credentials**
>
> - **Email**: `vedantjadhav880@gmail.com`
> - **Password**: `vedantjadhav880`

---

## ✨ Key Capabilities & System Features

### 1. 🔄 Real-Time Multi-Tenant Collaboration (Socket.io)
- **Scoped Rooms & Instant Broadcasts**: Custom Node.js HTTP server (`server.ts`) hosting integrated Socket.io on `/api/socket/io`.
- **Live Reactive Synchronization**: Deal stage drag-and-drops, task completions, new contacts, and notifications propagate instantly to connected team members in the same tenant room.
- **Client Singleton & Live Alerts**: Resilient reconnection handling (`src/lib/socket/socket-client.ts`) and interactive `react-hot-toast` alerts.

### 2. ⚡ High-Concurrency & Performance Architecture (1000+ Users)
- **MongoDB Connection Pooling**: Configured with `maxPoolSize: 50`, `minPoolSize: 10`, `maxIdleTimeMS: 30000`, and query timeouts (`.maxTimeMS(10_000)`).
- **In-Memory Caching (`TTLCache`)**: High-throughput analytics endpoints (`/api/dashboard/*`) leverage micro-caching to eliminate duplicate database hits.
- **Next.js 16 Network Proxy (`src/proxy.ts`)**: Built with strict in-memory rate limiting (100 requests per 60 seconds per IP) and protected session verification, migrating from deprecated middleware conventions.

### 3. 🧠 Multi-Provider AI Intelligence Engine
- **Pluggable Architecture**: Seamless switching between **Google Gemini** (`gemini-2.5-flash` via `@google/genai`) and **Groq Cloud** (`llama-3.3-70b-versatile` via `groq-sdk`) with structured JSON schema responses.
- **AI Sales Insights**: Generates automated pipeline health scores (0-100), key observations, and actionable deal-closing recommendations.
- **AI Lead Summarizer & Risk Scoring**: Contextual deal valuation, engagement risk calculation, and next-best actions.
- **AI Email Generator**: Formulates personalized sales emails tailored by tone (professional, friendly, casual, formal) and intent (follow-up, demo, intro).
- **Graceful Mock Fallbacks & Rate Quotas**: Defensive error recovery prevents 500 crashes if API keys are missing or provider quotas are hit.

### 4. 🧩 Standardized Reusable UI Design System (`src/components/common/`)
- Pure compound UI primitives built on Radix UI and Tailwind CSS v4:
  - `PageHeader`: Standardized responsive title, badges, and action bars.
  - `MetricCard`: Interactive KPI cards supporting 7 theme accents, icons, and trend indicators.
  - `StatusBadge` & `PriorityBadge`: Semantic status and priority pills across all domains.
  - `SearchInput`: Debounced, clearable search inputs with Lucide iconography.
  - `ViewToggle`: Accessible toggles between Grid (Card), Table, and Kanban board modes.
  - `ConfirmDialog`: Radix-based modal confirmation replacing native browser `window.confirm()`.
  - `EmptyState` & `ErrorState`: Context-aware fallback screens with actionable CTAs.
  - `LoadingSkeleton` & `AuthRequired`: Fluid loading and authentication gates.

### 5. 🗂️ Domain-Driven Feature Views
- **Leads & Pipeline**: Interactive Kanban board (5 core stages: *New → Qualified → Proposal → Won → Lost*) and filterable data tables with bulk actions and CSV exports.
- **Contacts**: Full contact registry with status filters, phone/email quick actions, and pagination.
- **Follow-up Tasks**: Time-categorized checklists (*Overdue, Today, Upcoming, Completed*) with completion trackers.
- **Notes**: Masonry grid with pinned notes and lead linking.
- **Settings & Audit Logs**: Organization preferences, collaborative sharing toggles, and system audit logs.
- **Global Search**: Cross-entity search indexing contacts, deals, and tasks.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.9 (Turbopack, App Router)
- **Frontend**: React 19.2, TypeScript (Strict Mode), Tailwind CSS v4, Lucide Icons, Recharts, Radix UI primitives
- **Backend**: Node.js custom HTTP server, Next.js Route Handlers, Socket.io 4.8
- **Database**: MongoDB 7 / Mongoose 9 (Connection pooling, indexes, multi-tenant isolation)
- **Authentication**: NextAuth.js (JWT session strategy, bcrypt password hashing)
- **AI Providers**: `@google/genai` (Gemini), `groq-sdk` (Llama 3.3)
- **Email**: Resend API integration (`resend`)

---

## 🗂️ Architecture & Folder Structure

```
crm/
├── server.ts                    # Custom Node.js HTTP server + Socket.io server
├── src/
│   ├── app/                     # Pure Routing Layer ONLY (App Router)
│   │   ├── (auth)/              # Login & Registration routes
│   │   ├── (main)/              # Protected feature pages (dashboard, pipeline, leads, etc.)
│   │   ├── api/                 # Secure API Route Handlers (REST & AI endpoints)
│   │   ├── layout.tsx           # Global root layout with system font stack
│   │   └── globals.css          # Tailwind CSS v4 theme variables (oklch)
│   ├── proxy.ts                 # Next.js 16 Proxy (Rate limiting & Auth guard)
│   ├── components/
│   │   ├── common/              # Reusable compound UI components (PageHeader, MetricCard, etc.)
│   │   ├── ui/                  # Radix UI primitives (dialog, button, select, tabs, etc.)
│   │   ├── Navbar.tsx           # Glassmorphic pill navigation
│   │   └── Logo.tsx             # Branded vector logo
│   ├── features/                # Feature-Sliced Domain Modules
│   │   ├── auth/                # Sign-in & registration logic
│   │   ├── contacts/            # Contact management views, hooks & services
│   │   ├── dashboard/           # Dashboard views, analytics & widgets
│   │   ├── deals/               # Pipeline kanban, deal dialogs & hooks
│   │   ├── enterprise/          # Multi-tenant settings, audit logs & business logic
│   │   ├── leads/               # Lead drawers, AI actions & table/card views
│   │   ├── marketing/           # Landing page views
│   │   ├── notes/               # Masonry notes grid & services
│   │   ├── notifications/       # Live notification center & badge alerts
│   │   ├── search/              # Global cross-entity search bar & view
│   │   ├── settings/            # Account settings & data exports
│   │   └── tasks/               # Follow-ups, checklist items & filters
│   ├── hooks/                   # Shared client hooks (usePaginated, etc.)
│   ├── lib/
│   │   ├── auth/                # NextAuth configuration & client session helpers
│   │   ├── dbConnect.ts         # High-concurrency cached Mongoose connection pool
│   │   ├── socket/              # Server & client Socket.io modules
│   │   └── ai/                  # Gemini & Groq unified intelligence adapters
│   └── models/                  # Mongoose Schemas (User, Contact, Deal, Task, Note, etc.)
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18.18+ or v20+ (Node.js 22 LTS recommended)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

### 2. Installation & Setup

```bash
# Clone repository
git clone https://github.com/vedant2863/crm.git
cd crm

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Configure your `.env` variables:
```env
PORT=3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-character-random-secret
MONGODB_URI=mongodb://localhost:27017/crm

# AI Providers (Optional — defaults to mock fallbacks if omitted)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Seed Database

Generate demo records (contacts, leads, deals, tasks, notes) under the developer account:

```bash
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in with:
- **Email**: `vedantjadhav880@gmail.com`
- **Password**: `vedantjadhav880`

---

## 🧪 Quality & Verification Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run check` | `knip && eslint . && tsc --noEmit` | Comprehensive quality pipeline check |
| `npm run type-check` | `tsc --noEmit` | Strict TypeScript validation |
| `npm run lint` | `eslint .` | Linting check |
| `npm run knip` | `knip` | Unused dependencies and exports detection |
| `npm run build` | `cross-env NODE_ENV=production next build` | Next.js Turbopack production build |
| `npm run start` | `cross-env NODE_ENV=production tsx server.ts` | Production HTTP + Socket.io server |

---

## 📋 API & Health Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/healthz` | `GET` | Health probe reporting DB connection, Socket.io, uptime, and memory |
| `/api/auth/[...nextauth]` | `ALL` | NextAuth.js authentication router |
| `/api/auth/register` | `POST` | User registration |
| `/api/deals` | `GET` / `POST` | Fetch user pipeline deals / create deal |
| `/api/deals/:id` | `PATCH` / `DELETE` | Update stage or details / delete deal |
| `/api/contacts` | `GET` / `POST` | List and search contacts / add contact |
| `/api/tasks` | `GET` / `POST` | List follow-up tasks / create task |
| `/api/notes` | `GET` / `POST` | Fetch notes (with search) / create note |
| `/api/notifications` | `GET` / `PATCH` | Fetch unread notifications / mark as read |
| `/api/search` | `GET` | Cross-entity search (`?q=query`) |
| `/api/dashboard/analytics` | `GET` | Aggregated revenue and pipeline statistics |
| `/api/ai/lead-summary` | `POST` | Gemini / Groq deal summary & risk scoring |
| `/api/ai/email-generator` | `POST` | Draft personalized outreach emails |
| `/api/ai/sales-insights` | `POST` | Pipeline health analysis & tactical suggestions |

---

## 👤 Author

**Vedant Jadhav**
- GitHub: [@vedantjadhav](https://github.com/vedantjadhav)

---

## 📄 License

MIT © 2026 Vedant Jadhav
