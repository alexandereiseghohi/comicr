# ComicWise Dynamic Seeding System

## Overview

This seeding system loads JSON files, validates with Zod, downloads/dedupes images, and seeds the database via Drizzle ORM with upsert and batching. It supports CLI, protected API, and admin UI triggers.

## Usage

### 1. CLI Seeding

- Full seed:
  ```bash
  pnpm run seed
  ```
- Dry run (validation only, no DB writes or downloads):
  ```bash
  pnpm run seed:dry
  ```

### 2. API Trigger

- POST to `/api/dev/seed` with header `x-seed-api-key: <your_key>`
- Example:
  ```bash
  pnpm run seed:api
  ```

### 3. Admin UI

- Visit `/dev/seed` in your browser, enter the API key, and trigger seeding.

## Required Files

- `users.json`, `comics.json`, `chapters.json` in project root (or adjust paths in dynamic-seed.ts)

## Environment Variables

- `CUSTOM_PASSWORD` — plaintext password for seeded users (required)
- `SEED_DOWNLOAD_CONCURRENCY` — default 5
- `SEED_MAX_IMAGE_SIZE_BYTES` — default 5242880
- `SEED_API_KEY` — secret for API/admin UI
- `DRIZZLE_CLIENT_PATH` — if required by Drizzle

## Features

- Zod validation for all seed data
- Batched upsert with Drizzle ORM
- Image download, deduplication, and fallback
- CLI, API, and UI triggers
- Vitest tests for loader, validator, and image dedupe

## Troubleshooting

- **Missing files:** Seeder logs missing files and continues
- **Image download fails:** Retries 3x, then uses placeholder
- **Duplicate images:** Dedupe by file path and hash
- **Filename collisions:** Appends counter if needed
- **Node fetch errors:** Use Node 18+ or install `undici`
- **DB errors:** Check Drizzle config and DB connection

## Extending

- Add more JSON patterns (e.g., `comicsdata*.json`) as needed
- Adjust batch size and concurrency in `seed-config.ts`

---

Created by Copilot agent for ComicWise dynamic seeding system.
