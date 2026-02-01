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
- **User data**: `bookmark`, `comment`, `rating`, `readingProgress`, `notification`

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

- **Unit tests**: Vitest in `tests/unit/` — test actions, mutations, queries
- **E2E tests**: Playwright in `tests/e2e/` — test user flows
- Run `pnpm validate` before committing

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
