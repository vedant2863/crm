<div align="center">

# 🚀 CRM OS — Full-Stack AI CRM Dashboard App

**A premium, full-featured Customer Relationship Management (CRM) platform built with Next.js 15, TypeScript, MongoDB, the new Google Gemini `@google/genai` SDK, and a custom responsive glassmorphic design system.**

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://next-auth.js.org/)

</div>

---

## 📸 Screenshots & Live Demo

> **Local Server URL** → [http://localhost:3000](http://localhost:3000)
>
> **Demo Credentials**
>
> - **Email**: `vedantjadhav880@gmail.com`
> - **Password**: `vedantjadhav880`

---

## ✨ Key Features & Enhancements

### 1. 🔐 User Authentication

- Credential-based secure registration & login using **NextAuth.js** and **bcrypt** password hashing.
- Protected routes and automatic session recovery on page refreshes.
- Strict multi-tenant security isolating all records (`contacts`, `deals`, `notes`, `tasks`) by `userId`.

### 2. 📊 Restructured AI CRM Dashboard

Designed as a modern 3-column dashboard matching premium SaaS interfaces:

- **Left Column**:
  - *Pipeline Goal*: Glassmorphic credit-card style widget visualizing total pipeline value.
  - *Weekly Revenue*: Closed-won revenue tracking with an upward percentage indicator.
  - *Conversion Rate*: Progress tracker showing won leads against open tasks.
  - *Upcoming Follow-ups*: Fast action-list of near-term follow-ups.
- **Middle Column**:
  - *Pipeline Engagement*: Beautiful interactive Recharts bar chart showing monthly lead acquisition with a Monthly/Annually toggle.
  - *Lead Activity*: Real-time feed tracking status movements, creation events, and deal updates.
- **Right Column**:
  - *Revenue Goal*: Recharts sparkline Area Chart plotting closed-won values.
  - *AI Sales Insights*: Sparkles-powered Gemini widget displaying a pipeline health score (0-100), automated observations, and prioritized recommendations.

### 3. 👥 Leads Management & Detail Drawer

- **Full CRUD operations**: Tweak, search, filter, and track leads in a unified list interface.
- **Advanced Filtering & Sorting**: Filter by stage, priority, or source. Sortable table columns, bulk deletions, and one-click CSV exports.
- **Dual View Modes**: Seamless toggle between List (Table) and Grid (Card) layouts.
- **Lead Detail Drawer**: Sliding glassmorphic panel displaying all lead info, associated notes, and:
  - *AI Lead Summary*: Analyzes lead value, notes, and context to generate a risk score (0-100), suggested priority, and next best action.
  - *AI Email Generator*: Drafts targeted sales emails based on tone (professional, friendly, casual, formal) and purpose (follow-up, demo schedule, intro).

### 4. 🗂️ Sales Pipeline (Kanban Board)

- Consolidated pipeline workflow utilizing 5 core stages: **New → Qualified → Proposal → Won → Lost**.
- Smooth drag-and-drop mechanics to move deals across columns.
- Real-time aggregation showing total deal count and value sum per stage.
- Persistence of drag-and-drop order and stage updates in the MongoDB database.

### 5. 📝 Notes (Masonry Grid & Pinning)

- Responsive masonry-style grid rendering notes with a "pinned" section at the top.
- Real-time content query search.
- Clean dialog options to create, edit, pin/unpin, delete, and link notes directly to specific Leads.

### 6. ✅ Follow-up Tasks (Date Range Grouping)

- Focuses on checklists categorized by due date: **Overdue, Today, Upcoming, and Completed**.
- Overdue and today tasks dynamically flagged to drive team urgency.
- Top-level Task Completion Progress Bar indicating current work productivity.

### 7. 🎨 Navbar Glass Pill Navigation

- Centered top navbar using white glass backdrop filters (`backdrop-blur-md`).
- Integrated Lucide icons directly next to tab labels (`Dashboard`, `Leads`, `Pipeline`, `Contacts`, `Follow-ups`, `Notes`).
- **Responsive Layout**: Text labels hide automatically on mobile devices, rendering a clean icon-only pill to prevent layout wrapping.
- Removed the sidebar entirely to give pages maximum horizontal screen space.

### 8. 🧠 Robust Google Gemini Integration

- Powered by the new Google GenAI `@google/genai` SDK (`gemini-2.5-flash` model).
- Strict JSON Schema constraints for predictable summaries, emails, and dashboard observations.
- **Defensive API Fallbacks**: If `GEMINI_API_KEY` is missing or the live API fails (e.g. rate-limits or expired keys), the service gracefully catches the error and serves realistic mock data, ensuring the app never throws a `500` crash.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, shadcn/ui.
- **Backend**: Next.js API Routes, NextAuth.js, JWT Sessions.
- **Database**: MongoDB (Mongoose schemas, indexes for optimized text searches, multi-tenant isolation).
- **AI Engine**: Google GenAI `@google/genai` (Gemini API with structured JSON outputs).

---

## 🗂️ Architecture Overview

```
src/
├── app/
│   ├── (auth)/             # Login & Register pages
│   ├── (main)/             # Protected app routes
│   │   ├── dashboard/      # Restructured 3-column dashboard
│   │   ├── leads/          # Leads list/card view & detail drawer
│   │   ├── pipeline/       # Drag-and-drop Kanban board (5 stages)
│   │   ├── contacts/       # Contact grid
│   │   ├── follow-ups/     # Due date task groupings & progress
│   │   ├── notes/          # Masonry grid & pinned notes
│   │   └── settings/       # Account & system preferences
│   ├── api/                # API routes (leads, notes, tasks, AI insights)
│   └── layout.tsx          # Root HTML layout
├── components/
│   ├── Navbar.tsx          # Responsive pill navbar
│   └── Logo.tsx            # CRM OS branded logo
├── features/               # Domain-specific client logic & components
├── lib/
│   ├── dbConnect.ts        # Database connection with cached mongoose instances
│   ├── gemini-service.ts   # New @google/genai structured API handlers
│   └── seedData.ts         # User-focused programmatic seed generator
└── models/                 # Mongoose schemas (User, Contact, Deal, Task, Note)
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas cluster)

### 2. Setup Steps

```bash
# Clone the repository
git clone https://github.com/vedant2863/crm
cd crm-os

# Install dependencies
npm install

# Setup environment keys
cp .env.example .env
# Edit .env and supply your MONGODB_URI and NEXTAUTH_SECRET.
# (Optional) Supply a GEMINI_API_KEY for live AI features.
```

### 3. Database Seeding (Required)

Populates the database with **39 contacts, 37 deals, 36 tasks, and 30 notes** associated strictly with the primary developer account:

```bash
npm run seed
```

### 4. Run Developer Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in using the demo credentials!

---

## 📋 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register a new user |
| `/api/leads` | `GET` / `POST` | List all user leads / Create a new lead |
| `/api/leads/:id` | `PUT` / `DELETE` | Update / Delete a lead |
| `/api/notes` | `GET` / `POST` | Fetch masonry notes (w/ search) / Create note |
| `/api/notes/:id` | `PUT` / `DELETE` | Pin-toggle, edit / Delete note |
| `/api/tasks` | `GET` / `POST` | List checklists / Create follow-up |
| `/api/ai/lead-summary` | `POST` | Get Gemini summary & risk metrics for a lead |
| `/api/ai/email-generator` | `POST` | Draft structured sales email by tone and purpose |
| `/api/ai/sales-insights` | `POST` | Analyze pipeline and return health score & suggestions |

---

## 🎨 Design System

The app uses a custom `oklch` colour palette for both light and dark modes:

| Token | Light | Dark |
|---|---|---|
| `--primary` | `oklch(0.55 0.18 260)` Indigo | `oklch(0.65 0.18 260)` |
| `--background` | `oklch(0.98 0.01 240)` | `oklch(0.12 0.02 260)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.16 0.03 260)` |

---

## 👤 Author

**Vedant Jadhav**

- GitHub: [@vedantjadhav](https://github.com/vedantjadhav)

---

## 📄 License

MIT © 2026 Vedant Jadhav
