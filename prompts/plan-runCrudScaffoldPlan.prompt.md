Consolidated CRUD Scaffold & Delivery Plan

Objective

- Complete remaining phases discovered in all \*_/_.prompt.md files and implement the initial CRUD scaffolding and CI/test foundation so the repo is buildable, safe with relation handling (robust comic.author fix), and ready for parallelized entity scaffolding.

Scope

- Finish the foundation tasks (docs, CI stubs, test configs)
- Fix blocking bug: ensure `comic.author` is resolved safely and rendered as author name where available
- Provide and apply a 5-file-per-entity CRUD scaffold pattern for entities; implement for `author` now and plan for tables 1–12
- Add unit/E2E test configs and CI workflows that gate merges on unit checks while keeping Playwright E2E separate
- Deliver verification steps and a path to continue scaffolding tables 6–12 sequentially

Assumptions

- Project stack: Next.js (App Router) + TypeScript + Drizzle ORM + Zod
- Local workflow uses pnpm and tsx; CI runs on GitHub Actions
- One-developer-per-entity policy enforced during scaffolding

High-level Phases (from prompts consolidation)

1. Foundation (docs, templates, configs) — DONE (docs + configs added)
2. Fix Blockers — HIGH PRIORITY (robust comic.author change)
3. CRUD Scaffold (12 tables) — parallelize tables 1–5; sequential 6–12
4. Pages & Components wiring for each entity
5. Tests & CI (unit tests + Playwright E2E separated)
6. Seeding & Data validation
7. Polish, docs, PRs, and handoff

Parallelization rules (as agreed)

- Tables 1–5: scaffold in parallel (one developer per entity)
- Tables 6–12: sequential (after core pages rendered and seeds validated)
- CI: unit pipeline must run on PRs; Playwright E2E runs on schedule/dispatch and release gating only when needed

Immediate Deliverables (what this plan file contains)

- Robust `comic.author` fix and verification steps
- `untitled` plan saved for iterative refinement
- File list of artifacts added so far
- Next steps to continue scaffolding and verification commands

Detailed Tasks / Todos

- T001: Create `CONTRIBUTING.md` and PR template to enforce quick-patch policy — DONE
- T002: Add Vitest config + Playwright config — DONE (stubs added)
- T003: Add GitHub Actions stubs: `ci.yml` (unit) and `e2e.yml` (dispatch/schedule) — DONE
- T004: Scaffold `author` 5-file pattern (queries, mutations, actions, API routes, tests) — DONE
- T005: Prepare robust `comic.author` fix (update comic queries to return joined relations & update page to use `author.name`) — PREPARED (PowerShell commands provided; needs application)
- T006: Update `package.json` scripts for `test:unit`, `test:e2e`, `validate` and devDeps — PREPARED
- T007: Run verification (pnpm install, type-check, unit tests) and iterate until green — PENDING (local run required)

Acceptance Criteria

- Type-check passes (pnpm run type-check)
- Unit test suite runs (pnpm run test:unit) and smoke tests pass
- `src/app/(root)/comics/[slug]/page.tsx` renders `author.name` or a graceful fallback (e.g., "Unknown Author") instead of raw `authorId`
- `src/database/queries/getComicBySlug` returns an object containing comic row and included relations (author, artist) or null safely
- CI `ci.yml` runs `pnpm run validate` (type-check + lint + unit tests) on PRs
- Playwright workflow is non-blocking by default (scheduled/dispatch) and authoritative for E2E runs only

Robust comic.author Fix (summary of prepared change)

- Replace existing `getComicBySlug` implementation to join author and artist relations and return: { comic, author?, artist? }
- Update `page.tsx` to use joined data: prefer `author.name`, fallback to `comic.authorId` or "Unknown Author" if relation missing
- Add a unit smoke test `tests/unit/comic-queries.spec.ts` asserting presence of `author` in returned data

Files Created / Added (so far)

- `CONTRIBUTING.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/e2e.yml`
- `src/database/queries/author.queries.ts`
- `src/database/mutations/author.mutations.ts`
- `src/app/api/authors/route.ts`
- `src/app/api/authors/[id]/route.ts`
- `src/lib/actions/author.actions.ts`
- `tests/unit/author.smoke.spec.ts`
- `tests/unit/comic-queries.spec.ts`

Prepared Edits (must be applied locally or by CI agent)

- `src/database/queries/comic-queries.ts` — updated to include left joins and return { comic, author, artist }
- `src/app/(root)/comics/[slug]/page.tsx` — updated to render author name safely
- `package.json` — added scripts and devDeps for vitest/playwright and `validate`

Verification Steps (run locally after applying prepared edits)

```pwsh
cd C:\Users\Alexa\Desktop\SandBox\comicr
pnpm install
pnpm run type-check
pnpm run test:unit
# Optional: run lint if configured
pnpm run validate
```

If type-check or tests fail, gather first error traces and iterate the change in `comic-queries.ts` and `page.tsx`. The planned change uses safe fallbacks and left joins to avoid runtime null deref.

Next Actions / Roadmap

- Immediate: apply prepared edits (T005, T006) and run verification (T007). If you want, I can write these files now in the repo — otherwise run the prepared PowerShell commands I provided earlier.
- After verification: scaffold tables 6–12 sequentially using same 5-file pattern, add smoke tests per entity, wire pages/components, and expand CI tests to include integration tests as needed.
- Finalize: tune CI caching, add Playwright E2E tests for critical user journeys, document the final process in `CONTRIBUTING.md` and close remaining tasks.

Notes & Rationale

- Left joins and returning joined objects avoid breaking pages when the foreign key exists but the related row is missing or when seeds are incomplete.
- Separating unit CI from Playwright E2E lets feature branches iterate faster while still allowing scheduled or manual E2E verification.
- Enforcing one-dev-per-entity minimizes merge conflicts across the 5-file-per-entity pattern.

Contact & Handoff

- This untitled plan is intentionally editable for iterative refinement. Update the camelCase name if you prefer a different filename.

---

(End of plan content)
