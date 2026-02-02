# Model Context Protocol (MCP) Setup Guide

**Document Version**: 1.0
**Last Updated**: February 1, 2026
**Project**: ComicWise (comicr)

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [MCP Server Configuration](#mcp-server-configuration)
5. [Installation & Validation](#installation--validation)
6. [Server Details](#server-details)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Configuration](#advanced-configuration)

---

## Overview

ComicWise uses **8 MCP (Model Context Protocol) servers** to enhance AI agent capabilities during development. These servers provide specialized tools for Next.js development, TypeScript analysis, database operations, caching, file system manipulation, Git integration, sequential thinking, and documentation search.

**Configuration File**: `.vscode/mcp.json`

### Configured Servers

| Server                  | Package                                            | Purpose                          |
| ----------------------- | -------------------------------------------------- | -------------------------------- |
| **nextjs-dev**          | `@modelcontextprotocol/server-nextjs`              | Next.js 16 development tools     |
| **typescript-enhanced** | `@modelcontextprotocol/server-typescript`          | TypeScript strict mode analysis  |
| **postgresql-database** | `@modelcontextprotocol/server-postgres`            | PostgreSQL database operations   |
| **redis-cache**         | `@modelcontextprotocol/server-redis`               | Redis cache management (Upstash) |
| **filesystem-ops**      | `@modelcontextprotocol/server-filesystem`          | File system operations           |
| **git-integration**     | `@modelcontextprotocol/server-git`                 | Git commands and workflows       |
| **sequential-thinking** | `@modelcontextprotocol/server-sequential-thinking` | Complex problem-solving          |
| **context7**            | `@upstash/context7-mcp`                            | Up-to-date library documentation |

---

## Prerequisites

### Required Software

1. **Node.js**: Version 20.x or higher

   ```bash
   node --version  # Should show v20.x.x or higher
   ```

2. **pnpm**: Version 9.x or higher

   ```bash
   pnpm --version  # Should show 9.x.x or higher
   ```

3. **PostgreSQL**: Version 14.x or higher (local or remote)

   ```bash
   psql --version  # Should show PostgreSQL 14.x or higher
   ```

4. **Redis**: Upstash Redis account (serverless, no local install needed)
   - Sign up at [console.upstash.com](https://console.upstash.com)
   - Create a Redis database
   - Copy REST URL and token

5. **VS Code**: Latest version with GitHub Copilot extension
   ```bash
   code --version
   ```

### Optional Software

- **Git**: Version 2.30+ (for git-integration server)
- **ImageKit/Cloudinary/S3**: For storage operations (optional)

---

## Environment Variables

MCP servers require specific environment variables configured in `.env` file.

### Required Variables (Core MCP Functionality)

```bash
# Database (postgresql-database server)
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

# Redis Cache (redis-cache server)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token_here"

# Next.js (nextjs-dev server)
NEXT_TELEMETRY_DISABLED="1"
NODE_ENV="development"

# TypeScript (typescript-enhanced server)
# Uses tsconfig.json automatically - no env vars needed
```

### Recommended Additional Variables

```bash
# Storage providers (for filesystem-ops advanced features)
IMAGEKIT_PUBLIC_KEY="public_key_here"
IMAGEKIT_PRIVATE_KEY="private_key_here"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"

# Or Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Or S3
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your_bucket_name"

# Monitoring (for error tracking during MCP operations)
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
```

### Environment Setup Steps

1. **Create `.env` file** (if not exists):

   ```bash
   cp .env.example .env
   ```

2. **Validate environment** (recommended):

   ```bash
   pnpm validate:env
   ```

3. **Test database connection**:

   ```bash
   pnpm db:studio  # Opens Drizzle Studio to verify DB connection
   ```

4. **Test Redis connection**:
   ```bash
   # In Node.js REPL or test script
   const { Redis } = require('@upstash/redis')
   const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL,
     token: process.env.UPSTASH_REDIS_REST_TOKEN
   })
   await redis.ping()  # Should return "PONG"
   ```

---

## MCP Server Configuration

### Configuration File Location

**Path**: `.vscode/mcp.json`

**Format**: JSON with comments (JSONC)

### Current Configuration

```jsonc
{
  "servers": {
    "nextjs-dev": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-nextjs",
        "--workspace",
        "${workspaceFolder}",
        "--framework",
        "nextjs-16",
      ],
      "env": {
        "NODE_ENV": "development",
        "NEXT_TELEMETRY_DISABLED": "1",
      },
    },
    "typescript-enhanced": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-typescript", "--strict", "--workspace", "${workspaceFolder}"],
      "env": {
        "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json",
      },
    },
    "postgresql-database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "--connection-string", "${env:DATABASE_URL}"],
      "env": {
        "PGDATABASE": "comicwise",
        "PGSCHEMA": "public",
      },
    },
    "redis-cache": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-redis",
        "--url",
        "${env:UPSTASH_REDIS_REST_URL}",
        "--token",
        "${env:UPSTASH_REDIS_REST_TOKEN}",
      ],
    },
    "filesystem-ops": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"],
    },
    "git-integration": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "${workspaceFolder}"],
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
    },
  },
}
```

### Configuration Variables

| Variable               | Description                      | Example                                 |
| ---------------------- | -------------------------------- | --------------------------------------- |
| `${workspaceFolder}`   | Absolute path to workspace root  | `c:\Users\Alexa\Desktop\SandBox\comicr` |
| `${env:VARIABLE_NAME}` | Environment variable from `.env` | `${env:DATABASE_URL}`                   |

---

## Installation & Validation

### Automatic Installation (Recommended)

MCP servers are automatically installed via `npx -y` when first invoked by GitHub Copilot. No manual installation needed.

**Verification**:

1. Open VS Code in this workspace
2. Ensure GitHub Copilot is enabled
3. Open Copilot Chat panel
4. Type `@workspace` and check for MCP tools availability

### Manual Validation (Optional)

Test each MCP server individually:

#### 1. **nextjs-dev** Server

```bash
# Test Next.js server tools
npx -y @modelcontextprotocol/server-nextjs --workspace . --framework nextjs-16 --help
```

**Expected Output**: Help text showing available commands

#### 2. **typescript-enhanced** Server

```bash
# Test TypeScript analysis
npx -y @modelcontextprotocol/server-typescript --strict --workspace . --help
```

**Expected Output**: TypeScript server help with strict mode options

#### 3. **postgresql-database** Server

```bash
# Test PostgreSQL connection (requires DATABASE_URL in .env)
npx -y @modelcontextprotocol/server-postgres --connection-string "$DATABASE_URL" --help
```

**Expected Output**: PostgreSQL server help

**Connection Test**:

```bash
pnpm db:studio  # Opens Drizzle Studio - verifies DATABASE_URL is valid
```

#### 4. **redis-cache** Server

```bash
# Test Redis connection (requires Upstash credentials)
npx -y @modelcontextprotocol/server-redis --url "$UPSTASH_REDIS_REST_URL" --token "$UPSTASH_REDIS_REST_TOKEN" --help
```

**Expected Output**: Redis server help

**Connection Test**: Use test script in `scripts/test-redis.ts`

#### 5. **filesystem-ops** Server

```bash
# Test file system operations
npx -y @modelcontextprotocol/server-filesystem . --help
```

**Expected Output**: File system server help

**Validation**: Check if server can read workspace files via Copilot

#### 6. **git-integration** Server

```bash
# Test Git operations
npx -y @modelcontextprotocol/server-git . --help
```

**Expected Output**: Git server help

**Validation**: Ask Copilot to check git status or create a branch

#### 7. **sequential-thinking** Server

```bash
# Test sequential thinking server
npx -y @modelcontextprotocol/server-sequential-thinking --help
```

**Expected Output**: Sequential thinking server help

**Validation**: Ask Copilot to "think through" a complex problem step-by-step

#### 8. **context7** Server

```bash
# Test Context7 documentation server
npx -y @upstash/context7-mcp@latest --help
```

**Expected Output**: Context7 server help

**Validation**: Ask Copilot about latest library documentation (e.g., "What's new in Next.js 16?")

---

## Server Details

### 1. nextjs-dev

**Package**: `@modelcontextprotocol/server-nextjs`
**Purpose**: Provides Next.js 16-specific development tools

**Capabilities**:

- App Router file scaffolding (pages, layouts, loading, error)
- Server Action creation and validation
- Route handler generation
- Component creation with proper directives (`"use client"`, `"use server"`)
- Metadata configuration helpers
- Image optimization suggestions
- Font optimization helpers

**Configuration**:

- `--workspace`: Workspace root directory
- `--framework`: Set to `nextjs-16` for latest features
- `NODE_ENV=development`: Enables dev-specific features

**Example Usage**:

- "Create a new page at `/about` with metadata"
- "Generate a server action for creating a comic"
- "Create an error.tsx file for the (root) route group"

### 2. typescript-enhanced

**Package**: `@modelcontextprotocol/server-typescript`
**Purpose**: TypeScript strict mode analysis and refactoring

**Capabilities**:

- Strict type-checking across workspace
- Type inference suggestions
- Interface/type generation from usage
- Import optimization (remove unused, add missing)
- Type error diagnosis with fix suggestions
- Generic type constraint analysis

**Configuration**:

- `--strict`: Enable strict mode type-checking
- `--workspace`: Workspace root
- `TS_NODE_PROJECT`: Path to tsconfig.json

**Example Usage**:

- "Find all `any` types in src/dal/ and suggest proper types"
- "Generate TypeScript interface from this JSON"
- "Fix type errors in src/components/comics/comic-card.tsx"

### 3. postgresql-database

**Package**: `@modelcontextprotocol/server-postgres`
**Purpose**: PostgreSQL database operations and schema analysis

**Capabilities**:

- Execute SQL queries (SELECT, INSERT, UPDATE, DELETE)
- Schema introspection (tables, columns, indexes)
- Migration generation suggestions
- Query performance analysis (EXPLAIN)
- Data validation against schema
- Table relationship visualization

**Configuration**:

- `--connection-string`: PostgreSQL connection URL from DATABASE_URL
- `PGDATABASE`: Database name (comicwise)
- `PGSCHEMA`: Schema name (public)

**Example Usage**:

- "Show me all tables in the database"
- "Query all comics with rating > 4.5"
- "Explain the query plan for getComicsByGenre"
- "Create a migration to add isActive column to author table"

### 4. redis-cache

**Package**: `@modelcontextprotocol/server-redis`
**Purpose**: Redis cache management for Upstash Redis

**Capabilities**:

- Get/Set cache keys
- List all keys matching pattern
- Delete cache entries
- Check cache TTL (time-to-live)
- Monitor cache hit/miss ratios
- Flush cache (dev/test only)

**Configuration**:

- `--url`: Upstash Redis REST URL
- `--token`: Upstash Redis REST token

**Example Usage**:

- "Show me all cached comic keys"
- "Clear cache for comic ID 123"
- "What's the TTL for key `comics:trending`?"
- "List all cache keys starting with `user:`"

### 5. filesystem-ops

**Package**: `@modelcontextprotocol/server-filesystem`
**Purpose**: Advanced file system operations

**Capabilities**:

- Read/write files with encoding support
- Create directories recursively
- Move/rename files and folders
- Delete files with safety checks
- Search files by content (grep)
- File tree visualization
- Symbolic link creation

**Configuration**:

- First argument: Workspace root directory

**Example Usage**:

- "Create a new directory at src/features/notifications"
- "Move all .test.ts files to tests/unit/"
- "Find all files containing 'use-toast' import"
- "Show me the file tree of src/components/"

### 6. git-integration

**Package**: `@modelcontextprotocol/server-git`
**Purpose**: Git version control operations

**Capabilities**:

- Check git status
- Create/switch branches
- Commit changes with message
- View commit history
- Show file diffs
- Create/manage tags
- Remote operations (fetch, push, pull)

**Configuration**:

- First argument: Repository root directory

**Example Usage**:

- "Show me uncommitted changes"
- "Create a new branch for Phase 1 implementation"
- "Commit these changes with message: 'Phase 1: Environment & TypeScript Fixes - Tasks 16, 1-3 ✅'"
- "Show the last 10 commits"

### 7. sequential-thinking

**Package**: `@modelcontextprotocol/server-sequential-thinking`
**Purpose**: Step-by-step complex problem-solving

**Capabilities**:

- Break down complex tasks into steps
- Track thought process with branching
- Revise previous reasoning when new info emerges
- Generate hypothesis and verify iteratively
- Maintain context across multi-step solutions

**Configuration**: No special configuration needed

**Example Usage**:

- "Think through the best way to implement parallel execution for Phase 2 tasks"
- "Help me reason about the optimal caching strategy for comic images"
- "Analyze the trade-offs between soft delete and hard delete for user accounts"

### 8. context7

**Package**: `@upstash/context7-mcp`
**Purpose**: Up-to-date library and framework documentation

**Capabilities**:

- Query latest documentation for any library/framework
- Get code examples from official docs
- Find migration guides (e.g., Next.js 15 → 16)
- Search API references for specific functions
- Retrieve best practices from official sources

**Configuration**: No special configuration needed (uses Upstash Context7 API)

**Example Usage**:

- "What's the latest Next.js 16 App Router metadata API?"
- "Show me examples of Drizzle ORM migrations"
- "How do I use NextAuth v5 with custom providers?"
- "Find the latest best practices for Zod schema validation"

---

## Troubleshooting

### Common Issues

#### Issue: "MCP server not found" or "npx command failed"

**Symptoms**:

- Copilot shows "MCP server xyz is not available"
- `npx -y @modelcontextprotocol/server-xyz` fails

**Solutions**:

1. **Check Node.js version**:

   ```bash
   node --version  # Should be v20.x.x or higher
   ```

   If < 20, install latest Node.js from [nodejs.org](https://nodejs.org)

2. **Clear npx cache**:

   ```bash
   npx clear-npx-cache
   # Or manually:
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"
   ```

3. **Reinstall package globally** (last resort):
   ```bash
   npm install -g @modelcontextprotocol/server-nextjs
   ```

#### Issue: "Database connection failed" (postgresql-database)

**Symptoms**:

- Error: "could not connect to server"
- Error: "FATAL: password authentication failed"

**Solutions**:

1. **Verify DATABASE_URL**:

   ```bash
   pnpm validate:env  # Checks if DATABASE_URL is valid format
   ```

2. **Test connection manually**:

   ```bash
   pnpm db:studio  # Opens Drizzle Studio - should connect without errors
   ```

3. **Check PostgreSQL server status** (if local):

   ```bash
   # Windows
   Get-Service postgresql*

   # Linux/Mac
   sudo service postgresql status
   ```

4. **Verify Neon/remote DB is accessible**:
   - Check [console.neon.tech](https://console.neon.tech) for database status
   - Verify IP whitelist allows your current IP

#### Issue: "Redis connection timeout" (redis-cache)

**Symptoms**:

- Error: "connection timeout"
- Error: "invalid token"

**Solutions**:

1. **Verify Upstash credentials**:

   ```bash
   pnpm validate:env  # Checks UPSTASH_REDIS_* vars
   ```

2. **Test connection** (create test script if needed):

   ```javascript
   // scripts/test-redis.ts
   import { Redis } from '@upstash/redis'
   const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL!,
     token: process.env.UPSTASH_REDIS_REST_TOKEN!
   })
   const result = await redis.ping()
   console.log('Redis ping:', result)  // Should print "PONG"
   ```

3. **Check Upstash dashboard**:
   - Visit [console.upstash.com](https://console.upstash.com)
   - Verify database is active and not over quota

#### Issue: "Git operations fail" (git-integration)

**Symptoms**:

- Error: "not a git repository"
- Error: "git command not found"

**Solutions**:

1. **Verify Git installation**:

   ```bash
   git --version  # Should show Git version 2.30+
   ```

2. **Initialize Git repo** (if not done):

   ```bash
   git init
   git remote add origin <your-repo-url>
   ```

3. **Check Git config**:
   ```bash
   git config --list
   # Should show user.name and user.email
   ```

#### Issue: "TypeScript server errors" (typescript-enhanced)

**Symptoms**:

- Error: "tsconfig.json not found"
- Error: "Cannot find module 'typescript'"

**Solutions**:

1. **Verify TypeScript installation**:

   ```bash
   pnpm list typescript  # Should show version 5.x
   ```

2. **Reinstall TypeScript**:

   ```bash
   pnpm add -D typescript
   ```

3. **Check tsconfig.json exists**:
   ```bash
   Test-Path tsconfig.json  # Should return True
   ```

#### Issue: "Context7 slow or not responding"

**Symptoms**:

- Queries to context7 timeout
- No documentation results returned

**Solutions**:

1. **Check internet connection** (Context7 requires internet)
2. **Try smaller queries** (don't query for entire docs, be specific)
3. **Use fallback**: Visit official docs manually if Context7 is down

### Logging and Diagnostics

**Enable MCP debug logging** (add to `.vscode/settings.json`):

```json
{
  "mcp.logLevel": "debug",
  "mcp.showTrace": true
}
```

**View MCP server logs**:

- Logs are written to VS Code Output panel
- Select "MCP Servers" from dropdown

**Manual MCP server test**:

```bash
# Test each server with --help flag
npx -y @modelcontextprotocol/server-nextjs --help
npx -y @modelcontextprotocol/server-typescript --help
# ... etc for all 8 servers
```

---

## Advanced Configuration

### Timeout and Caching (Recommended for Phase 2, Task 14)

**Add to `.vscode/mcp.json`** (optimize performance):

```jsonc
{
  "servers": {
    "nextjs-dev": {
      // ... existing config ...
      "timeout": 30000, // 30 second timeout
      "cacheResponses": true, // Cache tool responses
    },
    "typescript-enhanced": {
      // ... existing config ...
      "timeout": 60000, // 60 seconds for large codebases
      "cacheResponses": true,
    },
    // ... repeat for other servers
  },
  "globalSettings": {
    "defaultTimeout": 30000,
    "enableCaching": true,
    "maxCacheSize": 100, // MB
  },
}
```

### Custom Environment Variables per Server

**Example**: Different DATABASE_URL for testing vs development

```jsonc
{
  "servers": {
    "postgresql-database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "--connection-string", "${env:DATABASE_URL}"],
      "env": {
        "PGDATABASE": "comicwise",
        "PGSCHEMA": "public",
        "PGSSLMODE": "require", // Force SSL for production
      },
    },
  },
}
```

### Conditional Server Activation

**Use profiles** (not yet in spec, but planned):

```jsonc
{
  "profiles": {
    "development": [
      "nextjs-dev",
      "typescript-enhanced",
      "filesystem-ops",
      "git-integration",
      "sequential-thinking",
      "context7",
    ],
    "testing": ["postgresql-database", "redis-cache", "typescript-enhanced"],
    "production": [], // No MCP servers in production
  },
  "activeProfile": "development",
}
```

### Security Considerations

**Best Practices**:

1. **Never commit `.env` file** - use `.env.example` instead
2. **Use Upstash Redis** (serverless) instead of local Redis in production
3. **Restrict database user permissions** - MCP servers should use read-only user for queries
4. **Enable SSL** for PostgreSQL connections: `?sslmode=require` in DATABASE_URL
5. **Rotate tokens regularly** - especially Upstash Redis tokens and database passwords

**Example Read-Only Database User**:

```sql
-- Create read-only user for MCP server
CREATE ROLE mcp_readonly LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE comicwise TO mcp_readonly;
GRANT USAGE ON SCHEMA public TO mcp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mcp_readonly;

-- Use this in .env for MCP server:
-- MCP_DATABASE_URL="postgresql://mcp_readonly:secure_password@host:port/comicwise"
```

---

## Validation Checklist

After configuring MCP servers, verify:

- [ ] All 8 servers listed in `.vscode/mcp.json`
- [ ] Environment variables set in `.env` (DATABASE*URL, UPSTASH_REDIS*\*)
- [ ] Node.js version >= 20.x
- [ ] pnpm version >= 9.x
- [ ] PostgreSQL accessible (test with `pnpm db:studio`)
- [ ] Upstash Redis accessible (test with ping script)
- [ ] Git initialized and configured
- [ ] TypeScript installed (`pnpm list typescript`)
- [ ] VS Code with GitHub Copilot extension installed
- [ ] MCP servers show in Copilot Chat `@workspace` tools
- [ ] Test each server with sample query in Copilot Chat
- [ ] No timeout or connection errors in VS Code Output > MCP Servers

---

## Appendix: Quick Reference

### MCP Server Commands Cheat Sheet

```bash
# Install/update all MCP servers (happens automatically via npx)
# No manual installation needed

# Test individual servers
npx -y @modelcontextprotocol/server-nextjs --help
npx -y @modelcontextprotocol/server-typescript --help
npx -y @modelcontextprotocol/server-postgres --help
npx -y @modelcontextprotocol/server-redis --help
npx -y @modelcontextprotocol/server-filesystem --help
npx -y @modelcontextprotocol/server-git --help
npx -y @modelcontextprotocol/server-sequential-thinking --help
npx -y @upstash/context7-mcp@latest --help

# Validate environment
pnpm validate:env

# Test database connection
pnpm db:studio

# Test Redis connection (create script first)
pnpm tsx scripts/test-redis.ts

# View MCP server logs (VS Code Output panel → MCP Servers)
# No CLI command, use VS Code UI
```

### Environment Variables Quick Reference

```bash
# Required for MCP servers
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Recommended for full functionality
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED="1"
SENTRY_DSN="https://..."
```

### Copilot Chat Example Queries

**Next.js Server**:

- "@workspace create a new page at /about with metadata"
- "@workspace generate a server action for bookmark creation"

**TypeScript Server**:

- "@workspace find all `any` types in src/dal/ and suggest fixes"
- "@workspace generate interface from this JSON"

**PostgreSQL Server**:

- "@workspace show all comics with rating > 4.5"
- "@workspace explain the author table schema"

**Redis Server**:

- "@workspace list all cache keys for comics"
- "@workspace clear cache for comic ID 123"

**File System Server**:

- "@workspace create directory src/features/notifications"
- "@workspace show me the file tree of src/components/"

**Git Server**:

- "@workspace create branch phase-1-implementation"
- "@workspace show uncommitted changes"

**Sequential Thinking Server**:

- "@workspace think through the best caching strategy for comic images"
- "@workspace analyze trade-offs for soft delete vs hard delete"

**Context7 Server**:

- "@workspace what's new in Next.js 16 App Router?"
- "@workspace show examples of Drizzle ORM migrations"

---

## Need Help?

**Issues with MCP servers**: Check [Troubleshooting](#troubleshooting) section above
**Environment configuration**: See [Environment Variables](#environment-variables)
**Server-specific questions**: See [Server Details](#server-details)
**General questions**: Ask in GitHub Copilot Chat with `@workspace`

**External Resources**:

- [Model Context Protocol Docs](https://modelcontextprotocol.io)
- [VS Code MCP Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp)
- [Upstash Redis Console](https://console.upstash.com)
- [Neon PostgreSQL Console](https://console.neon.tech)

---

## Enhanced Usage Patterns

Maximizing the potential of your existing 8 MCP servers:

### **Advanced Combinations**

#### **Test Development Workflow**

Combine multiple servers for comprehensive test development:

```typescript
// Using sequential-thinking + filesystem-ops + typescript-enhanced
// 1. @workspace analyze this component for test coverage gaps
// 2. @workspace use sequential thinking to plan comprehensive test suite
// 3. @workspace generate test files using filesystem operations
// 4. @workspace validate TypeScript interfaces for test data
```

#### **Code Analysis Pipeline**

```typescript
// Using git-integration + typescript-enhanced + context7
// 1. @workspace show recent changes using git integration
// 2. @workspace analyze TypeScript changes for breaking changes
// 3. @workspace look up latest best practices with context7
// 4. @workspace suggest refactoring approaches with sequential thinking
```

#### **Database Development Cycle**

```typescript
// Using postgresql-database + filesystem-ops + nextjs-dev
// 1. @workspace query database to understand current schema
// 2. @workspace create migration files using filesystem operations
// 3. @workspace generate Next.js API routes for new endpoints
// 4. @workspace validate changes with TypeScript analysis
```

### **Server-Specific Advanced Features**

#### **nextjs-dev Server - Advanced Usage**

- **Dynamic Route Generation**: Create parameterized routes with proper TypeScript types
- **Metadata Optimization**: Generate SEO-optimized metadata for comic pages
- **Server Action Patterns**: Create type-safe server actions with error handling
- **Image Optimization**: Generate responsive image components with ImageKit integration

**Example Queries**:

- "@workspace create a dynamic route for /comics/[id] with proper metadata"
- "@workspace generate a server action for rating submission with validation"
- "@workspace optimize this component for Next.js 16 App Router patterns"

#### **typescript-enhanced Server - Advanced Usage**

- **Schema Generation**: Generate TypeScript interfaces from Zod schemas
- **Type Guards**: Create runtime type validation functions
- **Generic Utilities**: Build reusable type-safe utility functions
- **Performance Analysis**: Identify type-related performance bottlenecks

**Example Queries**:

- "@workspace generate TypeScript types from this Zod schema"
- "@workspace create type guards for runtime validation"
- "@workspace optimize these types for better inference"

#### **filesystem-ops Server - Advanced Usage**

- **Batch Operations**: Process multiple files with consistent transformations
- **Template Generation**: Create file templates for common patterns
- **Code Migration**: Move and refactor code across directory structures
- **Log Analysis**: Parse and analyze log files for debugging

**Example Queries**:

- "@workspace move all .test.ts files to tests/unit/ maintaining structure"
- "@workspace create component template with props interface"
- "@workspace analyze error logs and group by error type"

#### **sequential-thinking Server - Advanced Usage**

- **Architecture Planning**: Break down complex feature implementations
- **Problem Diagnosis**: Systematically debug complex issues
- "@workspace think through the best caching strategy for comic images"
- "@workspace analyze trade-offs between client and server state management"

#### **context7 Server - Advanced Usage**

- **Migration Guides**: Find upgrade paths for dependencies
- **Best Practices**: Research latest patterns for specific use cases
- **API Documentation**: Get up-to-date API references
- **Example Code**: Find working examples for complex implementations

**Example Queries**:

- "@workspace show me the latest Next.js 16 caching patterns"
- "@workspace find Drizzle ORM examples for complex queries"
- "@workspace get migration guide from NextAuth v4 to v5"

### **Integration Scripts**

Leverage existing MCP servers through custom integration scripts:

```bash
# Playwright functionality via existing servers
pnpm mcp:playwright generate "comic-reader-flow"
pnpm mcp:playwright analyze tests/e2e/reader.spec.ts
pnpm mcp:playwright suggest

# Vitest functionality
pnpm mcp:vitest generate src/schemas/comic.schema.ts
pnpm mcp:vitest coverage
pnpm mcp:vitest validate tests/unit/schemas/comic.test.ts

# GitHub workflow automation
pnpm mcp:github pr-description main
pnpm mcp:github workflow-check
pnpm mcp:github issue-create feature
```

---

## Missing MCP Servers Wishlist

**Status**: These packages were verified as not available in npm registry as of February 2026.

### **High Priority (Requested for Development)**

#### **@modelcontextprotocol/server-playwright**

- **Purpose**: Playwright test generation and debugging
- **Would Enable**:
  - Generate E2E tests from user flow descriptions
  - Auto-fix failing test selectors
  - Suggest accessibility improvements (WCAG 2.1 AA)
  - Analyze test coverage gaps
- **Current Workaround**: Use `scripts/mcp-integrations/playwright-integration.ts`
- **Alternatives**: Direct Playwright API integration

#### **@modelcontextprotocol/server-vitest**

- **Purpose**: Vitest test generation and analysis
- **Would Enable**:
  - Generate unit tests from TypeScript source
  - Analyze test coverage and suggest improvements
  - Auto-fix test structure and assertions
  - Validate test quality and patterns
- **Current Workaround**: Use `scripts/mcp-integrations/vitest-integration.ts`
- **Alternatives**: Custom AST analysis with TypeScript compiler API

#### **@modelcontextprotocol/server-sentry**

- **Purpose**: Sentry error tracking and performance monitoring
- **Would Enable**:
  - Query error trends and stack traces
  - Analyze performance metrics
  - Create/update Sentry issues from code
  - Link deployments to error resolution
- **Current Workaround**: Direct Sentry API integration
- **Alternatives**: Use `@sentry/cli` and REST API

#### **@modelcontextprotocol/server-github**

- **Purpose**: GitHub integration for issues, PRs, and workflows
- **Would Enable**:
  - Create issues and PRs from code analysis
  - Manage GitHub Actions workflows
  - Analyze repository metrics and insights
  - Automate project board updates
- **Current Workaround**: Use `scripts/mcp-integrations/github-integration.ts`
- **Alternatives**: Use `@octokit/rest` and GitHub CLI

### **Medium Priority (Nice to Have)**

#### **@modelcontextprotocol/server-imagekit** or **@modelcontextprotocol/server-media**

- **Purpose**: ImageKit CDN management and image optimization
- **Would Enable**:
  - Upload and optimize comic images
  - Generate responsive image URLs
  - Analyze CDN performance metrics
  - Manage image transformations
- **Alternatives**: Direct ImageKit API integration

#### **@modelcontextprotocol/server-drizzle** or **@modelcontextprotocol/server-orm**

- **Purpose**: Enhanced ORM operations and migrations
- **Would Enable**:
  - Generate migrations from schema changes
  - Optimize query performance
  - Validate database relationships
  - Suggest indexing strategies
- **Alternatives**: Continue using `postgresql-database` + `typescript-enhanced`

### **Low Priority (Future Consideration)**

#### **@modelcontextprotocol/server-vercel**

- **Purpose**: Vercel deployment and monitoring integration
- **Alternatives**: Use Vercel CLI and API directly

#### **@modelcontextprotocol/server-stripe**

- **Purpose**: Payment processing and subscription management
- **Alternatives**: Direct Stripe API integration

### **Community Alternatives**

If official packages become available, also consider:

- Community-built MCP servers
- Organization-specific custom servers
- Third-party integrations

### **Building Custom MCP Servers**

For missing functionality, consider building custom MCP servers:

```typescript
// Example: Custom Playwright MCP server structure
// src/mcp-servers/playwright-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Custom implementation for project-specific needs
```

**Resources for Custom Development**:

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Example MCP Servers](https://github.com/modelcontextprotocol/servers)

### **Migration Plan**

When missing packages become available:

1. **Verify packages exist**: Run `pnpm verify:mcp` to check availability
2. **Test integration**: Add to development environment first
3. **Update configuration**: Add to `.vscode/mcp.json` following existing patterns
4. **Migrate scripts**: Replace integration scripts with native MCP functionality
5. **Update documentation**: Document new server capabilities
6. **Validate stability**: Ensure no regressions with existing 8 servers

---

_Last Updated: 2026-02-02 - Added enhanced usage patterns and missing packages wishlist_
