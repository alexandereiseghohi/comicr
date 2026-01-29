Plan: CRUD scaffold, parallelization, robust fixes, and CI tuning

Overview

Scaffold CRUD for tables 1–5 (author, artist, type, genre, tag) in parallel using a 5-file pattern per entity, stabilize DB relations by performing a robust fix for `comic.author`, then implement tables 6–12 sequentially once relations are stable. Enforce a quick-patch policy (TODO + issue link) and gate CI on fast unit tests while running Playwright E2E in a separate workflow or on schedule.

Files to create (per-entity template)

- `src/lib/schemas/{entity}-schema.ts` — Zod schemas: create/update types and exports
- `src/database/queries/{entity}.queries.ts` — getList/getById/getBySlug/search
- `src/database/mutations/{entity}.mutations.ts` — create/update/delete
- `src/app/api/{plural}/route.ts` and `src/app/api/{plural}/[id]/route.ts` — API routes w/ validation
- `src/lib/actions/{entity}.actions.ts` — server actions used by pages/components

High-level steps

1. Foundation (pre-reqs)

- Ensure `pnpm type-check` runs locally and is included in CI. Add `test:unit`, `test:e2e`, and `validate` scripts in `package.json`.
- Add `.env.example` and `src/lib/env.ts` to validate runtime env with Zod.

2. Parallel scaffold (Tables 1–5)

- Assign one developer per entity file-group (schemas, queries, mutations, api, actions).
- Each developer creates the 5-file pattern and a minimal vitest smoke test that does create→read (mocked DB or test DB).
- Acceptance: each entity compiles and unit smoke tests pass.

3. Robust fix: `comic.author` (required before tables 6–12)

- Update `src/database/schema.ts` to define FK and relation for `comic.author` explicitly.
- Update `src/database/queries/comic-queries.ts` (e.g., `getComicBySlug`) to include `author` relation in selects/joins.
- Update UI code (`src/app/(root)/comics/[slug]/page.tsx`) to safely render `comic.author?.name` with fallback.
- Add unit tests asserting `getComicBySlug` returns author when present and handles missing author gracefully.
- Acceptance: `pnpm type-check` and `pnpm build` succeed; unit tests for `getComicBySlug` pass.

4. Sequential scaffold (Tables 6–12)

- After step 3 validation, scaffold remaining tables sequentially, prioritizing ones with no new FK dependencies first and dependent tables last.
- Use the same 5-file pattern and smoke tests for each.

5. Pages & components (parallel where possible)

- Once schemas/actions exist, implement pages: profile (view/edit), comics listing/detail, chapter reader, bookmarks, root pages.
- Reader components (ChapterReader, ImageViewer) and shared components (ComicCard, Filters) may be developed in parallel by front-end engineers.

6. Tests & CI

- Add `test:unit` (Vitest) using an in-memory or seeded test DB so tests are fast.
- Add `test:e2e` (Playwright) to a separate workflow `.github/workflows/e2e.yml` run on schedule or manual dispatch.
- Create `.github/workflows/ci.yml` that runs install, `pnpm type-check`, `pnpm lint`, and `pnpm run test:unit` with caching.
- Acceptance: PRs require CI green to merge; PRs may skip E2E during feature development.

7. Quick-patch policy

- Quick patches are allowed only as temporary unblockers.
- Any quick patch must include a TODO comment with an issue link and owner in code: `// TODO(quick-patch): ISSUE-123 — short reason`.
- PR checklist must include `quick-patch` label and a follow-up issue with owner and ETA before merging to `main`.

8. Branching & merge strategy

- Use short-lived feature branches (e.g., `feat/{entity}/{short-desc}`) and rebase frequently to avoid schema drift.
- Assign one developer per entity to reduce conflicts on the same files.
- Protect `main`: require PR reviews, CI passing, and at least one approval.

9. Seeding & staging

- Use `pnpm db:seed:dry-run` for verification and `pnpm db:seed` for staging to populate test data before running E2E.
- Keep seed runner idempotent and provide a `--dry-run` flag.

Operational rules (enforcement)

- Local pre-push: run `pnpm type-check` locally before pushing. Implement a Husky `pre-push` hook or document the step in `CONTRIBUTING.md`.
- PR template: require checklist items: `pnpm type-check` ran, unit tests added/updated, owner assigned for quick-patches (if any), issue link for quick-patch.
- CI: `ci.yml` must run the `validate` script (type-check + lint + test:unit). E2E runs in `e2e.yml` scheduled/dispatch-only.

Suggested `package.json` script additions

- `test:unit` — run vitest with in-memory DB or test fixtures
- `test:e2e` — run playwright tests
- `validate` — `pnpm type-check && pnpm lint && pnpm run test:unit`

Docs to add

- `CONTRIBUTING.md` — include parallelization, quick-patch policy, branch naming, local pre-push rules.
- `.github/PULL_REQUEST_TEMPLATE.md` — PR checklist enforcing type-check, tests, and quick-patch follow-ups.
- `docs/engineering/parallelization.md` — per-entity assignment template and merge guidelines.

Acceptance criteria (project-level)

- Tables 1–5 scaffolded in parallel with passing unit smoke tests.
- `comic.author` robust fix applied and validated (build + unit tests).
- Tables 6–12 scaffolded sequentially after relations are validated.
- CI blocks merges on failing unit tests; Playwright E2E runs separately and does not block fast iteration.
- Quick patches are traceable (TODO + issue) and replaced by robust fixes per policy.

Notes & next steps

- Recommended immediate actions: create `CONTRIBUTING.md`, add `pre-push` hook (or document local step), create PR template, and add `ci.yml` + `e2e.yml` workflow stubs.
- If you want, I can now create drafts for `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `package.json` script stubs, and CI workflow templates.
