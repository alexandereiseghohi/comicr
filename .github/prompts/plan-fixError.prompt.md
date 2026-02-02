# Plan to Complete All Phases for ComicWise Codebase Improvement

## Phase 1: Error Remediation (Type, Naming, Implementation)

- Align all DAL, mutation, and query method signatures and exports
- Add missing export aliases (e.g., upsertReadingProgress/getReadingProgress)
- Fix type mismatches and naming inconsistencies
- Ensure all referenced files and methods exist and are correctly named
- Validate ActionResult<T> usage across actions and tests

## Phase 2: Seed/Helper File Corrections

- Audit and fix all seed and helper scripts for type and import consistency
- Ensure all scripts use the correct DAL/mutation/query patterns
- Update for new ActionResult and file naming conventions

## Phase 3: Test Consistency and Coverage

- Update all unit and E2E tests for ActionResult shape and import paths
- Ensure tests cover all critical paths, edge cases, and error handling
- Validate Playwright E2E coverage for user flows (reader, profile, ratings, comments)
- Run `pnpm validate` and `pnpm test:e2e` to confirm all tests pass

## Phase 4: Documentation Update

- Update README.md and .github/copilot-instructions.md for new conventions
- Add detailed migration/code samples for DAL, ActionResult, and scripts
- Document best practices for DAL, seed/helpers, tests, and docs

## Phase 5: Final Validation and Handoff

- Run full type-check, lint, and test suite
- Validate database migrations and seed scripts
- Review and finalize documentation
- Prepare executive summary and changelog
- Handoff for review/deployment

---

**Next Steps:**

- Begin with Phase 1: Patch reading-progress.mutations.ts to add export aliases, then continue stepwise through each phase, validating after each step.
