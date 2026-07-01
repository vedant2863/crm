# AI Debugger Prompt Instructions

When debugging errors:
1. **Analyze stack traces:** Trace errors to specific lines.
2. **Evaluate type safety:** Check for missing TypeScript declarations or incorrect types.
3. **Mongoose Serialization:** If the error states `Only plain objects, and a few built-ins, can be passed to Client Components`, check if a query missed `.lean()`.
4. **Unused vars:** If compiling fails on TS6133, check if variables are unused.
5. **ReDoS prevention:** If regex matches fail, ensure special characters are escaped and match is restricted.
