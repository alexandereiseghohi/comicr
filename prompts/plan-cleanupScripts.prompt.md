Plan: Repository cleanup (files first, then packages)

Goal
- Implement safe, dry-run-first cleanup tooling to remove duplicate/unused Zod schemas, duplicate files, backup files, empty/blank files, and to uninstall unused packages with pnpm. Produce reports and shell scripts for manual review before any destructive action.

High-level steps
1. Create two TypeScript CLI scripts (dry-run default):
   - `scripts/cleanup_files.ts` — scans `src/**/*`, `scripts/**/*`, and root config files; detects Zod schema definitions and usages, zero-byte/whitespace files, `*.backup*` files, and byte-identical duplicates; writes `scripts/cleanup-report-<timestamp>.json` and moves files to `./.cleanup-backups/<timestamp>/` on apply.
   - `scripts/cleanup_packages.ts` — reads `package.json`, scans source and config files for import/require occurrences and config mentions; classifies packages as `used` / `maybe-used-by-config` / `unused`; writes `scripts/packages-cleanup-report-<timestamp>.json` and generates `scripts/remove-unused-deps.sh` and `.ps1`.

2. Add safe npm scripts to `package.json`:
   - `cleanup:files:dry`, `cleanup:files:apply`
   - `cleanup:packages:dry`, `cleanup:packages:apply`
   - `cleanup:verify` (run both dry-runs)
   - `safe-uninstall` (point to generated removal script for manual run)

3. Install devDependencies for the CLIs: `tsx`, `globby`, `fs-extra`, `p-limit`, `minimist` (and optionally `depcheck`, `ts-morph`, `chalk`, `ora`).

4. Run dry-runs and inspect reports:
   - `pnpm run cleanup:packages:dry` → review `scripts/remove-unused-deps.sh` and `scripts/packages-cleanup-report-*.json`.
   - `pnpm run cleanup:files:dry` → review `scripts/cleanup-report-*.json`.

5. Manual steps before apply:
   - Consolidate duplicate Zod schemas into a canonical module (e.g., `src/lib/validations/{auth,comic,seed,user}.ts`) and update imports to point to the canonical source, or add re-exports.
   - Review packages marked `maybe-used-by-config` because tooling may use them indirectly.
   - Commit or stash current repo state; ensure CI runs are green.

6. Apply removals (explicit confirmation required):
   - `pnpm run cleanup:packages:apply` (backups of `package.json` and lockfile created automatically)
   - `pnpm run cleanup:files:apply` (moves deleted files to `./.cleanup-backups/<timestamp>/`)

7. Post-apply verification:
   - `pnpm install`
   - `pnpm -w type-check` (or repo's `type-check` script)
   - `pnpm -w lint`
   - `pnpm -w build` (or `next build` / equivalent)
   - Fix any remaining type/lint/build issues; restore from backups if needed.

Safety and safeguards
- Dry-run is the default mode; `--apply` must be combined with `--confirm` to perform destructive actions.
- Scripts create timestamped backups under `./.cleanup-backups/<timestamp>/` before deleting or modifying files.
- Preserve entry points and config files by default (`src/app`, `pages`, `next.config.ts`, `postcss.config.mjs`, `drizzle.config.ts`, `sentry.*`). Use an `--aggressive` flag to override (use with caution).
- Always review `scripts/remove-unused-deps.sh` and `scripts/cleanup-report-*.json` before applying.

CLI usage examples
- Dry-run files only:

  pnpm run cleanup:files:dry

- Dry-run packages only:

  pnpm run cleanup:packages:dry

- Apply packages (after review):

  pnpm run cleanup:packages:apply -- --confirm

- Apply files deletions (after review and zod consolidation):

  pnpm run cleanup:files:apply -- --confirm

Outputs
- `scripts/cleanup-report-<timestamp>.json`
- `scripts/packages-cleanup-report-<timestamp>.json`
- `scripts/remove-unused-deps.sh` and `scripts/remove-unused-deps.ps1`
- Backup directory: `./.cleanup-backups/<timestamp>/` containing moved files and backups of `package.json`/lockfile

Next actions
- Add `scripts/cleanup_files.ts` and `scripts/cleanup_packages.ts` to the repo (I will create them next).
- Install dev dependencies and run dry-runs.

Notes
- Zod schema detection is heuristic: looks for `import { z } from 'zod'` and `const NameSchema = z.object(`. Do not auto-delete duplicate schemas; consolidate first.
- Package detection is heuristic; packages flagged `maybe-used-by-config` require manual review.

-- end of plan
