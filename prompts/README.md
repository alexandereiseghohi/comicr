---
title: ComicWise - GitHub Copilot Prompts Index
version: 1.0.0
updated: 2026-01-22
---

# 📚 ComicWise - GitHub Copilot Prompts Index

> **Complete guide to all GitHub Copilot prompts for ComicWise project**

---

## 📋 Overview

This directory contains comprehensive GitHub Copilot prompts for setting up, configuring, and implementing the ComicWise project. All prompts follow Next.js 16 best practices and are tailored specifically for this project's architecture.

---

## 📂 Available Prompts

### 1. **Main Setup Prompt** (`mainsetup.prompt.md`)

**Purpose:** Complete setup and configuration of the ComicWise project

**Covers:**
- VS Code configuration (mcp.json, extensions.json, launch.json, tasks.json, settings.json)
- Configuration files optimization (next.config.ts, tsconfig.json, eslint.config.ts, etc.)
- Environment variables setup (.env.local, src/lib/env.ts, appConfig.ts)
- Database seeding system (helpers, seeders, orchestrator)
- API route updates
- Package.json scripts
- Validation and testing

**When to use:**
- Starting a fresh setup
- Re-configuring the project
- Troubleshooting configuration issues
- Setting up development environment

**Estimated time:** 4-6 hours

**Prerequisites:** Node.js 18+, PostgreSQL 15+, Redis

**Success criteria:**
- ✅ All VS Code configurations created
- ✅ All config files optimized
- ✅ Environment variables configured
- ✅ Database seeding working
- ✅ `pnpm validate` passes

---

### 2. **Main Tasks Prompt** (`maintasks.prompt.md`)

**Purpose:** Implement all remaining features and pages

**Covers:**
- User profile pages (view, edit, change password, settings)
- Comic listing page with filters
- Comic details page
- Chapter reader page
- Bookmarks page
- Home page enhancement
- Browse and genre pages
- Server actions validation
- Zod schemas verification
- Scripts optimization
- Error handling and loading states
- Image optimization
- Performance optimization
- Testing implementation
- CI/CD workflow setup
- Comprehensive documentation
- Final validation and cleanup

**When to use:**
- After completing main setup
- Implementing new features
- Extending existing features
- Improving application functionality

**Estimated time:** 2-3 weeks (depending on team size and complexity)

**Prerequisites:** Completion of mainsetup.prompt.md

**Success criteria:**
- ✅ All pages working and responsive
- ✅ No TypeScript errors
- ✅ All tests passing
- ✅ Build successful
- ✅ Database seeded
- ✅ Comprehensive documentation
- ✅ Ready for production deployment

---

## 🚀 Quick Start Guide

### For Initial Setup:

```bash
# 1. Start with Main Setup Prompt
# Copy content from mainsetup.prompt.md into GitHub Copilot

# 2. Follow all setup tasks:
pnpm install
cp .env.example .env.local
# Edit .env.local with your values

# 3. Run validation:
pnpm validate
pnpm db:seed:dry-run
pnpm db:seed

# 4. Verify success:
pnpm build
```

### For Continuing Development:

```bash
# 1. Use Main Tasks Prompt
# Copy content from maintasks.prompt.md into GitHub Copilot

# 2. Follow task-by-task implementation
# Test after each major feature

# 3. Run validation frequently:
pnpm validate
pnpm test
pnpm type-check

# 4. Commit progress regularly:
git add .
git commit -m "Completed Task X: Description"
git push
```

---

## 📖 Using These Prompts

### In GitHub Copilot CLI:

```bash
# Open GitHub Copilot Chat
copilot-cli

# Paste the entire prompt content
# Or use file reference:
@.github/prompts/mainsetup.prompt.md

# Ask for specific task:
"Complete Task 1: VS Code Configuration from mainsetup.prompt.md"
```

### In VS Code Copilot Extension:

1. Open `.github/prompts/mainsetup.prompt.md`
2. Open Copilot Chat (`Ctrl+Shift+I`)
3. Type: `@mainsetup Create optimized VS Code configuration files`
4. Copilot will reference the prompt file

### As Documentation:

- Reference specific sections for implementation guidance
- Use examples as templates for similar features
- Follow principles and best practices outlined
- Use completion checklists to verify work

---

## 🎯 Task Organization

### Mainsetup Tasks:

1. **VS Code Configuration** - Editor and debug setup
2. **Configuration Files** - Project-wide settings
3. **Environment Variables** - Secrets and configuration
4. **Database Seeding** - Data initialization system
5. **Validation & Testing** - Quality assurance

### Maintasks Tasks:

1. **User Profile** - Account management pages
2. **Comic Pages** - Comic listing and details
3. **Chapter Reader** - Reading experience
4. **Bookmarks** - Bookmark management
5. **Root Pages** - Home, browse, genre pages
6. **Server Actions** - Backend operations validation
7. **Zod Schemas** - Data validation schemas
8. **Scripts** - Development scripts
9. **Error Handling** - User-facing errors
10. **Image Optimization** - Performance
11. **Performance** - Speed and efficiency
12. **Testing** - Quality assurance
13. **CI/CD** - Automation and deployment
14. **Documentation** - Code and user docs
15. **Cleanup** - Final optimization

---

## 📋 Project Structure

```
.github/prompts/
├── mainsetup.prompt.md       # Setup and configuration tasks
├── maintasks.prompt.md       # Feature implementation tasks
├── README.md                 # This file
└── [other prompts as needed]

Project Structure:
├── src/
│   ├── app/                  # Next.js pages (Route Handlers)
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (root)/          # Public pages
│   │   ├── admin/           # Admin panel
│   │   └── api/             # API routes
│   ├── components/           # React components
│   ├── database/             # Database layer
│   │   ├── schema.ts        # Drizzle schema
│   │   └── seed/            # Seeding system
│   ├── dal/                  # Data access layer
│   ├── lib/                  # Utilities and helpers
│   │   ├── actions/         # Server actions
│   │   ├── auth.ts          # Authentication
│   │   ├── env.ts           # Environment variables
│   │   └── [utilities]
│   ├── schemas/              # Zod validation schemas
│   ├── stores/               # Zustand stores
│   └── styles/               # Global styles
├── scripts/                   # Automation scripts
├── .vscode/                   # Editor configuration
├── .github/
│   ├── workflows/            # GitHub Actions
│   └── prompts/              # This directory
├── docs/                      # Documentation
├── public/                    # Static assets
└── [config files]
```

---

## 🔗 Related Files

### Documentation:
- `README.md` - Project overview
- `docs/setup.md` - Detailed setup
- `docs/architecture.md` - System architecture
- `docs/api-reference.md` - API reference

### Configuration:
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.ts` - Linting rules
- `postcss.config.mjs` - CSS processing
- `.prettierrc.ts` - Code formatting
- `package.json` - Dependencies and scripts

### Environment:
- `.env.example` - Environment template
- `.env.local` - Local environment (git-ignored)
- `appConfig.ts` - Application configuration
- `src/lib/env.ts` - Environment variable schema

---

## ✅ Pre-Requisites Checklist

Before starting with prompts:

- ✅ Node.js 18+ installed (`node --version`)
- ✅ pnpm installed (`pnpm --version`)
- ✅ PostgreSQL 15+ running locally or remote
- ✅ Redis/Upstash configured
- ✅ GitHub Copilot CLI installed
- ✅ VS Code with Copilot extension (recommended)
- ✅ Git repository initialized
- ✅ GitHub account (for Copilot)

### Installation:
```bash
# Install pnpm
npm install -g pnpm

# Install GitHub Copilot CLI
pnpm install -g @github/copilot-cli

# Clone/Setup project
git clone <repository>
cd comicwise
pnpm install
```

---

## 🎯 Implementation Tips

### Best Practices:

1. **Follow DRY Principle**
   - Reuse components, functions, schemas
   - Extract common logic
   - Avoid code duplication

2. **Type Safety**
   - Never use `any` types
   - Use specific or generic types
   - Leverage TypeScript strict mode

3. **Error Handling**
   - Try-catch for async operations
   - User-friendly error messages
   - Proper error logging

4. **Performance**
   - Optimize images with Next.js Image
   - Lazy load below-fold components
   - Cache with Redis
   - Minimize bundle size

5. **Security**
   - No secrets in code
   - Input validation with Zod
   - Password hashing with bcryptjs
   - CSRF protection

6. **Testing**
   - Unit tests for logic
   - Integration tests for features
   - E2E tests for critical paths
   - Aim for 80%+ coverage

7. **Documentation**
   - JSDoc for all public APIs
   - Comments for complex logic
   - README with setup instructions
   - API documentation

### Common Commands:

```bash
# Development
pnpm dev              # Start dev server
pnpm type-check       # Check types
pnpm lint             # Check linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code

# Database
pnpm db:push          # Push schema
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:seed:dry-run  # Preview seed

# Testing & Quality
pnpm test             # Run tests
pnpm test:watch       # Tests in watch mode
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Coverage report
pnpm validate         # Run all validations

# Building & Production
pnpm build            # Build for production
pnpm start            # Start production server
pnpm analyze          # Analyze bundle size

# Maintenance
pnpm cleanup          # Clean up project
pnpm audit            # Security audit
```

---

## 🚨 Troubleshooting

### Issue: "Module not found" errors

**Solution:**
- Check import paths against tsconfig path aliases
- Verify file exists at specified path
- Check for typos in import statements

### Issue: TypeScript errors

**Solution:**
- Run `pnpm type-check` to see all errors
- Check error messages carefully
- Review type definitions and usage
- Use `as const` or specific types instead of `any`

### Issue: Database connection errors

**Solution:**
- Verify DATABASE_URL in .env.local
- Check PostgreSQL is running
- Test connection: `psql <DATABASE_URL>`
- Check Drizzle config in drizzle.config.ts

### Issue: Seeding fails

**Solution:**
- Run `pnpm db:seed:dry-run` first
- Check data in JSON files for validity
- Verify all foreign keys exist
- Check image URLs are accessible
- Review seed error logs carefully

### Issue: Build fails

**Solution:**
- Run `pnpm type-check` and `pnpm lint` first
- Check console for specific errors
- Review changes in last commit
- Clear .next directory: `rm -rf .next`
- Try `pnpm install` again

---

## 📞 Getting Help

### Resources:

- **Next.js Docs:** https://nextjs.org/docs
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Drizzle ORM:** https://orm.drizzle.team/docs
- **NextAuth.js:** https://next-auth.js.org/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **Zod:** https://zod.dev/
- **React Hook Form:** https://react-hook-form.com/

### Project-Specific:

- Check `docs/` directory for detailed guides
- Review `scripts/` for automation tools
- Examine existing implementations as examples
- Check git history for related changes

---

## 🔄 Updating Prompts

If you need to update these prompts:

1. Make changes to the appropriate `.prompt.md` file
2. Update version number in file header
3. Update this README if structure changes
4. Commit with clear message: `Update: [prompt-name] - [changes]`
5. Keep backward compatibility where possible

---

## 📊 Project Status

### Setup Status:
- [ ] Main Setup Prompt tasks completed
- [ ] All configurations validated
- [ ] Database seeding working

### Implementation Status:
- [ ] Main Tasks Prompt tasks completed
- [ ] All pages created
- [ ] All tests passing
- [ ] Documentation complete

### Deployment Status:
- [ ] Production build successful
- [ ] CI/CD pipelines working
- [ ] Deployment tested
- [ ] Monitoring configured

---

## 📝 Additional Notes

### Performance Metrics:
- **Lighthouse Score:** Target 90+
- **Core Web Vitals:** All green
- **Build Size:** < 500KB (gzipped)
- **First Contentful Paint:** < 2s
- **Test Coverage:** 80%+

### Security Checklist:
- [ ] No secrets in code/git
- [ ] Password hashing implemented
- [ ] Input validation with Zod
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] No known vulnerabilities

### Before Production Deployment:
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

## 🎉 Conclusion

These prompts provide a comprehensive guide to building, configuring, and deploying the ComicWise project. Follow them sequentially for best results, and refer back as needed during development.

**Happy coding! 🚀**

---

**Last Updated:** 2026-01-22  
**Version:** 1.0.0  
**Maintainer:** ComicWise Team

