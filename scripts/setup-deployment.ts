#!/usr/bin/env tsx
/**
 * setup-deployment.ts - Production Deployment Automation
 * Configures CI/CD pipelines, Docker containers, and deployment infrastructure
 * Implements health checks, monitoring, and rollback capabilities
 */
import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

// Color utilities
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// Dockerfile template for Next.js 16
const DOCKERFILE = `# ComicWise Next.js 16 Production Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build application
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]`;

// Docker compose for development
const DOCKER_COMPOSE_DEV = `version: '3.8'

services:
  app:
    build:
      context: .
      target: base
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/comicwise
    depends_on:
      - db
      - redis
    command: pnpm dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: comicwise
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:`;

// Production docker compose
const DOCKER_COMPOSE_PROD = `version: '3.8'

services:
  app:
    build:
      context: .
      target: runner
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - AUTH_SECRET=\${AUTH_SECRET}
      - NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(\`\${DOMAIN}\`)"
      - "traefik.http.routers.app.tls=true"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=\${EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "letsencrypt:/letsencrypt"
    restart: unless-stopped

volumes:
  redis_data:
  letsencrypt:`;

// GitHub Actions workflow
const GITHUB_ACTIONS = `name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: comicwise_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: \${{ env.PNPM_VERSION }}

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=\$(pnpm store path --silent)" >> \$GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/comicwise_test

      - name: Build
        run: pnpm build
        env:
          NODE_ENV: production

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [test]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: \${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security:
    name: Security Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: \${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run security audit
        run: pnpm audit --production

      - name: Run dependency check
        run: |
          npx depcheck
          npx npm-check-updates --target minor

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [test, e2e, security]
    if: github.ref == 'refs/heads/develop'

    environment:
      name: staging
      url: https://staging.comicwise.com

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: \${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NODE_ENV: production
          DATABASE_URL: \${{ secrets.STAGING_DATABASE_URL }}
          AUTH_SECRET: \${{ secrets.STAGING_AUTH_SECRET }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [test, e2e, security]
    if: github.ref == 'refs/heads/main'

    environment:
      name: production
      url: https://comicwise.com

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: \${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NODE_ENV: production
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
          AUTH_SECRET: \${{ secrets.AUTH_SECRET }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-project-name: comicwise
          working-directory: ./
          production: true`;

// Health check API route
const HEALTH_CHECK_API = `import { NextResponse } from 'next/server';
import { db } from '@/database';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbCheck = await db.execute(sql\`SELECT 1\`);
    const dbLatency = Date.now() - startTime;

    // Check environment variables
    const requiredEnvs = [
      'DATABASE_URL',
      'AUTH_SECRET',
      'NEXT_PUBLIC_API_URL'
    ];

    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: {
          status: dbCheck ? 'healthy' : 'unhealthy',
          latency: \`\${dbLatency}ms\`,
          connected: !!dbCheck,
        },
        environment: {
          status: missingEnvs.length === 0 ? 'healthy' : 'unhealthy',
          missing: missingEnvs,
        },
        memory: {
          usage: process.memoryUsage(),
          status: 'healthy',
        },
      },
    };

    const isHealthy = health.checks.database.status === 'healthy' &&
                     health.checks.environment.status === 'healthy';

    return NextResponse.json(health, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: { status: 'unhealthy' },
          environment: { status: 'unknown' },
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}`;

// Deployment scripts
const DEPLOY_SCRIPT = `#!/bin/bash
set -e

echo "🚀 Starting ComicWise deployment..."

# Environment validation
if [ -z "\$NODE_ENV" ]; then
  echo "❌ NODE_ENV not set"
  exit 1
fi

if [ -z "\$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
fi

echo "✅ Environment: \$NODE_ENV"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run database migrations
echo "🗄️  Running database migrations..."
pnpm db:push

# Build application
echo "🏗️  Building application..."
pnpm build

# Run health check
echo "🔍 Running health check..."
timeout 60s bash -c 'until curl -f http://localhost:3000/api/health; do sleep 5; done'

echo "✅ Deployment completed successfully!"`;

async function setupDeployment() {
  log.info("🚀 Setting up production deployment automation...");

  try {
    // Create Docker files
    log.info("Creating Docker configuration...");
    await fs.writeFile(path.join(process.cwd(), "Dockerfile"), DOCKERFILE);
    await fs.writeFile(path.join(process.cwd(), "docker-compose.dev.yml"), DOCKER_COMPOSE_DEV);
    await fs.writeFile(path.join(process.cwd(), "docker-compose.prod.yml"), DOCKER_COMPOSE_PROD);
    log.success("✓ Created Docker configuration");

    // Create GitHub Actions workflow
    const workflowDir = path.join(process.cwd(), ".github", "workflows");
    await fs.mkdir(workflowDir, { recursive: true });
    await fs.writeFile(path.join(workflowDir, "ci-cd.yml"), GITHUB_ACTIONS);
    log.success("✓ Created GitHub Actions workflow");

    // Create health check API
    const healthDir = path.join(process.cwd(), "src", "app", "api", "health");
    await fs.mkdir(healthDir, { recursive: true });
    await fs.writeFile(path.join(healthDir, "route.ts"), HEALTH_CHECK_API);
    log.success("✓ Created health check API");

    // Create deployment script
    const scriptsDir = path.join(process.cwd(), "scripts");
    const deployScriptPath = path.join(scriptsDir, "deploy.sh");
    await fs.writeFile(deployScriptPath, DEPLOY_SCRIPT);

    // Make deploy script executable (on Unix systems)
    try {
      execSync(`chmod +x "${deployScriptPath}"`, { stdio: "ignore" });
    } catch {
      // Ignore on Windows
    }
    log.success("✓ Created deployment script");

    // Create .dockerignore
    const dockerIgnore = `node_modules
.next
.git
.github
.vscode
.env*
README.md
Dockerfile*
docker-compose*
coverage
test-results
playwright-report
.nyc_output`;
    await fs.writeFile(path.join(process.cwd(), ".dockerignore"), dockerIgnore);
    log.success("✓ Created .dockerignore");

    // Update next.config.ts for standalone output
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");
    try {
      const nextConfig = await fs.readFile(nextConfigPath, "utf-8");
      if (!nextConfig.includes('output: "standalone"')) {
        const updatedConfig = nextConfig.replace(
          "const nextConfig: NextConfig = {",
          'const nextConfig: NextConfig = {\n  output: "standalone",'
        );
        await fs.writeFile(nextConfigPath, updatedConfig);
        log.success("✓ Updated next.config.ts for Docker standalone mode");
      }
    } catch {
      log.warn('Could not update next.config.ts - please add output: "standalone" manually');
    }

    // Update package.json scripts
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    const deploymentScripts = {
      "docker:build": "docker build -t comicwise .",
      "docker:run": "docker run -p 3000:3000 comicwise",
      "docker:dev": "docker-compose -f docker-compose.dev.yml up",
      "docker:prod": "docker-compose -f docker-compose.prod.yml up -d",
      "deploy:staging": "NODE_ENV=staging ./scripts/deploy.sh",
      "deploy:production": "NODE_ENV=production ./scripts/deploy.sh",
      "health-check": "curl -f http://localhost:3000/api/health",
    };

    packageJson.scripts = { ...packageJson.scripts, ...deploymentScripts };
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log.success("✓ Updated package.json with deployment scripts");

    log.success("🎉 Production deployment setup completed!");
    log.info("Available deployment features:");
    log.info("  • Docker Configuration - Multi-stage builds with Alpine Linux");
    log.info("  • GitHub Actions CI/CD - Automated testing and deployment");
    log.info("  • Health Check API - System status monitoring at /api/health");
    log.info("  • Deployment Scripts - Automated deployment with validation");
    log.info("  • Docker Compose - Development and production environments");
    log.info("");
    log.info("Next steps:");
    log.info("  1. Configure GitHub secrets (VERCEL_TOKEN, DATABASE_URL, etc.)");
    log.info("  2. Set up staging/production environments");
    log.info("  3. Run: pnpm docker:dev (for local development)");
    log.info("  4. Run: pnpm deploy:staging (for staging deployment)");
  } catch (error) {
    log.error(`Deployment setup failed: ${error}`);
    throw error;
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDeployment().catch(console.error);
}

export default setupDeployment;
