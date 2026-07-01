# Database Knowledge Base

## Mongoose Connection Pool
Tuned inside `src/lib/dbConnect.ts` to manage 1000 concurrent users:
- `maxPoolSize: 50`
- `minPoolSize: 5`
- `socketTimeoutMS: 45000`
- `serverSelectionTimeoutMS: 5000`

## Indexes
- **Compound:** Added to Contacts, Deals, Tasks, and AuditLogs to ensure queries with filters and sorting resolve via indexes rather than collection scans.
- **TTL Indexes:** Added to Notifications (90 days) and Activities (180 days) for auto-deletion of expired logs.

## Query Performance Standards
- Always use `.lean()` on reads to skip Mongoose document wrapping.
- Always use `.select()` to limit field projections.
- Always set `.maxTimeMS(10000)` timeouts to prevent database query execution locks.
