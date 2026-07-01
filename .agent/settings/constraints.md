# Architectural Constraints

- **No New Dependencies:** Do not add any new packages to `package.json` for performance upgrades. Re-use custom libraries (e.g. `TTLCache`, sliding limiter).
- **Inline App Router Routes:** Never create handler layers under features folders. Request-response cycles are inline only.
- **Quota Checks:** Enforce global 5-call rolling quota limits on all AI requests combined.
- **Lockout Enforcement:** Ensure brute force login locking is enabled in NextAuth options.
