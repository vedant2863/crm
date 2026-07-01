# Project Roadmap

## Phase 1: 1000-User Scaling & Performance (Completed)
- Centralized org-cache with 60s TTL.
- Database connection pool expansion (`maxPoolSize: 50`, `minPoolSize: 5`).
- Query performance optimizations (`.lean()`, `.select()`, `.maxTimeMS(10000)`).
- Custom sliding window rate limiters (API: 120/min, Auth: 30/min).
- Inline HTTP handler refactoring in App Router API routes.

## Phase 2: AI Enhancements & Lockout Policies (Completed)
- Shared rolling 24-hour limit of 5 requests for all AI endpoints combined.
- Removal of mock fallback data on AI key failures (returns HTTP status errors).
- Account lockout policy: 5 failed attempts lock login for 15 minutes.

## Phase 3: Testing & Code Coverage (Planned)
- Implement Jest unit testing suite for rate limiters, cache mechanisms, and query builders.
- Implement Cypress/Playwright integration tests for multi-tenant isolation.
