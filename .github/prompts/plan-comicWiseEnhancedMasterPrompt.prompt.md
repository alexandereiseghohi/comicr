# ComicWise – Enhanced Master Prompt (Advanced Search, Admin Uploads, Parallelization)

## Executive Summary

This prompt is tailored for the current project phase, focusing on advanced search/filtering (TASK003), launching the Admin Panel for comic uploads (and TASK-011), and parallelizing UI, test, and image migration enhancements. For completed items, only suggest improvements if best practices have changed.

---

## 1. Phases (from all prompts)

- Phase 0: Discovery & Preparation
- Phase 1: Foundation & Setup (VS Code, config, env, DB)
- Phase 2: Seed System Optimization
- Phase 3: Comic CRUD Operations & All Tables
- Phase 4: Dynamic Seeding System
- Phase 5: Pages & Components
- Phase 6: Configuration Optimization
- Phase 7: Documentation & Tests
- Phase 8: Testing & Quality Assurance
- Phase 9: Optional Enhancements (i18n, analytics, onboarding)
- Verification/CI Integration
- Advanced Search & Filtering (In Progress)
- Admin Panel for Comic Uploads (Pending)

---

## 2. Core Implementation Principles

- Use existing patterns (admin panel, DAL, DTO, path aliases)
- Type safety (strict TypeScript, no `any`)
- Zod validation for all user input
- Server actions for all mutations
- Comprehensive error handling and user feedback
- Progress tracking and logging
- Component reusability
- Performance optimization (images, queries, bundles)
- Accessibility (WCAG, ARIA, keyboard navigation)
- Documentation (JSDoc, README, API docs)
- Security (no secrets in code, parameterized queries, input validation)
- DRY principle and code deduplication

---

## 3. Major Tasks & Todos

### Foundation & Setup

- [ ] Create `.env.local` from `src/lib/env.ts` schema
- [ ] Validate all VS Code configuration files
- [ ] Backup all config files before changes
- [ ] Confirm all environment variables are set and validated

### CRUD & Data

- [ ] Implement 5-file CRUD pattern for all tables (schemas, queries, mutations, API, actions)
- [ ] Robust fix for `comic.author` relation
- [ ] Sequentially scaffold tables 6–12 after relations are validated
- [ ] Enhance seed system (batched, zod-validated, image helpers, deduplication)
- [ ] Ensure seeders produce deterministic public URLs

### Pages & Components

- [ ] Profile view and edit pages
- [ ] Comics listing/detail, chapter reader, bookmarks, root pages
- [ ] Admin panel for comic uploads
- [ ] Zustand stores for state management
- [ ] Shared components (ComicCard, Filters, ChapterReader, ImageViewer)

### Testing & QA

- [ ] Add Playwright E2E tests for all major flows
- [ ] Add Vitest unit tests for schemas, logic, and actions
- [ ] Accessibility snapshots (`toMatchAriaSnapshot`)
- [ ] CI test workflows (unit, E2E, lint, type-check)

### Optimization & Housekeeping

- [ ] Standardize types and Zod schemas (canonicalize in `src/types` and `src/lib/validations`)
- [ ] Enable Next.js `cacheComponents` after fixing incompatibilities
- [ ] Implement cleanup scripts for unused files/packages
- [ ] Optimize images (AVIF/WebP), code splitting, lazy loading, caching
- [ ] Migrate all images to `next/image`
- [ ] Enhance accessibility and ARIA

### Documentation

- [ ] Update memory bank files (`projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`)
- [ ] Update `tasks/_index.md` and per-task markdown files
- [ ] Add/Update `CONTRIBUTING.md`, PR templates, and engineering docs

---

## 4. Sample Aggregated Checklist

- [x] .vscode configuration (DONE)
- [x] Config file optimization (DONE/needs validation)
- [x] Seed system enhancement (DONE)
- [x] Route pages (DONE/enhance UI)
- [x] Zustand stores (NEEDS CREATION, if not present)
- [x] Query/mutation refactoring (DONE)
- [x] Cleanup, optimization, scripts, testing (DONE)
- [x] Foundation (docs, templates, configs) (DONE)
- [x] CRUD scaffolding for all entities (DONE)
- [x] CI/CD, E2E, and unit test setup (DONE)
- [ ] Advanced search/filtering UI (In Progress)
- [ ] Admin panel for comic uploads (Pending)
- [ ] TASK-011: Ensure seeders produce deterministic public URLs (Pending)
- [ ] Expand DAL and action test coverage (Recommended)
- [ ] Migrate all images to next/image (Recommended)
- [ ] Enhance accessibility and ARIA (Recommended)

---

## 5. Operational & Execution Rules

- Always backup before changes
- Use PowerShell for scripting on Windows
- Use pnpm for all package and script management
- Run type-check, lint, and build after any change
- Use dry-run for cleanup scripts before applying
- Document all changes in memory bank and task files
- Log all major lifecycle events (start, progress, error, completion) using structured logging and Sentry

---

## 6. Example File Patterns & Locations

- `src/lib/schemas/{entity}-schema.ts` — Zod schemas
- `src/database/queries/{entity}-queries.ts` — DB queries
- `src/database/mutations/{entity}-mutations.ts` — DB mutations
- `src/app/api/{plural}/route.ts` — API routes
- `src/lib/actions/{entity}.actions.ts` — server actions
- `src/types/dtos/*.ts` — DTOs
- `src/lib/validations/index.ts` — canonical Zod exports
- `tests/` — unit and E2E tests

---

## 7. Sequencing & Parallelization

- Sequence: ANALYZE → DESIGN → IMPLEMENT → VALIDATE → REFLECT → HANDOFF
- Parallelize: Asset optimization, unit tests, documentation, linting, formatting
- Serialize: Schema/API contract changes, DB migrations, major refactors

---

## 8. Safety & Best Practices

- Dry-run is default for cleanup; `--apply` must be confirmed
- Timestamped backups for all destructive actions
- Preserve entry points and config files by default
- Review all reports/scripts before applying changes
- Use Sentry for error and performance monitoring

---

## 9. Acceptance Criteria

- All phases/tasks/items completed or marked as skipped with rationale
- All tests and `pnpm validate` pass before marking as complete
- No `any` types introduced
- Zod schemas tested
- At least one Playwright smoke test for main flow
- Accessibility basics: headings, alt text, labels

---

## 10. Next Steps

1. Complete TASK003: Advanced Search & Filtering.
2. Launch Admin Panel for Comic Uploads and implement TASK-011.
3. Parallelize UI, test, and image migration improvements.
4. Review completed items for best practice updates; suggest changes only if warranted.
5. Update documentation and memory bank to reflect progress.

---

> Use this prompt as the authoritative guide for the next project phase. Update as new priorities emerge.
