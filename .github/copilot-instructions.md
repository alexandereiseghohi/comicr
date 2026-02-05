# ComicWise (comicr) – AI Agent Instructions (2026)

This document provides essential, actionable guidance for AI coding agents working in the ComicWise (comicr) codebase. It covers architecture, workflows, conventions, and unique project patterns to ensure immediate productivity and maintainability.

## 1. System Architecture & Data Flow

- **Stack:** Next.js 16 (App Router), Drizzle ORM, PostgreSQL, NextAuth v5, Zod, Zustand
- **Architecture:** Strict 3-layer separation:
  - **Schema Layer:** Zod schemas in `src/schemas/` for all input validation (never use Drizzle schema for validation)
  - **Database Layer:** Drizzle ORM queries/mutations in `src/database/` (split into `queries/` and `mutations/`)
  - **Action Layer:** Server actions in `src/lib/actions/` (always use `"use server"` directive at the top)
- **Data Flow:**
  - UI Component → Server Action (validates input, checks auth) → DAL/Mutation/Query → Drizzle → PostgreSQL
  - Example: A rating form submits to a server action, which validates with Zod, checks user auth, then calls a mutation in `src/database/mutations/`.
- **Key Directories:**
  - `src/app/` – Next.js App Router routes, grouped by feature (e.g., `(auth)`, `(root)`, `admin`, `dev`)
  - `src/components/` – Feature-based React components (see `ui/` for shadcn/ui)
  - `src/database/` – Drizzle schema, queries, mutations, and seeding logic
  - `src/lib/actions/` – All server actions (entrypoint for mutations/queries)
  - `src/schemas/` – Zod schemas for all user input
  - `src/types/` – Centralized TypeScript types (never duplicate types)

## 2. Developer Workflow

**Setup:**

1. `pnpm install` – Install dependencies
2. Copy `.env.local.example` to `.env.local` and fill all required variables (see `src/lib/env.ts` for required/optional)
3. `pnpm db:push` – Apply Drizzle schema to database
4. `pnpm db:seed` – Seed with test data (see `src/database/seed/README.md` for CLI/API/UI options)
5. `pnpm dev` – Start dev server at http://localhost:3000
6. `pnpm validate` – Run type-check, lint, and all tests

**Build/Dev:**

- `pnpm dev` – Hot-reloads, uses App Router
- `pnpm build` – Production build (fails on type/lint errors)
- `pnpm validate` – Runs type-check, lint, and all tests (use before PRs)

**Database:**

- `pnpm db:push` – Push schema changes
- `pnpm db:seed` – Seed test data
- `pnpm db:studio` – Visual DB browser (Drizzle Studio)

**Testing:**

- `pnpm test` – Unit tests (Vitest, covers Zod schemas, utilities, server actions)
- `pnpm test:e2e` – E2E tests (Playwright, covers reader, profile, ratings, comments)

**Seeding:**

- See `src/database/seed/README.md` for CLI/API/UI seeding options and troubleshooting.

## 3. Project-Specific Patterns & Conventions

- **DAL First:** If a Data Access Layer (DAL) exists (e.g., `comicDAL`), always use it for CRUD. Example: `comicDAL.getAll()` instead of direct DB query.
- **Server Actions:** All mutations/queries must go through server actions in `src/lib/actions/`, with Zod validation and explicit `"use server"` at the top. Always check authentication at the start of actions.
- **Return Shape:**
  - Always return `{ success: true, data }` or `{ success: false, error }` (see `ActionResult` in `src/types/common.ts`). Never throw for expected errors.
- **Soft Delete:**
  - Never hard-delete users or comments with children. Instead, set `deletedAt` and anonymize PII for users, or show `[deleted]` for comments. See comment and user actions for examples.
- **Rating Upsert:**
  - Use composite key `[userId, comicId]` and `onConflictDoUpdate` for ratings. If `rating=0`, delete the rating instead of upserting.
- **Comment Threading:**
  - Use `buildCommentTree` utility (O(n) two-pass) to convert flat comment lists to nested trees. See `src/utils/buildCommentTree.ts`.
- **Hybrid Sync:**
  - Store instant device state (e.g., zoom, pan) in localStorage; store persistent settings in DB for cross-device sync.
- **Reading Progress:**
  - Auto-save reading progress with upsert on `[userId, comicId]` every 30s, on page change, and on `beforeunload` event.
- **Naming Conventions:**
  - Utilities: `kebab-case.ts`
  - Components: `PascalCase.tsx`
  - Schemas: `{entity}.schema.ts`
  - Mutations/Queries: `{entity}-mutations.ts`/`{entity}-queries.ts`
  - Actions: `{entity}.actions.ts`
  - UI: `src/components/ui/` (shadcn/ui)

## 4. API & Response Patterns

- **API routes:**
  - `POST /api/comics/rate` – Upsert or delete a rating (see upsert pattern above)
  - `POST /api/comments` – Create comment or reply (parentId optional)
  - `GET /api/comments?chapterId={id}` – Get threaded comments (uses `buildCommentTree`)
  - `DELETE /api/comments/{id}` – Soft delete comment (ownership and child check)
  - `PUT /api/profile/settings` – Update user settings (JSONB)
  - `POST /api/profile/delete-account` – Soft delete user (PII anonymization)
- **Response Shape:**
  - Always `{ success, data?, error?, message? }`. Never return raw DB errors or stack traces.

## 5. Testing & Validation

- **Unit tests:**
  - Use Vitest (`tests/unit/`). Cover Zod schemas, server actions, and utilities. Example: `pnpm test` or `pnpm test path/to/file`.
- **E2E tests:**
  - Use Playwright (`tests/e2e/`). Cover all critical user flows: reader navigation, profile, ratings, comments. Example: `pnpm test:e2e` or `pnpm test:e2e reader`.
- **Validation:**
  - `pnpm type-check` – TypeScript strict mode
  - `pnpm lint`/`pnpm lint:fix` – ESLint (see config for rules)
  - `pnpm test`/`pnpm test:e2e` – All tests
  - `pnpm validate` – Run all checks before PRs or deploys

## 6. Integration, Performance & Gotchas

- **Environment:**
  - All secrets and config in `.env.local` (see `.env.local.example`).
  - Use `src/lib/env.ts` to validate and document required/optional variables.
- **Performance:**
  - Use Redis for hot data caching (see DB layer for integration points).
  - Optimize DB queries: always avoid N+1, use indexes for all foreign keys and search fields.
  - Image optimization: prefer WebP/AVIF, use lazy loading in UI, and optimize bundle size with code splitting and dynamic imports.
- **Common Pitfalls:**
  - Always include 3–5 lines of context for file edits (for safe AI code modification).
  - Never hard-delete users/comments with children—always use soft delete patterns.
  - All user input must be Zod-validated before DB access.
  - All server actions must use `"use server"` and check auth at the start.
  - Use only project conventions for naming and file structure (see above).

---

**Feedback needed:**
If any section is unclear, incomplete, or missing a key project-specific pattern, please specify so it can be improved for future AI agents.
