# Testing Rules

- **Pre-commit Verification Gate:** Running `npm run check` is mandatory. It runs:
  1. `npm run knip` — detects unused files and exports.
  2. `npm run lint` — ESLint style checking.
  3. `npm run type-check` — TypeScript build validation (`tsc --noEmit`).
- **Production Compilation:** Run `npm run build` to compile production code and check that there are no standalone build errors.
