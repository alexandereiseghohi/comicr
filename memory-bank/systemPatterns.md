# System Patterns

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                     │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   (root)/    │   (auth)/    │   admin/     │     api/       │
│  Public UI   │ Auth Pages   │ Admin Panel  │  API Routes    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│                     Server Actions                            │
│            src/lib/actions/*.actions.ts                       │
│        (Zod validation → Mutation/Query → Response)           │
└──────────────────────────┬───────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Queries    │   │  Mutations   │   │   Schemas    │
│ src/database │   │ src/database │   │ src/schemas  │
│  /queries/   │   │ /mutations/  │   │  /*.schema   │
└──────┬───────┘   └──────┬───────┘   └──────────────┘
       │                  │
       ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                    Drizzle ORM + PostgreSQL                   │
│                   src/database/schema.ts                      │
└──────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

### 1. Three-Layer Data Pattern

- **Schemas** (Zod) handle validation independently of DB
- **Mutations/Queries** are pure database operations
- **Actions** provide public API with error handling

### 2. Route Groups for Organization

- Use Next.js route groups `(auth)`, `(root)`
- Logical separation without URL impact
- Shared layouts per group

### 3. Server vs Client Components

- Default to Server Components, explicit `"use client"`
- Event handlers require client directive

### 4. Zustand for Client State

- Minimal boilerplate, TypeScript-friendly
- Selective subscriptions prevent re-renders

## Design Patterns

### Action Return Shape

```typescript
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
```

### Query/Mutation Return Shape

```typescript
type DBResult<T> = { success: true; data: T } | { success: false; error: string };
```

## Error Handling Strategy

1. **Validation Errors**: Caught at Zod schema level → `VALIDATION_ERROR`
2. **Database Errors**: Caught in mutations → `DB_ERROR`
3. **Unexpected Errors**: Caught in actions → `EXCEPTION`
4. **UI Errors**: React Error Boundaries + Sentry logging
