# Mistakes to Avoid

- **Mongoose Document Serialization:** Never pass a raw Mongoose document output from database queries directly to layout context/Client components. Always apply `.lean()` to queries to get plain objects.
- **Aggregation Casting:** Mongoose does not auto-cast variables inside `.aggregate()` pipelines. Always cast string variables explicitly (`String(userId)`) or ObjectIds (`new mongoose.Types.ObjectId(id)`) manually.
- **Unused variables warnings:** TypeScript and ESLint configurations in pre-commit gates will reject unused variables. Always prefix unused parameters with an underscore and use the `void` operator.
- **Subdomain escaping:** Do not use user-supplied subdomain input strings inside regex patterns without escaping special characters, as this opens up potential ReDoS vulnerabilities.
