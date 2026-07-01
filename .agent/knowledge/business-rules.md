# Business Rules

## Multi-Tenant Scoping
- If sharing settings (`contactActivities`) are active, users with matching `company` values share data.
- If disabled, queries are restricted strictly to the user's specific `userId`.
- Members belong to the same tenant company as computed via `getOrganizationUserIds(userId)` (cached using a 60-second TTL org cache).

## AI Quotas
- Rolling 24-hour quota limit of 5 requests shared globally in aggregate across all AI features (Email Generator, Lead Summary, and Sales Insights).
- Exceeding the quota returns a standard 429 status code with a message ("Rolling 24-hour AI quota exceeded. Limit is 5 requests.").
- AI responses are cached in MongoDB `AiCallLog` table per key to avoid quota consumption on page refresh.

## Auditing and Side Effects
- Mutating database operations (create, update, delete) trigger business hooks in `src/features/enterprise/services/business-logic.ts`.
- These hooks execute:
  1. Activity Log inserts (saved to the `Activity` collection).
  2. Audit Log trails (saved to the `AuditLog` collection).
  3. Notification alerts (saved to the `Notification` collection).
  4. SMTP mail simulations (logged via Resend).
