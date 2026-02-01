# ComicWise (comicr) - AI Agent Instructions

## Architecture Overview

**Stack**: Next.js 16 (App Router) + Drizzle ORM + PostgreSQL + NextAuth v5 + Zod + Zustand

**Data Flow**: `Component → Action → Mutation/Query → Drizzle → PostgreSQL`

### Key Directories

- `src/app/` — Next.js App Router pages (route groups: `(auth)`, `(root)`, `admin`, `dev`)
- `src/components/` — React components organized by feature (`comics/`, `bookmarks/`, `auth/`, `ui/`)
- `src/database/` — Schema, queries, mutations, and seed logic
- `src/lib/actions/` — Server actions with Zod validation
- `src/schemas/` — Zod validation schemas (separate from Drizzle schema)
- `src/types/` — Centralized TypeScript types (import from `@/types`)

## Data Layer Pattern

**Always follow this 3-layer pattern:**

1. **Schema** (`src/schemas/{entity}.schema.ts`) — Zod validation
2. **Mutation/Query** (`src/database/mutations/`, `src/database/queries/`) — Direct Drizzle operations
3. **Action** (`src/lib/actions/{entity}.ts`) — Public API with `"use server"` directive

```typescript
// Pattern: Server action with auth + validation + mutation
"use server";
import type { ActionResult } from "@/types";
import * as mutations from "@/database/mutations/comic-mutations";
import { createComicSchema, type CreateComicInput } from "@/schemas/comic-schema";

export async function createComicAction(
  input: CreateComicInput
): Promise<ActionResult<{ id: number }>> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }
  const validation = createComicSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Validation failed" };
  }
  const result = await mutations.createComic(validation.data);
  return result.success
    ? { success: true, data: { id: result.data?.id || 0 } }
    : { success: false, error: result.error };
}
```

**Return shapes:**

- **Actions**: `ActionResult<T>` = `{ success: true, data: T } | { success: false, error: string }`
- **Mutations/Queries**: `{ success: true, data: T } | { success: false, error: string }`

## Client vs Server Components

- Components using event handlers (`onClick`, `onError`, etc.) MUST have `"use client"` directive
- Image components with `onError` fallbacks require client directive
- Server Components: No async at component level for data fetching in RSC, use queries directly

## Authentication

- NextAuth v5 with Drizzle adapter in `src/lib/auth-config.ts`
- Auth pages at `/sign-in`, `/sign-up`, `/error`, `/verify-request` (NOT `/auth/*`)
- Password utilities: `src/lib/password.ts` (`hashPassword`, `verifyPassword`)
- Session type extended in `src/types/auth.ts`

## Database Schema

Primary tables in `src/database/schema.ts`:

- **Auth**: `user`, `account`, `session`, `verificationToken`, `passwordResetToken`
- **Content**: `comic`, `chapter`, `author`, `artist`, `genre`, `type`
- **User data**: `bookmark`, `comment`, `rating`, `readingProgress`, `readerSettings`, `notification`

## Critical Design Patterns

### 1. Soft Delete Pattern

- **Never hard delete** users or comments with children
- Set `deletedAt` timestamp, anonymize PII for users
- **User**: `name='Deleted User'`, `email='deleted_{id}@example.com'`, `image=NULL`
- **Comment**: Show `[deleted]` if `deletedAt !== null`, preserve nested replies

```typescript
// Example: User soft delete with PII anonymization
await db
  .update(user)
  .set({
    deletedAt: new Date(),
    name: "Deleted User",
    email: `deleted_${userId}@example.com`,
    image: null,
  })
  .where(eq(user.id, userId));
```

### 2. Rating Upsert Pattern

- **Composite unique constraint**: `[userId, comicId]`
- Use `onConflictDoUpdate` for insert or update
- **Special case**: `rating=0` triggers deletion (handled in API route, not mutation)

```typescript
// In API route: POST /api/comics/rate
if (body.rating === 0) {
  return await deleteRating(userId, body.comicId);
}
// Otherwise, upsert with onConflictDoUpdate
```

### 3. Comment Threading

- **Self-referencing**: `comment.parentId` references `comment.id`
- Use `buildCommentTree` utility (O(n) two-pass algorithm) to convert flat list to tree
- **Orphaned comments** (deleted parent) become root-level entries

```typescript
// Usage: Get threaded comments
const flatComments = await getComments(chapterId);
const tree = buildCommentTree(flatComments);
```

### 4. Hybrid Sync Strategy

- **localStorage**: Device-specific instant state (zoom level, pan position)
- **Database**: Cross-device persistent state (reading mode, quality, settings)
- **Pattern**: Update localStorage immediately, debounce DB saves

```typescript
// Instant local update
localStorage.setItem("readerZoom", String(zoom));
// Delayed DB sync (on form submit, not per keystroke)
await updateReaderSettingsAction({ readingMode, imageQuality });
```

### 5. Reading Progress Auto-Save

- **Upsert pattern**: Composite key `[userId, comicId]`
- **Triggers**: 30s interval + page change + `beforeunload` event
- Store: `currentImageIndex`, `scrollPercentage`, `progressPercent`

```typescript
// Auto-save implementation
useEffect(() => {
  const interval = setInterval(() => saveProgress(), 30000);
  window.addEventListener("beforeunload", saveProgress);
  return () => {
    clearInterval(interval);
    window.removeEventListener("beforeunload", saveProgress);
  };
}, [pageIndex, scrollPercentage]);
```

## Developer Commands

```bash
pnpm dev              # Start dev server
pnpm validate         # Type-check + lint + unit tests (run before commits)
pnpm db:push          # Push schema changes to database
pnpm db:seed          # Seed database with test data
pnpm db:studio        # Open Drizzle Studio GUI
pnpm test:e2e         # Run Playwright E2E tests
```

## Testing

- **Unit tests**: Vitest in `tests/unit/` — test schemas, utilities, actions
- **E2E tests**: Playwright in `tests/e2e/` — test user flows (reader, profile, ratings, comments)
- Run `pnpm validate` before committing (runs type-check + lint + unit tests)
- Run `pnpm test:e2e` for full Playwright suite

**Test patterns:**

- Schema tests: Validate all edge cases (min/max, required fields, type coercion)
- Utility tests: Cover tree building, data transformations (e.g., `buildCommentTree`)
- E2E tests: Test critical user flows with authentication, navigation, form submission

## API Routes

### New Endpoints (Phase 5)

**Rating:**

- `POST /api/comics/rate` — Upsert rating (1-5) or delete (rating=0)
- Validation: `ratingSchema` (1-5 integer, optional review max 1000 chars)

**Comments:**

- `POST /api/comments` — Create comment/reply (parentId optional for threading)
- `GET /api/comments?chapterId={id}` — Get threaded comment tree
- `DELETE /api/comments/{id}` — Soft delete with ownership check
- Validation: `commentSchema` (1-2000 chars trimmed, parentId optional)

**Profile:**

- `PUT /api/profile/settings` — Update user preferences (JSONB storage)
- `POST /api/profile/delete-account` — Soft delete with PII anonymization
- Validation: `settingsSchema`, `changePasswordSchema` (min 8 chars, uppercase, lowercase, number)

**All routes return:** `{ success: boolean, data?: T, error?: string, message?: string }`

## Conventions

- File naming: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Schema files: `{entity}.schema.ts` or `{entity}-schema.ts` in `src/schemas/`
- Query files: `{entity}.queries.ts` or `{entity}-queries.ts` in `src/database/queries/`
- Mutation files: `{entity}.mutations.ts` or `{entity}-mutations.ts` in `src/database/mutations/`
- Action files: `{entity}.ts` or `{entity}.actions.ts` in `src/lib/actions/`
- UI components from shadcn/ui in `src/components/ui/`

**Note:** Some legacy files use inconsistent naming (e.g., `bookmark.action.ts` with `ok`/`error` vs `comic.ts` with `success`/`error`). Prefer the `ActionResult` type from `@/types` for new code.

## Seeding

See `src/database/seed/README.md` — supports CLI (`pnpm seed`), API (`/api/dev/seed`), and admin UI (`/dev/seed`)

## Common Pitfalls & Solutions

1. **String replacement failures**: Always include 3-5 lines of context before/after when using file edits
2. **Client/Server boundaries**: Event handlers require `"use client"`, image `onError` requires client directive
3. **Auth in actions**: ALWAYS start server actions with `const session = await auth();` check
4. **Rating deletion**: Use `rating=0` in API route, not in mutation directly
5. **Comment threading**: Always use `buildCommentTree` utility, never manual recursion in queries
6. **Progress saving**: Use composite key upsert `[userId, comicId]`, not separate insert logic
7. **Soft deletes**: Check `deletedAt IS NULL` in WHERE clauses for active records
8. **Password validation**: Schema requires min 8 chars + uppercase + lowercase + number

## Schema Migration Checklist

Recent schema updates require these fields:

- `readerSettings` table for user reading preferences
- `comment.parentId` (nullable int) for threading
- `comment.deletedAt` (timestamp) for soft delete
- `user.settings` (JSONB) for preferences
- `user.deletedAt` (timestamp) for soft delete
- `rating` type integer (1-5 scale)
- `readingProgress.currentImageIndex`, `scrollPercentage`, `progressPercent`

Run `pnpm db:push` after schema changes.

## Zustand Stores

Global client state in `src/store/` and `src/hooks/`:

- **`useAppStore`** (`src/store/useAppStore.ts`) — App-wide state (theme)
- **`useUIStore`** (`src/hooks/useUIStore.ts`) — UI state with Sentry breadcrumbs (modals, theme)

```typescript
// Usage pattern - import the hook directly
import { useUIStore } from "@/hooks/useUIStore";

function Component() {
  const { isModalOpen, setModalOpen } = useUIStore();
  // ...
}
```

## Environment Variables

All env vars validated via Zod in `src/lib/env.ts`. Required variables:

| Variable                  | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string                    |
| `AUTH_SECRET`             | NextAuth secret (min 32 chars)                  |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth credentials                        |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth credentials                        |
| `EMAIL_FROM`              | Sender email for transactional emails           |
| `NEXT_PUBLIC_API_URL`     | Public API base URL                             |
| `CUSTOM_PASSWORD`         | Default password for seeded users (min 8 chars) |

Optional services: `IMAGEKIT_*`, `CLOUDINARY_*`, `STRIPE_*`, `SENTRY_DSN`, `REDIS_*`

```bash
# Validate env setup
pnpm validate:env
```

## ImageKit Integration

Image CDN via `@imagekit/next` package. Configure in `.env`:

```env
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

For seeding/downloads, use `src/lib/imageHelper.ts` which handles:

- Format validation (jpeg, png, webp, avif)
- Size limits (`SEED_MAX_IMAGE_SIZE_BYTES`, default 5MB)
- Retry logic with exponential backoff
- Fallback to placeholder on failure

## CI/CD Workflows

GitHub Actions in `.github/workflows/`:

| Workflow         | Trigger           | Purpose                             |
| ---------------- | ----------------- | ----------------------------------- |
| `ci.yml`         | Push/PR to `main` | Type-check, lint, unit tests, build |
| `cd.yml`         | Push to `main`    | Full validation + deploy to Vercel  |
| `ci-verify.yml`  | PR                | Additional verification checks      |
| `migrations.yml` | Manual/scheduled  | Database migrations                 |

**Deployment**: Vercel auto-deploys on push to `main`. Set `VERCEL_TOKEN` secret for CLI deploys.

```bash
# Manual deploy
pnpm deploy:vercel
```

Required GitHub Secrets for CI/CD:

- `DATABASE_URL` — for migration workflows
- `VERCEL_TOKEN` — for deployments
- `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — Vercel project config

## Quick Reference: Common Tasks

**Add new feature with database:**

1. Create Zod schema in `src/schemas/{feature}.schema.ts`
2. Update `src/database/schema.ts` with Drizzle table
3. Run `pnpm db:push` to apply schema
4. Create mutations in `src/database/mutations/{feature}-mutations.ts`
5. Create queries in `src/database/queries/{feature}-queries.ts`
6. Create server action in `src/lib/actions/{feature}.actions.ts`
7. Write tests in `tests/unit/schemas/{feature}.schema.test.ts`

**Add API endpoint:**

1. Create route in `src/app/api/{endpoint}/route.ts`
2. Import Zod schema for validation
3. Use `auth()` for protected routes
4. Return `{ success, data?, error?, message? }` format
5. Call mutation/query from database layer

**Debug issues:**

- Type errors: Run `pnpm type-check`
- Lint errors: Run `pnpm lint` or `pnpm lint:fix`
- Test failures: Run `pnpm test` or `pnpm test:e2e`
- Database issues: Check `pnpm db:studio` for data inspection
- All at once: Run `pnpm validate` (type-check + lint + tests)
