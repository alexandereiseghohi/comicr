# Fix Chapter-Comic Matching in Seeding System

## Context

The seeding system successfully seeds comics and chapters but reports ~3,769 chapter "errors" that are actually **unmatched chapters** - chapters in the seed data that couldn't find their parent comic in the database.

## Current State (as of 2026-02-02)

### Seeding Results

- ✅ 4 users seeded
- ✅ 25 authors seeded
- ✅ 22 artists seeded
- ✅ 36 genres seeded
- ✅ 3 types seeded
- ✅ 470 comics seeded (157 duplicates skipped)
- ✅ 2,369 chapters seeded
- ⚠️ 3,769 chapters couldn't find parent comic

### Recent Fixes Applied

1. Added unique index on `chapterImage(chapterId, pageNumber)` to fix ON CONFLICT clause
2. Optimized seeders (author, artist, genre, type) to return `idMap` directly
3. Removed redundant `buildXxxMap` functions from main.ts (~100 lines removed)

## Problem Analysis

### Root Cause

Chapters reference comics via `comicSlug` or `comicTitle`, but the matching logic in `chapter-seeder.ts` fails to find many comics because:

1. **Slug format mismatch**: Chapter's `comicSlug` may have UUID suffix (e.g., `comic-name-abc123`) while comic's slug was normalized
2. **Title normalization differences**: Different normalization applied during comic vs chapter processing
3. **Comic was skipped as duplicate**: 157 comics were skipped, so their chapters have no parent

### Current Matching Strategy (chapter-seeder.ts lines 230-248)

```typescript
// 1. Direct slug match
if (comicSlug) {
  comicId = comicSlugMap.get(comicSlug);
}
// 2. Normalized slug match (strip UUID)
if (!comicId && comicSlug) {
  comicId = comicSlugMap.get(normalizeSlug(comicSlug));
}
// 3. Title match
if (!comicId && comicTitle) {
  comicId = comicSlugMap.get(normalizeForMatching(comicTitle));
}
```

### comicSlugMap Population (comic-seeder.ts)

The map is populated with:

- Direct slug
- Normalized slug (UUID stripped)
- Normalized title

## Proposed Solutions

### Option 1: Enhanced Slug Matching (Low Risk)

Improve `normalizeSlug` and add more fallback strategies:

- Strip more suffix patterns (dates, random strings)
- Add fuzzy matching with Levenshtein distance for close matches
- Add slug variations (with/without hyphens, underscores)

### Option 2: Build Reverse Lookup (Medium Risk)

When seeding comics, also build a reverse lookup from various slug/title formats:

- Store multiple keys per comic in `comicSlugMap`
- Include original slug, normalized slug, title slug, kebab-case title

### Option 3: Two-Pass Seeding (Medium Risk)

1. First pass: Seed all comics, collect all slug variations
2. Build comprehensive lookup map
3. Second pass: Seed chapters with enhanced matching

### Option 4: Data Cleanup (High Effort)

Clean the source data files to ensure:

- Chapter `comicSlug` exactly matches comic `slug`
- Remove orphaned chapters
- Standardize slug format across all files

## Files to Modify

### Primary Files

- `src/database/seed/seeders/chapter-seeder.ts` - Improve matching logic
- `src/database/seed/seeders/comic-seeder.ts` - Enhance comicSlugMap population

### Related Files

- `src/database/seed/main.ts` - Orchestration
- `src/database/seed/helpers.ts` - Shared utilities
- `data/seed-source/chapters-merged.json` - Source data

## Implementation Plan

### Phase 1: Investigate Data

1. Analyze sample of unmatched chapters to understand patterns
2. Compare chapter `comicSlug` values with comic `slug` values
3. Identify most common mismatch patterns

### Phase 2: Enhance Matching

1. Add additional normalization to `comicSlugMap` keys in comic-seeder
2. Add fallback matching strategies in chapter-seeder
3. Log detailed mismatch info for debugging

### Phase 3: Validate

1. Run seed with enhanced matching
2. Compare error count reduction
3. Verify no false matches (chapter linked to wrong comic)

## Success Criteria

- Reduce unmatched chapters from 3,769 to under 500
- No false positive matches
- Maintain seed performance (under 30s total)
- All existing tests pass

## Commands

```bash
# Run seed and check results
pnpm db:seed

# Check latest seed report
Get-Content data/seed-reports/seed-report-*.json | ConvertFrom-Json | Select-Object -ExpandProperty summary

# Validate types after changes
pnpm type-check

# Run full validation
pnpm validate
```

## Notes

- The 3,769 "errors" don't break the app - they're just chapters without comics
- Current 2,369 seeded chapters is functional for development
- This is a data quality improvement, not a critical bug fix
