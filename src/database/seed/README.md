# ComicWise Dynamic Seeding System

## Overview

This seeding system loads JSON files, validates with Zod, downloads/dedupes images, and seeds the database via Drizzle ORM with upsert and batching. It supports CLI, protected API (with SSE streaming), and admin UI triggers.

## Features

- **Zod Validation**: Comprehensive schemas for all entity types (users, authors, artists, genres, types, comics, chapters)
- **Batched Upsert**: Efficient database seeding with Drizzle ORM
- **Image Management**: Download, hash-based deduplication, concurrency control, retry logic
- **Dry-Run Mode**: Validate data without writing to database or downloading images
- **Progress Streaming**: Real-time progress via Server-Sent Events (SSE)
- **Multiple Triggers**: CLI, protected API, and admin UI
- **Glob Patterns**: Auto-discover JSON files matching patterns (e.g., `comicsdata*.json`)

## Usage

### 1. CLI Seeding

```bash
# Full seed
pnpm run seed

# Dry run (validation only, no DB writes or downloads)
pnpm run seed:dry

# Or directly with tsx
pnpm tsx src/database/seed/dynamic-seed.ts --dry
```

### 2. API Trigger

POST to `/api/dev/seed` with header `x-seed-api-key: <your_key>`

```bash
# Basic seed
curl -X POST http://localhost:3000/api/dev/seed \
  -H "x-seed-api-key: your_key"

# With dry-run
curl -X POST "http://localhost:3000/api/dev/seed?dry=true" \
  -H "x-seed-api-key: your_key"

# With SSE streaming for real-time progress
curl -X POST "http://localhost:3000/api/dev/seed?stream=true" \
  -H "x-seed-api-key: your_key"

# JSON body options
curl -X POST http://localhost:3000/api/dev/seed \
  -H "x-seed-api-key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "stream": true}'
```

### 3. Admin UI

Visit `/dev/seed` in your browser:

1. Enter the API key
2. Toggle **Dry Run** to validate without writing
3. Toggle **Real-time Progress** for SSE streaming
4. Click **Run Seeder** or **Validate Data**

The UI shows:

- Current phase (users, comics, chapters)
- Progress bar with item counts
- Color-coded log output
- Cancel button for streaming requests

## Required Files

Place JSON seed files in the project root:

| File                 | Description                            |
| -------------------- | -------------------------------------- |
| `users.json`         | User records with id, name, email      |
| `comics.json`        | Base comic records                     |
| `comicsdata*.json`   | Additional comic data (glob pattern)   |
| `chapters.json`      | Base chapter records                   |
| `chaptersdata*.json` | Additional chapter data (glob pattern) |

## Environment Variables

| Variable                    | Description                 | Default       |
| --------------------------- | --------------------------- | ------------- |
| `CUSTOM_PASSWORD`           | Password for seeded users   | _Required_    |
| `SEED_API_KEY`              | API/admin UI authentication | _Required_    |
| `SEED_DOWNLOAD_CONCURRENCY` | Parallel image downloads    | 5             |
| `SEED_MAX_IMAGE_SIZE_BYTES` | Max image file size         | 5242880 (5MB) |

## Entity Seeders

Individual seeders are available for each entity type:

```typescript
import { seedAuthors, seedArtists, seedGenres, seedTypes } from "./seeders";

// Seed authors with progress callback
await seedAuthors({
  authors: rawData,
  dryRun: false,
  onProgress: (current, total) => console.log(`${current}/${total}`),
});
```

## Validation Schemas

All seed data is validated with Zod schemas:

```typescript
import {
  UserSeedSchema,
  ComicSeedSchema,
  ChapterSeedSchema,
  AuthorSeedSchema,
  ArtistSeedSchema,
  GenreSeedSchema,
  TypeSeedSchema,
  SeedConfigSchema,
} from "@/lib/validations/seed";

// Validate before seeding
const result = ComicSeedSchema.safeParse(comicData);
if (!result.success) {
  console.error("Validation failed:", result.error);
}
```

## Configuration

Edit `seed-config.ts` for customization:

```typescript
export const config = {
  BATCH_SIZE: 100, // Items per batch
  DOWNLOAD_CONCURRENCY: 5, // Parallel downloads
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  COMICS_COVER_DIR: "public/images/comics",
  CHAPTERS_IMAGE_DIR: "public/images/chapters",
  PLACEHOLDER_COMIC: "/images/placeholder.png",
};
```

## Image Deduplication

The system uses multiple strategies to avoid re-downloading images:

1. **File Path Check**: Skip if file already exists
2. **Content Hash**: xxhash-wasm for fast hash comparison
3. **In-Memory Cache**: Track downloaded URLs within session
4. **Collision Handling**: Append counter for duplicate filenames

```typescript
import { downloadAndSaveImage, clearDownloadCache } from "@/lib/imageHelper";

const imagePath = await downloadAndSaveImage({
  url: "https://example.com/cover.jpg",
  destDir: "public/images/comics/my-comic",
  filename: "cover.jpg",
  fallback: "/images/placeholder.png",
  maxRetries: 3,
});

// Clear cache between seed runs
clearDownloadCache();
```

## Troubleshooting

| Issue                | Solution                                |
| -------------------- | --------------------------------------- |
| Missing files        | Seeder logs warning and continues       |
| Image download fails | Retries 3x, uses placeholder on failure |
| Duplicate images     | Skipped via hash comparison             |
| Filename collisions  | Counter appended (e.g., `cover-1.jpg`)  |
| Node fetch errors    | Use Node 18+ or install `undici`        |
| DB errors            | Check Drizzle config and connection     |
| Env validation fails | Ensure all required env vars are set    |

## Extending

### Add New Entity Type

1. Create schema in `src/lib/validations/seed.ts`:

   ```typescript
   export const NewEntitySchema = z.object({...});
   ```

2. Create seeder in `src/database/seed/seeders/`:

   ```typescript
   export async function seedNewEntities(options) {...}
   ```

3. Export from `seeders/index.ts`

4. Add to main seeder flow in `main.ts`

### Add New JSON Pattern

Update `main.ts` to discover additional files:

```typescript
const additionalFiles = await discoverJsonFiles("mydata*.json");
```

---

Created and maintained by ComicWise team.
