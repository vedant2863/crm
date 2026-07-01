# Architecture Overview

## Dynamic App Router Gateway
All incoming HTTP requests fall under the dynamic App Router files. 
- **Subdomain/Tenant Routing:** Paths prefixed with dynamic tenant segments (e.g. `/[tenant]`) load custom gateway interfaces mapped from Mongoose queries.
- **Inlined Controllers:** Business validations, query parameter sanitization, and response mappings are completely written **inline** within route files (`src/app/api/.../route.ts`). There are no controller translation layers inside features.

## Multi-Tenant Isolation
- Core entities (`Contact`, `Deal`, `Task`, `Note`) store user scopes using a string-based `userId`.
- Collaborative features retrieve user groups belonging to the same company using `getOrganizationUserIds(userId)` (cached for 60 seconds).
- Collaborative entities (`Comment`, `Activity`, `Notification`) use `ObjectId` referencing the user database model.

## In-Memory Caching (Zero Dependencies)
A custom generic `TTLCache` in `src/lib/cache.ts` prevents database read storms:
- **Org Cache:** Cached for 60 seconds.
- **Dashboard Cache:** KPI/metrics endpoints are cached for 30 seconds.
- **Notification Scan Cache:** Tasks scan is cached for 5 minutes.
