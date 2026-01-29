# swift-complete2.prompt
## ComicWise Copilot Agent: Sequenced & Parallelized Task Completion (Jan 29, 2026)

### Purpose
Guide Copilot agents to:
- Sequence and parallelize all actionable tasks, skipping completed ones.
- Log all major lifecycle events (start, progress, error, completion) using structured logging and Sentry.
- Apply Next.js 16+ best practices, DRY, and robust error handling.

---

## 1. Task Inventory (Phases, Todos, Tasks, Items)

### Phases (from IMPLEMENTATION_PROGRESS.md, process-verification-1.md, etc.)
- Phase 1: Type Definitions & Package Setup (Complete)
- Phase 2: Authentication Pages & Components (Complete)
- Phase 3: Comic CRUD Operations & All Tables (Complete)
- Phase 4: Dynamic Seeding System (Complete)
- Phase 5: Pages & Components (Complete)
- Phase 6: Configuration Optimization (Complete)
- Phase 7: Documentation & Tests (Complete)
- Verification/CI Integration (Complete)
- Advanced Search & Filtering (In Progress, see TASK003)
- Admin Panel for Comic Uploads (Pending, see tasks/_index.md)

### Major Tasks & Todos (from prompts, plans, tasks, checklists)
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

## 2. Sequencing & Parallelization

- **Skip**: All phases and tasks marked as complete.
- **In Progress**: Continue/complete Advanced Search & Filtering (TASK003).
- **Pending**: Start Admin Panel for Comic Uploads and TASK-011.
- **Parallelize**: UI enhancements, test coverage, and image migration can be done in parallel with pending tasks.
- **Recommendations**: For completed items, only suggest improvements if best practices have changed.

---

## 3. Next.js 16+ Best Practices

- Use App Router, server components, and strict TypeScript.
- Use Zod for schema validation.
- Use server actions for mutations.
- Use next/image for all images.
- Ensure all pages/components are accessible and tested.
- Use DRY utilities for logging, error handling, and data access.
- Use Sentry for error and performance monitoring.

---

## 4. Logging & Error Handling

- Log all task lifecycle events (start, progress, error, completion) using structured JSON and Sentry breadcrumbs.
- Filter sensitive data from logs and Sentry events.
- Use Sentry spans for performance-critical code.
- Document all logging/monitoring actions.

**Example:**
```typescript
import * as Sentry from "@sentry/nextjs";
console.info(JSON.stringify({ event: "task_start", task: "[TASK_NAME]" }));
Sentry.addBreadcrumb({ category: "task", message: "Started [TASK_NAME]", level: "info" });
try {
  // ...task logic...
} catch (error) {
  console.error(JSON.stringify({ event: "error", task: "[TASK_NAME]", error }));
  Sentry.captureException(error, { tags: { task: "[TASK_NAME]" } });
  throw error;
} finally {
  console.info(JSON.stringify({ event: "task_complete", task: "[TASK_NAME]" }));
  Sentry.addBreadcrumb({ category: "task", message: "Completed [TASK_NAME]", level: "info" });
}
```

---

## 5. Checklist for Copilot Agents

- [x] Skip completed phases/tasks/items.
- [x] Sequence and parallelize pending/in-progress tasks.
- [x] Use Next.js 16+ best practices and DRY principle.
- [x] Log all major lifecycle events.
- [x] Use Sentry for error/performance monitoring.
- [x] Recommend improvements only for completed items if best practices have changed.

---

**End of prompt.**
