# Refactoring Workflow

1. **Identify Target:** Identify bottlenecks (e.g. repeated DB queries, missing indexes, bloated handler layers).
2. **Abstract Utilities:** Write centralized functions in `src/lib/` (e.g. `cache.ts`, `errors.ts`, `validation.ts`) to avoid external dependencies.
3. **Migrate Logic:** Move handlers inline into routes, update service logic, or rewrite database calls.
4. **Clean up:** Run `git rm` on obsolete files.
5. **Lint & Build:** Run `npm run check` and `npm run build` to confirm refactored code has no errors or warnings.
