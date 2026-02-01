# ComicWise (comicr)

A modern web application for reading and managing comics online, built with Next.js 16, TypeScript, Drizzle ORM, and PostgreSQL.

## Features

### ✅ **Phase 1: Enhanced Chapter Reader** (Complete)

- **Advanced Image Viewer** with zoom (50%-200%), fit modes (width/height/page), smooth pan and drag
- **Keyboard Navigation** (Arrow keys, Space, Home/End, +/- for zoom, F for fullscreen, S for settings)
- **Touch Gestures** for mobile (swipe, pinch-to-zoom, double-tap)
- **Reading Progress Tracking** with auto-save (30s interval, on page change, before unload)
- **Fullscreen Mode** with auto-hiding controls
- **Customizable Reader Settings** (reading mode: vertical/horizontal, page gap, auto-play speed, image quality: low/medium/high)

### ✅ **Phase 2: Comics Discovery** (Complete)

- **Genre Grid** with visual discovery section and filtering
- **Advanced Filtering** by status, genres, types, authors, artists
- **Pagination** with page size controls (12/24/48 per page)
- **Genre Detail Pages** with SEO-friendly slugs

### ✅ **Phase 3: Profile Management** (Complete)

- **Change Password** with validation (8+ chars, uppercase, lowercase, number required)
- **Settings Page** with JSONB storage (email notifications, profile visibility, auto-save preferences)
- **Delete Account** with soft delete (preserves data structure, PII anonymization)

### ✅ **Phase 4: Rating & Comments** (Complete)

- **Star Rating System** (1-5 stars with half-star display)
  - Interactive rating component with optional review (max 1000 chars)
  - X button to remove ratings
  - Average rating display with total count
  - Update existing ratings (upsert pattern)
- **Threaded Comments** with infinite nesting
  - Parent-child relationship via `parentId`
  - Soft delete preserves thread structure when comments have replies
  - Collapse/expand threads with reply counts
  - Sort by newest/oldest
  - Reply forms with character counter (max 2000 chars)
  - Delete confirmation dialog with different messages for parent vs leaf comments

### ✅ **Phase 5: Testing & Documentation** (Complete)

- **Unit Tests** for Zod schemas (rating, comment, password validation)
- **E2E Tests** with Playwright (reader navigation, profile settings, ratings, comments)
- **Utility Tests** for comment tree building algorithm

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd comicr
pnpm install
```

2. **Set up environment variables:**
   Create `.env.local` from `.env.local.example` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (min 32 chars)
- OAuth credentials (Google, GitHub)
- Email configuration
- Optional: ImageKit, Cloudinary, Stripe, Sentry

3. **Initialize database:**

```bash
pnpm db:push    # Push schema to database
pnpm db:seed    # Seed with test data
pnpm db:studio  # Open Drizzle Studio GUI
```

4. **Run validation and start dev server:**

```bash
pnpm validate   # Type-check + lint + tests
pnpm dev        # Start dev server at http://localhost:3000
```

## Available Scripts

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `pnpm dev`        | Start development server        |
| `pnpm build`      | Production build                |
| `pnpm start`      | Start production server         |
| `pnpm type-check` | TypeScript type checking        |
| `pnpm lint`       | ESLint code linting             |
| `pnpm lint:fix`   | Auto-fix linting issues         |
| `pnpm test`       | Run unit tests with Vitest      |
| `pnpm test:e2e`   | Run E2E tests with Playwright   |
| `pnpm validate`   | Run type-check + lint + tests   |
| `pnpm db:push`    | Push schema changes to database |
| `pnpm db:seed`    | Seed database with test data    |
| `pnpm db:studio`  | Open Drizzle Studio             |

## Project Structure

```
comicr/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth route group (sign-in, sign-up)
│   │   ├── (root)/            # Main app routes (comics, genres, profile)
│   │   ├── admin/             # Admin pages
│   │   ├── api/               # API routes
│   │   └── dev/               # Development tools
│   ├── components/            # React components
│   │   ├── comics/           # Comic-related components
│   │   ├── auth/             # Authentication components
│   │   ├── bookmarks/        # Bookmark components
│   │   ├── navigation/       # Navigation components
│   │   ├── profile/          # Profile components
│   │   └── ui/               # shadcn/ui components
│   ├── database/              # Database layer
│   │   ├── mutations/        # Write operations
│   │   ├── queries/          # Read operations
│   │   └── schema.ts         # Drizzle schema
│   ├── lib/
│   │   └── actions/          # Server actions
│   ├── schemas/               # Zod validation schemas
│   ├── types/                 # TypeScript types
│   └── hooks/                 # Custom React hooks
├── tests/
│   ├── unit/                  # Unit tests (Vitest)
│   └── e2e/                   # E2E tests (Playwright)
├── scripts/                   # Automation scripts
└── docs/                      # Documentation

```

## Architecture

ComicWise follows a **3-layer architecture pattern**:

1. **Schema Layer** (`src/schemas/`) - Zod validation schemas for input validation
2. **Database Layer** (`src/database/`) - Drizzle ORM queries and mutations
3. **Action Layer** (`src/lib/actions/`) - Server actions with `"use server"` directive

### Data Flow Pattern

```
Component → Server Action → Mutation/Query → Drizzle → PostgreSQL
```

### Key Design Decisions

**Hybrid Sync Strategy:**

- Zoom level stored in localStorage (instant response, device-specific)
- Reader settings in database (cross-device sync, persistent preferences)

**Soft Delete with PII Anonymization:**

- User deletion: Sets `deletedAt` timestamp, anonymizes PII, preserves structure
- Comment deletion: Sets `deletedAt` for comments with children, shows "[deleted]" placeholder

**Comment Threading:**

- Self-referencing `parentId` allows infinite nesting
- `buildCommentTree` utility converts flat list to nested structure
- Two-pass algorithm: Create Map, then build parent-child relationships

**Rating Updates:**

- Upsert pattern: `onConflictDoUpdate` on composite key `[userId, comicId]`
- Special handling: `rating=0` triggers deletion instead of upsert

## Testing

### Unit Tests

```bash
pnpm test                    # Run all unit tests
pnpm test rating.schema      # Run specific test file
```

Tests cover:

- Zod schema validation (rating, comment, password)
- Utility functions (buildCommentTree)
- Target coverage: 80%+

### E2E Tests

```bash
pnpm test:e2e               # Run all E2E tests
pnpm test:e2e reader        # Run reader tests only
```

Test suites:

- Chapter reader (navigation, zoom, fullscreen, settings)
- Profile (settings, password change, delete account)
- Rating & Comments (post, reply, delete, threading)

## Environment Variables

Required variables (see `.env.local.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `EMAIL_FROM` - Sender email for transactional emails
- `NEXT_PUBLIC_API_URL` - Public API base URL
- `CUSTOM_PASSWORD` - Default password for seeded users

Optional services:

- ImageKit: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Sentry: `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- Redis: `REDIS_URL`

## Database Schema Changes

Recent migrations require the following schema updates:

- `readerSettings` table for user reading preferences
- `comment.parentId` nullable integer for threading
- `comment.deletedAt` timestamp for soft delete
- `user.settings` JSONB field for preferences
- `user.deletedAt` timestamp for soft delete
- `rating` integer type (1-5 scale)
- `readingProgress.currentImageIndex`, `scrollPercentage`, `progressPercent` fields

Run `pnpm db:push` to apply schema changes.

## API Documentation

See [docs/api-reference.md](docs/api-reference.md) for detailed API documentation.

### New Endpoints

**Rating:**

- `POST /api/comics/rate` - Upsert rating (rating=0 triggers deletion)

**Comments:**

- `POST /api/comments` - Create comment/reply (parentId optional)
- `GET /api/comments?chapterId={id}` - Get threaded comments
- `DELETE /api/comments/{id}` - Soft delete comment (ownership check)

**Profile:**

- `PUT /api/profile/settings` - Update user settings (JSONB)
- `POST /api/profile/delete-account` - Soft delete account

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run validation before committing (`pnpm validate`)
4. Commit with conventional commits format
5. Push and create a Pull Request

## License

[Add your license here]

---

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
