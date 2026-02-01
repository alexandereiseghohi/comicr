## Plan: Test Framework Roles, Prompts Sync, and CI Integration

Clarify test framework usage, enforce prompts/app structure sync, and add CI for automated test runs.

### Steps

1. **Test Framework Roles**
   - Use Vitest for unit and import/action validation tests.
   - Use Playwright for end-to-end UI/feature checks (e.g., prompt-driven UI flows).
   - Use Jest only if legacy or specific Jest-only tests exist; otherwise, prefer Vitest/Playwright.
2. **Prompts Directory Sync**
   - Create/update a script (e.g., `scripts/sync-prompts.ts`) to ensure `prompts/` mirrors `src/app/` structure.
   - Run this script as part of CI and before major releases.
3. **CI Integration**
   - Update/add a GitHub Actions workflow (e.g., `.github/workflows/ci.yml`) to:
     - Run Vitest and Playwright tests on push/PR.
     - Run the prompts sync script and fail if out of sync.
     - Report test and sync status in PR checks.

### Further Considerations

1. Document the sync and test process in `README.md`.
2. Optionally, add a pre-commit hook for local sync/test enforcement.
3. Review and update CI config as new features/tests are added.

Ready to proceed with these steps for robust, maintainable automation.
