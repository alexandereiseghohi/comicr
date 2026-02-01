## Plan: Centralized Prompts, Automated Checks with Vitest/Playwright/Jest

Prompt files will be centralized in a `prompts/` directory, mirroring the app structure. Automated checks for client imports and action implementation will use Vitest, Playwright, or Jest as appropriate.

### Steps

1. Centralize all `[page|subpage].prompt.md` files in a top-level `prompts/` directory, mirroring the app’s folder structure.
2. Organize modular server components per feature in `src/components/server/` or `src/app/[feature]/Server.tsx`.
3. Implement automated tests:
   - Use Vitest for unit checks (import validation, action implementation).
   - Use Playwright/Jest for integration/UI checks if needed.
   - Place tests in `tests/unit/` and/or `tests/e2e/`.
4. Document conventions and test setup in `README.md`.

### Further Considerations

1. Confirm if Playwright/Jest should supplement or replace Vitest for certain checks.
2. Ensure the `prompts/` directory structure is kept in sync with app changes.
3. Add CI integration for automated test runs.
