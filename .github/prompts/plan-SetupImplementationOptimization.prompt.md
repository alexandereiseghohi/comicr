# Plan: Refined ComicWise Setup, Implementation & Optimization — Complete Dependency & Timeline Analysis

**Three-phase mega-project with 35+ critical tasks across 150+ files. Refined sequencing shows 8-9 hour critical path with 15-18 hours parallelizable work → 30-35 total hours at normal pace (5-7 calendar days @ 8hrs/day). Dependencies: MAINSETUP foundation → PLAN-OPTIMIZE blockers & CRUD → MAINTASKS features. Critical blockers: MAINSETUP Task 5 validation, MAINTASKS Task 7 schemas, PLAN-OPTIMIZE Part 1 build fix. Maximum parallelization reduces calendar days from 7 to 4-5 with focused execution.**

---

## Phase 1: Foundation Setup (MAINSETUP) — 2.5-3.5 hours
**Deliverable:** Development environment configured, database seeding ready, validation passing. Blocks everything else.

### 1.1 VS Code Configuration (30-45 min) — PARALLEL with 1.2
- **1.1.1** Create `.vscode/mcp.json` with TypeScript/Python/SQL servers (10 min)
- **1.1.2** Create `.vscode/extensions.json` with 12+ recommended extensions (5 min)
- **1.1.3** Create `.vscode/launch.json` with 5 debug configurations (Next.js client/server, Node, Chrome, Playwright) (10 min)
- **1.1.4** Create `.vscode/tasks.json` with 8 build/lint/test tasks + problem matchers (10 min)
- **1.1.5** Create `.vscode/settings.json` with editor preferences + extension configs (5 min)
- **Dependency:** None — start immediately
- **Blocks:** Task 1.3, 1.5 only (development tools)

### 1.2 Config Files Optimization (30-40 min) — PARALLEL with 1.1
- **1.2.1** Validate & optimize `next.config.ts` (5 min)
- **1.2.2** Validate & optimize `nextSitemap.config.ts` (5 min)
- **1.2.3** Validate & optimize `tsconfig.json` (5 min)
- **1.2.4** Validate & optimize `eslint.config.ts` (5 min)
- **1.2.5** Validate & optimize `postcss.config.mjs` (5 min)
- **1.2.6** Validate `.prettierrc.ts`, `.gitignore`, `.dockerignore`, `.prettierignore` (5 min)
- **Dependency:** None — start immediately
- **Blocks:** Task 1.5 (validation depends on all configs)

### 1.3 Environment Variables & Config (20-30 min) — Must follow 1.1 & 1.2
- **1.3.1** Create `.env.local` with all required variables (10 min)
  - Database URLs, Redis/Upstash credentials, NextAuth secret, Sentry DSN
- **1.3.2** Create/validate `src/lib/env.ts` with Zod schema (10 min)
  - Runtime validation on startup, type-safe exports
- **1.3.3** Create/validate `appConfig.ts` centralizing app configuration (5 min)
  - Use variables from `src/lib/env.ts`
- **Dependency:** 1.1, 1.2 complete
- **Blocks:** 1.4 (seeding needs env variables), 1.5 (validation depends on env)

### 1.4 Database Seeding System (45-60 min) — Must follow 1.3
- **1.4.1** Create seeding helpers in `src/database/seed/helpers/` (25 min)
  - `validation-schemas.ts` — Zod schemas for all entities
  - `image-downloader.ts` — Download & cache images
  - `password-hasher.ts` — Hash passwords with bcryptjs
  - `seed-logger.ts` — Structured logging with emoji indicators
  - `batch-processor.ts` — Batch with configurable chunk size
  - `image-deduplicator.ts` — Prevent duplicate downloads
  - `validate-and-insert.ts` — Zod validation + upsert with transactions

- **1.4.2** Create entity seeders in `src/database/seed/seeders/` (15 min)
  - `user-seeder-v4.ts` — Load from `users.json`, hash passwords
  - `comic-seeder-v4.ts` — Load from `comics.json`/data files, download covers
  - `chapter-seeder-v4.ts` — Load from `chapters.json`/data files, organize images
  - `genre/author/artist/type-seeders.ts` — Lookup entity seeders

- **1.4.3** Create orchestrator `src/database/seed/seed-runner-v4enhanced.ts` (5 min)
  - Sequentially execute seeders (Users → Genres/Types → Comics → Chapters)
  - Track created/updated/skipped, generate summary report
  - Support dry-run & verbose modes

- **1.4.4** Update API route `src/app/api/seed/route.ts` & package.json scripts (5 min)
  - Scripts: `db:seed`, `db:seed:dry-run`, `db:seed:verbose`, entity-specific variants

- **Dependency:** 1.3 complete (needs env variables)
- **Blocks:** 1.5 (validation tests seeding)

### 1.5 Validate & Test Configuration (15-20 min) — Must follow 1.1-1.4
- **1.5.1** Run type-checking: `pnpm type-check` → expect 0 errors (5 min)
- **1.5.2** Run linting: `pnpm lint:fix` then `pnpm lint` → expect 0 errors (5 min)
- **1.5.3** Run validation: `pnpm validate` → all checks pass (3 min)
- **1.5.4** Test database seeding:
  - Run dry-run: `pnpm db:seed:dry-run` → succeeds without database changes (3 min)
  - If dry-run passes: `pnpm db:seed` → full seed succeeds (5 min, run in parallel with next phase)

- **Dependency:** 1.1-1.4 complete
- **Blocks:** Everything — MAINSETUP must validate before proceeding
- **Timeline Check:** If any step fails, STOP and fix immediately before proceeding to Phase 2

---

## Phase 2: Critical Blockers & CRUD Foundation (PLAN-OPTIMIZE Parts 1-2) — 1-1.5 hours
**Deliverable:** Build compiles, 12 CRUD table patterns established, database ready for UI layer. Unblocks all feature development.

### 2.1 Fix Build Blockers (5 min) — CRITICAL, must be first
- **2.1.1** Fix comic author relation error (3 min)
  - Option B (proper fix): Update schema, fix constraint, rerun migration
  - Test: `pnpm build` → succeeds

- **2.1.2** Fix any CSS/TypeScript compilation errors (2 min)
  - Verify `pnpm type-check` passes with 0 errors

- **Dependency:** 1.5 complete (need env + validation passing)
- **Blocks:** 2.2 entirely (can't build tables if build fails)
- **Timeline Check:** If build still fails after fix, investigate root cause before proceeding

### 2.2 Establish CRUD Pattern (5-10 min for first table, then replicate)
**Pattern Template:** For each of 12 tables, create 5 files following same structure

- **2.2.1** Tables 1-5 (Author, Artist, Genre, Type, Tag) — CAN RUN IN PARALLEL (30 min total)
  - No dependencies between these tables
  - For each table:
    - **Schema file:** `src/database/schema/[table].ts` — Drizzle table definition, relations
    - **Queries file:** `src/dal/queries/[table].queries.ts` — SELECT, find, getBy*, list operations
    - **Mutations file:** `src/dal/mutations/[table].mutations.ts` — create, update, delete, upsert
    - **API route:** `src/app/api/[table]/route.ts` — GET/POST/PUT/DELETE endpoints
    - **Server action:** `src/lib/actions/[table].actions.ts` — Form submission handlers
  - Time per table: ~5 min (use template, replicate pattern)
  - Total: 5 tables × 5 min = 25 min, but can compress to 10-15 min by parallelizing file creation

- **2.2.2** Tables 6-12 (Comic-related, Chapter-related) — MUST RUN SEQUENTIALLY (60-75 min)
  - **Comic, ComicArtist, ComicAuthor tables:** Depend on Table 1-5 relationships (30 min)
  - **Chapter, ChapterImage tables:** Depend on Comic table (15 min)
  - **Bookmark, BookmarkChapter tables:** Depend on User + Chapter (15 min)
  - Same 5-file pattern per table

- **Dependency:** 2.1 complete (build fixed)
- **Blocks:** Phase 3 entirely (UI pages need these tables)
- **Parallelization:** Tables 1-5 parallel, then Tables 6-7 sequential, then Tables 8-12 sequential

---

## Phase 3: Core Feature Implementation (MAINTASKS Tasks 1-11 + PLAN-OPTIMIZE Part 3) — 6-8 hours
**Deliverable:** 11 pages, 10+ components, error handling, image optimization, performance improvements. UI layer complete.

### 3.1 Create Schemas & Server Actions (2-3 hours) — MUST BE FIRST
**Why:** All pages depend on these. Do this immediately after blockers fixed.

- **3.1.1** Task 7: Zod Schemas Validation (1-2 hours) — CRITICAL PATH ITEM
  - Audit all existing Zod schema groups (8+ groups in `src/lib/validations/`)
  - Create missing schemas for: users, comics, chapters, bookmarks, etc.
  - Validate all use property names from database schema
  - Export TypeScript types from schemas
  - **Deliverable:** 100% schema coverage for all CRUD operations
  - **Dependency:** 2.2 complete (need table definitions)
  - **Blocks:** Task 6, Tasks 1-5

- **3.1.2** Task 6: Server Actions Validation (1 hour) — CRITICAL PATH ITEM
  - Audit all server actions in `src/lib/actions/` (15+ actions)
  - Validate actions use Zod schemas from 3.1.1
  - Create missing actions: create, read, update, delete for each entity
  - Test all actions with mock data
  - **Deliverable:** All CRUD server actions complete and validated
  - **Dependency:** 3.1.1 complete (need schemas)
  - **Blocks:** Tasks 1-5 (pages)

### 3.2 Implement Core Pages (5-7 hours) — CAN START PARALLEL with 3.1
**After Task 6 ready, start these in parallel. Bookmark can start immediately (few dependencies).**

- **3.2.1** Task 1: User Profile Pages (2-3 hours) — PARALLEL CANDIDATE
  - `src/app/(root)/profile/page.tsx` — View profile
  - `src/app/(root)/profile/edit/page.tsx` — Edit profile
  - `src/app/(root)/profile/change-password/page.tsx` — Password change
  - `src/app/(root)/profile/settings/page.tsx` — User settings
  - Components: ProfileForm, ChangePasswordForm, SettingsPanel
  - **Dependency:** 3.1.2 (user server actions)
  - **Blocks:** Task 3.2.2 (profile used elsewhere)

- **3.2.2** Task 2: Comic Management Pages (2-3 hours) — PARALLEL CANDIDATE, depends on 3.1.2
  - `src/app/(root)/comics/page.tsx` — Comic listing with filters
  - `src/app/(root)/comics/[slug]/page.tsx` — Comic details
  - Components: ComicCard, ComicFilters, ComicGrid, ComicDetails
  - **Dependency:** 3.1.2 (comic actions)
  - **Blocks:** Tasks 3.2.3, 3.2.5 (chapter reader, root pages need comics)

- **3.2.3** Task 3: Chapter Reader Page (2-3 hours) — SEQUENTIAL after 3.2.2
  - `src/app/(root)/comics/[slug]/chapter/[number]/page.tsx`
  - Components: ImageGallery, ChapterNavigation, ImageViewer, ChapterInfo, PageIndicator
  - Image optimization with Next.js Image
  - **Dependency:** 3.2.2 (needs comic pages), 3.1.2 (chapter actions)
  - **Blocks:** Task 3.2.5 (root pages)

- **3.2.4** Task 4: Bookmarks Page (1-2 hours) — PARALLEL CANDIDATE
  - `src/app/(root)/bookmarks/page.tsx` — Bookmark listing
  - Components: BookmarkList, BookmarkFilters, BookmarkCard
  - **Dependency:** 3.1.2 (bookmark actions)
  - **Blocks:** None (independent)

- **3.2.5** Task 5: Root Pages Enhancement (2-3 hours) — SEQUENTIAL after 3.2.3
  - `src/app/(root)/page.tsx` — Home page with featured comics
  - `src/app/(root)/browse/page.tsx` — Browse all comics
  - `src/app/(root)/genres/[slug]/page.tsx` — Genre details
  - Components: FeaturedComicGrid, ComicGrid, GenreHero, ComicRecommendations
  - **Dependency:** 3.2.2 (comic listing), 3.2.3 (chapter info)
  - **Blocks:** Task 3.2 complete

- **Parallelization:** Start 3.2.1 + 3.2.2 + 3.2.4 in parallel after 3.1.2 ready; 3.2.3 starts when 3.2.2 done; 3.2.5 starts when 3.2.3 done

### 3.3 Error Handling & Image Optimization (2-3 hours) — PARALLEL with pages, or immediate after
**Can start anytime after 3.1.2 ready. These are applied across all pages.**

- **3.3.1** Task 9: Error Handling & Loading States (1-2 hours)
  - Create global error boundary at root layout
  - Create 4 skeleton components: ProfileSkeleton, ComicSkeleton, ChapterSkeleton, BookmarkSkeleton
  - Add error.tsx boundaries for each route
  - Add loading.tsx boundaries for long-running operations
  - **Dependency:** None (independent, but used in all pages)
  - **Applies to:** All pages (3.2.1-3.2.5)

- **3.3.2** Task 10: Image Optimization (1-2 hours)
  - Audit all `<img>` tags, replace with `<Image>` from `next/image`
  - Set width/height, sizes, priority, loading attributes
  - Configure image domains in `next.config.ts`
  - Implement lazy loading for off-screen images
  - **Dependency:** None (independent)
  - **Applies to:** All pages (3.2.1-3.2.5)

### 3.4 Performance Optimization (2-3 hours) — PARALLEL, after pages complete
- **3.4.1** Task 11: Performance & Caching (2-3 hours)
  - Implement Redis caching layer for: comic listings, chapter data, user bookmarks
  - Optimize database queries: remove N+1 queries, add indexes
  - Implement ISR (Incremental Static Regeneration) for static pages
  - Code splitting & dynamic imports for heavy components
  - **Dependency:** All pages done (3.2 complete), 2.2 (tables ready)
  - **Timing:** Start when pages are complete, can be done in parallel with Task 3.5

### 3.5 Testing Implementation (3-4 hours) — SEQUENTIAL after pages + optimization
- **3.5.1** Task 12: Unit Tests with Vitest (1 hour)
  - Test utilities, helpers, validation functions
  - Test server actions with mock database
  - 80%+ coverage for critical paths

- **3.5.2** Task 12: Integration Tests (1 hour)
  - Test API endpoints with real database seeding
  - Test database queries and mutations

- **3.5.3** Task 12: E2E Tests with Playwright (1-2 hours)
  - Test user flows: profile edit, comic browsing, chapter reading, bookmarking
  - Test error scenarios
  - Test responsive design

- **Dependency:** All pages + components complete (3.2.1-3.2.5, 3.3, 3.4)
- **Blocks:** Task 3.6 (CI/CD needs passing tests)

---

## Phase 4: Completion & Deployment (MAINTASKS Tasks 13-15 + PLAN-OPTIMIZE Parts 4-5) — 2.5-3.5 hours
**Deliverable:** Tests passing, CI/CD configured, database seeded with production data, documentation complete. Ready for production.

### 4.1 Testing & Verification (30 min) — PARALLEL with seeding start
- **4.1.1** Run all tests: `pnpm test` → all passing (15 min)
- **4.1.2** Verify Playwright E2E tests: `pnpm test:e2e` → all passing (15 min)
- **Dependency:** 3.5 complete (tests written)
- **Blocks:** 4.2 (CI/CD), 4.3 (deployment)

### 4.2 CI/CD Workflow Setup (1-2 hours) — CAN START PARALLEL with 3.5
**Can be created during testing phase, activated after tests pass.**

- **4.2.1** Task 13a: Create CI workflow (`.github/workflows/ci.yml`) (30 min)
  - Trigger: push to main/dev, PRs
  - Steps: install deps, build, type-check, lint, test
  - Matrix: Node.js versions, OS (Ubuntu)
  - Caching: node_modules, pnpm cache

- **4.2.2** Task 13b: Create CD workflow (`.github/workflows/cd.yml`) (30 min)
  - Trigger: successful CI on main branch
  - Steps: build, upload artifacts, deploy to hosting

- **4.2.3** Task 13c: Create migrations workflow (`.github/workflows/migrations.yml`) (15 min)
  - Trigger: schema changes
  - Steps: generate migration, generate types, commit back

- **Dependency:** 4.1 complete (need tests to exist)
- **Timing:** Can be configured during 3.5, activated after 4.1

### 4.3 Database Seeding & Validation (15 min)
- **4.3.1** Run full seed: `pnpm db:seed` → all data loaded (10 min)
- **4.3.2** Validate seeded data: Check database has all users, comics, chapters (5 min)
- **Dependency:** MAINSETUP Task 1.5 (seed system ready)
- **Timing:** Can start anytime after Phase 2 (database ready)

### 4.4 Documentation (2-3 hours) — PARALLEL with testing
**Can be started during feature implementation, completed after pages done.**

- **4.4.1** Task 14a: Update `README.md` (30 min)
  - Project overview, tech stack, quick start, development setup

- **4.4.2** Task 14b: Create API documentation (45 min)
  - Document all 12 CRUD endpoints (base pattern × 12 tables)
  - Request/response examples

- **4.4.3** Task 14c: Create component library documentation (30 min)
  - Document 10+ reusable components with usage examples

- **4.4.4** Task 14d: Create deployment guide (30 min)
  - Environment setup, database, hosting, monitoring

- **4.4.5** Task 14e: Create development guide (30 min)
  - Architecture overview, code structure, adding new features

- **4.4.6** Task 14f: Create troubleshooting guide (15 min)
  - Common issues and solutions

- **Dependency:** All features done (3.2-3.4 complete)
- **Timing:** Can write in parallel with development, finalize after all features

### 4.5 Final Validation & Cleanup (1-2 hours) — LAST PHASE
- **4.5.1** Task 15a: Run full validation suite (15 min)
  - `pnpm validate` → all checks pass
  - `pnpm build` → production build succeeds
  - `pnpm test` → all tests pass

- **4.5.2** Task 15b: Final code cleanup (30 min)
  - Remove console.logs, dead code
  - Ensure all files have proper headers/docs
  - Consistent formatting

- **4.5.3** Task 15c: Accessibility audit (15 min)
  - Run axe DevTools
  - Check ARIA labels, keyboard navigation
  - Fix critical issues

- **4.5.4** Task 15d: Performance audit (15 min)
  - Run Lighthouse
  - Core Web Vitals check
  - Image optimization verification

- **4.5.5** Task 15e: Security audit (15 min)
  - Check no secrets in git
  - Validate input sanitization
  - Check dependency vulnerabilities: `pnpm audit`

- **Dependency:** All previous phases (4.1-4.4)
- **Blocks:** None — this is the final gate

---

## Overall Timeline & Parallelization Strategy

### Sequential Critical Path (Determines project duration)
```
Phase 1: MAINSETUP 1.1-1.5 (sequential chain)
         ↓ [BLOCKER: 1.5 validation must pass]
Phase 2: PLAN-OPT 2.1 → 2.2 (sequential)
         ↓ [BLOCKER: Build must compile]
Phase 3: 3.1.1 (Schemas) → 3.1.2 (Actions) → [tasks 1-5 parallel] → 3.3-3.4 → 3.5
         ↓ [BLOCKER: Tests must pass]
Phase 4: 4.1-4.5 (mostly parallel, final validation sequential)
```

### Parallelization Opportunities (Reduce calendar days)
```
Phase 1:
- 1.1 + 1.2 parallel (save 30-40 min)
- 1.5 Seeding dry-run + full seed can overlap with Phase 2 start

Phase 2:
- 2.2 Tables 1-5: all 5 parallel (save 20 min)
- 2.2 Table relations: some can overlap

Phase 3:
- 3.1.1 (Schemas) + 3.1.2 (Actions) must be sequential
- 3.2.1 + 3.2.2 + 3.2.4 parallel after 3.1.2 (save 3-4 hrs)
- 3.2.3 starts when 3.2.2 done
- 3.2.5 starts when 3.2.3 done
- 3.3 (Error + Image) parallel with pages
- 3.4 (Performance) parallel after pages done
- 3.5 (Testing) starts when pages + optimization done

Phase 4:
- 4.1 (Testing) + 4.2 (CI/CD) both run (CI/CD created, tests finalize)
- 4.3 (Seeding) can run anytime after Phase 2
- 4.4 (Documentation) can be written during Phase 3
- 4.5 (Final) must be last
```

### Day-by-Day Schedule (with max parallelization)

**Day 1 (5 hours) — Foundation**
- ✓ Phase 1.1 + 1.2 (parallel): 45 min
- ✓ Phase 1.3: 30 min
- ✓ Phase 1.4: 1 hour
- ✓ Phase 1.5 validation: 20 min
- ✓ Phase 2.1 (blocker fix): 5 min
- → Progress: Foundation ready, build fixed, database seeding system ready

**Day 2 (7-8 hours) — CRUD Patterns & Schemas**
- ✓ Phase 2.2 tables 1-5 (parallel): 25 min
- ✓ Phase 2.2 tables 6-12 (sequential): 60 min
- ✓ Phase 3.1.1 Schemas: 1.5 hours
- ✓ Phase 3.1.2 Server Actions: 1 hour
- ✓ Phase 4.3 Database seeding (parallel): 15 min
- → Progress: All CRUD tables ready, 12 CRUD patterns established, database seeded with demo data

**Day 3-4 (12-14 hours) — Pages & Components**
- ✓ Phase 3.2.1 Profile pages: 2.5 hours
- ✓ Phase 3.2.2 Comic pages: 2.5 hours (parallel with profiles after 3.1.2)
- ✓ Phase 3.2.3 Chapter reader: 2.5 hours (sequential after comics)
- ✓ Phase 3.2.4 Bookmarks: 1.5 hours (parallel)
- ✓ Phase 3.2.5 Root pages: 2.5 hours (sequential after chapters)
- ✓ Phase 3.3 Error + Image: 2.5 hours (parallel)
- ✓ Phase 3.4 Performance: 2 hours (parallel after pages)
- ✓ Phase 4.4 Documentation (parallel): written during development
- → Progress: All 11 pages built, error boundaries added, images optimized, performance improved, docs drafted

**Day 5 (3-4 hours) — Testing & CI/CD**
- ✓ Phase 3.5 Testing: 3 hours (Vitest + Playwright)
- ✓ Phase 4.1 Test verification: 30 min
- ✓ Phase 4.2 CI/CD setup: 1-2 hours (concurrent with testing)
- ✓ Phase 4.4 Documentation finalize: 30 min
- → Progress: All tests passing, CI/CD pipelines configured

**Day 6 (2-3 hours) — Final Validation**
- ✓ Phase 4.5 Final validation: 2 hours
  - Validation suite, code cleanup, accessibility, performance, security audits
- ✓ Bug fixes from audits: 30-60 min (if needed)
- → Progress: Project complete, ready for deployment

---

## Dependency Hierarchy

```
Level 1 (Foundational — block all downstream):
├─ MAINSETUP Task 1.5 validation ✓
├─ PLAN-OPTIMIZE 2.1 build fix ✓
└─ PLAN-OPTIMIZE 2.2 CRUD tables ← All features depend on these

Level 2 (Feature foundation — block feature implementation):
├─ MAINTASKS 3.1.1 Schemas ← All pages depend
├─ MAINTASKS 3.1.2 Server Actions ← All pages depend
└─ PLAN-OPTIMIZE 4.3 Database seeding ← Testing depends

Level 3 (Feature implementation — can parallelize):
├─ Task 3.2.1 Profile pages
├─ Task 3.2.2 Comic pages ← Blocks 3.2.3, 3.2.5
├─ Task 3.2.3 Chapter reader ← Sequential after 3.2.2
├─ Task 3.2.4 Bookmarks ← Independent
├─ Task 3.2.5 Root pages ← Sequential after 3.2.3
├─ Task 3.3 Error/Image handling ← Independent, applied everywhere
└─ Task 3.4 Performance ← Independent, applied to pages

Level 4 (Quality gates — block deployment):
├─ MAINTASKS 3.5 Testing ← Must pass before CI/CD
├─ MAINTASKS 4.1 Test verification ← Same
└─ MAINTASKS 4.2 CI/CD ← Depends on tests

Level 5 (Final):
├─ MAINTASKS 4.4 Documentation ← Can be written anytime, finalized last
└─ MAINTASKS 4.5 Final validation ← Must be last before deployment
```

---

## Critical Path Bottlenecks

| Bottleneck | Duration | Impact | When Unblocks |
|-----------|----------|--------|---------------|
| MAINSETUP 1.5 validation | 20 min | Blocks Phase 2 start | Must pass |
| PLAN-OPT 2.1 build fix | 5 min | Blocks CRUD tables | Immediately after |
| PLAN-OPT 2.2 tables 6-12 | 60 min | Blocks page UI | Sequential dependency |
| MAINTASKS 3.1.1 Schemas | 1.5 hours | Blocks page development | Needed for actions |
| MAINTASKS 3.1.2 Actions | 1 hour | Blocks pages | Needed for UI |
| MAINTASKS 3.2.2 Comics | 2.5 hours | Blocks 3.2.3, 3.2.5 | 30% of feature tree |
| MAINTASKS 3.5 Testing | 3 hours | Blocks CI/CD, deployment | Quality gate |

---

## Timeline Estimates (Refined)

| Phase | Tasks | Duration | Calendar Days (8hr) | Critical Path? |
|-------|-------|----------|-------------------|---|
| **Phase 1: MAINSETUP** | 1.1-1.5 | 2.5-3.5 hrs | 1 day | YES |
| **Phase 2: Blockers & CRUD** | 2.1-2.2 | 1-1.5 hrs | 1 day | YES |
| **Phase 3a: Schemas & Actions** | 3.1.1-3.1.2 | 2-3 hrs | 0.5 day | YES |
| **Phase 3b: Pages** | 3.2.1-3.2.5 | 9-11 hrs | 1.5 days (parallel) | YES |
| **Phase 3c: Polish** | 3.3-3.4 | 4-6 hrs | 1 day (parallel) | PARTIAL |
| **Phase 3d: Testing** | 3.5 | 3-4 hrs | 0.5 day | YES |
| **Phase 4a: Verification** | 4.1 | 0.5 hrs | SAME DAY | YES |
| **Phase 4b: CI/CD** | 4.2 | 1-2 hrs | PARALLEL w/ 4.1 | PARTIAL |
| **Phase 4c: Database** | 4.3 | 0.25 hrs | ANYTIME | LOW |
| **Phase 4d: Docs** | 4.4 | 2-3 hrs | PARALLEL w/ dev | LOW |
| **Phase 4e: Final** | 4.5 | 1-2 hrs | LAST | YES |
| **TOTAL** | 35+ | 30-37 hrs | 5-7 days | - |

---

## Risk Mitigation Strategies

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| MAINSETUP validation fails | Medium | Run early, fix immediately in Phase 1 |
| Build still broken after Part 1 | Low | Test compilation after fix, rerun if needed |
| Schema changes mid-development | Medium | Complete schemas in Phase 3.1.1 first, validate |
| Page dependencies not met | Low | Verify all server actions exist before page creation |
| Tests fail late in project | High | Write tests incrementally, don't batch at end |
| CI/CD doesn't pass | Medium | Test locally before pushing, use branch protection |
| Seeding data inconsistencies | Low | Use dry-run first, validate with logging |

---

## Success Criteria Checklist

**Phase 1 Completion:**
- ✅ All TypeScript files have no type errors
- ✅ All linting passes
- ✅ Database dry-run seed succeeds
- ✅ Full seed succeeds, 0 errors

**Phase 2 Completion:**
- ✅ Build compiles without errors
- ✅ All 12 tables have full CRUD operations
- ✅ All relationships working (foreign keys)
- ✅ Schema validation tests pass

**Phase 3 Completion:**
- ✅ All 11 pages display correctly
- ✅ All 10+ components function properly
- ✅ All server actions execute successfully
- ✅ Images optimized with Next.js Image
- ✅ Error boundaries catch and display errors
- ✅ Redis caching reduces query times
- ✅ All Vitest tests pass (80%+ coverage)
- ✅ All Playwright E2E tests pass

**Phase 4 Completion:**
- ✅ Accessibility audit: no critical issues
- ✅ Performance audit: Core Web Vitals passing
- ✅ Security audit: no exposed secrets
- ✅ CI/CD pipelines passing
- ✅ Documentation complete and accurate
- ✅ Production build succeeds
- ✅ Project ready for deployment

---

## Recommended Execution

**Strict Sequential Order:**
1. **Do not start Phase 2** until Phase 1 validation passes
2. **Do not start Phase 3** until Phase 2 blockers fixed and CRUD patterns established
3. **Do not start Phase 4** until Phase 3 pages complete and tests passing

**Maximize Parallelization Within Phases:**
- Phase 1: Run 1.1 + 1.2 parallel (save 30-40 min)
- Phase 2: Run 2.2 tables 1-5 parallel (save 20 min)
- Phase 3: Run 3.2.1 + 3.2.2 + 3.2.4 parallel (save 3-4 hrs), run 3.3 + 3.4 parallel (save 2-3 hrs)
- Phase 4: Run 4.2 + 4.4 parallel with 3.5 (save 2-3 hrs)

**Expected Total Duration:** 30-37 hours of actual work, ~5-7 calendar days @ 8 hrs/day focused work, or 1-2 weeks @ normal 4-5 hrs/day

---

## Notes for Refinement

This plan consolidates all three prompts (mainsetup, maintasks, plan-optimize) into a single executable roadmap with:
- **Complete task breakdown** with estimated durations for each subtask
- **Explicit dependency mapping** showing what must happen before what
- **Parallelization strategies** to minimize calendar days (4-5 days focused vs 5-7 days normal)
- **Daily execution schedule** for focused completion
- **Risk mitigation** for critical blockers
- **Success criteria** for each phase

Ready for further refinement or implementation.
