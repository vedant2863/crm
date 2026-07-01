# API Knowledge Base

## Inline App Router Handlers
API routes are defined in `src/app/api/.../route.ts`. All request handling, validation, authentication checks, and error parsing are written inline.

## Sanitization & Validation
Use utilities from `src/lib/validation.ts`:
- `sanitizeString(input, maxLength)`: Strips HTML tags and clamps lengths.
- `validateObjectId(id, fieldName)`: Enforces 24-character hexadecimal MongoDB ObjectId formats.
- `validatePagination({ page, limit })`: Verifies boundaries and limits page limits to 50 max.

## Errors & Response Structure
All error handling uses `handleApiError` in `src/lib/errors.ts`:
- Return `NextResponse.json({ error: { code, message, details } }, { status })` on catch.
- Throw custom `AppError` inside services (e.g. `AppError.rateLimited(retryAfter)`).
