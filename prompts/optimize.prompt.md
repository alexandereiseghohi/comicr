# ComicWise - Complete Optimization & Setup Prompt

> **Version:** 4.0.0
> **Updated:** 2026-01-22
> **Package Manager:** pnpm
> **Platform:** Windows (PowerShell)
> **Framework:** Next.js 16
> **Database:** PostgreSQL (Drizzle ORM)
> **Cache:** Redis (Upstash)
> **Auth:** NextAuth.js v5

---

## 📋 Prerequisites & Context

**Read and understand the following to get complete project context:**

```
@/**/*.ts         - All TypeScript files
@/**/*.tsx        - All React/Next.js components
@/**/*.mjs        - Module JavaScript files
@/**/*.json       - Configuration and data files
@/**/*.md         - Documentation files
@/**/*.txt        - Text files and prompts
@/**/*.yml        - CI/CD and workflow files
@/**/*.ps1        - PowerShell scripts
@/**/*.sh         - Bash scripts
@/**/Dockerfile   - Docker configurations
@/src             - Source code directory
@/scripts         - Project scripts
```

**System Requirements:**
- Package Manager: `pnpm`
- Operating System: Windows (PowerShell)
- Node.js: 18.x or higher
- PostgreSQL: 15.x or higher
- Redis: Latest (Upstash)

---

## ✅ Permission & Execution Rules

1. **Request all necessary permissions** to complete all tasks
2. **Confirm permissions** before proceeding
3. **Never create summary** until ALL tasks are completed
4. **Complete tasks using recommended best practices**

---

## 🎯 Core Execution Principles

For ALL tasks, ensure:

1. **Next.js Best Practices** - Follow Next.js 16 latest conventions
2. **DRY Principles** - Do Not Repeat Yourself
3. **Performance Optimization** - Optimize for speed and efficiency
4. **Comprehensive Logging** - Clear, concise logs for each operation
5. **PowerShell Syntax** - Use PowerShell for all scripting tasks
6. **Backup Before Changes** - Copy existing files to `.backup` before modifications
7. **Data Integrity** - Ensure database consistency
8. **Error Handling** - Proper validation and error handling
9. **Security Best Practices** - Protect sensitive data
10. **Type Safety** - Use specific types, avoid `any`
11. **Documentation** - JSDoc for all functions, interfaces, types, modules, classes, components, routes
12. **Update All Usages** - When creating/modifying files, update all references across the project

---

## 📁 File Handling Protocol

### If File Exists:
```powershell
# Backup existing file
Copy-Item "path/to/file.ts" "path/to/file.backup.ts"

# Create optimized version with:
# - Enhanced performance
# - Best practices
# - Proper documentation
# - Type safety
# - Error handling
```

### If File Doesn't Exist:
```
Create new file with:
- Optimized code
- Best practices implementation
- Comprehensive JSDoc documentation
- Type safety (no `any` types)
- Proper error handling
- Performance optimizations
```

### Post-Creation:
- Update all file usages across the project
- Verify imports and exports
- Run type checking
- Run linting

---

## 📂 Project Folder Structure Reference

### Application Routes (Organized with Layout Groups)

**Public Routes** - `src/app/(root)/`
```
(root)/
├── page.tsx                              # Home page (/)
├── bookmarks/page.tsx                    # Bookmarks (/bookmarks)
├── browse/page.tsx                       # Browse (/browse)
├── comics/
│   ├── page.tsx                          # Comics listing (/comics)
│   └── [slug]/
│       ├── page.tsx                      # Comic details (/comics/[slug])
│       └── chapters/
│           └── [chapter-id]/page.tsx     # Chapter reader (/comics/[slug]/chapters/[chapter-id])
├── genres/[slug]/page.tsx                # Genre page (/genres/[slug])
├── profile/
│   ├── page.tsx                          # User profile (/profile)
│   ├── [user-id]/page.tsx                # View user profile (/profile/[user-id])
│   ├── edit/page.tsx                     # Edit profile (/profile/edit)
│   ├── change-password/page.tsx          # Change password (/profile/change-password)
│   └── settings/page.tsx                 # User settings (/profile/settings)
├── search/page.tsx                       # Search (/search)
├── privacy-policy/page.tsx               # Privacy policy (/privacy-policy)
├── terms-of-service/page.tsx             # Terms of service (/terms-of-service)
└── dmca/page.tsx                         # DMCA (/dmca)
```

**Authentication Routes** - `src/app/(auth)/`
```
(auth)/
├── sign-in/page.tsx                      # Sign in (/sign-in)
├── sign-up/page.tsx                      # Sign up (/sign-up)
├── forgot-password/page.tsx              # Forgot password (/forgot-password)
├── reset-password/page.tsx               # Reset password (/reset-password)
├── verify-request/page.tsx               # Verify request (/verify-request)
├── resend-verification/page.tsx          # Resend verification (/resend-verification)
└── sign-out/page.tsx                     # Sign out (/sign-out)
```

**Admin Routes** - `src/app/admin/`
```
admin/
├── page.tsx                              # Dashboard (/admin)
├── users/
│   ├── page.tsx                          # User list (/admin/users)
│   ├── new/page.tsx                      # New user (/admin/users/new)
│   └── [id]/page.tsx                     # Edit user (/admin/users/[id])
├── comics/
│   ├── page.tsx                          # Comic list (/admin/comics)
│   ├── new/page.tsx                      # New comic (/admin/comics/new)
│   └── [id]/page.tsx                     # Edit comic (/admin/comics/[id])
├── chapters/
│   ├── page.tsx                          # Chapter list (/admin/chapters)
│   ├── new/page.tsx                      # New chapter (/admin/chapters/new)
│   └── [id]/page.tsx                     # Edit chapter (/admin/chapters/[id])
├── genres/
│   ├── page.tsx                          # Genre list (/admin/genres)
│   ├── new/page.tsx                      # New genre (/admin/genres/new)
│   └── [id]/page.tsx                     # Edit genre (/admin/genres/[id])
├── authors/
│   ├── page.tsx                          # Author list (/admin/authors)
│   ├── new/page.tsx                      # New author (/admin/authors/new)
│   └── [id]/page.tsx                     # Edit author (/admin/authors/[id])
├── artists/
│   ├── page.tsx                          # Artist list (/admin/artists)
│   ├── new/page.tsx                      # New artist (/admin/artists/new)
│   └── [id]/page.tsx                     # Edit artist (/admin/artists/[id])
└── types/
    ├── page.tsx                          # Type list (/admin/types)
    ├── new/page.tsx                      # New type (/admin/types/new)
    └── [id]/page.tsx                     # Edit type (/admin/types/[id])
```

### Component Organization - `src/components/`
```
components/
├── ui/                                   # Base UI components (shadcn)
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   ├── dialog.tsx
│   └── [other shadcn components]
├── comics/                               # Comic-related components
│   ├── ComicCard.tsx
│   ├── ComicFilters.tsx
│   ├── ComicGrid.tsx
│   └── BookmarkActions.tsx
├── chapters/                             # Chapter reader components
│   ├── ChapterReader.tsx
│   ├── ChapterNavigation.tsx
│   ├── ReadingSettings.tsx
│   └── ImageViewer.tsx
├── profile/                              # Profile components
│   ├── ProfileView.tsx
│   ├── ProfileEdit.tsx
│   ├── PasswordChange.tsx
│   └── UserSettings.tsx
├── bookmarks/                            # Bookmark components
│   ├── BookmarkList.tsx
│   ├── BookmarkFilters.tsx
│   └── BookmarkActions.tsx
├── admin/                                # Admin components
│   ├── users/
│   ├── comics/
│   ├── chapters/
│   └── [other admin components]
├── layout/                               # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
└── common/                               # Common/shared components
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── [other shared components]
```

### Database Layer - `src/database/`
```
database/
├── schema.ts                             # Drizzle ORM schema
├── seed/                                 # Seeding system
│   ├── seeders/                          # Entity seeders
│   │   ├── user-seeder-v4.ts
│   │   ├── comic-seeder-v4.ts
│   │   ├── chapter-seeder-v4.ts
│   │   ├── genre-seeder-v4.ts
│   │   ├── author-seeder-v4.ts
│   │   ├── artist-seeder-v4.ts
│   │   └── type-seeder-v4.ts
│   ├── helpers/                          # Utility helpers
│   │   ├── image-downloader.ts
│   │   ├── validation-schemas.ts
│   │   ├── password-hasher.ts
│   │   ├── seed-logger.ts
│   │   ├── batch-processor.ts
│   │   └── image-deduplicator.ts
│   ├── seed-runner-v4enhanced.ts         # Main orchestrator
│   ├── index.ts                          # Seeding entry point
│   └── run.ts                            # CLI runner
└── migrations/                           # Drizzle migrations
```

### Scripts - `scripts/`
```
scripts/
├── phases/                               # Phase automation
│   ├── phase-runner.ts                   # Master phase orchestrator
│   ├── verify-phase.ts                   # Phase verification
│   ├── phase-1.ts                        # VS Code config phase
│   ├── phase-2.ts                        # Environment phase
│   ├── phase-3.ts                        # Database seeding phase
│   ├── phase-4.ts                        # Frontend phase
│   ├── phase-5.ts                        # Scripts automation phase
│   ├── phase-6.ts                        # CI/CD phase
│   ├── phase-7.ts                        # Documentation phase
│   ├── phase-8.ts                        # Testing phase
│   ├── phase-9.ts                        # Enhancements phase
│   ├── run-all-phases.ps1                # PowerShell master wrapper
│   └── run-phase-*.ps1                   # PowerShell individual wrappers
├── database/                             # Database scripts
│   ├── db-health-check.ts
│   ├── db-backup.ts
│   └── db-reset.ts
├── setup-testing.ps1                     # Test environment setup
├── analyze-performance.ts                # Performance analysis
├── generate-docs.ts                      # Documentation generator
├── cleanup-project.ps1                   # Project cleanup
└── [80+ other utility scripts]
```

### Configuration Files - Root Directory
```
.vscode/
├── settings.json                         # Editor settings
├── launch.json                           # Debug configurations
├── tasks.json                            # VS Code tasks
├── extensions.json                       # Recommended extensions
└── mcp.json                              # MCP server config

.github/
├── workflows/                            # GitHub Actions
│   ├── ci.yml
│   ├── cd.yml
│   ├── migrations.yml
│   └── [other workflows]
└── prompts/                              # AI assistant prompts
    ├── automate.prompt.md
    ├── optimize.prompt.md
    └── [other prompts]

src/
├── app/                                  # Next.js app directory
├── components/                           # React components
├── database/                             # Database layer
├── dal/                                  # Data Access Layer
├── lib/                                  # Library utilities
│   ├── actions/                          # Server actions
│   ├── auth.ts
│   ├── env.ts
│   └── [other utilities]
└── styles/                               # Global styles

public/
├── comics/
│   └── covers/                           # Comic cover images
├── chapters/                             # Chapter page images
├── uploads/                              # User uploads
└── [other static assets]

docs/                                     # Generated documentation
node_modules/                             # Dependencies
```

---

## 🔧 PHASE 1: VS Code Configuration

### Task 1.1: MCP Server Configuration
**File:** `.vscode/mcp.json`

Configure MCP servers for:
- Next.js development
- TypeScript IntelliSense
- PostgreSQL database access
- Redis cache management
- AI-powered features

**Deliverable:** Create verification script using VS Code CLI to start MCP servers

---

### Task 1.2: Extension Recommendations
**File:** `.vscode/extensions.json`

Essential extensions:
- Next.js/React development
- TypeScript support
- PostgreSQL/Database tools
- Redis client
- Tailwind CSS IntelliSense
- ESLint/Prettier
- Git integration

**Deliverable:** Create installation script using VS Code CLI

---

### Task 1.3: Debug Configurations
**File:** `.vscode/launch.json`

Debug configurations for:
- Next.js applications (client/server)
- TypeScript debugging
- PostgreSQL query debugging
- Redis connection debugging
- Server actions
- API routes

---

### Task 1.4: Task Automation
**File:** `.vscode/tasks.json`

Tasks for:
- Building the project
- Running tests (unit/integration/e2e)
- Database migrations
- Data seeding
- Linting and formatting
- Deployment operations

---

### Task 1.5: Editor Settings
**File:** `.vscode/settings.json`

Optimized settings for:
- TypeScript strict mode
- ESLint auto-fix on save
- Prettier formatting
- File associations
- Extension-specific configurations
- Development/production environments

---

## 🔧 PHASE 2: Environment & Configuration

### Task 2.1: Environment Variables
**File:** `.env.local`

Configure environment variables:

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_DIRECT_URL=postgresql://...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Application
CUSTOM_PASSWORD=SecurePassword123!
NEXT_PUBLIC_UPLOAD_DIR=/uploads

# Optional: Sentry, CDN, Analytics
SENTRY_DSN=...
NEXT_PUBLIC_IMAGE_CDN=...
```

---

### Task 2.2: Environment Validation
**File:** `src/lib/env.ts`

Create type-safe environment access:
- Import and validate all environment variables
- Runtime validation with Zod
- Type-safe exports

---

### Task 2.3: Application Configuration
**File:** `appConfig.ts`

Create centralized configuration:
- Use `src/lib/env.ts` for environment variables
- Export typed configuration object
- Include app metadata, feature flags, API endpoints
- **Update all usages across the project**

---

### Task 2.4: Core Configuration Files

Optimize the following:

**`next.config.ts`**
- Image optimization (domains, formats, sizes)
- Build optimization (bundle analyzer, compression)
- Environment variables exposure
- Redirects and rewrites
- Security headers
- Experimental features

**`tsconfig.json`**
- Strict TypeScript settings
- Path aliases (@/*)
- Compiler options for Next.js
- Build configurations

**`eslint.config.ts`**
- Linting rules for TypeScript
- React/Next.js specific rules
- Plugin configurations
- Auto-fix settings

**`postcss.config.mjs`**
- Tailwind CSS
- PostCSS plugins
- CSS optimization

**`.prettierrc.ts`**
- Code formatting rules
- Plugin configurations
- Consistent style guide

**`.gitignore`, `.dockerignore`, `.prettierignore`**
- Optimize ignore patterns
- Exclude build artifacts
- Protect sensitive files

---

## 🔧 PHASE 3: Database & Seeding

### Task 3.1: Dynamic Data Seeding
**Files:** `src/database/seed/**/*.ts`

Create dynamic seeders using:
- `@users.json`
- `@chapters*.json`
- `@comics*.json`

**Requirements:**
1. Create/update data (upsert logic)
2. Validate all fields with Zod
3. Check for existing images before downloading
4. Use `@src/services/imageService.ts` for image handling
5. Save images to `@public/uploads`
6. Follow DRY principles
7. Reference `@src/database/seed/seeders/universalSeeder.ts` as example

**Helpers to create:**
- Image download with cache checking
- Data validation utilities
- Upsert helpers for entities
- Progress logging
- Error recovery

**Scripts:**
```powershell
pnpm db:seed:dry-run  # Validate without inserting
pnpm db:seed          # Execute seeding
pnpm db:seed:verbose  # With detailed logs
```

---

## 🔧 PHASE 4: Frontend Implementation

### Task 4.1: User Profile Pages
**Status:** HIGH PRIORITY

Create the following pages:

```typescript
src/app/profile/page.tsx                  // View profile
src/app/profile/edit/page.tsx             // Edit profile form
src/app/profile/change-password/page.tsx  // Change password
src/app/profile/settings/page.tsx         // User settings
```

**Components:**
- ProfileView component
- ProfileEdit form (Zod + React Hook Form)
- PasswordChange form
- Settings panel

---

### Task 4.2: Comic Listing & Details
**Status:** HIGH PRIORITY

Create pages and components:

```typescript
src/app/comics/page.tsx              // List all comics
src/app/comics/[slug]/page.tsx       // Comic details page

// Components
src/components/comics/ComicCard.tsx
src/components/comics/ComicFilters.tsx
src/components/comics/BookmarkActions.tsx
```

**Features:**
- Grid layout with pagination
- Filters (genre, type, status)
- Sort options (Latest, Popular, Rating)
- Search functionality
- Bookmark integration

---

### Task 4.3: Chapter Reader
**Status:** HIGH PRIORITY

Create reader experience:

```typescript
src/app/comics/[slug]/[chapterSlug]/page.tsx

// Components
src/components/chapters/ChapterReader.tsx
src/components/chapters/ChapterNavigation.tsx
src/components/chapters/ReadingSettings.tsx
```

**Features:**
- Image viewer (vertical/horizontal modes)
- Navigation (prev/next chapter)
- Progress tracking
- Reading settings (background, zoom)

---

### Task 4.4: Bookmark Management
**Status:** HIGH PRIORITY

Create bookmark components:

```typescript
src/components/comics/AddToBookmarkButton.tsx
src/components/comics/RemoveFromBookmarkButton.tsx
src/components/comics/BookmarkStatus.tsx
```

**Integration:**
- Use existing `addToBookmarksAction`
- Use existing `removeFromBookmarksAction`
- Implement optimistic UI updates
- Status dropdown (Reading, Plan to Read, Completed, Dropped)

---

### Task 4.5: Bookmarks Page
**Status:** HIGH PRIORITY

```typescript
src/app/bookmarks/page.tsx

// Components
src/components/bookmarks/BookmarkList.tsx
src/components/bookmarks/BookmarkFilters.tsx
```

**Features:**
- Filter by status
- Sort options
- Grid/List view toggle

---

## 🔧 PHASE 5: Scripts & Automation

### Task 5.1: Optimize All Scripts
**Location:** `@/scripts`

Review and optimize:
- Ensure efficiency
- Add comprehensive documentation
- Follow best practices
- Make modular and reusable
- **Update all usages across the project**

---

### Task 5.2: Performance Analysis Script
**Create:** `scripts/analyze-performance.ps1`

Analyze project for:
- Performance bottlenecks
- Security vulnerabilities
- Code quality issues
- Generate detailed report with findings

**Run once created and validated**

---

### Task 5.3: Documentation Generator
**Create:** `scripts/generate-docs.ps1`

Generate comprehensive documentation:
- Setup instructions
- Usage guidelines
- API references
- Clear, concise, navigable format

**Run once created and validated**

---

### Task 5.4: Testing Setup
**Create:** `scripts/setup-testing.ps1`

Set up automated testing:
- Unit tests (Vitest)
- Integration tests
- End-to-end tests (Playwright)
- Well-structured with adequate coverage

**Target:** 80%+ code coverage

**Run once created and validated**

---

### Task 5.5: Project Cleanup Script
**Create:** `scripts/cleanup-project.ps1`

Perform cleanup:
- Prevent duplicates
- Delete unused/duplicate files
- Delete all `.backup` files
- Remove unused components/scripts
- Uninstall unused packages

**Run once created and validated**

---

## 🔧 PHASE 6: CI/CD & DevOps

### Task 6.1: GitHub Actions Workflows
**Create:** `.github/workflows/*.yml`

**CI Workflow** (`.github/workflows/ci.yml`):
- Lint, type-check, test
- Build verification
- Security scanning

**CD Workflow** (`.github/workflows/cd.yml`):
- Deploy to staging/production
- Environment-specific builds
- Rollback capabilities

**Database Migrations** (`.github/workflows/migrations.yml`):
- Automated migration runs
- Validation before apply
- Rollback support

---

### Task 6.2: Docker Optimization
**Files:** `Dockerfile`, `docker-compose.yml`, `docker-compose.dev.yml`

Optimize for:
- Multi-stage builds
- Layer caching
- Security best practices
- Development vs production configurations

---

## 🔧 PHASE 7: Documentation & Quality

### Task 7.1: Comprehensive README
**File:** `README.md`

Include:
- Project overview
- Setup instructions
- Usage guidelines
- Contribution guide
- License information
- Technology stack
- Architecture diagram

---

### Task 7.2: Additional Documentation
**Create:** `docs/` directory with:

```
docs/setup.md              # Detailed setup guide
docs/usage.md              # Usage guidelines
docs/api-reference.md      # API documentation
docs/contributing.md       # Contribution guide
docs/architecture.md       # System architecture
docs/deployment.md         # Deployment guide
```

---

### Task 7.3: Fix All Linting Errors

Run and fix:
```powershell
pnpm lint         # Check for errors
pnpm lint:fix     # Auto-fix where possible
```

Manually fix remaining issues

---

## 🔧 PHASE 8: Testing & Quality Assurance

### Task 8.1: Expand Test Coverage

**Unit Tests:**
- Authentication flows
- Server actions
- Utility functions
- Components

**Integration Tests:**
- Admin CRUD operations
- Bookmark functionality
- Database operations

**E2E Tests:**
- User journeys
- Comic reading flow
- Admin operations

**Target:** 80%+ code coverage

---

### Task 8.2: Performance Testing

Create performance benchmarks:
- Page load times
- API response times
- Database query performance
- Image loading optimization

---

## 🔧 PHASE 9: Optional Enhancements

### Task 9.1: Internationalization
**Library:** next-intl or next-i18next

Implement:
- Translation files (JSON)
- Language switcher UI
- SEO optimization for languages
- RTL support (if needed)

---

### Task 9.2: Analytics Integration

Integrate:
- Sentry (error tracking)
- Google Analytics
- Custom reading analytics
- Performance monitoring

---

### Task 9.3: User Onboarding

Create:
- First-time user tour
- Feature highlights
- Interactive tooltips
- Help center

---

## 📊 Success Criteria

### Phase 1-2: Configuration ✅
- [ ] All VS Code configurations optimized
- [ ] Environment variables properly configured
- [ ] All config files optimized

### Phase 3: Database ✅
- [ ] Dynamic seeding working
- [ ] Image optimization implemented
- [ ] Data validation with Zod

### Phase 4: Frontend ✅
- [ ] User profile pages complete
- [ ] Comic listing functional
- [ ] Chapter reader implemented
- [ ] Bookmark system working

### Phase 5: Scripts ✅
- [ ] All scripts optimized
- [ ] Performance analysis complete
- [ ] Documentation generated
- [ ] Testing setup complete
- [ ] Project cleanup done

### Phase 6: CI/CD ✅
- [ ] GitHub Actions workflows created
- [ ] Docker optimized
- [ ] Deployment pipeline working

### Phase 7: Documentation ✅
- [ ] README comprehensive
- [ ] All docs created
- [ ] No linting errors

### Phase 8: Testing ✅
- [ ] 80%+ code coverage
- [ ] All critical paths tested
- [ ] Performance benchmarks set

---

## 🚀 Execution Order

1. **Phase 1 & 2** (Configuration) - Foundation
2. **Phase 3** (Database) - Data layer
3. **Phase 4** (Frontend) - User-facing features
4. **Phase 5** (Scripts) - Automation
5. **Phase 6** (CI/CD) - Deployment
6. **Phase 7** (Documentation) - Knowledge transfer
7. **Phase 8** (Testing) - Quality assurance
8. **Phase 9** (Enhancements) - Optional improvements

---

## 💡 Best Practices Reminders

- **Use TypeScript strictly** - No `any` types
- **Document everything** - JSDoc for all public APIs
- **Test critical paths** - Don't skip testing
- **Optimize images** - WebP, lazy loading
- **Cache aggressively** - Use Redis effectively
- **Monitor performance** - Track metrics
- **Security first** - Validate all inputs
- **Accessibility** - WCAG compliance
- **Mobile responsive** - Mobile-first approach
- **SEO optimized** - Meta tags, sitemaps

---

## 📝 Logging Standards

For all operations, log:

```typescript
// Success
console.log(`✅ [Task Name] Successfully completed: ${details}`)

// Progress
console.log(`🔄 [Task Name] In progress: ${details}`)

// Warning
console.warn(`⚠️ [Task Name] Warning: ${details}`)

// Error
console.error(`❌ [Task Name] Failed: ${error.message}`)

// Info
console.info(`ℹ️ [Task Name] Info: ${details}`)
```

---

## 🔚 Completion Checklist

Before marking tasks complete, verify:

- [ ] All files created/updated as specified
- [ ] All backups created for existing files
- [ ] All imports/exports updated
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Tests pass (`pnpm test`)
- [ ] Documentation updated
- [ ] All usages across project updated
- [ ] Performance optimized
- [ ] Security best practices followed

---

**END OF PROMPT**

> This prompt consolidates all setup requirements, tasks, and recommendations for the ComicWise project into a single, comprehensive, DRY-compliant guide for GitHub Copilot.
