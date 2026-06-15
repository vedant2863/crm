<div align="center">

# 🚀 CRM OS

**A full-stack Customer Relationship Management platform built with Next.js 15, TypeScript, MongoDB and a premium glassmorphism design system.**

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://next-auth.js.org/)

</div>

---

## 📸 Screenshots

> **Live Demo** → [http://localhost:3001](http://localhost:3001)
>
> **Demo Credentials**
> - Email: `vedantjadhav880@gmail.com`
> - Password: `vedantjadhav880`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based auth with NextAuth.js — register, login, session persistence |
| 📊 **Analytics Dashboard** | Revenue forecast charts, deal pipeline funnel, task distribution donuts |
| 👥 **Contact Management** | Full CRUD, search & filter, status tracking, paginated list |
| 💼 **Deal Pipeline** | Kanban board + list view, stage advancement, probability-weighted revenue |
| ✅ **Task Tracker** | Priority levels, status workflow, due-date tracking |
| 🔍 **Global Search** | Instant cross-entity search across contacts, deals and tasks |
| ⚙️ **User Settings** | Profile, notifications, security, and data management tabs |
| 🌗 **Dark / Light Mode** | System-aware theming using CSS `oklch` colour tokens |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** — App Router, Server & Client components, Turbopack dev server
- **TypeScript** — Strict type-safety across all components and API routes
- **Tailwind CSS v4** — Utility-first styling with a custom `oklch` design token system
- **shadcn/ui** — Accessible, composable component primitives (Card, Dialog, Tabs, Sidebar…)
- **Recharts** — AreaChart, BarChart, PieChart for analytics widgets
- **Lucide React** — Consistent icon system throughout

### Backend
- **Next.js API Routes** — RESTful endpoints for all entities
- **MongoDB** — NoSQL document database for flexible CRM data
- **Mongoose** — Schema validation, ObjectId casting, aggregation pipelines
- **NextAuth.js** — Credential-based auth with bcrypt password hashing
- **JWT Sessions** — Stateless session management

### Design System
- **Glassmorphism** — `backdrop-blur` + semi-transparent backgrounds
- **oklch colour space** — Perceptually uniform indigo/violet palette
- **Micro-animations** — Hover lifts, fade-ins, pulsing blobs
- **Premium Cards** — Coloured glow orbs, subtle border transitions

---

## 🗂️ Project Architecture

```
src/
├── app/
│   ├── (auth)/           # Login & Register pages
│   ├── (main)/           # Protected app routes
│   │   ├── dashboard/    # Analytics dashboard
│   │   ├── contacts/     # Contact management
│   │   ├── deals/        # Deal pipeline
│   │   ├── tasks/        # Task tracker
│   │   ├── search/       # Global search
│   │   └── settings/     # User preferences
│   ├── api/              # REST API endpoints
│   │   ├── auth/         # NextAuth + Register
│   │   ├── contacts/     # CRUD + search
│   │   ├── deals/        # CRUD + pipeline stats
│   │   ├── tasks/        # CRUD + task stats
│   │   ├── dashboard/    # KPIs, analytics, pipeline
│   │   └── settings/     # Profile & security
│   └── page.tsx          # Marketing landing page
├── components/
│   ├── Navbar.tsx        # Top navigation bar
│   ├── app-sidebar.tsx   # Collapsible side navigation
│   └── ui/               # shadcn/ui primitives
├── features/             # Self-Contained Domain Modules
│   ├── auth/             # Authentication Feature (components, services, API handlers)
│   ├── contacts/         # Contacts Feature
│   ├── dashboard/        # Dashboard Feature
│   ├── deals/            # Deals Feature
│   ├── tasks/            # Tasks Feature
│   ├── search/           # Search Feature
│   └── settings/         # Settings Feature
├── components/           # Global Components Only (Navbar, app-sidebar, UI primitives)
├── hooks/                # Global Hooks Only
├── models/               # Mongoose database models
├── utils/                # Global utility helper functions
└── lib/                  # Database connectivity, Auth config, seed data
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/crm-os.git
cd crm-os

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and NextAuth secret

# 4. Seed the database with demo data
npm run seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/crm-os
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

---

## 📋 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts` | List all contacts |
| `POST` | `/api/contacts` | Create a contact |
| `PUT` | `/api/contacts/:id` | Update a contact |
| `DELETE` | `/api/contacts/:id` | Delete a contact |
| `GET` | `/api/deals` | List deals (filter by stage/search) |
| `POST` | `/api/deals` | Create a deal |
| `GET` | `/api/tasks` | List tasks (filter by status/priority) |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/dashboard/kpis` | Revenue, conversion rate, totals |
| `GET` | `/api/dashboard/analytics` | Forecast, stage, task distribution |
| `GET` | `/api/dashboard/pipeline` | Pipeline stage counts + values |
| `GET` | `/api/search?q=term` | Cross-entity search |

---

## 🎨 Design System

The app uses a custom `oklch` colour palette for both light and dark modes:

| Token | Light | Dark |
|---|---|---|
| `--primary` | `oklch(0.55 0.18 260)` indigo | `oklch(0.65 0.18 260)` |
| `--background` | `oklch(0.98 0.01 240)` | `oklch(0.12 0.02 260)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.16 0.03 260)` |

---

## 👤 Author

**Vedant Jadhav**
- GitHub: [@vedantjadhav](https://github.com/vedantjadhav)

---

## 📄 License

MIT © 2026 Vedant Jadhav
