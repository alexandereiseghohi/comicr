# Architecture Documentation

## Overview

ComicWise (comicr) is a modern web application for reading and managing comics, built with Next.js 16 and following best practices for scalability, maintainability, and performance.

## Tech Stack

| Layer      | Technology              | Purpose                             |
| ---------- | ----------------------- | ----------------------------------- |
| Frontend   | Next.js 16, React 19    | Server-side rendering, routing      |
| Styling    | Tailwind CSS, shadcn/ui | Component library, design system    |
| State      | Zustand, TanStack Query | Client state, server state          |
| Auth       | NextAuth v5             | Authentication, sessions            |
| Database   | PostgreSQL, Drizzle ORM | Data persistence, type-safe queries |
| Caching    | Redis (Upstash/ioredis) | Performance optimization            |
| Storage    | S3/ImageKit/Cloudinary  | File storage, CDN                   |
| Validation | Zod                     | Schema validation                   |

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group (sign-in, sign-up)
│   ├── (root)/            # Public routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── dev/               # Development utilities
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── comics/           # Comic-related components
│   ├── auth/             # Auth components
│   └── navigation/       # Nav components
├── database/              # Data layer
│   ├── schema.ts         # Drizzle schema
│   ├── queries/          # Read operations
│   ├── mutations/        # Write operations
│   └── seed/             # Seeding infrastructure
├── lib/                   # Core utilities
│   ├── actions/          # Server actions
│   ├── storage/          # Storage abstraction
│   ├── cache/            # Caching abstraction
│   └── audit/            # Audit logging
├── hooks/                 # Custom React hooks
│   └── queries/          # TanStack Query hooks
├── schemas/               # Zod validation schemas
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
├─────────────────────────────────────────────────────────────┤
│  Components  →  TanStack Query  →  API Routes/Server Actions │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Server                                   │
├─────────────────────────────────────────────────────────────┤
│  Validation (Zod)  →  Business Logic  →  Cache Check        │
└─────────────────┬───────────────────────────────────────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
┌─────────────────┐ ┌─────────────────┐
│     Cache       │ │    Database     │
│  (Redis/Upstash)│ │  (PostgreSQL)   │
└─────────────────┘ └─────────────────┘
```

## 3-Layer Pattern

All data operations follow a consistent 3-layer pattern:

### Layer 1: Schema (Validation)

```typescript
// src/schemas/bookmark.schema.ts
export const CreateBookmarkSchema = z.object({
  comicId: z.number().positive(),
  userId: z.string().uuid(),
});
```

### Layer 2: Query/Mutation (Data Access)

```typescript
// src/database/mutations/bookmark.mutations.ts
export async function addBookmark(data: CreateBookmarkInput) {
  return db.insert(bookmark).values(data);
}
```

### Layer 3: Action (Public API)

```typescript
// src/lib/actions/bookmark.actions.ts
export async function addBookmarkAction(input: unknown) {
  const parsed = CreateBookmarkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Validation failed" };
  const result = await mutations.addBookmark(parsed.data);
  return { ok: true, data: result };
}
```

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│ NextAuth │────▶│ Provider │
│          │◀────│   v5     │◀────│ (Google) │
└──────────┘     └──────────┘     └──────────┘
                      │
                      ▼
              ┌──────────────┐
              │   Database   │
              │  (sessions)  │
              └──────────────┘
```

## RBAC Architecture

### Role Hierarchy

```
Admin (all permissions)
  └── Moderator (content management)
        └── User (basic access)
```

### Permission Model

- **Resource**: The entity being accessed (comic, chapter, user)
- **Action**: The operation being performed (create, read, update, delete)
- **Format**: `resource:action` (e.g., `comic:create`)

### Permission Check Flow

```typescript
// Check before action
const hasPermission = await roleHasPermission(user.role, "comic", "update");
if (!hasPermission) throw new ForbiddenError();
```

## Storage Architecture

Multi-provider storage with runtime selection:

```
┌─────────────────────────────────────────┐
│           Storage Factory               │
│    getStorageProvider(type?: string)    │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┬─────────┐
    ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ Local │ │  S3   │ │ImageKit│ │Cloudny│
└───────┘ └───────┘ └───────┘ └───────┘
```

## Caching Strategy

### Cache Layers

1. **Browser**: TanStack Query with staleTime
2. **CDN**: Static assets, images
3. **Application**: Redis for API responses

### Cache Keys

```typescript
const queryKeys = {
  comics: {
    list: (filters) => ["comics", filters],
    detail: (slug) => ["comics", slug],
    trending: (period) => ["comics", "trending", period],
  },
};
```

## Audit Logging

Dual storage for reliability:

```
┌─────────────────┐     ┌─────────────────┐
│   Audit Event   │────▶│    Database     │
│                 │     │   (primary)     │
└────────┬────────┘     └─────────────────┘
         │
         └─────────────▶┌─────────────────┐
                        │   File System   │
                        │   (backup)      │
                        └─────────────────┘
```

## Environment Configuration

All environment variables are validated at startup:

```typescript
// src/lib/env.ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  // ... other vars
});

export const env = envSchema.parse(process.env);
```

## Error Handling

Consistent error response format:

```typescript
// Success
{ ok: true, data: T }

// Error
{ ok: false, error: { code: string, message: string } }
```

## Security Considerations

1. **Authentication**: All mutations require authenticated session
2. **Authorization**: RBAC permissions checked before operations
3. **Validation**: Zod schemas validate all inputs
4. **Audit**: All sensitive operations are logged
5. **CSRF**: NextAuth handles CSRF tokens
6. **XSS**: React's built-in escaping + CSP headers

---

_See also: [API Reference](api-reference.md), [Deployment Guide](deployment.md)_

---

## Implementation Details - Phase 5 Updates

### 3-Layer Architecture Pattern

ComicWise enforces strict separation across three layers:

#### Layer 1: Schema (Validation)
**Location:** `src/schemas/`

Zod schemas define validation rules for all inputs.

```typescript
// Example: src/schemas/rating.schema.ts
import { z } from "zod";

export const ratingSchema = z.object({
  comicId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
});
```

#### Layer 2: Database (Queries & Mutations)
**Location:** `src/database/queries/`, `src/database/mutations/`

All database operations with proper error handling.

```typescript
export async function upsertRating(data: UpsertRatingData) {
  const result = await db
    .insert(rating)
    .values(data)
    .onConflictDoUpdate({
      target: [rating.userId, rating.comicId],
      set: { rating: data.rating, review: data.review, updatedAt: new Date() },
    })
    .returning();

  return { success: true, data: result[0] };
}
```

#### Layer 3: Actions (Public API)
**Location:** `src/lib/actions/`

Server actions with authentication and validation.

```typescript
"use server";

export async function upsertRatingAction(input: unknown): Promise<ActionResult<T>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validation = ratingSchema.safeParse(input);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };

  return await mutations.upsertRating({ userId: Number(session.user.id), ...validation.data });
}
```

### Key Design Decisions

**Hybrid Sync Strategy:**
- localStorage: Zoom level, pan (device-specific, instant)
- Database: Reading mode, quality (cross-device sync)

**Soft Delete Pattern:**
- Set deletedAt timestamp instead of hard delete
- Anonymize PII (name, email)
- Preserve structure, show [deleted] placeholder

**Comment Threading:**
- Self-referencing parentId allows infinite nesting
- buildCommentTree converts flat list to tree O(n)
- Orphaned comments become root level

**Rating Upsert:**
- Composite unique constraint [userId, comicId]
- onConflictDoUpdate for insert or update
- rating=0 triggers deletion

**Reading Progress Auto-Save:**
- Save every 30s, on page change, on beforeunload
- Upsert with composite key [userId, comicId]

### New API Endpoints

**Rating:** `POST /api/comics/rate` (1-5 stars, optional review max 1000 chars)  
**Comments:** `POST /api/comments`, `GET /api/comments?chapterId={id}`, `DELETE /api/comments/{id}`  
**Profile:** `PUT /api/profile/settings`, `POST /api/profile/delete-account`

### Schema Migrations

Recent additions:
- readerSettings table
- comment.parentId, comment.deletedAt
- user.settings (JSONB), user.deletedAt
- rating integer type (1-5)
- readingProgress fields (currentImageIndex, scrollPercentage, progressPercent)

Run `pnpm db:push` to apply schema changes.

