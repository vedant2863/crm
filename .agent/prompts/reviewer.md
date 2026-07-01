# AI Reviewer Prompt Instructions

When reviewing pull requests or changes:
1. **Ensure inline routes:** Confirm that no route handler layers are introduced inside `src/features/`.
2. **Check for serialization issues:** Ensure `.lean()` is applied to queries that supply data to components.
3. **Check for timeouts:** Confirm every read query has `.maxTimeMS(10000)` configured.
4. **Verify rate limits:** Check if new endpoints are rate-limited in middleware or rate-limiters.
5. **Check code checks:** Verify `npm run check` and `npm run build` run successfully.
