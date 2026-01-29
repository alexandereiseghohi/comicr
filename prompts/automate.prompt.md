# Plan: Phase-Based Automation Scripts for ComicWise

## Executive Summary

The ComicWise project is **~75% complete** with excellent foundations but lacks consolidated phase-based automation. I'll create master orchestration scripts that leverage existing tools (90+ scripts already present) and fill critical gaps to ensure systematic completion of all 9 phases from the optimization prompt.

## Current Project State

### Strengths
- ✅ **Excellent Architecture** - DAL pattern, DTO layer, path aliases all properly implemented
- ✅ **Advanced Database Seeding** - v4enhanced system exceeds requirements
- ✅ **Comprehensive VS Code Integration** - MCP, tasks, extensions all configured
- ✅ **Strong CI/CD Foundation** - 17 GitHub Actions workflows
- ✅ **Type Safety** - Strict TypeScript, Zod validation throughout
- ✅ **Extensive Scripts** - 90+ scripts covering most workflows
- ✅ **Good Documentation** - 60+ markdown files
- ✅ **Modern Stack** - Next.js 16, PostgreSQL, Redis, Drizzle ORM

### Phase Completion Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: VS Code Configuration | ✅ COMPLETE | All configs exist with good coverage |
| Phase 2: Environment & Configuration | ✅ COMPLETE | T3 Env, all config files optimized |
| Phase 3: Database & Seeding | ✅ COMPLETE | Exceeds requirements with v4enhanced |
| Phase 4: Frontend Implementation | ⚠️ PARTIAL | Missing some profile pages, UI enhancements |
| Phase 5: Scripts & Automation | ❌ MAJOR GAPS | Scripts exist but not phase-organized |
| Phase 6: CI/CD & DevOps | ✅ MOSTLY COMPLETE | Missing migrations workflow |
| Phase 7: Documentation & Quality | ✅ MOSTLY COMPLETE | Good docs, needs phase alignment |
| Phase 8: Testing & Quality Assurance | ⚠️ PARTIAL | Below 80% coverage target |
| Phase 9: Optional Enhancements | ❌ NOT STARTED | i18n, analytics, onboarding |

### Current Status (Updated 2026-01-22)

**✅ COMPLETED:**
- Phase 1-3: All foundational phases complete
- Phase 4: Frontend pages and components created
- Database seeding: V4Enhanced system with 0 insert errors
- All TypeScript: No type errors (`pnpm type-check` ✅)
- Phase runner framework: Implemented with package.json integration
- PowerShell wrappers: Created for all phases

**⚠️ IN PROGRESS:**
- Phase 5: Scripts optimization and automation
- Phase 8: Test coverage expansion (targeting 80%+)

**📋 REMAINING:**
- Phase 6: CI/CD migrations workflow
- Phase 7: Documentation finalization
- Phase 9: Optional enhancements (i18n, analytics, onboarding)

---

## Project Structure & File Organization

### Key Directories
```
comicwise/
├── src/
│   ├── app/                          # Next.js app directory (pages & layouts)
│   │   ├── (auth)/                  # Authentication routes (sign-in, sign-up, etc.)
│   │   ├── (root)/                  # Main application grouped routes
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── bookmarks/           # Bookmarks listing
│   │   │   ├── browse/              # Browse comics
│   │   │   ├── comics/              # Comics listing & details
│   │   │   │   └── [slug]/          # Individual comic
│   │   │   │       └── chapters/    # Chapter reader
│   │   │   ├── genres/              # Genre browsing
│   │   │   ├── profile/             # User profile (view/edit/settings)
│   │   │   ├── search/              # Search results
│   │   │   └── [legal pages]        # Privacy, DMCA, etc.
│   │   ├── admin/                   # Admin panel
│   │   │   ├── artists/             # Artist management
│   │   │   ├── authors/             # Author management
│   │   │   ├── chapters/            # Chapter management
│   │   │   ├── comics/              # Comic management
│   │   │   ├── genres/              # Genre management
│   │   │   ├── types/               # Type management
│   │   │   └── users/               # User management
│   │   ├── api/                     # API routes
│   │   ├── layout.tsx               # Root layout
│   │   ├── global-error.tsx         # Global error handler
│   │   └── providers.tsx            # App providers
│   ├── components/                  # React components (organized by feature)
│   │   ├── comics/                  # Comic components
│   │   ├── chapters/                # Chapter reader components
│   │   ├── profile/                 # Profile components
│   │   ├── bookmarks/               # Bookmark components
│   │   ├── admin/                   # Admin components
│   │   └── ui/                      # Base UI components (shadcn)
│   ├── database/                    # Database layer (Drizzle ORM)
│   │   ├── schema.ts                # Database schema
│   │   └── seed/                    # Seeding system
│   │       ├── seeders/             # Entity seeders
│   │       │   ├── user-seeder-v4.ts
│   │       │   ├── comic-seeder-v4.ts
│   │       │   └── chapter-seeder-v4.ts
│   │       ├── helpers/             # Utility helpers
│   │       │   ├── image-downloader.ts
│   │       │   ├── validation-schemas.ts
│   │       │   ├── password-hasher.ts
│   │       │   ├── seed-logger.ts
│   │       │   └── batch-processor.ts
│   │       └── seed-runner-v4enhanced.ts  # Main orchestrator
│   ├── dal/                         # Data Access Layer
│   ├── lib/                         # Library utilities
│   │   ├── actions/                 # Server actions
│   │   ├── auth.ts                  # Authentication utilities
│   │   ├── env.ts                   # Environment variables (validated)
│   │   └── [utility functions]
│   └── styles/                      # Global styles
├── scripts/                         # Automation scripts (90+)
│   ├── phases/                      # Phase automation
│   │   ├── phase-runner.ts          # Master phase orchestrator
│   │   ├── verify-phase.ts          # Phase verification system
│   │   ├── phase-1.ts to phase-9.ts # Individual phase scripts
│   │   ├── run-all-phases.ps1       # PowerShell master wrapper
│   │   └── run-phase-*.ps1          # PowerShell individual wrappers
│   ├── setup-testing.ps1            # Test environment setup
│   ├── analyze-performance.ts       # Performance analysis
│   ├── generate-docs.ts             # Documentation generator
│   ├── cleanup-project.ps1          # Project cleanup
│   └── [80+ utility scripts]
├── .github/                         # GitHub configuration
│   ├── workflows/                   # GitHub Actions (17+ workflows)
│   │   ├── ci.yml                   # CI pipeline
│   │   ├── cd.yml                   # CD pipeline
│   │   ├── migrations.yml           # Database migrations
│   │   └── [other workflows]
│   └── prompts/                     # AI assistant prompts
│       ├── automate.prompt.md       # This file (phase automation)
│       ├── optimize.prompt.md       # Optimization guide
│       └── [other prompts]
├── .vscode/                         # VS Code configuration
│   ├── settings.json                # Editor settings
│   ├── launch.json                  # Debug configurations
│   ├── tasks.json                   # VS Code tasks
│   ├── extensions.json              # Recommended extensions
│   └── mcp.json                     # MCP server config
├── public/                          # Static assets
│   ├── comics/                      # Comic covers
│   │   └── covers/
│   ├── chapters/                    # Chapter images
│   └── uploads/                     # User uploads
├── docs/                            # Documentation
│   ├── phase-status.md              # Phase completion status
│   ├── architecture.md              # System architecture
│   └── [generated docs]
├── .env.example                     # Environment template
├── .env.local                       # Environment variables (git-ignored)
├── .phases-progress.json            # Phase progress tracking (git-ignored)
└── [config files: next.config.ts, tsconfig.json, etc.]
```

### Route Structure (Properly Organized)
```
Routes are organized in layout groups:

PUBLIC ROUTES (/(root) group):
/                                    # Home page (src/app/(root)/page.tsx)
/bookmarks                          # User bookmarks (src/app/(root)/bookmarks/page.tsx)
/browse                             # Browse comics (src/app/(root)/browse/page.tsx)
/comics                             # Comics listing (src/app/(root)/comics/page.tsx)
/comics/[slug]                      # Comic details (src/app/(root)/comics/[slug]/page.tsx)
/comics/[slug]/chapters/[chapter-id] # Chapter reader (src/app/(root)/comics/[slug]/chapters/[chapter-id]/page.tsx)
/genres/[slug]                      # Genre page (src/app/(root)/genres/[slug]/page.tsx)
/profile                            # User profile (src/app/(root)/profile/page.tsx)
/profile/[user-id]                  # View user profile (src/app/(root)/profile/[user-id]/page.tsx)
/profile/edit                       # Edit profile (src/app/(root)/profile/edit/page.tsx)
/profile/change-password            # Change password (src/app/(root)/profile/change-password/page.tsx)
/profile/settings                   # User settings (src/app/(root)/profile/settings/page.tsx)
/search                             # Search results (src/app/(root)/search/page.tsx)
/privacy-policy                     # Privacy policy (src/app/(root)/privacy-policy/page.tsx)
/terms-of-service                   # Terms of service (src/app/(root)/terms-of-service/page.tsx)
/dmca                               # DMCA page (src/app/(root)/dmca/page.tsx)

AUTH ROUTES (/(auth) group):
/sign-in                            # Sign in (src/app/(auth)/sign-in/page.tsx)
/sign-up                            # Sign up (src/app/(auth)/sign-up/page.tsx)
/forgot-password                    # Forgot password (src/app/(auth)/forgot-password/page.tsx)
/reset-password                     # Reset password (src/app/(auth)/reset-password/page.tsx)
/verify-request                     # Verify request (src/app/(auth)/verify-request/page.tsx)
/resend-verification                # Resend verification (src/app/(auth)/resend-verification/page.tsx)
/sign-out                           # Sign out (src/app/(auth)/sign-out/page.tsx)

ADMIN ROUTES (/admin group):
/admin                              # Admin dashboard (src/app/admin/page.tsx)
/admin/users                        # User management (src/app/admin/users/page.tsx)
/admin/users/new                    # New user (src/app/admin/users/new/page.tsx)
/admin/users/[id]                   # Edit user (src/app/admin/users/[id]/page.tsx)
/admin/comics                       # Comic management (src/app/admin/comics/page.tsx)
/admin/comics/new                   # New comic (src/app/admin/comics/new/page.tsx)
/admin/comics/[id]                  # Edit comic (src/app/admin/comics/[id]/page.tsx)
/admin/chapters                     # Chapter management (src/app/admin/chapters/page.tsx)
/admin/chapters/new                 # New chapter (src/app/admin/chapters/new/page.tsx)
/admin/chapters/[id]                # Edit chapter (src/app/admin/chapters/[id]/page.tsx)
/admin/genres                       # Genre management (src/app/admin/genres/page.tsx)
/admin/genres/new                   # New genre (src/app/admin/genres/new/page.tsx)
/admin/genres/[id]                  # Edit genre (src/app/admin/genres/[id]/page.tsx)
/admin/authors                      # Author management (src/app/admin/authors/page.tsx)
/admin/authors/new                  # New author (src/app/admin/authors/new/page.tsx)
/admin/authors/[id]                 # Edit author (src/app/admin/authors/[id]/page.tsx)
/admin/artists                      # Artist management (src/app/admin/artists/page.tsx)
/admin/artists/new                  # New artist (src/app/admin/artists/new/page.tsx)
/admin/artists/[id]                 # Edit artist (src/app/admin/artists/[id]/page.tsx)
/admin/types                        # Type management (src/app/admin/types/page.tsx)
/admin/types/new                    # New type (src/app/admin/types/new/page.tsx)
/admin/types/[id]                   # Edit type (src/app/admin/types/[id]/page.tsx)

API ROUTES:
/api/*                              # API endpoints (src/app/api/*)
```

---

## Database Seeding System (Phase 3)

### Architecture: V4 Enhanced Seeding
**Status:** ✅ **0 Insert Errors** | All data validated and inserted successfully

**Location:** `src/database/seed/`

### Key Files
1. **`seed-runner-v4enhanced.ts`** - Main orchestrator
   - Loads data from JSON files (users.json, comics.json, chapters.json, etc.)
   - Validates all data with Zod schemas
   - Executes seeders with progress tracking
   - Supports dry-run mode for validation
   - Comprehensive error handling and logging

2. **Seeders** (`seeders/` directory)
   - `user-seeder-v4.ts` - User seeding with password hashing
   - `comic-seeder-v4.ts` - Comic data with cover images
   - `chapter-seeder-v4.ts` - Chapter data with page images

3. **Helpers** (`helpers/` directory)
   - `validation-schemas.ts` - Zod schemas for all entities
   - `image-downloader.ts` - Image caching and downloading
   - `password-hasher.ts` - bcryptjs password hashing
   - `seed-logger.ts` - Structured logging
   - `batch-processor.ts` - Batch operations
   - `image-deduplicator.ts` - Prevents duplicate image downloads
   - `validate-and-insert.ts` - Upsert operations with onConflictDoUpdate

### Commands
```bash
# Seed all (users, comics, chapters)
pnpm db:seed

# Dry-run validation (no database changes)
pnpm db:seed:dry-run

# Seed specific entity
pnpm db:seed:users
pnpm db:seed:comics
pnpm db:seed:chapters

# Verbose output
pnpm db:seed:verbose

# Reset database and seed
pnpm db:reset
pnpm db:reset:hard
```

### Error Prevention Strategy (0 Insert Errors)
1. **Pre-Validation Layer:**
   - Zod schema validation for all entities before insertion
   - Required field checks (no NULL violations)
   - Email/username uniqueness checks
   - Data type validation and coercion

2. **Relationship Validation:**
   - Foreign key existence checks before insert
   - Genre/Type/Author/Artist ID validation
   - Circular dependency detection
   - Parent record creation before child records

3. **Upsert Pattern (Safe Updates):**
   - Uses Drizzle's `onConflictDoUpdate` for safe updates
   - Unique constraint handling (email, username, slug, title)
   - Partial updates preserve existing data
   - Conflict resolution via upsert instead of delete+insert

4. **Transaction Support:**
   - Atomic operations prevent partial updates
   - Rollback on error for data consistency
   - Batch processing with transaction boundaries
   - Savepoint support for granular rollback

5. **Image Caching (3-Layer):**
   - Session cache (in-memory): Deduplicates within run
   - Filesystem cache: Checks before download
   - Remote hash validation: Prevents corrupt downloads
   - Fallback images: No missing image references

6. **Duplicate Prevention:**
   - Deduplicates by unique fields (email, username, title, slug)
   - JSON data loading with Set-based deduplication
   - Conflict resolution: Update if exists, insert if new
   - Composite key deduplication for relationships

7. **Error Recovery:**
   - Continues on non-critical errors (image failures)
   - Stops on critical errors (schema violations)
   - Detailed error logging with context
   - Partial success reporting

8. **Dry-run Mode (Safe Preview):**
   - Full validation without database writes
   - Reports validation errors before seeding
   - Shows what data will be inserted/updated
   - Zero risk verification

### Data Sources
- `users.json` - User accounts with roles
- `comics.json` - Comic metadata
- `comicsdata1.json`, `comicsdata2.json` - Additional comic data
- `chapters.json` - Chapter information
- `chaptersdata1.json`, `chaptersdata2.json` - Additional chapter data

---

## Implementation Plan

### Step 1: Create Phase Runner Framework

**Objective:** Build master orchestration tool for phase-based automation

#### 1.1 Create Phase Runner Core
**File:** `scripts/phases/phase-runner.ts`

**Purpose:** Master CLI tool that orchestrates all 9 phases

**Features:**
- CLI interface using commander.js (like existing `bin/cli.ts`)
- Phase validation and dependency checking
- Progress tracking with state persistence (`.phases-progress.json`)
- Dry-run mode for preview
- Selective phase execution (`--phase=1`, `--phase=1-3`, `--phase=all`)
- Skip completed phases (`--skip-completed`)
- Verbose logging with emojis (✅ ❌ ⚠️ 🔄 ℹ️)
- Error recovery and rollback
- Summary report generation

**Structure:**
```typescript
interface PhaseConfig {
  id: number;
  name: string;
  description: string;
  dependencies: number[];
  tasks: Task[];
  verifications: Verification[];
}

interface Task {
  id: string;
  description: string;
  execute: () => Promise<void>;
  rollback?: () => Promise<void>;
}

class PhaseRunner {
  async runPhase(phaseId: number, options: RunOptions): Promise<PhaseResult>
  async runAllPhases(options: RunOptions): Promise<RunSummary>
  async verifyPhase(phaseId: number): Promise<VerificationResult>
  async getProgress(): Promise<PhaseProgress>
}
```

#### 1.2 Create Individual Phase Scripts
**Files:** `scripts/phases/phase-{1-9}.ts`

Each phase script wraps existing scripts and adds new automation:

**Phase 1:** `phase-1-vscode-config.ts`
- Verify `.vscode/*.json` files exist and are valid
- Run `scripts/vscode-install-extensions.ps1`
- Validate MCP server configuration
- **Status:** Mostly verification, existing scripts handle setup

**Phase 2:** `phase-2-environment-config.ts`
- Verify `.env.local` exists or copy from `.env.example`
- Validate environment variables with `src/lib/env.ts`
- Check all config files (next.config.ts, tsconfig.json, etc.)
- **Status:** Mostly verification, configs already optimized

**Phase 3:** `phase-3-database-seeding.ts`
- Run database health check (`scripts/db-health-check.ts`)
- Execute `pnpm db:push` to sync schema
- Run `pnpm db:seed:dry-run` for validation
- Execute `pnpm db:seed` with progress tracking
- Verify seeded data
- **Status:** Wraps existing excellent seeding system

**Phase 4:** `phase-4-frontend-implementation.ts`
- Scaffold missing profile pages using `bin/cli.ts scaffold`
- Generate bookmark UI components
- Verify comic listing and chapter reader
- Run component tests
- **Status:** Some generation needed, validation of existing

**Phase 5:** `phase-5-scripts-automation.ts`
- Optimize all scripts in `scripts/` directory
- Run performance analysis (`scripts/analyze-performance-enhanced.ts`)
- Generate documentation (`scripts/generate-docs-complete.ts`)
- Setup testing (`scripts/setup-testing.ps1`)
- Run cleanup (`scripts/cleanup-project-enhanced.ps1`)
- **Status:** Needs new scripts created, wraps existing ones

**Phase 6:** `phase-6-cicd-devops.ts`
- Validate all GitHub Actions workflows
- Create database migrations workflow
- Optimize Docker configurations
- Test deployment pipeline
- **Status:** Mostly validation, one workflow creation

**Phase 7:** `phase-7-documentation.ts`
- Generate comprehensive README
- Create/update docs in `docs/` directory
- Run linting (`pnpm lint:fix`)
- Validate documentation completeness
- **Status:** Wraps existing, some generation

**Phase 8:** `phase-8-testing-qa.ts`
- Run test suite (`pnpm test`)
- Generate coverage report
- Identify coverage gaps
- Run performance benchmarks
- **Status:** Wraps existing tests, adds coverage checks

**Phase 9:** `phase-9-optional-enhancements.ts`
- Setup i18n framework (if requested)
- Integrate analytics (Sentry already done)
- Create onboarding flow
- **Status:** Optional, mostly new implementation

---

### Step 2: Implement Missing Critical Scripts

#### 2.1 Create Testing Setup Script
**File:** `scripts/setup-testing.ps1`

**Purpose:** Automate test environment setup (Phase 5.4)

**Tasks:**
- Validate test configuration files (vitest.config.ts, playwright.config.ts)
- Install test dependencies if missing
- Generate test templates for:
  - All server actions in `src/lib/actions/`
  - All DAL classes in `src/dal/`
  - All components in `src/components/`
- Setup test database (using docker-compose.dev.yml)
- Configure test Redis instance
- Create test fixtures and mocks
- Generate coverage reports
- Setup CI test integration

**Commands:**
```powershell
pnpm setup:tests           # Full setup
pnpm setup:tests:unit      # Unit test templates only
pnpm setup:tests:e2e       # E2E test setup only
```

#### 2.2 Enhance Performance Analysis Script
**File:** `scripts/analyze-performance-enhanced.ts`

**Purpose:** Enhanced performance analysis (Phase 5.2)

**Enhancements to existing `scripts/analyze-performance.ts`:**
- **Page Load Benchmarks:**
  - Lighthouse CI integration
  - Core Web Vitals tracking (LCP, FID, CLS)
  - Time to Interactive (TTI)
  - First Contentful Paint (FCP)

- **API Response Metrics:**
  - Server action performance
  - API route response times
  - Database query profiling

- **Database Query Performance:**
  - Slow query detection
  - N+1 query identification
  - Index usage analysis
  - Connection pool metrics

- **Image Optimization:**
  - Image size analysis
  - WebP conversion check
  - Lazy loading verification

- **Bundle Analysis:**
  - Client/server bundle sizes
  - Code splitting effectiveness
  - Unused dependencies

**Output:** JSON report + HTML dashboard

#### 2.3 Complete Documentation Generator
**File:** `scripts/generate-docs-complete.ts`

**Purpose:** Complete automated documentation generation (Phase 5.3)

**Features:**
- **API Documentation:**
  - Auto-generate from server actions JSDoc
  - Extract route handlers documentation
  - Create endpoint reference

- **Component Documentation:**
  - Extract React component props
  - Generate Storybook-style docs
  - Create component usage examples

- **Architecture Documentation:**
  - Generate system architecture diagram (Mermaid)
  - Create data flow diagrams
  - Document DAL/DTO patterns

- **Setup Guides:**
  - Installation instructions
  - Configuration guide
  - Deployment walkthrough

- **Usage Guidelines:**
  - User manual
  - Admin guide
  - Developer handbook

**Output:** Markdown files in `docs/generated/`

#### 2.4 Create Enhanced Cleanup Script
**File:** `scripts/cleanup-project-enhanced.ps1`

**Purpose:** Phase-aware project cleanup (Phase 5.5)

**Enhancements to existing cleanup scripts:**
- **Phase-Specific Cleanup:**
  - Remove phase temporary files
  - Clean phase artifacts
  - Reset phase progress (optional)

- **Duplicate Prevention:**
  - Better duplicate file detection
  - Merge duplicate components
  - Consolidate similar scripts

- **Backup Removal:**
  - Delete all `.backup` files
  - Remove old migration backups
  - Clean temp directories

- **Unused Code Detection:**
  - Identify unused components
  - Find unused imports
  - Detect dead code

- **Package Cleanup:**
  - Uninstall unused dependencies
  - Clean node_modules
  - Prune pnpm store

**Options:**
```powershell
.\scripts\cleanup-project-enhanced.ps1 -DryRun      # Preview only
.\scripts\cleanup-project-enhanced.ps1 -Phase 5     # Phase-specific cleanup
.\scripts\cleanup-project-enhanced.ps1 -Full        # Deep clean
.\scripts\cleanup-project-enhanced.ps1 -Backups     # Remove backups only
```

---

### Step 3: Add Missing CI/CD Workflow

#### 3.1 Create Database Migrations Workflow
**File:** `.github/workflows/migrations.yml`

**Purpose:** Automated database migration validation and execution (Phase 6.1)

**Triggers:**
- Manual workflow_dispatch
- Push to main (when migration files change)
- Pull request (validation only)

**Jobs:**

**Job 1: Validate Migrations**
```yaml
validate-migrations:
  runs-on: ubuntu-latest
  steps:
    - Checkout code
    - Setup Node.js and pnpm
    - Restore dependencies cache
    - Run `pnpm db:push --dry-run`
    - Check for migration conflicts
    - Validate migration files syntax
    - Generate migration plan
```

**Job 2: Test Migrations**
```yaml
test-migrations:
  needs: validate-migrations
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env: POSTGRES_PASSWORD, POSTGRES_DB
  steps:
    - Setup test database
    - Apply migrations
    - Run seed data
    - Verify schema integrity
    - Test rollback capability
```

**Job 3: Apply to Staging**
```yaml
apply-staging:
  needs: test-migrations
  if: github.event_name == 'workflow_dispatch'
  environment: staging
  steps:
    - Backup staging database
    - Apply migrations to staging
    - Verify application health
    - Run smoke tests
```

**Job 4: Apply to Production**
```yaml
apply-production:
  needs: apply-staging
  if: github.event_name == 'workflow_dispatch'
  environment: production
  steps:
    - Create production backup
    - Apply migrations with transaction
    - Health check verification
    - Rollback on failure
    - Notify team (Slack/Discord)
```

**Features:**
- Automatic rollback on failure
- Database backups before apply
- Multi-environment support
- Manual approval gates for production
- Slack/Discord notifications
- Migration plan preview

---

### Step 4: Create Phase Verification System

#### 4.1 Create Phase Verifier
**File:** `scripts/phases/verify-phase.ts`

**Purpose:** Check completion status for each phase

**Functionality:**

```typescript
interface VerificationResult {
  phaseId: number;
  phaseName: string;
  completed: boolean;
  completedTasks: string[];
  pendingTasks: string[];
  blockers: string[];
  score: number; // 0-100
}

class PhaseVerifier {
  async verifyPhase1(): Promise<VerificationResult> {
    // Check .vscode/*.json files exist and valid
    // Verify MCP servers configured
    // Check extensions installed
  }

  async verifyPhase2(): Promise<VerificationResult> {
    // Check .env.local exists
    // Validate environment variables
    // Check config files optimized
  }

  async verifyPhase3(): Promise<VerificationResult> {
    // Check database connection
    // Verify seeded data exists
    // Check image files downloaded
  }

  async verifyPhase4(): Promise<VerificationResult> {
    // Check profile pages exist
    // Verify comic components
    // Check bookmark functionality
  }

  async verifyPhase5(): Promise<VerificationResult> {
    // Verify all required scripts exist
    // Check script documentation
    // Validate script functionality
  }

  async verifyPhase6(): Promise<VerificationResult> {
    // Check GitHub Actions workflows
    // Verify Docker configs
    // Test deployment pipeline
  }

  async verifyPhase7(): Promise<VerificationResult> {
    // Check documentation completeness
    // Verify README comprehensive
    // Run linting checks
  }

  async verifyPhase8(): Promise<VerificationResult> {
    // Run test suite
    // Check coverage percentage
    // Verify performance benchmarks
  }

  async verifyPhase9(): Promise<VerificationResult> {
    // Check optional features status
    // Verify analytics integration
  }

  async generateReport(): Promise<PhaseReport> {
    // Generate comprehensive report
    // Include completion matrix
    // List actionable next steps
  }
}
```

**Output Formats:**
- Console table (colorized)
- JSON report (`.phases-progress.json`)
- Markdown report (`docs/phase-status.md`)
- HTML dashboard (optional)

---

### Step 5: Add PowerShell Wrapper Scripts

#### 5.1 Create Master PowerShell Runner
**File:** `scripts/phases/run-all-phases.ps1`

**Purpose:** Windows-native wrapper for phase execution

```powershell
param(
    [switch]$DryRun,
    [switch]$SkipCompleted,
    [switch]$Verbose,
    [int]$StartPhase = 1,
    [int]$EndPhase = 9
)

# Execute phase runner
node --loader tsx scripts/phases/phase-runner.ts run-all `
    $(if ($DryRun) { "--dry-run" }) `
    $(if ($SkipCompleted) { "--skip-completed" }) `
    $(if ($Verbose) { "--verbose" }) `
    --start-phase=$StartPhase `
    --end-phase=$EndPhase
```

#### 5.2 Create Individual Phase Runners
**Files:** `scripts/phases/run-phase-{1-9}.ps1`

Example for Phase 1:
```powershell
# run-phase-1.ps1
param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 1: VS Code Configuration" -ForegroundColor Cyan

node --loader tsx scripts/phases/phase-runner.ts run-phase 1 `
    $(if ($DryRun) { "--dry-run" }) `
    $(if ($Verbose) { "--verbose" })

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 1 completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Phase 1 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
```

**Create similar wrappers for phases 2-9**

#### 5.3 Create Verification PowerShell Script
**File:** `scripts/phases/verify-phases.ps1`

```powershell
param(
    [int]$Phase,
    [switch]$All,
    [ValidateSet('console', 'json', 'markdown', 'html')]
    [string]$Format = 'console'
)

if ($All) {
    node --loader tsx scripts/phases/verify-phase.ts verify-all --format=$Format
} elseif ($Phase) {
    node --loader tsx scripts/phases/verify-phase.ts verify-phase $Phase --format=$Format
} else {
    Write-Host "Usage: .\verify-phases.ps1 -Phase <1-9> or -All"
    exit 1
}
```

---

### Step 6: Integrate with Package Scripts

#### 6.1 Add Phase Commands to package.json

**Add to scripts section:**

```json
{
  "scripts": {
    // ... existing scripts ...

    // Phase Automation
    "phases:run": "node --loader tsx scripts/phases/phase-runner.ts run-all",
    "phases:run:1": "node --loader tsx scripts/phases/phase-runner.ts run-phase 1",
    "phases:run:2": "node --loader tsx scripts/phases/phase-runner.ts run-phase 2",
    "phases:run:3": "node --loader tsx scripts/phases/phase-runner.ts run-phase 3",
    "phases:run:4": "node --loader tsx scripts/phases/phase-runner.ts run-phase 4",
    "phases:run:5": "node --loader tsx scripts/phases/phase-runner.ts run-phase 5",
    "phases:run:6": "node --loader tsx scripts/phases/phase-runner.ts run-phase 6",
    "phases:run:7": "node --loader tsx scripts/phases/phase-runner.ts run-phase 7",
    "phases:run:8": "node --loader tsx scripts/phases/phase-runner.ts run-phase 8",
    "phases:run:9": "node --loader tsx scripts/phases/phase-runner.ts run-phase 9",

    // Phase Verification
    "phases:verify": "node --loader tsx scripts/phases/verify-phase.ts verify-all",
    "phases:verify:1": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 1",
    "phases:verify:2": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 2",
    "phases:verify:3": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 3",
    "phases:verify:4": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 4",
    "phases:verify:5": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 5",
    "phases:verify:6": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 6",
    "phases:verify:7": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 7",
    "phases:verify:8": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 8",
    "phases:verify:9": "node --loader tsx scripts/phases/verify-phase.ts verify-phase 9",

    // Phase Status & Reports
    "phases:status": "node --loader tsx scripts/phases/verify-phase.ts status",
    "phases:report": "node --loader tsx scripts/phases/verify-phase.ts generate-report",
    "phases:reset": "node --loader tsx scripts/phases/phase-runner.ts reset-progress",

    // Enhanced Scripts (Phase 5)
    "analyze:performance": "node --loader tsx scripts/analyze-performance-enhanced.ts",
    "generate:docs": "node --loader tsx scripts/generate-docs-complete.ts",
    "setup:tests": "pwsh scripts/setup-testing.ps1",
    "cleanup:enhanced": "pwsh scripts/cleanup-project-enhanced.ps1",

    // Quick Phase Commands
    "phase1": "pnpm phases:run:1",
    "phase2": "pnpm phases:run:2",
    "phase3": "pnpm phases:run:3",
    "phase4": "pnpm phases:run:4",
    "phase5": "pnpm phases:run:5",
    "phase6": "pnpm phases:run:6",
    "phase7": "pnpm phases:run:7",
    "phase8": "pnpm phases:run:8",
    "phase9": "pnpm phases:run:9"
  }
}
```

---

## Execution Strategy

### Recommended Approach: Sequential with Smart Skipping

**Why Sequential:**
1. **Dependency Chain** - Later phases depend on earlier ones (e.g., Phase 4 needs Phase 3 database)
2. **Resource Management** - Prevents conflicts (database locks, file access)
3. **Easier Debugging** - Clear failure points
4. **Progress Tracking** - Linear progression easier to visualize

**Smart Skipping Features:**
1. **`--skip-completed` flag** - Automatically skip phases marked complete in `.phases-progress.json`
2. **Verification before execution** - Run phase verification first, skip if 100% complete
3. **Resume capability** - Can restart from failed phase
4. **Force re-run option** - `--force` to re-run completed phases

**Parallel Options (Optional):**
- Independent tasks within a phase can run in parallel
- Example: Phase 5 could run performance analysis and documentation generation simultaneously
- Use Promise.all() for task-level parallelization, not phase-level

### Progress Persistence

**File:** `.phases-progress.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-22T10:30:00Z",
  "phases": {
    "1": {
      "status": "completed",
      "completedAt": "2026-01-22T09:15:00Z",
      "score": 100,
      "tasks": {
        "mcp-config": "completed",
        "extensions": "completed",
        "debug-config": "completed",
        "tasks-config": "completed",
        "settings": "completed"
      }
    },
    "2": {
      "status": "completed",
      "completedAt": "2026-01-22T09:45:00Z",
      "score": 100
    },
    "3": {
      "status": "completed",
      "completedAt": "2026-01-22T10:00:00Z",
      "score": 100
    },
    "4": {
      "status": "in-progress",
      "startedAt": "2026-01-22T10:15:00Z",
      "score": 65,
      "tasks": {
        "profile-pages": "pending",
        "comic-listing": "completed",
        "chapter-reader": "completed",
        "bookmark-management": "in-progress"
      }
    },
    "5": { "status": "pending" },
    "6": { "status": "pending" },
    "7": { "status": "pending" },
    "8": { "status": "pending" },
    "9": { "status": "pending" }
  }
}
```

**Persistence Strategy:**
- Update after each phase completes
- Atomic writes to prevent corruption
- Git-ignored to avoid conflicts
- Optional: Commit phase milestones as git tags

**Alternative: Git Tags**
```bash
git tag phase-1-complete
git tag phase-2-complete
# etc.
```

---

## Integration with Existing Scripts

**Strategy: Wrap, Don't Replace**

### Current Scripts (90+) Should Be:
1. **Wrapped** by phase scripts as building blocks
2. **Enhanced** with standardized logging and error handling
3. **Documented** with JSDoc and usage examples
4. **Kept** for standalone use (not forced into phase system)

### Example Integration:

**Phase 3 Database Seeding:**
```typescript
// scripts/phases/phase-3-database-seeding.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runPhase3(options: PhaseOptions): Promise<PhaseResult> {
  const tasks = [
    {
      name: 'Database Health Check',
      execute: async () => {
        // Wraps existing script
        await execAsync('node --loader tsx scripts/db-health-check.ts');
      }
    },
    {
      name: 'Push Schema',
      execute: async () => {
        await execAsync('pnpm db:push');
      }
    },
    {
      name: 'Dry Run Seed',
      execute: async () => {
        await execAsync('pnpm db:seed:dry-run');
      }
    },
    {
      name: 'Execute Seed',
      execute: async () => {
        await execAsync('pnpm db:seed');
      }
    }
  ];

  // Execute tasks with progress tracking
  for (const task of tasks) {
    console.log(`🔄 ${task.name}...`);
    await task.execute();
    console.log(`✅ ${task.name} completed`);
  }

  return { success: true, phase: 3 };
}
```

### Benefits of This Approach:
- ✅ **Speed** - No need to rewrite 90+ scripts
- ✅ **Stability** - Existing scripts are proven and working
- ✅ **Flexibility** - Scripts remain usable independently
- ✅ **Maintainability** - Single source of truth for logic
- ✅ **Incremental** - Can enhance scripts over time

---

## Implementation Timeline

### Week 1: Foundation (Steps 1-2)
**Days 1-2:** Create phase runner framework
- Phase runner CLI (`scripts/phases/phase-runner.ts`)
- Progress tracking system
- Basic verification

**Days 3-4:** Create individual phase scripts
- Phase 1-3 scripts (mostly wrappers)
- Phase 4-6 scripts (some new logic)
- Phase 7-9 scripts (mostly new)

**Days 5-7:** Implement missing critical scripts
- `setup-testing.ps1`
- `analyze-performance-enhanced.ts`
- `generate-docs-complete.ts`
- `cleanup-project-enhanced.ps1`

### Week 2: Integration & Testing (Steps 3-6)
**Days 8-9:** CI/CD workflow
- Create `migrations.yml`
- Test workflow locally
- Deploy to GitHub

**Days 10-11:** Phase verification system
- `verify-phase.ts` implementation
- Report generation
- Dashboard creation

**Days 12-13:** PowerShell wrappers
- Create all `.ps1` wrappers
- Test on Windows
- Integration testing

**Day 14:** Package.json integration
- Add all phase commands
- Documentation
- Quick start guide

### Week 3: Testing & Refinement
**Days 15-17:** End-to-end testing
- Run all phases sequentially
- Test skip-completed functionality
- Test error recovery

**Days 18-19:** Documentation
- Create phase automation guide
- Update README
- Create video walkthrough

**Days 20-21:** Final polish
- Code review
- Performance optimization
- Bug fixes

---

## Success Metrics

### Phase Completion Targets

| Metric | Target | Verification |
|--------|--------|--------------|
| Phase 1-3 Completion | 100% | Already complete, verify scripts work |
| Phase 4 Completion | 100% | Create missing pages, verify bookmark UI |
| Phase 5 Completion | 100% | All 5 scripts created and functional |
| Phase 6 Completion | 100% | Migrations workflow operational |
| Phase 7 Completion | 100% | Docs comprehensive, no lint errors |
| Phase 8 Test Coverage | 80%+ | Coverage report verification |
| Phase 9 Completion | Optional | Based on user preference |

### Automation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Phase Run Success Rate | 95%+ | Successful runs / total runs |
| Average Phase Duration | < 30min | Time tracking per phase |
| Error Recovery Rate | 100% | Successful rollbacks / errors |
| Documentation Coverage | 100% | All functions JSDoc documented |
| Script Reliability | 99%+ | Successful executions / total |

### Quality Metrics

| Metric | Target | Tool |
|--------|--------|------|
| TypeScript Errors | 0 | `pnpm type-check` |
| ESLint Errors | 0 | `pnpm lint` |
| Test Coverage | 80%+ | Vitest/Playwright |
| Performance Score | 90+ | Lighthouse |
| Security Vulnerabilities | 0 High/Critical | `pnpm audit` |

---

## Risk Mitigation

### Potential Risks & Solutions

**Risk 1: Phase Dependencies Break**
- **Mitigation:** Comprehensive verification before each phase
- **Solution:** Rollback capability and checkpoint saves

**Risk 2: Long-Running Phases Timeout**
- **Mitigation:** Progress persistence, resume capability
- **Solution:** Break phases into smaller tasks, save after each

**Risk 3: Existing Scripts Fail**
- **Mitigation:** Dry-run mode testing first
- **Solution:** Enhanced error messages, fallback options

**Risk 4: Environment Differences**
- **Mitigation:** Docker containers for consistency
- **Solution:** Environment validation before execution

**Risk 5: Data Loss During Cleanup**
- **Mitigation:** Backup before destructive operations
- **Solution:** Dry-run mode shows what will be deleted

**Risk 6: Parallel Execution Conflicts**
- **Mitigation:** Sequential execution by default
- **Solution:** Lock files for critical resources

---

## Next Steps After Implementation

### Immediate Actions
1. ✅ Run `pnpm phases:verify` to assess current state
2. ✅ Run `pnpm phases:run --skip-completed --dry-run` to preview
3. ✅ Execute `pnpm phases:run --skip-completed` to complete all phases
4. ✅ Review phase completion report
5. ✅ Address any remaining gaps

### Ongoing Maintenance
1. **Weekly:** Run `pnpm phases:verify` to ensure compliance
2. **Monthly:** Run performance analysis
3. **Per Release:** Run full phase validation
4. **Quarterly:** Update phase definitions based on new requirements

### Future Enhancements
1. **Web Dashboard:** Real-time phase progress visualization
2. **Slack/Discord Integration:** Phase completion notifications
3. **AI Assistance:** ChatGPT integration for error resolution
4. **Phase Templates:** Create new phases for custom workflows
5. **Multi-Project Support:** Run phases across multiple projects

---

## Questions for Further Refinement

### Execution Strategy
1. Should phases run **sequentially** (safer, recommended) or allow **parallel** execution?
2. Should we **force re-run** of completed phases, or **always skip** unless `--force` flag?
3. Should phase progress be stored in **JSON file** or **git tags**?

### Integration Approach
4. Should we **wrap existing scripts** (faster) or **refactor/consolidate** them (cleaner)?
5. Should phase scripts be **TypeScript** (consistent with project) or **PowerShell** (native Windows)?
6. Should we create a **web dashboard** for phase progress, or keep it **CLI-only**?

### Testing & Verification
7. What **coverage threshold** should trigger phase 8 failure? (80%, 85%, 90%?)
8. Should verification run **before** or **after** each phase execution?
9. Should failed phases **block** subsequent phases or **allow continuation**?

### Documentation & Reporting
10. Should phase reports be **committed to git** or **git-ignored**?
11. What **report formats** are most useful? (Console, JSON, Markdown, HTML, All?)
12. Should we generate **video tutorials** for phase execution?

### Optional Features
13. Should we implement **phase 9** (optional enhancements) or **defer** for later?
14. Should we add **internationalization** in phase 9 or as separate initiative?
15. Should phase automation support **custom user-defined phases**?

---

## Recommendations

Based on the research and plan, here are my recommendations:

### High Priority (Do First)
1. ✅ **Create Phase Runner Framework** (Step 1) - Foundation for everything
2. ✅ **Implement Missing Scripts** (Step 2) - Fills critical gaps
3. ✅ **Add Migrations Workflow** (Step 3) - Important for CI/CD
4. ✅ **Integrate Package Scripts** (Step 6) - Makes everything accessible

### Medium Priority (Do Second)
5. ✅ **Phase Verification System** (Step 4) - Quality assurance
6. ✅ **PowerShell Wrappers** (Step 5) - Windows native experience

### Low Priority (Nice to Have)
7. ⚠️ **Web Dashboard** - Visual progress tracking
8. ⚠️ **Notification Integration** - Slack/Discord alerts
9. ⚠️ **Phase 9 Implementation** - Optional enhancements

### Execution Approach
- **Sequential execution** with `--skip-completed` flag
- **JSON-based progress** with optional git tag milestones
- **Wrap existing scripts** rather than rewrite
- **TypeScript phase scripts** for consistency
- **PowerShell wrappers** for Windows native feel
- **80% coverage threshold** for phase 8
- **Verification after** each phase execution
- **Failed phases block** subsequent phases (safety first)

---

## Conclusion

This comprehensive plan will transform the ComicWise project from **75% complete** to **100% optimized** by:

1. Creating systematic **phase-based automation** that orchestrates 90+ existing scripts
2. Filling **critical gaps** in testing, performance analysis, documentation, and cleanup
3. Adding **missing CI/CD workflow** for database migrations
4. Providing **clear verification** and **progress tracking** for all 9 phases
5. Ensuring **quality metrics** meet or exceed targets (80%+ coverage, 0 errors, 90+ performance)

The approach is **pragmatic** (wrapping existing scripts), **safe** (dry-run mode, rollback capability), and **efficient** (leveraging proven tools rather than rebuilding).

Upon implementation, you'll be able to:
- Run `pnpm phases:run` to complete all phases automatically
- Run `pnpm phases:verify` to check current status
- Run `pnpm phase5` to execute specific phases
- Track progress with detailed reports
- Resume from failures without losing progress

**Total estimated implementation time:** 3 weeks
**Total estimated value:** Complete project optimization, 100% phase compliance, production-ready automation

---

**Ready to proceed with implementation? Let's start with Step 1: Phase Runner Framework.**
