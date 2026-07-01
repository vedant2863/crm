# Bugfix Workflow

1. **Locate Logs:** Retrieve log details from the console or server outputs.
2. **Reproduce Failure:** Run the application locally (`npm run dev`) or test endpoint responses directly.
3. **Trace Issues:** Look for common bug sources first:
   - `userId` mismatch (String vs ObjectId).
   - Missing `.lean()` or Mongoose class serialization issues.
   - Missing `.maxTimeMS(10000)` timeouts or un-indexed query scans.
4. **Apply Fixes:** Make minimal contiguous changes.
5. **Run Verification:** Execute `npm run check` and `npm run build` to ensure the compilation remains green.
