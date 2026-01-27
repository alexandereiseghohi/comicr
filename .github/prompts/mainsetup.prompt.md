---
title: ComicWise - Main Setup Prompt
version: 1.0.0
updated: 2026-01-22
platforms: Windows
packageManager: pnpm
framework: Next.js 16
database: PostgreSQL (Drizzle ORM)
cache: Redis (Upstash)
authentication: NextAuth.js v5
ui: Tailwind CSS 4, shadcn/ui
---

# 🚀 ComicWise - Main Setup & Configuration Prompt

> **Complete GitHub Copilot prompt for setting up and configuring ComicWise - a modern web comic platform**

---

## 📋 Prerequisites & Context

**IMPORTANT: Read and understand the complete project before starting:**

```
Project Structure:
├── src/                          # Source code
│   ├── app/                      # Next.js app directory (pages, layouts, routes)
│   ├── components/               # React components (organized by feature)
│   ├── database/                 # Drizzle ORM (schema, migrations, seed)
│   ├── dal/                      # Data Access Layer (queries, mutations)
│   ├── lib/                      # Libraries (utilities, actions, auth, env)
│   └── styles/                   # Global styles
├── scripts/                       # Automation scripts (100+ total)
├── .github/                       # GitHub configuration
│   ├── workflows/                # GitHub Actions CI/CD
│   └── prompts/                  # AI Assistant prompts
├── .vscode/                       # VS Code configuration
├── public/                        # Static assets
├── docs/                          # Documentation
├── package.json                   # Dependencies and scripts
└── [config files]                 # tsconfig, next.config, eslint, prettier, etc.

Tech Stack:
- Framework: Next.js 16 (App Router)
- Language: TypeScript (strict mode)
- Database: PostgreSQL (Drizzle ORM)
- Cache: Redis (Upstash)
- Auth: NextAuth.js v5
- UI: Tailwind CSS 4, shadcn/ui
- Validation: Zod schemas
- Forms: React Hook Form
- Package Manager: pnpm

System Requirements:
- Node.js: 18.x or higher
- PostgreSQL: 15.x or higher
- Redis: Latest (Upstash or local)
- Operating System: Windows (PowerShell), Linux, macOS
```

---

## ✅ Permission Request

I request the following permissions to complete the setup tasks:

1. **File System Access**
   - Create, read, modify, and delete files
   - Create, rename, and delete directories
   - Copy and backup existing files
   - Write to configuration files

2. **Code Execution**
   - Run pnpm commands (install, build, test, lint)
   - Execute TypeScript/JavaScript files
   - Run PowerShell scripts
   - Execute shell scripts

3. **Database Operations**
   - Run database migrations
   - Seed database with initial data
   - Query database for validation
   - Create database backups

4. **Environment Variables**
   - Read from .env.local, .env.example
   - Validate environment variables
   - Generate secure secrets

5. **External Tools**
   - Use VS Code CLI for extension management
   - Access GitHub Actions configuration
   - Docker operations (if needed)

**Do you grant these permissions? Please confirm before proceeding.**

---

## 🎯 Core Principles (Apply to All Tasks)

1. **Next.js Best Practices**
   - Use App Router (src/app) for all routes
   - Server components by default, 'use client' only when needed
   - Proper loading and error boundaries
   - SEO optimization (metadata)
   - Image optimization (next/image)

2. **DRY Principles (Do Not Repeat Yourself)**
   - Reuse components, functions, types, schemas
   - Extract common logic into utilities
   - Avoid code duplication
   - Single source of truth for data

3. **Performance Optimization**
   - Code splitting and dynamic imports
   - Lazy loading components
   - Image optimization
   - Database query optimization
   - Redis caching strategy

4. **Type Safety**
   - No `any` types - use specific or generic types
   - Strict TypeScript settings
   - Type-safe environment variables
   - Proper error type definitions

5. **Error Handling**
   - Try-catch blocks for async operations
   - Proper error messages to users
   - Error logging and monitoring
   - Graceful fallbacks

6. **Security Best Practices**
   - No secrets in code or git
   - Password hashing with bcryptjs
   - Input validation with Zod
   - CSRF protection
   - SQL injection prevention

7. **Comprehensive Logging**
   - Clear, concise log messages
   - Emoji-based severity indicators (✅ ❌ ⚠️ 🔄 ℹ️)
   - Operation context and timestamps
   - Progress tracking for long-running tasks

8. **File Handling Protocol**
   - If file exists: backup to `.backup` before modifications
   - If file doesn't exist: create with optimized code
   - Always update all usages across project
   - Validate changes don't break existing functionality

---

## 🔧 SETUP TASK 1: VS Code Configuration

### 1.1 Create/Optimize `.vscode/mcp.json`

**Purpose:** Configure MCP (Model Context Protocol) servers for development

**Configuration includes:**
- TypeScript/JavaScript Language Server
- Python Language Server (for scripts)
- SQL Language Server (PostgreSQL)
- YAML Language Server
- JSON Schema Validation

**Action:**
- If exists: backup to `.vscode/mcp.json.backup`
- Create optimized configuration with all servers
- Include stdio-based transports for each server
- Validate server configurations

**Deliverable:**
- Optimized `.vscode/mcp.json`
- Verification script to test MCP servers

---

### 1.2 Create/Optimize `.vscode/extensions.json`

**Purpose:** Define recommended extensions for development

**Include extensions for:**
- Next.js development (Next.js support, React snippets)
- TypeScript support (TypeScript Vue Plugin, Pylance)
- Database tools (PostgreSQL client, SQLite viewer)
- Redis tools (Redis Insights)
- Code quality (ESLint, Prettier, Better Comments)
- CSS/Tailwind (Tailwind CSS IntelliSense)
- Git integration (GitLens)
- Testing (Vitest Explorer, Playwright Test)
- Documentation (Markdown Preview, Better Markdown)
- AI/Productivity (GitHub Copilot, Thunder Client)

**Action:**
- If exists: backup to `.vscode/extensions.json.backup`
- Create optimized extension list
- Create installation script using VS Code CLI
- Test extension installation

**Deliverable:**
- Optimized `.vscode/extensions.json`
- Installation script (`scripts/install-extensions.ps1`)

---

### 1.3 Create/Optimize `.vscode/launch.json`

**Purpose:** Configure debugging for development

**Include configurations for:**
- **Next.js (Client)** - Debug React components in browser
- **Next.js (Server)** - Debug API routes and server actions
- **Node.js** - Debug scripts and utilities
- **Chrome** - Debug client-side code
- **Playwright** - Debug E2E tests

**Action:**
- If exists: backup to `.vscode/launch.json.backup`
- Create comprehensive debug configurations
- Ensure all use proper port mappings
- Include sourceMaps configuration

**Deliverable:**
- Optimized `.vscode/launch.json`

---

### 1.4 Create/Optimize `.vscode/tasks.json`

**Purpose:** Automate development workflows

**Include tasks for:**
- **Development** - `pnpm dev`
- **Build** - `pnpm build`
- **Type Check** - `pnpm type-check`
- **Lint** - `pnpm lint:fix`
- **Test** - `pnpm test`
- **Database Push** - `pnpm db:push`
- **Seed Database** - `pnpm db:seed`
- **Validate** - `pnpm validate`

**Action:**
- If exists: backup to `.vscode/tasks.json.backup`
- Create problem matchers for TypeScript, ESLint
- Group related tasks
- Include watch mode tasks

**Deliverable:**
- Optimized `.vscode/tasks.json`

---

### 1.5 Create/Optimize `.vscode/settings.json`

**Purpose:** Configure editor preferences for optimal development

**Settings for:**
- **Editor** - Tab size (2), format on save, ruler at 120 chars
- **TypeScript** - Strict mode, auto-imports, organized imports
- **ESLint** - Auto-fix on save, validate TypeScript
- **Prettier** - Default formatter, format on save
- **Files** - Exclude node_modules, .next, .env
- **Search** - Exclude common directories
- **Git** - Auto-fetch, auto-refresh
- **Extensions** - Per-extension settings
- **Tailwind** - IntelliSense configuration

**Action:**
- If exists: backup to `.vscode/settings.json.backup`
- Create comprehensive settings
- Ensure consistency with project configs
- Test all settings with extensions

**Deliverable:**
- Optimized `.vscode/settings.json`

---

## 🔧 SETUP TASK 2: Configuration Files Optimization

### 2.1 Validate & Optimize Configuration Files

**Files to check/optimize:**

1. **`next.config.ts`**
   - Image optimization (domains, formats, sizes)
   - Bundle analysis configuration
   - Redirects and rewrites
   - Security headers
   - Environment variables exposure

2. **`nextSitemap.config.ts`**
   - Sitemap generation
   - Dynamic routes handling
   - robots.txt configuration

3. **`tsconfig.json`**
   - Strict mode enabled
   - Path aliases configured
   - Module resolution
   - Target ES version
   - JSX configuration

4. **`eslint.config.ts`**
   - React/Next.js rules
   - TypeScript rules
   - Import/export rules
   - Naming conventions

5. **`postcss.config.mjs`**
   - Tailwind CSS plugin
   - CSS optimization
   - PostCSS plugins

6. **`.prettierrc.ts`**
   - Code formatting rules
   - Line width (120)
   - Tab width (2)
   - Plugin configurations

7. **`.gitignore`**
   - Dependencies (node_modules)
   - Build artifacts (.next)
   - Environment files (.env.local)
   - IDE files (.vscode, .idea)

8. **`.dockerignore`**
   - Exclude unnecessary files from Docker builds
   - Keep only required files

9. **`.prettierignore`**
   - Exclude build outputs
   - Exclude dependencies
   - Exclude generated files

**Action:**
- Backup all existing config files to `.backup`
- Validate each configuration file
- Update for Next.js 16 best practices
- Verify no conflicts between tools
- Test with `pnpm validate`

**Deliverable:**
- All optimized configuration files

---

## 🔧 SETUP TASK 3: Environment Variables & Configuration

### 3.1 Create/Optimize `.env.local`

**Required environment variables:**

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise
DATABASE_DIRECT_URL=postgresql://user:password@localhost:5432/comicwise

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_auth_token

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Custom Application
CUSTOM_PASSWORD=SecurePassword123!
NEXT_PUBLIC_UPLOAD_DIR=/uploads

# Sentry (Error Tracking)
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Image CDN (Optional)
NEXT_PUBLIC_IMAGE_CDN=https://your-cdn.com

# AI Features (Optional)
OPENAI_API_KEY=your-api-key
HUGGINGFACE_API_KEY=your-api-key

# Development
NODE_ENV=development
```

**Action:**
- If exists: backup to `.env.local.backup`
- Create `.env.local` with placeholder values
- Validate all required variables are present
- Ensure no secrets are exposed
- Provide instructions for each variable

**Deliverable:**
- Optimized `.env.local`
- `.env.example` template for documentation

---

### 3.2 Create/Validate `src/lib/env.ts`

**Purpose:** Type-safe environment variable access with runtime validation

**Include:**
- Zod schema for all environment variables
- Type-safe exported constants
- Runtime validation on app startup
- Clear error messages for missing variables
- Support for optional variables

**Action:**
- If exists: backup to `src/lib/env.ts.backup`
- Create comprehensive environment schema
- Validate at application startup
- Export typed environment object
- Update all usages across project

**Deliverable:**
- Optimized `src/lib/env.ts`

---

### 3.3 Create/Validate `appConfig.ts`

**Purpose:** Centralized application configuration

**Include:**
- App name, version, description
- Feature flags
- API endpoints
- Cache configuration
- Security settings
- Third-party service configuration
- Use `src/lib/env.ts` for all variables

**Action:**
- If exists: backup to `appConfig.ts.backup`
- Create centralized config object
- Use environment variables from `src/lib/env.ts`
- Export typed configuration
- Update all usages across project to use appConfig

**Deliverable:**
- Optimized `appConfig.ts`
- Updated all references across project

---

## 🔧 SETUP TASK 4: Database Seeding System

### 4.1 Backup & Understand Existing Seeding System

**Action:**
- Backup `src/database/seed` to `src/database/seed.backup.{timestamp}`
- Backup `src/app/api/seed` to `src/app/api/seed.backup.{timestamp}`
- Read and understand all JSON data files:
  - `users.json`
  - `comics.json`, `comicsdata1.json`, `comicsdata2.json`
  - `chapters.json`, `chaptersdata1.json`, `chaptersdata2.json`

**Deliverable:**
- Backup directories created
- Analysis document of data structure

---

### 4.2 Create Seeding Helpers (`src/database/seed/helpers/`)

**Create the following helper files:**

**1. `validation-schemas.ts`**
- Zod schemas for all entities
- Field validation rules
- Type exports for TypeScript

**2. `image-downloader.ts`**
- Download images from URLs
- Check filesystem before downloading
- Save with original filename and extension
- Retry logic for failed downloads
- Hash-based deduplication

**3. `password-hasher.ts`**
- Hash passwords with bcryptjs
- Use `CUSTOM_PASSWORD` from environment
- Salt rounds: 10

**4. `seed-logger.ts`**
- Structured logging with emojis
- Progress indicators
- Operation tracking (created/updated/skipped)
- Error context

**5. `batch-processor.ts`**
- Batch processing with configurable size
- Chunk array utility
- Progress callbacks

**6. `image-deduplicator.ts`**
- Track downloaded images (session cache)
- Check filesystem for existing files
- Prevent duplicate downloads
- Hash-based lookup

**7. `validate-and-insert.ts`**
- Zod validation before insert
- Upsert with `onConflictDoUpdate`
- Transaction support
- Error recovery

**Action:**
- Create all helper files with comprehensive JSDoc
- Implement error handling
- Add progress logging
- Test each helper independently

**Deliverable:**
- All helper files created and tested

---

### 4.3 Create Entity Seeders (`src/database/seed/seeders/`)

**Create the following seeder files:**

**1. `user-seeder-v4.ts`**
- Load from `users.json`
- Validate with UserSeedSchema
- Hash passwords using `CUSTOM_PASSWORD`
- Upsert by email (unique constraint)
- Default avatar to `/public/shadcn.jpg`

**2. `comic-seeder-v4.ts`**
- Load from `comics.json`, `comicsdata1.json`, `comicsdata2.json`
- Validate with ComicSeedSchema
- Download covers to `public/comics/covers/{slug}/`
- Fallback to `/public/placeholder-comic.jpg`
- Upsert by title or slug
- Handle genres, authors, artists, types

**3. `chapter-seeder-v4.ts`**
- Load from `chapters.json`, `chaptersdata1.json`, `chaptersdata2.json`
- Validate with ChapterSeedSchema
- Download images to `public/comics/chapters/{comic.slug}/{chapter.slug}/`
- Upsert by comic_id + chapter_number
- Organize images by page order

**4. Genre/Author/Artist/Type Seeders**
- Create seeders for lookup entities
- Simple upsert by name
- Handle duplicates

**Action:**
- Create all seeders with error handling
- Implement progress tracking
- Add comprehensive logging
- Support dry-run mode

**Deliverable:**
- All seeder files created and tested

---

### 4.4 Create Main Orchestrator

**File:** `src/database/seed/seed-runner-v4enhanced.ts`

**Purpose:** Orchestrate all seeders with:
- Sequential execution (proper foreign key handling)
- Progress tracking
- Error recovery
- Transaction support
- Dry-run mode (validation only)
- Comprehensive logging

**Features:**
- Load all JSON files
- Validate all data upfront
- Execute seeders in order:
  1. Users
  2. Genres, Types, Authors, Artists
  3. Comics
  4. Chapters
  5. (Add other entities as needed)
- Track created/updated/skipped counts
- Generate summary report

**Action:**
- Create main orchestrator with all features
- Implement error handling and recovery
- Add progress callbacks
- Support CLI flags (--dry-run, --verbose)

**Deliverable:**
- Optimized `seed-runner-v4enhanced.ts`

---

### 4.5 Update API Route & Package Scripts

**Files to update:**

1. **`src/app/api/seed/route.ts`**
   - Call `seed-runner-v4enhanced`
   - Support query params (dryRun, verbose)
   - Return structured response
   - Include progress tracking

2. **`package.json` scripts**
   - `pnpm db:seed` - Full seed
   - `pnpm db:seed:dry-run` - Validation only
   - `pnpm db:seed:verbose` - With detailed logs
   - `pnpm db:seed:users` - Seed users only
   - `pnpm db:seed:comics` - Seed comics only
   - `pnpm db:seed:chapters` - Seed chapters only

**Action:**
- Update API route to use new orchestrator
- Add package.json scripts
- Test with `pnpm db:seed:dry-run`
- Fix any validation errors

**Deliverable:**
- Updated API route
- Working package.json scripts

---

## 🔧 SETUP TASK 5: Validate & Test Configuration

### 5.1 Run Type Checking

**Command:** `pnpm type-check`

**Expected:** No TypeScript errors

**If errors occur:**
- Review error messages carefully
- Fix type-related issues
- Update type definitions as needed
- Rerun type-check

**Deliverable:**
- ✅ No TypeScript errors

---

### 5.2 Run Linting

**Commands:**
- `pnpm lint` - Check for errors
- `pnpm lint:fix` - Auto-fix where possible
- Manually fix remaining issues

**Expected:** No ESLint errors or warnings

**Deliverable:**
- ✅ No linting errors

---

### 5.3 Validate Environment

**Command:** `pnpm validate`

**This runs:**
- ESLint checks
- TypeScript type checking
- Other project-specific validation

**Expected:** All validations pass

**Deliverable:**
- ✅ All validations pass

---

### 5.4 Test Database Seeding

**Step 1:** Run dry-run (validation only)
```bash
pnpm db:seed:dry-run
```

**Expected:**
- ✅ All data validates successfully
- ✅ No database changes
- ✅ Report shows what would be inserted/updated

**Step 2:** If dry-run succeeds, run full seed
```bash
pnpm db:seed
```

**Expected:**
- ✅ All data inserted/updated successfully
- ✅ No constraint violations
- ✅ All images downloaded
- ✅ Summary report generated

**If errors occur:**
- Review error messages
- Check data in JSON files
- Fix validation issues
- Rerun seeding

**Deliverable:**
- ✅ Database successfully seeded
- ✅ All images downloaded
- ✅ Summary report generated

---

## 📝 Documentation & Logging

### All Created/Modified Files Should Include:

1. **File Header Comment**
   ```typescript
   /**
    * @file descriptive-filename.ts
    * @description What this file does and why
    * @author ComicWise Team
    * @date 2026-01-22
    */
   ```

2. **JSDoc for Exports**
   ```typescript
   /**
    * Describe what the function/class/type does
    * @param param1 - Description of param1
    * @param param2 - Description of param2
    * @returns Description of return value
    * @throws Error conditions that might be thrown
    * @example
    * // How to use this
    * const result = myFunction(param1, param2);
    */
   ```

3. **Complex Logic Comments**
   ```typescript
   // Brief comment explaining why this is needed
   // Additional context if necessary
   const complexLogic = doSomething();
   ```

4. **Logging**
   ```typescript
   console.log('✅ Operation completed: description');
   console.warn('⚠️  Warning message: details');
   console.error('❌ Error message: details');
   ```

---

## 🎯 Success Criteria

After completing all setup tasks, verify:

- ✅ All `.vscode/` configuration files created/optimized
- ✅ All configuration files (`next.config`, `tsconfig`, etc.) optimized
- ✅ `.env.local` created with all required variables
- ✅ `src/lib/env.ts` validates all environment variables
- ✅ `appConfig.ts` centralizes configuration
- ✅ Database seeding system complete with helpers and seeders
- ✅ `pnpm type-check` passes (0 errors)
- ✅ `pnpm lint` passes (0 errors)
- ✅ `pnpm validate` passes (0 errors)
- ✅ `pnpm db:seed:dry-run` succeeds
- ✅ `pnpm db:seed` succeeds
- ✅ Database contains all seeded data
- ✅ All images downloaded successfully

---

## 📋 Next Steps

After completing this setup prompt:

1. Review all created files
2. Run `pnpm validate` to ensure everything is correct
3. Proceed with `maintasks.prompt.md` for remaining implementation

---

**This is the Main Setup Prompt for ComicWise. After completing all tasks above, proceed with the Maintasks Prompt for additional implementation.**

