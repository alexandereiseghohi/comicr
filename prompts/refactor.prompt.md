# Standardize types and Zod schemas; enable Next.js `cacheComponents` progressively

TL;DR: Create a single canonical types package under `src/types` with DRF-style DTOs and centralized Zod schemas in `src/lib/validations`, migrate imports project-wide, replace scattered `any` types with concrete/generic types, enable `cacheComponents` in `next.config.ts` after fixing incompatible components, and add cleanup scripts to remove unused files/packages. Work incrementally so each commit keeps the repo buildable.

---

## Prioritized Checklist (atomic tasks, time estimates, files)
- [ ] Create canonical types entrypoint and DTO definitions (90–120m) — create `src/types/index.ts`, `src/types/dtos/*.ts`
- [ ] Create canonical Zod schema exports and dedupe schemas (90–120m) — create `src/lib/validations/index.ts`, edit `src/lib/validations/*` (existing)
- [ ] Add Zod-to-TS generation mapping / conventions note (30m) — create `src/types/README.md`
- [ ] Replace direct Zod schema imports with canonical imports (60–90m) — edit files importing from `src/lib/validations/*`
- [ ] Convert prominent `any` usages to generic/DTO types (2–4 hours) — edit key files (see list below)
- [ ] Create export barrel for types and validations (30m) — update `src/types/index.ts`, `src/lib/validations/index.ts`
- [ ] Update/clean imports across repo using automated toolchain (60m) — run search/replace tool steps (no file edits in plan)
- [ ] Add unit tests for DTO shape / validation (60–90m) — create `tests/types.spec.ts` / edit `src/tests` if needed
- [ ] Run and iterate on tests, fix errors (variable; 1–3 hours) — multiple files as tests uncover issues
- [ ] Prepare Next.js `cacheComponents` feature toggle commit (30m) — edit `next.config.ts`
- [ ] Identify components incompatible with caching and refactor server/client boundaries (2–6 hours) — edit files under `src/` that use dynamic segments or client-only hooks
- [ ] Add rollback & monitoring steps for cacheComponents (15m) — update `docs/cacheComponents-rollback.md`
- [ ] Implement `scripts/cleanup_files.ts` to detect dead files (60–90m) — create `scripts/cleanup_files.ts`
- [ ] Implement `scripts/cleanup_packages.ts` to suggest package removals (60–90m) — create `scripts/cleanup_packages.ts`
- [ ] Run package cleanup safely with `pnpm` steps and verification (30–60m) — use commands shown below
- [ ] Modify `package.json` scripts and run final type/lint/build fixes in workspace (1–2 hours) — edit `package.json`

Note: Each checkbox is intended to be a single commit except where noted (refactors may be multiple commits).

---

## Precise Sequence of Code Changes and Rationale

High-level principles:
- Centralize DTO (data transfer object) definitions in `src/types` following DRF-style naming (e.g., `ComicCreateDTO`, `ComicReadDTO`, `ChapterListDTO`), and export them from `src/types/index.ts`.
- Canonicalize Zod schemas in `src/lib/validations` with one exported name per logical entity and export from `src/lib/validations/index.ts` so code imports from a single stable path.
- Replace `any` with either specific DTO types or `GenericDTO<T>` where a generic wrapper is appropriate.
- Make small, incremental edits to keep the project buildable at each step.

1) Create `src/types/index.ts` (new)
- Create a barrel export that re-exports DTOs and helper generic types.
- Rationale: Provides single import path for all types across the repo.

2) Create DTO files in `src/types/dtos/*.ts` (new)
- For each domain model (e.g., comics, chapters, users), create DRF-style DTOs:
  - `ComicCreateDTO`, `ComicUpdateDTO`, `ComicReadDTO`
  - `ChapterCreateDTO`, `ChapterReadDTO`, etc.
- Rationale: Explicit DTOs reduce `any` and clarify API boundaries.

3) Create `src/types/README.md` (new)
- Document mapping rules between Zod schemas and DTOs, and the canonical import paths.
- Rationale: Developer guidance for future edits and codegen.

4) Create/Update `src/lib/validations/index.ts` (new or edit)
- Re-export all Zod schemas from their canonical names (e.g., `export { comicSchema } from './comic';`).
- Rationale: Single source-of-truth for validation schemas.

5) Deduplicate Zod schemas found elsewhere (edit)
- Inspect existing schemas under `src/lib/validations/*` and other folders; move duplicates to canonical file(s) in `src/lib/validations`.
- For each duplicate: remove the duplicate file or replace its exports with `export * from 'src/lib/validations'`.
- Rationale: Prevent schema drift and multiple definitions.

6) Replace direct Zod imports in application code (edit)
- For each file currently importing local/duplicate validation schemas, update imports to come from `src/lib/validations/index.ts`.
- Rationale: Ease future changes and guarantee consistent validation.

7) Introduce Zod/DTO canonical mapping (edit)
- For validation files that define Zod schemas, add explicit `export type ComicReadDTO = z.infer<typeof comicSchema>;` inside the validation or DTO files, then export those types via `src/types/index.ts`.
- Rationale: Converges runtime schema and TypeScript type; reduces mismatch.

8) Convert `any` usages to concrete or generic types (edit)
- Identify top `any` hotspots (e.g., network responses, database rows, component props).
- Replace `any` with appropriate DTOs, or use `Record<string, unknown>` or `Partial<T>` as safe interim types.
- For reusable patterns, add `GenericDTO<T>` type in `src/types` to standardize generic payloads.
- Rationale: Improve type safety incrementally without large rewrites.

9) Update imports to use `src/types` barrel (edit)
- Replace imports like `import { Comic } from '../../models/comic'` with `import { ComicReadDTO } from 'src/types'` (use your repo's path alias where applicable).
- Rationale: Single source for type imports.

10) Add minimal unit tests for DTOs and validation (new)
- Create `tests/types.spec.ts` to assert Zod schemas parse representative data and that `z.infer` equals DTO types in common code paths.
- Rationale: Prevent regressions when refactoring schemas/types.

11) Incremental refactor of components that consume types (edit)
- For each component or server function, update prop/type annotations to the DTO types created.
- Rationale: Prevent `any` proliferation.

Files to create:
- `src/types/index.ts`
- `src/types/dtos/comic.dto.ts`
- `src/types/dtos/chapter.dto.ts`
- `src/types/README.md`
- `src/lib/validations/index.ts` (if not present)
- `tests/types.spec.ts`

Files to edit (examples — search and adapt across codebase):
- `src/lib/validations/*.ts` (canonicalize)
- `src/lib/*` (files importing validations)
- `src/**/*.(ts|tsx)` files using `any` (convert where appropriate)
- `next.config.ts` (toggle `cacheComponents`)
- `docs/cacheComponents-rollback.md` (document rollback)
- `scripts/cleanup_files.ts` (new)
- `scripts/cleanup_packages.ts` (new)

---

## Migration Strategy to Update Imports Across Repo

Goals: safe, reversible, automated where possible.

1) Static analysis & mapping
- Run search for known old import patterns and `any` hotspots:
  - Use `rg "from\s+['\"](.*lib/validations|.*some-old-path).*['\"]"` and `rg "\bany\b" --hidden`.
- Produce a CSV mapping file: old import -> new import (e.g., `src/lib/oldValidation.ts` -> `src/lib/validations`).

2) Automated replacement (preferred)
- Use a types-aware codemod approach with `ts-morph` or `jscodeshift`:
  - Write a small `scripts/codemods/migrate-imports.ts` that:
    - Loads the TS project
    - Finds import declarations that resolve to old paths
    - Rewrites import specifiers to the canonical path (`src/lib/validations`)
    - Optionally add named import if schema name changed
- Run codemod locally and commit results.

3) Quick CLI fallback (if codemod not available)
- Use ripgrep + PowerShell replace (Windows) as controlled steps:
  - Preview command: `rg "from '\./lib/old'" -n`
  - Replace example (PowerShell): `Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object { (Get-Content $_.FullName) -replace "from '\./lib/old'", "from '../../lib/validations'" | Set-Content $_.FullName }`
- Always run preview and backup before replacing.

4) Validate and fix broken builds
- After automated changes, run TypeScript build and tests:
  - `pnpm -w -s -r --filter . tsc` if using workspace tsconfig, or `pnpm tsc`
  - `pnpm vitest`
- If imports fail, use TypeScript error messages to patch specific renamed exports.
- Keep commits small: one codemod commit per logical area (e.g., validations, types, components).

5) Fallback manual steps
- If an automated step introduces regressions, revert the commit and perform manual edits on a smaller set of files.
- Keep a backup branch before mass replacements.

Tools/commands to run (suggested):
- Search: ripgrep (rg) or `Get-ChildItem -Recurse` + `Select-String` in PowerShell
- Codemod: `node scripts/codemods/migrate-imports.js` (implement using ts-morph)
- Preview build: `pnpm -s build` or `pnpm -s tsc`
- Tests: `pnpm -s vitest` and `pnpm -s playwright test`

---

## Test Workflow and Iterative Fix Process

Commands to run:
- Install deps (if needed): `pnpm install`
- Run unit tests (Vitest): `pnpm vitest`
- Run all tests (Vitest + Playwright): `pnpm test` (if `package.json` defines it)
- Playwright: `npx playwright test` or `pnpm playwright test`
- TypeScript build check: `pnpm tsc` or the repository build script: `pnpm build`
- Next.js dev build: `pnpm dev` (starts local Next dev server)
- Next.js production build: `pnpm build && pnpm start`

Expected outputs:
- Vitest should run unit tests; expect failures related to types changes at first.
- Playwright should run E2E; non-deterministic failures may be unrelated and handled separately.
- TypeScript should show type errors if migrations missed some imports.

Iterative fix process:
1. Run `pnpm vitest` and `pnpm tsc`.
2. For each error:
   - If import error: update import path or exported name in `src/lib/validations/index.ts` or `src/types/index.ts`.
   - If type mismatch: update affected DTO or add `as unknown` temporary shim with TODO comment.
   - Commit small fixes frequently.
3. Re-run tests until they pass.
4. Run Playwright E2E last: `pnpm playwright test`.
5. If Playwright tests fail due to UI changes from refactor, debug locators, keep tests green by adjusting tests only after fixing app code where appropriate.

Guidance for failing tests:
- Do not delete failing tests immediately.
- Investigate whether failures are due to legitimate regressions from refactor; fix code first.
- Only delete/recreate tests as a last resort and record justification in the commit message and `docs/`.

Vitest and Playwright commands:
- Vitest: `pnpm vitest --run` (or `pnpm vitest` depending on scripts)
- Playwright: `npx playwright test --project=chromium` (adjust project)

---

## Enabling cacheComponents in `next.config.ts`

Objective: Turn on `cacheComponents` to improve server rendering performance, but avoid breaking dynamic behavior.

Steps:
1. Prepare: Create a feature-flag commit that only touches `next.config.ts`:
   - Add `experimental: { cacheComponents: true }` or `cacheComponents: { enabled: true }` depending on Next version.
   - Rationale: Feature-flagging allows quick revert.

2. Find incompatible components:
   - Search for uses of dynamic route segments, `usePathname`, `useRouter`, `useSearchParams`, any code that relies on per-request data in client components.
   - Search for components that accept props derived from `getServerSideProps` or `getInitialProps`.
   - Look for components that use `React.useEffect` to fetch data and depend on request-specific values.
   - Commands: `rg "useRouter|usePathname|useSearchParams|getServerSideProps|getInitialProps|use client" -n src/`

3. Refactor recommendations per component:
   - Server/client boundary:
     - Move server-only code into server components (no `use client` at top).
     - Convert purely client interactive UI to `use client` components and pass serializable props from server.
   - For components relying on dynamic segments:
     - Add `export const dynamic = 'force-static'` only when safe (if component should be static).
     - Prefer passing route params as props from the page's server component.
   - For components using global state or contexts that read request info, convert to client component that receives stable props.

4. Progressive enabling:
   - Enable `cacheComponents` in `next.config.ts`.
   - Start dev server and run unit tests.
   - Fix any errors by refactoring one component at a time.
   - Use `console.error` and server logs to find runtime exceptions pointing to incompatible component behavior.

5. Roll-back plan:
   - If major runtime exceptions occur, revert the `next.config.ts` change immediately and redeploy.
   - Keep the commit that set `cacheComponents` small to allow revert with `git revert` or by checking out previous commit.
   - Document in `docs/cacheComponents-rollback.md` the revert command and reason.

Notes:
- Do not set `dynamic = 'force-dynamic'` unless necessary.
- Use `use client` directives sparingly and only for components that need client capabilities.
- When converting server components to client, ensure props are fully serializable.

Files to edit:
- `next.config.ts` (edit)
- `src/pages` / components identified in search (edit)
- `docs/cacheComponents-rollback.md` (create/edit)

---

## `scripts/cleanup_files.ts` and `scripts/cleanup_packages.ts`

Purpose:
- `scripts/cleanup_files.ts`: detect and optionally delete files that are unused or orphaned (e.g., deleted exports, stale assets).
- `scripts/cleanup_packages.ts`: detect unused dependencies and produce safe uninstall commands for `pnpm`.

Algorithmic approach — `scripts/cleanup_files.ts`:
1. Scan repository for JS/TS/TSX/MD/JSON files under `src/`, `scripts/`, `public/`.
2. Build symbol index:
   - Parse TypeScript source using `ts-morph`.
   - For each exported symbol, record file and symbol name.
3. For each file, detect:
   - Files with zero inbound references across project (using ts-morph's project symbol references).
   - Static assets referenced by no source file (search for `<img src=` or asset paths).
4. Produce a preview report `reports/cleanup_files_report.json` listing candidate deletions with reasons and referenced lines.
5. Provide a `--dry-run` mode that only reports.
6. Provide `--apply` mode to actually remove files; before removal, move to `./.trash/` with timestamp backup.
7. Add prompt confirmation when `--apply` is used.

Algorithmic approach — `scripts/cleanup_packages.ts`:
1. Read `package.json` and `pnpm-lock.yaml` to list installed packages.
2. For each dependency, search for imports/requires across `src/`:
   - Use ts-morph and simple `rg` fallback to detect `from 'pkg'` or `require('pkg')`.
3. Classify packages:
   - Used (references found)
   - Possibly unused (no references, but check for peer usage in build scripts)
   - Dev-only vs prod dependencies
4. Produce `reports/cleanup_packages_report.json` with classification and suggested `pnpm remove` commands.
5. Safety checks:
   - Check package is not referenced in CI configs, scripts, Dockerfiles, or workspace packages.
   - Check transitive dependencies by analyzing `pnpm-lock.yaml` for packages that are part of other used deps.
6. Provide `--dry-run` and `--apply` modes:
   - On `--apply` remove packages with `pnpm remove <pkg>` for top-level `package.json`.
   - If workspace: remove from workspace packages as necessary and run `pnpm -w install` after removals.
7. Always back up `package.json` and `pnpm-lock.yaml` before `--apply` into `./.trash/` with timestamp.

Safe pnpm uninstall commands (to run manually after review):
- Dry-run report generation: `node scripts/cleanup_packages.js --dry-run`
- Remove packages after manual review: `pnpm remove <pkg1> <pkg2>`
- Reinstall and lockfile: `pnpm install`

Files to create:
- `scripts/cleanup_files.ts`
- `scripts/cleanup_packages.ts`
- `reports/cleanup_*.json` generated by scripts (not committed unless accepted)
- `.trash/` backup folder (runtime-created)

---

## Top 10 Risks and Mitigations

1. Risk: Breaking imports causing large-scale type errors.
   - Mitigation: Use codemod + small commits; run `pnpm tsc` after each commit; keep revert-ready branch.

2. Risk: Zod schema drift (runtime schema not matching TS types).
   - Mitigation: Add `z.infer` derived type exports and unit tests validating schema <-> DTO parity.

3. Risk: Playwright/E2E flakiness after refactor.
   - Mitigation: Run E2E after unit tests; fix app code before test changes; isolate UI changes.

4. Risk: Enabling `cacheComponents` causes runtime errors in production.
   - Mitigation: Feature flag, small enabling commit, monitor logs, quick revert plan documented in `docs/cacheComponents-rollback.md`.

5. Risk: Automated removal of packages or files deletes needed assets.
   - Mitigation: Provide `--dry-run`, backup to `.trash/`, require manual review before `--apply`.

6. Risk: Large PR with many changes becomes unreviewable.
   - Mitigation: Break into atomic commits per checklist item and open multiple small PRs.

7. Risk: Converting `any` incorrectly introduces incorrect typing or hidden casts.
   - Mitigation: Prefer conservative types (`unknown`/`Record<string, unknown>`), add TODO comments, and incremental fixes.

8. Risk: Build or dev server fails due to path alias changes.
   - Mitigation: Keep path alias mapping consistent and update `tsconfig.json` and `next.config.ts` if required; test local dev server.

9. Risk: Missing runtime-only exports when moving validation code.
   - Mitigation: Keep runtime schema files under `src/lib/validations` and export both schema and type; add smoke tests.

10. Risk: Time-consuming manual fixes create schedule slip.
    - Mitigation: Favor incremental approach, track progress in tasks, allocate buffer time, and prioritize high-impact types first.

---

## Verification Checklist (Repo Ready Criteria)

- [ ] `pnpm install` completes without errors.
- [ ] `pnpm tsc` finishes with zero TypeScript errors (allow a small, documented threshold of `any` usages (e.g., <= 5) with TODOs).
- [ ] `pnpm vitest` passes all unit tests.
- [ ] `npx playwright test` passes E2E relevant to changed features (or non-blocking failures documented and triaged).
- [ ] `pnpm build` (Next.js production build) succeeds.
- [ ] `pnpm start` or equivalent runs the built app without server errors in logs.
- [ ] No duplicate Zod schemas remain; all schemas are exported from `src/lib/validations`.
- [ ] Types are exported from `src/types` and used across codebase; no `any` in new/changed files.
- [ ] `scripts/cleanup_files.ts` dry-run produces no unexpected deletions and produces a human-reviewed report.
- [ ] `scripts/cleanup_packages.ts` dry-run produces safe package removal suggestions and `pnpm remove` commands.
- [ ] `cacheComponents` enabled only once verified and documented; rollback doc present.
- [ ] Change log / PR description documents all migrations, with references to changed files and rationale.

---

## Practical Next Actions (minimal, one-commit-per-task approach)
- Commit 1: Add `src/types/index.ts` and initial DTOs for `comic` and `chapter` (minimal set).
- Commit 2: Add `src/lib/validations/index.ts` and canonicalize `comic` schema.
- Commit 3: Update a few consumer files to import canonical type/schema and run `pnpm tsc` + `pnpm vitest`.
- Commit 4: Create scripts `scripts/cleanup_files.ts` and `scripts/cleanup_packages.ts` in dry-run mode.
- Commit 5: Enable `cacheComponents` in `next.config.ts` behind a short commit message and notes about rollback.
- Continue with remaining items in checklist, one commit per item.

---

## TODO List (all items unchecked)

- [ ] Create canonical types barrel `src/types/index.ts` (90–120m) — create `src/types/index.ts`, `src/types/dtos/comic.dto.ts`, `src/types/dtos/chapter.dto.ts`
- [ ] Create Zod canonical barrel `src/lib/validations/index.ts` and migrate schemas (90–120m) — edit `src/lib/validations/*`, create `src/lib/validations/index.ts`
- [ ] Add `src/types/README.md` documenting DTO/Zod mapping (30m) — create `src/types/README.md`
- [ ] Replace duplicate Zod schema copies with canonical exports (60–90m) — edit duplicate schema files under `src/lib/validations`
- [ ] Update code to import validations from `src/lib/validations/index.ts` (60–90m) — edit consumer files under `src/`
- [ ] Convert top `any` hotspots to DTOs/generic types (2–4h) — edit affected files under `src/`
- [ ] Add `z.infer` derived type exports and export from `src/types/index.ts` (30–60m) — edit `src/lib/validations/*` and `src/types/index.ts`
- [ ] Add `tests/types.spec.ts` to validate DTO/schema parity (60–90m) — create `tests/types.spec.ts`
- [ ] Implement automated import migration codemod (60m) — create `scripts/codemods/migrate-imports.ts` (optional)
- [ ] Run migration, validate TypeScript build, and fix import errors (1–3h) — run `pnpm tsc`, `pnpm vitest`
- [ ] Enable `cacheComponents` in `next.config.ts` behind feature flag (30m) — edit `next.config.ts`
- [ ] Scan for components incompatible with caching and refactor server/client boundaries (2–6h) — edit identified `src/` files
- [ ] Add rollback doc `docs/cacheComponents-rollback.md` (15m) — create `docs/cacheComponents-rollback.md`
- [ ] Create `scripts/cleanup_files.ts` (60–90m) — create new script
- [ ] Create `scripts/cleanup_packages.ts` (60–90m) — create new script
- [ ] Run cleanup dry-runs and review reports (30–60m) — run the scripts in dry-run mode locally
- [ ] Remove safe unused packages with `pnpm remove` after review (30–60m) — manual command execution
- [ ] Run full test suite and E2E, fix failures, iterate until green (variable) — `pnpm vitest`, `npx playwright test`
- [ ] Final verification and readiness audit (30m) — check verification checklist items
