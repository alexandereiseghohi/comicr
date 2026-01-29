# ComicWise: Comprehensive Setup & Implementation Guide

## A. PREREQUISITES & CONTEXT

### Project Overview

**ComicWise** is a full-stack comic reading platform with modern tech stack and production-ready architecture.

**Tech Stack**:
- Next.js 16 (App Router with Turbopack)
- React 19, TypeScript 5.9+ (strict)
- PostgreSQL + Drizzle ORM 0.44+
- Redis (Upstash/local) for caching
- NextAuth.js v5 (OAuth: Google, GitHub)
- Tailwind CSS 4.1 + shadcn/ui
- Zustand 5.0+ (state management)
- React Hook Form + Zod (forms & validation)
- Sentry (error tracking)
- Docker + docker-compose

**Project Status**: ✅ 100% Complete
- 10/10 tickets completed
- 19 database tables
- 40+ server actions
- 50+ API routes
- 150+ pnpm scripts
- 95+ production dependencies
- 95+ dev dependencies

### Architecture Overview

```
ComicWise (Monorepo with pnpm workspaces)
├── .github/
│   ├── workflows/           # CI/CD pipelines (GitHub Actions)
│   ├── prompts/             # Copilot prompt library (THIS PROJECT)
│   └── instructions/        # Copilot custom instructions
├── .vscode/                 # VS Code config (5 files)
├── src/
│   ├── app/                 # Next.js App Router (pages, routes, layouts)
│   ├── components/          # React components (shadcn/ui + custom)
│   ├── database/            # Drizzle schema, migrations, seeds
│   ├── dal/                 # Data Access Layer (generic CRUD)
│   ├── lib/                 # Utilities (auth, cache, email, actions)
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # Global styles
│   ├── middleware.ts        # Next.js middleware
│   └── appConfig.ts         # App configuration & env export
├── public/                  # Static assets
├── scripts/                 # Automation scripts
├── compose/                 # Docker build automation
├── docs/                    # Documentation
├── test-results/            # Test reports
├── playwright-report/       # E2E test reports
└── package.json             # 150+ scripts, 190 dependencies
```

### Database Schema (19 Tables)

**Authentication (NextAuth)**:
- `user` - User accounts
- `account` - OAuth/external auth accounts
- `session` - Active sessions
- `verificationToken` - Email verification tokens

**Content**:
- `comic` - Comic series/books
- `chapter` - Individual chapters with content
- `comment` - User comments on content

**Relations**:
- `author` - Comic authors
- `artist` - Comic artists
- `genre` - Story genres/categories
- `type` - Content types
- `bookmark` - User bookmarks/favorites

**Analytics & Workflow** (custom):
- Additional workflow/event tracking tables

### Environment Variables Required (60+)

**Database**:
```bash
DATABASE_URL=postgresql://user:pass@host/dbname
NEON_DATABASE_URL=postgresql://...  # Backup provider
```

**Authentication**:
```bash
AUTH_SECRET=<generated-secret>
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**Redis**:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

**Image Services**:
```bash
IMAGEKIT_PUBLIC_KEY=...           # For image optimization
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
CLOUDINARY_CLOUD_NAME=...         # Backup provider
```

**Email & Communication**:
```bash
RESEND_API_KEY=...                # Email service
EMAIL_FROM=noreply@comicwise.com
NODEMAILER_HOST=...               # Backup SMTP
NODEMAILER_PORT=...
NODEMAILER_USER=...
NODEMAILER_PASS=...
```

**Monitoring & Analytics**:
```bash
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
SENTRY_ENVIRONMENT=development|staging|production
```

**Seeding & Development**:
```bash
CUSTOM_PASSWORD=...               # Seed user password
NODE_ENV=development|production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## B. CONFIGURATION MATRIX

### TypeScript Configuration (`tsconfig.json`)

**Key Settings**:
```typescript
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noImplicitAny": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/components/*": ["./src/components/*"],
      "@/database/*": ["./src/database/*"],
      "@/dal/*": ["./src/dal/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["src/**/*", "next-env.d.ts"],
  "exclude": ["node_modules", "dist", ".next"]
}
```

### Next.js Configuration (`next.config.ts`)

**Key Optimizations**:
```typescript
// Turbopack caching
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.imagekit.io' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
  },
  redirects: async () => [...],
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};
```

### ESLint Configuration (`eslint.config.mjs`)

**Rules**: TypeScript strict, Next.js best practices, React hooks

### Drizzle Configuration (`drizzle.config.ts`)

**Database Connection**:
```typescript
export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### VS Code Configuration (`.vscode/`)

**5 Config Files**:
1. `settings.json` - Editor defaults, formatting, extensions
2. `launch.json` - Debug configurations for Next.js & Node
3. `tasks.json` - Development tasks (build, dev, test)
4. `extensions.json` - Recommended extensions (80+)
5. `mcp.json` - Model Context Protocol servers

---

## C. CORE PATTERNS & TEMPLATES

### Pattern 1: Server Component (Data Fetching)

**Purpose**: Next.js 16 server component for fetching and displaying data

**Template**:
```typescript
// src/app/(root)/comics/page.tsx
import { Suspense } from 'react';
import { ComicCard } from '@/components/comics/comic-card';
import { comicQueries } from '@/database/queries';
import type { SearchParams } from '@/types';

/**
 * Comics List Page - Server Component
 * @description Fetches and displays paginated comic list
 * @param {SearchParams} searchParams - Query parameters (page, sort, filter)
 * @returns {Promise<JSX.Element>} Rendered page
 */
export default async function ComicsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<JSX.Element> {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 20;

  // Fetch with error boundary
  const comics = await comicQueries.getComicsPaginated({
    page,
    limit,
    sort: params.sort || 'createdAt',
    filter: params.filter,
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Comics</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comics.data.map((comic) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Comics | ComicWise',
  description: 'Browse comic series',
};
```

**Key Principles**:
- Fetch data directly in server component
- Use `Suspense` for streaming UI
- Type safe with `SearchParams`
- Revalidate with `revalidatePath()` when data changes

---

### Pattern 2: Form Component with Validation

**Purpose**: Client-side form with React Hook Form, Zod validation, and server action

**Template**:
```typescript
// src/components/comics/comic-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { comicSchema, type Comic } from '@/lib/schemas/comic-schema';
import { createComicAction } from '@/lib/actions/comics';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ComicFormProps {
  initialData?: Partial<Comic>;
  onSuccess?: () => void;
}

/**
 * Comic Form Component
 * @description Form for creating/editing comics with Zod validation
 * @param {ComicFormProps} props - Form configuration
 * @returns {JSX.Element} Form component
 */
export function ComicForm({ initialData, onSuccess }: ComicFormProps): JSX.Element {
  const form = useForm({
    resolver: zodResolver(comicSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      coverImage: '',
      status: 'Ongoing',
    },
  });

  /**
   * Handle form submission
   * @param {Comic} data - Validated form data
   */
  async function onSubmit(data: Comic): Promise<void> {
    try {
      const result = await createComicAction(data);

      if (!result.success) {
        toast.error(result.error || 'Failed to save comic');
        return;
      }

      toast.success('Comic saved successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Comic title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Comic description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Comic'}
        </Button>
      </form>
    </Form>
  );
}
```

**Key Principles**:
- Use `useForm` hook from React Hook Form
- Resolve validation with Zod schema
- Call server action on submit
- Handle loading & error states
- Use shadcn form components

---

### Pattern 3: Zod Validation Schema

**Purpose**: Type-safe data validation with Zod

**Template**:
```typescript
// src/lib/schemas/comic-schema.ts
import { z } from 'zod';

/**
 * Comic validation schema
 * @description Zod schema for comic data validation
 */
export const comicSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(1, 'Title required')
    .max(255, 'Title too long'),
  description: z
    .string()
    .min(10, 'Description at least 10 characters')
    .max(2000, 'Description too long'),
  coverImage: z
    .string()
    .url('Must be valid URL')
    .refine(
      (url) => url.startsWith('https://'),
      'Must use HTTPS'
    ),
  status: z.enum(['Ongoing', 'Completed', 'OnHold']),
  authorId: z.string().uuid(),
  artistId: z.string().uuid(),
  genres: z.array(z.string().uuid()).min(1, 'Select at least one genre'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Type inference from schema
 */
export type Comic = z.infer<typeof comicSchema>;

/**
 * Input type (excludes id/timestamps)
 */
export type CreateComicInput = z.infer<
  typeof comicSchema.omit({ id: true, createdAt: true, updatedAt: true })
>;

/**
 * Update type (all fields optional)
 */
export type UpdateComicInput = CreateComicInput.partial();
```

**Key Principles**:
- Define all validation rules
- Use `.refine()` for custom validation
- Export both schema and inferred types
- Support Partial types for updates

---

### Pattern 4: Server Action

**Purpose**: NextAuth-protected async function for mutations

**Template**:
```typescript
// src/lib/actions/comics.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { comicSchema, type CreateComicInput } from '@/lib/schemas/comic-schema';
import { comicMutations } from '@/database/mutations';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create Comic Server Action
 * @description Creates a new comic (requires authentication)
 * @param {CreateComicInput} input - Comic data
 * @returns {Promise<ActionResult>} Operation result
 * @throws {Error} If not authenticated or validation fails
 */
export async function createComicAction(
  input: CreateComicInput
): Promise<ActionResult<{ id: string }>> {
  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Validation
  const validation = comicSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Validation failed',
    };
  }

  try {
    const comic = await comicMutations.createComic(validation.data);

    // Revalidate home page and comics listing
    revalidatePath('/');
    revalidatePath('/comics');

    return {
      success: true,
      data: { id: comic.id },
    };
  } catch (error) {
    console.error('Create comic error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update Comic Server Action
 * @param {string} id - Comic ID
 * @param {Partial<CreateComicInput>} input - Updated fields
 * @returns {Promise<ActionResult>} Operation result
 */
export async function updateComicAction(
  id: string,
  input: Partial<CreateComicInput>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await comicMutations.updateComic(id, input);
    revalidatePath(`/comics/${id}`);
    revalidatePath('/comics');

    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete Comic Server Action
 * @param {string} id - Comic ID
 * @returns {Promise<ActionResult>} Operation result
 */
export async function deleteComicAction(
  id: string
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await comicMutations.deleteComic(id);
    revalidatePath('/comics');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Key Principles**:
- Use `'use server'` directive
- Check authentication first
- Validate input with Zod
- Use `revalidatePath()` to update cache
- Return typed result objects
- Handle errors gracefully

---

### Pattern 5: Data Access Layer (DAL)

**Purpose**: Generic CRUD operations with database abstraction

**Template**:
```typescript
// src/dal/base-dal.ts
import { eq, asc, desc } from 'drizzle-orm';
import { db } from '@/database/db';
import type { Table, InferSelectModel } from 'drizzle-orm';

/**
 * Generic Data Access Layer
 * @description Base class for CRUD operations
 * @template T - Table type
 */
export abstract class BaseDAL<T extends Table> {
  protected table: T;

  constructor(table: T) {
    this.table = table;
  }

  /**
   * Get all records
   * @param {object} options - Query options
   * @returns {Promise<T[]>} Records
   */
  async getAll(options?: { limit?: number; offset?: number }) {
    return db
      .select()
      .from(this.table)
      .limit(options?.limit || 100)
      .offset(options?.offset || 0);
  }

  /**
   * Get record by ID
   * @param {string} id - Record ID
   * @returns {Promise<T | null>} Record or null
   */
  async getById(id: string) {
    const [record] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return record || null;
  }

  /**
   * Create record
   * @param {Partial<T>} data - Record data
   * @returns {Promise<T>} Created record
   */
  abstract create(data: any): Promise<any>;

  /**
   * Update record
   * @param {string} id - Record ID
   * @param {Partial<T>} data - Updated fields
   * @returns {Promise<T>} Updated record
   */
  abstract update(id: string, data: any): Promise<any>;

  /**
   * Delete record
   * @param {string} id - Record ID
   * @returns {Promise<boolean>} Success
   */
  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(this.table)
      .where(eq(this.table.id, id));
    return result.rowCount > 0;
  }

  /**
   * Paginated query
   * @param {object} options - Pagination options
   * @returns {Promise<{data: T[], total: number}>} Paginated results
   */
  async paginate(options: {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const offset = (options.page - 1) * options.limit;
    const data = await db
      .select()
      .from(this.table)
      .limit(options.limit)
      .offset(offset);

    return { data, total: data.length };
  }
}
```

### Pattern 5b: Concrete DAL Implementation

```typescript
// src/dal/comic-dal.ts
import { eq } from 'drizzle-orm';
import { db } from '@/database/db';
import { comic } from '@/database/schema';
import { BaseDAL } from './base-dal';
import type { CreateComicInput, UpdateComicInput } from '@/lib/schemas/comic-schema';

/**
 * Comic Data Access Layer
 * @description Handles all comic database operations
 */
export class ComicDAL extends BaseDAL<typeof comic> {
  constructor() {
    super(comic);
  }

  /**
   * Create comic
   * @param {CreateComicInput} data - Comic data
   * @returns {Promise<Comic>} Created comic
   */
  async create(data: CreateComicInput) {
    const [newComic] = await db.insert(comic).values(data).returning();
    return newComic;
  }

  /**
   * Update comic
   * @param {string} id - Comic ID
   * @param {UpdateComicInput} data - Updated fields
   * @returns {Promise<Comic>} Updated comic
   */
  async update(id: string, data: UpdateComicInput) {
    const [updated] = await db
      .update(comic)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(comic.id, id))
      .returning();
    return updated;
  }

  /**
   * Get comic with relations
   * @param {string} id - Comic ID
   * @returns {Promise<ComicWithRelations | null>} Comic with author, artist, genres
   */
  async getWithRelations(id: string) {
    const [result] = await db
      .select({
        comic: comic,
        author: author,
        artist: artist,
      })
      .from(comic)
      .leftJoin(author, eq(comic.authorId, author.id))
      .leftJoin(artist, eq(comic.artistId, artist.id))
      .where(eq(comic.id, id));

    return result || null;
  }
}

// Singleton instance
export const comicDAL = new ComicDAL();
```

**Key Principles**:
- Extend `BaseDAL` for generic CRUD
- Use Drizzle ORM for type safety
- Support pagination, sorting, filtering
- Handle relations with joins
- Return typed results

---

### Pattern 6: Email Component (React Email)

**Purpose**: Type-safe email templates with React

**Template**:
```typescript
// src/components/emails/email-verification.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
}

/**
 * Email Verification Template
 * @description Email template for account verification
 * @param {EmailVerificationProps} props - Email data
 * @returns {JSX.Element} Email component
 */
export default function EmailVerification({
  userName,
  verificationUrl,
}: EmailVerificationProps): JSX.Element {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Verify Your Email</Text>
            <Text style={paragraph}>
              Hi {userName},
            </Text>
            <Text style={paragraph}>
              Please verify your email address by clicking the button below.
            </Text>

            <Button
              href={verificationUrl}
              style={button}
            >
              Verify Email
            </Button>

            <Text style={footer}>
              If you didn't create this account, you can ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { fontFamily: '"Segoe UI",sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px' };
const box = { border: '1px solid #ddd', borderRadius: '5px', padding: '40px' };
const heading = { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' };
const paragraph = { color: '#555', marginBottom: '16px', lineHeight: '1.5' };
const button = {
  backgroundColor: '#000',
  color: '#fff',
  padding: '12px 20px',
  borderRadius: '4px',
  textDecoration: 'none',
  display: 'inline-block',
};
const footer = { color: '#999', fontSize: '12px', marginTop: '20px' };
```

---

### Pattern 7: shadcn/ui Component Integration

**Purpose**: Using shadcn/ui components with Tailwind

**Template**:
```typescript
// src/components/ui/comic-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Comic } from '@/database/schema';

interface ComicCardProps {
  comic: Comic;
  onBookmark?: (id: string) => void;
}

/**
 * Comic Card Component
 * @description Displays comic information in card format
 * @param {ComicCardProps} props - Card properties
 * @returns {JSX.Element} Card component
 */
export function ComicCard({ comic, onBookmark }: ComicCardProps): JSX.Element {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/comics/${comic.id}`}>
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-slate-200">
          <Image
            src={comic.coverImage}
            alt={comic.title}
            fill
            className="object-cover"
            priority={false}
          />
        </div>
      </Link>

      <CardHeader className="p-4">
        <Link href={`/comics/${comic.id}`}>
          <CardTitle className="line-clamp-2 hover:text-blue-600">
            {comic.title}
          </CardTitle>
        </Link>

        <CardDescription className="text-sm">
          {comic.status}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{comic.authorId}</Badge>
          <Badge variant="secondary">{comic.artistId}</Badge>
        </div>

        <Button
          onClick={() => onBookmark?.(comic.id)}
          variant="outline"
          className="w-full"
        >
          Bookmark
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Key Principles**:
- Import from `@/components/ui`
- Combine with Tailwind classes
- Support composition and extensibility
- Keep props type-safe
- Include JSDoc for props

---

## D. IMPLEMENTATION PHASES

### Phase 1: Type Definitions & Package Setup

**Objective**: Ensure all TypeScript types and external packages are configured

**Tasks**:

1. **Verify Type Definitions** (`src/types/declarations/`)
   - ✅ nodemailer.d.ts - Nodemailer type stubs
   - ✅ imagekit.d.ts - ImageKit SDK types
   - ✅ cloudinary.d.ts - Cloudinary SDK types
   - ✅ upstash.d.ts - Upstash Redis types
   - ✅ react-email.d.ts - React Email component types
   - ✅ zxcvbn.d.ts - Password strength checker types

2. **Custom Validation Type**
   - Create `src/types/validation.ts` with Zod-based custom validators
   - Export `phoneValidator`, `urlValidator`, `emailValidator`, `passwordValidator`

3. **Process.env Type Safety** (`src/lib/env.ts`)
   - Define all 60+ environment variables
   - Use Zod for runtime validation
   - Export typed `env` object for use throughout app

4. **Type Checking**
   - Run `pnpm type-check`
   - Fix all TypeScript errors
   - Enable strict mode

---

### Phase 2: Authentication Pages & Components

**Objective**: Implement NextAuth.js v5 with OAuth providers

**Tasks**:

1. **Auth Configuration** (`src/lib/auth-config.ts`)
   - Configure Google & GitHub OAuth providers
   - Set up email provider (Resend/Nodemailer)
   - Configure JWT callbacks
   - Configure session strategy

2. **Auth Routes** (`src/app/api/auth/[...nextauth]/route.ts`)
   - Initialize NextAuth with providers
   - Configure session callbacks
   - Set authorized paths

3. **Auth Pages** (`src/app/(auth)/`)
   - `sign-in/page.tsx` - Login form
   - `sign-up/page.tsx` - Registration form
   - `forgot-password/page.tsx` - Password reset request
   - `reset-password/[token]/page.tsx` - Password reset form
   - `verify-request/page.tsx` - Verification email sent

4. **Auth Components** (`src/components/auth/`)
   - `sign-in-form.tsx` - Login form with validation
   - `sign-up-form.tsx` - Registration form with validation
   - `forgot-password-form.tsx` - Password reset request
   - `reset-password-form.tsx` - Password reset

5. **Email Templates** (`src/components/emails/`)
   - `verification-email.tsx` - Email verification
   - `password-reset-email.tsx` - Password reset link
   - `welcome-email.tsx` - Welcome after signup

---

### Phase 3: CRUD Operations for All Schema Tables

**Objective**: Implement database queries, mutations, and server actions for 19 tables

**Database Tables to Implement**:
1. Comic, Chapter, Comment
2. Author, Artist, Genre, Type
3. Bookmark
4. User, Account, Session, VerificationToken

**For Each Table**:

a. **Queries** (`src/database/queries/[table]-queries.ts`)
   - `getAll()` - Get all records with pagination
   - `getById(id)` - Get by ID
   - `getBySlug(slug)` - Get by slug if applicable
   - `search(query)` - Full-text search
   - `getWithRelations(id)` - Get with related data

b. **Mutations** (`src/database/mutations/[table]-mutations.ts`)
   - `create(data)` - Create record
   - `update(id, data)` - Update record
   - `delete(id)` - Delete record
   - `bulkCreate(data)` - Batch insert
   - `bulkDelete(ids)` - Batch delete

c. **DAL** (`src/dal/[table]-dal.ts`)
   - Extend `BaseDAL`
   - Implement CRUD with Drizzle
   - Add caching layer if needed
   - Handle relations/joins

d. **Zod Schemas** (`src/lib/schemas/[table]-schema.ts`)
   - Define `.create`, `.update` schemas
   - Export inferred types
   - Include validation rules & error messages

e. **Server Actions** (`src/lib/actions/[table].ts`)
   - `create[Table]Action(input)`
   - `update[Table]Action(id, input)`
   - `delete[Table]Action(id)`
   - Include auth checks & validation

f. **API Routes** (`src/app/api/[table]/`)
   - `GET /api/[table]` - List with pagination
   - `GET /api/[table]/[id]` - Get by ID
   - `POST /api/[table]` - Create
   - `PATCH /api/[table]/[id]` - Update
   - `DELETE /api/[table]/[id]` - Delete

g. **Pages** (`src/app/(root)/[table]/`)
   - `page.tsx` - List view with pagination
   - `[id]/page.tsx` - Detail view
   - `[id]/edit/page.tsx` - Edit page
   - `new/page.tsx` - Create page

h. **Components** (`src/components/[table]/`)
   - `[table]-card.tsx` - Card display component
   - `[table]-form.tsx` - Create/edit form
   - `[table]-table.tsx` - Data table (if applicable)
   - `[table]-filters.tsx` - Filter/search controls

---

### Phase 4: Dynamic Seeding System

**Objective**: Load data from JSON files and seed database dynamically

**Implementation**:

1. **Seed Data Files** (`/[table]data.json` or `/json/`)
   - `comedians1.json`, `comedians2.json` (split large files)
   - `chaptersdata1.json`, `chaptersdata2.json`
   - Data in array format: `[{ id, field1, field2, ... }, ...]`

2. **Generic Seed Helper** (`src/database/seed/seedHelpers.ts`)
   ```typescript
   /**
    * Load and validate JSON data
    * @param filePath - Path to JSON file
    * @param schema - Zod schema for validation
    * @returns Parsed and validated data
    */
   export async function loadAndValidateJSON<T>(
     filePath: string,
     schema: z.ZodSchema
   ): Promise<T[]> {
     const data = await fs.readFile(filePath, 'utf-8');
     const parsed = JSON.parse(data);
     return z.array(schema).parse(parsed);
   }

   /**
    * Batch insert data with error handling
    * @param table - Drizzle table
    * @param data - Records to insert
    * @param batchSize - Insert batch size
    */
   export async function batchInsert<T>(
     table: any,
     data: T[],
     batchSize = 100
   ): Promise<number> {
     let inserted = 0;
     for (let i = 0; i < data.length; i += batchSize) {
       const batch = data.slice(i, i + batchSize);
       await db.insert(table).values(batch);
       inserted += batch.length;
     }
     return inserted;
   }
   ```

3. **Seed Script** (`src/database/seed/seed.ts`)
   - Load all JSON files
   - Validate against schemas
   - Insert in dependency order
   - Report results

4. **Seed Runner** (`src/app/seed/route.ts`)
   - GET route to trigger seeding
   - Protected with secret token
   - Returns status and counts

---

### Phase 5: HTML to React Conversion

**Objective**: Convert static HTML files to functional React components

**Process**:

1. **Identify HTML Files** (`./html/`)
   - List all `.html` files needing conversion

2. **For Each HTML File**:
   a. Create React component (`.tsx`)
   b. Convert HTML to JSX:
      - `class` → `className`
      - `onclick` → `onClick` with handler
      - Inline styles → Tailwind classes
      - Remove script tags (use React hooks instead)
   c. Extract data as props
   d. Integrate with queries/actions
   e. Move to appropriate `src/components/` or `src/app/` directory

3. **Component Pattern**:
   ```typescript
   // Example: Convert index.html → src/app/(root)/page.tsx
   interface PageProps {
     params: Promise<{ slug?: string }>;
     searchParams: Promise<SearchParams>;
   }

   export default async function Page({ params, searchParams }: PageProps) {
     // Fetch data
     // Return JSX (converted from HTML)
   }

   export const metadata = { title: '', description: '' };
   ```

4. **Move Static Assets**:
   - Copy images to `public/images/`
   - Copy styles to `src/styles/`
   - Update asset paths

---

### Phase 6: Configuration Optimization

**Objective**: Optimize all configuration files for production

**Files to Review**:

1. `tsconfig.json` - Enable strict mode, configure paths
2. `next.config.ts` - Turbopack, images, redirects
3. `eslint.config.mjs` - TypeScript rules, Next.js rules
4. `prettier.config.ts` - Formatting consistency
5. `tailwind.config.ts` - Custom colors, fonts
6. `postcss.config.mjs` - CSS processing
7. `drizzle.config.ts` - Database connection
8. `.env.example` - Document all env vars
9. `docker-compose.yml` - Services, volumes, networks
10. `Dockerfile` - Multi-stage build, optimizations

---

### Phase 7: Documentation & Quality Gates

**Objective**: Ensure code quality and complete documentation

**Tasks**:

1. **Code Quality**
   - Run `pnpm lint` - Fix all linting issues
   - Run `pnpm type-check` - Fix all TypeScript errors
   - Run `pnpm test` - Pass all unit tests
   - Run `pnpm test:e2e` - Pass all E2E tests

2. **Documentation**
   - Update `README.md` with setup, features, architecture
   - Document API endpoints
   - Document environment variables
   - Document database schema
   - Add JSDoc comments to all functions/components

3. **Git & CI/CD**
   - Commit messages follow conventional commits
   - GitHub Actions workflows pass
   - Code review checklist completed

---

## E. QUALITY GATES & VALIDATION

### Type Checking

```bash
pnpm type-check
```

**Expected**: No TypeScript errors

### Linting

```bash
pnpm lint
```

**Expected**: No ESLint errors (warnings allowed)

### Testing

```bash
pnpm test              # Unit tests
pnpm test:e2e        # E2E tests (Playwright)
pnpm test:coverage   # Coverage report
```

**Expected**: >80% coverage, all tests passing

### Build

```bash
pnpm build
```

**Expected**: Successful Next.js build with no errors

---

## F. GIT WORKFLOW & CONVENTIONS

### Branch Naming

```
feature/[feature-name]       # New feature
fix/[fix-name]              # Bug fix
refactor/[refactor-name]    # Code refactoring
docs/[doc-name]             # Documentation
cleanup/[cleanup-name]      # Cleanup/optimization
```

### Commit Messages (Conventional Commits)

```
feat: add user authentication with NextAuth
fix: resolve comic search filtering issue
refactor: simplify database queries
docs: update README with setup instructions
chore: update dependencies
test: add unit tests for comic DAL
```

### Pull Request Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build successful (`pnpm build`)
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Related issue closed (if applicable)

---

## G. DEVELOPMENT COMMANDS

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Push database schema
pnpm db:push

# Seed database
pnpm db:seed
```

### Development

```bash
# Start dev server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Format code
pnpm format
```

### Database

```bash
# Generate migrations
pnpm db:generate

# Push schema changes
pnpm db:push

# Seed database
pnpm db:seed

# Reset database
pnpm db:reset

# Studio UI
pnpm db:studio
```

### Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Production

```bash
# Build
pnpm build

# Start production server
pnpm start

# Docker build
docker build -t comicwise .

# Docker compose
docker-compose up -d
```

---

## QUICK REFERENCE: FILES TO CREATE/MODIFY

**Phase 1**:
- ✅ `src/types/declarations/` - Type definitions
- ✅ `src/types/validation.ts` - Custom validators
- ✅ `src/lib/env.ts` - Environment variables

**Phase 2**:
- ✅ `src/lib/auth-config.ts` - NextAuth configuration
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Auth routes
- ✅ `src/app/(auth)/` - Auth pages (5 files)
- ✅ `src/components/auth/` - Auth components (4 files)
- ✅ `src/components/emails/` - Email templates (3 files)

**Phase 3**: (Repeat for all 19 tables)
- ✅ `src/database/queries/[table]-queries.ts`
- ✅ `src/database/mutations/[table]-mutations.ts`
- ✅ `src/dal/[table]-dal.ts`
- ✅ `src/lib/schemas/[table]-schema.ts`
- ✅ `src/lib/actions/[table].ts`
- ✅ `src/app/api/[table]/` - API routes
- ✅ `src/app/(root)/[table]/` - Pages
- ✅ `src/components/[table]/` - Components

**Phase 4**:
- ✅ `src/database/seed/seedHelpers.ts`
- ✅ `src/database/seed/seed.ts`
- ✅ `src/app/seed/route.ts`

**Phase 5**:
- ✅ `./html/` → Convert all HTML files

**Phase 6**:
- ✅ All config files optimized

**Phase 7**:
- ✅ `README.md` updated
- ✅ All documentation complete
- ✅ All tests passing

---

**Total Files**: ~200+ (depending on number of tables & pages)

**Estimated Time**: 40-60 hours (with Copilot assistance)

**Deliverables**:
1. Production-ready Next.js 16 application
2. Type-safe database layer with Drizzle ORM
3. Authenticated user system with OAuth
4. Complete CRUD for 19 database tables
5. Comprehensive API (40+ routes)
6. Email system with React Email
7. Full test coverage (unit + E2E)
8. Docker deployment ready
9. Complete documentation

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

1. **Type Errors**: Run `pnpm type-check` and fix issues
2. **Missing Imports**: Use IDE's "Organize Imports" feature
3. **Environment Variables**: Copy `.env.example` to `.env.local` and fill values
4. **Database Connection**: Verify `DATABASE_URL` and run `pnpm db:push`
5. **Build Errors**: Clear `.next` directory and rebuild: `rm -rf .next && pnpm build`

### Getting Help

- Check existing prompt files in `.github/prompts/`
- Review project documentation in `docs/`
- Check error logs in `eslint-report.json`
- Run validation: `pnpm validate`

---

**Next Steps**: Follow the phases in order, using this guide as your comprehensive reference.
