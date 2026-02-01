---
title: ComicWise - GitHub Copilot Prompts Index
version: 3.0.0
updated: 2026-02-01
---

# 📚 ComicWise - GitHub Copilot Prompts Directory

> **Complete guide to the consolidated prompt system for ComicWise project**

---

## ⭐ Quick Start

```bash
# Primary entry point - contains ALL project context
@.github/prompts/master.prompt.md

# See current progress
@memory-bank/progress.md
```

---

## 📂 Prompt Structure (7 Files)

| File                                                 | Category     | Phase | Purpose                                    |
| ---------------------------------------------------- | ------------ | ----- | ------------------------------------------ |
| **[master.prompt.md](master.prompt.md)**             | Master       | All   | Single source of truth - use this first    |
| **[README.md](README.md)**                           | Index        | -     | This file - directory guide                |
| **[Setup.prompt.md](Setup.prompt.md)**               | Setup        | 1-2   | Environment, VS Code, 40 setup tasks       |
| **[features.prompt.md](features.prompt.md)**         | Features     | 3-5   | Profile, comic, chapter, bookmark features |
| **[database.prompt.md](database.prompt.md)**         | Database     | 3     | Schema, seeding, DAL patterns              |
| **[testing.prompt.md](testing.prompt.md)**           | Testing      | 7     | Vitest, Playwright, coverage targets       |
| **[optimization.prompt.md](optimization.prompt.md)** | Optimization | 6,8   | Performance, cleanup, caching              |

---

## 🎯 Which Prompt to Use?

| Task                  | Use This Prompt        |
| --------------------- | ---------------------- |
| Starting development  | master.prompt.md       |
| Environment setup     | Setup.prompt.md        |
| VS Code configuration | Setup.prompt.md        |
| Building features     | features.prompt.md     |
| Database work         | database.prompt.md     |
| Writing tests         | testing.prompt.md      |
| Performance tuning    | optimization.prompt.md |
| Code cleanup          | optimization.prompt.md |

---

## 📋 Phase Overview

```
Phase 1: Foundation ──► Setup.prompt.md
Phase 2: Database ────► database.prompt.md
Phase 3: User Features ► features.prompt.md
Phase 4: Comic Features ► features.prompt.md
Phase 5: Admin Features ► features.prompt.md
Phase 6: Performance ──► optimization.prompt.md
Phase 7: Testing ─────► testing.prompt.md
Phase 8: Documentation ► master.prompt.md
Phase 9: Deployment ──► master.prompt.md
```

---

## 🚀 Getting Started

### New Developer Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local

# 3. Initialize database
pnpm db:push && pnpm db:seed

# 4. Start development
pnpm dev

# 5. Validate
pnpm validate
```

### Using Prompts in Copilot

```bash
# Reference master prompt
@.github/prompts/master.prompt.md

# Reference specific category
@.github/prompts/features.prompt.md

# Ask about specific task
"Show me Task 3.2 from features.prompt.md"
```

---

## 📊 Project Status

| Phase                   | Status         | Coverage |
| ----------------------- | -------------- | -------- |
| Phase 1: Foundation     | ✅ Complete    | 100%     |
| Phase 2: Database       | ✅ Complete    | 100%     |
| Phase 3: User Features  | ✅ Complete    | 100%     |
| Phase 4: Comic Features | ✅ Complete    | 100%     |
| Phase 5: Admin Features | ✅ Complete    | 100%     |
| Phase 6: Performance    | 🔧 In Progress | 80%      |
| Phase 7: Testing        | 🔧 In Progress | 80%      |
| Phase 8: Documentation  | 🔧 In Progress | 70%      |
| Phase 9: Deployment     | ⏳ Pending     | 30%      |

**Progress Tracking:** [memory-bank/progress.md](../../memory-bank/progress.md)

---

## 🔧 Common Commands

```bash
# Development
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm validate       # Run all validations

# Database
pnpm db:push        # Push schema
pnpm db:seed        # Seed database
pnpm db:studio      # Open Drizzle Studio

# Testing
pnpm test           # Run unit tests
pnpm test:e2e       # Run E2E tests
pnpm test:coverage  # Coverage report
```

---

## 📖 Related Resources

- **Memory Bank:** [../../memory-bank/](../../memory-bank/)
- **Instructions:** [../.github/instructions/](../../.github/instructions/)
- **Documentation:** [../../docs/](../../docs/)
- **Project README:** [../../README.md](../../README.md)

---

**Version:** 3.0.0 | **Updated:** 2026-02-01 | **Files:** 7 prompts
