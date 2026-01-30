# ComicWise - Comprehensive Setup & Optimization Prompts

> **Version**: 2.0.0
> **Updated**: 2025-12-29
> **Platforms**: Windows, Linux, macOS
> **Package Manager**: pnpm
> **Framework**: Next.js 16

---

## 🎯 Core Principles

Apply these principles to ALL tasks:

- **DRY (Don't Repeat Yourself)**: Maximize code reusability
- **Performance First**: Optimize for production from the start
- **Type Safety**: Comprehensive TypeScript with no `any` types
- **Comprehensive Logging**: Clear, concise logs for all operations
- **Error Handling**: Proper validation and error recovery
- **Documentation**: JSDoc for all functions, interfaces, types, modules, classes, components
- **Security**: Follow best practices for sensitive data protection
- **Next.js Best Practices**: Align with latest Next.js 16 patterns
- **PowerShell Syntax**: Use PowerShell for all Windows operations

---

## 🔧 Universal Task Template

For each configuration/implementation task:

```prompt
@workspace Create or modify {FILE_PATH} with optimized configurations for:
- Project: ComicWise (Next.js 16)
- Technologies: {TECH_STACK}
- Environment: Development & Production

Requirements:
1. If file exists, backup to {FILE_PATH}.backup
2. Implement Next.js 16 best practices
3. Optimize for performance and scalability
4. Add comprehensive JSDoc documentation
5. Ensure type safety (no `any` types)
6. Validate configuration works in both dev/prod
7. Update all dependent files across the project
8. Log all changes to .github/prompts/main.prompt.md

Apply these settings: {SPECIFIC_SETTINGS}
```

---

## 📋 Task Groups

### Group 1: VS Code Environment Setup

#### Task 1.1: MCP Server Configuration

```prompt
@workspace Create/modify .vscode/mcp.json for ComicWise with:

MCP Server Configurations:
- Next.js development server
- TypeScript language server
- PostgreSQL connection
- Redis connection
- AI/ML model servers

Requirements:
- Auto-start on workspace open
- Health check endpoints
- Fallback configurations
- Environment-specific settings

Create verification script at scripts/verify-mcp.ps1:
- Check all MCP servers are running
- Validate connections
- Report status with detailed logs
- Auto-restart failed servers using VS Code CLI
```

#### Task 1.2: Extension Recommendations

```prompt
@workspace Create/modify .vscode/extensions.json with recommended extensions:

Categories:
1. Next.js & React Development
2. TypeScript & JavaScript
3. Database Tools (PostgreSQL)
4. Redis Management
5. AI/ML Development
6. Code Quality & Formatting
7. Testing & Debugging
8. Git & Version Control

Create installation script at scripts/install-vscode-extensions.ps1:
- Read extensions.json
- Check installed vs recommended
- Install missing extensions via VS Code CLI
- Log installation status
```

#### Task 1.3: Debug Configurations

```prompt
@workspace Create/modify .vscode/launch.json with debug configurations:

Debug Targets:
- Next.js Development Server (port 3000)
- Server Components & Actions
- API Routes
- PostgreSQL queries
- Redis operations
- AI model inference
- Test suites (Vitest, Playwright)

Include:
- Source maps configuration
- Environment variable injection
- Breakpoint settings
- Console output formatting
```

#### Task 1.4: Build & Deploy Tasks

```prompt
@workspace Create/modify .vscode/tasks.json with automated tasks:

Task Categories:
1. Build: dev, build, build:analyze
2. Test: test:unit, test:e2e, test:coverage
3. Database: db:push, db:seed, db:migrate, db:studio
4. Quality: lint, format, type-check
5. Deploy: deploy:staging, deploy:prod
6. Maintenance: cleanup, optimize-imports

Requirements:
- Problem matchers for error detection
- Background tasks for watchers
- Dependency chains (build → test → deploy)
- Environment variable support
```

#### Task 1.5: Workspace Settings

```prompt
@workspace Create/modify .vscode/settings.json optimized for:

ComicWise Stack:
- Next.js 16 (App Router, Turbopack)
- TypeScript (strict mode)
- PostgreSQL + Drizzle ORM
- Redis for caching
- AI/ML features

Settings Groups:
1. Editor: formatting, suggestions, IntelliSense
2. TypeScript: strict checks, paths, imports
3. Files: associations, exclusions, watchers
4. Extensions: ESLint, Prettier, Tailwind CSS
5. Terminal: PowerShell configuration
6. Debug: source maps, breakpoints
7. Git: commit templates, diff settings

Ensure all extensions are properly configured
```

---

### Group 2: Next.js Configuration Files

#### Reusable Config Pattern

```prompt
@workspace Create/modify {CONFIG_FILE} with:

1. Backup existing to {CONFIG_FILE}.backup
2. Implement configuration for:
   {CONFIGURATION_DETAILS}
3. Optimize for:
   - Development experience
   - Production performance
   - Type safety
   - Bundle size
4. Add inline documentation
5. Validate with: pnpm build && pnpm type-check
6. Update dependent files
```

**Apply to:**

- **Task 2.1**: `next.config.ts` - Turbopack, image optimization, bundle analysis, experimental features
- **Task 2.2**: `nextSitemap.config.ts` - Dynamic sitemap generation, SEO optimization
- **Task 2.3**: `package.json` - Scripts optimization, dependency management, engines
- **Task 2.4**: `tsconfig.json` - Strict mode, path aliases, compilation targets
- **Task 2.5**: `.prettierrc.ts` - Formatting rules, plugins, ignore patterns
- **Task 2.6**: `postcss.config.mjs` - Tailwind CSS, autoprefixer, plugins
- **Task 2.7**: `eslint.config.ts` - Next.js rules, TypeScript, import sorting
- **Task 2.8**: `.gitignore` - Build outputs, dependencies, env files, logs
- **Task 2.9**: `.dockerignore` - Exclude unnecessary files from Docker context
- **Task 2.10**: `.prettierignore` - Generated files, build outputs

---

### Group 3: Environment & Application Config

#### Task 3.1: Environment Variables

```prompt
@workspace Setup environment variable system:

Files to create/modify:
1. .env.local - Development environment variables
2. src/lib/env.ts - Runtime validation with zod
3. appConfig.ts - Application configuration

Environment Variables:
- Database: DATABASE_URL, DIRECT_URL
- Redis: REDIS_URL
- Auth: NEXTAUTH_SECRET, NEXTAUTH_URL
- AI: OPENAI_API_KEY, AI_MODEL
- Seeding: CUSTOM_PASSWORD (bcrypt hashed)
- Images: IMAGE_BASE_URL, UPLOAD_DIR

Requirements:
- Type-safe access via src/lib/env.ts
- Validation on app start
- Separate dev/prod configs
- Security: Never commit .env.local
- Update all usages across project
```

---

### Group 4: Database Seeding System

#### Task 4.1: Enhanced Seeding Architecture

```prompt
@workspace Optimize database seeding system at src/database/seed/ and src/app/api/seed/:

Data Sources:
- users.json (user accounts)
- comics.json, comicsdata1.json, comicsdata2.json (comic metadata)
- chapters.json, chaptersdata1.json, chaptersdata2.json (chapter data)

Core Features:
1. **Performance**:
   - Batch inserts (100 records/batch)
   - Parallel processing where possible
   - Connection pooling
   - Progress tracking with logs

2. **Data Integrity**:
   - Zod schema validation before insert
   - onConflictDoUpdate for upserts
   - Foreign key validation
   - Transaction rollback on error

3. **Image Management**:
   - Check if file exists (filesystem & DB) before download
   - Save comic covers: public/comics/covers/${comic.slug}/
   - Save chapter images: public/comics/chapters/${comic.slug}/${chapter.slug}/
   - Preserve original filenames and extensions
   - Fallbacks: ./public/placeholder-comic.jpg (comics), ./public/shadcn.jpg (users)

4. **User Data**:
   - Hash passwords with bcryptjs
   - Use CUSTOM_PASSWORD env variable
   - Validate email uniqueness

5. **Logging**:
   - Operation start/end
   - Records processed count
   - Success/failure stats
   - Error details with context

Helper Functions to Create (src/database/seed/helpers/):
- validateAndInsert.ts - Zod validation + upsert logic
- imageDownloader.ts - Smart image downloading
- batchProcessor.ts - Batch operation handler
- seedLogger.ts - Comprehensive logging
- seedOrchestrator.ts - Main coordination

Update all usages across project
```

---

### Group 5: Page Implementations

#### Reusable Page Pattern

```prompt
@workspace Create/modify pages at {PAGE_PATH}:

Architecture:
- Server Components by default
- Client Components only when needed (interactivity)
- React Server Actions for mutations
- Zod schemas for validation
- React Hook Form for client forms
- Optimistic UI updates
- Error boundaries
- Loading states
- SEO metadata

Components to Use/Create:
{SPECIFIC_COMPONENTS}

Data Fetching:
- Server-side queries via src/database/queries/
- Caching strategy: {CACHE_STRATEGY}
- Revalidation: {REVALIDATION_STRATEGY}

Forms (if applicable):
- Generic form component with type safety
- Zod schema validation
- React Hook Form integration
- Server action handlers
- Error handling & display
- Success feedback
```

**Apply to:**

- **Task 5.1**: `src/app/(root)/` - Home, browse, search (3D Cards, carousels, accordions)
- **Task 5.2**: `src/app/(auth)/` - Login, register, reset password (generic auth form)
- **Task 5.3**: `src/app/admin/` - Admin dashboard, CRUD for all tables (generic data table)
- **Task 5.4**: `src/app/(root)/bookmarks/` - User bookmarks listing
- **Task 5.5**: `src/app/(root)/profile/` - User profile, settings
- **Task 5.6**: `src/app/(root)/comics/` - Comic listing (3D Cards)
- **Task 5.7**: `src/app/(root)/comics/[slug]/` - Comic details (add/remove bookmarks)
- **Task 5.8**: `src/app/(root)/comics/[slug]/[chapterNumber]/` - Chapter reader (image gallery)

---

### Group 6: State Management

#### Task 6.1: Zustand Stores

```prompt
@workspace Implement state management at src/stores/:

Recommended Stores:
1. authStore - User session, authentication state
2. comicsStore - Comics data, filters, sorting
3. bookmarksStore - User bookmarks, sync
4. readerStore - Reading progress, preferences
5. uiStore - Theme, sidebar, modals
6. notificationsStore - Toast notifications

Store Pattern:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface {StoreName}State {
  // State shape
}

interface {StoreName}Actions {
  // Actions
}

export const use{StoreName} = create<{StoreName}State & {StoreName}Actions>()(
  persist(
    (set, get) => ({
      // Implementation
    }),
    { name: '{store-name}' }
  )
);
```

Requirements:
- TypeScript strict mode
- Persist to localStorage where needed
- Optimistic updates
- Error handling
- DevTools integration
```

---

### Group 7: Database Layer Refactoring

#### Task 7.1: Queries & Mutations Separation

```prompt
@workspace Refactor database operations:

Current State:
- Mixed queries/mutations in various files
- Direct db imports throughout codebase

Target State:
- All SELECT queries in src/database/queries/
- All INSERT/UPDATE/DELETE in src/database/mutations/
- Organized by domain (users, comics, chapters, bookmarks, etc.)

Migration Process:
1. Identify all db.ts usage with AST parsing
2. Extract to appropriate query/mutation files
3. Create index exports for clean imports
4. Update all imports across project
5. Delete old inline queries
6. Add JSDoc documentation
7. Add TypeScript return types

Example Structure:
src/database/queries/
  ├── users.ts
  ├── comics.ts
  ├── chapters.ts
  ├── bookmarks.ts
  └── index.ts

src/database/mutations/
  ├── users.ts
  ├── comics.ts
  ├── chapters.ts
  ├── bookmarks.ts
  └── index.ts
```

---

### Group 8: Project Structure & Tooling

#### Task 8.1: Folder Structure Optimization

```prompt
@workspace Analyze and optimize folder structure:

Use AST-based codemods with jscodeshift or ts-morph for refactoring.

Organize by:
1. Feature domains (comics, chapters, bookmarks, users)
2. Layer separation (queries, mutations, components, actions)
3. Shared vs domain-specific code

Create/Update/Delete as needed:
- Move misplaced files to correct domains
- Consolidate duplicate functionality
- Remove unused files and empty folders
- Update all import paths
- Verify no broken imports

Log all structural changes
```

#### Task 8.2: CLI Scripts Enhancement

```prompt
@workspace Transform scripts/ into complete CLI tool:

CLI Capabilities:
- Development: start, dev, build, analyze
- Database: migrate, push, seed, studio, reset
- Testing: unit, e2e, coverage, ui
- Quality: lint, format, type-check, validate
- Deployment: deploy (staging/prod), preview
- Maintenance: cleanup, optimize, analyze-bundle
- Scaffolding: component, page, api-route, store

Implementation:
- Use Commander.js or Yargs for CLI
- Modular command structure
- Progress indicators (ora/chalk)
- Interactive prompts (inquirer)
- Comprehensive help text
- Error handling and recovery
- Logging to files

Create scaffolds for all existing file types
```

---

### Group 9: Type Safety & Quality

#### Task 9.1: Eliminate `any` Types

```prompt
@workspace Convert all `any` types to specific types:

Strategy:
1. Use TypeScript's "noImplicitAny" in tsconfig
2. Scan codebase for explicit `any` usage
3. For each occurrence:
   - Infer type from usage context
   - Create specific interface/type
   - Or use generic types where appropriate
4. Update function signatures
5. Add JSDoc documentation

Priority Areas:
- API route handlers
- Database query results
- Form data handlers
- Event handlers
- Third-party library wrappers

Run: pnpm type-check to validate
```

#### Task 9.2: Fix All Errors & Warnings

```prompt
@workspace Fix all TypeScript, ESLint, and build errors:

Process:
1. Run: pnpm type-check
2. Collect all errors with file:line:column
3. Group errors by type
4. Fix systematically:
   - Type errors
   - Missing imports
   - Unused variables
   - Incorrect function signatures
5. Run: pnpm lint
6. Fix all ESLint warnings
7. Verify: pnpm validate:quick

Do not suppress errors - fix root causes
```

---

### Group 10: Cleanup & Optimization

#### Task 10.1: Remove Duplicates & Unused Code

```prompt
@workspace Create cleanup script at scripts/cleanup-enhanced.ts:

Cleanup Targets:
1. Duplicate/Unused Zod Schemas:
   - Parse all schema definitions
   - Find duplicates by structure
   - Consolidate to single source
   - Update all usages

2. Duplicate/Unused Components:
   - Scan component definitions
   - Find unused components (no imports)
   - Find duplicate implementations
   - Remove or consolidate

3. Unused Functions/Types/Interfaces:
   - AST-based usage analysis
   - Mark unused exports
   - Verify truly unused
   - Remove safely

4. File System Cleanup:
   - Empty folders
   - .backup files
   - Blank files (0 bytes)
   - Temporary files

5. Documentation Cleanup:
   - Unused .md files
   - Duplicate .txt files
   - Old .log files

Execute with dry-run first, then apply changes
```

#### Task 10.2: Dependency Optimization

```prompt
@workspace Create script at scripts/optimize-dependencies.ps1:

Analysis:
1. Find unused packages:
   - Parse package.json dependencies
   - Scan codebase for actual imports
   - Identify packages never imported
2. Find duplicate packages:
   - Check for multiple versions
   - Suggest consolidation
3. Find outdated packages:
   - Check npm registry for updates
   - Categorize by semver (major/minor/patch)

Actions:
- Generate report: unused-deps.txt
- Uninstall unused: pnpm remove {packages}
- Update outdated: pnpm update {packages}
- Deduplicate: pnpm dedupe

Verify after: pnpm install && pnpm build
```

---

### Group 11: Import Path Optimization

#### Task 11.1: Path Alias Configuration

```prompt
@workspace Optimize TypeScript path aliases:

Update tsconfig.json paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/app/*": ["./src/app/*"],
      "@/database/*": ["./src/database/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/dto/*": ["./src/dto/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

Create verification in scripts/replaceImportsEnhanced.ts:
- Parse all imports across project
- Convert relative to alias where applicable
- Update exports
- Verify no broken imports

Run: pnpm imports:check then pnpm imports:optimize
```

---

### Group 12: Naming Convention Enforcement

#### Task 12.1: Decide Convention

```prompt
@workspace Update eslint.config.ts with naming convention:

Options:
A. Kebab-case: my-component.tsx, my-function.ts
B. PascalCase: MyComponent.tsx, myFunction.ts

Recommendation: Hybrid approach
- Components: PascalCase (MyComponent.tsx)
- Utilities/Helpers: kebab-case (my-helper.ts)
- Pages: kebab-case (my-page.tsx)
- Config: kebab-case (my-config.ts)

Apply rules in ESLint config
```

#### Task 12.2: Automated Conversion

```prompt
@workspace Create scripts/convert-naming.ps1:

Process:
1. Scan all files in src/
2. Categorize by type (component, util, page, config)
3. Generate rename operations
4. Update all imports/exports referencing renamed files
5. Dry-run mode: Show changes without applying
6. Execute mode: Apply all changes

Execution:
- Step 1: pnpm run convert-naming --dry-run
- Step 2: Review changes
- Step 3: Fix any conflicts
- Step 4: pnpm run convert-naming --execute
- Step 5: pnpm type-check && pnpm lint

Safety:
- Backup before conversion
- Rollback on error
- Git integration for tracking
```

---

### Group 13: Final Validation & Build

#### Task 13.1: Pre-Build Validation

```prompt
@workspace Run comprehensive validation:

Execute in order:
1. pnpm type-check - TypeScript errors
2. pnpm lint - ESLint issues
3. pnpm format:check - Prettier formatting
4. pnpm test:unit - Unit tests
5. pnpm validate:quick - All checks combined

For each error found:
- Document in validation-errors.md
- Categorize by severity
- Fix critical errors first
- Re-validate after fixes
- Repeat until zero errors

Success criteria: All commands exit with code 0
```

#### Task 13.2: Production Build

```prompt
@workspace Execute production build:

Only proceed if pnpm validate:quick has zero errors.

Build process:
1. pnpm build
2. Capture all build warnings/errors
3. Analyze bundle size
4. Check for:
   - Large bundle chunks (>500kb)
   - Unused code
   - Duplicate dependencies
   - Missing optimizations

Optimization:
- Code splitting
- Tree shaking verification
- Image optimization
- Font subsetting
- CSS purging

Success criteria:
- Build completes without errors
- Bundle size within targets
- All pages render correctly
- Lighthouse score >90
```

---

### Group 14: Workspace Analysis & Recommendations

#### Task 14.1: Project Health Analysis

```prompt
@workspace Analyze entire ComicWise project and provide recommendations:

Analysis Areas:
1. **Architecture**:
   - Component organization
   - Code duplication
   - Separation of concerns
   - Dependency management

2. **Performance**:
   - Bundle size analysis
   - Runtime performance
   - Database query efficiency
   - Caching strategies

3. **Code Quality**:
   - TypeScript coverage
   - Test coverage
   - Documentation completeness
   - Error handling patterns

4. **Security**:
   - Environment variable handling
   - Authentication/authorization
   - Input validation
   - SQL injection prevention

5. **Developer Experience**:
   - Setup complexity
   - Build times
   - Hot reload performance
   - Debugging capabilities

6. **Scalability**:
   - Database schema design
   - API rate limiting
   - Caching architecture
   - CDN integration

For each area:
- Current state assessment
- Identified issues
- Recommended improvements
- Implementation priority
- Estimated effort

Generate comprehensive report: .github/prompts/recommendations.md
```

---

## 🚦 Execution Order

Follow this sequence to ensure dependencies are met:

### Phase 1: Environment Setup (Tasks 1.1-1.5)
VS Code configuration → Extensions → Debug → Tasks → Settings

### Phase 2: Configuration Files (Tasks 2.1-2.10)
Next.js → TypeScript → ESLint → Prettier → Ignore files

### Phase 3: Environment & Config (Task 3.1)
Environment variables → Application config

### Phase 4: Database Foundation (Task 4.1)
Seeding system → Image management → Helpers

### Phase 5: Application Layer (Tasks 5.1-5.8)
Pages → Components → Forms → Actions

### Phase 6: State & Data (Tasks 6.1, 7.1)
Zustand stores → Query/Mutation separation

### Phase 7: Structure & Tooling (Tasks 8.1-8.2)
Folder optimization → CLI enhancement

### Phase 8: Quality Assurance (Tasks 9.1-9.2)
Type safety → Error fixes

### Phase 9: Cleanup (Tasks 10.1-10.2)
Code cleanup → Dependency optimization

### Phase 10: Conventions (Tasks 11.1, 12.1-12.2)
Import paths → Naming conventions

### Phase 11: Validation (Tasks 13.1-13.2)
Pre-build checks → Production build

### Phase 12: Analysis (Task 14.1)
Health check → Recommendations

---

## 📝 Logging & Documentation

All tasks should log to: `.github/prompts/main.prompt.md`

Format:
```markdown
## {TASK_ID}: {TASK_NAME}
**Date**: {ISO_DATE}
**Status**: {COMPLETED|IN_PROGRESS|FAILED}

### Changes Made:
- {FILE_1}: {DESCRIPTION}
- {FILE_2}: {DESCRIPTION}

### Files Created:
- {NEW_FILE_1}
- {NEW_FILE_2}

### Files Modified:
- {MODIFIED_FILE_1}
- {MODIFIED_FILE_2}

### Validation:
- {VALIDATION_COMMAND}: {RESULT}
```

---

## 🔄 Post-Completion Steps

Create execution prompt at `.github/prompts/run.prompt.md`:

```prompt
@workspace Execute all changes documented in .github/prompts/main.prompt.md:

Process:
1. Read main.prompt.md
2. Parse all file operations (create/modify/delete)
3. Validate file paths
4. Execute operations in dependency order
5. Run validations after each phase
6. Log results
7. Handle errors gracefully
8. Generate completion report

Safety:
- Dry-run mode available
- Rollback on critical failure
- Incremental commits to git
```

---

## ✅ Success Criteria

Project is complete when:
- [ ] All 39 tasks executed successfully
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] All tests passing
- [ ] Production build succeeds
- [ ] Bundle size optimized
- [ ] Documentation complete
- [ ] Git history clean
- [ ] Ready for deployment

---

**Generated**: {CURRENT_DATE}
**ComicWise Project**: Next.js 16 + PostgreSQL + Redis + AI
