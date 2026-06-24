# CRM Project Development Rules

## Database & Query Casting Invariants
- **Schema vs Aggregation Matching**: Always match the type of query parameters in MongoDB aggregation pipelines (e.g. `Deal.aggregate(...)`) exactly with the defined type in the schema.
  - If schema defines `userId` as `String`, query with string `userId` directly. Do NOT wrap it in `new mongoose.Types.ObjectId(userId)`.
  - If schema defines a field as `ObjectId`, query with `mongoose.Types.ObjectId`.
- **Standard Queries**: For standard Mongoose queries (`find`, `findOne`, `countDocuments`), Mongoose automatically casts types, but keeping query types consistent with the schema is highly recommended.

## React Hook Dependency Invariants
- **Stable Arguments**: Never pass inline objects, functions, or arrays directly into hooks (e.g., `useDeals({ limit: 200 })`) unless they are memoized (using `useMemo` or `useCallback`) or defined as static constants outside the component.
- **Dependency Arrays**: Ensure custom hook `useEffect` and `useCallback` dependency arrays only contain stable or memoized variables to prevent rendering loops.

## Project Context & Architecture

### 1. Technology Stack
- **Frontend**: Next.js 15 (App Router, dynamic and static routing), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, shadcn/ui.
- **Backend**: Next.js API Routes, NextAuth.js (JWT session strategy).
- **Database**: MongoDB (Mongoose models).
- **AI Integration**: Google GenAI `@google/genai` (Gemini API using structured JSON schema output, falling back gracefully to mock payloads on failure).

### 2. Multi-Tenant Database Isolation
- Every core entity (`Contact`, `Deal`, `Task`, `Note`) is scoped to a tenant user via `userId`.
- **Collaborative Sharing**: If the tenant's `notifications.contactActivities` is enabled, they can view collaborative records for their organization (`company` name match). Otherwise, queries default strictly to `[userId]` (private).

### 3. Collection Type Guide
- **`users`**: NextAuth user data. In Mongoose, this maps to the `User` model (`mongoose.model("User", userSchema)`).
- **`contacts`**: Contacts/leads database. `userId` is a `String`.
- **`deals`**: Leads/opportunities pipeline. `userId` is a `String`.
- **`tasks`**: Checklists/reminders. `userId` is a `String`.
- **`notes`**: Masonry text notes. `userId` is a `String`.
- **`comments`**, **`activities`**, **`notifications`**: Collaborative timeline events. `userId` is stored as an `ObjectId` in these three collections.

### 4. Code & Directory Structure
- `src/app/(auth)/`: Login, registration, and session layouts.
- `src/app/(main)/`: Core application pages (Dashboard, Leads, Kanban Pipeline, Contacts, Tasks/Follow-ups, Notes, Settings).
- `src/features/`: Domain-specific components, custom hooks, and clients (e.g., `deals`, `dashboard`, `tasks`, `notes`).
- `src/lib/`: Backend services (`seedData.ts`, `gemini-service.ts`, `dbConnect.ts`).
- `src/models/`: MongoDB schema definitions.

### 5. Premium Glassmorphic Design Invariants
- Custom centered Navbar pill with Lucide icons (text labels hide on mobile for responsiveness).
- White glass backdrops (`backdrop-blur-md`) and subtle micro-animations.
- Curated color tokens using `oklch` (e.g., Indigo primary theme).
