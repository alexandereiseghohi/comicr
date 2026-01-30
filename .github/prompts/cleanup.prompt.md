Guided Cleanup — files & packages

This prompt documents the recommended workflow for running the repository cleanup tooling produced in this project.

Parameters
- dry-run (default): run detection steps and produce reports without deleting anything.
- confirm: when present, bypass interactive prompts (use with caution).
- file-only: run only the file cleanup.
- package-only: run only the package cleanup.
- aggressive: relax preservation rules (overrides ALWAYS_KEEP list) — use with caution.
- keep-pattern: glob of files to exclude from deletion (e.g., "src/**/important-*.ts").
- backup-folder: path to store backups before destructive actions (default: ./.cleanup-backups/YYYYMMDD-HHMMSS).

Examples
- Dry-run files only:

  pnpm run cleanup:files

- Dry-run packages only:

  pnpm run cleanup:packages

- Apply packages removal (after review):

  pnpm run cleanup:packages:apply -- --confirm

- Apply files deletions (after review and schema consolidation):

  pnpm run cleanup:files:apply -- --confirm

Best practices
1. Always run dry-run first and inspect `scripts/remove-unused-deps.sh` and `scripts/cleanup-report-*.json` before running apply.
2. Create a branch, commit or stash changes, and ensure CI is green before applying removals.
3. Consolidate duplicate zod schema definitions into `src/lib/validations/*` and re-export from an index before deleting duplicates.
4. Treat packages flagged `maybe-used-by-config` as manual-review candidates (CI/build tools may use them indirectly).
5. Keep backups and test the project (type-check, lint, build, tests) after any apply.

Outputs
- `scripts/cleanup-report-<timestamp>.json`
- `scripts/packages-cleanup-report-<timestamp>.json`
- `scripts/remove-unused-deps.sh` and `scripts/remove-unused-deps.ps1`
- Backup directory: `./.cleanup-backups/<timestamp>/`

Safety
- Dry-run default.
- `--apply` requires `--confirm` or `NO_PROMPT=1` to perform destructive actions.
- Entry points and config files are protected by default. Use `--aggressive` to override with care.
