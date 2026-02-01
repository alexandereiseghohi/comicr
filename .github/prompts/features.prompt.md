---
title: ComicWise - Feature Implementation Guide
version: 1.0.0
category: features
phase: "2-5"
status: active
updated: 2026-02-01
master-ref: master.prompt.md#7-phase-3-5-feature-implementation
consolidated-from:
  - maintasks.prompt.md
  - main-complete.prompt.md
  - main-complete-v2.prompt.md
description: Complete feature implementation tasks for profiles, comics, chapters, bookmarks
---

# ComicWise - Feature Implementation Guide

> **Master Prompt:** [master.prompt.md](master.prompt.md) | **Progress:** [memory-bank/progress.md](../../memory-bank/progress.md)

---

## Implementation Principles

1. **Use Existing Patterns** - Reference admin panel patterns
2. **Type Safety** - No `any` types, strict TypeScript
3. **Zod Validation** - Validate all user input
4. **Server Actions** - Use for all mutations
5. **Error Handling** - Comprehensive user feedback
6. **Component Reusability** - Create reusable components
7. **Performance** - Optimize images, queries, bundles
8. **Accessibility** - WCAG compliant UI

---

## Phase 2: User Profile Features

### Task 2.1: Profile View Page ✅

**File:** `src/app/(root)/profile/page.tsx`

**Features:**

- [x] Display current user information
- [x] User avatar with fallback
- [x] Account statistics (comics read, bookmarks)
- [x] Recent activity feed
- [x] Quick action buttons

**Components:**

- `ProfileView` - Main profile display
- `ProfileStats` - Statistics cards
- `RecentActivity` - Activity list

---

### Task 2.2: Profile Edit Page ✅

**File:** `src/app/(root)/profile/edit/page.tsx`

**Features:**

- [x] Edit form with Zod validation
- [x] Avatar upload support
- [x] Success/error feedback
- [x] Redirect on success

**Schema:** `ProfileUpdateSchema` in `src/schemas/profile.schema.ts`
**Action:** `updateProfileAction` in `src/lib/actions/profile.actions.ts`

---

### Task 2.3: Change Password Page ✅

**File:** `src/app/(root)/profile/change-password/page.tsx`

**Features:**

- [x] Current/new password validation
- [x] Password strength indicator
- [x] Security feedback

**Schema:** `ChangePasswordSchema`
**Action:** `changePasswordAction`

---

### Task 2.4: Settings Page ✅

**File:** `src/app/(root)/profile/settings/page.tsx`

**Features:**

- [x] Notification preferences
- [x] Privacy settings
- [x] Account settings (theme, language)
- [x] Danger zone (delete account)

---

## Phase 3: Comic Features

### Task 3.1: Comics Listing Page ✅

**File:** `src/app/(root)/comics/page.tsx` (373 lines)

**Features:**

- [x] Responsive grid layout (2/3/4 cols)
- [x] Comic cards with lazy-loaded images
- [x] Filter sidebar (genre, type, status)
- [x] Sort options (latest, popular, rating)
- [x] Search functionality
- [x] Pagination (20 per page)
- [x] Loading skeletons

**Components:**

- `ComicCard` - Reusable card component
- `ComicFilters` - Filter sidebar
- `ComicSearch` - Search input
- `ComicPagination` - Page navigation

---

### Task 3.2: Comic Details Page ✅

**File:** `src/app/(root)/comics/[slug]/page.tsx` (303 lines)

**Features:**

- [x] Comic header with cover image
- [x] Title, author, artist info
- [x] Rating display with count
- [x] Status and genre badges
- [x] Description section
- [x] Statistics (chapters, views)
- [x] Bookmark toggle button
- [x] Chapter list with links
- [x] Related comics section

**Components:**

- `ComicHeader` - Header section
- `ComicDescription` - Synopsis
- `ComicStats` - Statistics display
- `BookmarkActions` - Bookmark buttons
- `ChapterList` - Chapter listing
- `RelatedComics` - Recommendations

---

### Task 3.3: Bookmark Components ✅

**Files:**

- `src/components/comics/AddToBookmarkButton.tsx`
- `src/components/comics/RemoveFromBookmarkButton.tsx`
- `src/components/comics/BookmarkStatus.tsx`
- `src/components/bookmarks/BookmarkActions.tsx`

**Features:**

- [x] Optimistic UI updates
- [x] Status dropdown (Reading, Plan to Read, etc.)
- [x] Toast notifications
- [x] Loading states

**Actions:** `src/lib/actions/bookmark.actions.ts`

- `addToBookmarksAction`
- `removeFromBookmarksAction`
- `updateBookmarkStatusAction`

---

## Phase 4: Chapter Reader

### Task 4.1: Chapter Reader Page ✅

**File:** `src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx`

**Features:**

- [x] Vertical scroll mode (default)
- [x] Horizontal page mode option
- [x] Fit to width/height options
- [x] Zoom controls
- [x] Full-screen mode
- [x] Previous/next navigation
- [x] Chapter dropdown
- [x] Reading progress tracking
- [x] Keyboard navigation (arrows, space, esc)
- [x] Touch gestures (swipe)

**Settings:**

- Background color (white/dark/sepia)
- Image quality (low/medium/high)
- Zoom level slider

**Components:**

- `ChapterReader` - Main reader
- `ImageViewer` - Image display
- `ChapterNavigation` - Nav controls
- `ReadingSettings` - Settings panel
- `ReadingProgress` - Progress indicator

---

## Phase 5: Bookmarks Management

### Task 5.1: Bookmarks Listing Page ✅

**File:** `src/app/(root)/bookmarks/page.tsx`

**Features:**

- [x] Grid/list view toggle
- [x] Bookmark cards with progress
- [x] Filter by status
- [x] Sort by date/title/progress
- [x] Search bookmarks
- [x] Empty state handling

**Components:**

- `BookmarkCard` - Card component
- `BookmarkFilters` - Filter controls
- `BookmarkSearch` - Search input
- `BookmarkViewToggle` - View switcher

---

## UI/UX Decision Matrix

| Feature                  | Decision              | Rationale                             |
| ------------------------ | --------------------- | ------------------------------------- |
| Comic Detail Description | Truncated (250 chars) | Prevent layout issues, faster loading |
| Chapter Reader Default   | Vertical scroll       | Most popular mobile experience        |
| Bookmark Status          | Dropdown              | Fits limited space, clear options     |
| Image Loading            | Lazy + Skeleton       | Performance + user feedback           |
| Search                   | Debounced (300ms)     | Reduce API calls                      |
| Pagination               | Server-side           | Better for large datasets             |

---

## Root Pages

### Task: Home Page Enhancement

**File:** `src/app/(root)/page.tsx`

**Sections:**

- [x] Hero section with CTA
- [x] Featured comics carousel
- [x] New releases section
- [x] Popular this week
- [x] Genre shortcuts

**Components:**

- `HeroSection` - Main banner
- `FeaturedComics` - Carousel
- `NewReleases` - Recent comics
- `TrendingComics` - Popular section

---

### Task: Browse Page

**File:** `src/app/(root)/browse/page.tsx`

**Features:**

- [x] Genre grid (clickable cards)
- [x] Author list (searchable)
- [x] Type list
- [x] Status filters

---

### Task: Genre Pages

**File:** `src/app/(root)/genres/[slug]/page.tsx`

**Features:**

- [x] Genre header with description
- [x] Comics listing with filters
- [x] Related genres links

---

## Server Actions Reference

### Profile Actions (`src/lib/actions/profile.actions.ts`)

| Action                 | Schema                 | Status |
| ---------------------- | ---------------------- | ------ |
| `updateProfileAction`  | `ProfileUpdateSchema`  | ✅     |
| `changePasswordAction` | `ChangePasswordSchema` | ✅     |
| `updateSettingsAction` | `SettingsSchema`       | ✅     |
| `deleteAccountAction`  | N/A                    | ✅     |

### Bookmark Actions (`src/lib/actions/bookmark.actions.ts`)

| Action                       | Schema                 | Status |
| ---------------------------- | ---------------------- | ------ |
| `addToBookmarksAction`       | `CreateBookmarkSchema` | ✅     |
| `removeFromBookmarksAction`  | N/A                    | ✅     |
| `updateBookmarkStatusAction` | `UpdateBookmarkSchema` | ✅     |
| `getUserBookmarksAction`     | N/A                    | ✅     |

### Comic Actions (`src/lib/actions/comic.actions.ts`)

| Action                   | Schema              | Status |
| ------------------------ | ------------------- | ------ |
| `getComicBySlugAction`   | N/A                 | ✅     |
| `getComicsListAction`    | `ComicFilterSchema` | ✅     |
| `getRelatedComicsAction` | N/A                 | ✅     |

### Chapter Actions (`src/lib/actions/chapter.actions.ts`)

| Action                      | Schema                  | Status |
| --------------------------- | ----------------------- | ------ |
| `getChapterAction`          | N/A                     | ✅     |
| `getChapterListAction`      | N/A                     | ✅     |
| `markChapterAsReadAction`   | N/A                     | ✅     |
| `saveReadingProgressAction` | `ReadingProgressSchema` | ✅     |

---

## Zod Schemas Reference

**Location:** `src/schemas/`

| Schema                  | File                         | Status |
| ----------------------- | ---------------------------- | ------ |
| `ProfileUpdateSchema`   | `profile.schema.ts`          | ✅     |
| `ChangePasswordSchema`  | `profile.schema.ts`          | ✅     |
| `CreateBookmarkSchema`  | `bookmark.schema.ts`         | ✅     |
| `UpdateBookmarkSchema`  | `bookmark.schema.ts`         | ✅     |
| `ComicFilterSchema`     | `comic.schema.ts`            | ✅     |
| `ChapterSchema`         | `chapter.schema.ts`          | ✅     |
| `ReadingProgressSchema` | `reading-progress.schema.ts` | ✅     |

---

## Component Checklist

### Core UI Components

- [x] `ComicCard` - Comic display card
- [x] `ChapterList` - Chapter listing
- [x] `BookmarkCard` - Bookmark display
- [x] `ProfileView` - Profile display
- [x] `ImageViewer` - Image gallery

### Action Components

- [x] `BookmarkActions` - Add/remove/status
- [x] `ChapterNavigation` - Reader navigation
- [x] `ReadingSettings` - Reader settings

### Loading States

- [x] `ComicCardSkeleton`
- [x] `ChapterListSkeleton`
- [x] `ProfileSkeleton`
- [x] `BookmarkCardSkeleton`

---

## Validation Commands

```bash
# Type check all feature files
pnpm type-check

# Lint feature components
pnpm lint src/app/\(root\) src/components

# Run feature-related tests
pnpm test:unit:run tests/unit/features

# E2E test user flows
pnpm test:e2e tests/e2e/user-flows.spec.ts
```

---

## Success Criteria

- [ ] All pages accessible and responsive
- [ ] TypeScript: 0 errors (`pnpm type-check`)
- [ ] ESLint: 0 errors (`pnpm lint`)
- [ ] Tests: All passing, 80%+ coverage
- [ ] Build: Successful (`pnpm build`)
- [ ] Performance: Core Web Vitals in green

---

**Document Version:** 1.0.0 | **Last Updated:** 2026-02-01
