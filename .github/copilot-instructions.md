# ComicWise (comicr) — AI Agent Coding & Architecture Guide

## 1. Code Style & Naming

- **TypeScript, React, Next.js**: Strict typing everywhere. Use PascalCase for components, kebab-case for utilities, `{entity}.schema.ts` for Zod schemas.
- **Formatting**: Enforced by ESLint/Prettier. Run `pnpm lint` and `pnpm lint:fix` before commit.
- **Naming**:
  - Components: `PascalCase.tsx`
  - Utilities: `kebab-case.ts`
  - Schemas: `{entity}.schema.ts`
  - Types: `{entity}.ts` in `src/types/`
- **Examples**: See `src/components/ui/`, `src/utils/`, `src/schemas/`.

## 2. Architecture & Data Flow

- **Strict 3-Layer Pattern** (enforced):
  1. **Schema Layer**: Zod schemas in `src/schemas/` for all input validation (never use Drizzle schema for validation).
  2. **Database Layer**: Drizzle ORM queries/mutations in `src/database/queries/` and `src/database/mutations/`.
  3. **Action Layer**: All mutations/queries go through server actions in `src/actions/` (must start with `"use server"`).
- **Data Flow**:
  UI Component → Server Action (Zod validation, auth check) → DAL/Mutation/Query → Drizzle → PostgreSQL
- **DAL First**: Use DAL (e.g., `userDAL.getById()`) for CRUD, not direct DB queries.
- **Return Shape**: Always `{ success: true, data }` or `{ success: false, error }` (see `ActionResult` in `src/types/common.ts`).
- **Comment Threading**: Flat-to-tree conversion, see `docs/architecture.md` (`buildCommentTree`).
- **Soft Delete**: Set `deletedAt` and anonymize PII for users, show `[deleted]` for comments. Never hard-delete users/comments with children.
- **RBAC**: Roles: `user`, `moderator`, `admin` (see `docs/rbac.md`). Use `verifyAdmin()` for admin-only actions. All sensitive actions are logged to audit table.
- **Performance**: Use Redis for hot data caching. Avoid N+1 queries, index all FKs/search fields. Use WebP/AVIF for images, lazy load in UI, code split for bundle size.

## 3. Directory & File Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # React components (ui/, comics/, auth/, navigation/)
├── database/               # Drizzle ORM: schema.ts, queries/, mutations/
├── lib/                    # Core utilities (storage/, cache/, audit/)
├── actions/                # Server actions (must use "use server")
├── schemas/                # Zod validation schemas
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
├── hooks/                  # Custom React hooks
```

## 4. Build, Test, and Validate

- **Install**: `pnpm install`
- **Build**: `pnpm build`
- **Dev server**: `pnpm dev`
- **Lint**: `pnpm lint`, `pnpm lint:fix`
- **Type-check**: `pnpm type-check`
- **Unit tests**: `pnpm test` or `pnpm test:unit`
- **E2E tests**: `pnpm test:e2e`
- **Validate all**: `pnpm validate`
- **Database**: `pnpm db:push`, `pnpm db:seed`, `pnpm db:studio`

## 5. API & Integration

- **API routes**: See `docs/api-reference.md` and OpenAPI spec. All responses: `{ success, data?, error?, message? }`.
- **Drizzle ORM**: Used for all DB access.
- **Zod**: Used for all input validation.
- **Playwright**: For E2E tests.
- **Vitest**: For unit tests.

## 6. Security & Environment

- **Environment**: All secrets/config in `.env.local` (see `src/lib/env.ts`). All env vars validated at startup.
- **Sensitive actions**: All sensitive actions are logged to audit table.
- **CSRF/XSS**: NextAuth handles CSRF; React + CSP headers for XSS.
- **Rate Limiting**: See API docs for limits.

## 7. RBAC & Permissions

- **Roles**: `user`, `moderator`, `admin` (see `docs/rbac.md`).
- **Permission Model**: Resource/action format (e.g., `comic:create`).
- **Pattern**: Always check role before action. Use `verifyAdmin()` for admin-only actions. Return `{ success: false, error }` for unauthorized.
- **Session**: User session includes role info via NextAuth.

## 8. Soft Delete & PII Anonymization

- **Users**: Set `deletedAt`, anonymize name/email, remove image, preserve structure.
- **Comments**: Set `deletedAt` for comments with children, show `[deleted]` in UI.

## 9. Comment Threading

- **Flat-to-tree**: Use `buildCommentTree` utility for O(n) conversion.
- **ParentId**: Self-referencing for infinite nesting. Orphaned comments become root.

## 10. Testing

- **Unit**: Zod schemas, utilities, RBAC, DAL, actions. Target 80%+ coverage.
- **E2E**: Reader, profile, rating, comments, admin panel. Use Playwright.
- **Validation**: `pnpm validate` runs type-check, lint, and all tests.

## 11. Error Handling & API Response

- **Success**: `{ success: true, data }`
- **Error**: `{ success: false, error: string }` or `{ success: false, error: { code, message } }`
- **Paginated**: `{ success: true, data: [...], meta: { page, limit, total, totalPages, hasNextPage, hasPrevPage } }`

## 12. Audit Logging

- **All sensitive actions**: Log to both DB and file (see `docs/architecture.md`).
- **Audit log schema**: See `docs/rbac.md` and `docs/architecture.md`.

## 13. Storage & Caching

- **Storage**: Multi-provider (S3, ImageKit, Cloudinary, local). Use factory for runtime selection.
- **Caching**: Redis (Upstash/ioredis) for hot data. Use cache abstraction in `lib/cache/`.

## 14. Conventions for AI Agents

- **Never** bypass the 3-layer pattern. All mutations/queries must:
  1. Validate input with Zod schema (`src/schemas/`)
  2. Use Drizzle ORM in `src/database/queries/` or `src/database/mutations/`
  3. Be exposed only via server actions in `src/actions/` (with `"use server"`)
- **All API responses** must match `{ success, data?, error?, message? }`.
- **All new files** must follow naming conventions and directory structure above.
- **All new features** must include unit and E2E tests.
- **All sensitive actions** must be logged to audit table.
- **All environment variables** must be validated in `src/lib/env.ts`.

## 15. Agent/Prompt/Skill File Conventions

- **Prompts**: Must have `agent` and `description` in front matter, lower-case hyphenated file names, and (recommended) `model` field.
- **Instructions**: Must have `description` and `applyTo` in front matter, lower-case hyphenated file names.
- **Skills**: Each folder has a `SKILL.md` with `name` and `description` in front matter, folder name matches `name` (lower-case hyphens).
- **README.md is auto-generated**: Run `pnpm run build` after adding new agents/prompts/instructions/skills.
- **Line endings**: Always run `bash scripts/fix-line-endings.sh` before committing (CRLF → LF).

---

**For more, see:**

- `README.md` (project overview, features, quick start)
- `docs/architecture.md` (deep architecture, data flow, RBAC, storage, caching)
- `docs/api-reference.md` (API endpoints, response shapes, error codes)
- `docs/rbac.md` (roles, permissions, patterns)
- `docs/deployment.md` (deployment, env vars, troubleshooting)
- `docs/runbook.md` (operations, incident response)
- `docs/phase-status.md` (phase progress)
- `src/lib/env.ts` (env validation)

---

_Last updated: [auto-generated by AI agent]_
