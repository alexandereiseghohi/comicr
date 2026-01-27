# ComicWise - AI Coding Agent Instructions

## Project Overview
ComicWise is a Next.js 16 comic platform with PostgreSQL, Redis, and comprehensive CRUD operations. Key focus: performance, type safety, and maintainable architecture.

## Critical Architecture Patterns

### 1. Path Aliases (MANDATORY)
Use these exact import aliases - never use relative paths outside immediate directory:
```typescript
import { db } from "db";                    // Database client
import { auth } from "auth";                // NextAuth session
import { env } from "env";                  // Validated environment (T3)
import { SomeComponent } from "components/ui/some-component";
import { someAction } from "actions/some-action";
import { someDal } from "dal/someDal";
import { SomeDto } from "dto";              // All DTOs exported from index
import { Comic, Chapter } from "types";     // Database types
```
Full aliases in [tsconfig.json](tsconfig.json) lines 30-64. Never create new aliases without updating tsconfig.

### 2. Server Actions Pattern (29+ actions follow this)
```typescript
"use server";  // MUST be first line

import type { ActionResult } from "@/dto";
import { z } from "zod";

const inputSchema = z.object({ /* ... */ });

export async function myAction(input: unknown): Promise<ActionResult<T>> {
  try {
    const validated = inputSchema.parse(input);
    // Logic here
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```
- **Never** define response types inline - import from [src/dto/actionResponseDto.ts](src/dto/actionResponseDto.ts)
- Location: `src/lib/actions/*.ts` OR `src/app/(route)/actions.ts` for route-specific
- See [DTO_AND_SERVER_ACTIONS_REPORT.md](DTO_AND_SERVER_ACTIONS_REPORT.md) for full inventory

### 3. Data Access Layer (DAL) Pattern
Use DAL singletons, NOT direct database queries:
```typescript
import { comicDal } from "dal/comicDal";

// ✅ Correct
const comic = await comicDal.findById(id);
const comics = await comicDal.list({ limit: 10, offset: 0 });

// ❌ Wrong - never query database directly in actions/components
const comic = await db.select().from(comic).where(eq(comic.id, id));
```
All DAL classes extend [BaseDal](src/dal/baseDal.ts) (singleton pattern, logging, error handling). Available DALs: comic, chapter, user, author, artist, genre, type, bookmark, comment.

### 4. Environment Variables
Use T3 Env - **never** access `process.env` directly:
```typescript
import { env } from "env";

// ✅ Correct (validated, type-safe)
const dbUrl = env.DATABASE_URL;
const redisHost = env.REDIS_HOST;

// ❌ Wrong
const dbUrl = process.env.DATABASE_URL;
```
Validation schema: [src/lib/env.ts](src/lib/env.ts). Add new vars there with Zod schema.

### 5. Redis Caching Strategy
```typescript
import { cacheService, cacheKeys, cacheTTL } from "@/services/cacheService";

// Pattern: namespace:entity:id
const cacheKey = cacheKeys.comic(comicId);
const cached = await cacheService.get<Comic>(cacheKey);
if (cached) return cached;

const data = await comicDal.findById(comicId);
await cacheService.set(cacheKey, data, cacheTTL.comic);
```
TTLs: `cacheTTL.short` (5m), `.medium` (30m), `.long` (1h), `.comic` (30m). Invalidate on mutations.

## Development Workflows

### Database Operations
```bash
pnpm db:push          # Push schema changes (development)
pnpm db:seed          # Run seeder v3 (upsert-based, image processing)
pnpm db:studio        # Open Drizzle Studio
pnpm db:reset         # Drop, push, seed
```
Schema: [src/database/schema.ts](src/database/schema.ts). Migrations: auto-generated in `src/database/drizzle/`.
Seeder architecture: [src/database/seed/README.md](src/database/seed/README.md) - supports `--dry-run`, `--verbose`, `--comics`, `--chapters`, `--users` flags.

### Type Checking & Quality
```bash
pnpm type-check       # TypeScript errors (strict mode)
pnpm lint:fix         # ESLint with auto-fix
pnpm format           # Prettier (includes .prettierrc.ts config)
pnpm validate         # Run all checks (type + lint + format)
```
Strict TS config - `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` enabled.

### Testing
```bash
pnpm test:unit        # Vitest (watch mode)
pnpm test             # Playwright E2E
pnpm test:ui          # Playwright UI mode
```

### Scaffolding (CLI)
```bash
pnpm cw scaffold --type=component  # Interactive component generator
pnpm cw scaffold --type=action     # Server action template
pnpm cw scaffold --type=hook       # React hook template
```
Templates: [scripts/cw.ts](scripts/cw.ts) lines 60-150.

## Project-Specific Conventions

### Component Structure
```typescript
// Server Component (default in app directory)
import { Suspense } from "react";
import { auth } from "auth";
import { ComicList } from "components/comics/comic-list";

export default async function ComicsPage() {
  const session = await auth();
  return <Suspense fallback={<Loading />}><ComicList /></Suspense>;
}

// Client Component (when needed)
"use client";
import { useState } from "react";
```
UI components: `src/components/ui/*` (shadcn). Feature components: `src/components/{comics,chapters,admin}/*`.

### Form Validation
React Hook Form + Zod for ALL forms:
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({ title: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });
```

### Admin Panel Pattern
Generic CRUD components in [src/components/admin/](src/components/admin/). Each entity has:
- `page.tsx` - List view with pagination
- `[id]/page.tsx` - Edit view
- `actions.ts` - Server actions (create/update/delete)

### Error Handling
```typescript
import { logger } from "@/lib/logger";

try {
  // operation
} catch (error) {
  logger.error({ error, context: "operation-name" });
  return { success: false, error: "User-friendly message" };
}
```
Logger uses Pino (structured JSON logging). Sentry configured: [sentry.server.config.ts](sentry.server.config.ts).

## Integration Points

### NextAuth
Session access pattern:
```typescript
import { auth } from "auth";

// Server Component/Action
const session = await auth();
if (!session?.user) return { error: "Unauthorized" };

// API Route
export async function GET() {
  const session = await auth();
  // ...
}
```
Providers: Google, GitHub. Config: [src/lib/authConfig.ts](src/lib/authConfig.ts).

### Image Handling
ImageKit CDN integration ([src/lib/imagekit.ts](src/lib/imagekit.ts)):
```typescript
import { uploadImage } from "@/lib/imagekit";

const result = await uploadImage({
  file: buffer,
  fileName: "comic-cover.jpg",
  folder: "/comics"
});
// Returns: { url, fileId, thumbnailUrl }
```

### Zustand Stores
Global state: `src/stores/*`. Example usage:
```typescript
import { useBookmarkStore } from "stores/bookmarkStore";

const { bookmarks, addBookmark, removeBookmark } = useBookmarkStore();
```

## Common Pitfalls to Avoid

1. **Don't** use `any` types - update with proper types or use `unknown` with validation
2. **Don't** create local DTO types - import from `@/dto`
3. **Don't** skip Zod validation on server actions - security requirement
4. **Don't** forget `"use server"` directive on server actions
5. **Don't** mix data fetching in Client Components - use Server Components or server actions
6. **Don't** bypass DAL layer - maintains consistency and caching

## Documentation References

- [README.md](README.md) - Setup & tech stack
- [QUICK_START.md](QUICK_START.md) - Common commands with aliases
- [SERVER_ACTIONS_DTO_INDEX.md](SERVER_ACTIONS_DTO_INDEX.md) - Complete DTO reference
- [PACKAGE_SCRIPTS_DOCUMENTATION.md](PACKAGE_SCRIPTS_DOCUMENTATION.md) - All 100+ pnpm scripts
- [src/database/seed/README.md](src/database/seed/README.md) - Seeding system architecture

## Quick Reference Card

| Task | Import/Command |
|------|----------------|
| Database client | `import { db } from "db"` |
| User session | `import { auth } from "auth"` |
| Environment var | `import { env } from "env"` |
| Server action | `"use server"` + `ActionResult<T>` from dto |
| Data access | `import { xyzDal } from "dal/xyzDal"` |
| Cache | `import { cacheService } from "@/services/cacheService"` |
| Types | `import { Comic } from "types"` |
| Validation | `import { z } from "zod"` |
| Run dev | `pnpm dev` |
| Check types | `pnpm type-check` |
| Test | `pnpm test:unit` |
| Seed DB | `pnpm db:seed` |

---

**Framework**: Next.js 16 (App Router, React 19, Turbopack)
**Package Manager**: pnpm (required)
**Node**: 20+
**Database**: PostgreSQL 16 (Neon) + Drizzle ORM
**Cache**: Redis (ioredis + Upstash)
