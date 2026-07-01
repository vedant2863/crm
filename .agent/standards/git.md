# Git Workflow Rules

- **Commit Verification Gate:** Always execute `npm run check` to verify lint, Knip, and typescript builds before submitting commits.
- **Commit Messages:** Use descriptive semantic style messages (e.g. `feat: add sliding window rate limiting`, `fix: add .lean() to prevent mongoose serialization error`).
- **Ignore files:** Ensure that `.env`, `.next/`, and `node_modules/` are strictly excluded in `.gitignore`. Always commit config files like `next.config.ts`, `tsconfig.json`, and `knip.json`.
