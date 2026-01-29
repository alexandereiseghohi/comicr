# ComicWise Complete Setup & Optimization Plan (40 Tasks)

## Overview

This plan addresses your comprehensive setup request with optimized sequencing to minimize rework and ensure all dependencies are properly managed. Your project is **95% complete** with production-ready infrastructure - this plan focuses on validation, optimization, and strategic enhancements.

**Project Status Summary:**
- Dependencies: 95 production + 95 dev (190 total packages)
- Scripts: 150+ pnpm scripts
- Utility Scripts: 70+ custom TypeScript/PowerShell scripts
- VS Code Config: Complete (5/5 files exist and optimized)
- Configuration Files: 10/10 production-ready
- Database Tables: 19 tables (Drizzle ORM)
- DAL Classes: 13 data access layers
- Zustand Stores: 7 state management stores
- TypeScript Errors: 84 (mainly Playwright module issue + markdown lint warnings)
- `any` Type Usage: 50+ occurrences (mostly in tests)

---

## Phase 1: Foundation & Prerequisites (Tasks 16, 1-5)

**Execute first - all other tasks depend on proper environment setup**

### Task 16: Create .env.local (CRITICAL - Currently Missing)

**Status**: ❌ Missing - blocks all database/Redis operations

**Actions**:
1. Extract all variables from `src/lib/env.ts` schema (60+ server, 3 client vars)
2. Set CUSTOM_PASSWORD for seeding system
3. Configure required services:
   - Database: DATABASE_URL or NEON_DATABASE_URL
   - Redis: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (or UPSTASH_REDIS_REST_URL)
   - Auth: AUTH_SECRET (min 32 chars), Google/GitHub OAuth credentials
   - ImageKit: PUBLIC_KEY, PRIVATE_KEY, URL_ENDPOINT
   - Sentry: DSN, tracing settings
4. Validate with `pnpm env:validate`

**Expected Variables**:
```powershell
# Database
DATABASE_URL=postgresql://...
NEON_DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=your-secret-min-32-chars
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# ImageKit
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

# Seeding
CUSTOM_PASSWORD=your-secure-password-for-seeding

# Sentry
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...

# Email (optional)
RESEND_API_KEY=...
EMAIL_FROM=...
```

**Validation**: Import in `appConfig.ts` already configured to re-export from `src/lib/env.ts`

---

### Tasks 1-5: VS Code Configuration Validation

**Status**: ✅ All files exist (397-216 lines each), highly optimized

**Files**:
1. `.vscode/mcp.json` - 397 lines, MCP servers for filesystem, git, PostgreSQL, Redis, GitHub
2. `.vscode/extensions.json` - 132 lines, 80+ recommended extensions
3. `.vscode/launch.json` - 158 lines, debug configs for Next.js, Chrome, Vitest, Playwright
4. `.vscode/tasks.json` - 216+ lines, tasks for dev/build/test/database
5. `.vscode/settings.json` - Prettier/ESLint/Tailwind/TypeScript optimization

**Actions**:
1. **Backup existing files**:
   ```powershell
   Copy-Item .vscode/mcp.json .vscode/mcp.json.backup
   Copy-Item .vscode/extensions.json .vscode/extensions.json.backup
   Copy-Item .vscode/launch.json .vscode/launch.json.backup
   Copy-Item .vscode/tasks.json .vscode/tasks.json.backup
   Copy-Item .vscode/settings.json .vscode/settings.json.backup
   ```

2. **Create enhanced versions** with:
   - Latest Next.js 16 debugger configuration
   - Additional MCP server optimizations (timeout, caching)
   - Extended extension list (AI tools: GitHub Copilot Chat, Tabnine)
   - Task improvements (parallel execution, dependency ordering)
   - Settings refinements (TypeScript inlay hints, file nesting)

3. **Create verification script** (`scripts/verify-vscode-config.ps1`):
   ```powershell
   # Verify MCP servers are running
   code --list-extensions | Select-String "mcp"

   # Install missing extensions
   code --install-extension dbaeumer.vscode-eslint
   code --install-extension esbenp.prettier-vscode
   # ... (80+ extensions)

   # Start MCP servers using VS Code CLI
   # (Implementation depends on MCP server startup mechanism)
   ```

**Expected Enhancements**:
- MCP: Increase timeout to 900s, enable advanced caching
- Extensions: Add Playwright Test for VS Code, Docker, Prisma (if not already present)
- Launch: Add edge runtime debugging config
- Tasks: Add composite tasks for full validation pipeline
- Settings: Enable all TypeScript strict inlay hints

---

## Phase 2: Core Configuration Optimization (Tasks 6-15)

**Status**: ✅ All files exist and are 95% optimized - enhance with latest best practices

### Task 6: next.config.ts Optimization

**Current**: 172 lines, React Compiler enabled, Turbopack caching, 14 optimized packages

**Actions**:
1. Backup: `Copy-Item next.config.ts next.config.ts.backup`
2. Enhancements:
   - Add missing optimized packages: `@heroicons/react`, `clsx`, `class-variance-authority`
   - Enable experimental features: `optimizeServerReact`, `serverMinification`
   - Add bundle analyzer configuration
   - Optimize image config: add AVIF priority over WebP
   - Add comprehensive security headers (CSP, HSTS, X-Frame-Options)
3. Validation: `pnpm build --debug` to verify configuration

**Expected Additions**:
```typescript
experimental: {
  optimizeServerReact: true,
  serverMinification: true,
  webpackBuildWorker: true,
  optimizePackageImports: [
    // ... existing 14 packages
    "@heroicons/react",
    "clsx",
    "class-variance-authority",
    "@tanstack/react-query"
  ]
}
```

---

### Task 7: nextSitemap.config.ts Optimization

**Current**: 17 lines, basic robots.txt generation

**Actions**:
1. Backup: `Copy-Item nextSitemap.config.ts nextSitemap.config.ts.backup`
2. Enhancements:
   - Add dynamic route generation for comics/chapters
   - Configure change frequency per route type
   - Add priority weighting (comics: 0.8, chapters: 0.6, static: 0.5)
   - Exclude admin routes, API routes explicitly
   - Add alternate language links (if i18n planned)

---

### Task 8: package.json Optimization

**Current**: 386 lines, 150+ scripts, 190 dependencies

**Actions**:
1. Backup: `Copy-Item package.json package.json.backup`
2. Audit for:
   - Unused dependencies (run `pnpm analyze:packages --dry-run`)
   - Script redundancy (e.g., multiple cleanup scripts doing similar tasks)
   - Missing useful scripts (e.g., `pnpm update-deps`, `pnpm security-audit`)
   - Version pinning vs ranges (consider pinning critical deps)
3. Add:
   - `"engines": { "node": ">=20.0.0", "pnpm": ">=9.0.0" }`
   - Pre-commit hooks via lint-staged (already configured)
   - Improved script organization with more category comments

---

### Task 9: tsconfig.json Optimization

**Current**: 104 lines, 35 path aliases, strict mode enabled

**Actions**:
1. Backup: `Copy-Item tsconfig.json tsconfig.json.backup`
2. Verify all path aliases work:
   ```powershell
   pnpm type-check 2>&1 | Select-String "Cannot find module"
   ```
3. Consider adding:
   - `"declarationMap": true` for better debugging
   - `"incremental": true` already set ✅
   - Review `"noUnusedLocals": false` - enable if team prefers strict
4. Ensure `paths` match actual directory structure

---

### Tasks 10-15: Additional Config Files

**Files**: `.prettierrc.ts`, `postcss.config.mjs`, `eslint.config.ts`, `.gitignore`, `.dockerignore`, `.prettierignore`

**Actions for each**:
1. Backup to `.backup` extension
2. Review against latest Next.js 16 / React 19 best practices
3. Enhance with project-specific optimizations
4. Validate:
   - Prettier: `pnpm format:check`
   - ESLint: `pnpm lint`
   - PostCSS: `pnpm build` (check CSS output)

**Specific Enhancements**:

**eslint.config.ts** (488 lines):
- Add kebab-case file naming rule (Task 34 requirement)
- Verify `no-explicit-any` is appropriately disabled
- Add custom rules for server actions (`"use server"` must be first line)

**.gitignore** (190 lines):
- Add `.backup` extension (for cleanup)
- Ensure all generated files excluded (`.next`, `out`, `dist`, `coverage`)

**.prettierignore** (106 lines):
- Add pnpm-lock.yaml, .next, out, dist
- Exclude generated DTO files if they're auto-generated

---

## Phase 3: Database & Seeding Enhancement (Task 17)

**Status**: ✅ Advanced seeding system (V3/V4), enhance capabilities

### Task 17: Seeding System Optimization

**Current Architecture**:
- Entry: `src/database/seed/seedRunnerV3.ts` (550 lines)
- Features: ✅ Multi-file JSON loading, image caching, onConflictDoUpdate, bcryptjs encryption
- Data Sources: `users.json`, `comics.json`, `comicsdata1.json`, `comicsdata2.json`, `chapters.json`, `chaptersdata1.json`, `chaptersdata2.json`

**Actions**:

1. **Backup seeding system**:
   ```powershell
   Copy-Item -Recurse src/database/seed src/database/seed.backup
   ```

2. **Create enhanced helpers** in `src/database/seed/helpers/`:
   - `imageValidator.ts` - Validate image URLs before download
   - `duplicateDetector.ts` - Advanced duplicate checking (slug, title, metadata)
   - `dataNormalizer.ts` - Normalize comic/chapter data from multiple JSON sources
   - `progressTracker.ts` - Enhanced logging with operation-specific metrics

3. **Enhance seedRunnerV3.ts**:
   ```typescript
   // Add validation before seeding
   const validateData = async (data: unknown) => {
     // Zod schema validation already exists ✅
     // Add: Cross-reference validation (chapter.comicId exists in comics)
     // Add: Image URL reachability check (optional, with timeout)
   };

   // Improve image download caching
   const downloadImage = async (url: string, targetPath: string) => {
     // Already checks filesystem ✅
     // Add: Database check (avoid re-downloading if URL in comicImages/chapterImages table)
     // Add: Retry logic with exponential backoff
     // Add: Image optimization (compress, convert to WebP/AVIF)
   };

   // Enhanced logging
   logger.info({
     operation: 'seedComics',
     source: 'comicsdata1.json',
     total: comics.length,
     created: 0,
     updated: 0,
     skipped: 0,
     errors: []
   });
   ```

4. **Verify integration**:
   ```powershell
   # Dry run with verbose logging
   pnpm db:seed:dry-run --verbose

   # Run selective seeding
   pnpm db:seed:users
   pnpm db:seed:comics
   pnpm db:seed:chapters

   # Full seeding
   pnpm db:seed
   ```

5. **Expected Enhancements**:
   - Validation: Cross-reference integrity checks
   - Image handling: Database-backed caching, retry logic
   - Logging: Structured JSON logs with operation metrics
   - Performance: Parallel image downloads (with concurrency limit)
   - Error handling: Graceful failure (continue seeding on individual errors)

**Files to Modify**:
- `src/database/seed/seedRunnerV3.ts`
- `src/database/seed/helpers/imageHandler.ts` (create)
- `src/database/seed/helpers/dataValidator.ts` (create)
- `src/database/seed/config.ts` (enhance with new options)

---

## Phase 4: UI/UX Pages (Tasks 18-25)

**Status**: ✅ Most pages exist - enhance with modern components

### Task 18: Root Pages Enhancement

**Target**: `src/app/(root)/page.tsx`, `src/app/(root)/browse/`, `src/app/(root)/genres/`

**Actions**:
1. Backup existing pages
2. Add 3D components:
   - Install Aceternity UI or use existing Radix UI with CSS transforms
   - 3D Card Carousel for featured comics
   - Accordion for genre browsing
   - Animated page transitions
3. Enhance homepage:
   ```typescript
   // src/app/(root)/page.tsx
   import { CardStack } from "@/components/ui/card-stack";
   import { InfiniteCarousel } from "@/components/ui/infinite-carousel";

   export default async function HomePage() {
     const featured = await comicDal.list({ limit: 6 });
     const trending = await comicDal.trending({ limit: 10 });

     return (
       <>
         <HeroSection />
         <CardStack items={featured} />
         <InfiniteCarousel items={trending} />
         <GenreAccordion />
       </>
     );
   }
   ```

**Expected Additions**:
- 3D Card components in `src/components/ui/`
- Carousel with auto-play and touch gestures
- Accordion with smooth animations

---

### Task 19: Auth Pages Validation

**Target**: `src/app/(auth)/` (7 routes already exist)

**Status**: ✅ Generic forms use React Hook Form + Zod

**Actions**:
1. Audit all auth forms for consistency:
   - `sign-in/`, `sign-up/`, `forgot-password/`, `reset-password/`, `verify-email/`
2. Verify schemas in `src/lib/validations/authSchemas.ts`
3. Ensure error handling is user-friendly
4. Add loading states and optimistic UI

**Validation**:
```powershell
# Test auth flow
pnpm dev
# Navigate to /sign-up, /sign-in, test validation
```

---

### Task 20: Admin Panel Validation

**Target**: `src/app/admin/` (8 entities with CRUD)

**Status**: ✅ BaseForm component exists, all actions use DTOs

**Actions**:
1. Verify all admin pages use centralized DTOs from `src/dto/`
2. Check CRUD operations:
   - `comics/`, `chapters/`, `users/`, `artists/`, `authors/`, `genres/`, `types/`
3. Ensure all forms have:
   - Zod validation
   - Loading states
   - Error boundaries
   - Success notifications (toast)

**Enhancement**:
```typescript
// Add bulk operations to admin panel
export async function bulkDeleteComics(ids: number[]): Promise<ActionResult> {
  // Batch delete with transaction
}
```

---

### Tasks 21-25: Feature Pages Enhancement

**Target Pages**:
- 21: `src/app/(root)/bookmarks/page.tsx` ✅ exists
- 22: `src/app/(root)/profile/` ✅ exists
- 23: `src/app/(root)/comics/page.tsx` - 373 lines, add 3D Cards
- 24: `src/app/(root)/comics/[slug]/page.tsx` - 303 lines, bookmark functionality exists
- 25: `src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx` - image gallery

**Actions**:

**Task 23 - Comics Listing**:
```typescript
// Enhance src/app/(root)/comics/page.tsx with 3D Cards
import { Card3D } from "@/components/ui/card-3d";

export default async function ComicsPage() {
  const comics = await comicDal.list({ limit: 24 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {comics.map((comic) => (
        <Card3D key={comic.id} comic={comic} />
      ))}
    </div>
  );
}
```

**Task 24 - Comic Detail**:
- Verify bookmark toggle works (already implemented)
- Add reading progress indicator
- Enhance tabs for info/chapters

**Task 25 - Chapter Reader**:
- Verify image gallery (currently uses `yet-another-react-lightbox` ✅)
- Add keyboard navigation (arrow keys)
- Add touch gestures (swipe)
- Implement reading progress tracking

---

## Phase 5: State & Data Management (Tasks 26-27)

### Task 26: Zustand Stores Validation

**Status**: ✅ 7 stores implemented

**Stores**:
1. `src/stores/authStore.ts` - User session
2. `src/stores/bookmarkStore.ts` - Bookmarks
3. `src/stores/comicStore.ts` - Comic data
4. `src/stores/notificationStore.ts` - Toasts
5. `src/stores/readerStore.ts` - Reading state
6. `src/stores/uiStore.ts` - Theme, sidebar, modals
7. `src/stores/index.ts` - Re-exports

**Actions**:
1. Verify integration in pages (no duplicate state logic)
2. Check for missing stores:
   - Admin store (filters, pagination)
   - Search store (query, results)
3. Ensure persistence where needed (localStorage)
4. Add store tests if missing

**Validation**:
```powershell
# Search for useState that should be in stores
Get-ChildItem -Recurse -Filter "*.tsx" | Select-String "useState\("
```

---

### Task 27: Database Access Pattern Audit

**Status**: ✅ DAL pattern implemented (13 classes), queries/mutations organized

**Actions**:
1. Audit all server actions to ensure DAL usage:
   ```powershell
   # Search for direct db queries in actions
   Get-ChildItem -Recurse src/lib/actions -Filter "*.ts" | Select-String "db\.select\(|db\.insert\(|db\.update\(|db\.delete\("
   ```

2. If direct queries found, refactor to use DAL:
   ```typescript
   // ❌ Before (direct query in action)
   const comics = await db.select().from(comic).limit(10);

   // ✅ After (using DAL)
   const comics = await comicDal.list({ limit: 10 });
   ```

3. Verify all DAL classes extend `BaseDal` singleton pattern
4. Ensure queries/mutations match DAL methods

**Expected Outcome**: 100% DAL usage in server actions, no direct `db` queries

---

## Phase 6: Code Quality & Refactoring (Tasks 28-35)

### Task 28: Folder Structure Optimization

**Actions**:
1. Use AST-based codemods with `jscodeshift` or `ts-morph`
2. Create refactoring script:

```typescript
// scripts/refactor-codebase.ts
import { Project } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

// Example: Convert any types to generics
const sourceFiles = project.getSourceFiles();
sourceFiles.forEach((sourceFile) => {
  // Find all 'any' usage
  // Convert to generic where possible
  // Update imports
});

project.save();
```

3. Target operations:
   - Move misplaced files to correct directories
   - Standardize file naming (kebab-case)
   - Update import paths automatically

---

### Task 29: CLI Enhancement

**Current**: `scripts/cw.ts` (scaffolding only)

**Actions**:
1. Backup: `Copy-Item scripts/cw.ts scripts/cw.ts.backup`
2. Expand CLI to include:

```typescript
// scripts/cw.ts
import { Command } from "commander";

const program = new Command();

program
  .name("cw")
  .description("ComicWise CLI - Manage all aspects of the platform")
  .version("2.0.0");

// Database commands
program
  .command("db:migrate")
  .description("Run database migrations")
  .action(async () => {
    // Implementation
  });

// Testing commands
program
  .command("test:coverage")
  .description("Run tests with coverage")
  .action(async () => {
    // Implementation
  });

// Deployment commands
program
  .command("deploy:preview")
  .description("Deploy to preview environment")
  .action(async () => {
    // Implementation
  });

// Scaffolding (existing)
program
  .command("scaffold")
  .description("Generate optimized files")
  .option("-t, --type <type>", "File type (component|action|hook|store)")
  .action(async (options) => {
    // Enhanced with templates for all file types
  });

program.parse();
```

3. Create scaffold templates for:
   - Components (Server + Client)
   - Server Actions (with DTO types)
   - Hooks (with TypeScript)
   - Stores (Zustand)
   - API Routes
   - Tests (Vitest + Playwright)

---

### Task 30: Type Safety Fixes

**Current**: 50+ `any` occurrences, 84 TypeScript errors

**Actions**:

1. **Fix Critical Playwright Error**:
   ```powershell
   pnpm playwright install --with-deps
   ```

2. **Fix Markdown Lint Warnings** (83):
   ```powershell
   pnpm lint:fix
   # Or manually fix in documentation files
   ```

3. **Convert `any` Types**:

   **Priority Files**:
   - `src/services/uploadService.ts` (2 functions)
   ```typescript
   // Before
   export async function uploadFile(file: any): Promise<any> { }

   // After
   export async function uploadFile<T extends File>(
     file: T
   ): Promise<UploadResult> { }
   ```

   **Convert to Generics**:
   - Utility functions that accept various types
   - Search service results
   - Cache operations

4. **Validation**:
   ```powershell
   pnpm type-check 2>&1 | Tee-Object -FilePath "type-check-after-fixes.txt"
   ```

---

### Tasks 31-32: Cleanup Scripts

**Existing Scripts**:
- `scripts/cleanup-duplicates.ts`
- `scripts/uninstall-unused-packages.ts`

**Actions**:

**Task 31 - Cleanup Code**:
```powershell
# Create comprehensive cleanup script
# scripts/cleanup-comprehensive.ts

# 1. Delete duplicate Zod schemas
Get-ChildItem -Recurse -Filter "*.ts" | ForEach-Object {
  # AST analysis to find duplicate schema definitions
}

# 2. Delete duplicate components
# Find components with same JSX structure

# 3. Delete .backup files (after validation)
Get-ChildItem -Recurse -Filter "*.backup" | Remove-Item -Force

# 4. Delete empty folders
Get-ChildItem -Recurse -Directory | Where-Object {
  (Get-ChildItem $_.FullName).Count -eq 0
} | Remove-Item -Force

# 5. Delete blank files
Get-ChildItem -Recurse -File | Where-Object {
  $_.Length -eq 0
} | Remove-Item -Force
```

**Task 32 - Uninstall Unused Packages**:
```powershell
# Analyze first
pnpm analyze:packages --dry-run

# Review output, then uninstall
pnpm analyze:packages
```

---

### Task 33: Import Optimization

**Existing**: `scripts/replaceImportsEnhanced.ts`

**Actions**:
```powershell
# Run import optimizer
pnpm imports:optimize

# Verify no broken imports
pnpm type-check
```

**Expected**: All imports use path aliases, no relative paths beyond parent directory

---

### Tasks 34-35: Kebab Case Convention

**Task 34 - ESLint Config**:
```typescript
// eslint.config.ts
export default [
  {
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: ["README.md", "CHANGELOG.md"],
        },
      ],
    },
  },
];
```

**Task 35 - Conversion Script**:
```typescript
// scripts/convert-to-kebab-case.ts
import * as fs from "fs";
import * as path from "path";

const toKebabCase = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

// Rename files
// Update imports/exports
// Update component references
```

**Execution**:
```powershell
# Create script
pnpm tsx scripts/convert-to-kebab-case.ts --dry-run

# Review changes
pnpm tsx scripts/convert-to-kebab-case.ts

# Verify
pnpm type-check
```

---

### Task 36: Cleanup Scripts Execution

**Actions**:
```powershell
# Run existing cleanup scripts
pnpm cleanup --deep

# Delete unused documentation
Get-ChildItem -Filter "*.md" | Where-Object {
  $_.Name -match "\.backup\.md$|^OLD_|^DEPRECATED_"
} | Remove-Item -Force

# Delete log files
Get-ChildItem -Recurse -Filter "*.log" | Remove-Item -Force

# Delete temporary text files
Get-ChildItem -Filter "*.txt" | Where-Object {
  $_.Name -match "^temp|^test|^sample|^samp"
} | Remove-Item -Force
```

**Caution**: Review files before deletion, keep essential documentation

---

## Phase 7: Prompts & Documentation (Task 17 sub-task)

### Create GitHub Copilot Prompts Directory

**Actions**:

1. **Create directory structure**:
   ```powershell
   New-Item -ItemType Directory -Force -Path .github/prompts
   ```

2. **Read existing prompt files**:
   - `samp.txt`
   - `Prompts.prompt.txt`
   - `recommendations-list.md`
   - `SetupPrompt.md`
   - `sample.txt`
   - All other `*.md` and `*.txt` in root

3. **Create consolidated prompts**:

**.github/prompts/setup.prompt.md**:
```markdown
# ComicWise Setup Prompt

## Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Redis 7+ (optional)

## Context
[Include all context from existing prompts]

## Phases
[Include all 40 tasks organized by phase]

[All content from samp.txt, Prompts.prompt.txt, recommendations-list.md, SetupPrompt.md, sample.txt]
```

**.github/prompts/main.prompt.md**:
```markdown
# ComicWise Main Prompt - File Change Log

## Files Created
- .github/prompts/setup.prompt.md
- .github/prompts/run.prompt.md
- scripts/verify-vscode-config.ps1
- [Auto-populated during execution]

## Files Modified
- next.config.ts (backup: next.config.ts.backup)
- package.json (backup: package.json.backup)
- [Auto-populated during execution]

## Files Deleted
- *.backup (after validation)
- temp*.txt
- [Auto-populated during execution]
```

**.github/prompts/run.prompt.md**:
```markdown
# ComicWise Execution Prompt

## Overview
Execute all changes described in main.prompt.md

## Execution Order
1. Phase 1: Foundation (Tasks 16, 1-5)
2. Phase 2: Configuration (Tasks 6-15)
3. Phase 3: Seeding (Task 17)
4. Phase 4: Pages (Tasks 18-25)
5. Phase 5: State (Tasks 26-27)
6. Phase 6: Quality (Tasks 28-35)
7. Phase 7: Documentation (this phase)
8. Phase 8: Validation (Tasks 37-39)
9. Phase 9: Final Setup (Task 40)

## Commands
[PowerShell commands for each phase]

## Validation
[Validation steps after each phase]
```

---

## Phase 8: Validation & Testing (Tasks 37-39)

### Task 37: Implement @workspace Recommendations

**Actions**:
1. Run AI analysis:
   ```powershell
   # Use GitHub Copilot or AI agent to analyze project
   # Request: "@workspace /explain and implement all suggestions"
   ```

2. Review recommendations for:
   - Code organization improvements
   - Performance optimizations
   - Security enhancements
   - Missing features
   - Better patterns

3. Implement accepted recommendations
4. Document decisions in `.github/prompts/main.prompt.md`

---

### Task 38: Quick Validation

**Actions**:
```powershell
# Run validation suite
pnpm validate:quick

# Expected output: type errors, lint errors
# Fix all errors iteratively

# Re-run until clean
pnpm validate:quick
```

**Expected Issues**:
- 84 TypeScript errors (should be 0 after Playwright fix)
- 0 ESLint errors (after fixes)

**Fixes**:
1. Playwright: `pnpm playwright install`
2. Type errors: Fix `any` types in upload service
3. Lint errors: Run `pnpm lint:fix`
4. Markdown: Fix manually or ignore (non-critical)

---

### Task 39: Production Build

**Actions**:
```powershell
# Clean build
pnpm clean

# Build for production
pnpm build

# Expected: successful build with bundle analysis
# Fix any build errors

# Test production server
pnpm start

# Navigate to http://localhost:3000
# Test: homepage, comics, auth, admin
```

**Build Validation**:
- No TypeScript errors
- No ESLint errors
- Bundle size reasonable (<500KB for main bundle)
- All pages render correctly
- API routes functional

---

## Phase 9: Final Setup (Task 40)

### Task 40: Complete Optimized Setup

**Actions**:

1. **Full Reset**:
   ```powershell
   # Stop all processes
   # Clean everything
   pnpm clean:all

   # Fresh install
   pnpm install
   ```

2. **Database Setup**:
   ```powershell
   # Reset database
   pnpm db:reset

   # Verify seeding
   # Check: users, comics, chapters all created
   # Check: images downloaded to public/comics/
   ```

3. **Build & Test**:
   ```powershell
   # Type check
   pnpm type-check

   # Build
   pnpm build

   # Unit tests
   pnpm test:unit:run

   # E2E tests
   pnpm test

   # Start production
   pnpm start
   ```

4. **Final Validation**:
   - ✅ All pages load
   - ✅ Authentication works
   - ✅ Admin panel functional
   - ✅ Comics/chapters display correctly
   - ✅ Bookmarks work
   - ✅ Search works
   - ✅ Images display
   - ✅ No console errors

5. **Document Final State**:
   Create `.github/prompts/completion-report.md`:
   ```markdown
   # ComicWise Setup Completion Report

   ## Date
   January 22, 2026

   ## Summary
   All 40 tasks completed successfully

   ## Metrics
   - TypeScript errors: 0
   - ESLint errors: 0
   - Build time: [X]s
   - Bundle size: [X]KB
   - Test coverage: [X]%

   ## Files Modified
   [List from main.prompt.md]

   ## Files Created
   [List from main.prompt.md]

   ## Verification
   - [ ] All pages accessible
   - [ ] Authentication functional
   - [ ] Database seeded
   - [ ] Images displayed
   - [ ] Tests passing
   ```

---

## Execution Checklist

### Prerequisites
- [ ] Task 16: `.env.local` created with all required variables
- [ ] Git: All changes committed (clean working tree)
- [ ] Backups: All modified files backed up to `.backup`

### Phase 1 (Foundation)
- [ ] Tasks 1-5: VS Code config validated and enhanced
- [ ] Verification script created and tested

### Phase 2 (Configuration)
- [ ] Tasks 6-15: All config files optimized
- [ ] Validation: `pnpm validate:quick` passes

### Phase 3 (Seeding)
- [ ] Task 17: Seeding system enhanced
- [ ] Dry run successful: `pnpm db:seed:dry-run`

### Phase 4 (Pages)
- [ ] Tasks 18-25: All pages enhanced with modern components
- [ ] Manual testing: All routes accessible

### Phase 5 (State)
- [ ] Task 26: Zustand stores validated
- [ ] Task 27: DAL usage audit complete

### Phase 6 (Quality)
- [ ] Tasks 28-35: Code refactoring complete
- [ ] Kebab case conversion successful
- [ ] Cleanup scripts executed
- [ ] `any` types fixed

### Phase 7 (Documentation)
- [ ] `.github/prompts/` created with all prompts
- [ ] Main prompt log maintained

### Phase 8 (Validation)
- [ ] Task 37: AI recommendations implemented
- [ ] Task 38: `pnpm validate:quick` passes (0 errors)
- [ ] Task 39: `pnpm build` successful

### Phase 9 (Final)
- [ ] Task 40: Complete reset and setup successful
- [ ] Completion report created
- [ ] All validation checks passed

---

## Time Estimates

| Phase | Tasks | Estimated Time | Critical Path |
|-------|-------|----------------|---------------|
| Phase 1 | 16, 1-5 | 30-45 min | ⚠️ Critical (blocks all) |
| Phase 2 | 6-15 | 1-1.5 hours | - |
| Phase 3 | 17 | 1-2 hours | ⚠️ Database dependent |
| Phase 4 | 18-25 | 2-3 hours | - |
| Phase 5 | 26-27 | 1-1.5 hours | - |
| Phase 6 | 28-35 | 3-4 hours | ⚠️ Code refactoring |
| Phase 7 | Documentation | 30-45 min | - |
| Phase 8 | 37-39 | 1-2 hours | ⚠️ Validation required |
| Phase 9 | 40 | 1-1.5 hours | ⚠️ Final verification |
| **Total** | **40 tasks** | **11-16 hours** | - |

---

## Risk Mitigation

### Backup Strategy
- All modified files backed up to `.backup` extension
- Git commits after each phase completion
- Database backup before `pnpm db:reset`

### Rollback Plan
1. Restore from `.backup` files
2. Revert Git commits: `git reset --hard HEAD~1`
3. Restore database: `pnpm db:restore` (if backup script run)

### Validation Gates
- Phase 1 gate: `.env.local` must exist
- Phase 6 gate: `pnpm type-check` must pass
- Phase 8 gate: `pnpm validate:quick` must pass
- Phase 9 gate: `pnpm build` must pass

### Critical Dependencies
1. `.env.local` (Task 16) - blocks database, Redis, auth
2. Playwright installation - blocks E2E tests
3. Seeding validation - blocks data-dependent pages
4. Type fixes - blocks production build

---

## Success Criteria

### Code Quality
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ <10 `any` types (only in tests/external libs)
- ✅ 100% DAL usage in server actions
- ✅ All files use kebab-case naming

### Functionality
- ✅ All 40 pages accessible
- ✅ Authentication flow works end-to-end
- ✅ Admin CRUD operations functional
- ✅ Seeding creates all data with images
- ✅ Bookmark/reading progress works
- ✅ Search returns results

### Performance
- ✅ Build time <2 minutes
- ✅ Main bundle <500KB
- ✅ First Contentful Paint <1.5s
- ✅ Time to Interactive <3s

### Documentation
- ✅ All prompts consolidated in `.github/prompts/`
- ✅ Completion report generated
- ✅ Change log maintained

---

## Next Steps After Completion

1. **CI/CD Setup**
   - GitHub Actions workflows
   - Automated testing on PR
   - Deploy previews

2. **Monitoring**
   - Sentry error tracking verification
   - Performance monitoring setup
   - User analytics

3. **Feature Enhancements**
   - Implement remaining recommendations
   - Add missing nice-to-have features
   - Expand test coverage

4. **Production Deployment**
   - Vercel deployment configuration
   - Environment variable setup (production)
   - Domain configuration

---

**Plan Version**: 1.0
**Created**: January 22, 2026
**Target Completion**: 11-16 hours (1-2 working days)
**Status**: Ready for execution
