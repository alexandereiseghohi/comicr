# ComicWise Complete Setup - Requirements Specification

**Document Version**: 1.0
**Date**: February 1, 2026
**Source**: `.github/prompts/plan-comicwiseComplete40TaskSetup.prompt.md`
**Format**: EARS (Easy Approach to Requirements Syntax)

---

## 1. Environment & Foundation (Phase 1)

### REQ-ENV-001: Environment Template Creation

**WHEN** the project is initialized, **THE SYSTEM SHALL** provide a comprehensive `.env.template` file containing 60+ documented environment variables with inline documentation and setup links.

### REQ-ENV-002: Environment Documentation

**WHEN** developers need environment setup guidance, **THE SYSTEM SHALL** provide a comprehensive `.env.md` file with step-by-step setup guides for all services (Google OAuth, Sentry, Upstash Redis, ImageKit, GitHub OAuth).

### REQ-ENV-003: Environment Validation

**WHEN** environment variables are configured, **THE SYSTEM SHALL** validate all required variables using `pnpm validate:env` command and report missing or invalid configurations.

### REQ-TS-001: TypeScript Error Resolution

**WHEN** the codebase is type-checked, **THE SYSTEM SHALL** produce zero TypeScript errors with strict type checking enabled.

### REQ-TS-002: Toast Hook Implementation

**WHEN** components need toast notifications, **THE SYSTEM SHALL** provide a `use-toast` hook that wraps Sonner toast library with TypeScript support.

### REQ-TS-003: Component Error Fixes

**WHEN** React components are compiled, **THE SYSTEM SHALL** ensure all components have correct imports, proper variable naming, and valid TypeScript syntax.

### REQ-TS-004: DAL Layer Type Safety

**WHEN** server actions access the database, **THE SYSTEM SHALL** use type-safe DAL layer functions with proper parameter signatures and return types exported from query files.

---

## 2. Configuration Optimization (Phase 2)

### REQ-CONFIG-001: Next.js Configuration Enhancement

**WHEN** the application builds, **THE SYSTEM SHALL** use optimized Next.js configuration including:

- Security headers (CSP, X-Frame-Options, HSTS, Permissions-Policy)
- Image optimization (AVIF/WebP formats)
- Package import optimization for 20+ libraries
- Server-side minification and webpack build workers

### REQ-CONFIG-002: Sitemap Generation

**WHEN** sitemap is generated, **THE SYSTEM SHALL** create dynamic sitemaps with:

- Excluded admin/API/auth routes
- Prioritized comic routes (priority 0.8, weekly updates)
- Chapter routes (priority 0.6, daily updates)
- Robots.txt with proper allow/disallow policies

### REQ-CONFIG-003: Package Management

**WHEN** managing dependencies, **THE SYSTEM SHALL** enforce Node.js >=20.0.0 and pnpm >=9.0.0 via package.json engines field.

### REQ-CONFIG-004: TypeScript Strictness

**WHEN** TypeScript compiles code, **THE SYSTEM SHALL** enforce maximum strictness with:

- noUnusedLocals and noUnusedParameters enabled
- exactOptionalPropertyTypes enabled
- noUncheckedIndexedAccess enabled
- forceConsistentCasingInFileNames enabled

### REQ-CONFIG-005: ESLint Kebab-Case Enforcement

**WHEN** files are linted, **THE SYSTEM SHALL** enforce kebab-case naming for all files except React components in specific directories (components/, app/\*\*/{page,layout}.tsx).

### REQ-CONFIG-006: Git Ignore Completeness

**WHEN** files are tracked by git, **THE SYSTEM SHALL** ignore backup files (_.backup, _.bak), report files (_-report.json, _.csv), and temporary files (temp*, test*.txt).

---

## 3. Database & Seeding (Phase 3)

### REQ-DB-001: Seed Data Organization

**WHEN** seed data is accessed, **THE SYSTEM SHALL** store all JSON seed files in `data/seed-source/` directory.

### REQ-DB-002: Seed Image Validation

**WHEN** seed images are downloaded, **THE SYSTEM SHALL** validate URLs for:

- Valid image extensions (jpg, jpeg, png, webp, avif)
- Reachability with 5-second timeout
- Correct Content-Type headers
- Size limits (default 5MB max)

### REQ-DB-003: Duplicate Detection

**WHEN** seed data is processed, **THE SYSTEM SHALL** detect duplicate comics by slug, title, or metadata and report conflicts.

### REQ-DB-004: Seed Progress Tracking

**WHEN** seeding is in progress, **THE SYSTEM SHALL** display real-time progress with percentage completion and ETA.

### REQ-DB-005: Seed Error Resilience

**IF** seed data contains errors, **THEN THE SYSTEM SHALL** log errors, skip invalid entries, and continue with valid data.

---

## 4. UI/UX Enhancement (Phase 4)

### REQ-UI-001: Homepage 3D Elements

**WHEN** users visit the homepage, **THE SYSTEM SHALL** display 3D interactive components using Aceternity UI library (HeroParallax, WavyBackground, FloatingNav).

### REQ-UI-002: About Page Content

**WHEN** users navigate to /about, **THE SYSTEM SHALL** display comprehensive about page with mission, vision, team information, and 3D card effects.

### REQ-UI-003: Contact Page Functionality

**WHEN** users submit contact form, **THE SYSTEM SHALL** validate inputs (name, email, message) and send email via Resend/SMTP service.

### REQ-UI-004: Terms of Service

**WHEN** users access /terms, **THE SYSTEM SHALL** display legally complete terms of service with all required sections (user accounts, content usage, intellectual property, disclaimers, governing law).

### REQ-UI-005: Privacy Policy

**WHEN** users access /privacy, **THE SYSTEM SHALL** display GDPR/CCPA compliant privacy policy covering data collection, usage, cookies, and user rights.

### REQ-UI-006: Comics Listing Enhancement

**WHEN** users browse comics, **THE SYSTEM SHALL** display grid layout with:

- Advanced filtering (genre, type, status)
- Sort options (latest, popular, rating)
- Pagination with 20 items per page
- Lazy-loaded images with loading skeletons

### REQ-UI-007: Comic Detail Page

**WHEN** users view comic details, **THE SYSTEM SHALL** display:

- Hero section with cover image and metadata
- Chapter list with reading progress indicators
- Rating and review system (1-5 stars)
- Related comics recommendations
- Bookmark functionality

### REQ-UI-008: Chapter Reader

**WHEN** users read a chapter, **THE SYSTEM SHALL** provide:

- Multiple reading modes (single-page, continuous, double-page)
- Image quality settings (original, high, medium, low)
- Zoom and pan controls
- Navigation controls (previous/next chapter, page jump)
- Auto-save reading progress every 30 seconds
- Keyboard shortcuts (arrow keys, space, escape)

---

## 5. State Management (Phase 5)

### REQ-STATE-001: Store Directory Naming

**WHEN** state management files are referenced, **THE SYSTEM SHALL** use `src/stores/` directory (not `src/store/`) with corresponding `@/stores` import alias.

### REQ-STATE-002: Centralized Store Exports

**WHEN** stores are imported, **THE SYSTEM SHALL** provide centralized `stores/index.ts` file exporting all store hooks.

### REQ-STATE-003: DAL Layer Usage

**WHEN** server actions access database, **THE SYSTEM SHALL** use DAL layer functions exclusively (no direct `db` queries in actions).

### REQ-STATE-004: DAL Audit Verification

**WHEN** codebase is audited, **THE SYSTEM SHALL** confirm 100% DAL usage in all server actions with automated verification script.

---

## 6. Code Quality & Refactoring (Phase 6)

### REQ-QUALITY-001: AST-Based Refactoring

**WHEN** code is refactored, **THE SYSTEM SHALL** use ts-morph library for AST-based transformations including:

- Replacing 'any' types with inferred types
- Organizing imports alphabetically
- Removing unused variables

### REQ-QUALITY-002: CLI Tool Enhancement

**WHEN** developers use CLI, **THE SYSTEM SHALL** provide `cw` command with subcommands for:

- Database operations (db:reset, db:seed, db:studio)
- Testing (test:unit, test:e2e)
- Deployment (deploy:preview, deploy:prod)
- Scaffolding (scaffold:page, scaffold:component)

### REQ-QUALITY-003: 'any' Type Elimination

**WHEN** TypeScript code is analyzed, **THE SYSTEM SHALL** minimize 'any' types and document remaining strategic 'any' uses with inline comments explaining rationale.

### REQ-QUALITY-004: Duplicate File Removal

**WHEN** cleanup is executed, **THE SYSTEM SHALL** delete backup files (_.backup, _.bak), duplicate JSONs (chaptersdata1.json, comicsdata1.json), and report files (\*-report.json).

### REQ-QUALITY-005: Unused Package Removal

**WHEN** dependencies are audited, **THE SYSTEM SHALL** remove unused packages identified by `pnpm list --depth=0` analysis.

### REQ-QUALITY-006: Import Path Optimization

**WHEN** files are imported, **THE SYSTEM SHALL** use TypeScript path aliases (@/components, @/lib, etc.) instead of relative paths (../../).

### REQ-QUALITY-007: Kebab-Case File Naming

**WHEN** non-component files are named, **THE SYSTEM SHALL** use kebab-case format with automated ESLint enforcement and violation fixes (~30 file renames expected).

---

## 7. Documentation & Testing (Phase 7)

### REQ-DOC-001: Comprehensive Documentation

**WHEN** developers work with code, **THE SYSTEM SHALL** provide:

- JSDoc comments on all public functions/classes
- Inline comments for complex logic
- README files in major directories
- API documentation in docs/api-reference.md

### REQ-DOC-002: OpenAPI Specification

**WHEN** API documentation is needed, **THE SYSTEM SHALL** provide complete OpenAPI 3.0 specification in docs/openapi.yaml with all endpoints documented.

### REQ-TEST-001: Unit Test Coverage

**WHEN** unit tests are executed, **THE SYSTEM SHALL** achieve 100%+ coverage for:

- All DAL functions
- All server actions
- All schema validations
- All utility functions

### REQ-TEST-002: E2E Test Coverage

**WHEN** E2E tests are executed, **THE SYSTEM SHALL** cover critical user flows:

- Authentication (sign-up, sign-in, password reset)
- Comic browsing and search
- Chapter reading with progress tracking
- Bookmarking and ratings
- Comment posting and threading
- Profile management

### REQ-TEST-003: Accessibility Testing

**WHEN** components are tested, **THE SYSTEM SHALL** validate WCAG 2.1 AA compliance using axe-core integration in Playwright tests.

---

## 8. Build & Performance (Phase 8)

### REQ-BUILD-001: Production Build Success

**WHEN** production build is executed, **THE SYSTEM SHALL** complete `pnpm build` with zero errors and warnings.

### REQ-BUILD-002: Bundle Size Limits

**WHEN** bundle is analyzed, **THE SYSTEM SHALL** enforce performance budgets:

- Initial page load < 200KB gzipped
- Individual routes < 100KB gzipped
- Images optimized to AVIF/WebP with max 1MB size

### REQ-BUILD-003: Lighthouse Performance

**WHEN** Lighthouse audit is run, **THE SYSTEM SHALL** achieve scores:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### REQ-PERF-001: Redis Caching

**WHERE** Redis is configured, **THE SYSTEM SHALL** cache:

- Comic listings (1-hour TTL)
- Chapter data (1-hour TTL)
- User sessions (24-hour TTL)
- Rate limit buckets (15-minute TTL)

### REQ-PERF-002: Rate Limiting

**WHEN** API requests are received, **THE SYSTEM SHALL** enforce rate limits:

- 100 requests per 15 minutes per IP address
- Custom limits for authenticated users (500 requests per 15 minutes)
- DDoS protection via Redis-backed sliding window

### REQ-PERF-003: Image Optimization Pipeline

**WHEN** images are uploaded, **THE SYSTEM SHALL**:

- Accept only valid formats (jpg, jpeg, png, webp, avif)
- Enforce max size limits (5MB default)
- Generate responsive variants (640w, 1080w, 1920w)
- Store on ImageKit/Cloudinary/S3 with CDN delivery

---

## 9. Deployment & Production (Phase 9)

### REQ-DEPLOY-001: Vercel Configuration

**WHEN** deploying to Vercel, **THE SYSTEM SHALL** provide complete vercel.json with:

- Environment variable mappings
- Build command overrides
- Framework preset (Next.js)
- Region configuration (optimal for target users)

### REQ-DEPLOY-002: Production Environment Variables

**WHEN** production is deployed, **THE SYSTEM SHALL** validate all required production environment variables:

- DATABASE_URL (Neon/PostgreSQL)
- AUTH_SECRET (minimum 32 characters)
- Google OAuth credentials
- GitHub OAuth credentials
- Sentry DSN
- Upstash Redis credentials
- ImageKit credentials
- Email service credentials (Resend API key)

### REQ-DEPLOY-003: Database Migration

**WHEN** schema changes are deployed, **THE SYSTEM SHALL** execute Drizzle migrations automatically via `pnpm db:push` in deployment pipeline.

### REQ-DEPLOY-004: Health Check Endpoint

**WHEN** production is running, **THE SYSTEM SHALL** provide `/api/health` endpoint returning:

- Application version
- Database connectivity status
- Redis connectivity status (if configured)
- Timestamp

### REQ-DEPLOY-005: Error Monitoring

**WHEN** errors occur in production, **THE SYSTEM SHALL** report to Sentry with:

- Full stack traces
- User context (when available)
- Breadcrumbs (user actions leading to error)
- Environment tags (development, staging, production)

### REQ-DEPLOY-006: Security Headers

**WHEN** HTTP responses are sent, **THE SYSTEM SHALL** include:

- Content-Security-Policy (strict CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS with preload)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (restrictive)

### REQ-DEPLOY-007: SSL/TLS Enforcement

**WHEN** deployed to production, **THE SYSTEM SHALL** enforce HTTPS for all connections with automatic HTTP-to-HTTPS redirect.

### REQ-DEPLOY-008: Deployment Verification

**WHEN** deployment completes, **THE SYSTEM SHALL** verify:

- Homepage loads successfully (200 status)
- Database seeding completed
- All environment variables set correctly
- Health check endpoint returns success
- Error monitoring is active
- SSL certificate is valid

---

## 10. Validation Gates

### REQ-GATE-001: Phase 1 Validation

**WHEN** Phase 1 completes, **THE SYSTEM SHALL** pass `pnpm type-check` with 0 errors.

### REQ-GATE-002: Phase 3 Validation

**WHEN** Phase 3 completes, **THE SYSTEM SHALL** pass `pnpm db:seed` with successful database population.

### REQ-GATE-003: Phase 6 Validation

**WHEN** Phase 6 completes, **THE SYSTEM SHALL** pass `pnpm validate` (type-check + lint + unit tests) with 0 errors.

### REQ-GATE-004: Phase 8 Validation

**WHEN** Phase 8 completes, **THE SYSTEM SHALL** pass `pnpm build` with successful production build generation.

### REQ-GATE-005: Phase 9 Validation

**WHEN** Phase 9 completes, **THE SYSTEM SHALL** deploy to production with all health checks passing.

---

## 11. Non-Functional Requirements

### REQ-NF-001: Developer Experience

**WHEN** developers use the project, **THE SYSTEM SHALL** provide:

- VS Code recommended extensions (80+ extensions)
- Comprehensive CLI tool (cw command)
- Hot module replacement in development
- TypeScript autocompletion for all APIs
- Database GUI (Drizzle Studio)

### REQ-NF-002: Documentation Quality

**WHEN** documentation is provided, **THE SYSTEM SHALL** ensure:

- All setup guides are comprehensive (8000+ words for .env.md)
- All public APIs are documented with JSDoc
- Architecture is explained with diagrams
- Deployment procedures are step-by-step
- Troubleshooting guides are available

### REQ-NF-003: Code Maintainability

**WHEN** code is written, **THE SYSTEM SHALL** follow:

- 3-layer data pattern (Schema → Mutation/Query → Action)
- Separation of concerns (DAL, actions, components)
- DRY principle (no code duplication)
- SOLID principles
- Consistent naming conventions (kebab-case files, PascalCase components)

### REQ-NF-004: Security Compliance

**WHEN** security is evaluated, **THE SYSTEM SHALL** comply with:

- OWASP Top 10 protections
- Input validation on all user inputs
- SQL injection prevention (parameterized queries only)
- XSS prevention (React escaping + CSP)
- CSRF protection (NextAuth CSRF tokens)
- Rate limiting on all API routes
- Dependency vulnerability scanning (automated)

### REQ-NF-005: Internationalization Ready

**WHEN** i18n is implemented, **THE SYSTEM SHALL** support:

- Directory structure for locales
- react-i18next integration
- Locale-based routing (/en, /es, /fr)
- RTL language support (Arabic, Hebrew)

---

## Traceability Matrix

| Requirement ID  | Phase | Task(s)     | Validation Method                   |
| --------------- | ----- | ----------- | ----------------------------------- |
| REQ-ENV-001     | 1     | Task 16     | File exists, 60+ vars documented    |
| REQ-ENV-002     | 1     | Task 16     | .env.md file 8000+ words            |
| REQ-ENV-003     | 1     | Task 16     | `pnpm validate:env` passes          |
| REQ-TS-001      | 1     | Tasks 1-3   | `pnpm type-check` 0 errors          |
| REQ-TS-002      | 1     | Task 1      | use-toast hook file exists          |
| REQ-TS-003      | 1     | Task 2      | Component syntax errors fixed       |
| REQ-TS-004      | 1     | Task 3      | DAL types exported correctly        |
| REQ-CONFIG-001  | 2     | Task 6      | next.config.ts has security headers |
| REQ-CONFIG-002  | 2     | Task 7      | sitemap.xml generated correctly     |
| REQ-CONFIG-003  | 2     | Task 8      | package.json engines field set      |
| REQ-CONFIG-004  | 2     | Task 9      | tsconfig strict flags enabled       |
| REQ-CONFIG-005  | 2     | Task 10     | ESLint kebab-case rule active       |
| REQ-CONFIG-006  | 2     | Tasks 12-15 | .gitignore updated                  |
| REQ-DB-001      | 3     | Task 17     | data/seed-source/ directory exists  |
| REQ-DB-002      | 3     | Task 17     | imageValidator.ts implemented       |
| REQ-DB-003      | 3     | Task 17     | duplicateDetector.ts implemented    |
| REQ-DB-004      | 3     | Task 17     | Seeding shows progress              |
| REQ-DB-005      | 3     | Task 17     | Error handling in seeds             |
| REQ-UI-001      | 4     | Task 18     | Homepage uses Aceternity UI         |
| REQ-UI-002      | 4     | Task 19     | About page complete                 |
| REQ-UI-003      | 4     | Task 20     | Contact form functional             |
| REQ-UI-004      | 4     | Task 21     | Terms page complete                 |
| REQ-UI-005      | 4     | Task 22     | Privacy page complete               |
| REQ-UI-006      | 4     | Task 23     | Comics listing enhanced             |
| REQ-UI-007      | 4     | Task 24     | Comic detail enhanced               |
| REQ-UI-008      | 4     | Task 25     | Chapter reader enhanced             |
| REQ-STATE-001   | 5     | Task 26     | stores/ directory used              |
| REQ-STATE-002   | 5     | Task 26     | stores/index.ts exports             |
| REQ-STATE-003   | 5     | Task 27     | No direct db in actions             |
| REQ-STATE-004   | 5     | Task 27     | DAL audit script passes             |
| REQ-QUALITY-001 | 6     | Task 28     | ts-morph refactoring done           |
| REQ-QUALITY-002 | 6     | Task 29     | cw CLI functional                   |
| REQ-QUALITY-003 | 6     | Task 30     | 'any' types minimized               |
| REQ-QUALITY-004 | 6     | Task 31     | Cleanup script executed             |
| REQ-QUALITY-005 | 6     | Task 32     | Unused packages removed             |
| REQ-QUALITY-006 | 6     | Task 33     | Path aliases used                   |
| REQ-QUALITY-007 | 6     | Tasks 34-35 | Kebab-case enforced                 |
| REQ-DOC-001     | 7     | Task 36     | JSDoc coverage complete             |
| REQ-DOC-002     | 7     | Task 37     | OpenAPI spec exists                 |
| REQ-TEST-001    | 7     | Task 38     | Unit coverage 100%+                 |
| REQ-TEST-002    | 7     | Task 38     | E2E tests pass                      |
| REQ-TEST-003    | 7     | Task 38     | Axe audit passes                    |
| REQ-BUILD-001   | 8     | Task 39     | `pnpm build` succeeds               |
| REQ-BUILD-002   | 8     | Task 39     | Bundle analysis passes              |
| REQ-BUILD-003   | 8     | Task 39     | Lighthouse 90+ performance          |
| REQ-PERF-001    | 8     | Task 39     | Redis caching active                |
| REQ-PERF-002    | 8     | Task 39     | Rate limiting functional            |
| REQ-PERF-003    | 8     | Task 39     | Image pipeline tested               |
| REQ-DEPLOY-001  | 9     | Task 40     | vercel.json complete                |
| REQ-DEPLOY-002  | 9     | Task 40     | Prod env vars validated             |
| REQ-DEPLOY-003  | 9     | Task 40     | Migrations run successfully         |
| REQ-DEPLOY-004  | 9     | Task 40     | Health endpoint works               |
| REQ-DEPLOY-005  | 9     | Task 40     | Sentry receives errors              |
| REQ-DEPLOY-006  | 9     | Task 40     | Security headers present            |
| REQ-DEPLOY-007  | 9     | Task 40     | HTTPS enforced                      |
| REQ-DEPLOY-008  | 9     | Task 40     | Deployment verified                 |

---

## Requirements Coverage Statistics

- **Total Requirements**: 70 (REG-\* numbered requirements)
- **Phases Covered**: 9 phases
- **Tasks Covered**: 40 tasks
- **Validation Gates**: 5 gates (Phase 1, 3, 6, 8, 9)
- **Non-Functional Requirements**: 5 (Developer Experience, Documentation, Maintainability, Security, i18n)

---

## Glossary

- **EARS**: Easy Approach to Requirements Syntax
- **DAL**: Data Access Layer
- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **TTL**: Time To Live
- **CDN**: Content Delivery Network
- **OAuth**: Open Authorization
- **GDPR**: General Data Protection Regulation
- **CCPA**: California Consumer Privacy Act
- **WCAG**: Web Content Accessibility Guidelines
- **OWASP**: Open Web Application Security Project
- **AST**: Abstract Syntax Tree
- **JSDoc**: JavaScript Documentation
- **E2E**: End-to-End
- **i18n**: Internationalization
- **RTL**: Right-to-Left
