---
title: Implement Next.js 16.1.5 Feature Implementations
version: 1.0.0
updated: 2026-01-29
applyTo: "**"
---

# Mission

Implement pages, components, server actions, hooks, and tests for ComicWise using Next.js 16.1.5 following repository conventions: App Router, Zod schemas, server actions for mutations, strict TypeScript, and accessible UI.

## Scope & Preconditions

- Use `next` = `16.1.5`.
- Follow existing folder layout: `src/app`, `src/components`, `src/schemas`, `src/lib`.
- Server-side mutations MUST validate with Zod and return consistent error shapes.
- Use Server Components by default; interactive UI must use `use client`.

## Inputs

- Target: a single feature request (page/component/action/hook) with a short description.
- Example input:
  - Feature: "Comic details page with chapters and add/remove bookmark"
  - Files: `src/app/(root)/comics/[slug]/page.tsx`, `src/components/BookmarkButton.tsx`, `src/schemas/bookmark.schema.ts`, `src/actions/bookmark.action.ts`

## Workflow

1. Identify backend and frontend artifacts required by feature.
2. Create/update Zod schema(s) in `src/schemas/` and add a unit test in `tests/schema/`.
3. Implement server actions in `src/actions/`:
   - Validate input with Zod.
   - Return shape: `{ ok: boolean, data?: any, error?: { code:string, message:string } }`.
4. Implement server components (pages) under `src/app/` using direct server/ORM calls where possible.
5. Implement client components with `use client` only when interactive (bookmark button, forms).
   - Use optimistic updates and a small `useOptimisticAction` hook to wrap server-action calls.
6. Add `loading.tsx` and `error.tsx` for nested layouts where applicable.
7. Add Vitest unit tests for schemas and pure logic; add Playwright e2e tests for critical flows.
8. Add JSDoc to public exports and a short PR-ready description listing files changed and verification commands.
9. Run `pnpm validate` and ensure CI-style checks pass locally.

## Output (per run)

- List of files created/updated.
- For each server action: Type definitions, Zod validation, and example return values.
- For pages: server component with recommended `fetch` caching strategy (revalidate note).
- Tests added and passing locally.
- Minimal PR-ready summary and validation commands.

## Quality Gate

- `pnpm type-check` passes.
- No `any` types introduced.
- Zod schemas tested.
- At least one Playwright smoke test for main flow.
- Accessibility basics: headings, alt text, labels.

## Examples (patterns to follow)

- Server action example:
  - `export async function addBookmark(input){ const parsed=AddBookmarkSchema.parse(input); try{ const result=/*insert*/; return {ok:true,data:result}; }catch(e){ return {ok:false,error:{code:'DB_ERROR',message:String(e)}} } }`
- Client optimistic update:
  - `use client` component calling server action and updating local state immediately, reverting on error.

## Acceptance Criteria

- For the requested feature: list of files, tests, and verification steps.
- All tests and `pnpm validate` pass before marking as complete.
