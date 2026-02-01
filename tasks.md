# ComicWise Complete Setup - Implementation Tasks

**Document Version**: 1.0
**Date**: February 1, 2026
**Source**: `.github/prompts/plan-comicwiseComplete40TaskSetup.prompt.md`
**Related**: `requirements.md`, `design.md`

---

## Task Execution Summary

- **Total Tasks**: 40 tasks across 9 phases
- **Estimated Duration**: 12-16 hours (single session)
- **Parallelization**: 4 clusters with 5 validation gates
- **Git Commits**: 9 commits (one per phase)
- **Validation Gates**: 5 gates ensuring quality at each phase

---

## Phase 1: Critical Foundation (1-2 hours)

**Validation Gate**: `pnpm type-check` → 0 errors

### Task 16: Environment Variables Complete Setup

**Status**: Not Started
**Duration**: 30 minutes
**Dependencies**: None
**Parallel**: No (foundational)

**Subtasks**:

1. Create `.env.template` with 60+ documented variables

   - Database connection strings (DATABASE_URL, NEON_DATABASE_URL)
   - Authentication secrets (AUTH_SECRET, Google OAuth, GitHub OAuth)
   - Redis configuration (Upstash)
   - Image storage (ImageKit, Cloudinary, AWS S3)
   - Error tracking (Sentry)
   - Email service (Resend, SMTP)
   - Payment processing (Stripe)
   - Seeding defaults (CUSTOM_PASSWORD, SEED_MAX_IMAGE_SIZE_BYTES)
   - URLs (NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL, NEXTAUTH_URL)
   - Analytics (Google Analytics, Vercel Analytics)
   - Feature flags, performance settings, security settings
   - Testing configuration
   - Build/deployment (Vercel)

2. Create `.env.md` comprehensive setup guide (8000+ words)

   - Authentication setup guides (Google OAuth step-by-step, GitHub OAuth)
   - Database setup (Neon, local PostgreSQL)
   - Redis setup (Upstash, local)
   - Image storage setup (ImageKit, alternatives)
   - Monitoring setup (Sentry)
   - Email service setup (Resend, SMTP)
   - Quick start guide
   - Troubleshooting section

3. Migrate existing `.env.local` values to new template format

4. Add placeholder comments for:

   - Google OAuth credentials
   - Sentry DSN
   - Upstash Redis URL/token

5. Run `pnpm validate:env` to verify configuration

6. Update `.gitignore` to ensure `.env.local` never committed

**Acceptance Criteria**:

- [ ] `.env.template` exists with 60+ variables documented
- [ ] `.env.md` exists with 8000+ words of setup instructions
- [ ] All required variables have inline documentation and setup links
- [ ] `pnpm validate:env` passes without errors
- [ ] `.env.local` is in `.gitignore`

---

### Task 1: Create Missing `use-toast` Hook

**Status**: Not Started
**Duration**: 15 minutes
**Dependencies**: None
**Parallel**: Yes (with Tasks 2-3)

**Subtasks**:

1. Create `src/hooks/use-toast.ts` file
2. Import `toast` from `sonner` library
3. Create wrapper hook that returns `{ toast: sonnerToast }`
4. Re-export `toast` for direct usage
5. Add JSDoc documentation with usage example
6. Verify import resolves in all components using toast

**Acceptance Criteria**:

- [ ] `src/hooks/use-toast.ts` exists
- [ ] Hook wraps Sonner toast library
- [ ] Components import and use hook successfully
- [ ] TypeScript resolves imports without errors

---

### Task 2: Fix Component Errors

**Status**: Not Started
**Duration**: 20 minutes
**Dependencies**: Task 1 (use-toast hook)
**Parallel**: Yes (with Tasks 1, 3)

**Subtasks**:

1. Fix `ReadingProgressTracker.tsx` syntax error on line 30

   - Change `setSaved Progress` to `setSavedProgress`

2. Fix `CommentSection.tsx` import paths

   - Update AlertDialog imports from `@/components/ui/dialog` to `@/components/ui/alert-dialog`
   - Import all required AlertDialog subcomponents

3. Fix `progress.tsx` export

   - Ensure default export exists: `export default Progress;`

4. Fix `delete-account` route null type issue
   - Change `email: null` to `email: \`deleted\_\${session.user.id}@example.com\``
   - Ensure PII anonymization pattern

**Acceptance Criteria**:

- [ ] ReadingProgressTracker compiles without syntax errors
- [ ] CommentSection imports AlertDialog correctly
- [ ] Progress component has default export
- [ ] Delete account route passes type-check
- [ ] All component TypeScript errors resolved

---

### Task 3: Fix DAL Layer Type Issues

**Status**: Not Started
**Duration**: 45 minutes
**Dependencies**: None
**Parallel**: Yes (with Tasks 1-2)

**Subtasks**:

1. Fix `src/dal/bookmark-dal.ts`

   - Update parameter signatures to `(userId, comicId)` pattern
   - Ensure return types match query layer

2. Fix `src/dal/comment-dal.ts`

   - Rename `createComment` to `addComment` for consistency
   - Update return types

3. Fix `src/dal/rating-dal.ts`

   - Use `createOrUpdateRating` pattern for upserts
   - Handle composite unique key [userId, comicId]

4. Fix `src/dal/notification-dal.ts`

   - Update to 7-parameter signature as per spec
   - Verify parameter types

5. Fix `src/dal/reading-progress-dal.ts`

   - Use `createOrUpdateReadingProgress` pattern
   - Handle composite unique key [userId, comicId]

6. Export missing types from `src/database/queries/comment-queries.ts`

   - Export `CommentWithUser` type
   - Export `buildCommentTree` function

7. Update all imports in server actions to use new DAL signatures

**Acceptance Criteria**:

- [ ] All DAL functions have correct parameter signatures
- [ ] Types exported from query files
- [ ] Server actions import and use DAL correctly
- [ ] DATABASE_LAYER_STATUS.md reflects updated status
- [ ] TypeScript type-check passes with 0 errors

---

**Phase 1 Git Commit**:

```bash
git add .
git commit -m "Phase 1: Environment & TypeScript Fixes - Tasks 16, 1-3 ✅

- Created .env.template with 60+ documented variables
- Created .env.md with comprehensive setup guides (8000+ words)
- Created use-toast hook (fixes 4+ component errors)
- Fixed ReadingProgressTracker syntax error
- Fixed CommentSection import paths
- Fixed delete-account route null type issue
- Fixed DAL layer parameter signatures (8 files)
- Exported missing types from queries
- TypeScript errors: 56+ → 0"
git push origin main
```

---

## Phase 2: Core Configuration Optimization (2-3 hours)

**Validation Gate**: Configuration files functional, project builds

### Parallel Cluster 1: Configuration Files (Can run in parallel)

---

### Task 6: next.config.ts Optimization

**Status**: Not Started
**Duration**: 45 minutes
**Dependencies**: Phase 1 complete
**Parallel**: Yes (Cluster 1)

**Subtasks**:

1. Add security headers:

   - Content-Security-Policy (strict CSP)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy (restrictive)
   - Strict-Transport-Security (HSTS with preload)

2. Optimize image configuration:

   - Add AVIF and WebP formats (AVIF priority)
   - Define deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
   - Define imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
   - Set minimumCacheTTL: 31536000 (1 year)

3. Add package import optimizations:

   - Add @heroicons/react, clsx, class-variance-authority
   - Add @tanstack/react-query, react-hook-form, zod
   - Total 20+ optimized package imports

4. Enable experimental features:
   - optimizeServerReact: true
   - serverMinification: true
   - webpackBuildWorker: true

**Acceptance Criteria**:

- [ ] Security headers configured and functional
- [ ] Image optimization settings applied
- [ ] 20+ packages in optimizePackageImports
- [ ] Experimental features enabled
- [ ] `pnpm build` succeeds

---

### Task 7: nextSitemap.config.ts Enhancement

**Status**: Not Started
**Duration**: 30 minutes
**Dependencies**: Phase 1 complete
**Parallel**: Yes (Cluster 1)

**Subtasks**:

1. Configure sitemap exclusions:

   - Exclude /admin/_, /api/_, /sign-in, /sign-up, /error, /verify-request, /forgot-password, /reset-password, /dev/\*

2. Configure robots.txt:

   - Allow all user agents for /
   - Disallow /admin, /api, /dev
   - Add additional sitemaps (sitemap-comics.xml, sitemap-chapters.xml)

3. Implement dynamic priority via transform function:

   - Comics: priority 0.8, changefreq weekly
   - Chapters: priority 0.6, changefreq daily
   - Other pages: priority 0.5, changefreq monthly

4. Test sitemap generation:
   - Run `pnpm next-sitemap`
   - Verify sitemap.xml structure
   - Check robots.txt content

**Acceptance Criteria**:

- [ ] Sitemap excludes admin/API/auth routes
- [ ] Robots.txt has correct allow/disallow policies
- [ ] Dynamic priority weighting works
- [ ] Sitemap generation succeeds

---

### Task 8: package.json Optimization

**Status**: Not Started
**Duration**: 20 minutes
**Dependencies**: Phase 1 complete
**Parallel**: Yes (Cluster 1)

**Subtasks**:

1. Add engines field:

   - node: ">=20.0.0"
   - pnpm: ">=9.0.0"

2. Add packageManager field:

   - "pnpm@9.0.0"

3. Add new utility scripts:

   - update-deps: "pnpm update --latest --recursive"
   - security-audit: "pnpm audit --audit-level moderate"
   - analyze:deps: "pnpm list --depth=0"
   - analyze:bundle: "ANALYZE=true pnpm build"
   - check:updates: "pnpm outdated"

4. Add enhanced validation scripts:

   - validate:full: "pnpm type-check && pnpm lint && pnpm test:unit:run && pnpm test:e2e"
   - validate:ci: "pnpm validate:full && pnpm build"

5. Add cleanup scripts:
   - cleanup:reports: "rm -f _.json _.csv \*.log"
   - cleanup:cache: "rm -rf .next node_modules/.cache"
   - cleanup:all: "pnpm cleanup:reports && pnpm cleanup:cache"

**Acceptance Criteria**:

- [ ] Engines enforced (node >=20, pnpm >=9)
- [ ] All new scripts functional
- [ ] Scripts documented in README.md
- [ ] `pnpm security-audit` runs successfully

---

### Task 9: tsconfig.json Optimization

**Status**: Not Started
**Duration**: 15 minutes
**Dependencies**: Phase 1 complete
**Parallel**: Yes (Cluster 1)

**Subtasks**:

1. Enable strictness flags:

   - noUnusedLocals: true
   - noUnusedParameters: true
   - noFallthroughCasesInSwitch: true
   - forceConsistentCasingInFileNames: true

2. Enable additional type safety:

   - exactOptionalPropertyTypes: true
   - noUncheckedIndexedAccess: true

3. Enable debugging improvements:

   - declarationMap: true

4. Verify existing good settings:
   - incremental: true ✓
   - strict: true ✓

**Acceptance Criteria**:

- [ ] All strictness flags enabled
- [ ] Type safety flags enabled
- [ ] `pnpm type-check` passes
- [ ] No new type errors introduced

---

### Task 10: eslint.config.mjs Enhancement

**Status**: Not Started
**Duration**: 30 minutes
**Dependencies**: Phase 1 complete
**Parallel**: Yes (Cluster 1)

**Subtasks**:

1. Add unicorn/filename-case rule:

   - Enforce kebab-case for all files
   - Ignore: README.md, CHANGELOG.md, LICENSE
   - Allow PascalCase for: src/components/**/\*.tsx, src/app/**/page.tsx, src/app/\*\*/layout.tsx

2. Add no-restricted-syntax rule:

   - Enforce "use server" directive in server actions
   - Detect functions exported from /actions/ directory

3. Test lint rules:
   - Run `pnpm lint`
   - Identify violations
   - Plan fixes for Task 35

**Acceptance Criteria**:

- [ ] Kebab-case rule active
- [ ] Server action directive rule active
- [ ] Lint identifies file naming violations
- [ ] Rule exceptions work correctly

---

### Task 11: .prettierrc.ts Verification

**Status**: Not Started
**Duration**: 10 minutes
**Dependencies**: Phase 1 complete
**Parallel**: Yes (Cluster 1)

**Subtasks**:

1. Verify optimal Prettier configuration:

   - semi: true ✓
   - singleQuote: false ✓
   - tabWidth: 2 ✓
   - trailingComma: "es5" ✓
   - printWidth: 100 ✓
   - arrowParens: "always" ✓
   - endOfLine: "lf" ✓

2. Run formatting check:

   - `pnpm format:check`

3. Auto-format if needed:
   - `pnpm format`

**Acceptance Criteria**:

- [ ] Prettier config verified as optimal
- [ ] `pnpm format:check` passes
- [ ] No formatting inconsistencies

---

### Tasks 12-15: .gitignore, .dockerignore, .prettierignore Enhancements

**Status**: Not Started
**Duration**: 20 minutes
**Dependencies**: Phase 1 complete
**Parallel**: Yes (Cluster 1)

**Subtasks**:

1. Update `.gitignore`:

   - Add backup files: _.backup, _.bak, .backup/
   - Add report files: _.report.json, _-report.json, \*.csv
   - Add temporary files: temp*, test*.txt, sample\*.txt

2. Update `.dockerignore` (if exists):

   - Mirror .gitignore patterns
   - Add .git, .vscode, node_modules

3. Update `.prettierignore` (if exists):

   - Add .next, dist, coverage
   - Add generated files

4. Verify git status:
   - Ensure .env.local not tracked
   - Check ignored files work: `git check-ignore -v file.backup`

**Acceptance Criteria**:

- [ ] .gitignore updated with all patterns
- [ ] Backup/report/temp files ignored
- [ ] `git status` clean
- [ ] `.env.local` never appears in git

---

**Phase 2 Git Commit**:

```bash
git add .
git commit -m "Phase 2: Configuration Files Enhanced - Tasks 6-15 ✅

- Enhanced next.config.ts: Security headers, image optimization, bundle analysis
- Optimized nextSitemap.config.ts: Dynamic routes, priority weighting
- Updated package.json: Added engines, new scripts (update-deps, security-audit)
- Improved tsconfig.json: Stricter type checking, declaration maps
- Enhanced eslint.config.mjs: Kebab-case rule, server action validation
- Updated .gitignore: Backup files, reports, temp files
- Verified all config files functional

Validation: All configs tested and working"
git push origin main
```

---

## Phase 3: Database & Seeding Enhancement (2-3 hours)

**Validation Gate**: `pnpm db:seed` succeeds

### Task 17: Advanced Seeding System

**Status**: Not Started
**Duration**: 90 minutes
**Dependencies**: Phase 1-2 complete
**Parallel**: No (database foundational)

**Subtasks**:

1. Organize seed data files:

   - Create `data/seed-source/` directory
   - Move chapters\*.json to data/seed-source/
   - Move comics\*.json to data/seed-source/
   - Move users.json to data/seed-source/
   - Move merge.json to data/seed-source/

2. Create enhanced seed helpers:

   - Create `src/database/seed/helpers/imageValidator.ts`
     - Validate image URLs (format, reachability, content-type)
     - Implement getImageSize function
   - Create `src/database/seed/helpers/duplicateDetector.ts`
     - Detect duplicate comics by slug/title/metadata
     - Report conflicts with detailed information

3. Enhance seed progress tracking:

   - Add real-time progress percentage
   - Add ETA calculation
   - Add success/failure counters
   - Add colored console output

4. Implement seed error resilience:

   - Log errors without stopping
   - Skip invalid entries
   - Continue with valid data
   - Generate error report at end

5. Test seeding system:
   - Run `pnpm db:reset` (drop and recreate)
   - Run `pnpm db:seed`
   - Verify all data imported correctly
   - Check for duplicates
   - Review error logs

**Acceptance Criteria**:

- [ ] data/seed-source/ directory exists with all JSON files
- [ ] imageValidator.ts validates URLs correctly
- [ ] duplicateDetector.ts identifies duplicates
- [ ] Progress tracking shows percentage and ETA
- [ ] Error handling graceful (logs, continues, reports)
- [ ] `pnpm db:seed` completes successfully
- [ ] Database contains expected number of records

---

**Phase 3 Git Commit**:

```bash
git add .
git commit -m "Phase 3: Database Seeding System Enhanced - Task 17 ✅

- Created data/seed-source/ directory structure
- Moved all JSON seed files to data/seed-source/
- Created imageValidator helper (URL validation, size checking)
- Created duplicateDetector helper (slug/title conflict detection)
- Enhanced seed progress tracking (percentage, ETA, counters)
- Implemented error resilience (log, skip, continue, report)
- Tested full seeding pipeline

Validation: pnpm db:seed succeeds with all data imported"
git push origin main
```

---

## Phase 4: UI/UX Pages Enhancement (2-3 hours)

**Validation Gate**: `pnpm type-check` clean, pages render correctly

### Parallel Cluster 2: UI Pages (Can run in parallel)

---

### Task 18: Homepage Enhancement with 3D Elements

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Install Aceternity UI components:

   - Run installation command
   - Configure dependencies

2. Implement 3D hero section:

   - Use HeroParallax component
   - Integrate WavyBackground
   - Add FloatingNav for navigation

3. Add featured comics section:

   - Fetch latest/popular comics
   - Display with 3D card effects
   - Implement hover animations

4. Add statistics section:

   - Total comics, chapters, users
   - Animated counters
   - Visual charts

5. Optimize performance:
   - Lazy load 3D components
   - Optimize bundle size
   - Test on mobile devices

**Acceptance Criteria**:

- [ ] Aceternity UI installed and configured
- [ ] Homepage has 3D hero section (HeroParallax, WavyBackground)
- [ ] FloatingNav navigation functional
- [ ] Featured comics section displays correctly
- [ ] Statistics section with animated counters
- [ ] Performance: Lighthouse score 90+
- [ ] Mobile responsive

---

### Task 19: About Page

**Status**: Not Started
**Duration**: 30 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Create `src/app/about/page.tsx`
2. Add mission and vision content
3. Add team section (if applicable)
4. Use 3D card effects for team members
5. Add call-to-action section
6. Ensure SEO optimization (meta tags)

**Acceptance Criteria**:

- [ ] /about page exists
- [ ] Comprehensive content (mission, vision, team)
- [ ] 3D card effects implemented
- [ ] SEO meta tags configured
- [ ] Mobile responsive

---

### Task 20: Contact Page

**Status**: Not Started
**Duration**: 45 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Create `src/app/contact/page.tsx`
2. Implement contact form:
   - Name (required)
   - Email (required, validated)
   - Message (required, max 2000 chars)
3. Add form validation with Zod
4. Implement server action to send email (Resend/SMTP)
5. Add success/error toast notifications
6. Add rate limiting (5 submissions per 15 minutes per IP)

**Acceptance Criteria**:

- [ ] /contact page exists
- [ ] Form validates inputs (Zod schema)
- [ ] Server action sends email correctly
- [ ] Toast notifications work
- [ ] Rate limiting prevents spam
- [ ] Mobile responsive

---

### Task 21: Terms of Service

**Status**: Not Started
**Duration**: 20 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Create `src/app/terms/page.tsx`
2. Add comprehensive ToS content:
   - User accounts
   - Content usage
   - Intellectual property
   - Disclaimers
   - Limitation of liability
   - Governing law
3. Format with proper headings and sections
4. Add last updated date

**Acceptance Criteria**:

- [ ] /terms page exists
- [ ] All required ToS sections included
- [ ] Proper formatting and readability
- [ ] Last updated date displayed
- [ ] Mobile responsive

---

### Task 22: Privacy Policy

**Status**: Not Started
**Duration**: 20 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Create `src/app/privacy/page.tsx`
2. Add GDPR/CCPA compliant privacy policy:
   - Data collection scope
   - Data usage purposes
   - Cookie policy
   - Third-party services
   - User rights (access, deletion, portability)
   - Contact information
3. Format with proper headings
4. Add last updated date

**Acceptance Criteria**:

- [ ] /privacy page exists
- [ ] GDPR/CCPA compliant content
- [ ] All required sections included
- [ ] Last updated date displayed
- [ ] Mobile responsive

---

### Task 23: Comics Listing Page Enhancement

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Enhance filtering system:
   - Genre multi-select
   - Type filter (manga, manhwa, manhua, etc.)
   - Status filter (ongoing, completed, hiatus)
2. Add sort options:
   - Latest updated
   - Most popular
   - Highest rated
   - A-Z title
3. Implement pagination (20 items per page)
4. Add lazy-loaded images with loading skeletons
5. Optimize query performance (indexes, caching)

**Acceptance Criteria**:

- [ ] Advanced filtering functional (genre, type, status)
- [ ] Sort options work correctly
- [ ] Pagination with 20 items per page
- [ ] Lazy-loaded images with skeletons
- [ ] Query performance optimized
- [ ] Mobile responsive

---

### Task 24: Comic Detail Page Enhancement

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Enhance hero section:
   - Cover image with parallax effect
   - Title, author, artist metadata
   - Genre tags
   - Status badge
2. Add chapter list:
   - Sorted by chapter number
   - Reading progress indicators
   - Last read timestamp
3. Implement rating and review system:
   - Star rating (1-5)
   - Review text (max 1000 chars)
   - Review display with pagination
4. Add bookmark functionality:
   - Toggle bookmark button
   - Optimistic UI updates
5. Add related comics recommendations:
   - By genre similarity
   - By author/artist

**Acceptance Criteria**:

- [ ] Hero section with parallax and metadata
- [ ] Chapter list with progress indicators
- [ ] Rating and review system functional
- [ ] Bookmark toggle works with optimistic UI
- [ ] Related comics recommendations display
- [ ] Mobile responsive

---

### Task 25: Chapter Reader Enhancement

**Status**: Not Started
**Duration**: 90 minutes
**Dependencies**: Phase 3 complete
**Parallel**: Yes (Cluster 2)

**Subtasks**:

1. Implement multiple reading modes:
   - Single-page (one image at a time)
   - Continuous scroll (vertical)
   - Double-page (desktop only)
2. Add image quality settings:
   - Original, High, Medium, Low
   - Save preference to database (cross-device)
3. Implement zoom and pan controls:
   - Pinch-to-zoom on mobile
   - Mouse wheel zoom on desktop
   - Pan when zoomed
4. Add navigation controls:
   - Previous/next page buttons
   - Previous/next chapter buttons
   - Page jump dropdown
5. Implement auto-save progress:
   - Save every 30 seconds
   - Save on page change
   - Save on beforeunload event
6. Add keyboard shortcuts:
   - Arrow keys (navigate)
   - Space (next page)
   - Escape (close reader)

**Acceptance Criteria**:

- [ ] Three reading modes work correctly
- [ ] Image quality settings save to database
- [ ] Zoom and pan functional (mobile and desktop)
- [ ] All navigation controls work
- [ ] Auto-save progress every 30s + on events
- [ ] Keyboard shortcuts functional
- [ ] Hybrid sync (localStorage + DB) works
- [ ] Mobile responsive and performant

---

**Phase 4 Git Commit**:

```bash
git add .
git commit -m "Phase 4: UI/UX Pages Enhanced - Tasks 18-25 ✅

- Enhanced homepage with Aceternity UI (3D HeroParallax, WavyBackground, FloatingNav)
- Created about page with mission/vision and team section
- Created contact page with form validation and email integration
- Created terms of service page (comprehensive legal content)
- Created privacy policy page (GDPR/CCPA compliant)
- Enhanced comics listing (advanced filtering, sorting, pagination)
- Enhanced comic detail page (hero, chapters, ratings, bookmarks, recommendations)
- Enhanced chapter reader (3 reading modes, quality settings, zoom/pan, auto-save, keyboard shortcuts)

Validation: All pages render correctly, type-check clean, mobile responsive"
git push origin main
```

---

## Phase 5: State & Data Management (1-2 hours)

**Validation Gate**: Store refactor complete, DAL audit passes

### Task 26: Rename `src/store/` → `src/stores/`

**Status**: Not Started
**Duration**: 30 minutes
**Dependencies**: Phase 4 complete
**Parallel**: No (affects all imports)

**Subtasks**:

1. Rename directory: `src/store/` → `src/stores/`
2. Update `tsconfig.json` path alias:
   - Change `"@/store": ["./src/store"]` to `"@/stores": ["./src/stores"]`
3. Find and replace all imports:
   - Find: `from "@/store`
   - Replace: `from "@/stores`
4. Create centralized exports:
   - Create `src/stores/index.ts`
   - Export all store hooks
5. Update all components to import from `@/stores`
6. Verify type-check passes

**Acceptance Criteria**:

- [ ] src/stores/ directory exists (not src/store/)
- [ ] tsconfig.json alias updated to @/stores
- [ ] All imports updated to use @/stores
- [ ] Centralized stores/index.ts exports all hooks
- [ ] `pnpm type-check` passes with 0 errors
- [ ] All features functional after rename

---

### Task 27: Verify 100% DAL Usage in Actions

**Status**: Not Started
**Duration**: 15 minutes
**Dependencies**: Task 26 complete
**Parallel**: No (audit task)

**Subtasks**:

1. Create verification script: `scripts/verify-dal-usage.ts`
2. Scan all files in `src/lib/actions/`
3. Check for direct `db` imports or queries
4. Verify all database operations use DAL layer
5. Generate audit report:
   - Files scanned
   - Files compliant
   - Files with violations (if any)
6. Fix any violations found
7. Update `DATABASE_LAYER_STATUS.md`

**Acceptance Criteria**:

- [ ] Verification script created and functional
- [ ] All server actions use DAL layer (no direct db access)
- [ ] Audit report generated: 100% compliance
- [ ] DATABASE_LAYER_STATUS.md updated
- [ ] Documentation reflects current state

---

**Phase 5 Git Commit**:

```bash
git add .
git commit -m "Phase 5: State Management Organized - Tasks 26-27 ✅

- Renamed src/store/ → src/stores/ to match tsconfig alias
- Updated all imports from '@/store' to '@/stores'
- Created centralized stores/index.ts for exports
- Verified 100% DAL usage in all server actions (no direct db queries)
- Audited actions folder: All use DAL layer ✅

Validation:
- Type-check: 0 errors
- All imports resolved
- All features functional
- DAL audit passed"
git push origin main
```

---

## Phase 6: Code Quality & Refactoring (2-3 hours)

**Validation Gate**: `pnpm validate` passes (type + lint + tests)

### Parallel Cluster 3: Code Quality (Mixed parallel/sequential)

---

### Task 28: Advanced AST-Based Refactoring

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Phase 5 complete
**Parallel**: Yes (Cluster 3)

**Subtasks**:

1. Install ts-morph:
   - `pnpm add -D ts-morph`
2. Create refactoring script: `scripts/ast-refactor.ts`
3. Implement 'any' type replacement:
   - Scan for AnyKeyword nodes
   - Infer types from usage context
   - Replace with inferred types
4. Implement import organization:
   - Alphabetical sorting
   - Group by external/internal
5. Run refactoring:
   - Execute script
   - Review changes with `git diff`
   - Verify type-check passes

**Acceptance Criteria**:

- [ ] ts-morph installed
- [ ] ast-refactor.ts script functional
- [ ] 'any' types replaced with inferred types (where possible)
- [ ] Imports organized alphabetically
- [ ] `pnpm type-check` passes after refactoring
- [ ] Changes reviewed and committed

---

### Task 29: CLI Tool Enhancement

**Status**: Not Started
**Duration**: 90 minutes
**Dependencies**: Phase 5 complete
**Parallel**: Yes (Cluster 3)

**Subtasks**:

1. Enhance `scripts/cw.ts` with new commands:

   **Database Commands**:

   - `cw db:reset` - Drop all tables and re-create
   - `cw db:seed --users` - Seed users only
   - `cw db:seed --comics` - Seed comics only
   - `cw db:seed --chapters` - Seed chapters only
   - `cw db:studio` - Open Drizzle Studio

   **Testing Commands**:

   - `cw test:unit -w` - Run unit tests in watch mode
   - `cw test:e2e --ui` - Open Playwright UI

   **Deployment Commands**:

   - `cw deploy:preview` - Deploy to Vercel preview
   - `cw deploy:prod` - Deploy to Vercel production

   **Scaffolding Commands**:

   - `cw scaffold:page <name>` - Create new page with route
   - `cw scaffold:component <name> -d <dir>` - Create new component

2. Make CLI executable:

   - `chmod +x scripts/cw.ts`
   - `pnpm link` (global access)

3. Test all commands:

   - Database commands
   - Testing commands
   - Deployment commands
   - Scaffolding commands

4. Document CLI in README.md

**Acceptance Criteria**:

- [ ] All CLI commands functional
- [ ] CLI globally accessible via `cw` command
- [ ] All subcommands work correctly
- [ ] Documentation in README.md
- [ ] Help text for all commands

---

### Task 30: Fix All 'any' Types

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Task 28 complete
**Parallel**: Yes (Cluster 3, after Task 28)

**Subtasks**:

1. Search for remaining 'any' types:
   - `grep -r ": any" src/ --include="*.ts" --include="*.tsx"`
2. Replace 'any' with proper types:
   - Use inferred types from usage
   - Create explicit type definitions where needed
3. Document strategic 'any' types:
   - Provider SDK responses (uploadService.ts)
   - Add inline comments explaining why 'any' is necessary
4. Verify type safety:
   - Run `pnpm type-check`
   - Ensure 0 errors
5. Count remaining 'any' types:
   - Track reduction from baseline

**Acceptance Criteria**:

- [ ] 'any' types minimized (target <10 remaining)
- [ ] All strategic 'any' uses documented with comments
- [ ] Type inference maximized
- [ ] `pnpm type-check` passes
- [ ] Type coverage report shows improvement

---

### Task 31: Delete Duplicate/Backup Files

**Status**: Not Started
**Duration**: 15 minutes
**Dependencies**: Phase 5 complete
**Parallel**: Yes (Cluster 3)

**Subtasks**:

1. Identify files to delete:

   - _.backup, _.bak files
   - chaptersdata1.json, chaptersdata2.json (duplicates)
   - comicsdata1.json, comicsdata2.json (duplicates)
   - \*-report.json files (temporary)
   - \*.csv report files
   - Root duplicate files: projectbrief.md, productContext.md, progress.md (keep memory-bank/ versions)

2. Create deletion script: `scripts/cleanup-duplicates.ts`

3. Review files before deletion:

   - List files to be deleted
   - User confirmation prompt

4. Execute cleanup

5. Verify git status clean

**Acceptance Criteria**:

- [ ] All backup files deleted
- [ ] Duplicate JSON files deleted
- [ ] Report files deleted
- [ ] Root duplicates removed (memory-bank/ versions kept)
- [ ] Git status clean
- [ ] No critical files accidentally deleted

---

### Task 32: Remove Unused Packages

**Status**: Not Started
**Duration**: 30 minutes
**Dependencies**: Phase 5 complete
**Parallel**: Yes (Cluster 3)

**Subtasks**:

1. Analyze dependencies:

   - Run `pnpm list --depth=0`
   - Identify packages not imported anywhere

2. Create unused package detection script:

   - Scan all TypeScript/JavaScript files
   - Build import graph
   - Compare with package.json dependencies

3. Review suggested removals:

   - Confirm packages are truly unused
   - Check for dynamic imports
   - Check for build-time usage

4. Remove unused packages:

   - `pnpm remove <package-name>`

5. Test application:
   - `pnpm dev` - Verify dev server starts
   - `pnpm build` - Verify build succeeds

**Acceptance Criteria**:

- [ ] Unused package detection script functional
- [ ] All truly unused packages identified
- [ ] Unused packages removed from package.json
- [ ] Application builds and runs correctly
- [ ] Bundle size reduced

---

### Task 33: Import Path Optimization

**Status**: Not Started
**Duration**: 45 minutes
**Dependencies**: Phase 5 complete
**Parallel**: Yes (Cluster 3)

**Subtasks**:

1. Find relative imports:

   - Search for `from '../` and `from '../../'`
   - Identify files using relative paths

2. Create import replacement script:

   - Convert `../components/` to `@/components/`
   - Convert `../../lib/` to `@/lib/`
   - Handle all path aliases

3. Run replacement:

   - Execute script
   - Review changes

4. Verify imports resolve:
   - `pnpm type-check`
   - Test hot-reload in dev mode

**Acceptance Criteria**:

- [ ] All imports use path aliases (@/components, @/lib, etc.)
- [ ] No relative imports beyond same directory (./file)
- [ ] `pnpm type-check` passes
- [ ] Hot-reload works correctly
- [ ] All features functional

---

### Task 34: Add ESLint Rule (Sequential - affects Task 35)

**Status**: Not Started
**Duration**: 10 minutes
**Dependencies**: Task 10 complete
**Parallel**: No (prerequisite for Task 35)

**Subtasks**:

1. Verify unicorn/filename-case rule from Task 10 is active
2. Run lint to identify violations:
   - `pnpm lint 2>&1 | grep filename-case`
3. Count violations (expect ~30 files)
4. Generate list of files to rename

**Acceptance Criteria**:

- [ ] ESLint rule active
- [ ] Lint identifies kebab-case violations
- [ ] List of ~30 files to rename generated
- [ ] Ready for Task 35 execution

---

### Task 35: Convert ~30 Files to Kebab-Case (Sequential - depends on Task 34)

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Task 34 complete
**Parallel**: No (affects file references)

**Subtasks**:

1. Create file renaming script: `scripts/rename-to-kebab-case.ts`
2. Implement rename with import/reference updates:

   - Rename file
   - Update all imports in other files
   - Update dynamic imports
   - Update path references in tests

3. Execute renames in batches:

   - Utilities first
   - Schemas
   - DAL files
   - Actions

4. After each batch:

   - Run `pnpm type-check`
   - Fix any broken imports
   - Commit changes

5. Final verification:
   - `pnpm lint` - Should have 0 filename-case errors
   - `pnpm type-check` - 0 errors
   - `pnpm dev` - Application runs

**Acceptance Criteria**:

- [ ] ~30 files renamed to kebab-case
- [ ] All imports updated correctly
- [ ] `pnpm lint` - 0 filename-case violations
- [ ] `pnpm type-check` - 0 errors
- [ ] All features functional
- [ ] Git history preserved (git mv)

---

### Task 36: Execute Cleanup (Sequential - final cleanup)

**Status**: Not Started
**Duration**: 15 minutes
**Dependencies**: Tasks 31-35 complete
**Parallel**: No (final phase cleanup)

**Subtasks**:

1. Run comprehensive cleanup:

   - `pnpm cleanup:reports`
   - `pnpm cleanup:cache`
   - Remove temporary scripts used during setup

2. Verify workspace cleanliness:

   - `git status` - Only intentional changes
   - No leftover temporary files

3. Update .gitignore if needed (based on cleanup findings)

**Acceptance Criteria**:

- [ ] All temporary files removed
- [ ] .next and cache directories clean
- [ ] Git workspace clean
- [ ] Application still functional

---

**Phase 6 Git Commit**:

```bash
git add .
git commit -m "Phase 6: Code Quality Enhanced - Tasks 28-36 ✅

- Implemented AST-based refactoring (ts-morph)
- Enhanced CLI tool with db/test/deploy/scaffold commands
- Minimized 'any' types (strategic uses documented)
- Deleted duplicate/backup files (cleanup-duplicates.ts)
- Removed unused packages (bundle size reduction)
- Optimized import paths (all use @ aliases)
- Enforced kebab-case file naming (~30 files renamed)
- Executed comprehensive cleanup

Validation: pnpm validate passes (type + lint + tests all clean)"
git push origin main
```

---

## Phase 7: Documentation & Testing (2-3 hours)

**Validation Gate**: Documentation complete, test coverage 100%+

### Parallel Cluster 4: Documentation (Can run in parallel)

---

### Task 37: AI Workspace Analysis

**Status**: Not Started
**Duration**: 30 minutes
**Dependencies**: Phase 6 complete
**Parallel**: Yes (Cluster 4)

**Subtasks**:

1. Review all memory-bank/ files:

   - projectbrief.md
   - productContext.md
   - systemPatterns.md
   - techContext.md
   - activeContext.md
   - progress.md
   - tasks/\_index.md

2. Update outdated information:

   - Mark Phase 1-6 as complete in progress.md
   - Update activeContext.md with current phase
   - Add new tasks to tasks/\_index.md

3. Create reconciliation log (from previous discussions):
   - Document conflicts between Memory Bank and other status files
   - Establish plan-comicwiseComplete40TaskSetup.prompt.md as source of truth
   - Mark divergent files

**Acceptance Criteria**:

- [ ] All memory-bank/ files current and accurate
- [ ] Phases 1-6 marked complete in progress.md
- [ ] activeContext.md reflects current state
- [ ] Reconciliation log created at repo root
- [ ] Source of truth documented

---

### Task 38: Full Validation Suite

**Status**: Not Started
**Duration**: 45 minutes
**Dependencies**: Phase 6 complete
**Parallel**: No (sequential validation)

**Subtasks**:

1. Run unit tests:

   - `pnpm test:unit:run`
   - Ensure 100%+ coverage for DAL, actions, schemas, utils
   - Fix any failing tests

2. Run E2E tests:

   - `pnpm test:e2e`
   - Cover critical flows: auth, reading, comments, ratings, profile
   - Fix any failing tests

3. Run accessibility audit:

   - Integrate axe-core with Playwright
   - Run on all major pages
   - Fix WCAG 2.1 AA violations

4. Run full validation:
   - `pnpm validate:full` (type + lint + unit + E2E)
   - Ensure all pass with 0 errors

**Acceptance Criteria**:

- [ ] Unit test coverage 100%+ (DAL, actions, schemas, utils)
- [ ] E2E tests cover critical flows
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] `pnpm validate:full` passes with 0 errors

---

### Task 39 (Documentation - can parallel with Task 38):

**Create Comprehensive JSDoc & OpenAPI**

**Subtasks**:

1. Add JSDoc comments to all public functions:

   - DAL functions
   - Server actions
   - Utility functions
   - Schema definitions

2. Create/update OpenAPI specification:

   - Update `docs/openapi.yaml`
   - Document all API routes
   - Include request/response schemas
   - Add examples

3. Generate API documentation site (optional):
   - Use Redoc or Swagger UI
   - Deploy to /docs/api route

**Acceptance Criteria**:

- [ ] All public functions have JSDoc comments
- [ ] OpenAPI spec complete in docs/openapi.yaml
- [ ] API documentation accessible
- [ ] Examples provided for complex endpoints

---

**Phase 7 Git Commit**:

```bash
git add .
git commit -m "Phase 7: Documentation & Testing Complete - Tasks 37-39 ✅

- Updated all memory-bank files (progress, activeContext, tasks)
- Created reconciliation log (source of truth established)
- Achieved 100%+ unit test coverage (DAL, actions, schemas, utils)
- E2E tests cover critical user flows
- Accessibility audit passes (WCAG 2.1 AA)
- Added JSDoc comments to all public functions
- Created comprehensive OpenAPI specification (docs/openapi.yaml)

Validation: pnpm validate:full passes with 0 errors"
git push origin main
```

---

## Phase 8: Build & Performance (1-2 hours)

**Validation Gate**: `pnpm build` succeeds, performance scores met

### Task 39: Production Build Validation

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Phase 7 complete
**Parallel**: No (sequential build)

**Subtasks**:

1. Clean build environment:

   - `rm -rf .next`
   - `pnpm cleanup:cache`

2. Run production build:

   - `pnpm build`
   - Monitor for errors or warnings
   - Fix any build issues

3. Analyze bundle size:

   - `ANALYZE=true pnpm build`
   - Review bundle visualization
   - Identify large dependencies
   - Optimize if needed (dynamic imports, tree-shaking)

4. Run Lighthouse audit:

   - Test on development build
   - Verify scores:
     - Performance: 90+
     - Accessibility: 95+
     - Best Practices: 95+
     - SEO: 100
   - Fix any issues

5. Test Redis caching:

   - Verify Upstash connection
   - Test cache TTLs (comics, chapters, sessions)
   - Verify rate limiting works

6. Test image optimization pipeline:
   - Upload test image
   - Verify ImageKit/Cloudinary processing
   - Check responsive variants generated
   - Test CDN delivery

**Acceptance Criteria**:

- [ ] `pnpm build` succeeds with 0 errors
- [ ] Bundle size within budgets (initial <200KB, routes <100KB)
- [ ] Lighthouse scores meet targets (90+, 95+, 95+, 100)
- [ ] Redis caching functional
- [ ] Rate limiting works
- [ ] Image optimization pipeline tested

---

**Phase 8 Git Commit**:

```bash
git add .
git commit -m "Phase 8: Production Build Validated - Task 39 ✅

- Production build succeeds (pnpm build → 0 errors)
- Bundle analysis completed (within performance budgets)
- Lighthouse audit passed (Performance 90+, A11y 95+, BP 95+, SEO 100)
- Redis caching tested and functional
- Rate limiting verified (100 req/15min per IP)
- Image optimization pipeline tested (ImageKit/Cloudinary)

Validation: Production ready for deployment"
git push origin main
```

---

## Phase 9: Deployment & Production (1-2 hours)

**Validation Gate**: Production deployment successful, all health checks pass

### Task 40: Complete Production Setup

**Status**: Not Started
**Duration**: 60 minutes
**Dependencies**: Phase 8 complete
**Parallel**: No (final deployment)

**Subtasks**:

1. Create/update `vercel.json`:

   - Environment variable mappings
   - Build command overrides
   - Framework preset (Next.js)
   - Region configuration

2. Configure production environment variables in Vercel:

   - DATABASE_URL (Neon production)
   - AUTH_SECRET (production secret)
   - GOOGLE_CLIENT_ID/SECRET (production credentials)
   - GITHUB_CLIENT_ID/SECRET (production credentials)
   - SENTRY_DSN (production project)
   - UPSTASH_REDIS_REST_URL/TOKEN (production)
   - IMAGEKIT\_\* (production)
   - RESEND_API_KEY (production)
   - All other required production vars

3. Deploy to production:

   - Push to main branch (auto-deploy)
   - OR run `vercel --prod`

4. Run database migrations:

   - Verify Drizzle migrations run automatically
   - OR manually run `pnpm db:push` on production DB

5. Test production deployment:

   - Visit production URL
   - Test authentication (Google, GitHub OAuth)
   - Test comic reading flow
   - Test rating and comments
   - Test bookmarking
   - Test profile management

6. Verify health check endpoint:

   - GET /api/health
   - Verify response includes:
     - Application version
     - Database connectivity status
     - Redis connectivity status
     - Timestamp

7. Verify error monitoring:

   - Trigger test error
   - Verify Sentry receives error
   - Check breadcrumbs and context

8. Verify security headers:

   - Use securityheaders.com to scan deployment
   - Verify CSP, HSTS, X-Frame-Options, etc.

9. Verify SSL/TLS:

   - Check certificate validity
   - Verify HTTPS enforced
   - Test HTTP→HTTPS redirect

10. Final smoke tests:
    - Homepage loads
    - Database seeded (or ready to seed)
    - All environment variables set correctly
    - No console errors
    - Lighthouse audit on production

**Acceptance Criteria**:

- [ ] vercel.json configured correctly
- [ ] All production environment variables set in Vercel
- [ ] Production deployment succeeds
- [ ] Database migrations applied
- [ ] Health check endpoint returns success
- [ ] Sentry error monitoring active
- [ ] Security headers present and correct
- [ ] SSL/TLS certificate valid
- [ ] HTTPS enforced
- [ ] All smoke tests pass
- [ ] Production URL accessible and functional

---

**Phase 9 Git Commit**:

```bash
git add .
git commit -m "Phase 9: Production Deployment Complete - Task 40 ✅

- Created vercel.json with complete configuration
- Configured all production environment variables
- Deployed to production successfully
- Database migrations applied
- Health check endpoint functional (/api/health)
- Sentry error monitoring active
- Security headers verified (CSP, HSTS, X-Frame-Options, etc.)
- SSL/TLS enforced (HTTPS)
- All smoke tests passed

🎉 PRODUCTION READY - ComicWise v1.0 deployed!

Deployment URL: [insert Vercel production URL]
Status: All systems operational
Coverage: Unit 100%+, E2E critical flows
Performance: Lighthouse 90+ (all metrics)
Security: OWASP compliant, rate limiting active"
git push origin main
```

---

## Rollback Procedures

### Quick Rollback (Code Issues)

```bash
# View recent commits
git log --oneline -n 10

# Revert to specific phase
git revert <phase-commit-hash>
git push origin main

# OR hard reset (destructive)
git reset --hard <phase-commit-hash>
git push origin main --force
```

### Database Rollback

```bash
# Restore from backup
pg_restore -d comicwise backup-$(date +%Y%m%d).sql

# OR revert migration
pnpm drizzle-kit drop # Drop last migration
pnpm db:push # Re-apply previous state
```

### Vercel Deployment Rollback

```bash
# Via CLI
vercel list # Find previous deployment
vercel rollback <deployment-url>

# Via Dashboard
# Deployments → Select previous → Promote to Production
```

---

## Progress Tracking

| Phase   | Tasks   | Duration | Status      | Validation Gate                         |
| ------- | ------- | -------- | ----------- | --------------------------------------- |
| Phase 1 | 16, 1-3 | 1-2 hrs  | Not Started | `pnpm type-check` → 0 errors            |
| Phase 2 | 6-15    | 2-3 hrs  | Not Started | Configs functional, build succeeds      |
| Phase 3 | 17      | 2-3 hrs  | Not Started | `pnpm db:seed` succeeds                 |
| Phase 4 | 18-25   | 2-3 hrs  | Not Started | Pages render, type-check clean          |
| Phase 5 | 26-27   | 1-2 hrs  | Not Started | Store refactor, DAL audit passes        |
| Phase 6 | 28-36   | 2-3 hrs  | Not Started | `pnpm validate` passes                  |
| Phase 7 | 37-39   | 2-3 hrs  | Not Started | Docs complete, tests 100%+              |
| Phase 8 | 39      | 1-2 hrs  | Not Started | `pnpm build` succeeds, performance met  |
| Phase 9 | 40      | 1-2 hrs  | Not Started | Production deployed, health checks pass |

**Total Estimated Time**: 12-16 hours
**Parallel Time Savings**: ~4-6 hours vs sequential

---

## Task Dependency Graph

```
Phase 1 (Sequential)
  └── Tasks 16, 1-3
       └── Gate A: env validated ✓

Phase 2 (Parallel Cluster 1)
  └── Tasks 6-15 (all parallel)
       └── Gate B: configs validated ✓

Phase 3 (Sequential)
  └── Task 17
       └── Gate C: db:seed succeeds ✓

Phase 4 (Parallel Cluster 2)
  └── Tasks 18-25 (all parallel)
       └── Gate D: type-check clean ✓

Phase 5 (Sequential)
  └── Task 26 → Task 27

Phase 6 (Mixed)
  ├── Parallel: Tasks 28, 29, 31, 32, 33
  └── Sequential: Task 34 → Task 35 → Task 36
       └── Gate E: validate clean ✓

Phase 7 (Mixed)
  ├── Task 37 (parallel)
  └── Task 38-39 (sequential)

Phase 8 (Sequential)
  └── Task 39
       └── Gate F: build succeeds ✓

Phase 9 (Sequential)
  └── Task 40
       └── Gate G: deployment succeeds ✓
```

---

## Checklist Summary

Before starting, ensure:

- [ ] Git repository clean (`git status`)
- [ ] Database backed up (if existing data)
- [ ] .env.local configured with valid credentials
- [ ] Node.js >=20.0.0, pnpm >=9.0.0 installed
- [ ] 12-16 hours allocated for single-session execution

During execution:

- [ ] Commit after each phase (9 commits total)
- [ ] Run validation gates before proceeding
- [ ] Monitor terminal output for errors
- [ ] Test features after each phase

After completion:

- [ ] All 40 tasks completed
- [ ] 9 git commits pushed
- [ ] Production deployed to Vercel
- [ ] Health checks passing
- [ ] Error monitoring active
- [ ] Documentation up to date
- [ ] Team notified of deployment

---

## End of Tasks Document
