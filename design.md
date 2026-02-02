# ComicWise Complete Setup - Technical Design

**Document Version**: 1.0
**Date**: February 1, 2026
**Source**: `.github/prompts/plan-comicwiseComplete40TaskSetup.prompt.md`
**Specification**: Based on `requirements.md` EARS requirements

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │              │  │              │  │              │      │
│  │ Next.js App  │  │  React       │  │  Aceternity  │      │
│  │  Router      │  │  Components  │  │  UI (3D)     │      │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼───────────────┐
│         │          APPLICATION LAYER        │               │
│  ┌──────▼───────┐  ┌─────▼────────┐  ┌─────▼────────┐      │
│  │              │  │              │  │              │      │
│  │ Server       │  │   Zustand    │  │   NextAuth   │      │
│  │ Actions      │  │   Stores     │  │   v5         │      │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘      │
│         │                                   │               │
└─────────┼───────────────────────────────────┼───────────────┘
          │                                   │
          │                                   │
┌─────────┼───────────────────────────────────┼───────────────┐
│         │            DATA ACCESS LAYER       │               │
│  ┌──────▼───────┐  ┌──────────────┐  ┌─────▼────────┐      │
│  │              │  │              │  │              │      │
│  │  Mutations   │  │   Queries    │  │  Auth DAL    │      │
│  │              │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          └─────────┬───────┴─────────┬───────┘
                    │                 │
┌───────────────────┼─────────────────┼───────────────────────┐
│                   │  DATABASE LAYER │                       │
│            ┌──────▼──────┐   ┌──────▼──────┐               │
│            │             │   │             │               │
│            │  Drizzle    │   │  PostgreSQL │               │
│            │  ORM        │───│  Database   │               │
│            │             │   │             │               │
│            └─────────────┘   └─────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ImageKit│ │ Sentry │ │ Redis  │ │ Resend │ │ OAuth  │   │
│  │/ CDN   │ │Monitoring│ Cache  │ │ Email  │ │ Google │   │
│  │        │ │        │ │        │ │        │ │ GitHub │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Three-Layer Data Pattern

**Critical Design Principle**: All database access follows the 3-layer pattern

```
Component → Action → Mutation/Query → Drizzle → PostgreSQL
```

**Layer Responsibilities:**

1. **Schema Layer** (`src/schemas/`)
   - Zod validation schemas
   - Input/output type definitions
   - Separate from Drizzle database schema

2. **Mutation/Query Layer** (`src/database/mutations/`, `src/database/queries/`)
   - Direct Drizzle ORM operations
   - Database transaction management
   - Returns `{ success: boolean, data?: T, error?: string }`

3. **Action Layer** (`src/lib/actions/`)
   - Server actions with `"use server"` directive
   - Authentication checks via `await auth()`
   - Zod validation via `.safeParse()`
   - Calls mutations/queries
   - Returns `ActionResult<T>` type

**Example Implementation:**

```typescript
// Layer 1: Schema (src/schemas/comic.schema.ts)
export const createComicSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  // ... other fields
});
export type CreateComicInput = z.infer<typeof createComicSchema>;

// Layer 2: Mutation (src/database/mutations/comic-mutations.ts)
export async function createComic(input: CreateComicInput) {
  try {
    const [comic] = await db.insert(comicTable).values(input).returning();
    return { success: true, data: comic };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Layer 3: Action (src/lib/actions/comic.ts)
("use server");
import { auth } from "@/lib/auth-config";

export async function createComicAction(input: CreateComicInput): Promise<ActionResult<{ id: number }>> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const validation = createComicSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Validation failed" };
  }

  const result = await createComic(validation.data);
  return result.success
    ? { success: true, data: { id: result.data?.id || 0 } }
    : { success: false, error: result.error };
}
```

---

## 2. Parallel Execution Strategy

### 2.1 Dependency Dependency Gates

The 40-task implementation uses **5 validation gates** to ensure safe parallel execution:

```
Gate A: Environment Validated (.env.template, .env.md created & validated)
  ↓
Gate B: Database Seeded (pnpm db:seed succeeds)
  ↓
Gate C: Type-Check Clean (pnpm type-check → 0 errors)
  ↓
Gate D: Validate Clean (pnpm validate → 0 errors: type + lint + tests)
  ↓
Gate E: Production Build Clean (pnpm build → successful build)
```

### 2.2 Parallel Execution Clusters

**Cluster 1 (After Gate A)**: Configuration files (can run in parallel)

- Task 6: next.config.ts
- Task 7: nextSitemap.config.ts
- Task 8: package.json
- Task 9: tsconfig.json
- Task 10: eslint.config.mjs
- Tasks 11-15: .prettierrc, gitignore files

**Cluster 2 (After Gate B)**: UI/UX pages (can run in parallel)

- Task 18: Homepage
- Task 19: About Page
- Task 20: Contact Page
- Task 21: Terms Page
- Task 22: Privacy Page
- Task 23: Comics Listing
- Task 24: Comic Detail
- Task 25: Chapter Reader

**Cluster 3 (After Gate C)**: Code quality (can run in parallel)

- Task 28: AST refactoring
- Task 30: 'any' type fixes
- Task 31: Duplicate file cleanup
- Task 32: Unused package removal
- Task 33: Import path optimization

**Cluster 4 (After Gate D)**: Documentation (can run in parallel)

- Task 36: JSDoc comments
- Task 37: OpenAPI spec
- Documentation enhancements

**Sequential Requirements** (cannot parallelize):

- Phase 1: Tasks 16, 1-3 (foundational)
- Task 17: Database seeding (depends on Phase 1)
- Task 26: Store rename (affects imports)
- Task 27: DAL audit (depends on completion of all actions)
- Tasks 34-35: Kebab-case conversion (affects file references)
- Task 38: Full validation suite (depends on all code complete)
- Task 39: Production build (depends on validation)
- Task 40: Deployment (depends on build)

### 2.3 Execution Timeline

```
Phase 1 (Sequential)
├── Task 16: Environment setup (30 min)
├── Tasks 1-3: TypeScript fixes (45 min)
└── Gate A: env validated ✓

Phase 2 (Parallel Cluster 1)
├── Tasks 6-15: Config files (45 min parallel)
└── Gate B: configs validated ✓

Phase 3 (Sequential)
├── Task 17: Advanced seeding (90 min)
└── Gate C: db:seed succeeds ✓

Phase 4 (Parallel Cluster 2)
├── Tasks 18-25: UI pages (120 min parallel)
└── Gate D: type-check clean ✓

Phase 5 (Sequential)
├── Task 26: Store rename (30 min)
└── Task 27: DAL audit (15 min)

Phase 6 (Mixed: Parallel Cluster 3 + Sequential)
├── Tasks 28-33: Code quality (90 min mixed)
├── Tasks 34-35: Kebab-case (60 min sequential)
└── Task 36: Cleanup (15 min)

Phase 7 (Parallel Cluster 4)
├── Task 37: AI workspace analysis (30 min)
└── Documentation tasks (60 min)

Phase 8 (Sequential)
├── Task 38: Full validation (45 min)
├── Task 39: Production build (30 min)
└── Gate E: build succeeds ✓

Phase 9 (Sequential)
└── Task 40: Production deployment (60 min)
```

**Estimated Total Time**: 12-16 hours (single session)
**Time Savings via Parallelization**: ~4-6 hours (vs sequential execution)

---

## 3. Data Flow Patterns

### 3.1 Authentication Flow

```
1. User clicks "Sign In with Google"
   ↓
2. NextAuth v5 initiates OAuth flow
   ↓
3. Google redirects with authorization code
   ↓
4. NextAuth exchanges code for tokens
   ↓
5. Drizzle adapter stores user/account in PostgreSQL
   ↓
6. Session created with JWT
   ↓
7. User redirected to callback URL
   ↓
8. Subsequent requests use session token
```

### 3.2 Comic Reading Progress Flow

```
1. User opens chapter reader
   ↓
2. Component loads reading settings from localStorage (instant)
   ↓
3. Component fetches DB progress via action (cross-device sync)
   ↓
4. User navigates pages → state updates locally
   ↓
5. Auto-save timer (30s) triggers progress save
   ↓
6. Action → Mutation → Upsert to readingProgress table
   ↓
7. beforeunload event → final save on tab close
```

**Hybrid Sync Strategy:**

- **localStorage**: Device-specific instant state (zoom, pan)
- **Database**: Cross-device persistent state (progress %, current page)

### 3.3 Rating Upsert Flow

```
1. User submits rating (1-5 stars)
   ↓
2. Action validates: rating between 1-5, optional review max 1000 chars
   ↓
3. Special case: rating=0 → DELETE existing rating
   ↓
4. Otherwise: Mutation uses onConflictDoUpdate
   ↓
5. Composite unique key [userId, comicId] ensures one rating per user
   ↓
6. Success: Return updated rating data
```

### 3.4 Comment Threading Flow

```
1. Fetch flat comments from database
   ↓
2. buildCommentTree utility (O(n) two-pass algorithm)
   ├── Pass 1: Index comments by ID
   └── Pass 2: Attach children to parents
   ↓
3. Render nested comment tree recursively
   ↓
4. Soft delete: Show [deleted] if deletedAt !== null
   ↓
5. Orphaned comments (deleted parent) → root-level
```

---

## 4. Security Architecture

### 4.1 Defense in Depth Layers

```
Layer 1: Network Security
├── HTTPS enforcement (Strict-Transport-Security)
├── CSP headers (strict Content-Security-Policy)
└── Frame protection (X-Frame-Options: DENY)

Layer 2: Application Security
├── Input validation (Zod schemas on all inputs)
├── SQL injection prevention (Drizzle parameterized queries)
├── XSS prevention (React escaping + CSP)
└── CSRF protection (NextAuth CSRF tokens)

Layer 3: Authentication & Authorization
├── NextAuth v5 with OAuth providers
├── Password hashing (bcrypt with 12 rounds)
├── Session management (JWT with rotation)
└── Role-based access control (user, admin roles)

Layer 4: Rate Limiting
├── API route protection (100 req/15min per IP)
├── Redis-backed sliding window algorithm
├── Custom limits for authenticated users (500 req/15min)
└── DDoS mitigation

Layer 5: Monitoring & Response
├── Sentry error tracking
├── Security audit logs
├── Dependency vulnerability scanning (automated)
└── Incident response procedures
```

### 4.2 Security Headers Configuration

```typescript
// Implemented in next.config.ts
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' *.sentry.io *.upstash.io",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];
```

---

## 5. Performance Optimization

### 5.1 Caching Strategy

```
┌─────────────────────────────────────────────────────┐
│                 CACHING LAYERS                       │
├─────────────────────────────────────────────────────┤
│  Layer 1: Browser Cache (Client-Side)               │
│  ├── Static assets: 1 year (immutable)              │
│  ├── API responses: no-cache (revalidate)           │
│  └── Service Worker: Offline-first for images       │
├─────────────────────────────────────────────────────┤
│  Layer 2: CDN Cache (Edge)                          │
│  ├── Images: 1 year (ImageKit/Cloudinary)           │
│  ├── Static pages: 1 hour (Vercel Edge)             │
│  └── API routes: no-cache                           │
├─────────────────────────────────────────────────────┤
│  Layer 3: Redis Cache (Server-Side)                 │
│  ├── Comic listings: 1 hour TTL                     │
│  ├── Chapter data: 1 hour TTL                       │
│  ├── User sessions: 24 hour TTL                     │
│  └── Rate limit buckets: 15 min TTL                 │
├─────────────────────────────────────────────────────┤
│  Layer 4: Next.js Cache (Build-Time)                │
│  ├── Static pages: Permanent until rebuild          │
│  ├── ISR pages: Revalidate every 3600s              │
│  └── Dynamic pages: No cache (on-demand)            │
└─────────────────────────────────────────────────────┘
```

### 5.2 Image Optimization Pipeline

```
Upload Flow:
1. Client selects image
   ↓
2. Frontend validates: type, size (<5MB)
   ↓
3. Server action validates again
   ↓
4. Upload to ImageKit/Cloudinary/S3
   ↓
5. CDN generates responsive variants:
   ├── 640w (mobile)
   ├── 1080w (tablet)
   └── 1920w (desktop)
   ↓
6. Convert to modern formats:
   ├── AVIF (priority)
   └── WebP (fallback)
   ↓
7. Store URL in database
   ↓
8. Serve via CDN with 1-year cache

Delivery Flow:
<Image
  src={imageUrl}
  alt="Comic cover"
  width={1080}
  height={1350}
  sizes="(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1920px"
  loading="lazy"
  placeholder="blur"
/>
```

### 5.3 Bundle Optimization

**Strategies:**

- Tree-shaking: Remove unused code from dependencies
- Code splitting: Dynamic imports for routes and heavy components
- Package optimization: Import only needed functions (e.g., `import { format } from 'date-fns/format'`)
- Barrel export elimination: Avoid `export * from './module'`
- Minification: Terser for production builds
- Compression: Gzip + Brotli at CDN

**Performance Budgets:**

- Initial page load: <200KB gzipped
- Individual routes: <100KB gzipped
- Lighthouse Performance: 90+

---

## 6. Database Design

### 6.1 Schema Relationships

```
user (id) ──┬── 1:N ──> bookmark (userId, comicId)
            ├── 1:N ──> comment (userId, chapterId)
            ├── 1:N ──> rating (userId, comicId)
            ├── 1:N ──> readingProgress (userId, comicId)
            └── 1:1 ──> readerSettings (userId)

comic (id) ─┬── 1:N ──> chapter (comicId)
            ├── N:M ──> genre (via comicGenre junction)
            ├── N:M ──> author (via comicAuthor junction)
            ├── N:M ──> artist (via comicArtist junction)
            ├── N:1 ──> type (typeId)
            ├── 1:N ──> bookmark (comicId)
            ├── 1:N ──> rating (comicId)
            └── 1:N ──> readingProgress (comicId)

chapter (id) ──┬── 1:N ──> comment (chapterId)
               └── 1:N ──> chapterImage (chapterId)

comment (id) ──> parentId (self-referencing for threading)
```

### 6.2 Soft Delete Pattern

**Affected Tables:**

- `user`: Set deletedAt, anonymize PII (name, email, image)
- `comment`: Set deletedAt, preserve for thread integrity

**Implementation:**

```sql
-- User soft delete
UPDATE "user"
SET
  deleted_at = NOW(),
  name = 'Deleted User',
  email = CONCAT('deleted_', id, '@example.com'),
  image = NULL
WHERE id = $1;

-- Comment soft delete (preserve for threading)
UPDATE "comment"
SET deleted_at = NOW()
WHERE id = $1;

-- Queries must filter deleted records
SELECT * FROM "user" WHERE deleted_at IS NULL;
SELECT * FROM "comment" WHERE deleted_at IS NULL OR parent_id IS NOT NULL;
```

### 6.3 Indexing Strategy

**Primary Indexes** (auto-created):

- All `id` primary key columns

**Composite Unique Indexes**:

- `bookmark (userId, comicId)` → one bookmark per user per comic
- `rating (userId, comicId)` → one rating per user per comic
- `readingProgress (userId, comicId)` → one progress per user per comic

**Performance Indexes**:

- `comic (slug)` → fast comic lookup by URL slug
- `comic (status, createdAt DESC)` → latest comics query
- `chapter (comicId, chapterNumber)` → chapter navigation
- `comment (chapterId, createdAt DESC)` → chapter comments
- `user (email)` → authentication lookup

---

## 7. Testing Strategy

### 7.1 Testing Pyramid

```
                    ┌──────────┐
                    │   E2E    │  10% (Critical Paths)
                    │   Tests  │  Playwright
                    └──────────┘
                 ┌───────────────┐
                 │  Integration  │  20% (API Routes, Actions)
                 │     Tests     │  Vitest + Supertest
                 └───────────────┘
             ┌───────────────────────┐
             │     Unit Tests        │  70% (Functions, Utils, Schemas)
             │  Vitest + Testing Lib │
             └───────────────────────┘
```

### 7.2 Unit Test Coverage

**Target**: 100%+ coverage for:

- All DAL functions (`src/dal/*`)
- All server actions (`src/lib/actions/*`)
- All validation schemas (`src/schemas/*`)
- All utility functions (`src/lib/utils/*`)

**Example Test Pattern:**

```typescript
// tests/unit/schemas/comic.schema.test.ts
import { describe, it, expect } from 'vitest';
import { createComicSchema } from '@/schemas/comic.schema';

describe('createComicSchema', () => {
  it('should accept valid comic data', () => {
    const valid = { title: 'Test Comic', slug: 'test-comic', ... };
    expect(createComicSchema.parse(valid)).toEqual(valid);
  });

  it('should reject empty title', () => {
    const invalid = { title: '', slug: 'test', ... };
    expect(() => createComicSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid slug format', () => {
    const invalid = { title: 'Test', slug: 'Invalid Slug!', ... };
    expect(() => createComicSchema.parse(invalid)).toThrow();
  });
});
```

### 7.3 E2E Test Coverage

**Critical User Flows:**

1. **Authentication**: Sign-up → Email verification → Sign-in → Sign-out → Password reset
2. **Comic Discovery**: Browse comics → Filter by genre → Sort by rating → Paginate results
3. **Comic Reading**: Select comic → View details → Start chapter → Navigate pages → Auto-save progress
4. **User Interaction**: Bookmark comic → Rate comic → Post comment → Reply to comment
5. **Profile Management**: Edit profile → Change password → Update reader settings → Delete account

**Example E2E Test:**

```typescript
// tests/e2e/reader.spec.ts
import { test, expect } from "@playwright/test";

test("Chapter reading with auto-save", async ({ page }) => {
  await page.goto("/comics/test-comic/1");

  // Verify reader loads
  await expect(page.getByRole("img", { name: /page 1/i })).toBeVisible();

  // Navigate to next page
  await page.getByRole("button", { name: /next/i }).click();
  await expect(page.getByRole("img", { name: /page 2/i })).toBeVisible();

  // Wait for auto-save (30s interval)
  await page.waitForTimeout(31000);

  // Verify progress saved (check API call or DB state)
  const progress = await page.evaluate(() => fetch("/api/reading-progress").then((r) => r.json()));
  expect(progress.currentImageIndex).toBe(1);
});
```

---

## 8. Deployment Architecture

### 8.1 Vercel Deployment Topology

```
┌──────────────────────────────────────────────────────┐
│              Vercel Edge Network                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │  US East   │  │  US West   │  │   Europe   │    │
│  │   Edge     │  │   Edge     │  │   Edge     │    │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘    │
│         │                │                │          │
│         └────────────────┴────────────────┘          │
│                         │                            │
└─────────────────────────┼────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │  Serverless Functions │
              │   (Next.js App)       │
              └───────────┬───────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
  ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
  │   Neon      │  │   Upstash   │  │  ImageKit  │
  │ PostgreSQL  │  │   Redis     │  │    CDN     │
  │             │  │             │  │            │
  └─────────────┘  └─────────────┘  └────────────┘
```

### 8.2 Environment Configuration Matrix

| Environment Variable   | Development      | Preview               | Production             |
| ---------------------- | ---------------- | --------------------- | ---------------------- |
| DATABASE_URL           | Local PostgreSQL | Neon (dev branch)     | Neon (main branch)     |
| UPSTASH_REDIS_REST_URL | Optional         | Required              | Required               |
| GOOGLE_CLIENT_ID       | Test credentials | Test credentials      | Production credentials |
| GITHUB_CLIENT_ID       | Test credentials | Test credentials      | Production credentials |
| SENTRY_DSN             | Optional         | Required              | Required               |
| IMAGEKIT_URL_ENDPOINT  | Test endpoint    | Test endpoint         | Production endpoint    |
| NEXT_PUBLIC_APP_URL    | localhost:3000   | preview-\*.vercel.app | comicwise.app          |

### 8.3 CI/CD Pipeline

```
GitHub Push
  ↓
Vercel Webhook Trigger
  ↓
┌─────────────────────────┐
│   Build Phase           │
│ ├── Install dependencies│
│ ├── Type-check          │
│ ├── Lint               │
│ ├── Unit tests          │
│ └── Next.js build       │
└──────────┬──────────────┘
           │ (success)
           ↓
┌─────────────────────────┐
│   Database Phase        │
│ ├── Run migrations      │
│ └── (Skip seeding)      │
└──────────┬──────────────┘
           │ (success)
           ↓
┌─────────────────────────┐
│   Deploy Phase          │
│ ├── Deploy to Edge      │
│ ├── Health check        │
│ └── Invalidate cache    │
└──────────┬──────────────┘
           │ (success)
           ↓
┌─────────────────────────┐
│   Post-Deploy           │
│ ├── Lighthouse audit    │
│ ├── Smoke tests         │
│ └── Sentry release      │
└─────────────────────────┘
```

---

## 9. Monitoring & Observability

### 9.1 Error Tracking (Sentry)

**Instrumentation Points:**

- Server actions (wrap in try-catch, report to Sentry)
- API routes (automatic Next.js integration)
- Client errors (window.onerror, unhandledrejection)
- React error boundaries (componentDidCatch)

**Configuration:**

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.VERCEL_ENV || "development",
  beforeSend(event) {
    // Strip sensitive data
    if (event.request?.cookies) delete event.request.cookies;
    if (event.user?.email) event.user.email = "[REDACTED]";
    return event;
  },
});
```

### 9.2 Performance Monitoring

**Metrics Tracked:**

- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- API route response times
- Database query durations

**Lighthouse CI Integration:**

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://${{ env.VERCEL_URL }}
      https://${{ env.VERCEL_URL }}/comics
    budgets: |
      - budget: performance 90
      - budget: accessibility 95
      - budget: best-practices 95
      - budget: seo 100
```

---

## 10. Rollback & Disaster Recovery

### 10.1 Rollback Procedures

**Code Rollback (Git-Based):**

```bash
# View recent commits
git log --oneline -n 10

# Revert specific commit (creates new revert commit)
git revert <commit-hash>
git push origin main

# Or reset to previous commit (destructive)
git reset --hard <commit-hash>
git push origin main --force
```

**Deployment Rollback (Vercel):**

```bash
# List recent deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>

# Or via Vercel dashboard: Select deployment → Promote to Production
```

**Database Rollback:**

```bash
# Restore from backup
pg_restore -d comicwise backup-20260201.sql

# Or revert specific migration
pnpm drizzle-kit drop # Drop last migration
pnpm db:push # Re-apply previous migration
```

### 10.2 Disaster Recovery Plan

**Scenario 1: Database Corruption**

1. Stop application (prevent writes)
2. Restore from latest daily backup (Neon automatic backups)
3. Replay transaction logs since backup
4. Verify data integrity
5. Resume application

**Scenario 2: Complete Service Outage**

1. Check Vercel status page
2. Check external service status (Neon, Upstash, ImageKit)
3. Trigger health check endpoint
4. Review Sentry error logs
5. If application issue: Rollback to last known good deployment
6. If infrastructure issue: Wait for provider resolution + communicate to users

**Recovery Time Objectives (RTO):**

- Critical bug fix deployment: <15 minutes
- Database restoration: <1 hour
- Full disaster recovery: <4 hours

**Recovery Point Objectives (RPO):**

- Database backups: Daily (max 24-hour data loss)
- Transaction logs: Real-time (< 1-minute data loss with Neon WAL)

---

## 11. Future Extensibility

### 11.1 Planned Features (Phase 10+)

**Internationalization (i18n):**

- react-i18next integration
- Locale-based routing (`/en`, `/es`, `/fr`)
- RTL language support (Arabic, Hebrew)
- Translation management workflow

**Advanced Analytics:**

- User behavior tracking (reading patterns, popular genres)
- A/B testing framework (feature flags)
- Conversion funnels (sign-up → first read → bookmark)
- Heatmaps for reader interactions

**Social Features:**

- User profiles with reading lists
- Follow other users
- Activity feeds (friends' recent reads)
- Comic recommendations powered by ML

**Monetization:**

- Stripe integration (subscriptions, one-time purchases)
- Premium content tiers
- Creator payouts
- Ad integration (non-intrusive)

### 11.2 Technical Debt Management

**Identified Technical Debt:**

1. Strategic 'any' types in uploadService.ts (provider SDK differences)
2. Duplicate root files (projectbrief.md, productContext.md) vs memory-bank/
3. Inconsistent naming: some actions use `ok`/`error`, others use `success`/`error`

**Remediation Plan:**

- Technical debt tasks tracked in `.copilot-tracking/debt.md`
- Quarterly review and prioritization
- Allocate 20% of sprint capacity to debt reduction

---

## 12. Design Decisions Log

| Decision ID | Date       | Decision                                              | Rationale                                                                              | Impact                                                                  | Review Date |
| ----------- | ---------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- |
| DD-001      | 2026-02-01 | Use Aceternity UI for 3D components                   | Modern UX, differentiates from competitors                                             | Increased bundle size (+150KB), Learning curve for team                 | 2026-06-01  |
| DD-002      | 2026-02-01 | Enforce kebab-case file naming                        | Consistency across codebase, prevents naming conflicts on case-insensitive filesystems | Breaking change (~30 file renames), Update all import paths             | 2026-03-01  |
| DD-003      | 2026-02-01 | Redis caching via Upstash                             | Serverless-friendly, zero-ops, instant global replication                              | Vendor lock-in, Cost at scale                                           | 2026-04-01  |
| DD-004      | 2026-02-01 | Soft delete for users and comments                    | Preserve data integrity (comment threading), GDPR compliance (PII anonymization)       | Increased query complexity (WHERE deleted_at IS NULL), Storage overhead | 2026-05-01  |
| DD-005      | 2026-02-01 | Hybrid sync (localStorage + DB) for reader settings   | Instant local updates, Cross-device persistence                                        | Complex sync logic, Potential state conflicts                           | 2026-03-15  |
| DD-006      | 2026-02-01 | Parallel execution clusters for 40-task plan          | Reduce total execution time from 16+ hours to 12-14 hours                              | Requires careful dependency management, Risk of conflicts               | 2026-02-15  |
| DD-007      | 2026-02-01 | Three-layer data pattern (Schema → Mutation → Action) | Type safety, Testability, Separation of concerns                                       | More boilerplate code, Steeper learning curve                           | Ongoing     |

---

## Appendix A: Glossary

- **DAL**: Data Access Layer
- **EARS**: Easy Approach to Requirements Syntax
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective
- **TTL**: Time To Live
- **WAL**: Write-Ahead Logging
- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **CLS**: Cumulative Layout Shift
- **FID**: First Input Delay

---

## Appendix B: References

- Next.js 16 Documentation: https://nextjs.org/docs
- Drizzle ORM Documentation: https://orm.drizzle.team/docs
- Zod Validation Library: https://zod.dev
- Playwright Testing Framework: https://playwright.dev
- Vercel Deployment Guide: https://vercel.com/docs
- Sentry Error Tracking: https://docs.sentry.io
- Upstash Redis: https://docs.upstash.com
- ImageKit CDN: https://docs.imagekit.io
