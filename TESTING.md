# Testing

This repository includes a minimal Playwright smoke test and instructions to run tests locally.

Run Playwright tests (if Playwright installed):

```bash
# install deps
pnpm install

# run Playwright tests (Chromium)
npx playwright test --project=chromium
```

The `tests/profile.spec.ts` file contains a basic smoke test for the profile page.
