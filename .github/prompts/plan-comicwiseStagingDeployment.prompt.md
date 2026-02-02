# ComicWise Staging Deployment - Speed-Optimized Execution Plan

**Timeline:** 1.8-2 hours
**Project:** Comicr (Vercel)
**Optimization:** Parallel service creation, minimal testing
**Date:** February 2, 2026

---

## Executive Summary

Deploy ComicWise to Vercel staging environment with:

- **Services:** Neon PostgreSQL, Upstash Redis, Sentry, Google OAuth, Gmail SMTP, ImageKit
- **Code Fixes:** SMTP variable standardization, Prettier upgrade, DAL refactoring
- **Strategy:** Parallel service setup (3 tabs simultaneously), speed-optimized testing
- **Target:** `https://comicr.vercel.app`

---

## Prerequisites Confirmed

- ✅ GitHub OAuth credentials ready
- ✅ Can work in 3 browser tabs simultaneously
- ✅ Neon PostgreSQL selected
- ✅ Gmail SMTP for contact form
- ✅ Vercel project name: "Comicr"
- ✅ 2-3 hours time commitment
- ✅ Full automation for code changes

---

## Phase Timeline

| Phase     | Time         | Parallel?       | Actions                                  |
| --------- | ------------ | --------------- | ---------------------------------------- |
| Phase 0   | 5 min        | -               | Apply code fixes (SMTP, Prettier, DAL)   |
| Phase 1   | 20 min       | ✅              | Create Neon + Upstash + Sentry (3 tabs)  |
| Phase 2   | 15 min       | ✅              | Create Google OAuth + Gmail app password |
| Phase 3   | 5 min        | -               | Create ImageKit account                  |
| Phase 4   | 5 min        | -               | Create .env.local with all credentials   |
| Phase 5   | 10 min       | -               | Run local tests (OAuth validation)       |
| Phase 6   | 20 min       | -               | Deploy to Vercel with env variables      |
| Phase 7   | 10 min       | -               | Update OAuth with staging URLs           |
| Phase 8   | 10 min       | -               | Run smoke tests on staging               |
| **TOTAL** | **~110 min** | **(1.8 hours)** |                                          |

---

## Critical Path Dependencies

```
Code Fixes → .env.local → DB Schema Push → Local Tests → Deploy → OAuth Update → Staging Tests
     ↑            ↑
     |            |
     |      [Neon + Upstash + Sentry + OAuth + ImageKit]
     |            (parallel creation)
```

**Blockers:**

- Cannot create .env.local without: Neon, Upstash, Sentry, Google OAuth, ImageKit, Gmail credentials
- Cannot test locally without: .env.local with DATABASE_URL
- Cannot deploy without: Local tests passing
- Cannot test staging without: OAuth updated with staging URLs

---

## Phase 0: Code Fixes (5 minutes)

### Files to Update

#### 1. `src/lib/env.ts` - SMTP Variable Fix

**Change:** Lines 27-31

```typescript
// FROM: NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASS
// TO:   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

// ========== EMAIL ==========
RESEND_API_KEY: z.string().optional(),
EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),
SMTP_HOST: z.string().optional(),
SMTP_PORT: z.string().transform(Number).optional(),
SMTP_USER: z.string().optional(),
SMTP_PASS: z.string().optional(),
```

#### 2. `.prettierrc.ts` - Add Tailwind Plugin

**Change:** Line 18

```typescript
const config: Options = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  jsxSingleQuote: false,
  plugins: ["prettier-plugin-tailwindcss"], // ← ADD THIS
};
```

#### 3. `src/lib/actions/admin.actions.ts` - DAL Refactoring

**Changes:**

- **Line 8-10:** Add DAL imports
  ```typescript
  import { chapterDAL } from "@/dal/chapter-dal";
  import { comicDAL } from "@/dal/comic-dal";
  import { userDAL } from "@/dal/user-dal";
  ```
- **Line ~95:** Replace `db.update(comic)` with `comicDAL.update(id, updateData)`
- **Line ~115:** Replace `db.delete(comic)` with `comicDAL.delete(id)`
- **Line ~200:** Replace `db.update(chapter)` with `chapterDAL.update(id, data)`
- **Line ~217:** Replace `db.delete(chapter)` with `chapterDAL.delete(id)`
- **Line ~279:** Replace `db.update(user)` with `userDAL.update(userId, { role })`
- **Line ~301:** Replace `db.update(user)` with `userDAL.update(userId, { emailVerified: null })`
- **Line ~322:** Replace `db.update(user)` with `userDAL.update(userId, { emailVerified: new Date() })`

#### 4. `.prettierignore` - CREATE NEW FILE

```
node_modules
.pnp
.pnp.js
.next
out
build
dist
.vercel
coverage
.nyc_output
.DS_Store
*.pem
*.log
.pnpm-debug.log*
.env*
.vscode
.idea
*.swp
*.swo
*~
*.tsbuildinfo
next-env.d.ts
.sentryclirc
test-results
playwright-report
*.db
*.sqlite*
pnpm-lock.yaml
package-lock.json
yarn.lock
public/sitemap*.xml
public/robots.txt
```

#### 5. `DEPLOYMENT_CHECKLIST.md` - CREATE NEW FILE

(Full deployment checklist - see appendix)

### Package Updates

```bash
# Upgrade Prettier and add Tailwind plugin
pnpm remove prettier
pnpm add -D prettier@latest prettier-plugin-tailwindcss
```

### Validation

```bash
pnpm type-check  # Should pass
pnpm lint        # Should pass
pnpm build       # Should succeed
```

---

## Phase 1: Parallel Service Creation (20 minutes)

**OPEN 3 BROWSER TABS SIMULTANEOUSLY**

### Tab 1: Neon PostgreSQL (5 min)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up/Login
3. **Create Project:**
   - Name: `comicr-production`
   - Region: Select closest to you
4. **Copy connection string** from dashboard
5. **Format:** `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
6. **Save as:** `DATABASE_URL`

### Tab 2: Upstash Redis (5 min)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up/Login
3. **Create Database:**
   - Name: `comicr-cache`
   - Region: Same as Neon (or closest)
   - Type: Global (recommended)
4. Go to **REST API** tab
5. **Copy both:**
   - `UPSTASH_REDIS_REST_URL=https://...`
   - `UPSTASH_REDIS_REST_TOKEN=...`

### Tab 3: Sentry Error Tracking (5 min)

1. Go to [sentry.io](https://sentry.io)
2. Sign up/Login
3. **Create Project:**
   - Platform: Next.js
   - Name: `comicr`
4. **Copy DSN** from Settings → Client Keys
5. **Create Auth Token:**
   - Settings → Account → API → Auth Tokens
   - New Token → Scopes: `project:releases`, `org:read`
6. **Save both:**
   - `SENTRY_DSN=https://...@...ingest.sentry.io/...`
   - `SENTRY_AUTH_TOKEN=...`

**Time Saved:** ~8 minutes (vs sequential)

---

## Phase 2: OAuth & Email Setup (15 minutes)

**OPEN 2 BROWSER TABS SIMULTANEOUSLY**

### Tab 1: Google OAuth (10 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **Create/Select Project:** "ComicWise"
3. **Enable API:** Search "Google+ API" → Enable
4. **Credentials → Create OAuth 2.0 Client ID**
5. **Configure Consent Screen** (first time):
   - User Type: External
   - App name: ComicWise
   - Support email: Your email
   - Developer contact: Your email
   - Save & Continue (skip scopes, test users)
6. **Create OAuth Client:**
   - Application type: Web application
   - Name: ComicWise Production
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google` (for local testing)
     - `https://comicr.vercel.app/api/auth/callback/google` (will add after deploy)
7. **Copy:**
   - `GOOGLE_CLIENT_ID=...apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET=...`

### Tab 2: Gmail App Password (5 min)

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. **Enable 2-Step Verification** (if not already)
3. Search "App passwords" or go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. **Generate:**
   - App: Mail
   - Device: Other (Custom name) → "ComicWise SMTP"
5. **Copy 16-character password** (format: xxxx xxxx xxxx xxxx)
6. **Save:**
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASS=xxxx xxxx xxxx xxxx`

**Time Saved:** ~3 minutes (vs sequential)

---

## Phase 3: ImageKit CDN (5 minutes)

1. Go to [imagekit.io/dashboard](https://imagekit.io/dashboard)
2. Sign up with email or GitHub
3. **Create account** (follow setup wizard)
4. Go to **Developer options** → **API Keys**
5. **Copy all 3 values:**
   - `IMAGEKIT_PUBLIC_KEY=public_...`
   - `IMAGEKIT_PRIVATE_KEY=private_...`
   - `IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...`

---

## Phase 4: Create .env.local (5 minutes)

Create `.env.local` file with ALL credentials collected:

```bash
# =============================================================================
# ComicWise Staging Environment Variables
# =============================================================================

# -----------------------------------------------------------------------------
# DATABASE (Required)
# -----------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require"

# -----------------------------------------------------------------------------
# AUTHENTICATION (Required)
# -----------------------------------------------------------------------------
# Generate: openssl rand -base64 32
AUTH_SECRET="your-32-plus-character-secret-here"
AUTH_TRUST_HOST="true"

# Google OAuth
GOOGLE_CLIENT_ID="your-app.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-secret"

# GitHub OAuth (you already have this)
GITHUB_CLIENT_ID="Ov23lilsIaJtd4AnJW5H"
GITHUB_CLIENT_SECRET="97193202f818286994546cf691e1ceb1d186530c"

# -----------------------------------------------------------------------------
# EMAIL - Contact Form (Using SMTP_* - FIXED!)
# -----------------------------------------------------------------------------
EMAIL_FROM="your-email@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # Gmail app password (16 chars)

# -----------------------------------------------------------------------------
# REDIS - Caching (Upstash)
# -----------------------------------------------------------------------------
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# -----------------------------------------------------------------------------
# IMAGE CDN (ImageKit)
# -----------------------------------------------------------------------------
IMAGEKIT_PUBLIC_KEY="public_UCHMBUlsWeivU+MgIke3Q5Eos2Q="
IMAGEKIT_PRIVATE_KEY="private_b0vg7mL51ps2J+O7UzBSt7LPiSI="
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/bt7aws08b"

# -----------------------------------------------------------------------------
# ERROR TRACKING (Sentry)
# -----------------------------------------------------------------------------
SENTRY_DSN="https://your-key@o123456.ingest.sentry.io/123456"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
SENTRY_ENV="staging"

# -----------------------------------------------------------------------------
# APPLICATION URLs (Localhost first, update after deploy)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# -----------------------------------------------------------------------------
# DEVELOPMENT
# -----------------------------------------------------------------------------
CUSTOM_PASSWORD="StagingPass123!"  # 8+ chars, uppercase, lowercase, number
NODE_ENV="development"
ENABLE_SEEDING="true"
```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
# Copy output to AUTH_SECRET in .env.local
```

---

## Phase 5: Local Testing (10 minutes)

### Push Database Schema

```bash
# DATABASE_URL must be in .env.local first!
pnpm db:push

# Expected: Schema applied successfully
```

### Optional: Seed Database

```bash
pnpm db:seed
# Expected: Comics, chapters, users seeded
```

### Start Development Server

```bash
pnpm dev
# Expected: Server starts on http://localhost:3000
```

### Test Authentication (CRITICAL)

1. Open `http://localhost:3000`
2. Click "Sign In"
3. **Test Google OAuth:**
   - Click "Continue with Google"
   - Should redirect to Google consent screen
   - After authorization → redirect back to app
   - **Verify:** User logged in, session persists
4. Sign out
5. **Test GitHub OAuth:**
   - Click "Continue with GitHub"
   - Should redirect to GitHub authorization
   - After authorization → redirect back to app
   - **Verify:** User logged in

**If both OAuth providers work → READY TO DEPLOY! 🚀**

### Quick Feature Tests (Optional - Speed Mode)

- [ ] Browse comics page loads
- [ ] Click comic → details page loads
- [ ] Open chapter → reader works

**If any test fails:** Fix before deploying!

---

## Phase 6: Vercel Deployment (20 minutes)

### Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

### Link Project

```bash
vercel link

# Prompts:
# Set up and deploy ~? Y
# Which scope? (Select your account/team)
# Link to existing project? N
# What's your project name? comicr
# In which directory is your code? ./
# Want to override settings? N
```

### Add Environment Variables to Vercel

**For each variable, run:**

```bash
vercel env add <VARIABLE_NAME> production
# Then paste the value when prompted
```

**Required variables (copy from .env.local):**

```bash
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production  # Generate NEW: openssl rand -base64 32
vercel env add AUTH_TRUST_HOST production  # Value: true

vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production

vercel env add EMAIL_FROM production
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASS production

vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

vercel env add IMAGEKIT_PUBLIC_KEY production
vercel env add IMAGEKIT_PRIVATE_KEY production
vercel env add IMAGEKIT_URL_ENDPOINT production

vercel env add SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production
vercel env add SENTRY_ENV production  # Value: staging

vercel env add NEXT_PUBLIC_API_URL production
# Value: https://comicr.vercel.app/api

vercel env add CUSTOM_PASSWORD production
vercel env add ENABLE_SEEDING production  # Value: false
```

### Verify Environment Variables

```bash
vercel env ls
# Check all variables are listed
```

### Deploy to Production

```bash
vercel --prod

# Wait for build to complete (3-5 minutes)
# Capture deployment URL: https://comicr.vercel.app
```

**Expected output:**

```
✅ Production: https://comicr.vercel.app [copied to clipboard]
```

---

## Phase 7: Update OAuth Redirect URIs (10 minutes)

### Update Google OAuth

1. Go back to [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. **ADD** to Authorized redirect URIs (don't remove localhost):
   - `https://comicr.vercel.app/api/auth/callback/google`
5. **Save changes**

### Update GitHub OAuth

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Select your OAuth App
3. **ADD** to Authorization callback URL:
   - `https://comicr.vercel.app/api/auth/callback/github`
4. **Update application**

**Note:** Keep localhost URLs for local development!

---

## Phase 8: Staging Smoke Tests (10 minutes)

### Automated Health Checks

```bash
# Set deployment URL
DEPLOY_URL="https://comicr.vercel.app"

# Test 1: Health endpoint
curl $DEPLOY_URL/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test 2: Homepage
curl -I $DEPLOY_URL/
# Expected: HTTP/2 200

# Test 3: API endpoint
curl $DEPLOY_URL/api/comics | jq '.success'
# Expected: true
```

### Manual Browser Tests

Visit: `https://comicr.vercel.app`

**Critical tests:**

- [ ] Homepage loads without errors
- [ ] Sign in page accessible
- [ ] Google OAuth works on staging
- [ ] GitHub OAuth works on staging
- [ ] Browse comics page loads
- [ ] Click comic → details page works
- [ ] Open chapter → reader loads
- [ ] Test contact form → email sent
- [ ] Check browser console → no errors

### Monitor Services

1. **Sentry:** Go to [sentry.io](https://sentry.io) → Check for errors during testing
2. **Upstash:** Go to [console.upstash.com](https://console.upstash.com) → Verify requests/metrics
3. **Neon:** Go to [console.neon.tech](https://console.neon.tech) → Check active connections
4. **Vercel:** Check deployment logs: `vercel logs`

---

## Validation Checklist

### Pre-Deployment

- [ ] Code fixes applied (SMTP\_\*, Prettier, DAL)
- [ ] Packages upgraded (prettier@latest)
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Build succeeds locally
- [ ] All service accounts created
- [ ] .env.local created with all credentials
- [ ] Database schema pushed
- [ ] OAuth works locally (both providers)

### Post-Deployment

- [ ] Deployment URL accessible
- [ ] All environment variables set in Vercel
- [ ] OAuth redirect URIs updated
- [ ] Google OAuth works on staging
- [ ] GitHub OAuth works on staging
- [ ] Contact form sends emails
- [ ] Images load from ImageKit
- [ ] Sentry capturing events
- [ ] Upstash showing cache activity
- [ ] No console errors
- [ ] Mobile responsive (test on device)

---

## Rollback Plan

### If Deployment Fails

**Code Issues:**

```bash
git reset --hard HEAD  # Undo local changes
```

**Vercel Issues:**

```bash
vercel rollback  # Rollback to previous deployment
vercel logs      # Check deployment logs
```

**Database Issues:**

- Restore from Neon backup (automatic daily backups)
- Check connection string format includes `?sslmode=require`

**OAuth Issues:**

- Verify redirect URIs match exactly (no trailing slashes)
- Check protocol (http vs https)
- Wait 5 minutes for propagation

---

## Speed Optimizations Applied

1. ✅ **Parallel Service Creation:** 3 services simultaneously (saved 11 min)
2. ✅ **Minimal Testing:** OAuth validation only, skip E2E tests
3. ✅ **Pre-configured Templates:** All files ready with correct values
4. ✅ **Skip Optional Services:** No SendGrid, Cloudinary, Stripe
5. ✅ **Deferred Optimization:** No Lighthouse audit, no load testing

---

## Success Metrics

**Deployment successful when:**

- ✅ Staging URL accessible: `https://comicr.vercel.app`
- ✅ Both OAuth providers working
- ✅ Core features functional (browse, read, auth)
- ✅ Services reporting activity (Sentry, Upstash, Neon)
- ✅ No critical errors in browser console

**Time target:** 110 minutes (1.8 hours)
**Actual time:** **\_\_\_** (track for future reference)

---

## Next Steps After Deployment

1. **Monitor for 24 hours:**
   - Check Sentry for errors
   - Review Upstash cache hit rates
   - Monitor Neon database connections

2. **Optional Enhancements:**
   - Custom domain setup
   - Production environment (separate from staging)
   - CI/CD GitHub Actions
   - Lighthouse performance audit
   - Load testing with k6

3. **Team Coordination:**
   - Share staging URL
   - Grant team access to services
   - Document any deployment issues
   - Schedule retrospective

---

## Appendix: Common Issues & Solutions

### OAuth "redirect_uri_mismatch"

**Cause:** URL doesn't match exactly in OAuth app settings
**Fix:** Verify exact match, check trailing slashes, ensure http/https matches

### SMTP authentication failed

**Cause:** Using account password instead of app password
**Fix:** Generate new Gmail app password, ensure 2FA enabled

### Database connection timeout

**Cause:** Neon project suspended, wrong connection string
**Fix:** Verify project active, check `?sslmode=require` in connection string

### Redis connection failed

**Cause:** Wrong region, incorrect token
**Fix:** Verify REST URL format, check token copied correctly

### Build fails on Vercel

**Cause:** Missing environment variables, type errors
**Fix:** Check Vercel logs, verify all required env vars set, test build locally

### Images not loading

**Cause:** ImageKit credentials incorrect, CORS issues
**Fix:** Verify all 3 ImageKit keys set, check browser console for CORS errors

---

## End of Plan

**Document Version:** 1.0
**Created:** February 2, 2026
**Estimated Total Time:** 110 minutes (1.8 hours)
**Status:** Ready for execution

**Start command:** Begin with Phase 0 code fixes, then open 3 browser tabs for Phase 1!
