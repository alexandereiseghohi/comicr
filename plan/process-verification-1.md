---
goal: "Implement verification & validation workflow for ComicWise (env, providers, links, seeds, CI)"
version: 1.1
date_created: 2026-01-29
last_updated: 2026-01-29
owner: Team: Platform / Alexa
status: 'In progress'
tags: ["process","verification","ci","env","providers","links","seed"]
---

# Introduction

Status: In progress — verification scripts updated and CI workflow added. Reports generated locally.

## Progress summary

- Updated `scripts/validate-env.ts` to support `--report=path` and emit JSON reports.
- Updated `scripts/verify-providers.ts` to redact provider env values in reports.
- Added CI workflow `.github/workflows/ci-verify.yml` to run verification steps on PRs and upload artifacts (non-blocking for forks/public PRs).
- Ran verification locally and produced artifacts: `providers-report.json`, `link-report.csv`, `validate-env-report.json`.

## 1. Requirements & Constraints

- (unchanged from v1.0)

## 2. Implementation Steps — current status

### Phase 1 & 2: scripts and env

| Task     | Description                                                  | Status  | Notes                                                                |
| -------- | ------------------------------------------------------------ | ------- | -------------------------------------------------------------------- |
| TASK-001 | Confirm `scripts/validate-env.ts` exists and is runnable     | ✅ Done | Ran locally; reports missing keys and writes JSON with `--report`.   |
| TASK-002 | Confirm `scripts/verify-providers.ts` exists and is runnable | ✅ Done | Ran locally; produces `providers-report.json` (env values redacted). |
| TASK-003 | Confirm `scripts/verify-links.ts` exists and is runnable     | ✅ Done | Ran locally; produced `link-report.csv` with failing links.          |
| TASK-005 | Add `--report` support to `validate-env.ts`                  | ✅ Done | Writes `validate-env-report.json` when `--report` supplied.          |

### Phase 3: provider verification

| Task     | Description                                   | Status  | Notes                                                                                    |
| -------- | --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| TASK-006 | Redact provider env values in provider report | ✅ Done | `providers-report.json` now uses `REDACTED` for present env keys; missing keys reported. |

### Phase 4: link verification

| Task     | Description                                                      | Status  | Notes                                                                |
| -------- | ---------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| TASK-008 | Ensure link verification writes CSV and validates relative links | ✅ Done | `link-report.csv` created; many internal links flagged as `MISSING`. |

### Phase 6: CI integration

| Task     | Description                                                          | Status  | Notes                                                                                         |
| -------- | -------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| TASK-012 | Add `ci-verify.yml` to run verification scripts and upload artifacts | ✅ Done | Workflow added at `.github/workflows/ci-verify.yml`. Steps are non-blocking to support forks. |

## 3. Files created / updated by this work

- `c:\Users\Alexa\Desktop\SandBox\comicr\scripts\validate-env.ts` (updated)
- `c:\Users\Alexa\Desktop\SandBox\comicr\scripts\verify-providers.ts` (updated)
- `c:\Users\Alexa\Desktop\SandBox\comicr\.github\workflows\ci-verify.yml` (new)
- `c:\Users\Alexa\Desktop\SandBox\comicr\providers-report.json` (generated)
- `c:\Users\Alexa\Desktop\SandBox\comicr\link-report.csv` (generated)
- `c:\Users\Alexa\Desktop\SandBox\comicr\validate-env-report.json` (generated)

## 4. Next actionable steps

1. Seed & storage verification (TASK-010): implement a lightweight storage check that will attempt to GET a set of seeded image URLs (from `src/database/seed` or seed outputs) and mark success/failure. This requires either a configured `.env` or use of a local dev fallback (S3 localstack or local file URLs).
2. Triage `link-report.csv`: prioritize fixing internal missing links (many point to expected files that are not in the repo), update or remove stale references in `.github/prompts` and `.github/instructions` files.
3. Decide CI gate policy: keep non-blocking checks (current) or require successful runs for protected branches (requires CI secrets configured).

## 5. Quick commands used during execution

```bash
pnpm run validate:env -- --report=validate-env-report.json
pnpm run verify:providers -- --report=providers-report.json
pnpm run verify:links -- --report=link-report.csv
```

## 6. Updated todo checklist

- [x] TASK-001: Confirm `scripts/validate-env.ts` exists and is runnable
- [x] TASK-002: Confirm `scripts/verify-providers.ts` is present and runnable
- [x] TASK-003: Confirm `scripts/verify-links.ts` is present and runnable
- [x] TASK-005: Ensure `scripts/validate-env.ts` supports `--report`
- [x] TASK-006: Implement provider verification redaction
- [x] TASK-008: Ensure link verification writes `link-report.csv`
- [x] TASK-012: Add CI workflow `ci-verify.yml`
- [ ] TASK-010: Implement seed/storage verification and test seeded image accessibility
- [ ] TASK-011: Ensure seeders produce deterministic public URLs (depends on env)

_Update:_ TASK-010 implemented: added `scripts/verify-seed-storage.ts` and `pnpm run verify:seed` — ran locally and verified sample seeded URLs (0 failures). Marking as done.

- [x] TASK-010: Implement seed/storage verification and test seeded image accessibility
- [ ] TASK-011: Ensure seeders produce deterministic public URLs (depends on env)
