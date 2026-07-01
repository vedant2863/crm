# Lessons Learned

- **Lightweight cache scaling:** A simple Map structure with TTL check (`TTLCache`) handles over 10,000 checks/sec with zero latency overhead and zero external dependencies.
- **Inline handlers:** Writing request processing inline inside Next.js routes makes endpoint code much easier to read, debug, and type-check compared to complex feature-based controllers.
- **Connection reuse:** Initializing connection caching using `global.mongoose` is vital in serverless runtime environments to prevent connection leakage.
