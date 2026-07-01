# Feature Development Workflow

1. **DB Model & Schema Setup:** Modify or declare Mongoose schemas in `src/models/` with compound indexes.
2. **Service Definition:** Add queries and mutations inside `src/features/<domain>/services/<domain>-service.ts` using `.lean()` for read queries.
3. **HTTP Endpoint Inlining:** Implement App Router handler `src/app/api/<domain>/route.ts`. Perform parameter validation, session verification, and errors catching inline.
4. **Side Effects Hooks:** Add post-update hooks (e.g. notifications, activities logging) inside `src/features/enterprise/services/business-logic.ts`.
5. **UI Component Rendering:** Update React client views and custom fetching hooks under `src/features/<domain>/components/` and `src/features/<domain>/hooks/`.
6. **Code verification:** Run `npm run check` and verify compiling.
