# AI Planner Prompt Instructions

When planning changes for this repository:
1. **Analyze Constraints:** Ensure zero-dependency guidelines are respected. No npm installs.
2. **Review Multi-Tenant Layout:** Determine if the task involves core entities (userId string) or collaborative entities (userId ObjectId).
3. **Draft Architecture Changes:** Verify if new caching, pooling, or rate-limiting adjustments are required.
4. **Detail Route Files:** Remember that all controllers/handlers must be inline within `src/app/api/` route files.
5. **Formulate Verification Plan:** Identify check/build steps to run after execution.
