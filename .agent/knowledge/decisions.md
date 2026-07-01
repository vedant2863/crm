# Architectural Decisions (ADR)

## Decision 1: Inline Request Mappings (App Router)
- **Status:** Approved.
- **Context:** Decouple feature directories from HTTP controllers.
- **Decision:** Write all Next.js API routes inline within `/api` directories. Delete all features handler layers.

## Decision 2: In-Memory TTL Caching (Zero-Dependencies)
- **Status:** Approved.
- **Context:** Support 1000 concurrent users without adding external package footprints (e.g. Redis).
- **Decision:** Build a lightweight generic `TTLCache` map inside the source tree and cache organization memberships (60s), dashboard KPIs (30s), and notifications task scans (5m).

## Decision 3: Mongoose Pool Hardening
- **Status:** Approved.
- **Context:** Prevent database connection starvation at 1000 concurrent active users.
- **Decision:** Expand max pool size to 50 with custom socket timeouts. Combine with compound queries indexing, field projections, and query timeouts.
