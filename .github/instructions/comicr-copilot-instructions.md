# Copilot Instructions for ComicWise (comicr)

## Project Architecture

- **Framework:** Next.js (App Router, TypeScript, Tailwind, shadcn/ui)
- **Key Directories:**
  - `src/app/` — Next.js app routes, layouts, and API endpoints
  - `src/components/` — Reusable React components (UI, navigation, auth, etc.)
  - `src/schemas/` — Zod schemas for validation (e.g., `comic.schema.ts`, `chapter.schema.ts`)
  - `src/dal/` — Data access layer (database, queries, mutations)
  - `scripts/` — Automation scripts (e.g., `db-seed.ts`)
  - `tests/` — Unit (Vitest) and e2e (Playwright) tests

## Developer Workflows

- **Install:** `pnpm install`
- **Setup env:** Copy `.env.local.example` → `.env.local` and fill in values
- **Database:**
  - Push schema: `pnpm db:push`
  - Seed: `pnpm db:seed`
- **Validation:** `pnpm validate` (runs type-check, lint, and tests)
- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Test:**
  - Unit: `pnpm test`
  - E2E: `pnpm playwright test`

## Project Conventions

- **TypeScript-first:** All logic and components use TypeScript (TS 5.x, ES2022)
- **Validation:** All API/data models use Zod schemas in `src/schemas/`
- **DAL:** Use functions in `src/dal/` for all DB access; avoid direct DB calls elsewhere
- **UI:** Use shadcn/ui and Tailwind for all styling; avoid custom CSS unless necessary
- **Testing:**
  - Unit tests in `tests/unit/`
  - E2E tests in `tests/e2e/`
  - Prefer Playwright locators by role/text for resilience
- **Env config:** All secrets/configs must be in `.env.local` (never hardcoded)

## Integration & Patterns

- **Auth:** See `src/auth.ts` and `src/lib/auth-config.ts` for authentication logic
- **API routes:** Use Next.js app router conventions in `src/app/api/`
- **Data flow:**
  - UI → API route (if needed) → DAL → DB
  - Always validate input/output with Zod schemas
- **Error handling:** Use Next.js error boundaries (`src/app/error.tsx`)

## Examples

- **Add a new schema:** Place in `src/schemas/`, export from `src/schemas/index.ts`
- **Add a new DB query:** Place in `src/dal/database/queries/`, use in API route/component
- **Add a new UI component:** Place in `src/components/ui/`, use Tailwind + shadcn/ui

## References

- See `README.md` for setup, scripts, and more details
- See `.github/instructions/` for additional agent and workflow instructions

---

**Update this file if project structure or conventions change.**
