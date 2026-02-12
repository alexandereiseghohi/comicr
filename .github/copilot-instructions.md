# Comicr – Copilot AI Agent Instructions

## Architecture & Data Flow

- **Strict 3-layer pattern:**
  1. **Schema Layer:** Zod schemas in `src/schemas/` for all input validation (never use Drizzle schema for validation)
  2. **Database Layer:** Drizzle ORM queries/mutations in `src/database/queries/` and `src/database/mutations/`
  3. **Action Layer:** All mutations/queries go through server actions in `src/lib/actions/` (must start with `"use server"`)
- **Data flow:**
  UI Component → Server Action (Zod validation, auth check) → DAL/Mutation/Query → Drizzle → PostgreSQL

## Developer Workflow

**Setup:**

1. `pnpm install`
2. Copy `.env.template` to `.env.local` and fill required vars (see `src/lib/env.ts`)
3. `pnpm db:push` (apply schema)
4. `pnpm db:seed` (seed test data)
5. `pnpm dev` (start dev server)
6. `pnpm validate` (type-check, lint, test)

**Testing:**

- `pnpm test` (Vitest unit tests)
- `pnpm test:e2e` (Playwright E2E)
- `pnpm validate` (all checks before PRs)

**Database:**

- `pnpm db:push`, `pnpm db:seed`, `pnpm db:studio` (Drizzle Studio GUI)

## Project Patterns & Conventions

- **DAL First:** Use DAL (e.g., `comicDAL.getAll()`) for CRUD, not direct DB queries
- **Server Actions:** All mutations/queries go through `src/lib/actions/` with Zod validation and `"use server"`; always check authentication at the start
- **Return shape:** Always `{ success: true, data }` or `{ success: false, error }` (see `ActionResult` in `src/types/common.ts`). Never throw for expected errors
- **Soft delete:** Never hard-delete users/comments with children. Set `deletedAt` and anonymize PII for users, show `[deleted]` for comments
- **Rating upsert:** Use composite key `[userId, comicId]` and `onConflictDoUpdate`. If `rating=0`, delete instead of upsert
- **Comment threading:** Use `parentId` for nesting. Flat → tree conversion via utility (see `docs/architecture.md`)
- **Naming:** Utilities: `kebab-case.ts`, Components: `PascalCase.tsx`, Schemas: `{entity}.schema.ts`, Mutations/Queries: `{entity}-mutations.ts`/`{entity}-queries.ts`, Actions: `{entity}.actions.ts`

## API & Response Patterns

- **API routes:**
  - `POST /api/comics/rate` (upsert/delete rating)
  - `POST /api/comments` (create/reply)
  - `GET /api/comments?chapterId={id}` (threaded)
  - `DELETE /api/comments/{id}` (soft delete)
  - `PUT /api/profile/settings`
  - `POST /api/profile/delete-account`
- **Response:** Always `{ success, data?, error?, message? }`. Never return raw DB errors or stack traces

## Integration & Environment

- **Secrets/config:** All in `.env.local` (see `src/lib/env.ts` for validation and required/optional vars)
- **Performance:** Use Redis for hot data caching. Avoid N+1 queries, index all FKs/search fields. Use WebP/AVIF for images, lazy load in UI, code split for bundle size
- **Testing:** Unit: `tests/unit/` (Vitest), E2E: `tests/e2e/` (Playwright). Run `pnpm validate` before PRs/deploys

## Gotchas & Best Practices

- Always Zod-validate user input before DB access
- All server actions must use `"use server"` and check auth at the start
- Never hard-delete users/comments with children—use soft delete
- Always include 3–5 lines of context for file edits
- Follow naming/file structure conventions above

---

**If any section is unclear, incomplete, or missing a key project-specific pattern, please specify so it can be improved for future AI agents.**
[//]

## Troubleshooting: Copilot Chat Session Error (Context Length Exceeded)

### Error Message Example

> Sorry, your request failed. Please try again.
> Copilot Request id: 2cc6bcde-22a5-4c5e-aab8-aa3f4e68388f
> GH Request Id: 1B66:1D3A:8FA7092:A342E79:698DC64A
> Reason: Request Failed: 400 {"error":{"message":"This model's maximum context length is 128000 tokens. However, you requested 132577 tokens (92320 in the messages, 23873 in the functions, and 16384 in the completion). Please reduce the length of the messages, functions, or completion.","code":"invalid_request_body"}}

### Cause

This error occurs when the total context (messages, function calls, and completion) sent to the Copilot model exceeds its maximum allowed token limit (128,000 tokens for GPT-4.1). The request is rejected with a 400 error.

### Resolution Steps

1. **Reduce Conversation Length:**

- Clear or shorten the chat history before retrying.
- Remove unnecessary messages or context from the session.

2. **Limit Function Calls:**

- Avoid sending large function payloads or excessive tool calls in a single request.

3. **Shorten Completion Requests:**

- If requesting code generation, ask for smaller, more focused outputs.

4. **Restart Session:**

- If the error persists, restart the Copilot chat session to reset context.

5. **Monitor Token Usage:**

- Be aware of the token limits when working with large files, long conversations, or complex tasks.

### Best Practices

- Keep chat sessions concise and focused.
- Split large tasks into smaller steps.
- Use summary prompts when context is large.
- If you see this error, retry after reducing context or restarting the session.

---
