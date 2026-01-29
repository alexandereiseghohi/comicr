Developer setup & sprint plan — ComicWise

Quick bootstrap

1. Install Node 20.x and pnpm (pnpm >= 10).
2. From repo root:

```bash
pnpm install
pnpm type-check
pnpm lint
pnpm format:check
pnpm db:push    # if using the project's drizzle/migration scripts
pnpm db:seed    # seed DB if seeds exist
pnpm dev
```

Prerequisites

- Node 20.x (LTS)
- pnpm (repo uses pnpm)
- Git
- Postgres (local Docker container or cloud); Redis (local or Upstash) if using caching.
- Optional: Playwright browsers: `npx playwright install --with-deps`

VS Code setup (recommended)

1. Install recommended extensions (or use `.vscode/extensions.json` if present):
   - dbaeumer.vscode-eslint (ESLint)
   - esbenp.prettier-vscode (Prettier)
   - ms-vscode.vscode-typescript-next (TypeScript)
   - bradlc.vscode-tailwindcss (Tailwind)
   - ms-playwright.playwright (Playwright)
   - vitest.explorer (Vitest)
   - cweijan.vscode-postgresql-client2 or similar (Postgres)
   - redis.redis-for-vscode (Redis)
   - github.copilot (optional)

2. Workspace settings (add to `.vscode/settings.json` or enable in workspace):
   - `editor.tabSize = 2`
   - `editor.formatOnSave = true`
   - `editor.defaultFormatter = "esbenp.prettier-vscode"`
   - `"eslint.codeActionsOnSave": { "source.fixAll": true }`
   - `typescript.tsdk = ./node_modules/typescript/lib`

3. Launch & Tasks
   - Ensure `.vscode/launch.json` contains configs for:
     - Next dev (runs `pnpm dev`)
     - Node attach (port 9229 for debug)
     - Vitest runs/debug
     - Playwright runs
   - Ensure `.vscode/tasks.json` has tasks for Dev, Build, Type Check, Lint, Unit tests, E2E tests, DB push/seed

4. Env handling
   - Copy `.env.example` → `.env.local` and fill values (do not commit secrets).
   - Confirm `.env.local` is in `.gitignore`.

5. Validation

```bash
pnpm validate   # if available
pnpm test:unit
pnpm test       # Playwright E2E (if configured)
```

WebStorm setup (short)

1. Configure Node interpreter to Node 20 and set pnpm as package manager.
2. TypeScript: use `node_modules/typescript`.
3. Create Run/Debug configurations for `dev`, `dev:debug`, `build`, `type-check`, `lint`, `test:unit`, `test`.
4. Enable ESLint & Prettier integrations, and "Run eslint --fix" on save or format on save.
5. Add Database connection in Database tool using `DATABASE_URL`.
6. Optional: configure Playwright plugin or run config.

.env.example (template)

Create `.env.example` in repo root with these placeholders (do not commit real secrets):

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/comicwise

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace_with_32_characters_minimum

# Redis (Upstash or local)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# or local
REDIS_URL=redis://localhost:6379

# Email (if used)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=

# OAuth (if used)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Sentry
SENTRY_DSN=
```

How to run locally

- Dev server: `pnpm dev`
- Type check: `pnpm type-check`
- Lint: `pnpm lint`
- Unit tests: `pnpm test:unit`
- E2E tests: `pnpm test` (Playwright)
- Build: `pnpm build`

Prioritized implementation task list (handoff-ready)

High priority (Sprint 1)

1) User Profile pages & server actions
- Files:
  - src/app/profile/page.tsx  (exists)
  - src/app/profile/edit/page.tsx (exists)
  - src/app/profile/change-password/page.tsx (exists)
  - src/lib/schemas/userSchema.ts (MISSING)
  - src/actions/user.server.ts (MISSING)
- Commands:
```
pnpm type-check
pnpm dev
pnpm test:unit
```
- Acceptance: pages reachable and server-side validation with Zod; DB updates work.

2) Comics listing, details, chapter reader & DAL
- Files:
  - src/app/comics/page.tsx (exists)
  - src/app/comics/[slug]/page.tsx (exists)
  - src/app/comics/[slug]/chapters/[chapter-id]/page.tsx (exists)
  - src/dal/comic-dal.ts (exists)
  - src/lib/utils/comic-utils.ts (MISSING)
- Commands:
```
pnpm db:push
pnpm db:seed
pnpm type-check
pnpm test:unit
pnpm dev
```
- Acceptance: listing and detail pages render seeded data, chapter reader works.

3) Search
- Files:
  - src/app/search/page.tsx (exists)
  - search queries exist under src/database/queries/comics.ts
- Acceptance: Search returns relevant results and is debounced.

Medium priority (Sprint 2)

4) Admin CRUD & polishing
- Many admin pages exist under `src/app/admin/*` — verify and add tests.

5) Caching & image performance
- Add `src/lib/cache/redis.ts` (MISSING)
- Migrate images to next/image (components under src/components/*)

6) Tests & QA
- Tests exist under `src/tests/*`. Expand coverage for DAL and actions.

Lower priority (Sprint 3)

7) Docs & deployment
- Add `DEVELOPER_SETUP.md` to repo root (content available)
- Update README and docs/

8) Monitoring & Sentry
- Verify sentry config files and `.env.production.template` entries

Issue templates (ready for import)

-- Ticket 001 — HIGH: Add Zod user schemas and server actions for profile pages --

## Description
Implement server-side validation and server-actions for profile edit and change-password flows used by existing profile pages.

## Files to create / edit
- Create: `src/lib/schemas/userSchema.ts`
- Create: `src/actions/user.server.ts` (or `src/app/(root)/profile/actions.ts` matching repo convention)
- Edit: `src/app/(root)/profile/edit/page.tsx`
- Edit: `src/app/(root)/profile/change-password/page.tsx`
- Add tests: `src/tests/unit/actions/user.server.test.ts` (or extend `src/tests/lib/actions/users.test.ts`)

## Acceptance criteria
- Client and server use Zod schemas for validation.
- Server actions update user in DB and return clear errors.
- `pnpm type-check` succeeds and unit tests for actions pass.

## Commands
```
pnpm type-check
pnpm test:unit
pnpm dev
```

Estimate: 8–12 hours

-- Ticket 002 — HIGH: Comic utilities + stabilize DAL usage & tests --

## Description
Add utility helpers for comics (slug generation, pagination, image helpers), ensure DAL functions are unified and covered by unit tests, and verify comic list/details/chapters rendering.

## Files to create / edit
- Create: `src/lib/utils/comic-utils.ts`
- Edit/Verify: `src/dal/comic-dal.ts`, `src/dal/chapter-dal.ts`
- Edit: `src/app/(root)/comics/page.tsx`, `src/app/(root)/comics/[slug]/page.tsx`, `src/app/(root)/comics/[slug]/chapters/[chapter-id]/page.tsx`
- Add tests: `src/tests/unit/comic-utils.test.ts` and extend `src/tests/unit/actions/comic.test.ts`

## Acceptance criteria
- Utilities implemented and unit-tested.
- Pages render seeded data and are type-safe.
- No regressions in existing comic tests.

## Commands
```
pnpm db:push
pnpm db:seed
pnpm type-check
pnpm test:unit
pnpm dev
```

Estimate: 12–20 hours

-- Ticket 003 — HIGH: Verify & improve search (backend + UI) --

## Description
Ensure search query functions and UI return relevant results; add debounce, pagination and accessibility improvements.

## Files to edit / create
- Edit: `src/database/queries/comics.ts` (tune search)
- Edit: `src/app/(root)/search/page.tsx` (debounce, accessibility)
- Add tests: `src/tests/integration/search.test.tsx`

## Acceptance criteria
- Search returns relevant title/author results with pagination.
- UI is debounced and accessible.
- Integration tests verify expected search behavior.

## Commands
```
pnpm type-check
pnpm test:unit
pnpm test   # optional Playwright E2E
```

Estimate: 4–6 hours

-- Ticket 004 — MEDIUM: Add Redis caching utility and integrate into DAL --

## Description
Add a Redis cache layer supporting Upstash or local Redis and integrate caching into heavy DAL queries (comics list, top comics, comic details).

## Files to create / edit
- Create: `src/lib/cache/redis.ts`
- Edit: `src/dal/comic-dal.ts` / `src/database/queries/comics.ts` to use cache
- Update: `.env.example` docs for `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- Add tests: `src/tests/unit/cache.redis.test.ts` (mocked)

## Acceptance criteria
- Cache util respects env config and falls back to no-op if missing.
- At least one endpoint caches responses; cache hits are observable via logs.
- Unit tests cover caching logic.

## Commands
```
pnpm type-check
pnpm test:unit
```

Estimate: 6–12 hours

-- Ticket 005 — MEDIUM: Migrate hero images to `next/image` + placeholders --

## Description
Replace critical `<img>` usages with `next/image` and implement blurred or low-res placeholders for list and reader components.

## Files to edit / create
- Edit: `src/components/comics/comics-list.tsx`
- Edit: reader component under `src/app/(root)/comics/.../chapters/*`
- Create (optional): `src/lib/image/placeholders.ts`
- Update `next.config.ts` if missing image domains or formats

## Acceptance criteria
- Critical images use `next/image` with lazy loading and placeholders.
- Build succeeds and no console errors.
- Local checks show improved image load UX.

## Commands
```
pnpm type-check
pnpm dev
pnpm build
```

Estimate: 4–8 hours

-- Ticket 006 — MEDIUM: Admin polishing & CRUD test coverage --

## Description
Polish admin flows (comics/genres/authors/chapters), add server-side validation consistency and integration tests.

## Files to edit / create
- Edit: admin pages under `src/app/admin/*` (forms, error handling)
- Add tests: `src/tests/integration/admin.comics.test.ts`, unit tests for `src/app/admin/.../actions.ts`

## Acceptance criteria
- Admin CRUD flows have integration tests passing locally.
- Forms validate and surface server errors consistently.

## Commands
```
pnpm test:unit
pnpm test
```

Estimate: 6–10 hours

-- Ticket 007 — MEDIUM: Expand test coverage & CI integration --

## Description
Raise coverage for critical modules and ensure CI runs unit tests, E2E tests and linting.

## Files to create / edit
- Create/Edit CI workflow: `.github/workflows/ci.yml` (if absent)
- Expand tests in `src/tests/*`
- Ensure `package.json` scripts include `test:unit`, `test:e2e`, `validate`

## Acceptance criteria
- CI runs `pnpm install`, `pnpm test:unit`, `pnpm test`, and `pnpm lint`.
- Coverage for core DAL/actions reaches agreed threshold.

## Commands
```
pnpm install
pnpm test:unit
pnpm test
pnpm lint
```

Estimate: 8–16 hours

-- Ticket 008 — LOW: Developer docs & onboarding file (DEVELOPER_SETUP.md) --

## Description
Add the developer setup document and ensure `.env.example` is up-to-date for new contributors.

## Files to create / edit
- Create: `DEVELOPER_SETUP.md` (content provided)
- Verify/Edit: `.env.example` and `.envs/*.template`

## Acceptance criteria
- `DEVELOPER_SETUP.md` added to repo root.
- Developers can follow the doc to run `pnpm install` and `pnpm dev` (with local secrets).

## Commands
```
pnpm install
pnpm dev
```

Estimate: 1–2 hours

-- Ticket 009 — LOW: Production readiness — Sentry & deployment vars --

## Description
Prepare production env checklist and verify Sentry init and production build readiness.

## Files to edit / create
- Edit: `next.config.ts` (verify settings)
- Verify/Edit: sentry config files (`sentry.client.config.ts`, `sentry.server.config.ts`)
- Update: `.env.production.template` with `SENTRY_DSN`, `DATABASE_URL`, `REDIS` and OAuth secrets
- Update CI/CD docs

## Acceptance criteria
- `pnpm build` succeeds with documented production envs.
- Sentry DSN usage documented and configurable.

## Commands
```
pnpm build
```

Estimate: 4–8 hours

-- Ticket 010 — LOW: Developer ergonomics & repo housekeeping --

## Description
Verify and improve `.vscode` tasks/launch, ensure Husky/pre-commit hooks run, and add small helper scripts for dev ergonomics.

## Files to edit / create
- Edit: `.vscode/tasks.json`, `.vscode/launch.json` to ensure tasks for `dev`, `type-check`, `test:unit`, `test`
- Edit: `package.json` scripts (add helpers if missing)
- Verify Husky in `package.json` (prepare) and `.husky/` hooks

## Acceptance criteria
- VS Code tasks and launch configs allow running & debugging dev server and tests.
- `pnpm prepare` sets up Husky hooks (if Husky is used).

## Commands
```
pnpm install
pnpm prepare
```

Estimate: 2–4 hours

-- End of plan file --
