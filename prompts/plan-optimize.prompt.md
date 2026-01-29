# ComicWise Platform Completion Plan

## Executive Summary

Complete implementation of the ComicWise comic platform with all CRUD operations, UI pages, testing, and seeding. Current blockers: CSS syntax fix + TypeScript author relation reference. Estimated completion: 9-10 hours of focused implementation.

---

## Part 1: Fix Build Blockers (5 minutes)

### Quick Decision: Two Options for comic.author error

**Option A: Quick Fix (1 minute)**
- Change line 81 in `src/app/(root)/comics/[slug]/page.tsx`
- Replace: `{comic.author && (<p className="text-lg text-slate-600">by {comic.author.name}</p>)}`
- With: `{comic.authorId && (<p className="text-lg text-slate-600">by Comic #{comic.id}</p>)}`
- Impact: Compiles immediately, but author name not displayed
- Use case: If quick validation needed, polish later

**Option B: Proper Fix (3 minutes)**
- Modify `getComicBySlug()` in `src/database/queries/comic-queries.ts`
- Add author relation via JOIN:
  ```typescript
  export async function getComicBySlug(slug: string, userId?: string) {
    return await db.query.comics.findFirst({
      where: eq(comics.slug, slug),
      with: {
        author: true,  // Add this line
        chapters: { limit: 5 },
        ratings: { limit: 3 }
      }
    });
  }
  ```
- Update page component to use `comic.author.name`
- Impact: Full functionality, author data populated, ~5 minutes total

**Recommendation:** Option B (proper fix) — establishes pattern for other 12 tables

---

## Part 2: Implement 12 Remaining Table CRUD Operations (5-6 hours)

### Proven 5-File Pattern (Per Table)

Each database table requires these 5 files:

#### 1. Zod Schema (`src/lib/schemas/{name}-schema.ts`)
```typescript
import { z } from "zod";

export const create{Name}Schema = z.object({
  name: z.string().min(1).max(255),
  // ... other fields
});

export const update{Name}Schema = create{Name}Schema.partial();
export type Create{Name}Input = z.infer<typeof create{Name}Schema>;
export type Update{Name}Input = z.infer<typeof update{Name}Schema>;
```

#### 2. Database Queries (`src/database/queries/{name}-queries.ts`)
```typescript
import { db } from "@/database";
import { {tables} } from "@/database/schema";

export async function get{Name}ById(id: number) {
  return await db.query.{tables}.findFirst({
    where: eq({tables}.id, id),
  });
}

export async function getAll{Names}(limit = 100) {
  return await db.query.{tables}.findMany({ limit });
}
```

#### 3. Database Mutations (`src/database/mutations/{name}-mutations.ts`)
```typescript
import { db } from "@/database";
import { {tables} } from "@/database/schema";
import { Create{Name}Input, Update{Name}Input } from "@/lib/schemas/{name}-schema";

export async function create{Name}(data: Create{Name}Input) {
  const [result] = await db.insert({tables}).values(data).returning();
  return result;
}

export async function update{Name}(id: number, data: Update{Name}Input) {
  const [result] = await db
    .update({tables})
    .set(data)
    .where(eq({tables}.id, id))
    .returning();
  return result;
}

export async function delete{Name}(id: number) {
  await db.delete({tables}).where(eq({tables}.id, id));
}
```

#### 4. API Routes (`src/app/api/{plural}/route.ts` and `[id]/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAll{Names}, get{Name}ById } from "@/database/queries/{name}-queries";
import { create{Name}, update{Name}, delete{Name} } from "@/database/mutations/{name}-mutations";
import { create{Name}Schema, update{Name}Schema } from "@/lib/schemas/{name}-schema";

// GET all
export async function GET(req: NextRequest) {
  try {
    const {plural} = await getAll{Names}();
    return NextResponse.json({plural});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST create
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = create{Name}Schema.parse(await req.json());
    const result = await create{Name}(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
}

// GET/:id, PATCH/:id, DELETE/:id follow similar patterns
```

#### 5. Server Actions (`src/app/actions/{name}-actions.ts`)
```typescript
"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { create{Name}, update{Name}, delete{Name} } from "@/database/mutations/{name}-mutations";
import { create{Name}Schema, update{Name}Schema } from "@/lib/schemas/{name}-schema";

export async function create{Name}Action(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const data = {
      name: formData.get("name"),
      // ... parse form data
    };
    const validated = create{Name}Schema.parse(data);
    const result = await create{Name}(validated);
    return { success: true, data: result };
  } catch (error) {
    return { error: "Failed to create" };
  }
}

export async function update{Name}Action(id: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const data = {
      name: formData.get("name"),
      // ... parse form data
    };
    const validated = update{Name}Schema.parse(data);
    const result = await update{Name}(id, validated);
    return { success: true, data: result };
  } catch (error) {
    return { error: "Failed to update" };
  }
}

export async function delete{Name}Action(id: number) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await delete{Name}(id);
    redirect("/admin/{plural}");
  } catch (error) {
    return { error: "Failed to delete" };
  }
}
```

### 12 Tables Implementation Sequence

| # | Table | Dependencies | Time | Files | Priority |
|---|-------|--------------|------|-------|----------|
| 1 | author | None | 8 min | 5 | HIGH |
| 2 | artist | None | 8 min | 5 | HIGH |
| 3 | type | None | 6 min | 5 | MEDIUM |
| 4 | genre | None | 6 min | 5 | MEDIUM |
| 5 | tag | None | 6 min | 5 | MEDIUM |
| 6 | comicTag | comic, tag | 8 min | 5 | HIGH |
| 7 | comment | comic, user | 10 min | 5 | HIGH |
| 8 | rating | comic, user | 10 min | 5 | HIGH |
| 9 | bookmark | comic, user | 8 min | 5 | HIGH |
| 10 | notification | user | 10 min | 5 | MEDIUM |
| 11 | series | None | 8 min | 5 | MEDIUM |
| 12 | userProfile | user | 10 min | 5 | LOW |

**Total Time: 62 minutes for all 12 tables**

Implementation order: Tables 1-5 first (no dependencies), then 6-12 (with dependencies)

---

## Part 3: Build UI Pages & Components (4-5 hours)

### 8 Pages to Create

1. **Comics Management** (`/admin/comics`)
   - List all comics with filter/search
   - Create new comic form
   - Edit comic form

2. **Authors Management** (`/admin/authors`)
   - List all authors
   - Create/edit author

3. **Artists Management** (`/admin/artists`)
   - List all artists
   - Create/edit artist

4. **Genres Management** (`/admin/genres`)
   - List all genres
   - Create/edit genre

5. **Tags Management** (`/admin/tags`)
   - List all tags
   - Create/edit tag

6. **Public Comics Browse** (`/comics` or `/browse`)
   - Infinite scroll or pagination
   - Filter by genre/tag
   - Search functionality

7. **Comic Detail Page** (`/comics/[slug]`)
   - Display comic info + author + artist
   - Show chapters list
   - Comments section
   - Rating/review section

8. **User Profile** (`/profile`)
   - Display bookmarks
   - Reading history
   - Reviews/ratings

### 5 Reusable Components

1. **ComicCard**
   - Displays cover image + title + author
   - Used in browse/search lists
   - Optimized with Image component

2. **ComicForm**
   - Reusable form for create/update
   - Fields: title, slug, description, status, authorId, artistId
   - Validation feedback

3. **FilterBar**
   - Genre/tag/status filters
   - Search input
   - Apply/reset buttons

4. **CommentThread**
   - Nested comments display
   - Add comment form
   - Rating/upvote functionality

5. **ChapterReader**
   - Display chapter pages
   - Navigation (prev/next chapter)
   - Progress saving

---

## Part 4: Testing & Verification (30 minutes)

### API Endpoint Testing

```bash
# Test Author CRUD
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Author", "bio": "Test bio"}'

curl -X GET http://localhost:3000/api/authors

curl -X GET http://localhost:3000/api/authors/1

curl -X PATCH http://localhost:3000/api/authors/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Author"}'

curl -X DELETE http://localhost:3000/api/authors/1
```

### Build Verification
```bash
pnpm build  # Should complete with exit code 0
pnpm dev    # Should start dev server on http://localhost:3000
```

### UI Testing Checklist
- [ ] Comic list loads and displays cards
- [ ] Filter/search functionality works
- [ ] Create comic form submits successfully
- [ ] Comic detail page loads author data
- [ ] Comments section displays and allows posting
- [ ] Rating/bookmark functionality works
- [ ] User profile shows bookmarks
- [ ] Navigation between pages works

---

## Part 5: Seeding & Data Validation (15 minutes)

### Execute Seeding
```bash
pnpm db:seed
# Generates:
# - 10 Authors
# - 10 Artists
# - 5 Types
# - 15 Genres
# - 50 Tags
# - 20 Comics (with relationships)
# - 100 Chapters
# - 500 Comments
# - 100 Ratings
# - 50 Bookmarks
```

### Verify in Prisma Studio
```bash
pnpm db:studio  # Opens visual database browser
```

### Data Validation
- [ ] Authors created successfully
- [ ] Comics linked to authors correctly
- [ ] Chapters linked to comics correctly
- [ ] Comments linked correctly
- [ ] Ratings within valid range
- [ ] Bookmarks reference valid users/comics

---

## Timeline Breakdown

| Phase | Component | Time | Status |
|-------|-----------|------|--------|
| 1 | Fix CSS syntax | 2 min | ✅ DONE |
| 1 | Fix TypeScript error | 3 min | ⏳ DECISION NEEDED |
| 1 | Verify build passes | 2 min | ⏳ PENDING |
| 2 | Author CRUD (5 files) | 8 min | ❌ TODO |
| 2 | Artist CRUD (5 files) | 8 min | ❌ TODO |
| 2 | Type/Genre/Tag each (15 min) | 18 min | ❌ TODO |
| 2 | comicTag/Comment/Rating/Bookmark each (36 min) | 36 min | ❌ TODO |
| 2 | Notification/Series/UserProfile each (28 min) | 28 min | ❌ TODO |
| 3 | 8 Pages (30 min each) | 240 min | ❌ TODO |
| 3 | 5 Components (20 min each) | 100 min | ❌ TODO |
| 4 | API testing | 15 min | ❌ TODO |
| 4 | UI testing | 15 min | ❌ TODO |
| 5 | Seeding execution | 5 min | ❌ TODO |
| 5 | Data validation | 10 min | ❌ TODO |
| **TOTAL** | | **~9-10 hours** | |

---

## Decision Points

### 1. Comic Author Fix
- **A (Quick):** Change to `comic.authorId` — 1 minute, author name not displayed
- **B (Proper):** JOIN query + update component — 3 minutes, full functionality
- **Recommendation:** B (proper), establishes pattern for all 12 tables

### 2. UI Framework Choice
- Use existing shadcn/ui components (Button, Dialog, Form, Input, etc.)
- Tailwind CSS for custom styling
- Next.js Image component for optimization

### 3. Testing Approach
- Manual API testing with curl (fastest)
- UI testing in browser (check list above)
- Automated tests optional (not in 9-hour estimate)

### 4. Seeding Strategy
- Run provided seed.ts after all tables are implemented
- Validates all relationships work correctly
- Provides demo data for UI testing

---

## Success Criteria

✅ Build passes with `pnpm build` (exit code 0)
✅ All 12 tables have full CRUD (5 files each = 60 files)
✅ 8 pages created and navigable
✅ 5 reusable components working
✅ All API endpoints tested with curl
✅ UI pages load without errors
✅ Database seeded with demo data
✅ Author relationships working (established in Part 1)
✅ Comments/ratings/bookmarks functional
✅ User profile page shows bookmarks

---

## Implementation Notes

### File Organization
```
src/
├── lib/schemas/        # 12 new schemas
├── database/
│   ├── queries/        # 12 new query files
│   └── mutations/      # 12 new mutation files
├── app/api/            # 12 new route.ts files (24 endpoints)
├── app/actions/        # 12 new action files
├── app/(root)/
│   ├── admin/          # 6 admin pages
│   └── comics/         # 2 public pages
└── components/custom/  # 5 new components
```

### Pattern Consistency
- All schemas use same Zod patterns (create + update)
- All queries use db.query API with consistent naming
- All mutations follow same structure (create/update/delete)
- All API routes follow same auth + validation pattern
- All server actions use "use server" directive

### Code Generation Opportunity
Once first table is complete, use patterns to generate remaining 11 tables systematically (swap {Name} variables)

---

## Ready to Execute

This plan is ready for implementation once:
1. ✅ User confirms Option A or Option B for comic.author fix
2. ✅ Implementation tools are enabled/available
3. ✅ User confirms systematic approach preferred

Expected outcome: Full working ComicWise platform with 19 database tables, REST APIs, UI pages, authentication, and seeding in 9-10 hours.
