# Review Workflow

1. **Verify Requirements:** Cross-check the implementation with user specifications (especially performance/concurrency target and zero-dependency guidelines).
2. **Review Code Standards:** Verify style guide compliance:
   - Inline API routes.
   - Database queries optimized with `.lean()`, `.select()`, `.maxTimeMS()`.
   - Appropriate rate limits and lockouts.
3. **Verify check logs:** Ensure no warnings are thrown by typescript compiler or linter.
