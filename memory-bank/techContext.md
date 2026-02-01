# Tech Context

## Technology Stack

### Core Framework

| Technology | Version | Purpose                                    |
| ---------- | ------- | ------------------------------------------ |
| Next.js    | 16.1.5  | Full-stack React framework with App Router |
| React      | 19.2.3  | UI library with Server Components          |
| TypeScript | 5.x     | Type safety                                |
| Node.js    | 20+     | Runtime                                    |

### Database & ORM

| Technology  | Version | Purpose                    |
| ----------- | ------- | -------------------------- |
| PostgreSQL  | 15+     | Primary database           |
| Drizzle ORM | 0.45.1  | Type-safe database queries |
| Drizzle Kit | 0.31.8  | Schema migrations          |

### Authentication

| Technology            | Version       | Purpose                       |
| --------------------- | ------------- | ----------------------------- |
| NextAuth.js           | 5.0.0-beta.30 | Authentication framework      |
| @auth/drizzle-adapter | 1.11.1        | Database adapter for NextAuth |

### UI & Styling

| Technology       | Purpose               |
| ---------------- | --------------------- |
| Tailwind CSS 4.x | Utility-first CSS     |
| shadcn/ui        | Component library     |
| Radix UI         | Accessible primitives |
| Lucide React     | Icons                 |

### State Management

| Technology      | Version | Purpose           |
| --------------- | ------- | ----------------- |
| Zustand         | 5.0.10  | Client-side state |
| React Hook Form | 7.71.1  | Form state        |
| Zod             | 4.3.6   | Schema validation |

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ (or Neon for serverless)

### Local Development

```bash
pnpm install          # Install dependencies
pnpm db:push          # Push database schema
pnpm db:seed          # Seed development data
pnpm dev              # Start development server
```

### Environment Variables

Required:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (min 32 chars)
- `GOOGLE_CLIENT_ID/SECRET` — Google OAuth
- `GITHUB_CLIENT_ID/SECRET` — GitHub OAuth
- `NEXT_PUBLIC_API_URL` — Public API URL
- `CUSTOM_PASSWORD` — Default password for seeded users

Optional: `IMAGEKIT_*`, `CLOUDINARY_*`, `STRIPE_*`, `SENTRY_DSN`, `REDIS_*`

## Technical Constraints

### Next.js 16 Specifics

- Turbopack for development builds
- React Compiler enabled (experimental)
- App Router only (no Pages Router)
- Server Actions for mutations

### Database

- PostgreSQL-specific features (enums, full-text search)
- No raw SQL queries (Drizzle ORM only)
- Migrations via `drizzle-kit push`

### Authentication

- OAuth providers require HTTPS in production
- Credentials provider for email/password
- Session strategy: JWT (not database sessions)
