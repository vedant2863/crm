# TypeScript Style Guidelines

- **Strict Types:** `tsconfig.json` has `strict: true`. Avoid using `any`.
- **Import Aliases:** Import local components/libraries using path aliases:
  - `@/*` -> `./src/*`
  - `@/features/*` -> `./src/features/*`
- **Mongoose Document Hydration:**
  - Interfaces for schemas must extend Mongoose `Document` (e.g. `export interface IContact extends Document`).
  - Use `.lean()` to query plain JavaScript objects to prevent React serialization errors in Next.js Server Components.
- **Zod schemas:** Centrally exported from `src/lib/ai/schemas.ts` and used to infer types (`type Input = z.infer<typeof schema>`).
