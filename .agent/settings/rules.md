# Global Developer Rules

1. **Verify Builds:** Always run `npm run check` and ensure zero errors or warnings before committing.
2. **Lean & Select:** Every read-only database query must invoke `.lean()` and utilize `.select()` projections.
3. **Handle Errors Inline:** Write route parameters validation and API responses inline in `route.ts` files.
4. **Enforce Isolation:** Ensure multi-tenant scoping via `getOrganizationUserIds` or direct `userId` checks.
