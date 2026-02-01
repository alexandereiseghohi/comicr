---
title: ComicWise - Optimization & Cleanup Guide
version: 1.0.0
category: optimization
phase: "6,8"
status: active
updated: 2026-02-01
master-ref: master.prompt.md#9-phase-6-performance
consolidated-from:
  - optimize.prompt.md
  - cleanup.prompt.md
  - refactor.prompt.md
description: Performance optimization, code cleanup, refactoring, and caching strategies
---

# ComicWise - Optimization & Cleanup Guide

> **Master Prompt:** [master.prompt.md](master.prompt.md) | **Progress:** [memory-bank/progress.md](../../memory-bank/progress.md)

---

## Quick Reference

```bash
# Run full validation
pnpm validate

# Type check
pnpm type-check

# Lint and fix
pnpm lint:fix

# Build and analyze
pnpm build

# Cleanup scripts
pnpm cleanup
pnpm cleanup:deep
```

---

## Optimization Phases

### Phase 6A: Type Safety

- [ ] Fix all `any` types (~50 occurrences)
- [ ] Add proper generics
- [ ] Strict TypeScript configuration

### Phase 6B: Code Quality

- [ ] Remove duplicate code
- [ ] Optimize imports
- [ ] Kebab-case file naming
- [ ] Remove unused dependencies

### Phase 6C: Performance

- [ ] Redis caching implementation
- [ ] Database query optimization
- [ ] Image optimization
- [ ] Bundle size reduction

### Phase 6D: Cleanup

- [ ] Delete deprecated files
- [ ] Clean backup files
- [ ] Remove console.log statements
- [ ] Organize directory structure

---

## Type Safety Fixes

### Current Issues

- **TypeScript errors:** ~84 (includes Playwright module)
- **`any` types:** ~50 occurrences (mostly in tests)

### Priority Fixes

**1. Fix Playwright Module**

```bash
npx playwright install --with-deps
```

**2. Convert `any` Types**

```typescript
// ❌ Before
export async function uploadFile(file: any): Promise<any> {}

// ✅ After
export async function uploadFile<T extends File>(file: T): Promise<UploadResult> {}
```

**3. Fix Return Types**

```typescript
// ❌ Before
function getUser(id: string) {
  return db.query.user.findFirst({ where: eq(user.id, id) });
}

// ✅ After
async function getUser(id: string): Promise<User | null> {
  return db.query.user.findFirst({ where: eq(user.id, id) });
}
```

### Type Checking Commands

```bash
# Full type check
pnpm type-check

# Watch mode
pnpm type-check --watch

# Generate type report
pnpm type-check 2>&1 | Out-File type-errors.txt
```

---

## Code Quality

### Import Optimization

**Script:** `scripts/replaceImportsEnhanced.ts`

```bash
# Run import optimizer
pnpm imports:optimize

# Verify no broken imports
pnpm type-check
```

**Rules:**

- All imports use `@/` path aliases
- No relative imports beyond parent (`../../`)
- Organize imports: external → internal → types

### Kebab-Case Conversion

**ESLint Rule:**

```typescript
// eslint.config.ts
{
  rules: {
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
        ignore: ["README.md", "CHANGELOG.md", "\\[.*\\]"],
      },
    ],
  },
}
```

**Conversion Script:**

```typescript
// scripts/convert-to-kebab-case.ts
import * as fs from "fs";
import * as path from "path";

const toKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

// Rename files and update imports
```

### Duplicate Detection

```bash
# Find duplicate schemas
Get-ChildItem -Recurse -Filter "*.schema.ts" | ForEach-Object {
  Select-String -Path $_.FullName -Pattern "export const.*Schema"
}

# Find duplicate components
jscodeshift --dry --print --transform ./scripts/find-duplicates.ts ./src
```

---

## Performance Optimization

### Redis Caching

**Configuration:** `src/lib/cache/redis.ts`

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache patterns
const CACHE_TTL = {
  comics: 15 * 60, // 15 minutes
  chapters: 30 * 60, // 30 minutes
  genres: 60 * 60, // 1 hour
  user: 5 * 60, // 5 minutes
};

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await redis.set(key, data, { ex: ttl });
  return data;
}
```

**Cache Invalidation:**

```typescript
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Usage
await invalidateCache("comic:*"); // Invalidate all comics
await invalidateCache("user:123:*"); // Invalidate user 123's cache
```

### Database Optimization

**Add Indexes:**

```typescript
// src/database/schema.ts
export const comicSlugIndex = index("comic_slug_idx").on(comic.slug);
export const bookmarkUserIndex = index("bookmark_user_idx").on(bookmark.userId);
export const chapterComicIndex = index("chapter_comic_idx").on(chapter.comicId);
```

**Optimize N+1 Queries:**

```typescript
// ❌ N+1 Problem
const comics = await db.query.comic.findMany();
for (const comic of comics) {
  comic.chapters = await db.query.chapter.findMany({
    where: eq(chapter.comicId, comic.id),
  });
}

// ✅ Eager Loading
const comics = await db.query.comic.findMany({
  with: {
    chapters: {
      limit: 5,
      orderBy: [desc(chapter.number)],
    },
  },
});
```

### Image Optimization

**Next.js Image Configuration:**

```typescript
// next.config.ts
const config = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
};
```

**Lazy Loading:**

```tsx
import Image from "next/image";

// Always use loading="lazy" for below-fold images
<Image
  src={coverImage}
  alt={title}
  width={200}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL={placeholderUrl}
/>;
```

### Bundle Analysis

```bash
# Build with bundle analysis
ANALYZE=true pnpm build

# Check bundle size
pnpm build:analyze
```

**Optimization Targets:**
| Bundle | Target | Action |
|--------|--------|--------|
| Main JS | <500KB | Tree shaking |
| First Load | <80KB | Code splitting |
| Images | <100KB each | Compression |

---

## Cleanup Operations

### Cleanup Scripts

```bash
# Standard cleanup
pnpm cleanup

# Deep cleanup (includes node_modules cache)
pnpm cleanup:deep

# Remove backup files
Get-ChildItem -Recurse -Filter "*.backup*" | Remove-Item -Force

# Remove empty folders
Get-ChildItem -Recurse -Directory | Where-Object {
  (Get-ChildItem $_.FullName).Count -eq 0
} | Remove-Item -Force
```

### File Cleanup Checklist

- [ ] Remove `.backup` files after validation
- [ ] Delete temp files (`temp*.txt`, `test*.txt`)
- [ ] Remove log files (`*.log`)
- [ ] Clean outdated documentation
- [ ] Remove commented-out code blocks

### Console.log Removal

```bash
# Find all console.log statements
Get-ChildItem -Recurse -Include "*.ts","*.tsx" |
  Select-String "console\.log\(" |
  Select-Object Path, LineNumber

# Replace with proper logging
# console.log → logger.debug
# console.error → logger.error
```

### Dependency Audit

```bash
# Find unused dependencies
pnpm analyze:packages --dry-run

# Security audit
pnpm audit

# Update dependencies
pnpm update --interactive
```

---

## CI/CD Integration

### Validation Workflow

```yaml
# .github/workflows/ci.yml
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

### Performance Monitoring

```yaml
lighthouse:
  runs-on: ubuntu-latest
  steps:
    - name: Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        urls: |
          http://localhost:3000
          http://localhost:3000/comics
        budgetPath: ./lighthouse-budget.json
```

---

## Scripts Reference

### Validation

```bash
pnpm validate        # Full validation suite
pnpm type-check     # TypeScript check
pnpm lint           # ESLint
pnpm lint:fix       # Auto-fix lint issues
```

### Cleanup

```bash
pnpm cleanup         # Standard cleanup
pnpm cleanup:deep    # Deep cleanup
pnpm cleanup:backup  # Remove backup files
```

### Analysis

```bash
pnpm build:analyze   # Bundle analysis
pnpm analyze:packages # Dependency analysis
pnpm audit          # Security audit
```

---

## Optimization Checklist

### Type Safety

- [ ] 0 TypeScript errors (`pnpm type-check`)
- [ ] <10 `any` types (only in tests/external)
- [ ] All functions have return types
- [ ] All schemas validated

### Performance

- [ ] Redis caching enabled
- [ ] Database indexes added
- [ ] Images optimized (WebP/AVIF)
- [ ] Bundle under 500KB

### Code Quality

- [ ] 0 ESLint errors
- [ ] All imports optimized
- [ ] Kebab-case file naming
- [ ] No duplicate code

### Cleanup

- [ ] No backup files
- [ ] No unused dependencies
- [ ] No console.log statements
- [ ] Documentation updated

---

## Success Metrics

| Metric                 | Target    | Measurement        |
| ---------------------- | --------- | ------------------ |
| Type Errors            | 0         | `pnpm type-check`  |
| Lint Errors            | 0         | `pnpm lint`        |
| Build Time             | <2 min    | `time pnpm build`  |
| Bundle Size            | <500KB    | Build output       |
| First Contentful Paint | <1.5s     | Lighthouse         |
| Time to Interactive    | <3s       | Lighthouse         |
| Core Web Vitals        | All green | PageSpeed Insights |

---

**Document Version:** 1.0.0 | **Last Updated:** 2026-02-01
