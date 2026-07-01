# Glossary

- **Tenant:** A workspace subdomain/path mapping representing a unique organization in the CRM database.
- **Collaborative Sharing:** Sharing settings toggle (`contactActivities`). If active, users with matching `company` values share data. If disabled, data is private to the creator.
- **Sliding Window rate-limiting:** Rate limiter tracking request timestamps in rolling 60s windows to reject traffic bursts with 429 status codes.
- **Account Lockout:** 15-minute login lockout triggered after 5 consecutive password failures.
- **Lean Read:** Query using Mongoose `.lean()` to fetch plain JSON objects, preventing serialization class overhead.
- **Global AI Quota:** Rolling 24-hour quota limiting users to 5 total AI requests across all endpoints (insights, summaries, emails) in aggregate.
