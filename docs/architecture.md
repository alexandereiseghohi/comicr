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
