---
title: ComicWise - Database & Seeding Guide
version: 1.0.0
category: database
phase: "3"
status: active
updated: 2026-02-01
master-ref: master.prompt.md#6-phase-2-database-seeding
consolidated-from:
  - dynamicSeedSystem.prompt.md
  - bank.prompt.md
description: Database schema, seeding system, queries, mutations, and DAL patterns
---

# ComicWise - Database & Seeding Guide

> **Master Prompt:** [master.prompt.md](master.prompt.md) | **Progress:** [memory-bank/progress.md](../../memory-bank/progress.md)

---

## Quick Reference

```bash
# Push schema to database
pnpm db:push

# Seed database (full)
pnpm db:seed

# Seed with validation only
pnpm db:seed:dry-run

# Open Drizzle Studio GUI
pnpm db:studio

# Generate migrations
pnpm db:generate

# Reset database (DESTRUCTIVE)
pnpm db:reset
```

---

## Database Architecture

### Tech Stack

- **ORM:** Drizzle ORM with PostgreSQL
- **Validation:** Zod schemas (separate from Drizzle)
- **Migrations:** Drizzle Kit
- **Connection:** Neon (production) / Local PostgreSQL (dev)

### Schema Location

- **Main Schema:** `src/database/schema.ts`
- **Drizzle Config:** `drizzle.config.ts`
- **Queries:** `src/database/queries/`
- **Mutations:** `src/database/mutations/`
- **DAL Classes:** `src/dal/`

---

## Database Tables (19+)

### Authentication Tables

| Table                | Description        | Columns                                 |
| -------------------- | ------------------ | --------------------------------------- |
| `user`               | User accounts      | id, name, email, password, role, image  |
| `account`            | OAuth accounts     | id, userId, provider, providerAccountId |
| `session`            | Active sessions    | id, sessionToken, userId, expires       |
| `verificationToken`  | Email verification | identifier, token, expires              |
| `passwordResetToken` | Password reset     | identifier, token, expires              |

### Content Tables

| Table     | Description         | Key Fields                                       |
| --------- | ------------------- | ------------------------------------------------ |
| `comic`   | Comics/manga/manhwa | id, title, slug, description, coverImage, status |
| `chapter` | Comic chapters      | id, comicId, number, title, images               |
| `author`  | Content authors     | id, name, slug, bio                              |
| `artist`  | Content artists     | id, name, slug, bio                              |
| `genre`   | Content genres      | id, name, slug, description                      |
| `type`    | Content types       | id, name (manga, manhwa, etc.)                   |

### Junction Tables

| Table           | Description                |
| --------------- | -------------------------- |
| `comicToAuthor` | Comic-author relationships |
| `comicToArtist` | Comic-artist relationships |
| `comicToGenre`  | Comic-genre relationships  |

### User Data Tables

| Table             | Description        | Key Fields                             |
| ----------------- | ------------------ | -------------------------------------- |
| `bookmark`        | User bookmarks     | id, userId, comicId, status            |
| `comment`         | User comments      | id, userId, comicId/chapterId, content |
| `rating`          | User ratings       | id, userId, comicId, score             |
| `readingProgress` | Reading position   | userId, chapterId, position            |
| `notification`    | User notifications | id, userId, type, content, read        |

---

## Data Access Layer (DAL)

### Pattern

All database access goes through DAL classes extending `BaseDal`:

```typescript
// src/dal/base-dal.ts
export abstract class BaseDal<T> {
  abstract list(options?: ListOptions): Promise<T[]>;
  abstract getById(id: number): Promise<T | null>;
  abstract create(data: CreateInput): Promise<T>;
  abstract update(id: number, data: UpdateInput): Promise<T>;
  abstract delete(id: number): Promise<void>;
}
```

### DAL Classes (13)

| DAL                  | Location                          |
| -------------------- | --------------------------------- |
| `ComicDal`           | `src/dal/comic-dal.ts`            |
| `ChapterDal`         | `src/dal/chapter-dal.ts`          |
| `UserDal`            | `src/dal/user-dal.ts`             |
| `BookmarkDal`        | `src/dal/bookmark-dal.ts`         |
| `AuthorDal`          | `src/dal/author-dal.ts`           |
| `ArtistDal`          | `src/dal/artist-dal.ts`           |
| `GenreDal`           | `src/dal/genre-dal.ts`            |
| `TypeDal`            | `src/dal/type-dal.ts`             |
| `CommentDal`         | `src/dal/comment-dal.ts`          |
| `RatingDal`          | `src/dal/rating-dal.ts`           |
| `NotificationDal`    | `src/dal/notification-dal.ts`     |
| `ReadingProgressDal` | `src/dal/reading-progress-dal.ts` |
| `SettingsDal`        | `src/dal/settings-dal.ts`         |

### Usage

```typescript
// In server actions
import { comicDal } from "@/dal/comic-dal";

export async function getComicAction(slug: string) {
  return comicDal.getBySlug(slug);
}
```

---

## Queries & Mutations

### Query Pattern

```typescript
// src/database/queries/comic-queries.ts
export async function getComicBySlug(slug: string) {
  return db.query.comic.findFirst({
    where: eq(comic.slug, slug),
    with: {
      author: true,
      artist: true,
      genres: true,
      chapters: {
        orderBy: [desc(chapter.number)],
      },
    },
  });
}
```

### Mutation Pattern

```typescript
// src/database/mutations/bookmark-mutations.ts
export async function createBookmark(data: CreateBookmarkInput) {
  const [result] = await db
    .insert(bookmark)
    .values(data)
    .onConflictDoUpdate({
      target: [bookmark.userId, bookmark.comicId],
      set: { status: data.status, updatedAt: new Date() },
    })
    .returning();

  return { success: true, data: result };
}
```

### Return Shape (Consistent)

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

---

## Seeding System

### Architecture

```
src/database/seed/
├── seedRunnerV3.ts      # Main seed orchestrator (550 lines)
├── seedRunnerV4.ts      # Alternative runner
├── config.ts            # Seed configuration
├── helpers/
│   ├── password-hasher.ts     # Bcrypt password hashing
│   ├── image-downloader.ts    # Image download with retry
│   ├── image-deduplicator.ts  # Duplicate detection
│   └── data-validator.ts      # Zod validation
└── data/
    └── (JSON files loaded externally)
```

### Data Sources

| File                 | Content           | Size              |
| -------------------- | ----------------- | ----------------- |
| `users.json`         | User accounts     | ~50 users         |
| `comics.json`        | Comics data       | ~100 comics       |
| `comicsdata1.json`   | Extended comics   | ~500 comics       |
| `comicsdata2.json`   | More comics       | ~500 comics       |
| `chapters.json`      | Chapter data      | ~1000 chapters    |
| `chaptersdata1.json` | Extended chapters | ~23,000+ chapters |
| `chaptersdata2.json` | More chapters     | ~20,000+ chapters |

### Seed Commands

```bash
# Full seed with all data
pnpm db:seed

# Dry run (validation only, no DB operations)
pnpm db:seed:dry-run

# Verbose logging
pnpm db:seed:verbose

# Selective seeding
pnpm db:seed:users
pnpm db:seed:comics
pnpm db:seed:chapters

# Reset and reseed
pnpm db:reset && pnpm db:seed
```

### Image Helper (`src/lib/imageHelper.ts`)

```typescript
// Features:
// - Format validation (jpeg, png, webp, avif)
// - Size limits (SEED_MAX_IMAGE_SIZE_BYTES, default 5MB)
// - Retry logic with exponential backoff
// - Fallback to placeholder on failure

export async function downloadImage(
  url: string,
  targetPath: string,
  options?: { maxRetries?: number; timeout?: number }
): Promise<{ success: boolean; path: string }>;

export function validateImageFormat(url: string): boolean;
export function getImageSizeLimit(): number;
```

### Seed Configuration (`src/database/seed/config.ts`)

```typescript
export const seedConfig = {
  // Batch sizes
  userBatchSize: 50,
  comicBatchSize: 100,
  chapterBatchSize: 500,

  // Image handling
  downloadImages: true,
  imageDirectory: "public/images/comics",
  maxImageRetries: 3,
  imageTimeout: 10000,

  // Validation
  validateBeforeSeed: true,
  skipInvalidRecords: false,

  // Logging
  verbose: process.env.SEED_VERBOSE === "true",
  logProgress: true,
};
```

---

## Environment Configuration

### Required Database Variables

```env
# Primary connection
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise

# Neon (production)
NEON_DATABASE_URL=postgresql://...

# Seeding password
CUSTOM_PASSWORD=your-secure-password-min-8-chars
```

### Validation (`src/lib/env.ts`)

All environment variables are validated at runtime using Zod:

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CUSTOM_PASSWORD: z.string().min(8),
  // ... 60+ more variables
});
```

---

## Drizzle Configuration

**File:** `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./src/database/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

---

## Common Operations

### Create New Entity

1. Add table to `src/database/schema.ts`
2. Create Zod schema in `src/schemas/{entity}.schema.ts`
3. Create queries in `src/database/queries/{entity}-queries.ts`
4. Create mutations in `src/database/mutations/{entity}-mutations.ts`
5. Create DAL class in `src/dal/{entity}-dal.ts`
6. Create server actions in `src/lib/actions/{entity}.actions.ts`
7. Run `pnpm db:push`

### Add Database Index

```typescript
// In schema.ts
export const comicSlugIndex = index("comic_slug_idx").on(comic.slug);
export const bookmarkUserIndex = index("bookmark_user_idx").on(bookmark.userId);
```

### Optimize N+1 Queries

```typescript
// Use Drizzle's with() for eager loading
const comics = await db.query.comic.findMany({
  with: {
    author: true,
    genres: true,
    chapters: {
      limit: 5,
      orderBy: [desc(chapter.number)],
    },
  },
});
```

---

## Troubleshooting

### Connection Errors

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check schema
pnpm db:studio
```

### Seed Errors

```bash
# Run with verbose logging
SEED_VERBOSE=true pnpm db:seed

# Validate data first
pnpm db:seed:dry-run
```

### Migration Issues

```bash
# Generate fresh migration
pnpm db:generate

# Push schema directly (dev only)
pnpm db:push

# Drop all tables (DESTRUCTIVE)
pnpm db:drop
```

---

## Task Checklist

### Schema Tasks ✅

- [x] User table with auth fields
- [x] Comic table with metadata
- [x] Chapter table with images array
- [x] Author/Artist tables
- [x] Genre/Type tables
- [x] Bookmark table with status
- [x] Reading progress table
- [x] All junction tables

### Seeding Tasks ✅

- [x] Password hashing helper
- [x] Image download helper
- [x] Data validation with Zod
- [x] Batch processing for large datasets
- [x] OnConflictDoUpdate for idempotency
- [x] Progress logging

### DAL Tasks ✅

- [x] BaseDal abstract class
- [x] All 13 DAL classes created
- [x] Consistent return types

---

**Document Version:** 1.0.0 | **Last Updated:** 2026-02-01
