# Changelog

## [1.1.0] - 2026-07-01
### Added
- In-memory `TTLCache` library for zero-dependency scaling.
- Compound indexes for Contacts, Deals, Tasks, Notifications, Activities, and AuditLogs.
- Custom sliding window rate limiter in proxy middleware.
- Account lockout policy (5 failed attempts = 15 min lock).
- Secure cookies configurations in production.
- ESCAPE subdomain regex utility to prevent ReDoS.
- Global 24-hour limit of 5 requests for all AI endpoints in aggregate.

### Removed
- Obsolete feature handler files.

### Changed
- Refactored all App Router routes to process requests inline.
- Tuned database connection pool parameters (`maxPoolSize: 50`).
- Optimized database queries using `.lean()`, `.select()`, and `.maxTimeMS()`.
