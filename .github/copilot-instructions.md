---

# ComicWise (comicr) – AI Agent Instructions (2026)

## 1. System Architecture & Data Flow

- **Stack:** Next.js 16 (App Router), Drizzle ORM, PostgreSQL, NextAuth v5, Zod, Zustand
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

## 2. Data Layer & Validation Patterns

- **DAL First:** Use DAL for all CRUD (`comicDAL.getAll`, `comicDAL.findById`, etc.)
- **Server Actions:** For forms/mutations, use Zod schema → mutation/query → action with `"use server"`. Always check auth at the start of actions.
- **Return Shape:**
  `{ success: true, data: T } | { success: false, error: string }`
- **Validation:** All input via Zod schemas in `src/schemas/`.

## 3. Core Conventions & Patterns

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

## 4. Developer Workflow & Commands

- **Setup:**
  1. `pnpm install`
  2. Copy `.env.local.example` → `.env.local` and configure all required vars (see `src/lib/env.ts`)
  3. `pnpm db:push && pnpm db:seed` (see `src/database/seed/README.md` for seeding details)
  4. `pnpm dev` (start dev server)
  5. `pnpm validate` (type-check, lint, unit tests)
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

## 5. API, Routes & Response Patterns

- **API routes:**
  - `POST /api/comics/rate` – Upsert/delete rating
  - `POST /api/comments` – Create comment/reply
  - `GET /api/comments?chapterId={id}` – Threaded comments
  - `DELETE /api/comments/{id}` – Soft delete
  - `PUT /api/profile/settings` – Update user settings
  - `POST /api/profile/delete-account` – Soft delete user
- **Response:** Always `{ success, data?, error?, message? }`.

## 6. Testing & Validation

- **Unit tests:** Vitest (`tests/unit/`), Zod schemas, server actions, utilities
- **E2E tests:** Playwright (`tests/e2e/`), critical flows (auth, reader, profile, ratings, comments)
- **Coverage targets:** 80%+ statements/lines, 70%+ branches, 100% on critical paths
- **Validation:**
  - `pnpm type-check` (TypeScript)
  - `pnpm lint`/`pnpm lint:fix` (ESLint)
  - `pnpm test`/`pnpm test:e2e` (Vitest/Playwright)
  - `pnpm validate` (all checks)

## 7. Optimization & Cleanup

- **Performance:**
  - Redis caching for hot data
  - Optimize DB queries (avoid N+1, use indexes)
  - Image optimization (WebP, AVIF, lazy loading)
  - Bundle size reduction (code splitting, dynamic imports)
- **Code Quality:**
  - Remove unused/duplicate code
  - Kebab-case for files, PascalCase for components
  - Remove `any` types, add generics
  - Organize imports, delete deprecated files

## 8. Common Pitfalls & Gotchas

- Always include 3–5 lines of context for file edits
- `
