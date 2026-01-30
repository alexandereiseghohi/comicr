# swift-complete.prompt

# Purpose:

# Assist GitHub Copilot / an automation agent to complete repository phases/todos/tasks/items

# using Next.js latest best practices (app router, server components, streaming, edge where appropriate),

# DRY principle, correct sequencing, and parallelization when safe. Skip items already completed unless

# actionable suggestions exist.

--- AGGREGATED LIST (phases, todos, tasks, items) ---
Phases:

1. ANALYZE
2. DESIGN
3. IMPLEMENT
4. VALIDATE
5. REFLECT
6. HANDOFF

Memory-bank & documentation tasks:

- projectbrief.md
- productContext.md
- activeContext.md
- systemPatterns.md
- techContext.md
- progress.md
- tasks/\_index.md
- tasks/TASK###-\*.md files (per-task files in tasks/)

Testing / QA tasks:

- Create Playwright E2E tests under `tests/` using `<feature>.spec.ts` naming
- Add unit tests (Jest / Vitest depending on repo) for business logic
- Accessibility snapshots (`toMatchAriaSnapshot`) for major components
- CI test workflows

Performance tasks:

- Measure-first: add profiling/benchmark steps
- Image compression and modern formats (AVIF/WebP)
- Code splitting / dynamic imports
- Lazy load assets and use streaming SSR where relevant
- Caching (Redis / in-memory / edge) and cache invalidation policy
- Bundle minification & tree-shaking; enable HTTP/2/3 and CDN usage

Code quality / review tasks:

- Security review: no secrets in code, parameterized queries, input validation
- Correctness: unit and integration tests for critical flows
- Performance: N+1 checks, DB indices, caching
- Documentation: README, API docs, in-code comments for complex logic

Repository housekeeping:

- Add `.env` placeholder if missing (with guidance)
- Ensure `package.json` scripts: build, dev, test, lint
- Linting, formatting (ESLint, Prettier)
- CI pipeline updates: tests, lint, build artifact

Agent operational tasks:

- For each task: produce files to change/create, tests to add, commands to run, and a concise PR description
- Update `tasks/_index.md` and relevant `tasks/TASK*.md` entries to reflect progress
- Use memory bank files to reflect decisions and active context

--- INSTRUCTIONS FOR THE AGENT USING THIS PROMPT ---
Goal: For every item in the aggregated list, implement or complete it using Next.js best practices and the DRY principle. Operate idempotently: detect and skip already-completed items, but provide recommendations for completed items if improvements exist.

1. Discovery & Skip logic

   - For each listed item, detect current status in repo:
     - Documentation tasks: check for file existence and last-modified content.
     - Coding tasks: check for tests, relevant files, CI steps.
     - If an item is clearly implemented and up-to-date, mark it SKIP with a one-line suggestion or leave unchanged.
   - If status ambiguous, create a minimal PR or PR-draft that shows proposed small, reversible changes and include clear tests.

2. Implementation rules (always follow)

   - Use Next.js app-router patterns (server components by default where appropriate).
   - Prefer server-side rendering and streaming for data-heavy pages; use client components only when needed.
   - Use TypeScript types across public interfaces.
   - Keep components small and composable; extract shared logic into hooks/utilities to respect DRY.
   - Use React Server Actions / fetch() optimally (where the Next.js version supports them).
   - Use environment variables for secrets; if `.env` missing, add `.env.example` with placeholders.
   - Add or update `README.md` sections only when adding or changing a feature or workflow.

3. Sequencing & parallelization

   - Sequence: ANALYZE -> DESIGN -> IMPLEMENT -> VALIDATE -> REFLECT -> HANDOFF.
   - Parallelizable tasks (do these concurrently when safe):
     - Asset optimization (images/fonts) across static assets
     - Unit tests for independent modules
     - Documentation updates that don't depend on code changes
     - Linting and formatting checks
   - Non-parallel tasks (must be serialized):
     - Schema or API contract changes
     - Core architecture changes that affect multiple modules

4. Deliverables per completed task
   For each implemented item, produce:

   - status: completed/skipped/updated
   - short summary (1-2 lines)
   - files added/changed (relative paths)
   - commands to run to test locally (one-liners)
   - CI changes if any
   - PR title and one-paragraph PR description (including risk & rollback notes)
   - tests added/modified and how they cover the change

5. Testing & validation guidance

   - Unit tests: fast, isolated, use Mocks for external services
   - Integration tests covering DB/API contracts
   - Playwright E2E tests should:
     - Use role-based locators (`getByRole`, `getByLabel`, `getByText`)
     - Use `test.step()` for logical grouping
     - Use `toMatchAriaSnapshot` for accessibility checks of key flows
   - Add `npm/yarn` scripts and CI steps to run those tests
   - Include a short performance check (Lighthouse or `next build && next start` + a sample curl for SSR performance) in the PR notes

6. Code review & quality gate

   - Ensure no secrets, use env vars
   - Add or update ESLint rules and run lint in CI
   - Add a checklist to PR template linking to:
     - Security checks performed
     - Tests added and passing
     - Performance impact statement
     - Memory bank / design docs updated (link to file)

7. Memory Bank / Tasks updates

   - Update `tasks/_index.md` and the specific `tasks/TASKID-*.md`:
     - Mark status (In Progress / Completed / Blocked)
     - Add a short progress log entry with date and summary
   - Update `activeContext.md` if implementation decisions are significant
   - Add Decision Record into workspace if architectural choices changed

8. Heuristics for "skip but suggest"

   - If an item is present but lacks tests, mark as SKIPPED and create a minimal PR adding tests only
   - If documentation exists but is outdated, update it and include a "docs-only" PR
   - If performance improvements are possible but non-critical, add a recommendation issue and leave code untouched

9. Safety & rollback
   - Keep changes small and reversible
   - For DB or schema changes, provide migration scripts and a rollback plan
   - Add feature flags for large runtime behavior changes

--- AGENT OUTPUT TEMPLATES (strict format, machine-friendly) ---
When you propose a change, return JSON wrapped in triple backticks so automation can parse. Example:

```json
{
  "task_id": "ANALYZE-01",
  "item": "projectbrief.md",
  "status": "completed|skipped|blocked",
  "summary": "One-line description",
  "files": ["path/to/file.md", "src/..."],
  "commands": ["npm install", "npm test"],
  "pr_title": "<short title>",
  "pr_description": "<one paragraph>",
  "tests": ["tests/login.spec.ts"],
  "notes": "optional freeform notes"
}
```
