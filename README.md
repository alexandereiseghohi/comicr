# ComicWise (comicr) — local developer guide

Short overview, setup and run commands for local development.

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env.local` from `.env.local.example` and fill values.
3. Seed the database (local dev):

```bash
pnpm db:push
pnpm db:seed
```

4. Run validation and start dev server:

```bash
pnpm validate
pnpm dev
```

## Key scripts (add to `package.json` scripts)

- dev: start dev server
- build: production build
- type-check: tsc --noEmit
- lint:eslint
- test: unit & e2e
- validate: runs type-check, lint, tests

## Project layout

- `src/app/` — Next.js app router pages and layouts
- `src/components/` — reusable React components
- `src/schemas/` — Zod validation schemas
- `scripts/` — automation helpers (db seed etc.)
- `.github/workflows/` — CI/CD pipelines

## Testing

- Unit tests: Vitest
- End-to-end: Playwright

## Contributing

See `CONTRIBUTING.md` (create if missing)
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
