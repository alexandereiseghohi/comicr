---
name: comicwise-consolidated
description: "Consolidated implementation and verification prompt for ComicWise — includes phases, tasks, verification scripts and validation steps. Use this prompt to drive CI checks and developer onboarding."
---

# ComicWise - Consolidated Implementation & Verification Prompt

Purpose

- Provide a single, authoritative prompt that consolidates all .prompt.md and instruction guidance for ComicWise.
- Enumerate phases, todos, tasks, and validation steps.
- Provide runnable verification scripts and usage guidance (link checks, provider checks, env validation).

Core Principles

- DRY: avoid duplication, centralize constants and types.
- Next.js best practices: prefer App Router, server components for SSR, client components only when needed, edge routes for low-latency public APIs.
- Type safety: TypeScript strict mode, no any.
- Security: never commit secrets; validate provider configs; use `NEXTAUTH_SECRET`.
- Performance-first: measure before optimizing; use caching and image optimization.

Quick goals

- Validate environment variables and provider configurations.
- Validate internal (relative) and external links in prompts and instructions.
- Provide an actionable phase-by-phase plan with tasks and validations.

How to use this prompt

- Run the verification scripts in `scripts/` to get immediate reports.
- Follow phase tasks to implement missing pieces in the codebase.
- Use `package.json` scripts to wire these checks into CI (example provided in docs).

Phases, Todos and Tasks (complete, actionable)

Phase 0 — Discovery & Preparation

- TODO-0.1: Inventory `.github/prompts/*.prompt.md`, `.github/instructions/*.instructions.md`, README.md and memory-bank files. (Complete: files included in repo.)
- TODO-0.2: Produce `.env.example` with required keys. (See `/.env.example` in repo)

Phase 1 — Project Tooling

- TASK-1.1: Ensure `tsconfig.json` uses `"strict": true` and path aliases `@/* -> src/*`.
- TASK-1.2: Add dev tooling: ESLint (Next.js), Prettier, Husky, pnpm scripts: dev, build, start, lint, test, db:migrate, db:seed, verify:all.
  Validation: `pnpm lint && pnpm build --filter=./` and `pnpm run validate:env`.

Phase 2 — Environment & Secret Validation

- TASK-2.1: Maintain `.env.example` with grouped env keys (DB, AUTH, REDIS, STORAGE, SMTP, SENTRY).
- TASK-2.2: Add `scripts/validate-env.ts` to fail CI when keys missing.
  Validation: `pnpm run validate:env`.

Phase 3 — Database Schema & Migrations

- TASK-3.1: Implement Drizzle schema files under `src/db/schema/` for core tables (users, sessions, comics, chapters, images, bookmarks, roles, permissions, audit_logs, etc.).
- TASK-3.2: Add migrations and idempotent seeders under `scripts/seed.ts`.
  Validation: `pnpm run db:migrate && pnpm run db:seed` then run smoke tests.

Phase 4 — Authentication & Provider Validation (CRITICAL)

- TASK-4.1: Implement NextAuth v5 adapter or custom adapter for Drizzle and place config at `src/app/api/auth/[...nextauth]/route.ts`.
- TASK-4.2: Support Credentials provider (email/password) and OAuth providers (Google, GitHub, Apple). Use environment variables for secrets.
- TASK-4.3: Add provider metadata checks via `scripts/verify-providers.ts`.
  Provider Validation checklist:
- Ensure env keys present: `CLIENT_ID`, `CLIENT_SECRET` for each provider.
- Confirm discovery endpoints (Google) return `issuer`, `authorization_endpoint`, `token_endpoint`.
- Confirm registered redirect URIs match `NEXTAUTH_URL` + `/api/auth/callback/{provider}`.
- For Credentials: implement password hashing (argon2 recommended) and rate-limiting.
  Validation: `pnpm run verify:providers -- --report=providers-report.json`.

Phase 5 — Storage & Uploads

- TASK-5.1: Implement storage abstraction `src/lib/storage/*` with local dev fallback and S3-compatible production (env-driven).
- TASK-5.2: Seeders must produce public-root image URLs for demo content.
  Validation: Upload test and verify GET accessibility; confirm seed output.

Phase 6 — API Routes & Business Logic

- TASK-6.1: Implement typed route handlers under `src/app/api/*` using zod for input validation and centralized error handling.
- TASK-6.2: Use server components for server-rendered pages and segregate client components properly.
  Validation: Integration tests and API smoke tests.

Phase 7 — UI & Component Library

- TASK-7.1: Build UI primitives under `src/components/ui/` using shadcn components and Tailwind.
- TASK-7.2: Ensure accessibility (role-based markup) and keyboard navigation.
  Validation: Playwright tests and `toMatchAriaSnapshot` checks.

Phase 8 — Seeders & Demo Data

- TASK-8.1: Implement deterministic, idempotent seed scripts that create demo comics, chapters, and images.
  Validation: `pnpm run db:seed` produces expected counts and public URLs.

Phase 9 — Testing & QA

- TASK-9.1: Unit tests for core utils, integration tests for APIs, and Playwright E2E tests in `tests/`.
  Validation: `pnpm test` and `npx playwright test --project=chromium`.

Phase 10 — CI/CD

- TASK-10.1: Create `.github/workflows/ci.yml` to run lint, typecheck, tests, verify:env, verify:providers, verify:links on PRs.
  Validation: GitHub Actions passes on PRs.

Phase 11 — Performance & Optimization

- TASK-11.1: Add caching (Upstash Redis) and SWR usage for client-side fetching.
- TASK-11.2: Optimize images (AVIF/WebP) and use Next.js Image properly.
  Validation: Lighthouse and Core Web Vitals monitoring.

Phase 12 — Verification (Links, Providers, Credentials) (CRITICAL)

- TASK-12.1: Run `scripts/verify-links.ts` to scan `.github/prompts`, `.github/instructions`, `README.md` and produce `link-report.csv`.
- TASK-12.2: Run `scripts/verify-providers.ts` to produce `providers-report.json`.
- TASK-12.3: Run `scripts/validate-env.ts` to ensure `.env` contains all keys from `.env.example`.
  Validation commands:

```
pnpm run validate:env
pnpm run verify:providers -- --report=providers-report.json
pnpm run verify:links -- --report=link-report.csv
```

Phase 13 — Handoff & Documentation

- TASK-13.1: Create docs in `docs/` including `phase-status.md`, `architecture.md`, and run instructions.
- TASK-13.2: Add runbook for rotating provider credentials and emergency key revocation.
  Validation: Documentation reviewed and `Try it` commands validated on fresh checkout.

Parallelization guidance

- Implement DB schema (Phase 3) and Auth adapter (Phase 4) early and in lockstep.
- UI (Phase 7) and API routes (Phase 6) can progress in parallel after contracts are agreed.
- Seeders and storage (Phase 5 & 8) can be implemented in parallel with APIs.

Verification scripts (already included in repo)

- `scripts/validate-env.ts` — compares `.env.example` to `.env` and fails on missing keys.
- `scripts/verify-providers.ts` — checks for provider env keys and hits discovery or root endpoints for metadata.
- `scripts/verify-links.ts` — scans markdown files for links, validates external links via HTTP HEAD/GET, and validates relative links exist; outputs CSV.

`.env.example` (source of truth)

- Keep the canonical set of env vars in `.env.example` (root). The repo includes an example containing DB, NextAuth, OAuth, SMTP, Redis, Storage, and observability keys.

Credential & Provider Verification Rules

- Never attempt full OAuth exchanges in CI. Use discovery/metadata endpoints only.
- Verify redirect URIs registered at provider match `NEXTAUTH_URL`.
- For cloud services, prefer testing metadata endpoints and connectivity checks that do not leak or require secrets in CI logs.

Link Validation Rules

- External links: 2xx OK, 3xx allowed with note, 4xx/5xx flagged.
- Internal links: must point to an existing file.
- Output: `link-report.csv` with columns `sourceFile,link,status,notes`.

CI Integration (recommended)

- Add a GitHub Action step that runs `pnpm install --frozen-lockfile`, `pnpm run validate:env`, `pnpm run verify:providers -- --report=providers-report.json`, and `pnpm run verify:links -- --report=link-report.csv` as part of PR checks.
- Gate merges on these steps passing.

Playwright / E2E Guidelines

- Follow `.github/instructions/playwright-typescript.instructions.md` for test structure, naming, and assertions.
- Store tests in `tests/` directory; use accessible locators (`getByRole`, `getByLabel`).

Quality Gates

- Typecheck (tsc --noEmit)
- ESLint (project rules)
- Unit & Integration tests
- Playwright smoke tests
- verify:env, verify:providers, verify:links outputs

Outputs expected from running this prompt

- Updated `.env.example` in repo root.
- `scripts/validate-env.ts`, `scripts/verify-providers.ts`, `scripts/verify-links.ts` present and runnable.
- `link-report.csv` and `providers-report.json` generated by running scripts.

Maintenance

- Review prompt and instruction files periodically; update provider lists and discovery URLs when providers change.
- Add additional provider checks as new integrations are added.

Notes & Caveats

- Do not commit real secrets; use CI secret storage.
- Provider verification in CI will report missing env keys when secrets are not supplied — this is expected for fork or public PRs; limit gating to trusted branches or use masked checks.

End of consolidated prompt file.
