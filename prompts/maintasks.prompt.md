---
title: ComicWise - Main Tasks Prompt
version: 1.0.0
updated: 2026-01-22
status: Remaining Implementation Tasks
platforms: Windows
packageManager: pnpm
framework: Next.js 16
---

# 🚀 ComicWise - Main Tasks Prompt (Remaining Implementation)

> **Complete GitHub Copilot prompt for implementing remaining features and optimizations**

---

## 📋 Prerequisites

**This prompt assumes completion of `mainsetup.prompt.md`**

**Verify before proceeding:**
- ✅ All VS Code configurations created
- ✅ All configuration files optimized
- ✅ Environment variables configured
- ✅ Database seeding system working
- ✅ `pnpm validate` passes

---

## 🎯 Core Implementation Principles

1. **Use Existing Patterns** - Reference and follow patterns from admin panel
2. **Type Safety** - No `any` types, use strict TypeScript
3. **Zod Validation** - Validate all user input with Zod schemas
4. **Server Actions** - Use server actions for all mutations
5. **Error Handling** - Comprehensive error handling and user feedback
6. **Progress Tracking** - Log progress for user feedback
7. **Component Reusability** - Create reusable components
8. **Performance** - Optimize images, queries, bundles
9. **Accessibility** - WCAG compliant UI
10. **Documentation** - JSDoc for all public APIs

---

## 🔧 TASK 1: User Profile Pages

### 1.1 Create Profile View Page

**File:** `src/app/(root)/profile/page.tsx`

**Features:**
- Display current user information
- User avatar (from database or fallback)
- Username, email, role
- Account statistics (comics read, bookmarks, etc.)
- Recent activity (last comics read, bookmarks added)
- Quick action buttons (Edit Profile, Change Password, Settings)
- Responsive design with proper spacing

**Components to create/use:**
- `ProfileView` component
- `ProfileStats` component
- `RecentActivity` component

**Server Component:** Get current user and display data

**Action:**
- Create page with proper layout
- Use NextAuth for authentication
- Display user data from database
- Add proper loading states

**Deliverable:**
- Working profile view page

---

### 1.2 Create Profile Edit Page

**File:** `src/app/(root)/profile/edit/page.tsx`

**Features:**
- Edit user profile form with:
  - Name (text input)
  - Email (email input with validation)
  - Bio (textarea)
  - Avatar upload (image input)
  - Confirm changes button
  - Cancel button
- Form validation with Zod
- Loading state during submission
- Success/error feedback
- Redirect to profile view on success

**Schema:** `ProfileUpdateSchema` in `src/schemas/profileSchemas.ts`

**Server Action:** `updateProfileAction` in `src/lib/actions/profile.ts`

**Components:**
- `ProfileEditForm` component using React Hook Form
- Avatar preview component
- Image upload handler

**Action:**
- Create comprehensive edit form
- Implement avatar upload
- Add proper validation
- Test with various inputs

**Deliverable:**
- Working profile edit page with form

---

### 1.3 Create Change Password Page

**File:** `src/app/(root)/profile/change-password/page.tsx`

**Features:**
- Change password form with:
  - Current password (password input)
  - New password (password input)
  - Confirm password (password input)
  - Password strength indicator
  - Change button
  - Cancel button
- Validate current password is correct
- Validate new password != current password
- Validate password strength (min 8 chars, upper/lower/number/symbol)
- Zod validation
- Success/error feedback

**Schema:** `ChangePasswordSchema` in `src/schemas/profileSchemas.ts`

**Server Action:** `changePasswordAction` in `src/lib/actions/profile.ts`

**Components:**
- `ChangePasswordForm` component
- Password strength indicator component

**Action:**
- Create form with proper validation
- Implement password strength checker
- Add security feedback
- Test password scenarios

**Deliverable:**
- Working change password page

---

### 1.4 Create Settings Page

**File:** `src/app/(root)/profile/settings/page.tsx`

**Features:**
- User settings form with:
  - Notification preferences (email notifications toggle)
  - Privacy settings (profile visibility)
  - Account settings (language, theme)
  - Danger zone (delete account button)
- Toggle switches for settings
- Save button
- Confirmation dialog for destructive actions
- Success/error feedback

**Schemas:** Create in `src/schemas/profileSchemas.ts`
- `NotificationSettingsSchema`
- `PrivacySettingsSchema`
- `AccountSettingsSchema`

**Server Actions:** Create in `src/lib/actions/profile.ts`
- `updateNotificationSettingsAction`
- `updatePrivacySettingsAction`
- `deleteAccountAction`

**Components:**
- `SettingsForm` component
- Confirmation dialog component

**Action:**
- Create settings form
- Implement toggle switches
- Add confirmation dialogs
- Test all settings updates

**Deliverable:**
- Working settings page

---

## 🔧 TASK 2: Comic Pages

### 2.1 Create Comics Listing Page

**File:** `src/app/(root)/comics/page.tsx`

**Features:**
- Grid layout (responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop)
- Comic cards with:
  - Cover image (lazy loaded)
  - Title
  - Author name
  - Rating (star display)
  - Genre badges
  - Status badge (ongoing/completed/hiatus)
- Filters sidebar:
  - By genre (multi-select)
  - By type (dropdown)
  - By status (ongoing/completed/hiatus)
- Sort options: Latest, Popular, Rating, Title
- Search functionality (full-text search)
- Pagination (20 items per page)
- Loading skeleton during fetch
- Empty state message

**Schemas:** Already exist, reference from database

**Server Data Fetching:**
- Fetch comics with filters/sort/search
- Count total comics for pagination
- Load images efficiently

**Components:**
- `ComicCard` component (reusable)
- `ComicFilters` component
- `ComicSearch` component
- `ComicPagination` component

**Action:**
- Create page with proper layout
- Implement filtering/sorting/search
- Add pagination
- Optimize image loading
- Test various filter combinations

**Deliverable:**
- Working comics listing page

---

### 2.2 Create Comic Details Page

**File:** `src/app/(root)/comics/[slug]/page.tsx`

**Features:**
- Comic header section:
  - Cover image (large, optimized)
  - Title and alternative titles
  - Author and artist names (clickable links)
  - Rating display with review count
  - Status badge
  - Type badge
  - Genre badges (clickable)
- Description/synopsis section
- Statistics:
  - Total chapters
  - Last updated date
  - View count
  - Rating/votes
- Action buttons:
  - Add to bookmarks button
  - Remove from bookmarks button (if bookmarked)
  - Share button
- Chapters list:
  - Chapter number
  - Chapter title
  - Release date
  - Chapter image thumbnail
  - Read button
  - Download button (optional)
- Related comics carousel (bottom)
- Comments section (optional)

**Schemas:** Use existing Comic schema

**Server Actions:**
- Get comic by slug (with related data)
- Get all chapters for comic
- Get related comics
- Get current user's bookmark status

**Components:**
- `ComicHeader` component
- `ComicDescription` component
- `ComicStats` component
- `ComicActions` component (with bookmark buttons)
- `ChapterList` component
- `RelatedComics` component (carousel)

**Action:**
- Create comprehensive detail page
- Implement bookmark status check
- Load related comics efficiently
- Add proper loading states

**Deliverable:**
- Working comic details page

---

### 2.3 Create Add/Remove Bookmark Components

**Files to create:**

**1. `src/components/comics/AddToBookmarkButton.tsx`**
- Button component that shows "Add to Bookmarks"
- Loading state during submission
- Success toast notification
- Status dropdown (Reading, Plan to Read, Completed, Dropped)
- Call `addToBookmarksAction`
- Optimistic UI update

**2. `src/components/comics/RemoveFromBookmarkButton.tsx`**
- Button component that shows "Bookmarked" when bookmarked
- Confirmation dialog before removal
- Loading state during submission
- Success toast notification
- Call `removeFromBookmarksAction`
- Optimistic UI update

**3. `src/components/comics/BookmarkStatus.tsx`**
- Display current bookmark status
- Quick dropdown to change status
- Visual indicator (bookmark icon/badge)
- Call `updateBookmarkStatusAction`

**4. `src/components/comics/BookmarkActions.tsx`**
- Client component that combines buttons
- Manages bookmark state
- Handles transitions
- Shows appropriate button based on bookmark status

**Schemas:** Already exist (BookmarkSchema)

**Server Actions:** Already exist in `src/lib/actions/bookmarks.ts`
- `addToBookmarksAction`
- `removeFromBookmarksAction`
- `updateBookmarkStatusAction`

**Action:**
- Create all components with proper states
- Implement optimistic updates
- Add toast notifications
- Test bookmark operations
- Update comic details page to use components

**Deliverable:**
- All bookmark components created and integrated

---

## 🔧 TASK 3: Chapter Reader Page

### 3.1 Create Chapter Reader Page

**File:** `src/app/(root)/comics/[slug]/[chapterSlug]/page.tsx`

**Features:**
- Image gallery/viewer with:
  - Display chapter images in vertical scroll mode (default)
  - Horizontal page mode option
  - Fit to width/height options
  - Zoom in/out controls
  - Full-screen mode
- Navigation:
  - Previous/next chapter buttons
  - Chapter list dropdown
  - Go to first/last chapter buttons
  - Current chapter progress display
- Reading progress:
  - Mark as read
  - Save last read position
  - Resume reading button
- Reading settings:
  - Background color (white/dark/sepia)
  - Image quality (low/medium/high)
  - Zoom level slider
  - Remember user preferences
- Keyboard navigation:
  - Arrow keys for next/prev page
  - Space for next image
  - Escape to close full-screen
- Touch gestures (swipe to navigate)

**Components:**
- `ChapterReader` component (client component for interactions)
- `ImageViewer` component
- `ChapterNavigation` component
- `ReadingSettings` component
- `ReadingProgress` component

**Server Data:**
- Fetch chapter with all images
- Get chapter list for dropdown
- Get next/previous chapters
- Get reading progress for user

**Server Actions:**
- Mark chapter as read
- Save reading progress
- Update user reading settings

**Action:**
- Create comprehensive reader page
- Implement image gallery with all features
- Add keyboard/touch support
- Save user preferences
- Test with various image counts

**Deliverable:**
- Working chapter reader page

---

## 🔧 TASK 4: Bookmarks Page

### 4.1 Create Bookmarks Listing Page

**File:** `src/app/(root)/bookmarks/page.tsx`

**Features:**
- Display all user bookmarks in grid or list view
- Bookmark cards with:
  - Comic cover image
  - Comic title
  - Bookmark status (Reading/Plan to Read/Completed/Dropped)
  - Last read chapter
  - Progress bar (chapters read vs total)
  - Quick actions (continue reading, remove bookmark)
- Filters:
  - By status (select multiple)
  - Recently added first
  - Recently updated first
- Sort options:
  - By date added (newest/oldest)
  - By title (A-Z/Z-A)
  - By progress (most/least read)
- Search (filter by comic title)
- View toggle (grid/list)
- Empty state message when no bookmarks

**Schemas:** Use existing Bookmark schema

**Server Data:**
- Get all bookmarks for current user
- Include comic info and chapter count
- Get user's reading progress

**Components:**
- `BookmarkCard` component
- `BookmarkFilters` component
- `BookmarkSearch` component
- `BookmarkViewToggle` component

**Action:**
- Create listing page
- Implement all filters and sort
- Add view toggle
- Test with various bookmark scenarios

**Deliverable:**
- Working bookmarks page

---

## 🔧 TASK 5: Root Pages Enhancement

### 5.1 Optimize Home Page

**File:** `src/app/(root)/page.tsx`

**Features:**
- Hero section with:
  - Catchy headline
  - Subheading
  - Call-to-action button
  - Background image or gradient
- Featured comics carousel
- New releases section
- Popular this week section
- Trending authors/genres
- Call-to-action to browse comics
- Responsive design

**Components:**
- `HeroSection` component
- `FeaturedComics` carousel component
- `NewReleases` component
- `TrendingComics` component
- `TrendingAuthors` component

**Action:**
- Create compelling home page
- Add proper carousel components
- Optimize image loading
- Add proper spacing and typography

**Deliverable:**
- Enhanced home page

---

### 5.2 Create Browse Page

**File:** `src/app/(root)/browse/page.tsx`

**Features:**
- Browse comics by:
  - Genre (grid of genre cards)
  - Author (searchable list)
  - Type (list view)
  - Status (ongoing, completed, hiatus)
- Search and filter
- Pagination

**Components:**
- `GenreGrid` component
- `AuthorList` component
- `TypeList` component

**Action:**
- Create browse page
- Implement browsing categories
- Add proper navigation

**Deliverable:**
- Working browse page

---

### 5.3 Create Genre Pages

**File:** `src/app/(root)/genres/[slug]/page.tsx`

**Features:**
- Display all comics in a specific genre
- Genre header with description
- Comics listing with filters
- Related genres suggestions

**Action:**
- Create genre detail page
- Load comics by genre
- Add filters and sort

**Deliverable:**
- Working genre page

---

## 🔧 TASK 6: Server Actions Validation

### 6.1 Audit Existing Server Actions

**Location:** `src/lib/actions/`

**Actions to verify/create:**

1. **Bookmark Actions:**
   - ✅ `addToBookmarksAction`
   - ✅ `removeFromBookmarksAction`
   - ✅ `updateBookmarkStatusAction`
   - ✅ `updateBookmarkProgressAction`
   - ✅ `getUserBookmarksAction`

2. **Profile Actions:**
   - `updateProfileAction`
   - `changePasswordAction`
   - `updateSettingsAction`
   - `deleteAccountAction`

3. **Comic Actions:**
   - `getComicBySlugAction`
   - `getComicsListAction`
   - `getRelatedComicsAction`

4. **Chapter Actions:**
   - `getChapterBySlugAction`
   - `getChapterListAction`
   - `markChapterAsReadAction`
   - `saveReadingProgressAction`

**Action:**
- Verify all existing actions work
- Create missing actions with proper error handling
- Add comprehensive JSDoc
- Test each action individually

**Deliverable:**
- All server actions implemented and tested

---

## 🔧 TASK 7: Zod Schemas Validation

### 7.1 Verify All Schemas Exist

**Locations:**
- `src/schemas/` directory for all schemas
- Or `src/lib/schemas/` if organized differently

**Schemas needed:**
- AuthSchemas (sign-up, sign-in, password reset, etc.)
- ProfileSchemas (update profile, change password, settings)
- ComicSchemas (create, update, list filter)
- ChapterSchemas (create, update)
- BookmarkSchemas (create, update, status change)
- GenreSchemas, AuthorSchemas, ArtistSchemas, TypeSchemas
- Seed schemas (for database seeding)

**Action:**
- Verify all schemas exist
- Check schema validation rules
- Ensure consistent validation across app
- Test schemas with valid/invalid data

**Deliverable:**
- All schemas verified and working

---

## 🔧 TASK 8: Scripts Optimization

### 8.1 Organize Scripts Directory

**Verify/Create scripts:**

**Development:**
- `dev` - Start development server
- `type-check` - Run TypeScript checks
- `lint` - Run ESLint
- `lint:fix` - Fix ESLint issues
- `format` - Run Prettier

**Database:**
- `db:push` - Push schema changes
- `db:migrate` - Run migrations
- `db:seed` - Seed database
- `db:seed:dry-run` - Validate seed data
- `db:reset` - Reset database
- `db:reset:hard` - Hard reset with seed

**Testing:**
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `test:e2e` - Run E2E tests
- `test:coverage` - Generate coverage report

**Building & Production:**
- `build` - Build for production
- `start` - Start production server
- `validate` - Run all validations

**Maintenance:**
- `cleanup` - Clean up project
- `analyze` - Analyze project
- `audit` - Security audit

**Action:**
- Verify all scripts in package.json
- Create any missing scripts
- Test each script
- Document script usage

**Deliverable:**
- All scripts working and documented

---

## 🔧 TASK 9: Error Handling & Loading States

### 9.1 Implement Global Error Boundary

**File:** `src/app/global-error.tsx`

**Features:**
- Catch unhandled errors
- Display user-friendly error message
- Provide recovery options
- Log error details for debugging

**Action:**
- Create or verify global error boundary
- Test with various error scenarios

**Deliverable:**
- Working global error handler

---

### 9.2 Create Loading Skeletons

**Location:** `src/components/ui/skeleton/` or `src/components/skeletons/`

**Skeletons needed:**
- `ComicCardSkeleton` - For comic cards
- `ChapterListSkeleton` - For chapter lists
- `ProfileSkeleton` - For profile page
- `BookmarkCardSkeleton` - For bookmark cards

**Action:**
- Create skeleton components
- Use in pages while loading data
- Test loading states

**Deliverable:**
- All skeleton components created

---

## 🔧 TASK 10: Image Optimization

### 10.1 Implement Image Component Best Practices

**Across all pages:**
- Use Next.js `Image` component instead of `<img>`
- Set `loading="lazy"` for below-fold images
- Provide proper `width` and `height` attributes
- Use `fill` prop with layout rules when appropriate
- Optimize image sizes with `sizes` prop
- Consider WebP format via next.config

**Action:**
- Audit all image usage
- Replace with Next.js Image component
- Test image loading performance
- Verify images display correctly

**Deliverable:**
- All images optimized

---

## 🔧 TASK 11: Performance Optimization

### 11.1 Implement Redis Caching

**Cache strategies:**
- Cache comic listings (invalidate on update)
- Cache user bookmarks
- Cache chapter data
- Cache genre/author/type lists

**Action:**
- Create cache utilities
- Implement cache invalidation
- Test cache hit/miss

**Deliverable:**
- Redis caching implemented

---

### 11.2 Database Query Optimization

**Optimize:**
- Add database indexes for frequently queried fields
- Use eager loading for related data
- Batch queries where possible
- Analyze slow queries

**Action:**
- Review all database queries
- Add necessary indexes
- Profile query performance
- Optimize as needed

**Deliverable:**
- Optimized database queries

---

## 🔧 TASK 12: Testing Implementation

### 12.1 Create Component Tests

**Test all new components:**
- Profile components
- Comic components
- Chapter reader components
- Bookmark components

**Tools:** Vitest + React Testing Library

**Coverage:** Aim for 80%+

**Action:**
- Create test files
- Test component rendering
- Test user interactions
- Test error states

**Deliverable:**
- Component tests with good coverage

---

### 12.2 Create Server Action Tests

**Test all server actions:**
- Authentication actions
- Bookmark actions
- Profile actions
- Comic/chapter actions

**Tools:** Vitest

**Test cases:**
- Success scenarios
- Error handling
- Invalid input validation
- Permission checks

**Action:**
- Create test files
- Test all scenarios
- Verify error handling

**Deliverable:**
- Server action tests

---

### 12.3 Create E2E Tests

**Critical user journeys:**
- Sign up → Sign in → View comics → Add bookmark
- View comic → Read chapter → Mark as read
- Edit profile → Change password
- Browse comics with filters

**Tools:** Playwright

**Action:**
- Create E2E test files
- Test full user journeys
- Verify all features work together

**Deliverable:**
- E2E tests for critical paths

---

## 🔧 TASK 13: CI/CD Workflow Setup

### 13.1 Create GitHub Actions Workflows

**Files:**

**1. `.github/workflows/ci.yml`**
- Trigger: On push and pull request
- Jobs:
  - Install dependencies
  - Lint code (`pnpm lint`)
  - Type check (`pnpm type-check`)
  - Run tests (`pnpm test`)
  - Build (`pnpm build`)
- Cache dependencies and build artifacts

**2. `.github/workflows/cd.yml`**
- Trigger: On push to main
- Jobs:
  - Build Docker image
  - Run all CI checks
  - Deploy to staging (Vercel or custom server)
  - Deploy to production (with manual approval)

**3. `.github/workflows/migrations.yml`**
- Trigger: Manual or on schema changes
- Jobs:
  - Validate migrations
  - Test migrations on staging DB
  - Apply to production (with backup)

**Action:**
- Create all workflow files
- Test workflows with a test push
- Verify all jobs pass

**Deliverable:**
- Working CI/CD pipelines

---

## 🔧 TASK 14: Documentation

### 14.1 Create Comprehensive README

**File:** `README.md`

**Sections:**
1. Project Overview
2. Features List
3. Tech Stack
4. Prerequisites
5. Installation
6. Environment Setup
7. Running Development Server
8. Database Setup
9. Building for Production
10. Testing
11. Deployment
12. Contributing Guidelines
13. License
14. Support/Contact

**Action:**
- Create comprehensive README
- Include code examples
- Add screenshots if possible
- Ensure clarity

**Deliverable:**
- Complete README.md

---

### 14.2 Create Additional Documentation

**Files:**

**`docs/setup.md`** - Detailed setup instructions
**`docs/architecture.md`** - System architecture overview
**`docs/api-reference.md`** - API/server action reference
**`docs/database.md`** - Database schema documentation
**`docs/deployment.md`** - Deployment guide
**`docs/contributing.md`** - Contributing guidelines

**Action:**
- Create all documentation files
- Include code examples
- Keep documentation updated

**Deliverable:**
- Comprehensive project documentation

---

## 🔧 TASK 15: Final Validation & Cleanup

### 15.1 Run Final Validation

**Commands:**
```bash
pnpm validate          # Type-check, lint, etc.
pnpm test             # Run all tests
pnpm build            # Build for production
```

**Expected:** All pass with no errors

**Action:**
- Fix any remaining issues
- Ensure all tests pass
- Verify build succeeds

**Deliverable:**
- ✅ All validations pass

---

### 15.2 Clean Up Project

**Remove:**
- Unused files/components
- Unused dependencies
- `.backup` files
- Temporary files
- Console.log statements (except logging utilities)

**Action:**
- Review entire project
- Remove unnecessary items
- Clean up imports
- Verify nothing breaks

**Deliverable:**
- Clean, optimized project

---

### 15.3 Create Recommendations List

**File:** `RECOMMENDATIONS.md` or update existing `recommendations-list.md`

**Include:**
- Performance optimization suggestions
- Future feature ideas
- Scaling considerations
- Security enhancements
- Testing improvements

**Action:**
- Document recommendations
- Prioritize by importance
- Include implementation notes

**Deliverable:**
- Recommendations document

---

## 📋 Completion Checklist

After completing all tasks, verify:

### Pages & Components
- ✅ Profile pages (view, edit, change password, settings)
- ✅ Comics listing page with filters
- ✅ Comic details page with bookmark actions
- ✅ Chapter reader page
- ✅ Bookmarks page
- ✅ Home page enhanced
- ✅ Browse page created
- ✅ Genre pages created
- ✅ Bookmark components (add, remove, status)

### Server Actions
- ✅ All profile actions implemented
- ✅ All comic actions implemented
- ✅ All chapter actions implemented
- ✅ All bookmark actions implemented
- ✅ Error handling for all actions

### Database & Seeding
- ✅ Database seeding complete
- ✅ All images downloaded
- ✅ `pnpm db:seed` successful

### Code Quality
- ✅ No TypeScript errors (`pnpm type-check`)
- ✅ No linting errors (`pnpm lint`)
- ✅ No tests failing (`pnpm test`)
- ✅ Builds successfully (`pnpm build`)

### Testing
- ✅ Unit tests created (80%+ coverage)
- ✅ Integration tests created
- ✅ E2E tests for critical paths
- ✅ All tests passing

### Documentation
- ✅ README.md comprehensive
- ✅ Code commented with JSDoc
- ✅ API documentation created
- ✅ Setup guide created

### CI/CD
- ✅ GitHub Actions workflows created
- ✅ CI pipeline passing
- ✅ CD pipeline tested
- ✅ Deployments working

### Performance
- ✅ Images optimized
- ✅ Database queries optimized
- ✅ Caching implemented
- ✅ Build size optimized

### Security
- ✅ No secrets in code
- ✅ Authentication working
- ✅ Authorization checks in place
- ✅ Input validation with Zod

---

## 🎯 Success Criteria

The project is complete when:

1. **All Pages Working** - All user-facing pages functional and responsive
2. **No Type Errors** - `pnpm type-check` passes
3. **No Linting Errors** - `pnpm lint` passes
4. **Tests Passing** - `pnpm test` passes (80%+ coverage)
5. **Build Successful** - `pnpm build` completes without errors
6. **Database Seeded** - `pnpm db:seed` completes successfully
7. **Deployable** - Application ready for production deployment
8. **Documented** - Comprehensive documentation complete
9. **Optimized** - Performance optimized, best practices followed
10. **Secure** - No known vulnerabilities, security best practices applied

---

## 📝 Final Notes

### If Errors Occur:
1. Read error message carefully
2. Check related code and dependencies
3. Review relevant documentation
4. Test in isolation if needed
5. Use debugging tools (VS Code debugger, browser DevTools)
6. Check project GitHub issues/discussions
7. Review error logs in detail

### Performance Tips:
- Use React DevTools Profiler
- Monitor bundle size with `pnpm build --analyze`
- Check database query performance
- Use Chrome DevTools for frontend performance
- Monitor server performance with `pnpm build --stats`

### Common Issues:
- **Module not found:** Check imports and path aliases
- **Type errors:** Review type definitions and usage
- **Database errors:** Check migrations and schema
- **Image errors:** Verify image paths and permissions
- **Authentication errors:** Check NextAuth config
- **Build errors:** Check for circular dependencies

---

## 🚀 Deployment

After all tasks complete and tests pass:

### Deploy to Vercel:
```bash
pnpm deploy:vercel
```

### Deploy to Docker:
```bash
pnpm docker:build
pnpm docker:up
```

### Deploy to Custom Server:
1. Build: `pnpm build`
2. Upload: Copy build files to server
3. Run: `pnpm start`
4. Monitor: Check logs and health

---

**This is the Main Tasks Prompt for ComicWise. Complete all tasks and verify the completion checklist before deployment.**

