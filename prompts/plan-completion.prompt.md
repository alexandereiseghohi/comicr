# Day-by-Day Execution Plan: ComicWise Completion

## Assumptions
- Working ~8-10 focused hours/day
- You have PostgreSQL database running with correct `DATABASE_URL` in `.env.local`
- Building on existing code (schema ✓, auth ✓, Comic API partially ready)

---

## DAY 1: Fix Blockers & Core Product (8-10 hours)

### MORNING: Phase 0 — Blockers (1 hour, 9:00 AM - 10:00 AM)

**[0.1] Fix CSS Build Error** (20 min)
- **Problem:** `/images/black.webp` missing, blocking build
- **Action:**
  - Open [src/styles/globals.css](src/styles/globals.css)
  - Find reference to `black.webp` (likely background-image or similar)
  - Either:
    - Option A: Create [public/images/black.webp](public/images/black.webp) (download or generate 1KB black placeholder)
    - Option B: Comment out or replace the URL
  - Verify: Run `pnpm build` — succeeds without errors
- **Validation:** No CSS compilation errors in build output

**[0.2] Initialize Database** (20 min)
- **Problem:** Migrations not applied, database schema not created
- **Action:**
  - Verify `.env.local` has `DATABASE_URL` (e.g., `postgresql://user:pass@localhost/comicwise`)
  - Run: `pnpm db:push`
  - Check output: "Your database is now in sync with your schema"
- **Validation:** PostgreSQL has all 19 tables created

**[0.3] Validate Authentication Works** (20 min)
- **Problem:** Need to confirm auth system functions end-to-end
- **Action:**
  - Run: `pnpm dev`
  - Navigate to: `http://localhost:3000/sign-in`
  - Create test account (sign-up)
  - Verify: Test user created in `user` table
  - Sign in with new account
  - Verify: Session token created
- **Validation:** Auth flow works, user can sign in/out

**⏱️ Checkpoint 1 (10:00 AM):** Build works, DB initialized, auth functional → **UNBLOCKED**

---

### MIDDAY: Phase 1 — Comic CRUD Frontend (5-6 hours, 10:00 AM - 3:30 PM)

**[1.1] Create/Complete Comic Components** (1.5 hours)

**File 1.1.1:** [src/components/comics/comic-card.tsx](src/components/comics/comic-card.tsx)
```
What it should do:
- Display single comic in a card layout
- Show: comic.coverImage, comic.title, comic.description, comic.rating
- Link to comics/[slug]/page
- Responsive grid (1 col mobile, 3 col desktop)
- Use shadcn Card component
```
- **If file exists:** Review existing – enhance if needed
- **If not exists:** Create from scratch – basic card structure

**File 1.1.2:** [src/components/comics/comic-list.tsx](src/components/comics/comic-list.tsx)
```
What it should do:
- Parent component that renders grid of ComicCards
- Accept: comics array, isLoading, pagination info
- Show pagination controls (page/hasMore)
- Show loading skeletons while fetching
- Pass onClick handlers to cards
```
- **If file exists:** Verify uses ComicCard, handles loading state
- **If not exists:** Create grid wrapper with pagination

**File 1.1.3:** [src/components/comics/comic-filters.tsx](src/components/comics/comic-filters.tsx)
```
What it should do:
- Render filter controls: genre, type, status
- Use form component from shadcn
- Emit onChange with selected filters
- Accept: available genres, types, statusOptions
```
- **If file exists:** Verify filters match database enums (comicStatus, type)
- **If not exists:** Create form with Select components for each filter

**File 1.1.4 (NEW):** [src/components/comics/comic-detail.tsx](src/components/comics/comic-detail.tsx)
- **What it should do:**
  - Display full comic info: title, description, cover, authors, artists, genres, chapters count
  - Show chapter list below
  - Use shadcn Card, Badge, Button components
  - Include "Edit" button (visible to admin only)

**Validation:** All 4 components render without errors in dev mode

---

**[1.2] Create Comic Pages** (2 hours)

**File 1.2.1 (NEW):** [src/app/(root)/comics/page.tsx](src/app/(root)/comics/page.tsx)
```
What it should do:
- Render header "Browse Comics"
- Render ComicFilters component
- Fetch comics from GET /api/comics?genre=X&type=Y&page=Z
- Render ComicList with fetched data
- Handle loading/error states

Structure:
export default async function ComicsPage() {
  const { searchParams } = props
  const filters = {
    genre: searchParams.genre || '',
    type: searchParams.type || '',
    page: searchParams.page || '1'
  }

  const comics = await fetch(`/api/comics?...filters`)

  return (
    <div>
      <h1>Browse Comics</h1>
      <ComicFilters />
      <ComicList comics={comics} />
    </div>
  )
}
```
- **If file exists:** Update to use ComicFilters and proper pagination
- **If not exists:** Create as shown above

**File 1.2.2 (NEW):** [src/app/(root)/comics/[slug]/page.tsx](src/app/(root)/comics/[slug]/page.tsx)
```
What it should do:
- Fetch single comic by slug from GET /api/comics/[id]
- Fetch chapters for this comic
- Render ComicDetail component
- List chapters below (link to chapter reader)
- Handle 404 if comic not found

Structure:
export default async function ComicDetailPage({ params }) {
  const comic = await fetch(`/api/comics/${params.slug}`)
  const chapters = await fetch(`/api/chapters?comicId=${comic.id}`)

  if (!comic) notFound()

  return (
    <div>
      <ComicDetail comic={comic} />
      <ChapterList chapters={chapters} />
    </div>
  )
}
```
- **If file exists:** Verify fetches comic detail + chapters
- **If not exists:** Create as shown above

**File 1.2.3 (NEW, DEFER if time):** [src/app/(root)/comics/[slug]/edit/page.tsx](src/app/(root)/comics/[slug]/edit/page.tsx)
```
What it should do:
- Check if user is admin (redirect to /comics/[slug] if not)
- Render comic edit form pre-filled with current data
- On submit: PUT /api/comics/[id] with updated fields
- Redirect to /comics/[slug] on success
```
- **Note:** This is low priority, can be done Day 2

**Validation:**
- `http://localhost:3000/comics` loads and shows comic list
- Click comic card → `/comics/[slug]` shows detail
- Images load (if using placeholder, that's fine)

---

**[1.3] Verify/Enhance Comic API** (30 min)

**File 1.3.1:** [src/app/api/comics/route.ts](src/app/api/comics/route.ts)
```
Checklist:
- GET handler accepts: ?genre=X&type=Y&page=Z&limit=12
- Fetches from database with those filters
- Returns: { comics: [...], total, hasMore }
- POST handler (if admin): creates new comic
- Handles errors gracefully
```
- **Action:** Review existing file
- **If complete:** No changes needed
- **If missing pagination/filters:** Add them now
- **If missing POST:** Add admin-protected POST handler

**File 1.3.2:** [src/app/api/comics/[id]/route.ts](src/app/api/comics/[id]/route.ts)
```
Checklist:
- GET handler: returns single comic + related data (authors, artists, genres)
- PUT handler (admin only): updates comic
- DELETE handler (admin only): soft-delete comic
- 404 if comic not found
```
- **Action:** Review existing file
- **If missing PUT/DELETE:** Add now
- **If missing relations:** Add SELECT with relations

**Validation:**
- `curl http://localhost:3000/api/comics` returns paginated list
- `curl http://localhost:3000/api/comics/comic-id` returns single comic with relations

---

**⏱️ Checkpoint 2 (3:30 PM):** Comic browsing works → Users can see comics, filter, view details

---

### AFTERNOON: Phase 2.1 — Author & Artist CRUD (2-3 hours, 3:30 PM - 6:00 PM)

**[2.1] Create Author CRUD** (1.5 hours)

**Pattern reminder:** Comic already has this pattern. Copy and adapt.

**File 2.1.1 (NEW):** [src/database/queries/author.queries.ts](src/database/queries/author.queries.ts)
```
What it should contain (use src/database/queries/comic.queries.ts as template):
- getAuthors() → SELECT * FROM author
- getAuthorById(id) → SELECT * WHERE id
- getAuthorBySlug(slug) → SELECT * WHERE slug
- searchAuthors(term) → SELECT * WHERE name LIKE
- Other helper queries used by mutations
```
- **Dependency:** Uses schema from [src/database/schema.ts](src/database/schema.ts) (should already exist)
- **Action:** Create or review/enhance

**File 2.1.2 (NEW):** [src/database/mutations/author.mutations.ts](src/database/mutations/author.mutations.ts)
```
What it should contain:
- createAuthor(data) → INSERT INTO author
- updateAuthor(id, data) → UPDATE author
- deleteAuthor(id) → DELETE FROM author (soft delete if column exists)
- Uses transactions for data integrity
```
- **Action:** Create using author mutations from comic as template

**File 2.1.3 (NEW):** [src/app/api/authors/route.ts](src/app/api/authors/route.ts)
```
What it should contain:
- GET handler: list all authors (admin only or public?)
- POST handler: create author (admin only)
  - Validate: name required, email unique
  - Return: created author
```
- **Action:** Create API route

**File 2.1.4 (NEW):** [src/app/api/authors/[id]/route.ts](src/app/api/authors/[id]/route.ts)
```
What it should contain:
- GET handler: single author detail
- PUT handler: update (admin only)
- DELETE handler: delete (admin only)
```
- **Action:** Create API route

**File 2.1.5 (NEW):** [src/lib/actions/author.actions.ts](src/lib/actions/author.actions.ts)
```
What it should contain:
- createAuthorAction(formData) → server action
  - Validate with Zod schema
  - Call createAuthor mutation
  - Return: { success, data, error }
- updateAuthorAction(id, formData) → server action
```
- **Action:** Create server actions (use [src/lib/actions/comic.actions.ts](src/lib/actions/comic.actions.ts) as template)

**Validation:**
- `curl -X POST http://localhost:3000/api/authors -H "Content-Type: application/json" -d '{"name": "Test Author"}'` creates author
- Database has new author record

---

**[2.2] Create Artist CRUD** (1.5 hours)
- **Action:** Repeat 2.1 exactly, replacing "author" with "artist"
- **Files:** artist.queries.ts, artist.mutations.ts, /api/artists/route.ts, /api/artists/[id]/route.ts, artist.actions.ts
- **Time:** Faster because copying exact pattern (~1 hour)

**⏱️ Checkpoint 3 (6:00 PM):** Author & Artist CRUD working → Can create/update/delete authors and artists via API

---

## DAY 2: Extend CRUD & Build Pages (8-10 hours)

### MORNING: Complete CRUD Patterns (5-6 hours, 9:00 AM - 2:00 PM)

**[2.3] Create Chapter CRUD** (2 hours)

**Note:** Chapter is complex because:
- Depends on Comic (foreign key)
- Has image sequence (images enum or relation)
- Needs pagination/ordering

**File 2.3.1:** [src/database/queries/chapter.queries.ts](src/database/queries/chapter.queries.ts)
```
Queries needed:
- getChapters(filters) → with sorting, pagination
- getChaptersByComic(comicId) → chapters for specific comic
- getChapterDetail(id) → single chapter with images
- getChapterByNumber(comicId, number) → specific chapter
```

**File 2.3.2:** [src/database/mutations/chapter.mutations.ts](src/database/mutations/chapter.mutations.ts)
```
Mutations needed:
- createChapter(comicId, data) → INSERT
- updateChapter(id, data) → UPDATE (including image order)
- deleteChapter(id) → DELETE
- reorderChapterImages(chapterId, imageIds) → UPDATE image sequence
```

**File 2.3.3:** [src/app/api/chapters/route.ts](src/app/api/chapters/route.ts)
```
GET handler:
- Query params: comicId, page, limit
- Returns: chapters for comic with pagination
POST handler (admin):
- Creates new chapter for comic
```

**File 2.3.4:** [src/app/api/chapters/[id]/route.ts](src://app/api/chapters/[id]/route.ts)
```
GET: single chapter detail + images
PUT: update chapter (admin)
DELETE: delete chapter (admin)
```

**File 2.3.5:** [src/lib/actions/chapter.actions.ts](src/lib/actions/chapter.actions.ts)
```
Server actions for:
- createChapter(comicId, formData)
- uploadChapterImages(chapterId, files)
- updateChapter(id, data)
```

**Validation:**
- POST chapter creates DB record with comicId link
- Chapter list returns only chapters for that comic

---

**[2.4] Create Genre & Type CRUD** (1.5 hours each = 3 hours)

These are simpler (no complex relations), so faster.

**Genre CRUD:**
- [src/database/queries/genre.queries.ts](src/database/queries/genre.queries.ts)
- [src/database/mutations/genre.mutations.ts](src/database/mutations/genre.mutations.ts)
- [src/app/api/genres/route.ts](src/app/api/genres/route.ts)
- [src/app/api/genres/[id]/route.ts](src/app/api/genres/[id]/route.ts)
- [src/lib/actions/genre.actions.ts](src/lib/actions/genre.actions.ts)

**Type CRUD:**
- Repeat exactly (folder: types instead of genre)

**Estimated time:** ~30 min per entity (very mechanical, just copy Comic pattern)

**⏱️ Checkpoint 4 (2:00 PM):** All CRUD tables complete → Full backend ready for UI

---

### AFTERNOON: Core Page Infrastructure (3-4 hours, 2:00 PM - 6:00 PM)

**[3.1] Create Root Layout & Navigation** (1.5 hours)

**File 3.1.1:** [src/app/layout.tsx](src/app/layout.tsx) — **MODIFY EXISTING**
```
Current: Probably minimal default template
Change:
- Add <Header /> and <Footer /> components
- Add <Providers /> wrapper
- Add global error boundary (optional, can defer)
- Add metadata for SEO
```

**File 3.1.2 (NEW):** [src/components/navigation/header.tsx](src/components/navigation/header.tsx)
```
Should render:
- Logo / home link (left)
- Nav links (Browse Comics, Authors, etc.) (center)
- Search input (optional, can defer)
- User menu / auth buttons (sign-in/sign-up if logged out, profile/logout if logged in) (right)

Use shadcn: Button, NavigationMenu, DropdownMenu
```

**File 3.1.3 (NEW):** [src/components/navigation/footer.tsx](src/components/navigation/footer.tsx)
```
Should render:
- Copyright
- Links: About, Contact, Privacy, Terms
- Social links (optional)
Simple, minimal footer
```

**File 3.1.4 (NEW):** [src/app/(root)/layout.tsx](src/app/(root)/layout.tsx)
```
Wraps all (root) pages
Should:
- Include Header at top
- Render children
- Include Footer at bottom
Children get: full width, with header/footer bookends
```

**Validation:**
- Dev server running
- `http://localhost:3000` shows header with nav
- Nav links navigate correctly
- Footer appears at bottom

---

**[3.2] Create User Profile Pages** (1.5 hours)

**File 3.2.1 (NEW):** [src/app/(root)/profile/page.tsx](src/app/(root)/profile/page.tsx)
```
What it renders:
- Check: user must be logged in (redirect to /sign-in if not)
- Display: user avatar, name, email, join date
- Button: "Edit Profile"
- Show: reading stats (optional)

Use: useSession() hook
```

**File 3.2.2 (NEW):** [src/app/(root)/profile/edit/page.tsx](src/app/(root)/profile/edit/page.tsx)
```
What it renders:
- Form with fields: name, email, avatar (optional)
- On submit: call updateUserAction (server action)
- Redirect to /profile on success

Needs: useRouter, formAction, loading state
```

**File 3.2.3 (NEW):** [src/lib/actions/user.actions.ts](src/lib/actions/user.actions.ts)
```
Server actions:
- getUser(userId) → fetch from DB
- updateUser(userId, data) → update in DB
- deleteUser(userId) → soft delete (optional)

Validation: use Zod for input
```

**File 3.2.4 (NEW or MODIFY):** [src/database/queries/user.queries.ts](src/database/queries/user.queries.ts)
```
If exists: verify getUser(), getUserById exist
If not: create with basic queries
```

**File 3.2.5 (NEW or MODIFY):** [src/database/mutations/user.mutations.ts](src/database/mutations/user.mutations.ts)
```
If exists: verify updateUser(), deleteUser exist
If not: create mutations
```

**Validation:**
- Login → navigate to /profile → shows user data
- Click Edit → form pre-filled with current data
- Edit and save → data persists in DB

---

**[3.3] Create Home & Browse Pages** (1 hour)

**File 3.3.1 (NEW or MODIFY):** [src/app/(root)/page.tsx](src/app/(root)/page.tsx)
```
What it renders:
- Hero section: title, tagline, CTA button ("Browse Comics")
- Featured Comics section: query top-rated 6 comics, display as ComicList
- Latest Comics section: query 6 newest comics
- Categories section: show 5 featured genres with links

Use: async server component to fetch data
```

**File 3.3.2 (NEW):** [src/app/(root)/browse/page.tsx](src/app/(root)/browse/page.tsx)
```
What it renders:
- Title: "Browse All Comics"
- ComicFilters component (from Day 1)
- ComicList component (from Day 1) with filtered results
- Same as /comics page basically
```

**Validation:**
- `http://localhost:3000` loads with featured comics
- `/browse` shows all comics with filters
- Can navigate between list → detail → back

---

**⏱️ Checkpoint 5 (6:00 PM):** Core user experience working → Browse comics, view profile, edit profile, home page all functional

---

## DAY 3: Polish & Testing (6-8 hours)

### MORNING: Error Handling & Image Optimization (3 hours, 9:00 AM - 12:00 PM)

**[4.1] Add Error Boundaries** (1 hour)

**File 4.1.1 (NEW):** [src/app/error.tsx](src/app/error.tsx)
```
Global error boundary
- Catches errors from any (root) route
- Display: "Something went wrong" message
- Show: error details in dev, generic in prod
- Button: "Try again" (calls reset())
```

**File 4.1.2 (NEW):** [src/app/not-found.tsx](src/app/not-found.tsx)
```
Custom 404 page
- Display: "Page not found"
- Show: helpful message
- Link: back to home
```

**File 4.1.3 (NEW):** [src/app/(root)/error.tsx](src/app/(root)/error.tsx)
```
Route-specific error boundary for (root) pages
- Similar to global, but specific styling for root
```

**Validation:**
- Trigger error: navigate to `/comics/invalid-id` → should show not-found
- Backend error: intentionally throw in component → see error boundary

---

**[4.2] Add Loading Skeletons** (1.5 hours)

**File 4.2.1 (NEW):** [src/components/skeletons/comic-skeleton.tsx](src/components/skeletons/comic-skeleton.tsx)
```
Renders skeleton matching ComicCard layout
- Use Skeleton component from shadcn
- Width/height matching actual card
- Shows while data loading
```

**File 4.2.2 (NEW):** [src/components/skeletons/chapter-skeleton.tsx](src/components/skeletons/chapter-skeleton.tsx)
```
Skeleton for chapter list items
```

**File 4.2.3 (NEW):** [src/app/(root)/loading.tsx](src/app/(root)/loading.tsx)
```
Loading UI for route navigation
- If exists: enhance
- If not: create with skeleton grids
```

**File 4.2.4 (MODIFY):** [src/components/comics/comic-list.tsx](src/components/comics/comic-list.tsx) — **ALREADY CREATED**
```
Enhance: if isLoading prop true, show 6 comic skeletons instead of cards
```

**Validation:**
- Slow down API: add awaits in queries
- Navigate while loading → see skeletons briefly

---

**[4.3] Optimize Images** (30 min)

**Audit:**
- Search all .tsx files for `<img` tags
- Count: should find ~5-10 instances (cover images, avatars)

**Files to modify:**
- [src/components/comics/comic-card.tsx](src/components/comics/comic-card.tsx) — Use `<Image>` for cover
- [src/components/navigation/header.tsx](src/components/navigation/header.tsx) — Use `<Image>` for logo/avatar
- [src/app/(root)/page.tsx](src/app/(root)/page.tsx) — Use `<Image>` for featured comics

**For each image tag:**
```
FROM: <img src={url} alt={alt} />

TO: <Image
      src={url}
      alt={alt}
      width={300}
      height={400}
      priority={url in heroes list}
      loading={url in footer? "lazy" : "eager"}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
```

**Also update [next.config.ts](next.config.ts):**
```
images: {
  domains: ([...existing, add any external image hosts])
}
```

**Validation:**
- Images load with correct aspect ratio
- Lazy-loaded images (outside viewport) load on scroll
- Dev console: no image optimization warnings

---

**⏱️ Checkpoint 6 (12:00 PM):** Polish complete → Error pages work, skeletons show during load, images optimized

---

### AFTERNOON: Testing & Validation (3-4 hours, 12:00 PM - 4:00 PM)

**[5.1] Set Up Test Frameworks** (45 min)

**File 5.1.1 (NEW):** [vitest.config.ts](vitest.config.ts)
```
Configure Vitest for unit tests
- Root: src/
- Globals: true (for describe, it, expect)
- Environment: node
- Coverage: yes
```

**File 5.1.2 (NEW):** [playwright.config.ts](playwright.config.ts)
```
Configure Playwright for E2E tests
- webServer: localhost:3000
- baseURL: http://localhost:3000
- timeout: 30s
- browsers: chromium (at minimum)
```

**File 5.1.3 (NEW):** [tests/](tests/) directory
```
Create folder structure:
tests/
├── unit/
│   ├── utils.test.ts
│   └── validation.test.ts
├── integration/
│   └── api.test.ts
└── e2e/
    ├── auth.spec.ts
    ├── comic-browse.spec.ts
    └── user-profile.spec.ts
```

**File 5.1.4 (MODIFY):** [package.json](package.json)
```
Add scripts:
"test": "vitest",
"test:e2e": "playwright test",
"test:coverage": "vitest --coverage"
```

**Validation:**
- `pnpm test --run` → passes (even with empty tests)
- `pnpm test:e2e --ui` → opens Playwright UI

---

**[5.2] Write Critical Tests** (1.5 hours)

**File 5.2.1 (NEW):** [tests/unit/validation.test.ts](tests/unit/validation.test.ts)
```
Test Zod schemas:
- Test createComicSchema validates correctly
- Test invalid data is rejected
- Test edge cases (empty string, missing field, etc.)

5-10 test cases
```

**File 5.2.2 (NEW):** [tests/unit/utils.test.ts](tests/unit/utils.test.ts)
```
Test utility functions:
- Test slug generation (if you have it)
- Test data formatting
- Test validation helpers

5-10 test cases
```

**File 5.2.3 (NEW):** [tests/e2e/auth.spec.ts](tests/e2e/auth.spec.ts)
```
Test user authentication flow:
- Test sign-up flow
  - Fill form
  - Submit
  - Verify redirect to sign-in
- Test sign-in flow
  - Fill form with correct creds
  - Submit
  - Verify redirect to home
- Test sign-out
```

**File 5.2.4 (NEW):** [tests/e2e/comic-browse.spec.ts](tests/e2e/comic-browse.spec.ts)
```
Test comic browsing:
- Test: Load /comics page
  - Verify comics display
  - Verify filter controls exist
- Test: Click comic card
  - Navigate to detail
  - Verify comic info displays
- Test: Filter by genre
  - Select genre filter
  - Verify list updates (or verify API call)
```

**File 5.2.5 (NEW):** [tests/e2e/user-profile.spec.ts](tests/e2e/user-profile.spec.ts)
```
Test user profile:
- Test: Login → Navigate to /profile
  - Verify user data displays
- Test: Click Edit Profile
  - Modify a field
  - Save
  - Verify changes persisted
```

**Validation:**
- `pnpm test --run` → all unit tests pass
- `pnpm test:e2e --ui` → all E2E tests pass in Playwright UI
- `pnpm test:coverage` → shows coverage % (should be 50%+ for critical paths)

---

**[5.3] Final Build & Validation** (45 min)

**Checklist:**
1. **Type checking:** `pnpm type-check` → 0 errors
2. **Linting:** `pnpm lint` → 0 errors (fix with `pnpm lint:fix`)
3. **Build:** `pnpm build` → succeeds, no warnings
4. **All tests pass:**
   - `pnpm test --run` → all green
   - `pnpm test:e2e --ui` → all green

**If anything fails:**
- Fix immediately (expect to find 2-3 issues)
- Re-run full suite

**Validation:**
- Production build succeeds: `next start` runs without errors
- All tests passing
- No TypeScript errors
- No ESLint warnings

---

**⏱️ Checkpoint 7 (4:00 PM):** Testing complete, build validated → Ready for data seeding and final polish

---

## DAY 4: Database Seeding & Documentation (4-6 hours)

### MORNING: Database Seeding (2-3 hours, 9:00 AM - 12:00 PM)

**[6.1] Complete Seeding System**

Note: Assuming your seed structure exists. If not, create it.

**File 6.1.1:** [src/database/seed/seed-runner-v4enhanced.ts](src/database/seed/seed-runner-v4enhanced.ts)

If exists, verify it includes:
- Sequential execution order: User → Genre → Comic → Chapter → Author/Artist
- Dry-run mode (previews without writing)
- Verbose logging with emoji indicators
- Summary report (X users created, Y comics updated, etc.)
- Error handling and rollback

If not exists, create with above features.

**File 6.1.2:** Seeders in [src/database/seed/seeders/](src/database/seed/seeders/)

Verify each exists and works:
- `user-seeder.ts` — loads from [users.json](users.json)
- `comic-seeder.ts` — loads from [comics.json](comics.json)
- `chapter-seeder.ts` — loads from [chapters.json](chapters.json)
- `author-seeder.ts` — creates authors, associates with comics
- `artist-seeder.ts` — creates artists, associates with comics
- `genre-seeder.ts` — creates genres, associates with comics

**File 6.1.3 (MODIFY):** [package.json](package.json)
```
Verify scripts exist:
"db:seed": "tsx src/database/seed/seed-runner-v4enhanced.ts",
"db:seed:dry-run": "DRY_RUN=true tsx src/database/seed/seed-runner-v4enhanced.ts",
"db:seed:verbose": "VERBOSE=true tsx src/database/seed/seed-runner-v4enhanced.ts"
```

**File 6.1.4 (MODIFY):** [src/app/api/seed/route.ts](src/app/api/seed/route.ts)
```
If exists:
- Verify POST handler calls seed runner
- Verify it's admin-protected or environment-gated

If not:
- Create simple POST handler that:
  - Checks if seeding is enabled (env var)
  - Calls seed-runner
  - Returns summary
```

**Execution:**
1. **Dry-run first:** `pnpm db:seed:dry-run`
   - View preview of what would be created
   - Verify no errors
   - Check counts

2. **Full seed:** `pnpm db:seed`
   - Creates users, comics, chapters, genres, authors, artists
   - Database now has realistic test data

3. **Verify in DB:**
   - `SELECT COUNT(*) FROM user` → should show 10+ users
   - `SELECT COUNT(*) FROM comic` → should show 20+ comics
   - `SELECT COUNT(*) FROM chapter` → should show 50+ chapters

**Validation:**
- Seed completes without errors
- Database has realistic test data
- Can log in with seeded user account
- Comics display with seeded data

---

### AFTERNOON: Documentation (2-3 hours, 12:00 PM - 3:00/4:00 PM)

**File 6.2.1 (MODIFY):** [README.md](README.md)
```
Should include:
1. Project overview (2-3 sentences)
2. Tech stack (list: Next.js, React, TypeScript, Drizzle, Tailwind, etc.)
3. Features (bullet list of main features)
4. Quick start (steps to setup & run locally)
5. Database setup (PostgreSQL, migrations, seeding)
6. Development (how to run server, watch mode, etc.)
7. Project structure (brief explanation of src/ folders)
8. Contributing (if applicable)
```

**File 6.2.2 (NEW):** [ARCHITECTURE.md](ARCHITECTURE.md)
```
Should include:
1. System architecture overview (layers: API → DB)
2. Folder structure:
   - src/app → pages and routes
   - src/components → React components
   - src/database → schema, queries, mutations
   - src/lib → utilities, actions, validation
3. CRUD Pattern explanation:
   - How to add new entity:
     - Add schema in database/schema.ts
     - Create queries in database/queries/entity.queries.ts
     - Create mutations in database/mutations/entity.mutations.ts
     - Create API route in app/api/entities/route.ts
     - Create server actions in lib/actions/entity.actions.ts
     - Create pages in app/(root)/entities/page.tsx
  Example: "To add new entity X, follow Comic pattern in files A, B, C..."
4. Database schema (table overview)
5. Authentication flow (how NextAuth is set up)
```

**File 6.2.3 (NEW):** [API.md](API.md)
```
Document all endpoints:

## Comics
- GET /api/comics → list comics
- POST /api/comics → create (admin)
- GET /api/comics/[id] → single comic
- PUT /api/comics/[id] → update (admin)
- DELETE /api/comics/[id] → delete (admin)

## Authors
- GET /api/authors
- POST /api/authors (admin)
- GET /api/authors/[id]
- PUT /api/authors/[id] (admin)
- DELETE /api/authors/[id] (admin)

(repeat for Artists, Genres, Types, Chapters)

## Authentication
- POST /auth/signin
- POST /auth/signout
- POST /auth/signup
- GET /auth/session → current user

For each endpoint: show request/response example
```

**File 6.2.4 (NEW):** [.env.example](.env.example)
```
Template for environment variables

DATABASE_URL=postgresql://user:password@localhost:5432/comicwise
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

(add all env vars from src/lib/env.ts)
```

**File 6.2.5 (MODIFY, if needed):** [DEVELOPMENT.md](DEVELOPMENT.md) or add to README
```
For developers:

## Local Development
1. Clone repo
2. `pnpm install`
3. `cp .env.example .env.local` and fill in values
4. `pnpm db:push`
5. `pnpm db:seed`
6. `pnpm dev`
7. Open http://localhost:3000

## Available Scripts
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm test` — run unit tests
- `pnpm test:e2e` — run E2E tests
- `pnpm lint` — check code style
- `pnpm type-check` — check TypeScript
- `pnpm db:push` — apply migrations
- `pnpm db:seed` — seed test data

## Adding New Features
1. Define schema in database/schema.ts
2. Follow CRUD pattern (see ARCHITECTURE.md)
3. Test with unit + E2E tests
4. Update API documentation
```

**Validation:**
- All docs are readable and accurate
- Code examples are correct
- Instructions can be followed step-by-step

---

**⏱️ Checkpoint 8 (3:00/4:00 PM):** Documentation complete → Project is documented, maintainable, ready for handoff

---

## OPTIONAL (if time): Additional Polish

**If finishing early, prioritize in this order:**

1. **[Admin pages]** Create comic form page [src/app/(root)/comics/create/page.tsx](src/app/(root)/comics/create/page.tsx) (mirror of edit)

2. **[Bookmarks feature]** Add bookmark button to comic detail, bookmark page to show saved comics

3. **[Search]** Add search input to header, create `/search?q=X` page

4. **[Styling refinements]** Improve spacing, colors, transitions using Tailwind

5. **[Performance metrics]** Add analytics (optional)

---

## Final Checklist

Before declaring complete:

- ✅ Build passes: `pnpm build` succeeds
- ✅ All TypeScript errors fixed: `pnpm type-check`
- ✅ Linting passes: `pnpm lint`
- ✅ Unit tests pass: `pnpm test --run`
- ✅ E2E tests pass: `pnpm test:e2e --ui`
- ✅ Database seeded: `pnpm db:seed` successful
- ✅ Can log in with seeded account
- ✅ Can browse comics, view detail, edit profile
- ✅ Navigation works across all pages
- ✅ Error pages display on 404/errors
- ✅ Images load and lazy-load correctly
- ✅ Documentation is current and accurate
- ✅ `.env.example` created for new devs

---

## Summary Timeline

| Day | Phase | Hours | Key Deliverable |
|-----|-------|-------|---|
| **Day 1** | Blockers + Comic UI | 8-10 | Build fixed, DB initialized, comic browsing works |
| **Day 2** | CRUD patterns + Pages | 8-10 | Author/Artist/Chapter/Genre CRUD, user pages |
| **Day 3** | Polish + Testing | 6-8 | Error boundaries, skeletons, 10+ tests passing |
| **Day 4** | Seeding + Docs | 4-6 | Database seeded with test data, full documentation |
| **TOTAL** | **All phases** | **26-34 hours** | **Fully functional, tested, documented platform** |

---

## Next Steps

Ready to execute? Start with Day 1, Phase 0 (blockers). Fix the CSS build error first, then initialize the database. Each checkpoint marks a functional milestone. Track your progress against the timeline and adjust as needed.
