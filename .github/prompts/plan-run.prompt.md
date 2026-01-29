Plan: ComicWise Memory Bank + Placeholder Files

Objective

Create safe backups and placeholder Memory Bank files, Copilot processing file, and a local .env template so the repository has the required scaffolding for the next implementation phases (seed helpers, lint/type fixes, Docker updates).

Scope

- Create `.backup/` snapshots for any existing files that would be replaced.
- Create `memory-bank/` directory with core artifacts: `projectbrief.md`, `productContext.md`, `techContext.md`, `systemPatterns.md`, `activeContext.md`, `progress.md`.
- Create `memory-bank/tasks/_index.md` and `memory-bank/tasks/TASK001-initialize-memory-bank.md`.
- Create `Copilot-Processing.md` at repo root.
- Create `.env` placeholder file (template) — DO NOT COMMIT real secrets.

Why

These scaffolding files are required by the agent instructions (Memory Bank + Copilot logging) and provide a safe place to document scope, technical context, and the incremental TODOs for the larger refactor and seeding work.

High-level Steps (what I'll do when run locally)

1. Create `.backup/` and back up existing targets (if any).
2. Create `memory-bank/` and `memory-bank/tasks/` directories.
3. Create placeholder markdown artifacts under `memory-bank/`.
4. Create `Copilot-Processing.md` and a safe `.env` template.
5. Verify files exist.
6. Run validations (instructions below).
7. Proceed to next phase (seed helpers) after you review and populate the Memory Bank content.

PowerShell Commands (copy-paste) — backups & creation

# create backup folder and backup existing target files
```powershell
New-Item -Path .backup -ItemType Directory -Force
$ts = (Get-Date).ToString('yyyyMMddHHmmss')
if (Test-Path 'Copilot-Processing.md') { Copy-Item 'Copilot-Processing.md' ".backup/Copilot-Processing.md.$ts" -Force }
if (Test-Path '.env') { Copy-Item '.env' ".backup/env.$ts" -Force }
if (Test-Path 'memory-bank') { Copy-Item -Path 'memory-bank' -Destination ".backup/memory-bank.$ts" -Recurse -Force }

# create directories
New-Item -Path memory-bank -ItemType Directory -Force
New-Item -Path memory-bank\tasks -ItemType Directory -Force

# create placeholder files
@'
# Project Brief

Title: ComicWise

Purpose:
A short statement of why ComicWise exists.

Scope:
- In-scope: Next.js app, Postgres, Redis, seed system, admin UI
- Out-of-scope: third-party hosted services specifics

Success Criteria:
- All type checks and strict linting pass
- Seeders produce predictable public-root image URLs

Stakeholders:
- Owner: <name>
- Maintainers: <team/emails>

CreatedDate: 2026-01-23
'@ | Set-Content -Path memory-bank\projectbrief.md -Force

@'
# Product Context

ProblemStatement:
Describe the user problems ComicWise solves.

Users:
- Reader
- Creator
- Admin

UserGoals:
- Browse and read comics easily
- Creators upload/manage content
- Admins moderate and manage data

HighLevelFlows:
1. User signs in -> browse comics -> read chapter -> bookmark
2. Creator uploads comic -> images saved to public/comics -> metadata inserted via seeder

Constraints:
- Next.js 16 App Router
- Performance & SEO
'@ | Set-Content -Path memory-bank\productContext.md -Force

@'
# Technical Context

TechStack:
- Next.js 16, React 19, TypeScript, Drizzle ORM, PostgreSQL, Redis, pnpm, Tailwind

Runtime/OS:
- Dev: Windows (PowerShell), Linux CI

DevSetup:
- pnpm install
- copy .env.example -> .env and fill secrets
- pnpm dev

CI/CDNotes:
- Use GitHub Actions jobs for type-check, lint, build, seed-dry-run

CriticalDeps:
- DATABASE_URL, REDIS_URL, SMTP_* (not checked into repo)
'@ | Set-Content -Path memory-bank\techContext.md -Force

@'
# System Patterns

ArchitectureOverview:
Server components: Next.js server components + server actions, Drizzle for DB access, Redis for caching.

Components:
- src/app (routes & pages)
- src/lib (actions, nodemailer, seed helpers)
- src/database (drizzle init, seeders)

DataFlow:
1. Seed JSON -> seedHelpers validate -> download images -> save to public/comics -> insert rows via Drizzle.

DecisionRecords:
- Use public/ for static image serving to match Next.js public-root convention.
'@ | Set-Content -Path memory-bank\systemPatterns.md -Force

@'
# Active Context

CurrentFocus:
- Stabilize seeders, standardize public image paths, fix strict lint errors.

RecentChanges:
- Validation output analyzed; seed-runner identified at src/database/seed/seed-runner-v4enhanced.ts

NextSteps:
- Create seed helper placeholders next
- Add .env.example and document required secrets

Blockers:
- .env values not available here (ensure local .env before DB runs)
'@ | Set-Content -Path memory-bank\activeContext.md -Force

@'
# Progress

WhatWorks:
- Drizzle ORM present
- Seed system files exist

Outstanding:
- Implement seed helpers (dedupe, hasher)
- Fix eslint/ts errors

KnownIssues:
- html/ folder missing (requested)
- setup.txt missing

LastUpdated: 2026-01-23
'@ | Set-Content -Path memory-bank\progress.md -Force

@'
# Tasks Index

## In Progress
- [TASK001] Initialize Memory Bank - In Progress

## Pending
- [TASK002] Seed helper implementation - Pending

## Completed
- (none)
'@ | Set-Content -Path memory-bank\tasks\_index.md -Force

@'
# [TASK001] Initialize Memory Bank

**Status:** In Progress
**Added:** 2026-01-23
**Updated:** 2026-01-23

## Original Request
Initialize memory bank files and tracking for project onboarding.

## Implementation Plan
- Create memory-bank files: projectbrief.md, productContext.md, techContext.md, systemPatterns.md, activeContext.md, progress.md
- Create tasks index and initial task file

## Progress Log
- Files created as placeholders; manual edits required.
'@ | Set-Content -Path memory-bank\tasks\TASK001-initialize-memory-bank.md -Force

@'
# Copilot Processing

UserRequestSummary:
Initialize memory-bank placeholders and environment template for ComicWise.

PhaseStatus:
- Phase1: Initialization (placeholders created)
- Phase2: Planning (next)

ActionPlanBullets:
- Create seed helper placeholders next
- Add .env.example and document required secrets
'@ | Set-Content -Path Copilot-Processing.md -Force

@'
# Local environment placeholder (DO NOT COMMIT!)
# Copy this file to .env and fill with real secrets.

DATABASE_URL=postgres://postgres:postgres@localhost:5432/comicwise
REDIS_URL=redis://localhost:6379
CUSTOM_PASSWORD=ChangeMePlease!
SMTP_HOST=smtp.example.com
SMTP_USER=you@example.com
SMTP_PASS=secret
'@ | Set-Content -Path .env -Force
```

Verification commands (list created files)
```powershell
Get-ChildItem -Path memory-bank -Recurse | Select-Object FullName
Test-Path Copilot-Processing.md
Test-Path .env
```

Validation commands (run after you verify placeholders):
```powershell
pnpm install
pnpm run type-check
pnpm run lint:strict
pnpm run db:seed:dry-run
docker compose build --progress=plain
```

Manual edits required (open and paste final content):
- `memory-bank/projectbrief.md`
- `memory-bank/productContext.md`
- `memory-bank/techContext.md`
- `memory-bank/systemPatterns.md`
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`
- `memory-bank/tasks/_index.md`
- `memory-bank/tasks/TASK001-initialize-memory-bank.md`
- `Copilot-Processing.md`
- `.env` (fill secrets locally, do NOT commit)

Next actions after you run validations
- I will scaffold seed helpers (password-hasher, image-downloader, image-deduplicator, image-path-config) and iterate on lint/type fixes.

Notes
- Do NOT commit the `.env` file; instead use `.env.example` for repo. Replace `.env` with local secrets only.
- After validations, share outputs (type-check and lint) and I will proceed to the next phase.
