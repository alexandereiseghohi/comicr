# ComicWise Environment Variables Guide

**Version:** 2.0
**Last Updated:** February 1, 2026
**Status:** Production Ready

This comprehensive guide documents all environment variables used in ComicWise, including setup instructions, validation steps, and troubleshooting tips.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Required Variables](#required-variables)
- [Database Configuration](#database-configuration)
- [Authentication](#authentication)
- [Caching (Redis)](#caching-redis)
- [Image Storage](#image-storage)
- [Monitoring & Error Tracking](#monitoring--error-tracking)
- [Email Services](#email-services)
- [Payment Integration](#payment-integration)
- [Development & Testing](#development--testing)
- [Security](#security)
- [Deployment](#deployment)
- [Validation](#validation)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Initial Setup

```bash
# Copy template
cp .env.template .env.local

# Generate auth secret
openssl rand -base64 32

# Validate configuration
pnpm validate:env
```

### 2. Minimum Required Variables

For local development, you need at minimum:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/comicwise"
AUTH_SECRET="your-32-char-secret-from-openssl"
GITHUB_CLIENT_ID="your-github-oauth-id"
GITHUB_CLIENT_SECRET="your-github-oauth-secret"
IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"
```

### 3. Start Development

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

---

## Required Variables

### DATABASE_URL

**Purpose:** PostgreSQL database connection string
**Format:** `postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]`
**Required:** ✅ Yes
**Environment:** All

**Setup:**

Local PostgreSQL:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/comicwise"
```

Neon (Serverless PostgreSQL):

```bash
NEON_DATABASE_URL="postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/comicwise?sslmode=require"
```

**Validation:**

```bash
psql $DATABASE_URL -c "SELECT version();"
```

---

### AUTH_SECRET

**Purpose:** Secret key for NextAuth.js session encryption
**Format:** Base64 string (minimum 32 characters)
**Required:** ✅ Yes
**Environment:** All

**Setup:**

```bash
# Generate secure secret
openssl rand -base64 32

# Add to .env.local
AUTH_SECRET="your-generated-secret-here"
```

**Security Notes:**

- Never commit this to version control
- Use different secrets for dev/staging/production
- Rotate regularly (quarterly recommended)
- Must be at least 32 characters

**Validation:**

```bash
# Check length
echo -n "$AUTH_SECRET" | wc -c  # Should be ≥32
```

---

## Database Configuration

### PostgreSQL (Local)

**Installation (Windows):**

```powershell
# Using Chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# Verify installation
psql --version
```

**Setup:**

```bash
# Create database
createdb comicwise

# Create user
psql -c "CREATE USER comicwise WITH PASSWORD 'your-password';"

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE comicwise TO comicwise;"

# Connection string
DATABASE_URL="postgresql://comicwise:your-password@localhost:5432/comicwise"
```

### Neon (Serverless PostgreSQL)

**Why Neon?**

- ✅ Serverless (no maintenance)
- ✅ Auto-scaling
- ✅ Free tier: 0.5GB storage, 100 hours compute
- ✅ Point-in-time restore
- ✅ Branching for dev/test

**Setup:**

1. **Create Account:** https://neon.tech/
2. **Create Project:**
   - Project name: `comicwise`
   - Region: Choose closest to users (e.g., `us-east-2`)
   - PostgreSQL version: 16 (latest)
3. **Get Connection String:**
   - Dashboard → Connection Details → Connection string
   - Copy "Pooled connection" for serverless
4. **Add to .env.local:**
   ```bash
   NEON_DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/comicwise?sslmode=require"
   ```

**Validation:**

```bash
psql $NEON_DATABASE_URL -c "SELECT pg_database_size(current_database());"
```

---

## Authentication

### Google OAuth

**Purpose:** Allow users to sign in with Google accounts
**Required:** ❌ Optional (but recommended)
**Docs:** https://console.cloud.google.com/apis/credentials

**Setup Instructions:**

1. **Go to Google Cloud Console:**

   - Visit: https://console.cloud.google.com/
   - Create new project or select existing

2. **Enable Google+ API:**

   - Navigation → APIs & Services → Library
   - Search "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials:**

   - APIs & Services → Credentials
   - Click "+ CREATE CREDENTIALS" → OAuth client ID
   - Application type: Web application
   - Name: `ComicWise - Local Dev` (or `Production`)

4. **Configure Authorized URLs:**

   **Authorized JavaScript origins:**

   ```
   http://localhost:3000
   https://your-production-domain.com
   ```

   **Authorized redirect URIs:**

   ```
   http://localhost:3000/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```

5. **Copy Credentials:**

   - Client ID: `123456789-abcdefg.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-your-secret-here`

6. **Add to .env.local:**
   ```bash
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

**Validation:**

```bash
# Start dev server
pnpm dev

# Navigate to: http://localhost:3000/sign-in
# Click "Sign in with Google"
# Should redirect to Google consent screen
```

**Troubleshooting:**

- **Error: redirect_uri_mismatch** → Check authorized redirect URIs match exactly
- **Error: invalid_client** → Verify client ID/secret are correct
- **Error: access_denied** → User declined or app not verified

---

### GitHub OAuth

**Purpose:** Allow users to sign in with GitHub accounts
**Required:** ✅ Yes (already configured)
**Docs:** https://github.com/settings/developers

**Setup Instructions:**

1. **Create OAuth App:**

   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - Application name: `ComicWise`
   - Homepage URL: `http://localhost:3000` (dev) or `https://your-domain.com` (prod)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

2. **Get Credentials:**

   - Click "Generate a new client secret"
   - Copy Client ID and Client Secret

3. **Add to .env.local:**
   ```bash
   GITHUB_CLIENT_ID="Ov23lilsIaJtd4AnJW5H"
   GITHUB_CLIENT_SECRET="your-github-secret-here"
   ```

**Current Configuration:**

```bash
GITHUB_CLIENT_ID="Ov23lilsIaJtd4AnJW5H"
GITHUB_CLIENT_SECRET="97193202f818286994546cf691e1ceb1d186530c"
```

**Validation:**

```bash
# Test GitHub OAuth flow
curl -I "http://localhost:3000/api/auth/signin/github"
# Should return 302 redirect to github.com
```

---

## Caching (Redis)

### Why Redis?

- ✅ **Performance:** 10-100x faster than database queries
- ✅ **Scalability:** Handle millions of requests
- ✅ **Cost-effective:** Reduce database load
- ✅ **Use cases:** Session storage, rate limiting, cache hot data

### Upstash Redis (Recommended for Production)

**Why Upstash?**

- ✅ Serverless (pay per request)
- ✅ REST API (no connection pooling needed)
- ✅ Free tier: 10,000 commands/day
- ✅ Global edge caching
- ✅ Compatible with Vercel

**Setup:**

1. **Create Account:** https://console.upstash.com/
2. **Create Database:**

   - Click "Create Database"
   - Name: `comicwise`
   - Region: Choose closest to Vercel region
   - Type: Regional (or Global for $$$)
   - Eviction: `allkeys-lru` (recommended)

3. **Get REST API Credentials:**

   - Database → REST API tab
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

4. **Add to .env.local:**
   ```bash
   UPSTASH_REDIS_REST_URL="https://pet-sawfish-10129.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="ASeRAAIncDI4NGQ3MmQ3ZmY3ZGQ0NDMwYmIwNjMwZDFmZDYyMmNlNXAyMTAxMjk"
   ```

**Validation:**

```bash
# Test connection
curl -X POST $UPSTASH_REDIS_REST_URL/set/testkey/testvalue \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

curl $UPSTASH_REDIS_REST_URL/get/testkey \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

### Local Redis (Development)

**Installation (Windows):**

```powershell
# Using Chocolatey
choco install redis-64

# Or WSL2:
wsl --install
wsl -d Ubuntu
sudo apt-get install redis-server
redis-server
```

**Configuration:**

```bash
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # Leave empty for local
REDIS_DB="0"
```

**Validation:**

```bash
redis-cli ping  # Should return PONG
```

---

## Image Storage

### ImageKit (Recommended)

**Current Configuration:** ✅ Already set up

**Why ImageKit?**

- ✅ Real-time image optimization
- ✅ CDN delivery (fast worldwide)
- ✅ Format conversion (WebP, AVIF)
- ✅ Responsive images (auto-resize)
- ✅ Free tier: 20GB bandwidth/month

**Credentials:**

```bash
IMAGEKIT_PUBLIC_KEY="public_UCHMBUlsWeivU+MgIke3Q5Eos2Q="
IMAGEKIT_PRIVATE_KEY="private_b0vg7mL51ps2J+O7UzBSt7LPiSI="
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/bt7aws08b"
```

**Validation:**

```bash
# Test upload
curl -X POST "$IMAGEKIT_URL_ENDPOINT/api/v1/files/upload" \
  -u "$IMAGEKIT_PRIVATE_KEY:" \
  -F "file=@test-image.jpg" \
  -F "fileName=test.jpg"
```

**Usage Example:**

```typescript
import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  authenticationEndpoint: "/api/imagekit/auth",
});

// Optimize image on-the-fly
const url = imagekit.url({
  path: "/comics/cover.jpg",
  transformation: [
    {
      width: "400",
      quality: "80",
      format: "webp",
    },
  ],
});
```

---

## Monitoring & Error Tracking

### Sentry

**Purpose:** Real-time error tracking and performance monitoring
**Required:** ❌ Optional (highly recommended for production)
**Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/

**Setup Instructions:**

1. **Create Account:** https://sentry.io/signup/
2. **Create Project:**

   - Platform: Next.js
   - Project name: `comicwise`
   - Alert frequency: default

3. **Get DSN:**

   - Project Settings → Client Keys (DSN)
   - Copy DSN: `https://your-key@o123456.ingest.sentry.io/123456`

4. **Generate Auth Token:**

   - User Settings → Auth Tokens
   - Click "Create New Token"
   - Scopes: `project:read`, `project:releases`, `org:read`
   - Copy token

5. **Add to .env.local:**
   ```bash
   SENTRY_DSN="https://your-key@o123456.ingest.sentry.io/123456"
   SENTRY_ORG="your-org-slug"
   SENTRY_PROJECT="comicwise"
   SENTRY_AUTH_TOKEN="your-auth-token"
   NEXT_PUBLIC_SENTRY_DSN="$SENTRY_DSN"
   ```

**Configuration:**

```bash
# Performance monitoring
SENTRY_TRACES_SAMPLE_RATE="0.1"  # 10% of transactions

# Session replay
SENTRY_REPLAYS_SESSION_SAMPLE_RATE="0.1"  # 10% of sessions
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE="1.0"  # 100% of error sessions
```

**Validation:**

```bash
# Trigger test error
curl http://localhost:3000/api/sentry-test

# Check Sentry dashboard for error
```

---

## Email Services

### Resend (Recommended)

**Purpose:** Transactional emails (auth, notifications)
**Required:** ❌ Optional
**Docs:** https://resend.com/docs

**Setup:**

1. Create account: https://resend.com/
2. Get API key: Dashboard → API Keys
3. Verify domain (for production)

**Configuration:**

```bash
RESEND_API_KEY="re_your-api-key"
EMAIL_FROM="ComicWise <noreply@comicwise.app>"
```

### SMTP (Alternative)

**Gmail Example:**

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"  # Generate at https://security.google.com/settings/security/apppasswords
```

---

## Payment Integration

### Stripe

**Purpose:** Handle subscriptions and payments
**Required:** ❌ Optional (if monetizing)
**Docs:** https://stripe.com/docs

**Setup:**

1. Create account: https://dashboard.stripe.com/register
2. Get API keys: Developers → API keys
3. Set up webhook endpoint

**Configuration:**

```bash
STRIPE_SECRET_KEY="sk_test_your-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY"
```

---

## Development & Testing

### Seeding

```bash
CUSTOM_PASSWORD="SecurePassword123!"  # Default password for seeded users
SEED_MAX_IMAGE_SIZE_BYTES="5242880"  # 5MB
```

### Testing

```bash
PLAYWRIGHT_TEST_BASE_URL="http://localhost:3000"
TEST_DATABASE_URL="postgresql://test:test@localhost:5432/comicwise_test"
TEST_ADMIN_EMAIL="admin@test.com"
TEST_ADMIN_PASSWORD="TestPassword123!"
```

---

## Security

### Rate Limiting

```bash
RATE_LIMIT_MAX_REQUESTS="100"  # Per window
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
```

### Password Hashing

```bash
BCRYPT_ROUNDS="12"  # 10-12 recommended (higher = more secure but slower)
```

---

## Deployment

### Vercel

**Setup:**

1. Install CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Add env vars: `vercel env add VARIABLE_NAME production`

**Configuration:**

```bash
VERCEL_TOKEN="your-token"
VERCEL_ORG_ID="team_xxx"
VERCEL_PROJECT_ID="prj_xxx"
VERCEL_ENV="production"
```

---

## Validation

### Automated Validation

```bash
# Validate all env vars
pnpm validate:env

# Check required vars only
pnpm tsx scripts/validate-env.ts --required-only
```

### Manual Validation

```bash
# Database
psql $DATABASE_URL -c "SELECT 1"

# Redis
redis-cli -u $REDIS_URL ping

# Sentry
curl -I -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/"
```

---

## Troubleshooting

### Common Issues

**1. "Database connection failed"**

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check firewall/network
telnet localhost 5432
```

**2. "OAuth redirect_uri_mismatch"**

- Verify callback URLs match exactly (including trailing slash)
- Check protocol (http vs https)
- Clear browser cache and cookies

**3. "Redis connection timeout"**

```bash
# Check Redis is running
redis-cli ping

# Check connection string
echo $REDIS_URL
```

**4. "ImageKit upload failed"**

- Verify API keys are correct
- Check file size limits
- Ensure file format is supported

---

## Environment-Specific Setup

### Development

```bash
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENABLE_SEEDING_UI="true"
SENTRY_UPLOAD_DRY_RUN="true"
```

### Staging/Preview

```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://comicwise-preview.vercel.app"
ENABLE_SEEDING_UI="false"
SENTRY_ENV="staging"
```

### Production

```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://comicwise.app"
ENABLE_SEEDING_UI="false"
SENTRY_ENV="production"
SENTRY_UPLOAD_DRY_RUN="false"
```

---

## Security Best Practices

1. **Never commit `.env.local` to git**

   ```bash
   # Verify .gitignore includes:
   .env*.local
   .env.local
   ```

2. **Use different secrets per environment**

   - Development: Can be simple for convenience
   - Staging: Similar to production
   - Production: Maximum complexity, rotated regularly

3. **Rotate secrets regularly**

   - AUTH_SECRET: Quarterly
   - API keys: Annually or when team member leaves
   - Database passwords: Annually

4. **Use Vercel/platform environment variables**

   - More secure than committing to repo
   - Can be encrypted at rest
   - Access control via team permissions

5. **Validate environment variables at startup**
   - Use Zod schemas (see `src/lib/env.ts`)
   - Fail fast if required vars missing
   - Log validation errors clearly

---

## Additional Resources

- **Next.js Environment Variables:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **NextAuth.js Configuration:** https://authjs.dev/getting-started/providers/oauth
- **Vercel Environment Variables:** https://vercel.com/docs/environment-variables
- **Neon PostgreSQL:** https://neon.tech/docs/introduction
- **Upstash Redis:** https://upstash.com/docs/redis
- **ImageKit:** https://docs.imagekit.io/
- **Sentry:** https://docs.sentry.io/

---

**Last Updated:** February 1, 2026
**Maintained By:** ComicWise Development Team
**Questions?** Open an issue or contact DevOps team
