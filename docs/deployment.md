# Deployment Guide

## Overview

ComicWise is designed for deployment on Vercel with PostgreSQL (Neon/Supabase) and Redis (Upstash).

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Redis instance (for caching)
- OAuth credentials (Google, GitHub)

## Environment Variables

Create a `.env` file with the following variables:

### Required

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Authentication
AUTH_SECRET=your-32-char-secret-minimum
AUTH_URL=https://your-domain.com

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email
EMAIL_FROM=noreply@your-domain.com

# App
NEXT_PUBLIC_API_URL=https://your-domain.com
CUSTOM_PASSWORD=default-seed-password
```

### Optional

```env
# Storage (choose one)
UPLOAD_PROVIDER=s3|imagekit|cloudinary|local

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Redis (choose one)
CACHE_PROVIDER=upstash|redis

# Upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Local Redis
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `comicr` project

### 2. Configure Environment

Add all environment variables in Vercel Dashboard:

- Settings → Environment Variables
- Add each variable for Production/Preview/Development

### 3. Configure Build

Build settings should auto-detect:

- **Framework**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 4. Database Setup

Using Vercel Postgres (recommended):

1. Storage → Create Database → Postgres
2. Copy the `POSTGRES_URL` to `DATABASE_URL`

Or use external PostgreSQL:

- [Neon](https://neon.tech) - Serverless Postgres
- [Supabase](https://supabase.com) - Postgres with extras
- [Railway](https://railway.app) - Simple Postgres

### 5. Run Migrations

```bash
# Generate migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed initial data
pnpm db:seed
```

### 6. Deploy

```bash
# Via CLI
npx vercel --prod

# Or push to main branch for auto-deploy
git push origin main
```

## Manual Deployment

### 1. Build

```bash
pnpm install
pnpm build
```

### 2. Start Server

```bash
# Production
pnpm start

# With PM2
pm2 start npm --name "comicr" -- start
```

### 3. Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migrations

### Development

```bash
# Make schema changes in src/database/schema.ts

# Generate migration
pnpm db:generate

# Apply to dev database
pnpm db:push
```

### Production

```bash
# Generate migration
pnpm db:generate

# Review migration files in src/database/drizzle/

# Apply migration (CI/CD)
pnpm db:migrate
```

## Seeding

### Initial Seed

```bash
# Full seed with all data
pnpm db:seed
```

### Seed RBAC Only

```typescript
import { seedRolesAndPermissions } from "@/database/seed/seeders/role-permission-seeder";

await seedRolesAndPermissions();
```

## Monitoring

### Sentry Error Tracking

1. Create project at [sentry.io](https://sentry.io)
2. Add `SENTRY_DSN` environment variable
3. Errors automatically captured

### Health Check Endpoint

```http
GET /api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

## Security Checklist

- [ ] `AUTH_SECRET` is unique and 32+ characters
- [ ] Database credentials are not exposed
- [ ] OAuth redirect URLs are configured correctly
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Security headers are set

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
pnpm db:studio
```

Check:

- `DATABASE_URL` format is correct
- SSL mode is enabled (`?sslmode=require`)
- IP allowlist includes Vercel IPs

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Environment Variable Issues

```bash
# Validate env
pnpm validate:env
```

---

_See also: [Architecture](architecture.md), [Runbook](runbook.md)_
