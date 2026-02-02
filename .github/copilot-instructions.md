# ComicWise (comicr) – AI Agent Instructions

## 1. Architecture & Data Flow

- **Stack:** Next.js 16 (App Router), Drizzle ORM, PostgreSQL, NextAuth v5, Zod, Zustand.
- **Data Flow:**
  `Component → Action → DAL/Mutation → Drizzle → PostgreSQL`
- **Key Directories:**
  - `src/app/` – Next.js routes (grouped: `(auth)`, `(root)`, `admin`, `dev`)
  - `src/components/` – Feature-based React components
  - `src/dal/` – Data Access Layer (DAL) for typed DB ops (`import { comicDAL } from '@/dal'`)
  - `src/database/` – Drizzle schema, queries, mutations, seeding
  - `src/lib/actions/` – Server actions (Zod-validated, `"use server"`)
  - `src/schemas/` – Zod validation schemas (not Drizzle schema)
  - `src/types/` – Centralized TypeScript types

## 2. Data Layer Patterns

- **Preferred:** Use DAL for CRUD (`comicDAL.getAll`, `comicDAL.findById`, etc.).
- **Server Actions:** For forms/mutations, use Zod schema → mutation/query → action with `"use server"`. Always check auth at the start of actions.
- **Return Shape:**
  `{ success: true, data: T } | { success: false, error: string }`

## 3. Critical Patterns & Conventions

- **Soft Delete:** Never hard-delete users/comments with children. Set `deletedAt`, anonymize PII for users, show `[deleted]` for comments.
- **Rating Upsert:** Use composite key `[userId, comicId]`, `onConflictDoUpdate`. `rating=0` triggers deletion (in API route).
- **Comment Threading:** Use `buildCommentTree` utility (O(n) two-pass) for nested comments.
- **Hybrid Sync:** Use localStorage for instant device state (zoom, pan), DB for persistent settings.
- **Reading Progress:** Auto-save with upsert on `[userId, comicId]` every 30s, on page change, and `beforeunload`.
- **Naming:**
  - Utilities: `kebab-case.ts`
  - Components: `PascalCase.tsx`
  - Schemas: `{entity}.schema.ts`
  - Mutations/Queries: `{entity}-mutations.ts`/`{entity}-queries.ts`
  - Actions: `{entity}.actions.ts`
  - UI: `src/components/ui/` (shadcn/ui)
- **Legacy Note:** Prefer `ActionResult` from `@/types` for new code.

## 4. Developer Workflows

- **Build/Dev:**
  - `pnpm dev` – Start dev server
  - `pnpm build` – Production build
  - `pnpm validate` – Type-check, lint, unit tests
- **Database:**
  - `pnpm db:push` – Apply schema
  - `pnpm db:seed` – Seed test data
  - `pnpm db:studio` – Drizzle Studio GUI
- **Testing:**
  - `pnpm test` – Unit tests (Vitest, `tests/unit/`)
  - `pnpm test:e2e` – E2E tests (Playwright, `tests/e2e/`)
- **Seeding:** See `src/database/seed/README.md` for CLI/API/UI options.

## 5. API & Validation

- **API routes:**
  - `POST /api/comics/rate` – Upsert/delete rating
  - `POST /api/comments` – Create comment/reply
  - `GET /api/comments?chapterId={id}` – Threaded comments
  - `DELETE /api/comments/{id}` – Soft delete
  - `PUT /api/profile/settings` – Update user settings
  - `POST /api/profile/delete-account` – Soft delete user
- **Validation:** All input via Zod schemas in `src/schemas/`.
- **Response:** Always `{ success, data?, error?, message? }`.

## 6. Common Pitfalls

- Always include 3–5 lines of context for file edits.
- `"use client"` required for event handlers and image `onError`.
- Always check auth in server actions.
- Use `buildCommentTree` for comment threading.
- Use upsert for progress/rating, not separate insert logic.
- Check `deletedAt IS NULL` for active records.
- Passwords: min 8 chars, uppercase, lowercase, number (see schema).

## 7. Environment & CI/CD

- **Env vars:** All validated in `src/lib/env.ts`. See `.env.local.example`.
- **CI/CD:** GitHub Actions in `.github/workflows/`. Vercel auto-deploys on push to `main`.
- **Secrets:** `DATABASE_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## 8. Quick Reference

- Add DB feature: schema → Drizzle table → `db:push` → mutations/queries → action → tests.
- Add API endpoint: route → Zod validation → auth → return shape → call DB layer.
- Debug:
  - Type: `pnpm type-check`
  - Lint: `pnpm lint`/`pnpm lint:fix`
  - Test: `pnpm test`/`pnpm test:e2e`
  - DB: `pnpm db:studio`
  - All: `pnpm validate`

---

**Feedback requested:**
Are any sections unclear, missing, or too detailed? Let me know what to clarify or expand for your AI agent workflow.
