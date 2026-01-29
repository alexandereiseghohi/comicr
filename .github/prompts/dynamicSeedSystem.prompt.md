Plan: Dynamic Seeding & Image Helpers for ComicWise

TL;DR

Add a robust, batched, zod-validated seeding system and image helpers that:

- Load JSON seed files and patterns (comics, chapters, users)
- Validate using zod schemas and normalize image URLs
- Seed via Drizzle ORM with upsert (onConflictDoUpdate) and batched inserts
- Download and deduplicate images (filesystem + DB) and save under
  `public/comics/...` and `public/comics/chapters/...`
- Use `CUSTOM_PASSWORD` env var hashed with bcryptjs for seeded users
- Provide both a CLI (`pnpm run seed`) and a protected API/admin UI
  (`SEED_API_KEY`) to trigger seeding
- Provide Vitest tests for loader/validator/image dedupe logic

Design Decisions / Defaults

- ORM: Drizzle (existing in repo)
- Path alias: `@/` -> `src/` (use same imports)
- Image formats allowed: jpeg, jpg, png, webp, avif
- Concurrency: 5 (configurable via env `SEED_DOWNLOAD_CONCURRENCY`)
- Max image size: 5 MB (env `SEED_MAX_IMAGE_SIZE_BYTES`)
- Password: `CUSTOM_PASSWORD` (env) hashed with bcryptjs (saltRounds=10)
- Fetch: native `fetch` (Node 18+; use undici polyfill if needed)
- Image dedupe: check filesystem path and a new `media` DB table (or
  `comicImage`/`chapterImage` tables if present) using sha256 hash of URL +
  filename
- Placeholder fallbacks: `./public/placeholder-comic.jpg` (comics) and
  `./public/shadcn.jpg` (users)

Files to Create / Modify

1. `src/lib/seedHelpers.ts` — Generic JSON loader, load pattern, zod validation
   helpers, batched seedTable with Drizzle upsert and logging.
2. `src/lib/imageHelper.ts` — Download helper, concurrency limiter, validate
   extension, ensure leading `/` or absolute URL, filesystem save to
   `public/comics/covers/${comic.slug}/` and
   `public/comics/chapters/${comic.slug}/${chapter.slug}/`, keep original
   filename and extension, fallback placeholder, avoid downloading same image
   twice (fs + DB checks), return saved relative path.
3. `src/lib/validations/seed.ts` — zod schemas for users, comics, chapters;
   utilities to normalize/validate image URLs and image arrays.
4. `src/database/seed/seed-config.ts` — central settings (concurrency,
   directories, allowed formats, max size, placeholder names, env var keys).
5. `src/database/seed/seed.ts` — CLI runner (tsx-friendly) that:
   - Loads JSON files/patterns (`users.json`, `comics.json`, `comicsdata*.json`,
     `chapters.json`, `chaptersdata*.json`).
   - Validates using zod schemas.
   - Seeds users, then comics, then chapters in batches.
   - Uses bcryptjs to hash `CUSTOM_PASSWORD`.
   - Uses image helper to download images and attach saved path to inserted
     records.
   - Uses Drizzle upsert (onConflictDoUpdate) to avoid duplicates and update
     changed fields.
   - Logs concise progress and counts.
6. `src/pages/api/dev/seed.ts` (or app route) + `src/app/dev/seed/page.tsx` —
   protected by `SEED_API_KEY`, simple admin button to trigger seeding and show
   progress/success.
7. `tests/seed.spec.ts` — Vitest tests for:
   - `loadJsonData` with valid/invalid inputs
   - zod validators for sample items
   - `imageHelper` dedupe logic via mocked fs/fetch
8. Update `package.json` scripts: `seed`, `seed:dry`, `seed:api`.
9. `src/database/seed/README.md` — Instructions to run, env vars required, and
   troubleshooting tips.

Env Vars

- `CUSTOM_PASSWORD` — plaintext used to seed users (required)
- `SEED_DOWNLOAD_CONCURRENCY` — default 5
- `SEED_MAX_IMAGE_SIZE_BYTES` — default 5242880
- `SEED_API_KEY` — secret to protect API route
- `DRIZZLE_CLIENT_PATH` — if required by existing seed scripts

Operational Notes / Edge Cases

- Large JSON arrays: seeders will insert in batches (default 100-500) to avoid
  memory and DB transaction overload.
- Missing files: seed runner will log missing pattern matches instead of crash;
  user can supply additional files if desired.
- Image download failures: retry 3 times with exponential backoff before using
  placeholder; failed images are logged.
- Duplicate images: dedupe by checking saved file path + hash; if DB media
  record exists, skip download and return existing path.
- Filename collisions: preserve original filename; if file exists with same name
  but different hash, append counter `-1`, `-2`.
- Use native `fetch`; if not available, instruct to `pnpm add undici`.

Run / Try It

- Dry run validation only (no DB writes or downloads):

```bash
pnpm run seed:dry
```

- Full seed (CLI):

```bash
pnpm run seed
```

- Trigger via API (admin page will use this): visit `/dev/seed` and provide
  `SEED_API_KEY`.

Next Steps

- Implement the TypeScript files above and tests. Start with
  `src/lib/seedHelpers.ts` and `src/lib/validations/seed.ts` to allow quick
  validation runs.
- After implementation, run `pnpm run seed:dry` and unit tests via
  `pnpm run test` (vitest).

Notes for Reviewer

- Keep changes minimal and additive; avoid refactoring existing seed files
  unless necessary — provide adapters to integrate with existing
  `src/database/seed/*` scripts.
- Where Drizzle schema/table names differ, map seed table names to schema
  exports and use `db.insert(table).values(...)` and Drizzle's
  `onConflictDoUpdate` patterns.

---

Created by GitHub Copilot assistant as a workspace plan for implementing the
Dynamic Seeding & Image Helpers feature set.
