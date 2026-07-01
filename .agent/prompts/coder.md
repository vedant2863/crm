# AI Coder Prompt Instructions

When writing code:
1. **No Handlers:** Write request processing inline inside routes.
2. **Query Performance:** Add `.lean()`, `.select()`, and `.maxTimeMS(10000)` to all Mongoose read operations. Clamp page limits to 50.
3. **Database Casts:** Use `String(userId)` or `new mongoose.Types.ObjectId(userId)` depending on the target collection rules.
4. **Error Handling:** Wrap handler execution in try/catch and return `handleApiError(err)`. Throw `AppError` inside services.
5. **No Unused Code:** Avoid declaring variables or parameters that are never read. Prefix unused variables with an underscore and use `void var;` to satisfy ESLint.
