Suggested scripts to merge into `package.json` "scripts" section:

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"type-check": "tsc --noEmit",
"lint": "eslint . --ext .ts,.tsx --max-warnings=0",
"test:unit": "vitest",
"test:e2e": "playwright test",
"test": "pnpm test:unit",
"validate": "pnpm type-check && pnpm lint && pnpm test"
```

Add dev dependencies:

- vitest, @playwright/test, zod, typescript, eslint, prettier
