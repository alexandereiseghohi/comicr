# Tasks to Prompt: Comprehensive Breakdown

This file documents all phases, tasks, subtasks, and actions from the ComicWise (comicr) comprehensive plan, prompt engineering framework, and repo setup/validation workflow. Use this as a reference for execution, refinement, and automation.

---

## Phase 1: Foundation & Environment

- **Tasks:**
  - Prerequisites & Environment Setup
    - Subtasks:
      - Validate Node.js, pnpm, VS Code, MCP
      - Ensure `.env.template` and `.env.local` exist and are correct
      - Reference `src/lib/env.ts` for required/optional vars
      - Validate `drizzle.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
      - Check `public/`, `data/`, `scripts/`, `src/` structure
    - Actions:
      - Run `pnpm install`, `pnpm db:push`, `pnpm db:seed`, `pnpm dev`, `pnpm validate`
      - Confirm all scripts/configs present

---

## Phase 2: Architecture & Data Flow

- **Tasks:**
  - Enforce 3-layer pattern (Schema, Database, Action)
    - Subtasks:
      - Validate Zod schemas in `src/schemas/`
      - Confirm Drizzle queries/mutations in `src/database/`
      - Ensure all mutations/queries go through server actions in `src/lib/actions/`
      - Check data flow: UI → Server Action → DAL → Drizzle → PostgreSQL
    - Actions:
      - Review `docs/architecture.md`, `src/lib/actions/`, `src/database/`
      - Validate naming conventions

---

## Phase 3: RBAC & Security

- **Tasks:**
  - Role-Based Access Control & Security
    - Subtasks:
      - Validate roles: `user`, `moderator`, `admin` (see `docs/rbac.md`)
      - Ensure audit logging for sensitive actions
      - Enforce Zod validation for all inputs
      - Confirm consistent error shape `{ ok: false, error: { code, message } }`
      - Enforce soft delete for users/comments with children
    - Actions:
      - Review `docs/rbac.md`, `src/lib/actions/`, audit table
      - Check for `verifyAdmin()` usage

---

## Phase 4: MCP & Tooling

- **Tasks:**
  - MCP Server & VS Code Tooling
    - Subtasks:
      - Validate MCP server config (`.vscode/mcp.json`)
      - Ensure VS Code extensions in `.vscode/extensions.json`
      - Confirm scripts for MCP validation (`scripts/verify-mcp-servers.ps1`, `scripts/verify-vscode-config.ps1`)
    - Actions:
      - Run MCP validation scripts
      - Check extension installation

---

## Phase 5: Development & Validation Workflow

- **Tasks:**
  - Setup, DB, Code Quality, CI/CD
    - Subtasks:
      - Validate setup scripts (`scripts/setup-env.ts`, `scripts/setup-api.ts`, etc.)
      - Confirm DB migration, seeding, and studio access
      - Enforce code quality: lint, type-check, test, E2E
      - Validate CI/CD pipeline
    - Actions:
      - Run `pnpm db:push`, `pnpm db:seed`, `pnpm db:studio`, `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm test:e2e`, `pnpm validate`
      - Review `docs/deployment.md`, `docs/runbook.md`

---

## Phase 6: Prompt Safety & AI Agent Instructions

- **Tasks:**
  - Review Prompt/Instructions Files
    - Subtasks:
      - Validate `.github/copilot-instructions.md`, `refactor.prompt.md`, `COMICWISE-COMPREHENSIVE-PLAN.md`, `AGENTS.md`
      - Ensure prompt safety review template is applied
      - Confirm actionable, phase-based project plan
    - Actions:
      - Review and optimize prompt/instructions files
      - Apply safety review template

---

## Phase 7: Gap Analysis & Script Generation

- **Tasks:**
  - Compare Plan/Code, Generate Missing
    - Subtasks:
      - Identify missing scripts/configs/docs
      - Generate or update scripts/configs as needed
      - Validate all references in plan match repo
    - Actions:
      - Run file/grep searches
      - Create/update scripts/configs

---

## Phase 8: Validation Gates & Parallelization

- **Tasks:**
  - Verify Validation Gates & Parallelization Clusters
    - Subtasks:
      - Confirm validation gates in scripts, actions, workflows
      - Validate parallelization clusters for automation
    - Actions:
      - Review scripts, workflows, CI/CD
      - Test validation gates and parallelization

---

## Phase 9: Code Samples & Automation

- **Tasks:**
  - Verify Scripts, .env, Code Samples
    - Subtasks:
      - Ensure all code samples in plan are present and valid
      - Confirm scripts for automation and validation
      - Validate `.env.template`, `.env.local`, `src/lib/env.ts`
    - Actions:
      - Review scripts, env files, code samples
      - Test automation scripts

---

## Phase 10: Verification Checklist

- **Tasks:**
  - All Checks Green: Conventions, CI/CD, RBAC
    - Subtasks:
      - Validate repo conventions, CI/CD, RBAC enforcement
      - Confirm all checks pass (`pnpm validate`)
      - Ensure all documentation is up to date
    - Actions:
      - Run validation commands
      - Review documentation

---

## Phase 11: Advanced Prompt Safety Review

- **Tasks:**
  - Apply Template, Analyze Prompts
    - Subtasks:
      - Apply advanced prompt safety review template to all prompts
      - Analyze prompt/instructions files for safety, clarity, and actionability
    - Actions:
      - Review and optimize prompt/instructions files
      - Document findings and improvements

---

## Phase 12: References & Further Reading

- **Tasks:**
  - Ensure All Docs and Links Present
    - Subtasks:
      - Validate presence of all referenced docs (`docs/architecture.md`, `docs/rbac.md`, `docs/deployment.md`, etc.)
      - Confirm links to further reading, references, and external resources
    - Actions:
      - Review documentation and links
      - Update references as needed

---

# Detailed Breakdown: Actions by Phase

Each phase includes:

- **Tasks:** High-level objectives
- **Subtasks:** Specific steps to achieve tasks
- **Actions:** Concrete operations, commands, or reviews

Use this file to track progress, validate completion, and refine the plan for future automation and optimization.

---

**Generated on: 2026-02-12**
**Repo: comicr**
**Branch: main**
