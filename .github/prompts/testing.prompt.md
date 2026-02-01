---
title: ComicWise - Testing Guide
version: 1.0.0
category: testing
phase: "7"
status: active
updated: 2026-02-01
master-ref: master.prompt.md#10-phase-7-testing
consolidated-from:
  - maintasks.prompt.md (Tasks 12)
  - automate.prompt.md (Phase 7)
description: Complete testing strategy with Vitest, Playwright, coverage targets
---

# ComicWise - Testing Guide

> **Master Prompt:** [master.prompt.md](master.prompt.md) | **Progress:** [memory-bank/progress.md](../../memory-bank/progress.md)

---

## Quick Reference

```bash
# Unit tests (watch mode)
pnpm test

# Unit tests (single run)
pnpm test:unit:run

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage

# Run specific test file
pnpm test tests/unit/actions/bookmark.test.ts

# Run with UI
pnpm test:ui
```

---

## Testing Stack

| Tool                | Purpose                  | Config File            |
| ------------------- | ------------------------ | ---------------------- |
| **Vitest**          | Unit & integration tests | `vitest.config.ts`     |
| **Playwright**      | E2E browser tests        | `playwright.config.ts` |
| **Testing Library** | Component testing        | (included in Vitest)   |
| **MSW**             | API mocking              | `__mocks__/`           |

---

## Test Directory Structure

```
tests/
├── setup-env.ts           # Global test setup
├── unit/
│   ├── actions/           # Server action tests
│   │   ├── bookmark.test.ts
│   │   ├── comic.test.ts
│   │   ├── chapter.test.ts
│   │   └── profile.test.ts
│   ├── components/        # Component tests
│   │   ├── comics/
│   │   ├── bookmarks/
│   │   └── ui/
│   ├── hooks/            # Custom hook tests
│   ├── utils/            # Utility function tests
│   └── schemas/          # Zod schema tests
└── e2e/
    ├── auth.spec.ts       # Authentication flows
    ├── comics.spec.ts     # Comic browsing flows
    ├── bookmarks.spec.ts  # Bookmark operations
    └── reader.spec.ts     # Chapter reader flows
```

---

## Coverage Targets

| Category       | Target | Current |
| -------------- | ------ | ------- |
| **Statements** | 80%    | ~77%    |
| **Branches**   | 70%    | ~65%    |
| **Functions**  | 80%    | ~75%    |
| **Lines**      | 80%    | ~77%    |

### Critical Paths (100% required)

- Authentication actions
- Bookmark mutations
- Payment/subscription logic (if any)
- Data validation schemas

---

## Unit Testing

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup-env.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/types/**", "src/database/drizzle/**"],
    },
  },
});
```

### Test Setup (`tests/setup-env.ts`)

```typescript
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock Next.js modules
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
  headers: () => new Map(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock database
vi.mock("@/database/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {},
  },
}));
```

### Server Action Test Pattern

```typescript
// tests/unit/actions/bookmark.test.ts
import { describe, test, expect, vi, beforeEach } from "vitest";
import { addBookmarkAction, removeBookmarkAction } from "@/lib/actions/bookmark.actions";
import * as mutations from "@/database/mutations/bookmark-mutations";

vi.mock("@/database/mutations/bookmark-mutations");

describe("Bookmark Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addBookmarkAction", () => {
    test("should create bookmark with valid input", async () => {
      const mockResult = { success: true, data: { id: 1, comicId: 1, userId: "user1" } };
      vi.mocked(mutations.createBookmark).mockResolvedValue(mockResult);

      const result = await addBookmarkAction({
        comicId: 1,
        status: "reading",
      });

      expect(result.ok).toBe(true);
      expect(result.data).toEqual(mockResult.data);
    });

    test("should return error for invalid input", async () => {
      const result = await addBookmarkAction({
        comicId: "invalid", // Should be number
      });

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
```

### Component Test Pattern

```typescript
// tests/unit/components/comics/ComicCard.test.tsx
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComicCard } from "@/components/comics/ComicCard";

describe("ComicCard", () => {
  const mockComic = {
    id: 1,
    title: "Test Comic",
    slug: "test-comic",
    coverImage: "/images/test.jpg",
    status: "ongoing",
  };

  test("renders comic title and image", () => {
    render(<ComicCard comic={mockComic} />);

    expect(screen.getByText("Test Comic")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Test Comic");
  });

  test("navigates to comic page on click", async () => {
    const user = userEvent.setup();
    render(<ComicCard comic={mockComic} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/comics/test-comic");
  });
});
```

### Schema Test Pattern

```typescript
// tests/unit/schemas/bookmark.schema.test.ts
import { describe, test, expect } from "vitest";
import { CreateBookmarkSchema, UpdateBookmarkSchema } from "@/schemas/bookmark.schema";

describe("Bookmark Schemas", () => {
  describe("CreateBookmarkSchema", () => {
    test("validates correct input", () => {
      const input = { comicId: 1, status: "reading" };
      const result = CreateBookmarkSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    test("rejects invalid status", () => {
      const input = { comicId: 1, status: "invalid" };
      const result = CreateBookmarkSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });
});
```

---

## E2E Testing

### Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Pattern

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("user can sign up and sign in", async ({ page }) => {
    // Sign up
    await page.goto("/sign-up");
    await page.fill('[name="name"]', "Test User");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "TestPassword123!");
    await page.fill('[name="confirmPassword"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/verify-request");

    // Sign in (after verification)
    await page.goto("/sign-in");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/");
    await expect(page.locator("text=Test User")).toBeVisible();
  });
});
```

### Comic Browsing E2E

```typescript
// tests/e2e/comics.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Comic Browsing", () => {
  test("user can browse and filter comics", async ({ page }) => {
    await page.goto("/comics");

    // Verify comics are displayed
    await expect(page.locator('[data-testid="comic-card"]').first()).toBeVisible();

    // Apply genre filter
    await page.click('[data-testid="genre-filter"]');
    await page.click("text=Action");

    // Verify filtered results
    await expect(page.locator('[data-testid="active-filter"]')).toContainText("Action");
  });

  test("user can search for comics", async ({ page }) => {
    await page.goto("/comics");

    await page.fill('[data-testid="search-input"]', "Naruto");
    await page.press('[data-testid="search-input"]', "Enter");

    await expect(page.locator('[data-testid="comic-card"]').first()).toContainText("Naruto");
  });
});
```

### Bookmark E2E

```typescript
// tests/e2e/bookmarks.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Bookmark Operations", () => {
  test.beforeEach(async ({ page }) => {
    // Login before bookmark tests
    await page.goto("/sign-in");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("user can add and remove bookmarks", async ({ page }) => {
    await page.goto("/comics/test-comic");

    // Add bookmark
    await page.click('[data-testid="add-bookmark-btn"]');
    await expect(page.locator('[data-testid="bookmark-status"]')).toBeVisible();

    // Check bookmarks page
    await page.goto("/bookmarks");
    await expect(page.locator("text=Test Comic")).toBeVisible();

    // Remove bookmark
    await page.goto("/comics/test-comic");
    await page.click('[data-testid="remove-bookmark-btn"]');

    // Verify removal
    await page.goto("/bookmarks");
    await expect(page.locator("text=Test Comic")).not.toBeVisible();
  });
});
```

---

## Mocking Setup

### Next.js Mocks (`__mocks__/next/`)

**`cache.ts`**

```typescript
export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();
```

**`headers.ts`**

```typescript
export const cookies = () => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
});

export const headers = () => new Map();
```

### Database Mocks

```typescript
// __mocks__/database.ts
export const mockDb = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};
```

---

## Test Commands Reference

```bash
# Unit tests
pnpm test                    # Watch mode
pnpm test:unit:run          # Single run
pnpm test:ui                # Vitest UI
pnpm test:coverage          # With coverage

# E2E tests
pnpm test:e2e               # All browsers
pnpm test:e2e --project=chromium  # Chromium only
pnpm test:e2e --headed      # Headed mode
pnpm test:e2e --debug       # Debug mode

# Specific tests
pnpm test tests/unit/actions/
pnpm test:e2e tests/e2e/auth.spec.ts
```

---

## CI Integration

### GitHub Actions Test Job

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit:run --coverage

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Testing Checklist

### Unit Tests ✅

- [x] Server action tests (77 tests passing)
- [x] Schema validation tests
- [x] Utility function tests
- [x] Hook tests
- [ ] Component tests (in progress)

### E2E Tests ✅

- [x] Authentication flow
- [x] Comic browsing
- [x] Bookmark operations
- [x] Chapter reader
- [ ] Admin panel CRUD

### Coverage

- [x] Actions: 85%+
- [x] Schemas: 95%+
- [x] Mutations: 80%+
- [ ] Components: 70% (target)

---

## Troubleshooting

### Test Failing Locally but Passes in CI

```bash
# Clear cache and retry
rm -rf node_modules/.vitest
pnpm test:unit:run
```

### Playwright Browser Issues

```bash
# Install browsers
npx playwright install --with-deps

# Update Playwright
pnpm add -D @playwright/test@latest
npx playwright install
```

### Flaky E2E Tests

- Add explicit waits: `await page.waitForSelector()`
- Check for race conditions
- Use test retries in config

---

**Document Version:** 1.0.0 | **Last Updated:** 2026-02-01
