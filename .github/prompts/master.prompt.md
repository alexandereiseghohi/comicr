---
title: ComicWise Master Implementation Prompt
version: 5.0.0
updated: 2026-02-01
applyTo: "**"
category-prompts:
  setup: Setup.prompt.md
  features: features.prompt.md
  database: database.prompt.md
  testing: testing.prompt.md
  optimization: optimization.prompt.md
---

# ComicWise Master Implementation Prompt

> **Comprehensive implementation guide consolidating all project prompts, phases, tasks, and best practices for ComicWise - a comic reading platform built with Next.js 16.**

---

## Prompt System Overview

This master prompt consolidates 7 prompt files organized by category:

| File                                             | Category     | Phase | Description                                |
| ------------------------------------------------ | ------------ | ----- | ------------------------------------------ |
| [master.prompt.md](master.prompt.md)             | Master       | All   | This file - single source of truth         |
| [README.md](README.md)                           | Index        | -     | Directory guide and quick start            |
| [Setup.prompt.md](Setup.prompt.md)               | Setup        | 1-2   | Environment, VS Code, 40 setup tasks       |
| [features.prompt.md](features.prompt.md)         | Features     | 3-5   | Profile, comic, chapter, bookmark features |
| [database.prompt.md](database.prompt.md)         | Database     | 3     | Schema, seeding, DAL, queries/mutations    |
| [testing.prompt.md](testing.prompt.md)           | Testing      | 7     | Vitest, Playwright, coverage targets       |
| [optimization.prompt.md](optimization.prompt.md) | Optimization | 6,8   | Performance, cleanup, caching              |

**Progress Tracking:** [memory-bank/progress.md](../../memory-bank/progress.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Architecture](#3-project-architecture)
4. [Implementation Phases Overview](#4-implementation-phases-overview)
5. [Phase 1: Foundation Setup](#5-phase-1-foundation-setup)
6. [Phase 2: Database & Schema](#6-phase-2-database--schema)
7. [Phase 3: User Features](#7-phase-3-user-features)
8. [Phase 4: Comic Features](#8-phase-4-comic-features)
9. [Phase 5: Admin Features](#9-phase-5-admin-features)
10. [Phase 6: Performance & Caching](#10-phase-6-performance--caching)
11. [Phase 7: Testing](#11-phase-7-testing)
12. [Phase 8: Documentation](#12-phase-8-documentation)
13. [Phase 9: Deployment & CI/CD](#13-phase-9-deployment--cicd)
14. [Code Patterns & Standards](#14-code-patterns--standards)
15. [Seeding System](#15-seeding-system)
16. [Validation Checklists](#16-validation-checklists)
17. [Troubleshooting Guide](#17-troubleshooting-guide)
18. [Quick Reference Commands](#18-quick-reference-commands)

---

## 1. Executive Summary

### Project Overview

ComicWise is a modern comic reading platform featuring:

- **Reader-facing features**: Browse, read, bookmark, rate comics
- **Creator features**: Upload and manage comic content
- **Admin features**: Full CRUD operations, user management, moderation

### Project Status

| Phase                   | Status         | Coverage |
| ----------------------- | -------------- | -------- |
| Phase 1: Foundation     | ✅ Complete    | 100%     |
| Phase 2: Database       | ✅ Complete    | 100%     |
| Phase 3: User Features  | ✅ Complete    | 100%     |
| Phase 4: Comic Features | ✅ Complete    | 100%     |
| Phase 5: Admin Features | ✅ Complete    | 100%     |
| Phase 6: Performance    | 🔧 In Progress | 80%      |
| Phase 7: Testing        | 🔧 In Progress | 60%      |
| Phase 8: Documentation  | 🔧 In Progress | 70%      |
| Phase 9: Deployment     | ⏳ Pending     | 30%      |

### Success Criteria

- Zero TypeScript errors (`pnpm type-check`)
- Zero ESLint errors (`pnpm lint`)
- 80%+ test coverage
- Production build succeeds
- All pages accessible and functional
- Core Web Vitals passing

---

## 2. Technology Stack

### Core Framework

- **Next.js 16** - App Router, Server Components, Server Actions
- **React 19** - Server Components, Suspense boundaries
- **TypeScript 5.x** - Strict mode enabled

### Database & ORM

- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe queries and mutations
- **Redis (Upstash)** - Caching layer (15-minute TTL)

### Authentication

- **NextAuth.js v5** - Session management
- **Providers**: Google, GitHub, Credentials
- **Roles**: admin, moderator, user

### UI & Styling

- **Tailwind CSS 4** - Modern utility-first CSS
- **shadcn/ui** - Component library
- **TanStack Table** - Data tables for admin

### State Management

- **Zustand** - Client-side state
- **Stores**: useAppStore, useUIStore

### Validation

- **Zod** - Schema validation
- **React Hook Form** - Form handling

### Testing

- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Target**: 80%+ coverage

### Package Manager

- **pnpm** - Workspace management

---

## 3. Project Architecture

### Directory Structure

```
comicr/
├── .github/
│   ├── instructions/     # Copilot instructions
│   ├── prompts/          # Implementation prompts
│   ├── workflows/        # CI/CD workflows
│   └── master.prompt.md  # This file
├── docs/                 # Documentation
├── memory-bank/          # Project context
├── public/               # Static assets
│   └── comics/           # Seeded comic images
├── scripts/              # Utility scripts
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Auth pages
│   │   ├── (root)/       # Public pages
│   │   ├── admin/        # Admin pages
│   │   ├── api/          # API routes
│   │   └── dev/          # Dev tools
│   ├── components/       # React components
│   │   ├── auth/         # Auth components
│   │   ├── bookmarks/    # Bookmark components
│   │   ├── comics/       # Comic components
│   │   ├── navigation/   # Nav components
│   │   ├── profile/      # Profile components
│   │   └── ui/           # shadcn/ui components
│   ├── dal/              # Data Access Layer
│   ├── database/         # Drizzle setup
│   │   ├── mutations/    # INSERT/UPDATE/DELETE
│   │   ├── queries/      # SELECT operations
│   │   └── seed/         # Seeding system
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   │   ├── actions/      # Server actions
│   │   ├── cache/        # Caching utilities
│   │   ├── schemas/      # Zod schemas (legacy)
│   │   ├── storage/      # Storage abstraction
│   │   └── validations/  # Zod validations
│   ├── schemas/          # Zod schemas (primary)
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
└── tests/
    ├── e2e/              # Playwright tests
    └── unit/             # Vitest tests
```

### Data Flow Pattern

```
Component → Action → Mutation/Query → Drizzle → PostgreSQL
```

### 3-Layer Data Pattern

1. **Schema** (`src/schemas/*.schema.ts`) - Zod validation
2. **Mutation/Query** (`src/database/mutations/`, `src/database/queries/`) - Drizzle operations
3. **Action** (`src/lib/actions/*.actions.ts`) - Public API with validation wrapper

### Action Pattern

```typescript
// Standard action pattern
export async function addBookmarkAction(input: unknown): Promise<ActionResult> {
  const parsed = CreateBookmarkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }
  const result = await mutations.addBookmark(parsed.data);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, error: { code: "DB_ERROR", message: result.error } };
}
```

### Query/Mutation Return Shape

```typescript
{ success: true, data: T } | { success: false, error: string }
```

---

## 4. Implementation Phases Overview

### Phase Dependency Chain

```mermaid
graph TD
    P1[Phase 1: Foundation] --> P2[Phase 2: Database]
    P2 --> P3[Phase 3: User Features]
    P2 --> P4[Phase 4: Comic Features]
    P3 --> P5[Phase 5: Admin Features]
    P4 --> P5
    P5 --> P6[Phase 6: Performance]
    P6 --> P7[Phase 7: Testing]
    P7 --> P8[Phase 8: Documentation]
    P8 --> P9[Phase 9: Deployment]
```

### Timeline Estimates

| Phase     | Duration        | Critical Path |
| --------- | --------------- | ------------- |
| Phase 1   | 2-3 hours       | ✅ Yes        |
| Phase 2   | 1-2 hours       | ✅ Yes        |
| Phase 3   | 4-6 hours       | ✅ Yes        |
| Phase 4   | 6-8 hours       | ✅ Yes        |
| Phase 5   | 4-6 hours       | ✅ Yes        |
| Phase 6   | 2-3 hours       | Partial       |
| Phase 7   | 3-4 hours       | ✅ Yes        |
| Phase 8   | 2-3 hours       | No            |
| Phase 9   | 1-2 hours       | ✅ Yes        |
| **Total** | **25-37 hours** | -             |

---

## 5. Phase 1: Foundation Setup

### 5.1 Environment Configuration

**Task 1.1: Create `.env.local`**

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/comicwise
NEON_DATABASE_URL=postgresql://...

# Authentication
AUTH_SECRET=your-secret-min-32-chars
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# ImageKit
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

# Seeding
CUSTOM_PASSWORD=your-secure-password

# Sentry
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...

# Email
EMAIL_FROM=noreply@comicwise.app
RESEND_API_KEY=...
```

**Task 1.2: Validate Environment**

```bash
pnpm validate:env
```

**Task 1.3: Verify TypeScript Configuration**

- [ ] `tsconfig.json` has `"strict": true`
- [ ] Path aliases configured (`@/*` → `src/*`)
- [ ] Incremental compilation enabled

### 5.2 VS Code Configuration

**Files to verify/create:**

| File                      | Purpose                | Lines |
| ------------------------- | ---------------------- | ----- |
| `.vscode/settings.json`   | Editor settings        | 100+  |
| `.vscode/extensions.json` | Recommended extensions | 80+   |
| `.vscode/launch.json`     | Debug configurations   | 150+  |
| `.vscode/tasks.json`      | Build tasks            | 200+  |
| `.vscode/mcp.json`        | MCP servers            | 300+  |

### 5.3 Package Scripts Verification

```json
{
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "type-check": "tsc --noEmit",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "test": "vitest",
  "test:e2e": "playwright test",
  "db:push": "drizzle-kit push",
  "db:seed": "tsx src/database/seed/seedRunnerV3.ts",
  "db:studio": "drizzle-kit studio",
  "validate": "pnpm type-check && pnpm lint && pnpm test:unit:run"
}
```

### 5.4 Validation Checkpoint

```bash
# Must all pass before proceeding
pnpm install
pnpm type-check     # 0 errors
pnpm lint           # 0 errors
pnpm build          # Success
```

---

## 6. Phase 2: Database & Schema

### 6.1 Database Tables (19 total)

**Auth Tables:**

- `user` - User accounts
- `account` - OAuth accounts
- `session` - User sessions
- `verificationToken` - Email verification
- `passwordResetToken` - Password reset

**Content Tables:**

- `comic` - Comics metadata
- `chapter` - Chapter data
- `author` - Authors
- `artist` - Artists
- `genre` - Genres
- `type` - Comic types

**Junction Tables:**

- `comicToAuthor` - Comic-Author relations
- `comicToArtist` - Comic-Artist relations
- `comicToGenre` - Comic-Genre relations

**User Data Tables:**

- `bookmark` - User bookmarks (composite PK: userId + comicId)
- `comment` - User comments
- `rating` - User ratings
- `readingProgress` - Reading progress
- `notification` - User notifications

### 6.2 Schema Conventions

**Drizzle Schema Pattern:**

```typescript
// src/database/schema.ts
export const comic = pgTable("comic", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  status: comicStatusEnum("status").default("ongoing"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 6.3 Migrations

```bash
# Generate migration
pnpm db:generate

# Push schema changes
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

---

## 7. Phase 3: User Features

### 7.1 Authentication Pages

**Routes:**

- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/verify-request` - Email verification
- `/error` - Auth error page

**Files:**

- `src/app/(auth)/sign-in/page.tsx`
- `src/app/(auth)/sign-up/page.tsx`
- `src/lib/auth-config.ts`
- `src/lib/password.ts`

### 7.2 Profile Features

**Tasks:**

- [ ] Profile view page
- [ ] Profile edit page
- [ ] Avatar upload
- [ ] Password change

**Files:**

- `src/app/(root)/profile/page.tsx`
- `src/app/(root)/profile/edit/page.tsx`
- `src/components/profile/profile-form.tsx`

### 7.3 Bookmark Features

**Tasks:**

- [ ] Bookmark list page
- [ ] Add/remove bookmark functionality
- [ ] Bookmark card component
- [ ] Bookmark filters

**Files:**

- `src/app/(root)/bookmarks/page.tsx`
- `src/components/bookmarks/bookmark-list.tsx`
- `src/components/bookmarks/bookmark-card.tsx`
- `src/lib/actions/bookmark.actions.ts`
- `src/database/mutations/bookmark-mutations.ts`

**Schema Convention:**

```typescript
// Bookmark has composite primary key
export const bookmark = pgTable(
  "bookmark",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    comicId: integer("comic_id")
      .notNull()
      .references(() => comic.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.comicId] }),
  })
);
```

---

## 8. Phase 4: Comic Features

### 8.1 Comic Listing

**Tasks:**

- [ ] Comics grid page
- [ ] Comic card component
- [ ] Filters (genre, type, status)
- [ ] Search functionality
- [ ] Pagination

**Files:**

- `src/app/(root)/comics/page.tsx`
- `src/components/comics/comic-card.tsx`
- `src/components/comics/comic-list.tsx`
- `src/components/comics/comic-filters.tsx`

### 8.2 Comic Detail

**Tasks:**

- [ ] Comic detail page
- [ ] Chapter list
- [ ] Rating display
- [ ] Bookmark toggle
- [ ] Related comics

**Files:**

- `src/app/(root)/comics/[slug]/page.tsx`
- `src/components/comics/comic-detail.tsx`
- `src/components/comics/chapter-list.tsx`

### 8.3 Chapter Reader

**Tasks:**

- [ ] Chapter page route
- [ ] Image gallery viewer
- [ ] Navigation (prev/next)
- [ ] Reading progress tracking
- [ ] Keyboard shortcuts

**Files:**

- `src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx`
- `src/components/comics/chapter-reader.tsx`
- `src/components/comics/image-viewer.tsx`

### 8.4 Search Features

**Tasks:**

- [ ] Search modal
- [ ] Search results page
- [ ] Debounced search
- [ ] Search history

**Files:**

- `src/components/navigation/search-modal.tsx`
- `src/app/(root)/search/page.tsx`

---

## 9. Phase 5: Admin Features

### 9.1 Admin Dashboard

**Route:** `/admin`

**Features:**

- Statistics overview
- Recent activity
- Quick actions
- System health

### 9.2 Entity CRUD Pages

**Pattern:** Each entity needs:

1. List page with data table
2. Create form
3. Edit form
4. Delete confirmation

**Entities:**

- [ ] Comics (`/admin/comics`)
- [ ] Chapters (`/admin/chapters`)
- [ ] Users (`/admin/users`)
- [ ] Authors (`/admin/authors`)
- [ ] Artists (`/admin/artists`)
- [ ] Genres (`/admin/genres`)
- [ ] Types (`/admin/types`)

### 9.3 Admin Components

**Files:**

- `src/app/admin/comics/page.tsx`
- `src/app/admin/comics/create/page.tsx`
- `src/app/admin/comics/[id]/edit/page.tsx`
- `src/components/admin/data-table.tsx`
- `src/components/admin/admin-form.tsx`

### 9.4 TanStack Table Configuration

```typescript
// Admin table pattern
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Comic>();

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <Badge>{info.getValue()}</Badge>,
  }),
  columnHelper.display({
    id: "actions",
    cell: (info) => <ActionMenu row={info.row.original} />,
  }),
];
```

---

## 10. Phase 6: Performance & Caching

### 10.1 Redis Caching

**Configuration:**

```typescript
// src/lib/cache/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = 900; // 15 minutes
```

**Caching Strategy:**

- Comic listings: 15 min TTL
- Comic details: 15 min TTL
- User data: No cache (real-time)
- Static content: Long TTL

### 10.2 Image Optimization

**Next.js Image Configuration:**

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "*.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};
```

**Image Component Pattern:**

```tsx
import Image from "next/image";

<Image
  src={comic.coverImage}
  alt={comic.title}
  width={300}
  height={400}
  className="object-cover"
  priority={isAboveFold}
/>;
```

### 10.3 Bundle Optimization

**Optimized Package Imports:**

```typescript
// next.config.ts
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "@tanstack/react-table",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "date-fns",
    "zod",
  ],
},
```

### 10.4 Performance Targets

| Metric      | Target  | Status |
| ----------- | ------- | ------ |
| LCP         | < 2.5s  | 🟡     |
| FID         | < 100ms | ✅     |
| CLS         | < 0.1   | ✅     |
| TTI         | < 3s    | 🟡     |
| Bundle Size | < 500KB | 🟡     |

---

## 11. Phase 7: Testing

### 11.1 Unit Tests (Vitest)

**Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
```

**Test Pattern:**

```typescript
// tests/unit/bookmark.test.ts
import { describe, it, expect } from "vitest";
import { CreateBookmarkSchema } from "@/schemas/bookmark.schema";

describe("BookmarkSchema", () => {
  it("validates correct bookmark data", () => {
    const result = CreateBookmarkSchema.safeParse({
      comicId: 1,
      userId: "user-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid data", () => {
    const result = CreateBookmarkSchema.safeParse({
      comicId: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
```

### 11.2 E2E Tests (Playwright)

**Configuration:**

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

**Test Pattern:**

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can sign in", async ({ page }) => {
    await page.goto("/sign-in");

    await test.step("Fill credentials", async () => {
      await page.getByLabel("Email").fill("test@example.com");
      await page.getByLabel("Password").fill("password123");
    });

    await test.step("Submit form", async () => {
      await page.getByRole("button", { name: "Sign In" }).click();
    });

    await test.step("Verify redirect", async () => {
      await expect(page).toHaveURL("/");
    });
  });
});
```

### 11.3 Coverage Targets

| Category       | Target | Files                         |
| -------------- | ------ | ----------------------------- |
| Server Actions | 80%    | `src/lib/actions/*.ts`        |
| Schemas        | 90%    | `src/schemas/*.ts`            |
| Mutations      | 70%    | `src/database/mutations/*.ts` |
| Queries        | 70%    | `src/database/queries/*.ts`   |
| Components     | 50%    | `src/components/*.tsx`        |

### 11.4 Test Commands

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E with UI
pnpm test:e2e --ui

# Run specific test file
pnpm test tests/unit/bookmark.test.ts
```

---

## 12. Phase 8: Documentation

### 12.1 Required Documentation

| File                    | Purpose               | Status |
| ----------------------- | --------------------- | ------ |
| `README.md`             | Project overview      | ✅     |
| `docs/architecture.md`  | System architecture   | 🔧     |
| `docs/api-reference.md` | API documentation     | 🔧     |
| `docs/deployment.md`    | Deployment guide      | ⏳     |
| `docs/runbook.md`       | Operations guide      | ⏳     |
| `docs/phase-status.md`  | Implementation status | ✅     |

### 12.2 Code Documentation

**JSDoc Pattern:**

```typescript
/**
 * Creates a bookmark for a user's comic.
 *
 * @param data - The bookmark creation data
 * @param data.userId - The ID of the user creating the bookmark
 * @param data.comicId - The ID of the comic to bookmark
 * @returns Promise resolving to the created bookmark or error
 *
 * @example
 * const result = await addBookmark({ userId: "user-1", comicId: 5 });
 * if (result.success) {
 *   console.log("Bookmark created:", result.data);
 * }
 */
export async function addBookmark(data: CreateBookmarkInput): Promise<BookmarkResult> {
  // Implementation
}
```

### 12.3 Memory Bank

**Files to maintain:**

| File                            | Purpose               | Update Frequency  |
| ------------------------------- | --------------------- | ----------------- |
| `memory-bank/projectbrief.md`   | Project scope         | On scope change   |
| `memory-bank/productContext.md` | Product requirements  | On feature change |
| `memory-bank/techContext.md`    | Technical decisions   | On tech change    |
| `memory-bank/systemPatterns.md` | Architecture patterns | On pattern change |
| `memory-bank/activeContext.md`  | Current focus         | Daily             |
| `memory-bank/progress.md`       | Progress tracking     | On completion     |
| `memory-bank/tasks/_index.md`   | Task index            | On task change    |

---

## 13. Phase 9: Deployment & CI/CD

### 13.1 CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test:unit:run
      - run: pnpm build
```

### 13.2 CD Workflow

```yaml
# .github/workflows/cd.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2

      - run: pnpm install
      - run: pnpm build

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 13.3 Environment Variables (Production)

**Required Secrets:**

- `DATABASE_URL` - Production database
- `AUTH_SECRET` - NextAuth secret
- `VERCEL_TOKEN` - Vercel deployment token
- `SENTRY_DSN` - Error tracking
- Provider secrets (Google, GitHub)

### 13.4 Deployment Checklist

- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Seed data loaded (if needed)
- [ ] SSL certificates configured
- [ ] Domain configured
- [ ] Error tracking enabled

---

## 14. Code Patterns & Standards

### 14.1 File Naming

| Type       | Convention | Example               |
| ---------- | ---------- | --------------------- |
| Components | PascalCase | `ComicCard.tsx`       |
| Utilities  | kebab-case | `format-date.ts`      |
| Schemas    | kebab-case | `bookmark.schema.ts`  |
| Actions    | kebab-case | `bookmark.actions.ts` |
| Pages      | lowercase  | `page.tsx`            |

### 14.2 Component Pattern

**Server Component (default):**

```tsx
// No "use client" directive
export default async function ComicList() {
  const comics = await getComics();

  return (
    <div className="grid grid-cols-3 gap-4">
      {comics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
}
```

**Client Component (when needed):**

```tsx
"use client";

import { useState } from "react";

export function BookmarkButton({ comicId }: { comicId: number }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <button onClick={() => setIsBookmarked(!isBookmarked)}>
      {isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
    </button>
  );
}
```

### 14.3 Server Action Pattern

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { CreateComicSchema } from "@/schemas/comic.schema";
import * as mutations from "@/database/mutations/comic-mutations";

export async function createComicAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = CreateComicSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.message },
    };
  }

  const result = await mutations.createComic(parsed.data);

  if (result.success) {
    revalidatePath("/admin/comics");
    return { ok: true, data: result.data };
  }

  return {
    ok: false,
    error: { code: "DB_ERROR", message: result.error },
  };
}
```

### 14.4 Error Handling

```typescript
// Consistent error response shape
interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: "Invalid input data",
  DB_ERROR: "Database operation failed",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Permission denied",
} as const;
```

---

## 15. Seeding System

### 15.1 Seed Architecture

**Files:**

- `src/database/seed/seedRunnerV3.ts` - Main orchestrator
- `src/database/seed/helpers/` - Helper utilities
- `src/lib/seedHelpers.ts` - Shared utilities
- `src/lib/imageHelper.ts` - Image download

**Data Sources:**

- `users.json` - User accounts
- `comics.json` - Primary comics
- `comicsdata1.json`, `comicsdata2.json` - Additional comics
- `chapters.json` - Chapter data
- `chaptersdata1.json`, `chaptersdata2.json` - Additional chapters

### 15.2 Seeding Commands

```bash
# Full seed
pnpm db:seed

# Dry run (no database writes)
pnpm db:seed:dry-run

# Verbose logging
pnpm db:seed:verbose

# Seed specific entities
pnpm db:seed:users
pnpm db:seed:comics
pnpm db:seed:chapters
```

### 15.3 Image Storage

**Structure:**

```
public/
└── comics/
    ├── covers/
    │   └── {comic-slug}/
    │       └── cover.jpg
    └── chapters/
        └── {comic-slug}/
            └── {chapter-slug}/
                ├── 001.jpg
                ├── 002.jpg
                └── ...
```

### 15.4 Password Hashing

```typescript
// All seeded users use CUSTOM_PASSWORD env var
import { hashPassword } from "@/lib/password";

const hashedPassword = await hashPassword(process.env.CUSTOM_PASSWORD!);
```

---

## 16. Validation Checklists

### 16.1 Pre-Commit Checklist

```bash
# Run before every commit
pnpm type-check     # TypeScript
pnpm lint           # ESLint
pnpm test:unit:run  # Unit tests
```

### 16.2 Pre-Merge Checklist

- [ ] All CI checks passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Documentation updated
- [ ] Breaking changes documented

### 16.3 Pre-Deployment Checklist

- [ ] Production build succeeds (`pnpm build`)
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance audit completed
- [ ] Security audit completed
- [ ] Accessibility audit completed

### 16.4 Phase Completion Checklist

**Per Phase:**

- [ ] All tasks completed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Memory bank updated
- [ ] Progress tracked

---

## 17. Troubleshooting Guide

### 17.1 Common Issues

**TypeScript Errors:**

```bash
# Check for type errors
pnpm type-check

# Common fixes:
# - Missing return types
# - Incorrect schema references
# - Undefined properties
```

**Build Failures:**

```bash
# Check build output
pnpm build

# Common fixes:
# - Missing env variables
# - Import path errors
# - Server/client component confusion
```

**Database Errors:**

```bash
# Check database connection
pnpm db:studio

# Common fixes:
# - Verify DATABASE_URL
# - Run migrations: pnpm db:push
# - Check schema.ts for errors
```

### 17.2 Debugging Commands

```bash
# Verbose build
next build --debug

# Check dependencies
pnpm why <package>

# Clear cache
rm -rf .next node_modules/.cache
```

---

## 18. Quick Reference Commands

### Development

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm start          # Start production server
pnpm type-check     # TypeScript check
pnpm lint           # ESLint check
pnpm lint:fix       # Fix ESLint issues
```

### Database

```bash
pnpm db:push        # Push schema
pnpm db:seed        # Run seeders
pnpm db:studio      # Open Drizzle Studio
pnpm db:generate    # Generate migrations
```

### Testing

```bash
pnpm test           # Run unit tests
pnpm test:coverage  # Coverage report
pnpm test:e2e       # E2E tests
pnpm test:e2e --ui  # E2E with UI
```

### Validation

```bash
pnpm validate       # Full validation
pnpm validate:quick # Quick checks
pnpm validate:env   # Environment check
```

---

## Appendix: Cross-Reference

### Category Prompts (Active - 7 files)

| Prompt                   | Category     | Phase | Purpose                      |
| ------------------------ | ------------ | ----- | ---------------------------- |
| `master.prompt.md`       | Master       | All   | Single source of truth       |
| `README.md`              | Index        | -     | Directory guide              |
| `Setup.prompt.md`        | Setup        | 1-2   | Environment & VS Code config |
| `features.prompt.md`     | Features     | 3-5   | User/comic/bookmark features |
| `database.prompt.md`     | Database     | 3     | Schema, seeding, DAL         |
| `testing.prompt.md`      | Testing      | 7     | Vitest & Playwright          |
| `optimization.prompt.md` | Optimization | 6,8   | Performance & cleanup        |

### Consolidated Files (Archived)

The following prompts were consolidated into category prompts:

| Old Prompt                    | Consolidated Into      |
| ----------------------------- | ---------------------- |
| `mainsetup.prompt.md`         | Setup.prompt.md        |
| `developer.prompt.md`         | Setup.prompt.md        |
| `maintasks.prompt.md`         | features.prompt.md     |
| `main-complete.prompt.md`     | features.prompt.md     |
| `main-complete-v2.prompt.md`  | features.prompt.md     |
| `dynamicSeedSystem.prompt.md` | database.prompt.md     |
| `bank.prompt.md`              | database.prompt.md     |
| `optimize.prompt.md`          | optimization.prompt.md |
| `cleanup.prompt.md`           | optimization.prompt.md |
| `refactor.prompt.md`          | optimization.prompt.md |

### Related Instructions

| Instruction                                | Purpose           |
| ------------------------------------------ | ----------------- |
| `memory-bank.instructions.md`              | Memory bank usage |
| `nextjs.instructions.md`                   | Next.js patterns  |
| `playwright-typescript.instructions.md`    | Testing patterns  |
| `code-review-generic.instructions.md`      | Code review       |
| `performance-optimization.instructions.md` | Performance       |

---

**Document Version**: 5.0.0
**Last Updated**: 2026-02-01
**Prompt Structure**: 7 files (1 master + 1 index + 5 category prompts)

---

> **Usage**: This master prompt serves as the single source of truth for ComicWise implementation. Reference specific category prompts for detailed tasks. Keep [memory-bank/progress.md](../../memory-bank/progress.md) updated with progress.
